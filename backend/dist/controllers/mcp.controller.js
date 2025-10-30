import logger from "../config/logger.js";
import { JSONRPC_INTERNAL_ERROR, JSONRPC_INVALID_REQUEST } from "../constants/jsonrpc.constants.js";
import { registerMCPTools, sessionCleaner } from "../services/mcp.service.js";
import { summaryTools } from "../tools/summary.tool.js";
import { userTools } from "../tools/user.tool.js";
import catchAsync from "../utils/catchAsync.js";
import { Server } from '@modelcontextprotocol/sdk/server';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuid } from 'uuid';
// Map to store transports by session ID
const transports = {};
export const mcpPostController = catchAsync(async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    let transport;
    try {
        if (sessionId && transports[sessionId]) {
            // Use existing session
            transport = transports[sessionId];
            logger.info(`Using existing MCP session: ${sessionId}`);
        }
        else if (!sessionId && isInitializeRequest(req.body)) {
            // Create new session for initialize request
            logger.info('Creating new MCP session for initialize request');
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => uuid(),
                onsessioninitialized: newSessionId => {
                    logger.info(`New MCP session initialized: ${newSessionId}`);
                    transports[newSessionId] = transport;
                }
            });
            transport.onclose = () => {
                if (transport.sessionId) {
                    logger.info(`MCP session closed: ${transport.sessionId}`);
                    sessionCleaner.cancelSessionCleanup(transport.sessionId);
                    delete transports[transport.sessionId];
                }
            };
            const server = new Server({
                name: 'app-builder-mcp-server',
                title: 'App Builder MCP Server',
                version: '1.0.0'
            }, {
                capabilities: {
                    logging: {},
                    tools: {}
                }
            });
            registerMCPTools({ server, tools: [...userTools, ...summaryTools] });
            await server.connect(transport);
        }
        else {
            logger.warn('Invalid MCP request: No valid session ID or initialize request');
            res.status(400).json({
                jsonrpc: '2.0',
                error: {
                    code: JSONRPC_INVALID_REQUEST,
                    message: 'Invalid session ID or malformed request'
                },
                id: req.body?.id || null
            });
            return;
        }
        await transport.handleRequest(req, res, req.body);
    }
    catch (error) {
        logger.error('Error in MCP POST handler:', error);
        res.status(500).json({
            jsonrpc: '2.0',
            error: {
                code: JSONRPC_INTERNAL_ERROR,
                message: 'Internal JSON-RPC error',
                data: { details: error.message }
            },
            id: req.body?.id || null
        });
    }
});
export const mcpGetController = catchAsync(async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
        logger.warn(`Invalid MCP GET request - session ID: ${sessionId || 'missing'}`);
        res.status(400).json({
            jsonrpc: '2.0',
            error: {
                code: JSONRPC_INVALID_REQUEST,
                message: 'Invalid or missing session ID'
            },
            id: null
        });
        return;
    }
    try {
        const transport = transports[sessionId];
        logger.info(`Handling MCP GET request for session: ${sessionId}`);
        await transport.handleRequest(req, res);
    }
    catch (error) {
        logger.error(`Error in MCP GET handler for session ${sessionId}:`, error);
        res.status(500).json({
            jsonrpc: '2.0',
            error: {
                code: JSONRPC_INTERNAL_ERROR,
                message: 'Internal JSON-RPC error',
                data: { details: error.message }
            },
            id: null
        });
    }
});
export const mcpDeleteController = catchAsync(async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
        logger.warn(`Invalid MCP DELETE request - session ID: ${sessionId || 'missing'}`);
        res.status(400).json({
            jsonrpc: '2.0',
            error: {
                code: JSONRPC_INVALID_REQUEST,
                message: 'Invalid or missing session ID'
            },
            id: null
        });
        return;
    }
    try {
        const transport = transports[sessionId];
        logger.info(`Handling MCP DELETE request for session: ${sessionId}`);
        // Handle the delete request through transport first
        await transport.handleRequest(req, res);
        // Clean up the session after successful deletion
        if (transport.sessionId) {
            logger.info(`Cleaning up MCP session: ${transport.sessionId}`);
            sessionCleaner.cancelSessionCleanup(transport.sessionId);
            delete transports[transport.sessionId];
        }
    }
    catch (error) {
        logger.error(`Error in MCP DELETE handler for session ${sessionId}:`, error);
        res.status(500).json({
            jsonrpc: '2.0',
            error: {
                code: JSONRPC_INTERNAL_ERROR,
                message: 'Internal JSON-RPC error',
                data: { details: error.message }
            },
            id: null
        });
    }
});

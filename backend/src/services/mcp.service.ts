import logger from '../config/logger.ts';
import { MCPTool } from '../types/mcp.ts';
import { Server } from '@modelcontextprotocol/sdk/server';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const registerMCPTools = (params: { server: Server; tools: MCPTool[] }) => {
    const { server, tools } = params;

    logger.info(`Registering ${tools.length} MCP tools`);

    // Register tools list handler
    server.setRequestHandler(ListToolsRequestSchema, () => {
        logger.debug('Handling list tools request');
        return {
            tools: tools.map(tool => ({
                name: tool.id,
                title: tool.name,
                description: tool.description,
                inputSchema: zodToJsonSchema(tool.inputSchema as any),
                outputSchema: tool.outputSchema ? zodToJsonSchema(tool.outputSchema as any) : undefined
            }))
        };
    });

    // Register tool execution handler with progress notification support
    server.setRequestHandler(CallToolRequestSchema, async request => {
        const { name, arguments: args } = request.params;
        logger.info(`Executing MCP tool: ${name}`);

        const tool = tools.find(t => t.id === name);
        if (!tool) {
            logger.error(`Tool not found: ${name}`);
            throw {
                code: -32601,
                message: `Method not found: ${name}`
            };
        }

        try {
            const result = await tool.fn(args as any);
            logger.info(`Tool ${name} executed successfully`);
            return {
                content: [{ type: 'text', text: JSON.stringify(result) }],
                structuredContent: result
            };
        } catch (error) {
            logger.error(`Error executing tool ${name}:`, error);
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ error: (error as any)?.message || 'Tool execution failed' })
                    }
                ]
            };
        }
    });
};

/**
 * Session management utilities for MCP
 */
export const createMCPSessionCleaner = () => {
    const activeSessionIntervals: { [sessionId: string]: NodeJS.Timeout } = {};

    const scheduleSessionCleanup = (sessionId: string, timeoutMs: number = 30 * 60 * 1000) => {
        // 30 minutes default
        if (activeSessionIntervals[sessionId]) {
            clearTimeout(activeSessionIntervals[sessionId]);
        }

        activeSessionIntervals[sessionId] = setTimeout(() => {
            logger.info(`Auto-cleaning up inactive MCP session: ${sessionId}`);
            delete activeSessionIntervals[sessionId];
            // Note: Actual session cleanup should be handled by the transport's onclose
        }, timeoutMs);
    };

    const cancelSessionCleanup = (sessionId: string) => {
        if (activeSessionIntervals[sessionId]) {
            clearTimeout(activeSessionIntervals[sessionId]);
            delete activeSessionIntervals[sessionId];
        }
    };

    const cleanupAllSessions = () => {
        Object.keys(activeSessionIntervals).forEach(sessionId => {
            clearTimeout(activeSessionIntervals[sessionId]);
        });
        logger.info('Cleared all MCP session cleanup timers');
    };

    return {
        scheduleSessionCleanup,
        cancelSessionCleanup,
        cleanupAllSessions
    };
};

// Global session cleaner instance
export const sessionCleaner = createMCPSessionCleaner();

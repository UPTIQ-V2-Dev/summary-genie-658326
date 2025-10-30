import { JSONRPC_INVALID_REQUEST } from "../constants/jsonrpc.constants.js";
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
export const mcpAuthMiddleware = (req, res, next) => {
    const sessionId = req.headers['mcp-session-id'];
    // Allow initialize requests without session ID
    if (req.method === 'POST' && isInitializeRequest(req.body)) {
        next();
        return;
    }
    // For all other requests, session ID is required
    if (!sessionId) {
        return res.status(400).json({
            jsonrpc: '2.0',
            error: {
                code: JSONRPC_INVALID_REQUEST,
                message: 'Invalid Request: Session ID required in mcp-session-id header'
            },
            id: req.body?.id || null
        });
    }
    // Validate session ID format (basic UUID validation)
    const sessionIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!sessionIdRegex.test(sessionId)) {
        return res.status(400).json({
            jsonrpc: '2.0',
            error: {
                code: JSONRPC_INVALID_REQUEST,
                message: 'Invalid Request: Invalid session ID format'
            },
            id: req.body?.id || null
        });
    }
    next();
};

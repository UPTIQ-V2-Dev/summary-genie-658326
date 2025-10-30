import { mcpDeleteController, mcpGetController, mcpPostController } from '../../controllers/mcp.controller.ts';
import { mcpAuthMiddleware } from '../../middlewares/mcp.ts';
import validate from '../../middlewares/validate.ts';
import { mcpValidation } from '../../validations/index.ts';
import express from 'express';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MCP
 *   description: Model Context Protocol endpoints for real-time communication
 */

/**
 * @swagger
 * /mcp:
 *   post:
 *     summary: Handle MCP JSON-RPC requests for real-time communication
 *     tags: [MCP]
 *     parameters:
 *       - in: header
 *         name: mcp-session-id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID for MCP communication (optional for initialize request)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jsonrpc
 *               - method
 *               - id
 *             properties:
 *               jsonrpc:
 *                 type: string
 *                 enum: ['2.0']
 *               method:
 *                 type: string
 *               params:
 *                 type: object
 *               id:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: 'null'
 *     responses:
 *       200:
 *         description: JSON-RPC response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jsonrpc:
 *                   type: string
 *                   enum: ['2.0']
 *                 result:
 *                   type: object
 *                 id:
 *                   oneOf:
 *                     - type: string
 *                     - type: number
 *                     - type: 'null'
 *       400:
 *         description: Invalid session ID or malformed request
 *       500:
 *         description: Internal JSON-RPC error
 */
router.post('/', validate(mcpValidation.mcpPost), mcpAuthMiddleware, mcpPostController);

/**
 * @swagger
 * /mcp:
 *   get:
 *     summary: Handle MCP streaming requests
 *     tags: [MCP]
 *     parameters:
 *       - in: header
 *         name: mcp-session-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID for MCP communication
 *     responses:
 *       200:
 *         description: JSON-RPC streaming response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jsonrpc:
 *                   type: string
 *                   enum: ['2.0']
 *                 result:
 *                   type: object
 *                 id:
 *                   type: 'null'
 *       400:
 *         description: Invalid or missing session ID
 *       500:
 *         description: Internal JSON-RPC error
 */
router.get('/', validate(mcpValidation.mcpGet), mcpAuthMiddleware, mcpGetController);

/**
 * @swagger
 * /mcp:
 *   delete:
 *     summary: Close MCP session and clean up resources
 *     tags: [MCP]
 *     parameters:
 *       - in: header
 *         name: mcp-session-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID for MCP communication
 *     responses:
 *       200:
 *         description: Session cleanup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jsonrpc:
 *                   type: string
 *                   enum: ['2.0']
 *                 result:
 *                   type: object
 *                 id:
 *                   type: 'null'
 *       400:
 *         description: Invalid or missing session ID
 *       500:
 *         description: Internal JSON-RPC error
 */
router.delete('/', validate(mcpValidation.mcpDelete), mcpAuthMiddleware, mcpDeleteController);

export default router;

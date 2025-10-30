# MCP API Implementation Test Guide

## Overview
This guide provides examples to test the MCP (Model Context Protocol) endpoints according to the API specification.

## Test Examples

### 1. POST /mcp - Initialize Request (No session ID required)
```bash
curl -X POST http://localhost:3000/v1/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {
        "roots": {
          "listChanged": true
        }
      }
    },
    "id": "1"
  }'
```

**Expected Response (200):**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "logging": {},
      "tools": {}
    }
  },
  "id": "1"
}
```

### 2. POST /mcp - Tool Request (Requires session ID)
```bash
curl -X POST http://localhost:3000/v1/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: <session-id-from-initialize>" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": "2"
  }'
```

### 3. GET /mcp - Streaming Request
```bash
curl -X GET http://localhost:3000/v1/mcp \
  -H "mcp-session-id: <session-id>"
```

**Expected Response (200):**
```json
{
  "jsonrpc": "2.0",
  "result": {},
  "id": null
}
```

### 4. DELETE /mcp - Close Session
```bash
curl -X DELETE http://localhost:3000/v1/mcp \
  -H "mcp-session-id: <session-id>"
```

**Expected Response (200):**
```json
{
  "jsonrpc": "2.0",
  "result": {},
  "id": null
}
```

## Error Test Cases

### 1. POST without session ID (non-initialize request)
```bash
curl -X POST http://localhost:3000/v1/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": "1"
  }'
```

**Expected Response (400):**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid session ID or malformed request"
  },
  "id": "1"
}
```

### 2. GET without session ID
```bash
curl -X GET http://localhost:3000/v1/mcp
```

**Expected Response (400):**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid or missing session ID"
  },
  "id": null
}
```

### 3. DELETE without session ID
```bash
curl -X DELETE http://localhost:3000/v1/mcp
```

**Expected Response (400):**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid or missing session ID"
  },
  "id": null
}
```

### 4. Invalid session ID format
```bash
curl -X GET http://localhost:3000/v1/mcp \
  -H "mcp-session-id: invalid-session-id"
```

**Expected Response (400):**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid Request: Invalid session ID format"
  },
  "id": null
}
```

## Available MCP Tools

The implementation includes the following tools:

### User Tools
- `user_create` - Create a new user
- `user_get_all` - Get all users with pagination
- `user_get_by_id` - Get user by ID
- `user_update` - Update user information
- `user_delete` - Delete a user

### Summary Tools
- `summary_generate` - Generate text summary
- `summary_get_history` - Get summary history
- `summary_get_by_id` - Get summary by ID
- `summary_delete` - Delete a summary

## Session Management

- Sessions are created automatically on initialize requests
- Sessions are managed in-memory with automatic cleanup
- Session IDs are UUIDs generated server-side
- Sessions can be explicitly closed using DELETE endpoint
- Inactive sessions are automatically cleaned up after 30 minutes

## JSON-RPC 2.0 Compliance

All responses follow JSON-RPC 2.0 specification:
- `jsonrpc: "2.0"` field present
- Proper error codes (-32600, -32603)
- Structured error messages
- Request ID preservation in responses
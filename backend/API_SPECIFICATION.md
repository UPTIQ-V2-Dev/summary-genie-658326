# API SPECIFICATION

## Database Models

```prisma
model User {
  id              Int      @id @default(autoincrement())
  email           String   @unique
  name            String?
  password        String
  role            String   @default("USER")
  isEmailVerified Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  Token           Token[]
  Summary         Summary[]
}

model Token {
  id          Int       @id @default(autoincrement())
  token       String
  type        String
  expires     DateTime
  blacklisted Boolean
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id])
  userId      Int
}

model Summary {
  id              Int      @id @default(autoincrement())
  originalText    String
  summary         String
  length          String
  style           String
  wordCount       Int
  characterCount  Int
  title           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id])
  userId          Int
}
```

## Authentication APIs

EP: POST /auth/register
DESC: Register a new user account.
IN: body:{name:str!, email:str!, password:str!}
OUT: 201:{user:obj{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}, tokens:obj{access:obj{token:str, expires:str}, refresh:obj{token:str, expires:str}}}
ERR: {"400":"Email already taken", "422":"Validation error", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/register -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
EX_RES_201: {"user":{"id":1,"email":"john@example.com","name":"John Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-10-27T10:30:00Z","updatedAt":"2025-10-27T10:30:00Z"},"tokens":{"access":{"token":"eyJhbGc...","expires":"2025-10-27T11:30:00Z"},"refresh":{"token":"eyJhbGc...","expires":"2025-11-03T10:30:00Z"}}}

---

EP: POST /auth/login
DESC: Authenticate user with email and password.
IN: body:{email:str!, password:str!}
OUT: 200:{user:obj{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}, tokens:obj{access:obj{token:str, expires:str}, refresh:obj{token:str, expires:str}}}
ERR: {"401":"Invalid email or password", "422":"Validation error", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/login -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"password123"}'
EX_RES_200: {"user":{"id":1,"email":"john@example.com","name":"John Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-10-27T10:30:00Z","updatedAt":"2025-10-27T10:30:00Z"},"tokens":{"access":{"token":"eyJhbGc...","expires":"2025-10-27T11:30:00Z"},"refresh":{"token":"eyJhbGc...","expires":"2025-11-03T10:30:00Z"}}}

---

EP: POST /auth/logout
DESC: Logout user by invalidating refresh token.
IN: body:{refreshToken:str!}
OUT: 204:{}
ERR: {"404":"Refresh token not found", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/logout -H "Content-Type: application/json" -d '{"refreshToken":"eyJhbGc..."}'
EX_RES_204: {}

---

EP: POST /auth/refresh-tokens
DESC: Generate new access and refresh tokens using refresh token.
IN: body:{refreshToken:str!}
OUT: 200:{access:obj{token:str, expires:str}, refresh:obj{token:str, expires:str}}
ERR: {"401":"Invalid refresh token", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/refresh-tokens -H "Content-Type: application/json" -d '{"refreshToken":"eyJhbGc..."}'
EX_RES_200: {"access":{"token":"eyJhbGc...","expires":"2025-10-27T11:30:00Z"},"refresh":{"token":"eyJhbGc...","expires":"2025-11-03T10:30:00Z"}}

---

EP: POST /auth/forgot-password
DESC: Send password reset email to user.
IN: body:{email:str!}
OUT: 204:{}
ERR: {"404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/forgot-password -H "Content-Type: application/json" -d '{"email":"john@example.com"}'
EX_RES_204: {}

---

EP: POST /auth/reset-password
DESC: Reset user password using reset token.
IN: query:{token:str!}, body:{password:str!}
OUT: 204:{}
ERR: {"401":"Invalid or expired reset token", "422":"Validation error", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/reset-password?token=resetToken123 -H "Content-Type: application/json" -d '{"password":"newpassword123"}'
EX_RES_204: {}

---

EP: POST /auth/verify-email
DESC: Verify user email using verification token.
IN: query:{token:str!}
OUT: 204:{}
ERR: {"401":"Invalid or expired verification token", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/verify-email?token=verifyToken123
EX_RES_204: {}

---

EP: POST /auth/send-verification-email
DESC: Send email verification link to authenticated user.
IN: headers:{Authorization:str!}
OUT: 204:{}
ERR: {"401":"Unauthorized", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/send-verification-email -H "Authorization: Bearer eyJhbGc..."
EX_RES_204: {}

## User Management APIs

EP: POST /users
DESC: Create a new user (admin only).
IN: headers:{Authorization:str!}, body:{name:str!, email:str!, password:str!, role:str!}
OUT: 201:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}
ERR: {"400":"Email already taken", "401":"Unauthorized", "403":"Forbidden", "422":"Validation error", "500":"Internal server error"}
EX_REQ: curl -X POST /users -H "Authorization: Bearer eyJhbGc..." -H "Content-Type: application/json" -d '{"name":"Jane Doe","email":"jane@example.com","password":"password123","role":"USER"}'
EX_RES_201: {"id":2,"email":"jane@example.com","name":"Jane Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-10-27T10:35:00Z","updatedAt":"2025-10-27T10:35:00Z"}

---

EP: GET /users
DESC: Get all users with optional filtering and pagination (admin only).
IN: headers:{Authorization:str!}, query:{name:str, role:str, sortBy:str, limit:int, page:int}
OUT: 200:{results:arr[obj{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}], page:int, limit:int, totalPages:int, totalResults:int}
ERR: {"401":"Unauthorized", "403":"Forbidden", "500":"Internal server error"}
EX_REQ: curl -X GET /users?limit=10&page=1 -H "Authorization: Bearer eyJhbGc..."
EX_RES_200: {"results":[{"id":1,"email":"john@example.com","name":"John Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-10-27T10:30:00Z","updatedAt":"2025-10-27T10:30:00Z"}],"page":1,"limit":10,"totalPages":1,"totalResults":1}

---

EP: GET /users/:userId
DESC: Get user by ID (users can get their own info, admins can get any user).
IN: headers:{Authorization:str!}, params:{userId:str!}
OUT: 200:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}
ERR: {"401":"Unauthorized", "403":"Forbidden", "404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X GET /users/1 -H "Authorization: Bearer eyJhbGc..."
EX_RES_200: {"id":1,"email":"john@example.com","name":"John Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-10-27T10:30:00Z","updatedAt":"2025-10-27T10:30:00Z"}

---

EP: PATCH /users/:userId
DESC: Update user information (users can update themselves, admins can update any user).
IN: headers:{Authorization:str!}, params:{userId:str!}, body:{name:str, email:str, password:str}
OUT: 200:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}
ERR: {"400":"Email already taken", "401":"Unauthorized", "403":"Forbidden", "404":"User not found", "422":"Validation error", "500":"Internal server error"}
EX_REQ: curl -X PATCH /users/1 -H "Authorization: Bearer eyJhbGc..." -H "Content-Type: application/json" -d '{"name":"John Smith"}'
EX_RES_200: {"id":1,"email":"john@example.com","name":"John Smith","role":"USER","isEmailVerified":false,"createdAt":"2025-10-27T10:30:00Z","updatedAt":"2025-10-27T10:40:00Z"}

---

EP: DELETE /users/:userId
DESC: Delete user (users can delete themselves, admins can delete any user).
IN: headers:{Authorization:str!}, params:{userId:str!}
OUT: 200:{}
ERR: {"401":"Unauthorized", "403":"Forbidden", "404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X DELETE /users/1 -H "Authorization: Bearer eyJhbGc..."
EX_RES_200: {}

## Summary APIs

EP: POST /api/summary/generate
DESC: Generate a text summary with specified parameters.
IN: headers:{Authorization:str!}, body:{text:str!, length:str, style:str}
OUT: 201:{id:str, originalText:str, summary:str, length:str, style:str, wordCount:int, characterCount:int, createdAt:str}
ERR: {"400":"Invalid input", "401":"Unauthorized", "422":"Text too long or invalid parameters", "500":"Internal server error"}
EX_REQ: curl -X POST /api/summary/generate -H "Authorization: Bearer eyJhbGc..." -H "Content-Type: application/json" -d '{"text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit...","length":"medium","style":"paragraph"}'
EX_RES_201: {"id":"1","originalText":"Lorem ipsum dolor sit amet...","summary":"Lorem ipsum is a placeholder text commonly used...","length":"medium","style":"paragraph","wordCount":69,"characterCount":445,"createdAt":"2025-10-27T10:45:00Z"}

---

EP: GET /api/summary/history
DESC: Get user's summary history with filtering and pagination.
IN: headers:{Authorization:str!}, query:{page:int, limit:int, search:str, dateFrom:str, dateTo:str, sortBy:str}
OUT: 200:{results:arr[obj{id:str, originalText:str, summary:str, title:str, wordCount:int, characterCount:int, createdAt:str}], page:int, limit:int, totalPages:int, totalResults:int}
ERR: {"401":"Unauthorized", "422":"Invalid query parameters", "500":"Internal server error"}
EX_REQ: curl -X GET /api/summary/history?page=1&limit=10&sortBy=newest -H "Authorization: Bearer eyJhbGc..."
EX_RES_200: {"results":[{"id":"1","originalText":"Lorem ipsum dolor sit amet...","summary":"Lorem ipsum is a placeholder text...","title":"Lorem Ipsum Summary","wordCount":69,"characterCount":445,"createdAt":"2025-10-27T10:45:00Z"}],"page":1,"limit":10,"totalPages":1,"totalResults":1}

---

EP: GET /api/summary/:id
DESC: Get specific summary by ID.
IN: headers:{Authorization:str!}, params:{id:str!}
OUT: 200:{id:str, originalText:str, summary:str, title:str, wordCount:int, characterCount:int, createdAt:str}
ERR: {"401":"Unauthorized", "403":"Forbidden", "404":"Summary not found", "500":"Internal server error"}
EX_REQ: curl -X GET /api/summary/1 -H "Authorization: Bearer eyJhbGc..."
EX_RES_200: {"id":"1","originalText":"Lorem ipsum dolor sit amet...","summary":"Lorem ipsum is a placeholder text...","title":"Lorem Ipsum Summary","wordCount":69,"characterCount":445,"createdAt":"2025-10-27T10:45:00Z"}

---

EP: DELETE /api/summary/:id
DESC: Delete a specific summary.
IN: headers:{Authorization:str!}, params:{id:str!}
OUT: 204:{}
ERR: {"401":"Unauthorized", "403":"Forbidden", "404":"Summary not found", "500":"Internal server error"}
EX_REQ: curl -X DELETE /api/summary/1 -H "Authorization: Bearer eyJhbGc..."
EX_RES_204: {}

## MCP (Model Context Protocol) APIs

EP: POST /mcp
DESC: Handle MCP JSON-RPC requests for real-time communication.
IN: headers:{"mcp-session-id":str}, body:{jsonrpc:str!, method:str!, params:obj, id:str}
OUT: 200:{jsonrpc:str, result:obj, id:str}
ERR: {"400":"Invalid session ID or malformed request", "500":"Internal JSON-RPC error"}
EX_REQ: curl -X POST /mcp -H "mcp-session-id: session123" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"roots":{"listChanged":true}}},"id":"1"}'
EX_RES_200: {"jsonrpc":"2.0","result":{"protocolVersion":"2024-11-05","capabilities":{"logging":{},"tools":{}}},"id":"1"}

---

EP: GET /mcp
DESC: Handle MCP streaming requests.
IN: headers:{"mcp-session-id":str!}
OUT: 200:{jsonrpc:str, result:obj, id:str}
ERR: {"400":"Invalid or missing session ID", "500":"Internal JSON-RPC error"}
EX_REQ: curl -X GET /mcp -H "mcp-session-id: session123"
EX_RES_200: {"jsonrpc":"2.0","result":{},"id":null}

---

EP: DELETE /mcp
DESC: Close MCP session and clean up resources.
IN: headers:{"mcp-session-id":str!}
OUT: 200:{jsonrpc:str, result:obj, id:str}
ERR: {"400":"Invalid or missing session ID", "500":"Internal JSON-RPC error"}
EX_REQ: curl -X DELETE /mcp -H "mcp-session-id: session123"
EX_RES_200: {"jsonrpc":"2.0","result":{},"id":null}
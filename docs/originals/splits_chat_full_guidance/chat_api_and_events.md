# Splits Network Chat — Full API + WebSocket Event Contracts

This doc provides implementable REST and WS contracts.

---

## 1) REST API (Chat API)

### 1.1 Create or find conversation
`POST /chat/conversations`
```json
{
  "participantUserId": "uuid",
  "context": {
    "applicationId": "uuid|null",
    "jobId": "uuid|null",
    "companyId": "uuid|null"
  }
}
```

### 1.2 List conversations
`GET /chat/conversations?filter=inbox|requests|archived&cursor=...`

### 1.3 Get messages
`GET /chat/conversations/:id/messages?after=messageId&limit=50`

### 1.4 Send message (idempotent)
`POST /chat/conversations/:id/messages`
```json
{
  "clientMessageId": "uuid",
  "body": "text",
  "attachments": ["attachmentId"]
}
```

### 1.5 Requests
- Accept: `POST /chat/conversations/:id/accept`
- Decline: `POST /chat/conversations/:id/decline`

### 1.6 Per-user state
- Mute: `POST /chat/conversations/:id/mute` / `DELETE /chat/conversations/:id/mute`
- Archive: `POST /chat/conversations/:id/archive` / `DELETE /chat/conversations/:id/archive`

### 1.7 Blocks
- Block: `POST /chat/blocks`
- Unblock: `DELETE /chat/blocks/:blockedUserId`

### 1.8 Reports
`POST /chat/reports`

### 1.9 Attachments
- Init upload: `POST /chat/attachments/init`
- Complete upload: `POST /chat/attachments/:id/complete`
- Download URL: `GET /chat/attachments/:id/download-url`

---

## 2) WebSocket Gateway

### Connect
`wss://<host>/ws/chat?token=<jwt>`

### Server hello
```json
{ "type":"hello", "eventVersion":1, "serverTime":"iso" }
```

### Subscribe
```json
{ "type":"subscribe", "channels":["user:uuid","conv:uuid"] }
```

### Server events
- `message.created`
- `conversation.updated`
- `typing.started` / `typing.stopped`
- `presence.updated`
- `read.receipt`
- `conversation.requested` / `accepted` / `declined`

### Client events
- `typing.started/stopped`
- `presence.ping`
- `read.receipt`

---

## 3) Redis Channels
- `user:{userId}`
- `conv:{conversationId}`
Presence key:
- `presence:user:{userId}` (TTL)

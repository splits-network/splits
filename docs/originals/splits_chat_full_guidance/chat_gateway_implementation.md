# Splits Network Chat — WebSocket Gateway (Production Implementation Notes)

---

## 1) Core loops

### 1.1 On connect
- Validate token
- Register socket
- Set presence in Redis with TTL
- Subscribe to `user:{userId}`

### 1.2 On subscribe request
- Validate channel name format
- Authorize conversation channel:
  - call Chat API or cache membership list
- Update refcounts and Redis subscriptions

### 1.3 On Redis event
- Parse JSON
- Fan out to sockets subscribed to that channel
- Track send failures

### 1.4 On disconnect
- Cleanup maps
- If user has no sockets: publish presence update (optional) or let TTL expire

---

## 2) Rate limits
- typing: <= 1 / 2s / conv / user
- read receipts: <= 1 / 1s / conv / user
- subscribe: max channels/socket (e.g., 200)
- sockets/user: max 8

---

## 3) Resync contract (must exist)
Clients must call REST on:
- reconnect
- tab becomes visible after being hidden
- gateway sends `system.notice` indicating possible missed events

---

## 4) Observability
Metrics:
- active connections
- events out/sec
- redis subs count
- auth failures
- rate limit triggers

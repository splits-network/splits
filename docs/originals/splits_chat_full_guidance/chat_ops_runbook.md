# Splits Network Chat — Operations Runbook

---

## 1) Golden signals
- Chat API p95 latency (send + list)
- WS active connections
- Redis latency + pubsub throughput
- Rabbit queue depth + consumer lag
- Postgres slow queries (messages listing, conversation list)

---

## 2) Alerts
- WS disconnect rate spike
- Redis down/high latency
- Chat API 5xx > threshold
- Queue depth increasing without draining
- Attachment scan backlog

---

## 3) Common incidents
### Messages not arriving realtime
- Verify DB insert
- Verify Redis publish
- Verify gateway Redis subscription
- Verify ingress WS upgrade/timeouts

### Unread counts wrong
- Verify participant state updates are in same transaction as message insert
- Recompute unread for the conversation as a repair action

---

## 4) Scaling
- Gateway HPA by connections/pod + CPU
- Workers HPA by queue depth

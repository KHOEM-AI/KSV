# Audit, Monitoring & Incident Response

**Domain:** `AUDIT/` · **API domain:** Audit API

## Purpose
Every important action in KSV should be traceable after the fact — who did what, to which device, when, and whether it was authorized.

## What Gets Logged
- User identity
- Device identity
- Action performed
- Authorization result
- Time
- Session information
- Security events
- Command result
- Permission changes
- Device pairing events
- Account recovery events
- Administrative actions

> **Passwords and other secrets are never written to audit logs**, under any circumstances.

## Security Monitoring
KSV should continuously watch for:
- Suspicious login attempts
- Repeated failed authentication
- Abnormal device commands
- Permission abuse
- Unusual locations or times
- Account-takeover indicators
- Device-compromise indicators
- Suspicious API activity

## Response Flow
```
Detect → Alert → Block → Investigate → Recover
```

## Incident Response Capabilities
When a serious security event occurs, KSV should be able to:
- Revoke sessions
- Revoke device access
- Suspend accounts
- Revoke permissions
- Block suspicious commands
- Rotate credentials or keys
- Isolate affected devices/gateways
- Require re-authentication
- Trigger security alerts
- Preserve relevant evidence
- Restore trusted configuration

Emergency controls should not depend solely on the same mechanism that may already be compromised (e.g. if an admin account is compromised, there must be a way to respond that doesn't rely on that same account).

## Related
- `security.md` — the layers being monitored
- `notification.md` — how alerts actually reach a human


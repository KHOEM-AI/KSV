# Administration

**Domain:** platform-wide · **API domain:** Administration API

## Purpose
Gives platform and organization administrators the tools to operate KSV — without ever giving them access to what belongs to the user alone.

## Core Boundary
> Admin ≠ access to user passwords or secrets.

Administrators can manage **account state** (suspend, restore, review activity) and **security operations** (revoke sessions, rotate compromised keys) — but never see a user's original password, private keys, or other user-controlled secrets.

## Responsibility Split
| Role | Controls |
|---|---|
| Platform Owner | Overall product direction |
| System Administrator | Platform operations, account state, security operations |
| User | Their own account, password, personal devices |

- User password → user-controlled secret
- Platform secrets → KSV-controlled secrets
- Device credentials → device/owner-controlled credentials

## Admin Console Responsibilities
- User management (account state, not credentials)
- Organization management
- Device management
- Permission management
- Security monitoring (see `audit.md`)
- Audit review
- System health monitoring
- Incident management (see `audit.md`)
- Platform configuration

## Least Privilege
Admin access itself should be scoped — a Support Admin does not need the same access as a Security Admin or a Platform Owner. Admin actions are themselves subject to authorization checks and are logged in the audit trail like any other action.

## Related
- `security.md` — the "most important security rule" this domain must respect (no single admin credential controls everything)
- `audit.md` — every administrative action is logged
- `organization.md` — organization-level admin roles vs. platform-level admin roles
- 

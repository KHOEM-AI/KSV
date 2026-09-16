# Authorization

**Domain:** `AUTH/` · **API domain:** Authorization API

## Purpose
Answers: *"Now that we know who you are, what are you actually allowed to do?"*

This is treated as the most important domain after Identity, because it is what stands between "logged in" and "can control a real device."

## Core Principle
> Being logged into KSV does not automatically provide permission to control every device.
> Discovering a device does not automatically provide permission.
> Being physically near a device does not automatically provide permission.
> Knowing a device name does not automatically provide permission.

## Permission Levels
Owner → Super Administrator → Organization Administrator → Manager → Operator → Controller → Viewer → Guest → Temporary Permission.

Each level can be scoped narrowly — e.g. Viewer on one device, Controller on another, even within the same account.

## Full Authorization Question
A real authorization decision is never just "is this user an Admin?" It should resolve:

**Who + What + Which device + Where + When + Under what conditions**

Example: *"Operator may power on Machine A, but only between 8AM–5PM, and only while physically at Factory A."*
This is **Policy-Based Access Control**, not simple role checks.

## Command Authorization Chain
```
User Identity
   ↓
Account Status
   ↓
Device Identity
   ↓
Ownership or Delegated Permission
   ↓
Command Permission
   ↓
Safety Rules  (see safety.md)
   ↓
Command Execution
```
A command that fails **any** step in this chain must be rejected — not partially executed.

## Permission Management
- Permission expiration (temporary grants that self-revoke)
- Permission revocation (immediate, at any time, by the owner/admin)
- Approval workflows for sensitive permission grants

## Related
- `organization.md` — how permissions map onto company/site/building hierarchies
- `device.md` — device ownership model
- `safety.md` — the additional check that can still block an authorized action

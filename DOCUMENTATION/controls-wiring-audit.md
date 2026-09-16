# KSV — Controls View: Wiring Audit & Vehicle Control Gap

**Location this doc should live in:** `khoem-now/DOCUMENTATION/controls-wiring-audit.md`
**Date:** 29 August 2026
**Scope:** `src/views/ControlsView.tsx` — what's real, what's missing, what to build next.

---

## 1. Current State: Everything Is a UI Mockup

The Controls page currently renders **6 static control cards**, all using hardcoded
mock data with no real backend connection:

| Card | Device | Category | Wired to backend? |
|---|---|---|---|
| North Vault Door | DEV-04821 | Access (door) | ❌ No |
| Cleanroom HVAC | DEV-04822 | Climate | ❌ No |
| Press Line 7 E-Stop | DEV-04823 | Industrial | ❌ No |
| Robot Arm RA-04 | DEV-04828 | Industrial | ❌ No |
| East Gate Barrier | DEV-04826 | Access | ❌ No |
| Cold Storage Monitor | DEV-04830 | Climate | ❌ No |

Every button (`Lock`, `Open`, `Reset`), toggle switch, and slider on this page is
currently **decorative** — clicking them does not call an API, does not create a
`Command` document, and does not appear in `AuditLog`.

---

## 2. Gap Found: No Vehicle Control Card

The **Device Registry** (Devices page) lists a 7th device that has **no
corresponding card here**:

```
Fleet Van KR-2291
DEV-04824 · Vehicle · Bluetooth · Seoul Depot
Status: offline
```

This is a real gap, not a mock-data omission — the KSV design spec (Device
Categories, section 28) explicitly includes **Vehicle: Car, EV, Fleet, Authorized
vehicle systems** as a first-class category, same tier as Access/Climate/Industrial.
Right now the Controls page has zero UI for it.

**What a Vehicle control card needs, per the KSV command flow** (`User Command →
Authentication → Authorization → Device Capability → Safety Policy → Execute →
Result → Audit`):

- **Immobilize / Release** toggle (maps to `SafetyRule`: "Vehicle Immobilize Outside
  Geo-Fence" — already defined in the Safety Rules list seen on the Dashboard)
- **Geo-fence status** indicator (inside/outside authorized zone)
- **Lock/Unlock doors** control
- **Connection status** — this device is currently `offline`/Bluetooth, so the card
  should show a clear offline state rather than enabled controls that would fail

---

## 3. What "Real Wiring" Requires

To make any control card (vehicle or otherwise) actually functional, each button
needs to call through the security stack already built in `src/core/`:

```
Button onClick
  → POST /api/v1/commands  { deviceId, type, payload }
  → authenticate            (src/core/auth/auth.middleware.ts)
  → requirePermission       (src/core/auth/rbac.policy.ts)     e.g. "device:command"
  → deviceCommandRateLimiter (src/core/security/rate-limiter.ts)
  → [Safety check — not yet built, see section 4]
  → Command.create()        (src/infrastructure/database/models.ts)
  → auditDeviceCommand()    (src/core/security/audit.log.ts)
  → response back to UI (success/failed/blocked)
```

None of this wiring exists yet on the frontend side — `ControlsView.tsx` has no
`fetch`/`axios` calls, and there is no `commands` API route file in the backend
(`API/command.ts` exists as a **spec/type file** per the blueprint, but no Express
route currently calls it from this UI).

---

## 4. Missing Piece: Safety Engine

The KSV design (section 19, "Safety Engine") requires a safety check **separate
from and after** the authorization check:

```
User Authorized ✓ → Security Check ✓ → Safety Check ✗ → COMMAND BLOCKED
```

This is especially relevant for the Vehicle card — "Vehicle Immobilize Outside
Geo-Fence" is a safety rule, not just a permission check. **No safety-engine file
exists yet in `src/core/`** (only auth, rbac, encryption, audit, rate-limiter).
This should be built before wiring the Vehicle card's Immobilize control for real,
otherwise a command could physically stop a vehicle without the geo-fence check
that's supposed to gate it.

---

## 5. Recommended Build Order

1. **`src/core/safety/safety.engine.ts`** — evaluates `SafetyRule` records against
   a command before execution; returns `ALLOWED` or `BLOCKED` + reason
2. **Backend command route** — `POST /api/v1/devices/:id/commands` wired through
   `authenticate` → `requirePermission("device:command")` → safety engine →
   `Command.create()` → `auditDeviceCommand()`
3. **Frontend API client** — a small `src/lib/api.ts` wrapper so `ControlsView.tsx`
   can call the real endpoint instead of local state
4. **Vehicle control card** — new component in `ControlsView.tsx` for
   `Fleet Van KR-2291`, including the offline-state handling described in section 2
5. **Wire the existing 6 cards** to the same real endpoint, replacing their local
   `useState` toggles with actual command dispatch + response handling

---

## 6. Summary

- All 6 existing control cards: **UI only, not connected**
- Vehicle/Fleet category: **entire card missing**, not just unwired
- Root blocker: **no Safety Engine file yet** — build this before wiring anything
  that can physically move/stop equipment (vehicles, robot arms, doors)
- Everything downstream (auth, RBAC, encryption, audit, rate-limiting) is already
  built and ready to receive real command calls once the above pieces exist

# Notification

**Domain:** `NOTIFICATION/` · **API domain:** Notification API

## Purpose
Delivers timely alerts to users and administrators about things that matter — especially security-relevant events.

## Notification Types
- Security alerts
- Login alerts (new device/location)
- Device alerts (online/offline/malfunction)
- Permission changes
- Device offline
- Device online
- Command failures
- Emergency alerts
- Account recovery notifications

## Delivery Channels
- In-app
- Email
- SMS
- Push notification

## Design Notes
- Users should be able to control which channels they receive which notification types on (within limits — security-critical alerts like "new device login" should not be fully disable-able).
- Emergency/incident-response notifications (see `audit.md`) should use the most reliable available channel, not just the user's preferred one.

## Related
- `audit.md` — the source of most security-related notifications
- `international.md` — notifications must respect the user's language and time zone
- 

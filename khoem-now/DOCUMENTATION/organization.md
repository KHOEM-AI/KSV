# Organization

**Domain:** `ORGANIZATION/` · **API domain:** Organization API

## Purpose
Lets KSV work for a single person and for a full enterprise using the same underlying model.

## Hierarchy
```
Organization
 ├── Users
 ├── Roles
 ├── Sites
 │    ├── Buildings
 │    ├── Rooms / Zones
 │    └── Devices
 ├── Policies
 └── Audit
```

## Two Usage Patterns

**Personal:**
```
User → Home → Devices
```

**Enterprise:**
```
Company → Sites → Buildings → Rooms → Devices → Users → Roles
```

## Entities
- Organization / Company
- Department
- Site
- Building
- Room / Zone
- Team
- Employee (organization member)
- Organization-level roles
- Organization-level policies

## Responsibilities
- Create, rename, and dissolve organizations
- Add/remove members and assign organization roles
- Define sites, buildings, and rooms as containers for devices
- Attach devices to a specific place in the hierarchy
- Define organization-wide policies that apply beneath them (e.g. "no device commands outside business hours" at the Site level)

## Related
- `authorization.md` — how roles at this level translate into device permissions
- `device.md` — devices are always owned by either an individual or an organization node

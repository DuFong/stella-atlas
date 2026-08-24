# Changelog

## Unreleased

### Added

- Foundation validation workflow.
- Required vision, roadmap, coding standard, and observation score documents.
- PostgreSQL 17 local development foundation.
- Java 21 and Spring Boot 3.5 backend foundation.
- PostgreSQL, Flyway, Actuator, validation error handling, and backend CI.
- Node.js 22 and Next.js 16 frontend foundation.
- Mobile-first base UI, route states, frontend tests, and frontend CI.
- Provider-independent weather domain contracts and hourly forecast models.
- Open-Meteo weather adapter with configurable timeouts and error translation.
- Bounded Caffeine caching for weather forecasts.
- Provider-independent astronomy domain contracts and application orchestration.
- Offline sunset, twilight, moonrise, moonset, phase, and illumination calculation.
- Coordinate-based IANA timezone resolution with explicit polar and missing-event states.
- Explainable hourly observation scoring rules and grade boundaries.
- Cross-midnight best observation window selection.
- Public observation forecast API combining weather, astronomy, and scores.
- Server-rendered observation search and result UI connected to the backend API.
- Google OIDC login and Spring Security session foundation.
- Authenticated current-user API with JSON authentication errors and CSRF protection.
- Responsive Google login, current-user, and session logout frontend UI.
- Verified the local Google OAuth callback with environment-injected credentials.
- Persisted Google identities against stable internal user UUIDs.
- Added authenticated favorite-location create, read, and delete APIs with owner-scoped persistence.
- Connected the sky simulator to authenticated favorite-location save, select, and delete flows.
- MIT-licensed Astronomy Engine integration behind a planetarium domain port.
- Client-side Canvas sky simulation with time, direction, zoom, and location controls.
- Curated bright-star and representative-constellation data with deterministic scene tests.
- Local observation journal with image upload, camera capture, EXIF-assisted fields, comments, and hashtags.
- Atomic IndexedDB post and image persistence with local list, edit, and delete flows.
- Explicit camera permission, missing metadata, unsupported Canvas, and storage failure states.

### Changed

- Aligned repository guidance and local setup with `AGENTS.md`.
- Unified the planned public API inventory and error response contract.
- Closed Milestone 2 and activated Milestone 3 weather integration.
- Added milestone identifiers to branch, commit, and pull request conventions.
- Closed Milestone 3 and activated Milestone 4 astronomy engine work.
- Closed Milestone 4 and activated Milestone 5 observation score work.
- Closed Milestone 5 and activated Milestone 6 user feature work.
- Completed Milestone 6 authentication foundation.
- Redefined Milestone 7 as local observation journaling and interactive sky simulation, and shifted OAuth/location work and deployment to Milestones 8 and 9.
- Started Milestone 7 and selected a bounded project-owned Canvas renderer after rejecting D3-Celestial and Stellarium Web Engine integration risks.

## v0.1.0

- Initial repository.

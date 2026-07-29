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

### Changed

- Aligned repository guidance and local setup with `AGENTS.md`.
- Unified the planned public API inventory and error response contract.
- Closed Milestone 2 and activated Milestone 3 weather integration.
- Added milestone identifiers to branch, commit, and pull request conventions.
- Closed Milestone 3 and activated Milestone 4 astronomy engine work.
- Closed Milestone 4 and activated Milestone 5 observation score work.

## v0.1.0

- Initial repository.

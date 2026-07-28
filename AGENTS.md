# AGENTS.md

## 1. Purpose

This file defines the development rules, repository conventions, architecture principles, and workflow that all AI coding agents must follow when working on StellaAtlas.

Codex and other automated coding agents must read this document before modifying any source code or project configuration.

The goal is to ensure that all generated code remains consistent with the project's architecture, coding standards, and long-term direction.

---

# 2. Project Overview

## Project Name

StellaAtlas

## Tagline

Your Personal Atlas of the Night Sky

## Mission

Transform complex weather and astronomical data into simple insights that help everyone enjoy the night sky.

## Core Product Question

StellaAtlas answers the following question:

> Is tonight a good night to observe the stars?

The service combines weather and astronomical conditions to calculate an observation score and provide clear recommendations.

---

# 3. Technology Stack

## Backend

- Java 21
- Spring Boot 3.5.x
- Gradle
- PostgreSQL 17
- Spring Data JPA
- Flyway
- JUnit 5
- Testcontainers

## Frontend

- Node.js 22 LTS
- Next.js
- TypeScript
- Tailwind CSS

## Infrastructure

- Docker
- Docker Compose
- GitHub Actions
- GitHub Projects

Do not change major technology choices without documenting the reason in `docs/DECISIONS.md`.

---

# 4. Repository Structure

```text
stella-atlas/
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/
├── frontend/
├── docker/
├── docs/
├── AGENTS.md
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── docker-compose.yml
└── .gitignore
```

## Directory Responsibilities

### `backend/`

Spring Boot backend application.

### `frontend/`

Next.js frontend application.

### `docker/`

Dockerfiles and infrastructure-related configuration.

### `docs/`

Product, architecture, API, decision, and development documentation.

### `.github/`

GitHub Actions, issue templates, and pull request templates.

Do not place application code in the repository root.

---

# 5. Required Reading Order

Before implementing a feature, read the relevant documents in the following order:

1. `AGENTS.md`
2. `README.md`
3. `docs/VISION.md`
4. `docs/PRODUCT.md`
5. `docs/ROADMAP.md`
6. `docs/ARCHITECTURE.md`
7. `docs/CODING_STANDARDS.md`
8. `docs/API.md`
9. `docs/OBSERVATION_SCORE.md`
10. `docs/DECISIONS.md`

When documentation conflicts with implementation, do not silently choose one.

Instead:

1. identify the conflict;
2. determine whether the code or documentation is outdated;
3. update both when appropriate;
4. explain the decision in the commit or pull request.

---

# 6. Milestone Policy

Development is milestone-driven.

Current milestones:

```text
Milestone 0 — Foundation
Milestone 1 — Backend Foundation
Milestone 2 — Frontend Foundation
Milestone 3 — Weather Integration
Milestone 4 — Astronomy Engine
Milestone 5 — Observation Score
Milestone 6 — User Features
Milestone 7 — Deployment
```

Codex must not implement future milestone features unless explicitly requested.

For example, while Milestone 0 is active:

- repository configuration is allowed;
- documentation updates are allowed;
- GitHub templates are allowed;
- CI foundation is allowed;
- backend business features are not allowed;
- frontend product features are not allowed;
- weather integrations are not allowed.

Always prefer the smallest change required for the current task.

---

# 7. Git Workflow

StellaAtlas uses GitHub Flow.

## Main Branch

The primary branch is:

```text
main
```

The `main` branch must always remain buildable and deployable.

Do not commit directly to `main` unless explicitly instructed.

## Branch Naming

Use one of the following prefixes:

```text
feature/
fix/
docs/
refactor/
test/
build/
ci/
chore/
```

Examples:

```text
feature/backend-initialization
feature/weather-provider
fix/observation-score-rounding
docs/update-architecture
refactor/weather-domain
test/add-score-calculator-tests
build/configure-gradle
ci/add-backend-checks
chore/update-gitignore
```

Branch names must:

- use lowercase letters;
- use hyphens between words;
- describe one clear task;
- avoid vague names such as `update`, `work`, or `changes`.

---

# 8. Commit Convention

Use Conventional Commits.

## Allowed Types

```text
feat
fix
docs
style
refactor
test
build
ci
perf
chore
```

## Format

```text
<type>: <description>
```

Optional scope:

```text
<type>(<scope>): <description>
```

Examples:

```text
feat(weather): add weather forecast provider interface
fix(score): correct cloud coverage weighting
docs: add repository contribution guide
refactor(observation): extract score calculation policy
test(weather): add provider integration tests
build(backend): configure Java 21 toolchain
ci: add backend verification workflow
chore: update gitignore
```

## Commit Message Rules

- Write in English.
- Use the imperative mood.
- Start the description with a lowercase letter.
- Do not end the subject with a period.
- Keep the subject concise.
- Each commit should represent one logical change.
- Do not combine unrelated changes in one commit.

Bad examples:

```text
updated files
fix bug
work in progress
misc changes
```

Good examples:

```text
build(backend): initialize Spring Boot application
docs: define GitHub workflow
chore: add repository metadata files
```

---

# 9. Pull Request Rules

Each pull request should address one issue or one clearly defined task.

## Pull Request Title

Use the same format as Conventional Commits.

Example:

```text
build(backend): initialize Spring Boot application
```

## Pull Request Description

Include:

- purpose of the change;
- summary of implementation;
- affected modules;
- test results;
- documentation changes;
- known limitations;
- screenshots when UI changes are included.

## Pull Request Size

Prefer small pull requests.

Avoid:

- combining backend and frontend changes without necessity;
- mixing refactoring with feature development;
- unrelated formatting changes;
- modifying many modules for a small task.

---

# 10. Architecture Principles

## Architectural Style

The initial backend architecture is a modular monolith.

The codebase should be organized by business capability rather than technical layer.

Preferred top-level feature packages:

```text
observation
weather
astronomy
location
user
shared
```

Do not organize the entire application only by technical layers such as:

```text
controller
service
repository
entity
dto
```

Technical layers may exist inside an individual feature package.

Preferred example:

```text
com.stellaatlas.weather
├── api
├── application
├── domain
└── infrastructure
```

Avoid:

```text
com.stellaatlas
├── controller
├── service
├── repository
└── entity
```

## Dependency Direction

Dependencies should flow inward:

```text
API / Infrastructure
        ↓
Application
        ↓
Domain
```

The domain layer must not depend on:

- Spring MVC;
- JPA repositories;
- external API clients;
- infrastructure frameworks;
- controller DTOs.

Infrastructure code may depend on domain abstractions.

---

# 11. Backend Package Convention

Recommended structure:

```text
com.stellaatlas
├── observation
│   ├── api
│   ├── application
│   ├── domain
│   └── infrastructure
├── weather
│   ├── api
│   ├── application
│   ├── domain
│   └── infrastructure
├── astronomy
│   ├── api
│   ├── application
│   ├── domain
│   └── infrastructure
└── shared
    ├── config
    ├── error
    └── web
```

## `api`

Contains:

- REST controllers;
- request DTOs;
- response DTOs;
- API-level validation;
- API mapping.

## `application`

Contains:

- use cases;
- application services;
- commands;
- queries;
- transaction boundaries;
- orchestration between domain and infrastructure ports.

## `domain`

Contains:

- entities;
- value objects;
- domain services;
- domain policies;
- repository interfaces;
- provider interfaces;
- domain exceptions.

## `infrastructure`

Contains:

- JPA entities;
- Spring Data repositories;
- external API clients;
- persistence adapters;
- provider implementations;
- framework configuration specific to the feature.

---

# 12. Java Coding Rules

## General

- Use Java 21 language features when they improve clarity.
- Prefer immutable objects.
- Use records for immutable data carriers when appropriate.
- Use constructor injection only.
- Avoid field injection.
- Avoid static mutable state.
- Keep methods small and focused.
- Use meaningful names.
- Do not add abstractions without a clear need.
- Avoid premature optimization.

## Dependency Injection

Required:

```java
@Component
public class ObservationService {

    private final WeatherProvider weatherProvider;

    public ObservationService(WeatherProvider weatherProvider) {
        this.weatherProvider = weatherProvider;
    }
}
```

Forbidden:

```java
@Autowired
private WeatherProvider weatherProvider;
```

## Lombok

Use Lombok minimally.

Avoid Lombok annotations that hide important behavior, including:

```java
@Data
@Setter
@AllArgsConstructor
```

Acceptable uses may include:

```java
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

Prefer explicit constructors for core domain objects.

## Null Handling

Do not use `Optional` for:

- entity fields;
- request DTO fields;
- method parameters;
- every nullable value by default.

Use `Optional` primarily for return values where absence is a normal outcome.

Validate required values at system boundaries.

Prefer empty collections over `null`.

## Visibility

Use the narrowest practical visibility.

Prefer:

- `private` for implementation details;
- package-private for internal collaborators and tests;
- `public` only for intended module APIs.

---

# 13. Spring Rules

## Controllers

Controllers must:

- handle HTTP concerns only;
- validate requests;
- call application use cases;
- map application results to responses;
- avoid business logic.

## Application Services

Application services must:

- implement use cases;
- coordinate domain objects;
- define transaction boundaries;
- avoid HTTP-specific types.

## Domain

Domain objects must:

- enforce business rules;
- prevent invalid state;
- avoid framework dependencies where practical.

## Repositories

Domain packages define repository interfaces.

Infrastructure packages implement them.

Do not expose Spring Data repository interfaces directly to controllers or domain services.

---

# 14. API Rules

Base API path:

```text
/api/v1
```

The primary public product API is:

```text
GET /api/v1/observations
```

Weather and astronomy providers are internal integrations. Do not expose
provider-oriented endpoints such as `/api/v1/weather/forecast` unless a
separate public use case is approved and documented.

Planned location and user APIs must be marked as planned in documentation until
their milestone is active. The canonical endpoint inventory and contracts live
in `docs/API.md`.

## Response Rules

- Use consistent JSON naming.
- Use ISO 8601 date and time formats.
- Include timezone information when returning timestamps.
- Do not expose internal database identifiers unnecessarily.
- Do not expose JPA entities as API responses.
- Use dedicated response DTOs.
- Keep error responses consistent.

## Error Responses

All API errors should eventually follow a common structure:

```json
{
  "code": "WEATHER_PROVIDER_UNAVAILABLE",
  "message": "Weather information is temporarily unavailable.",
  "timestamp": "2026-07-27T11:00:00Z",
  "path": "/api/v1/observations",
  "details": []
}
```

Error timestamps use UTC. `details` is always an array and is empty when no
field-level detail applies. Add a `traceId` only when request tracing is
implemented and the value is backed by the tracing context.

Do not return stack traces or internal exception messages to clients.

---

# 15. Database Rules

- PostgreSQL is the primary database.
- Use Flyway for schema migrations.
- Never rely on Hibernate automatic schema updates in production.
- Migration files must be immutable after being merged.
- Use explicit database constraints.
- Use UTC for persisted timestamps unless there is a documented reason not to.
- Avoid storing calculated values that can be derived reliably unless performance requires it.
- Document significant schema decisions.

Migration naming example:

```text
V1__create_observation_table.sql
V2__add_observation_score.sql
```

---

# 16. External Provider Rules

Weather and astronomy data sources must be abstracted behind interfaces.

Example:

```java
public interface WeatherProvider {
    WeatherForecast getForecast(Location location, ObservationTime time);
}
```

Implementations belong in infrastructure packages.

Example:

```text
weather/domain/WeatherProvider.java
weather/infrastructure/OpenMeteoWeatherProvider.java
```

Application and domain layers must not depend directly on vendor-specific DTOs.

External responses must be mapped to StellaAtlas domain models.

Provider failures must be translated into project-defined exceptions.

---

# 17. Observation Score Rules

Observation Score is a core domain concept.

Potential factors include:

- cloud coverage;
- precipitation;
- humidity;
- visibility;
- wind;
- moon illumination;
- moon altitude;
- twilight;
- atmospheric transparency;
- astronomical seeing.

Do not implement arbitrary score weights without updating:

```text
docs/OBSERVATION_SCORE.md
```

Score calculation must:

- be deterministic for the same inputs;
- have unit tests;
- explain major deductions;
- avoid hidden magic numbers;
- use named policies or constants;
- provide human-readable reasons.

Example output concept:

```json
{
  "score": 82,
  "grade": "GOOD",
  "summary": "Good conditions for stargazing.",
  "factors": [
    {
      "name": "CLOUD_COVERAGE",
      "impact": -10,
      "message": "Some clouds are expected."
    }
  ]
}
```

---

# 18. Frontend Rules

## General

- Use TypeScript.
- Avoid `any`.
- Use Server Components by default where appropriate.
- Use Client Components only when browser interaction is required.
- Keep API access centralized.
- Use reusable UI components.
- Separate data-fetching logic from presentation logic.
- Handle loading, empty, and error states.

## Suggested Structure

```text
frontend/src/
├── app/
├── features/
│   ├── observation/
│   ├── weather/
│   └── astronomy/
├── components/
├── lib/
└── types/
```

Business feature code belongs in `features/`.

Generic reusable components belong in `components/`.

Shared infrastructure utilities belong in `lib/`.

---

# 19. Testing Rules

Business logic must be tested.

## Backend

Use:

- JUnit 5;
- AssertJ;
- Mockito when test doubles are necessary;
- Testcontainers for PostgreSQL integration tests;
- Spring Boot tests only when Spring context is required.

Prefer fast unit tests for domain logic.

Avoid loading the full Spring context for simple calculations.

Required test areas include:

- Observation Score calculation;
- grade boundaries;
- provider mapping;
- validation rules;
- error handling;
- repository adapters.

## Test Naming

Use descriptive names.

Example:

```java
@Test
void shouldReduceScoreWhenCloudCoverageIsHigh() {
}
```

Tests should follow Arrange, Act, Assert structure where practical.

---

# 20. Documentation Rules

Documentation is part of the implementation.

Update documentation when changing:

- architecture;
- public APIs;
- business rules;
- score calculation;
- repository workflow;
- infrastructure;
- major dependencies;
- milestone scope.

Important decisions must be added to:

```text
docs/DECISIONS.md
```

Do not leave documentation knowingly inconsistent with code.

---

# 21. Security Rules

- Never commit secrets.
- Never commit API keys.
- Never commit `.env` files.
- Use `.env.example` for variable names only.
- Do not log passwords, tokens, or private user data.
- Validate external input.
- Configure timeouts for external API calls.
- Do not expose internal exceptions through APIs.
- Review third-party dependencies before adding them.

When adding a dependency, explain why it is necessary.

---

# 22. Configuration Rules

Environment-specific values must not be hardcoded.

Use configuration properties for:

- database URLs;
- API base URLs;
- provider credentials;
- timeouts;
- feature flags;
- scoring configuration where appropriate.

Configuration classes should use type-safe binding.

Preferred:

```java
@ConfigurationProperties(prefix = "stellaatlas.weather")
public record WeatherProperties(
    URI baseUrl,
    Duration connectTimeout,
    Duration readTimeout
) {
}
```

---

# 23. Code Generation Behavior

When Codex receives a task, it must:

1. inspect the current repository state;
2. read relevant documentation;
3. identify the active milestone;
4. identify affected modules;
5. make the smallest coherent change;
6. preserve existing conventions;
7. add or update tests;
8. update documentation when required;
9. run available verification commands;
10. report what changed and any unresolved issues.

Codex must not assume that a planned file already exists.

Always inspect the repository before editing.

---

# 24. Prohibited Agent Behavior

Codex must not:

- implement unrequested features;
- change the technology stack without approval;
- introduce microservices prematurely;
- reorganize the whole repository for a small task;
- delete code without understanding its purpose;
- overwrite user changes;
- hide failing tests;
- weaken tests to make a build pass;
- commit secrets;
- use placeholder implementations without clearly marking them;
- silently change API contracts;
- introduce dependencies solely for trivial convenience;
- mix unrelated changes;
- claim commands succeeded without running them.

---

# 25. Verification Commands

Use the relevant commands after changes.

## Backend

From the `backend` directory:

```bash
./gradlew test
./gradlew check
./gradlew build
```

## Frontend

From the `frontend` directory:

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

Only run commands that exist in the current project.

Do not invent missing scripts.

## Docker

From the repository root:

```bash
docker compose config
docker compose up --build
```

---

# 26. Completion Report

After completing a task, Codex should provide:

```text
Summary
- What was changed

Files
- Files created or modified

Verification
- Commands executed
- Results

Notes
- Decisions, limitations, or follow-up work
```

Example:

```text
Summary
- Initialized the Spring Boot backend module with Java 21.
- Added the Gradle wrapper and base health-check configuration.

Files
- backend/build.gradle
- backend/settings.gradle
- backend/src/main/java/com/stellaatlas/StellaAtlasApplication.java

Verification
- ./gradlew test: passed
- ./gradlew build: passed

Notes
- PostgreSQL and Flyway configuration will be added in the next foundation task.
```

---

# 27. Current Development Status

## Active Milestone

```text
Milestone 1 — Backend Foundation
```

Status: Implementation complete. Docker-backed integration verification is
pending before the milestone is closed.

## Milestone Goal

The Java 21 and Spring Boot backend foundation should build and run locally and
in CI with PostgreSQL and Flyway.

## Current Scope

Allowed work:

- Gradle project and Wrapper;
- Spring Boot application configuration;
- PostgreSQL and Flyway integration;
- shared error response foundation;
- Actuator health checks;
- backend tests and CI verification.

Out of scope until explicitly started:

- weather provider integration;
- astronomy calculations;
- Observation Score implementation;
- authentication;
- observation records;
- frontend initialization;
- production deployment.

## Milestone 1 Completion Criteria

- Gradle Wrapper and Java 21 toolchain configured;
- Spring Boot 3.5.x application starts;
- PostgreSQL 17 and Flyway integrate successfully;
- shared validation error responses are tested;
- Actuator health endpoint reports application status;
- backend checks run in GitHub Actions;
- local backend commands are documented.

---

# 28. Final Principle

Prefer clarity over cleverness.

Prefer domain meaning over framework convenience.

Prefer small verified changes over large speculative implementations.

When uncertain, preserve the current architecture and document the question rather than making an irreversible assumption.

# Postly — AI Content Publishing Engine

## Live API
*Currently in development - running locally at `http://localhost:3000`*

## Overview
Postly is a production-grade backend engine that automates the generation and multi-platform publishing of AI-crafted content. 
Users interact via a stateful Telegram bot to specify content requirements. 
The system leverages AI models (OpenAI/Anthropic) to construct platform-optimized posts and delegates publishing to a robust BullMQ worker queue for reliable delivery.

## Architecture
The system follows a modular monolith approach utilizing message queues for asynchronous task processing.

```text
User 
  |
  v
Telegram Bot  --->  Redis (Session State)
  |
  v
API Layer     --->  AI Engine (OpenAI / Anthropic)
  |
  v
PostgreSQL    --->  BullMQ (Queue)
  |
  v
Workers       --->  Platform APIs (Twitter, LinkedIn, etc.)
```

## Tech Stack
- Node.js, Express
- PostgreSQL, Prisma
- Redis, BullMQ
- OpenAI + Anthropic
- Telegram Bot API
- Docker

## Project Structure
The repository strictly adheres to a layered architecture for separation of concerns:
- routes: Defines HTTP endpoints and mounts middleware.
- controllers: Handles request/response orchestration and validation delegation.
- services: Encapsulates core business logic and third-party integrations.
- repositories: Manages data access patterns and database interactions.

## Authentication & Security
- JWT implementation using short-lived access tokens (15m) and long-lived refresh tokens (7d).
- Refresh token rotation stored within the database for invalidation capabilities.
- Password hashing utilizing bcrypt with a work factor cost of 12.
- Secure, environment-based configuration for third-party API keys and secrets.

## Telegram Bot Flow
- Triggered via /post command, collecting constraints iteratively: type → platform → tone → model → idea → preview → confirm.
- Implements a stateful conversational architecture backed by Redis.
- Includes strict session timeout handling to prevent orphaned conversational states.

## AI Content Engine
- Enforces strict platform-specific constraints (e.g., character limits for Twitter/Threads, specific professional tones for LinkedIn).
- Dynamic prompt construction algorithms based on user-selected tone and language parameters.
- Agnostic model integration supporting both OpenAI and Anthropic provider APIs.

## Queue & Publishing
- Asynchronous task processing using BullMQ backed by Redis.
- Jobs are segmented independently: one job per target platform.
- Implements automatic retry mechanisms utilizing exponential backoff.
- Granular partial failure handling to ensure unaffected platform posts are successfully published.

## Database Design
- users
- social_accounts
- ai_keys
- posts
- platform_posts

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### User
- GET /api/users/me
- POST /api/users/social
- DELETE /api/users/social/:platform

### Posts
- POST /api/posts
- GET /api/posts
- GET /api/posts/:id

### Dashboard
- GET /api/dashboard/metrics
- GET /api/dashboard/status

## Testing
- Automated testing suite built on Jest and Supertest.
- Coverage includes authentication flows, input validation, worker queue processing, and database transaction integrity.

## Local Setup

```bash
git clone https://github.com/your-org/postly.git
cd postly
cp .env.example .env
docker-compose up --build
```

## Telegram Setup
- Generate a new bot token via BotFather on Telegram.
- Inject the token into the local .env configuration file.
- Configure webhook or long-polling within the environment settings.

## Postman Collection
[Link to Postman Collection / OpenAPI Spec]

## Known Limitations
- Does not currently support rich media uploads (images/videos) natively.
- Lacks a robust web UI for content management, relying entirely on Telegram and REST APIs.

## Future Improvements
- Implementation of standardized OAuth 2.0 flows for all social integrations.
- Comprehensive analytics and click-through tracking for published content.
- Global and user-level rate limiting middleware to prevent abuse.

# FastFeet API

A RESTful API for managing the complete delivery lifecycle of a fictitious shipping company. Built with **Clean Architecture**, role-based access control, and comprehensive test coverage.

![Node.js](https://img.shields.io/badge/Node.js-23-339933?logo=nodedotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)

## About

FastFeet manages users (admins and couriers), recipients, and orders through a complete delivery flow:

**PENDING → WAITING → WITHDRAWN → DELIVERED / RETURNED**

Admins handle all CRUD operations, while couriers can withdraw, deliver (with photo proof), and return orders assigned to them. Recipients are notified on each status change.

> The original Rocketseat challenge specification is available at [`docs/CHALLENGE.md`](docs/CHALLENGE.md).

## The FastFeet Ecosystem

This API is the core of a full-stack logistics platform. The complete ecosystem consists of three parts:

1. ⚙️ **Backend API (This repository)**: Built with NestJS and Clean Architecture.
2. 📱 **[FastFeet Mobile App](https://github.com/Jonserafim7/fastfeet-app)**: Built with React Native & Expo. Empowers couriers to manage their assigned deliveries, use geolocation, and capture delivery photo proofs.
3. 💻 **FastFeet Web Panel**: Built with React & Tailwind. Allows admins to manage the entire operation. _(Note: The repository for the web panel at [maferraz517/fastfeet-web](https://github.com/maferraz517/fastfeet-web) is currently private)._

## Tech Stack

| Layer           | Technologies            |
| --------------- | ----------------------- |
| **Framework**   | NestJS 11, Node.js 23   |
| **Language**    | TypeScript 5.7 (ESM)    |
| **Database**    | PostgreSQL 17, Prisma 7 |
| **Auth**        | JWT (HS256), Passport   |
| **Validation**  | Zod 4                   |
| **File Upload** | AWS S3 / Cloudflare R2  |
| **Email**       | Nodemailer (SMTP)       |
| **Testing**     | Vitest, Supertest       |
| **Build**       | SWC, tsc-alias          |

## Prerequisites

- [Node.js](https://nodejs.org/) v23+
- [Docker](https://www.docker.com/) and Docker Compose
- npm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/rocketseat-node-05-desafio-fast-feet.git
cd rocketseat-node-05-desafio-fast-feet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the databases

```bash
docker compose up -d
```

This starts two PostgreSQL 17 containers:

- **Development** database on port `5432`
- **Test** database on port `5433`

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in **all** empty values. The app validates environment variables at startup with Zod and will fail to start if any are missing. See [Environment Variables](#environment-variables) for details.

You can generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

For email in development, you can create a free test inbox at [Ethereal Email](https://ethereal.email/).
For file uploads, you need AWS S3 or Cloudflare R2 credentials.

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Seed the admin user

```bash
npx prisma db seed
```

This creates an admin user with the CPF and password defined in your `.env` file (`ADMIN_DEV_SEED_CPF` and `ADMIN_DEV_SEED_PASSWORD`).

### 7. Start the development server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3333` (or the port configured in `.env`).

## API Endpoints

### Authentication

| Method | Endpoint    | Access | Description                              |
| ------ | ----------- | ------ | ---------------------------------------- |
| `POST` | `/sessions` | Public | Login with CPF and password, returns JWT |

### Users

| Method  | Endpoint              | Access | Description              |
| ------- | --------------------- | ------ | ------------------------ |
| `POST`  | `/users`              | Admin  | Create a new user        |
| `PATCH` | `/users/:id/password` | Admin  | Update a user's password |

### Couriers

| Method   | Endpoint        | Access  | Description       |
| -------- | --------------- | ------- | ----------------- |
| `POST`   | `/couriers`     | Admin   | Create a courier  |
| `GET`    | `/couriers`     | Admin   | List all couriers |
| `GET`    | `/couriers/:id` | Admin   | Get courier by ID |
| `GET`    | `/couriers/me`  | Courier | Get own profile   |
| `PATCH`  | `/couriers/:id` | Admin   | Update a courier  |
| `DELETE` | `/couriers/:id` | Admin   | Delete a courier  |

### Recipients

| Method   | Endpoint          | Access | Description         |
| -------- | ----------------- | ------ | ------------------- |
| `POST`   | `/recipients`     | Admin  | Create a recipient  |
| `GET`    | `/recipients`     | Admin  | List all recipients |
| `GET`    | `/recipients/:id` | Admin  | Get recipient by ID |
| `PATCH`  | `/recipients/:id` | Admin  | Update a recipient  |
| `DELETE` | `/recipients/:id` | Admin  | Delete a recipient  |

### Orders

| Method   | Endpoint                    | Access  | Description                                  |
| -------- | --------------------------- | ------- | -------------------------------------------- |
| `POST`   | `/orders`                   | Admin   | Create an order                              |
| `GET`    | `/orders`                   | Admin   | List all orders                              |
| `GET`    | `/orders/:id`               | Admin   | Get order by ID                              |
| `PATCH`  | `/orders/:id`               | Admin   | Update an order                              |
| `DELETE` | `/orders/:id`               | Admin   | Delete an order                              |
| `PATCH`  | `/orders/:orderId/waiting`  | Admin   | Mark order as waiting (available for pickup) |
| `PATCH`  | `/orders/:orderId/withdraw` | Courier | Withdraw an order for delivery               |
| `PATCH`  | `/orders/:orderId/deliver`  | Courier | Mark order as delivered (requires photo)     |
| `PATCH`  | `/orders/:orderId/return`   | Courier | Mark order as returned                       |
| `GET`    | `/orders/me`                | Courier | List own orders                              |
| `GET`    | `/orders/nearby`            | Courier | List orders near courier's location          |

## Authentication

The API uses **JWT with HS256** symmetric encryption.

1. **Login** via `POST /sessions` with `cpf` and `password` to receive a JWT token
2. **Include** the token in subsequent requests: `Authorization: Bearer <token>`
3. **Token payload** contains `{ sub: userId, role: 'ADMIN' | 'COURIER' }`

Routes are protected by two guards applied globally:

- **JwtAuthGuard** - validates the JWT and extracts the user
- **RolesGuard** - checks the user's role against the `@Roles()` decorator

Use `@Public()` to skip authentication on specific routes.

## Testing

### Unit tests

```bash
npm test
```

Unit tests use **in-memory repositories** and fake cryptography implementations, keeping them fast and isolated from any database.

### E2E tests

```bash
npm run test:e2e
```

E2E tests spin up a real NestJS application against the test database (port `5433`). Each test run creates an isolated PostgreSQL schema, runs migrations, and cleans up after itself.

### Watch mode

```bash
npm run test:watch      # unit tests
npm run test:e2e:watch  # e2e tests
```

## Environment Variables

| Variable                      | Required  | Default       | Description                                |
| ----------------------------- | --------- | ------------- | ------------------------------------------ |
| `NODE_ENV`                    | No        | `development` | Environment mode                           |
| `DATABASE_URL`                | Yes       | —             | PostgreSQL connection string               |
| `PORT`                        | No        | `3333`        | Server port                                |
| `JWT_SECRET`                  | Yes       | —             | Secret key for JWT signing (HS256)         |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | No        | `86400`       | Token expiry in seconds (1 day)            |
| `AWS_ACCESS_KEY_ID`           | Yes       | —             | AWS/Cloudflare access key                  |
| `AWS_SECRET_ACCESS_KEY`       | Yes       | —             | AWS/Cloudflare secret key                  |
| `AWS_BUCKET_NAME`             | Yes       | —             | S3/R2 bucket name                          |
| `CLOUDFLARE_ACCOUNT_ID`       | Yes       | —             | Cloudflare account ID (for R2)             |
| `MAIL_HOST`                   | Yes       | —             | SMTP host                                  |
| `MAIL_PORT`                   | No        | `587`         | SMTP port                                  |
| `MAIL_USER`                   | Yes       | —             | SMTP username                              |
| `MAIL_PASS`                   | Yes       | —             | SMTP password                              |
| `MAIL_FROM`                   | Yes       | —             | Sender email address (must be valid email) |
| `ADMIN_DEV_SEED_PASSWORD`     | Seed only | —             | Admin password for seeding                 |
| `ADMIN_DEV_SEED_CPF`          | Seed only | —             | Admin CPF for seeding                      |

See [`.env.example`](.env.example) for a complete template.

## Project Structure

```
src/
├── core/                        # Pure business logic (no framework deps)
│   ├── use-cases/               # Application use cases
│   ├── repositories/            # Abstract repository interfaces
│   ├── cryptography/            # Crypto contracts
│   ├── messaging/               # Mailer interface
│   ├── storage/                 # Upload interface
│   ├── errors/                  # Either monad & error types
│   └── utils/                   # Helper functions
│
├── infra/                       # Framework & external implementations
│   ├── http/controllers/        # NestJS route handlers
│   ├── http/presenters/         # Response transformers
│   ├── database/prisma/         # Prisma repositories
│   ├── auth/                    # JWT strategy, guards, decorators
│   ├── cryptography/            # Bcrypt & JWT implementations
│   ├── messaging/               # Nodemailer implementation
│   ├── storage/                 # S3/R2 upload implementation
│   └── env/                     # Zod-validated config
│
├── test/                        # Test doubles
│   ├── repositories/            # In-memory repositories
│   ├── cryptography/            # Fake hasher & encrypter
│   └── factories/               # Test data builders
│
└── generated/                   # Auto-generated Prisma client
```

## Available Scripts

| Script               | Description                               |
| -------------------- | ----------------------------------------- |
| `npm run start:dev`  | Start in development mode with watch      |
| `npm run build`      | Build for production (NestJS + tsc-alias) |
| `npm run start:prod` | Run production build                      |
| `npm test`           | Run unit tests                            |
| `npm run test:e2e`   | Run E2E tests                             |
| `npm run lint`       | Lint and auto-fix with ESLint             |
| `npm run format`     | Format with Prettier                      |
| `npm run typecheck`  | Type-check without emitting               |

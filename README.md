# Storefront Backend API

A RESTful API for an online storefront built with Node.js, Express, TypeScript, and PostgreSQL.

## Technologies Used
- Node.js + Express
- TypeScript
- PostgreSQL (via Docker)
- db-migrate for database migrations
- bcrypt for password hashing
- jsonwebtoken for authentication
- jasmine + supertest for testing

## Prerequisites
- Node.js
- Docker Desktop
- yarn

## Environment Variables
Create a `.env` file in the project root with the following values:
```
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=storefront_dev
POSTGRES_TEST_DB=storefront_test
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
ENV=test
BCRYPT_PASSWORD=my-storefront-pepper
BCRYPT_SALT_ROUNDS=10
JWT_SECRET=my-storefront-jwt-secret
```

## Setup Instructions

### 1. Install dependencies
```bash
yarn
```

### 2. Start the database
```bash
docker-compose up -d
```

### 3. Run migrations
```bash
yarn migrate
```

### 4. Start the server
```bash
yarn start
```

Server runs on `http://localhost:3000`

### 5. Run tests
```bash
yarn test
```

## Ports
- **Server**: http://localhost:3000
- **Database**: localhost:5432

## API Endpoints

### Users
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| GET | `/users` | ✅ Bearer Token |
| GET | `/users/:id` | ✅ Bearer Token |
| POST | `/users` | ❌ |
| POST | `/users/authenticate` | ❌ |
| PATCH | `/users/:id` | ✅ Bearer Token |
| DELETE | `/users/:id` | ✅ Bearer Token |

### Products
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| GET | `/products` | ❌ |
| GET | `/products/:id` | ❌ |
| GET | `/products/popular` | ❌ |
| GET | `/products/category/:category` | ❌ |
| POST | `/products` | ✅ Bearer Token |
| PATCH | `/products/:id` | ✅ Bearer Token |
| DELETE | `/products/:id` | ✅ Bearer Token |

### Orders
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| GET | `/orders` | ✅ Bearer Token |
| GET | `/orders/:id` | ✅ Bearer Token |
| GET | `/orders/completed/:user_id` | ✅ Bearer Token |
| POST | `/orders` | ✅ Bearer Token |
| PATCH | `/orders/:id` | ✅ Bearer Token |
| DELETE | `/orders/:id` | ✅ Bearer Token |
| POST | `/orders/:id/products` | ✅ Bearer Token |

## Authentication
Protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

To get a token:
1. Create a user via `POST /users`
2. Or authenticate via `POST /users/authenticate`

Both endpoints return a JWT token in the response.
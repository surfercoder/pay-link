# Pay Link - Payment Processing Application

A modern payment processing application built with Next.js frontend and Hono backend, featuring secure payment processing capabilities.

## Project Overview

This project consists of two main applications:

- **Frontend**: A Next.js application providing a modern and responsive user interface
- **Backend**: A Hono-based API server handling payment processing with Prisma ORM

## Tech Stack

### Frontend

- Next.js 15.2.2
- React 19
- TypeScript
- TailwindCSS
- Jest for testing
- Zod for validation

### Backend

- Hono (Node.js framework)
- Prisma ORM
- TypeScript
- Jest for testing
- Zod for validation

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd pay-link
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Environment Setup

#### Backend

1. Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://[user]:[password]@localhost:5432/paylink"
```

2. Set up the database:
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Running the Applications

#### Backend

```bash
cd backend
npm run dev
```
The backend server will start at http://localhost:4000

#### Frontend

```bash
cd frontend
npm run dev
```
The frontend application will start at http://localhost:3000

## Testing

### Backend Tests

```bash
cd backend
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Frontend Tests

```bash
cd frontend
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── __tests__/    # Test files
│   └── index.ts      # Main application entry
├── prisma/
│   ├── migrations/   # Database migrations
│   └── schema.prisma # Database schema
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   └── app/         # Next.js app directory
├── public/          # Static files
└── package.json
```

## API Endpoints

### POST /api/checkout

Creates a new payment transaction.

**Request Body:**
```json
{
  "amount": number,
  "currency": string,
  "email": string
}
```

**Response:**
```json
{
  "success": boolean,
  "payment": {
    "id": string,
    "amount": number,
    "currency": string,
    "email": string,
    "status": string,
    "createdAt": string,
    "updatedAt": string
  }
}
```

## Development Guidelines

1. Follow TypeScript best practices and maintain type safety
2. Write tests for new features
3. Use Prisma migrations for database changes
4. Follow the existing code style and formatting

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Write/update tests
4. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
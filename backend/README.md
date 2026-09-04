# EduNova Backend API

Backend foundation for **EduNova** – a Gamified Chemistry Learning Platform. Built with Node.js, Express.js, MySQL, Prisma ORM, JWT, and Zod.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript (CommonJS)
- **Database:** MySQL
- **ORM:** Prisma ORM
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **Environment Variables:** dotenv
- **Validation:** Zod
- **Development Server:** Nodemon

---

## 📁 Project Structure

```text
backend/
├── prisma/
│   └── schema.prisma         # Prisma Schema (MySQL Data Source & User Model)
├── src/
│   ├── config/
│   │   └── db.js             # Reusable Prisma Client Singleton
│   ├── controllers/
│   │   └── healthController.js # Health Check Controller
│   ├── middleware/
│   │   └── errorMiddleware.js  # Global Error & 404 Handlers
│   ├── routes/
│   │   ├── index.js          # Central API Router Prefix (/api)
│   │   └── healthRoutes.js   # GET /api/health Route
│   ├── services/
│   │   └── healthService.js  # Health & DB Connectivity Service
│   ├── utils/
│   │   └── apiResponse.js    # Standard JSON Response Formatter
│   ├── app.js                # Express App Setup (CORS, Parsers, Logger)
│   └── server.js             # Server Listener & DB Startup
├── .env                      # Environment Variables (Ignored in Git)
├── .env.example              # Template Environment File
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` folder based on `.env.example`:

```env
PORT=5000
DATABASE_URL="mysql://root:password@localhost:3306/chemescape"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY=""
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

---

## 🗄️ Database Setup & Prisma Migration

1. Ensure MySQL is running on `localhost:3306`.
2. Create the `chemescape` database in MySQL:
   ```sql
   CREATE DATABASE chemescape;
   ```
3. Update `DATABASE_URL` in `.env` with your MySQL credentials.
4. Generate the Prisma Client:
   ```bash
   npm run prisma:generate
   ```
5. Run the initial database migration:
   ```bash
   npm run prisma:migrate
   ```

---

## 🚀 Running the Server

### Development Mode (with Nodemon auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

---

## 🏥 Health Check API

### GET `/api/health`

**Request:**
```http
GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "ChemEscape API is running",
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2026-08-10T11:22:48.000Z"
  }
}
```

---

## 📜 Package Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server with Nodemon on port 5000 |
| `npm start` | Start production server with Node.js |
| `npm run prisma:generate` | Generate Prisma Client from `schema.prisma` |
| `npm run prisma:migrate` | Run database migrations in development |
| `npm run prisma:studio` | Open Prisma Studio GUI for database inspection |

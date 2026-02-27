# Map2Home Backend Documentation

## Overview

Map2Home Backend is a Node.js/Express RESTful API server that provides authentication, cost estimation, material price scraping, and map generation services for the Map2Home construction cost estimation platform.

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** MySQL (mysql2)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Web Scraping:** Cheerio + Axios
- **Scheduling:** node-cron
- **Email:** Nodemailer
- **Validation:** validator.js

## Project Structure

```
backend/
├── config/
│   ├── database.js          # Database connection configuration
│   └── initDb.js            # Database initialization
├── controllers/
│   ├── adminController.js   # Admin operations
│   ├── authController.js    # Authentication logic
│   ├── costController.js    # Cost estimation calculations
│   ├── feedbackController.js # User feedback handling
│   ├── mapController.js     # Map generation & management
│   └── userController.js   # User profile operations
├── database/
│   ├── schema.sql           # Main database schema
│   ├── materials_schema.sql # Materials table schema
│   ├── maps_schema.sql      # Maps table schema
│   ├── feedback_schema.sql  # Feedback table schema
│   └── scraping_logs_schema.sql # Scraping logs schema
├── middlewares/
│   ├── authMiddleware.js    # JWT authentication middleware
│   └── errorHandler.js      # Global error handler
├── routes/
│   ├── adminRoutes.js       # Admin API routes
│   ├── authRoutes.js        # Authentication routes
│   ├── costRoutes.js        # Cost estimation routes
│   ├── feedbackRoutes.js    # Feedback routes
│   ├── mapRoutes.js         # Map routes
│   ├── materialRoutes.js    # Material management routes
│   └── userRoutes.js        # User routes
├── services/
│   ├── costzoneScraper.js   # Web scraping service
│   ├── emailService.js      # Email sending service
│   ├── emailValidator.js    # Email validation service
│   └── scrapingCron.js      # Cron job scheduler
├── utils/
│   ├── passwordValidator.js # Password strength validation
│   └── tokenUtils.js       # JWT token utilities
├── server.js                # Main server file
└── package.json             # Dependencies
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=map2home
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=7d
   FRONTEND_URL=http://localhost:5173
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   NODE_ENV=development
   ```

3. **Database Setup**
   ```bash
   # Database will be auto-initialized on server start
   # Or manually run schema files from database/ directory
   ```

4. **Start Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/verify-email` | Verify email address | No |
| GET | `/verify-email?token=...` | Email verification link | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| GET | `/me` | Get current user | Yes |

### Cost Estimation Routes (`/api/cost-estimation`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/default-data` | Get default cost data | No |
| POST | `/calculate` | Calculate construction cost | Yes |
| POST | `/save` | Save cost estimate | Yes |
| GET | `/my-estimates` | Get user's estimates | Yes |

### Map Routes (`/api/maps`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all maps | No |
| GET | `/room-type/:room_type` | Get maps by room type | No |
| POST | `/by-specifications` | Get maps by specifications | No |
| POST | `/generate-2d` | Generate 2D map | Yes |
| GET | `/my-maps` | Get user's maps | Yes |
| GET | `/dxf/:filename` | Get DXF file | Yes |

### Material Routes (`/api/materials`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/prices` | Get material prices | No |
| GET | `/dashboard` | Admin material dashboard | Yes (Admin) |
| POST | `/scrape-prices` | Manually trigger scraping | Yes (Admin) |
| GET | `/scraping-logs` | Get scraping logs | Yes (Admin) |
| GET | `/scraping-stats` | Get scraping statistics | Yes (Admin) |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | System statistics | Yes (Admin) |
| GET | `/users` | Get all users | Yes (Admin) |
| POST | `/users/:userId/role` | Update user role | Yes (Admin) |
| GET | `/materials` | Get all materials | Yes (Admin) |
| PUT | `/materials/cost` | Update material cost | Yes (Admin) |

### Feedback Routes (`/api/feedback`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/add` | Submit feedback | Yes |
| GET | `/my-feedback` | Get user's feedback | Yes |
| GET | `/all` | Get all feedback (admin) | Yes (Admin) |
| GET | `/stats` | Feedback statistics | Yes (Admin) |

## Authentication

### JWT Token-Based Authentication

- **Token Generation:** Uses `jsonwebtoken` library
- **Token Storage:** Frontend stores in localStorage
- **Token Format:** `Bearer <token>` in Authorization header
- **Token Expiry:** Configurable via `JWT_EXPIRY` env variable (default: 7 days)

### Password Security

- **Hashing:** bcryptjs with 10 rounds
- **Validation:** Minimum 8 characters, uppercase, lowercase, number, special character
- **Storage:** Only hashed passwords stored in database

### Email Verification

- **Token Generation:** 32-byte hex token
- **Token Storage:** Hashed with SHA-256 in `email_tokens` table
- **Expiration:** 24 hours
- **Required:** In production mode

## Web Scraping Service

### Cron Job Configuration

**Location:** `backend/services/scrapingCron.js`

**Schedule:** Every 5 minutes
```javascript
cron.schedule('*/5 * * * *', async () => {
  await executeScraping('cron');
}, {
  scheduled: true,
  timezone: "Asia/Karachi"
});
```

**Cron Expression:** `*/5 * * * *`
- `*/5` = Every 5 minutes
- `*` = Every hour
- `*` = Every day
- `*` = Every month
- `*` = Every day of week

### Scraping Process

1. **Trigger:** Cron job runs every 5 minutes
2. **Source:** Scrapes prices from costzone.org
3. **Storage:** Updates `materials` table in MySQL
4. **Logging:** Logs all scraping activities to `scraping_logs` table

### Scraped Materials

- Cement
- Steel
- Bricks
- Sand
- Gravel
- Tiles
- Paint
- Aluminum
- Glass
- Electrical Wire
- Plumbing Pipe

## Database Schema

### Main Tables

1. **users** - User accounts
2. **materials** - Material prices (scraped data)
3. **email_tokens** - Email verification tokens
4. **reset_tokens** - Password reset tokens
5. **cost_estimates** - Saved cost estimates
6. **maps** - Generated maps
7. **feedback** - User feedback
8. **scraping_logs** - Scraping activity logs

## Security Features

1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin resource sharing (whitelisted origins)
3. **Rate Limiting** - 100 requests per 15 minutes (general), 5 per 15 minutes (auth)
4. **JWT Authentication** - Token-based auth
5. **Password Hashing** - bcrypt
6. **Input Validation** - Server-side validation
7. **SQL Injection Protection** - Parameterized queries

## Error Handling

- **Global Error Handler:** `backend/middlewares/errorHandler.js`
- **Standardized Responses:** JSON error format
- **HTTP Status Codes:** Proper status codes (400, 401, 403, 404, 500)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `DB_HOST` | Database host | localhost |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | map2home |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRY` | Token expiration | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | - |
| `NODE_ENV` | Environment (development/production) | development |

## Scripts

```bash
npm start      # Start server (production)
npm run dev    # Start with nodemon (development)
npm test       # Run tests
npm run seed-maps  # Seed maps data
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error",
  "missingFields": [...]
}
```

## Cost Estimation Logic

### Base Rates (Per Square Meter)

**Grey Structure:**
- Economy: Rs 8,500/sqm
- Standard: Rs 10,500/sqm
- Luxury: Rs 12,500/sqm

**Complete House:**
- Economy: Rs 13,000/sqm
- Standard: Rs 16,000/sqm
- Luxury: Rs 20,000/sqm

### Location Multipliers

- Karachi: 1.0
- Lahore: 1.05
- Islamabad: 1.15
- Rawalpindi: 1.08
- Faisalabad: 0.95
- Multan: 0.92
- Peshawar: 0.98
- Quetta: 0.90

### Material Prices

- Fetched from `materials` table (scraped from costzone.org)
- Fallback prices used if scraping fails
- Updated every 5 minutes via cron job

## Testing

```bash
npm test
```

## Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET`
4. Configure email service
5. Start with `npm start` or use PM2

## License

ISC


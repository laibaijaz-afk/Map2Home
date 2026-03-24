# Map2Home Backend Documentation

## Overview

Map2Home Backend is a Node.js/Express RESTful API server that provides authentication, cost estimation, material price scraping, and map generation services for the Map2Home construction cost estimation platform. The backend uses MySQL for data persistence, JWT for authentication, and implements scheduled web scraping for real-time material prices.

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** MySQL (mysql2 3.6.5)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **Web Scraping:** Cheerio 1.1.2 + Axios 1.13.2
- **Scheduling:** node-cron 4.2.1
- **Email:** Nodemailer 6.9.7
- **Validation:** validator.js 13.11.0
- **Security:** Helmet 7.1.0, CORS 2.8.5, express-rate-limit 7.1.5
- **File Upload:** Multer 2.0.2

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MySQL connection pool configuration
│   └── initDb.js            # Database initialization and schema setup
├── controllers/
│   ├── adminController.js   # Admin operations (users, stats, materials)
│   ├── authController.js    # Authentication logic (register, login, verify, reset)
│   ├── costController.js    # Cost estimation calculations and management
│   ├── feedbackController.js # User feedback handling
│   ├── mapController.js     # Map generation, retrieval, and DXF file serving
│   └── userController.js    # User profile operations
├── database/
│   ├── schema.sql           # Main database schema (users, tokens, estimates)
│   ├── materials_schema.sql # Materials table schema
│   ├── maps_schema.sql      # Maps table schema
│   ├── feedback_schema.sql  # Feedback table schema
│   └── scraping_logs_schema.sql # Scraping logs table schema
├── middlewares/
│   ├── authMiddleware.js    # JWT authentication middleware
│   └── errorHandler.js      # Global error handling middleware
├── routes/
│   ├── adminRoutes.js       # Admin API routes
│   ├── authRoutes.js        # Authentication routes
│   ├── costRoutes.js        # Cost estimation routes
│   ├── feedbackRoutes.js    # Feedback routes
│   ├── mapRoutes.js         # Map routes
│   ├── materialRoutes.js    # Material management routes
│   └── userRoutes.js        # User routes
├── services/
│   ├── costzoneScraper.js   # Web scraping service (costzone.org)
│   ├── emailService.js      # Email sending service (Nodemailer)
│   ├── emailValidator.js    # Email validation service (MX records, disposable domains)
│   └── scrapingCron.js      # Cron job scheduler for automated scraping
├── utils/
│   ├── passwordValidator.js # Password strength validation utility
│   └── tokenUtils.js        # JWT token generation utilities
├── scripts/
│   ├── createAdmin.js       # Script to create admin user
│   ├── seedMaps.js          # Script to seed maps data
│   └── ...
├── uploads/
│   └── maps/                # Uploaded DXF map files
├── server.js                # Main server entry point
└── package.json             # Dependencies and scripts
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
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
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=map2home
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_min_32_chars
   JWT_EXPIRY=7d

   # Email Configuration (for verification and password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   EMAIL_FROM=noreply@map2home.com
   ```

3. **Database Setup**
   The database will be auto-initialized on server start via `config/initDb.js`, or you can manually run schema files:
   ```bash
   mysql -u your_user -p map2home < database/schema.sql
   mysql -u your_user -p map2home < database/materials_schema.sql
   mysql -u your_user -p map2home < database/maps_schema.sql
   mysql -u your_user -p map2home < database/feedback_schema.sql
   mysql -u your_user -p map2home < database/scraping_logs_schema.sql
   ```

4. **Start Server**
   ```bash
   # Development mode (with auto-reload via nodemon)
   npm run dev

   # Production mode
   npm start
   ```

5. **Create Admin User** (Optional)
   ```bash
   node scripts/createAdmin.js
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| POST | `/register` | Register new user | No | 5/15min |
| POST | `/login` | User login | No | 5/15min |
| POST | `/verify-email` | Verify email address | No | 5/15min |
| GET | `/verify-email?token=...` | Email verification link | No | 5/15min |
| POST | `/forgot-password` | Request password reset | No | 5/15min |
| POST | `/reset-password` | Reset password with token | No | 5/15min |
| GET | `/me` | Get current user | Yes | 100/15min |

**Request Examples:**

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Cost Estimation Routes (`/api/cost-estimation`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/default-data` | Get default cost data (locations, qualities) | No |
| POST | `/calculate` | Calculate construction cost | Yes |
| POST | `/save` | Save cost estimate | Yes |
| GET | `/my-estimates` | Get user's saved estimates | Yes |

**Calculate Request:**
```json
POST /api/cost-estimation/calculate
{
  "plotLength": 50,
  "plotWidth": 30,
  "coveredAreaPercent": 100,
  "location": "Karachi",
  "floors": 2,
  "quality": "Standard",
  "bedrooms": 3,
  "bathrooms": 2,
  "kitchen": 1,
  "drawingRoom": 1,
  "diningRoom": 1,
  "storeRoom": 1,
  "garage": 1,
  "servantQuarter": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCost": 4500000,
    "greyStructureCost": 2800000,
    "finishingCost": 1700000,
    "areaSqm": 139.35,
    "materialBreakdown": {...},
    "locationMultiplier": 1.0
  }
}
```

### Map Routes (`/api/maps`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all maps | No |
| GET | `/room-type/:room_type` | Get maps by room type | No |
| POST | `/by-specifications` | Get maps by specifications | No |
| POST | `/generate-2d` | Generate 2D map (strict validation) | Yes |
| GET | `/my-maps` | Get user's generated maps | Yes |
| GET | `/dxf/:filename` | Get DXF file | Yes |

**Generate 2D Map Request:**
```json
POST /api/maps/generate-2d
{
  "length": 30,
  "width": 45,
  "roomSpecifications": {
    "bedrooms": 2,
    "bathrooms": 3,
    "kitchen": 1,
    "drawingRoom": 1,
    "diningRoom": 0,
    "storeRoom": 0,
    "garage": 1,
    "servantQuarter": 0,
    "tvLounge": 1
  }
}
```

**Note:** Map generation only works with exact dummy inputs specified above.

### Material Routes (`/api/materials`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/prices` | Get current material prices | No |
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

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |

## Authentication

### JWT Token-Based Authentication

**Token Generation:**
- Uses `jsonwebtoken` library
- Secret key from `JWT_SECRET` environment variable
- Expiry configurable via `JWT_EXPIRY` (default: 7 days)

**Token Format:**
```
Authorization: Bearer <token>
```

**Token Structure:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Middleware:** `middlewares/authMiddleware.js`
- Extracts token from `Authorization` header
- Verifies token signature
- Fetches user from database
- Attaches user to `req.user`

### Password Security

**Hashing:**
- Uses `bcryptjs` with 10 salt rounds
- Passwords never stored in plain text
- Hash comparison on login

**Validation Rules:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Location:** `utils/passwordValidator.js`

### Email Verification

**Process:**
1. User registers
2. 32-byte hex token generated
3. Token hashed with SHA-256
4. Hashed token stored in `email_tokens` table
5. Verification email sent with link
6. Token expires after 24 hours
7. Required in production mode

**Token Storage:**
- Table: `email_tokens`
- Fields: `user_id`, `token_hash`, `type`, `expires_at`

### Password Reset

**Process:**
1. User requests reset via `/forgot-password`
2. Reset token generated and hashed
3. Token stored in `reset_tokens` table
4. Reset email sent with link
5. Token expires after 1 hour
6. User resets password via `/reset-password`

## Web Scraping Service

### Cron Job Configuration

**Location:** `services/scrapingCron.js`

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

**Location:** `services/costzoneScraper.js`

**Source:** `https://costzone.org` (Pakistan construction material prices)

**Process Flow:**
1. Cron job triggers every 5 minutes
2. `scrapeCostzonePrices()` function called
3. Scrapes prices from costzone.org
4. Parses HTML using Cheerio
5. Extracts material prices and units
6. Updates `materials` table in MySQL
7. Logs activity to `scraping_logs` table

**Scraped Materials:**
- Cement (bag)
- Steel (ton)
- Bricks (piece)
- Sand (truck)
- Gravel (truck)
- Tiles (sqm)
- Paint (liter)
- Aluminum (kg)
- Glass (sqft)
- Electrical Wire (meter)
- Plumbing Pipe (meter)

### Price Storage

**Database Table:** `materials`

**Storage Function:** `updateMaterialPrices()` in `costzoneScraper.js`

**Process:**
- For each scraped material:
  - Check if material exists by name (case-insensitive)
  - If exists: UPDATE `cost_per_unit`, `unit`, `last_scraped_at`
  - If not exists: INSERT new record
- Transaction-based (all or nothing)
- Logs success/failure to `scraping_logs` table

**Table Schema:**
```sql
CREATE TABLE materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  category ENUM('construction', 'finishing', 'other') DEFAULT 'construction',
  cost_per_unit DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'sqm',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  source_url VARCHAR(255),
  last_scraped_at TIMESTAMP NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### Fallback Prices

**Location:** `controllers/costController.js`

If scraping fails, fallback prices are used:
```javascript
const FALLBACK_MATERIAL_PRICES = {
  cement: { price: 1235, unit: 'bag' },
  sand: { price: 7000, unit: 'truck' },
  bricks: { price: 17, unit: 'piece' },
  steel: { price: 250000, unit: 'ton' },
  // ... more materials
};
```

## Database Schema

### Main Tables

1. **users**
   - User accounts
   - Fields: `id`, `name`, `email`, `password_hash`, `role`, `is_verified`, `created_at`, `updated_at`

2. **materials**
   - Material prices (scraped data)
   - Fields: `id`, `name`, `category`, `cost_per_unit`, `unit`, `description`, `is_active`, `source_url`, `last_scraped_at`

3. **email_tokens**
   - Email verification tokens
   - Fields: `id`, `user_id`, `token_hash`, `type`, `expires_at`, `created_at`

4. **reset_tokens**
   - Password reset tokens
   - Fields: `id`, `user_id`, `token_hash`, `expires_at`, `created_at`

5. **cost_estimates**
   - Saved cost estimates
   - Fields: `id`, `user_id`, `plot_length`, `plot_width`, `total_cost`, `data` (JSON), `created_at`

6. **maps**
   - Generated maps
   - Fields: `id`, `user_id`, `filename`, `room_specifications` (JSON), `created_at`

7. **feedback**
   - User feedback
   - Fields: `id`, `user_id`, `rating`, `comment`, `created_at`

8. **scraping_logs**
   - Scraping activity logs
   - Fields: `id`, `trigger_type`, `status`, `materials_scraped`, `errors`, `duration_ms`, `created_at`

## Security Features

### 1. Helmet.js
- Sets security HTTP headers
- Prevents XSS attacks
- Prevents clickjacking

### 2. CORS
- Whitelisted origins only
- Credentials enabled
- Configurable via `FRONTEND_URL`

### 3. Rate Limiting
- General routes: 100 requests per 15 minutes
- Auth routes: 5 requests per 15 minutes
- Uses `express-rate-limit`

### 4. JWT Authentication
- Token-based authentication
- Secure token signing
- Token expiration

### 5. Password Hashing
- bcrypt with 10 rounds
- Never store plain passwords

### 6. Input Validation
- Server-side validation for all inputs
- Email format validation
- Password strength validation
- SQL injection protection via parameterized queries

### 7. Email Validation
- Email format validation
- Disposable email domain check
- MX record verification
- Location: `services/emailValidator.js`

## Error Handling

### Global Error Handler

**Location:** `middlewares/errorHandler.js`

**Features:**
- Standardized error responses
- Proper HTTP status codes
- Error logging
- Development vs production error messages

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)",
  "missingFields": ["field1", "field2"]
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

| Location | Multiplier |
|----------|------------|
| Karachi | 1.0 |
| Lahore | 1.05 |
| Islamabad | 1.15 |
| Rawalpindi | 1.08 |
| Faisalabad | 0.95 |
| Multan | 0.92 |
| Peshawar | 0.98 |
| Quetta | 0.90 |

### Area Calculation

**Marla to Square Meters:**
- 1 Marla = 25.2929 square meters (272.25 square feet)

**Covered Area:**
- Hardcoded to 100% of plot area
- Calculated as: `plotLength * plotWidth * (100 / 100)`

### Material Prices

- Fetched from `materials` table (scraped from costzone.org)
- Updated every 5 minutes via cron job
- Fallback prices used if scraping fails
- Location: `controllers/costController.js`

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| `FRONTEND_URL` | Frontend URL for CORS | - | Yes |
| `DB_HOST` | Database host | localhost | Yes |
| `DB_USER` | Database user | - | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | map2home | Yes |
| `DB_PORT` | Database port | 3306 | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRY` | Token expiration | 7d | No |
| `EMAIL_HOST` | SMTP host | - | Yes |
| `EMAIL_PORT` | SMTP port | 587 | No |
| `EMAIL_USER` | SMTP username | - | Yes |
| `EMAIL_PASS` | SMTP password | - | Yes |
| `EMAIL_FROM` | Email sender address | - | No |

## Scripts

```bash
npm start          # Start server (production)
npm run dev        # Start with nodemon (development)
npm test           # Run tests
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
  "error": "Detailed error (development only)",
  "missingFields": ["field1", "field2"]
}
```

## Testing

```bash
npm test
```

Tests use Jest and Supertest for API testing.

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET` (minimum 32 characters)
4. Configure email service (SMTP)
5. Set `FRONTEND_URL` to production frontend URL
6. Enable HTTPS
7. Configure firewall rules
8. Set up process manager (PM2 recommended)
9. Configure logging
10. Set up monitoring

### PM2 Example

```bash
npm install -g pm2
pm2 start server.js --name map2home-backend
pm2 save
pm2 startup
```

## Monitoring & Logging

### Scraping Logs

- Stored in `scraping_logs` table
- Tracks: trigger type, status, materials scraped, errors, duration
- Accessible via `/api/materials/scraping-logs` (admin only)

### Error Logging

- Errors logged to console
- Production: Consider using logging service (Winston, Pino)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in `.env`
   - Verify MySQL server is running
   - Check database exists

2. **Scraping Not Working**
   - Check internet connection
   - Verify costzone.org is accessible
   - Check scraping logs table
   - Verify cron job is running

3. **Email Not Sending**
   - Check SMTP credentials
   - Verify email service allows less secure apps
   - Check email logs

4. **JWT Token Invalid**
   - Verify `JWT_SECRET` matches
   - Check token expiration
   - Verify token format

## License

ISC




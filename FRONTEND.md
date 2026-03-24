# Map2Home Frontend Documentation

## Overview

Map2Home Frontend is a modern, responsive Vue.js 3 application that provides a user-friendly interface for construction cost estimation, 2D map generation, material price tracking, and user authentication. The application uses Pinia for state management, Vue Router for navigation, and Tailwind CSS for styling.

## Technology Stack

- **Framework:** Vue.js 3.3.4 (Composition API)
- **Build Tool:** Vite 5.0.0
- **State Management:** Pinia 2.1.6
- **Routing:** Vue Router 4.2.5
- **HTTP Client:** Axios 1.6.0
- **Styling:** Tailwind CSS 3.3.6
- **DXF Parsing:** dxf-parser 1.1.2
- **Code Quality:** ESLint 8.52.0

## Project Structure

```
frontend/
├── public/
│   └── Map2Home.mp4          # Landing page video
├── src/
│   ├── components/           # Reusable Vue components
│   │   ├── Alert.vue         # Alert/notification component
│   │   ├── Button.vue        # Button component
│   │   ├── DxfViewer.vue     # DXF file viewer component
│   │   ├── FeedbackForm.vue  # Feedback submission form
│   │   ├── FeedbackList.vue  # Feedback display list
│   │   ├── Input.vue         # Input field component
│   │   ├── Logo.vue          # Logo component
│   │   ├── Navbar.vue        # Navigation bar component
│   │   ├── ServiceCard.vue   # Service card component
│   │   └── ...
│   ├── pages/                # Page components (routes)
│   │   ├── AdminDashboard.vue      # Admin dashboard
│   │   ├── AdminLogin.vue          # Admin login page
│   │   ├── AdminMaterials.vue      # Material management (admin)
│   │   ├── CompleteMaterialInfo.vue # Material details page
│   │   ├── CostEstimation.vue      # Cost estimation form
│   │   ├── Dashboard.vue           # User dashboard (2D map generation)
│   │   ├── ForgotPassword.vue      # Password reset request
│   │   ├── Landing.vue             # Landing page (legacy)
│   │   ├── LandingPage.vue         # Landing page (legacy)
│   │   ├── Login.vue               # User login page
│   │   ├── MaterialPrices.vue     # Material prices display
│   │   ├── NewLanding.vue         # Main landing page
│   │   ├── PartialMap.vue         # Partial map viewer
│   │   ├── Register.vue           # User registration
│   │   ├── ResetPassword.vue       # Password reset form
│   │   ├── Services.vue           # Services page
│   │   ├── VerifyEmail.vue        # Email verification
│   │   └── icons.js               # Icon definitions
│   ├── router/
│   │   └── index.js              # Vue Router configuration
│   ├── stores/                  # Pinia stores
│   │   ├── authStore.js         # Authentication state management
│   │   └── feedbackStore.js     # Feedback state management
│   ├── App.vue                  # Root component
│   ├── main.js                  # Application entry point
│   └── style.css                # Global styles
├── index.html                   # HTML entry point
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── postcss.config.js           # PostCSS configuration
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the frontend directory (optional):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```
   Output will be in the `dist/` directory

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Application Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `NewLanding.vue` | Landing page |
| `/register` | `Register.vue` | User registration |
| `/login` | `Login.vue` | User login |
| `/forgot-password` | `ForgotPassword.vue` | Password reset request |
| `/reset-password` | `ResetPassword.vue` | Password reset form |
| `/verify-email` | `VerifyEmail.vue` | Email verification |
| `/material-prices` | `MaterialPrices.vue` | Material prices display |

### Protected Routes (User)

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/dashboard` | `Dashboard.vue` | User dashboard (2D map generation) | Yes |
| `/user/design-2d-map` | `Dashboard.vue` | 2D map design interface | Yes |
| `/cost-estimation` | `CostEstimation.vue` | Cost estimation form | Yes |
| `/partial-map` | `PartialMap.vue` | Partial map viewer | Yes |
| `/complete-material-info` | `CompleteMaterialInfo.vue` | Material details | Yes |

### Protected Routes (Admin)

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/admin/login` | `AdminLogin.vue` | Admin login | Guest only |
| `/admin/dashboard` | `AdminDashboard.vue` | Admin dashboard | Yes (Admin) |
| `/admin/materials` | `AdminMaterials.vue` | Material management | Yes (Admin) |

## State Management (Pinia)

### Auth Store (`stores/authStore.js`)

**State:**
- `user` - Current user object
- `token` - JWT authentication token
- `role` - User role ('user' or 'admin')
- `loading` - Loading state
- `error` - Error message

**Computed Properties:**
- `isAuthenticated` - Boolean indicating if user is authenticated
- `isAdmin` - Boolean indicating if user is admin
- `isUser` - Boolean indicating if user is regular user

**Actions:**
- `register(email, password, name)` - Register new user
- `login(email, password)` - User login
- `logout()` - Logout user
- `verifyEmail(token)` - Verify email address
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, password)` - Reset password
- `fetchUser()` - Fetch current user data
- `setToken(token)` - Set authentication token
- `setRole(role)` - Set user role
- `restoreFromStorage()` - Restore auth state from localStorage

**Storage:**
- Token stored in `localStorage` as `auth_token`
- User data stored in `localStorage` as `user`
- Role stored in `localStorage` as `role`

### Feedback Store (`stores/feedbackStore.js`)

**State:**
- `feedbacks` - Array of feedback items
- `loading` - Loading state
- `error` - Error message

**Actions:**
- `fetchFeedbacks()` - Fetch user's feedbacks
- `submitFeedback(feedback)` - Submit new feedback

## API Integration

### Base Configuration

**API URL:** Configured via `VITE_API_URL` environment variable or defaults to `http://localhost:5000/api`

**Location:** `src/stores/authStore.js`
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

### Authentication

**Axios Interceptor:** Token is automatically added to all requests via Axios default headers:
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
```

### API Endpoints Used

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/me` - Get current user

#### Cost Estimation
- `GET /api/cost-estimation/default-data` - Get default cost data
- `POST /api/cost-estimation/calculate` - Calculate construction cost
- `POST /api/cost-estimation/save` - Save cost estimate
- `GET /api/cost-estimation/my-estimates` - Get user's estimates

#### Maps
- `GET /api/maps/` - Get all maps
- `POST /api/maps/generate-2d` - Generate 2D map
- `GET /api/maps/my-maps` - Get user's maps
- `GET /api/maps/dxf/:filename` - Get DXF file

#### Materials
- `GET /api/materials/prices` - Get material prices
- `GET /api/materials/dashboard` - Admin material dashboard
- `POST /api/materials/scrape-prices` - Manually trigger scraping (admin)
- `GET /api/materials/scraping-logs` - Get scraping logs (admin)

#### Feedback
- `POST /api/feedback/add` - Submit feedback
- `GET /api/feedback/my-feedback` - Get user's feedback

## Key Features

### 1. Cost Estimation (`CostEstimation.vue`)

**Features:**
- Plot dimensions input (length, width)
- Covered area hardcoded to 100%
- Room specifications (bedrooms, bathrooms, kitchen, etc.)
- Location selection
- Quality selection (Economy, Standard, Luxury)
- Floor selection
- Real-time cost calculation
- Input validation (prevents negative values)
- Area validation (2-20 marla range)

**Validation:**
- Plot dimensions: 10-1000 feet (no negative values)
- Room counts: Minimum 0 or 1 depending on room type (no negative values)
- Area range: 2-20 marla
- Required fields validation

**Key Functions:**
- `calculateCost()` - Calculate construction cost
- `handleDimensionInput()` - Handle dimension input validation
- `validateDimension()` - Validate dimension on blur
- `validateRooms()` - Validate room specifications
- `handleRoomInput()` - Handle room input validation

### 2. 2D Map Generation (`Dashboard.vue`)

**Features:**
- Dummy input values pre-filled:
  - Length: 30 feet
  - Width: 45 feet
  - Bedrooms: 2
  - Bathrooms: 3
  - Kitchen: 1
  - Drawing Room: 1
  - TV Lounge: 1
  - Garage: 1
  - Other rooms: 0
- DXF file viewer
- Map generation with strict validation (only works with exact dummy inputs)
- Map preview and download

**DXF Viewer:**
- Uses `dxf-parser` library
- Renders DXF files in canvas
- Zoom and pan controls
- Layer visibility toggle

### 3. User Authentication

**Registration Flow:**
1. User fills registration form
2. Client-side validation (email format, password strength)
3. API call to `/api/auth/register`
4. Email verification token sent
5. User verifies email via link

**Login Flow:**
1. User enters credentials
2. API call to `/api/auth/login`
3. Token stored in localStorage
4. User redirected to dashboard

**Password Reset Flow:**
1. User requests reset via `/forgot-password`
2. Reset token sent to email
3. User enters new password via `/reset-password`
4. Password updated

### 4. Material Prices (`MaterialPrices.vue`)

**Features:**
- Display current material prices
- Prices updated every 5 minutes via cron job
- Material categories (Construction, Finishing)
- Price units (bag, ton, piece, truck, sqm, etc.)

### 5. Admin Dashboard (`AdminDashboard.vue`)

**Features:**
- System statistics
- User management
- Material price management
- Scraping logs and statistics
- Manual scraping trigger

## Route Guards

**Location:** `src/router/index.js`

**Guards:**
- `requiresAuth` - Requires authentication token
- `requiresGuest` - Requires user to be logged out
- `roles` - Role-based access control (['user', 'admin'])

**Guard Logic:**
```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Restore token from localStorage if needed
  if (!authStore.token && localStorage.getItem('auth_token')) {
    authStore.restoreFromStorage()
  }
  
  // Check authentication requirements
  if (to.meta.requiresAuth && !authStore.token) {
    next({ name: 'login', query: { redirect: to.path } })
    return
  }
  
  // Check role requirements
  if (to.meta.roles && !to.meta.roles.includes(authStore.role)) {
    next({ name: authStore.isAdmin ? 'admin-materials' : 'dashboard' })
    return
  }
  
  next()
})
```

## Styling

### Tailwind CSS

**Configuration:** `tailwind.config.js`

**Custom Colors:**
- Primary colors for construction theme
- Wood, construction, accent colors

**Usage:**
- Utility-first CSS approach
- Responsive design with breakpoints
- Custom component classes

### Component Styling

**Reusable Components:**
- `Button.vue` - Styled button component
- `Input.vue` - Styled input component
- `Alert.vue` - Alert/notification component

## Form Validation

### Client-Side Validation

**Cost Estimation:**
- Plot dimensions: 10-1000 feet, no negatives
- Room counts: Minimum values enforced, no negatives
- Area validation: 2-20 marla range

**Registration:**
- Email format validation
- Password strength (8+ chars, uppercase, lowercase, number, special char)
- Password match validation

**Login:**
- Email format validation
- Password length validation

### Input Handling

**Real-time Validation:**
- `@input` event handlers for immediate feedback
- `@blur` event handlers for validation on focus loss
- Watchers for reactive validation

**Example:**
```vue
<input
  v-model.number="formData.plotLength"
  type="number"
  min="10"
  max="1000"
  @input="handleDimensionInput('plotLength', $event)"
  @blur="validateDimension('plotLength')"
/>
```

## Error Handling

### API Error Handling

**Axios Interceptors:**
- Automatic token refresh on 401 errors
- Error message display via Alert component
- Redirect to login on authentication errors

### User Feedback

**Alert Component:**
- Success messages (green)
- Error messages (red)
- Warning messages (yellow)
- Info messages (blue)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Development Guidelines

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/router/index.js`
3. Add route guard if needed (`requiresAuth`, `roles`)
4. Update `authPages` in `App.vue` if it's an auth page

### Adding New Components

1. Create component in `src/components/`
2. Import and use in pages
3. Follow Vue 3 Composition API pattern
4. Use Tailwind CSS for styling

### API Integration

1. Use Axios for HTTP requests
2. Token automatically included via Axios defaults
3. Handle errors with try-catch
4. Show user feedback via Alert component

### State Management

1. Use Pinia stores for shared state
2. Keep local state in component for page-specific data
3. Use computed properties for derived state
4. Use watchers for reactive updates

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting via Vue Router lazy loading
- Component lazy loading
- Image optimization
- Build optimization via Vite

## Security Considerations

- JWT tokens stored in localStorage
- HTTPS required in production
- XSS protection via Vue's template escaping
- CSRF protection via token-based auth

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `VITE_API_URL` environment variable
   - Verify backend server is running
   - Check CORS configuration

2. **Authentication Not Working**
   - Check token in localStorage
   - Verify token expiration
   - Check route guards

3. **Build Errors**
   - Clear `node_modules` and reinstall
   - Check Node.js version
   - Verify all dependencies installed

## License

ISC




import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

/*
  Router Index
  - Add routes below in the `routes` array. Each route should include a `name`, `path`, and `component`.
  - To protect a route, add `meta: { requiresAuth: true, roles: ['user'|'admin'] }`.
  - When adding new API-backed pages, create the page under `src/pages/` and follow the
    pattern used by `Dashboard.vue` (async fetch, loading/error states).
  - If you add new routes or API endpoints, update `authPages` in `App.vue` to hide the
    Navbar on authentication-related pages.
*/

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('../pages/NewLanding.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../pages/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../pages/ForgotPassword.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../pages/ResetPassword.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('../pages/VerifyEmail.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/verify',
    name: 'verify',
    component: () => import('../pages/VerifyEmail.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    // Use the generic Dashboard page which fetches required data
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/design-2d-map',
    name: 'design-2d-map',
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/materials'
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../pages/AdminLogin.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('../pages/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/materials',
    name: 'admin-materials',
    component: () => import('../pages/AdminMaterials.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/cost-estimation',
    name: 'cost-estimation',
    component: () => import('../pages/CostEstimation.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/partial-map',
    name: 'partial-map',
    component: () => import('../pages/PartialMap.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/material-prices',
    name: 'material-prices',
    component: () => import('../pages/MaterialPrices.vue')
  },
  {
    path: '/complete-material-info',
    name: 'complete-material-info',
    component: () => import('../pages/CompleteMaterialInfo.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  console.log('=== Router Guard ===')
  console.log('From:', from.name, 'To:', to.name)
  console.log('AuthStore token:', !!authStore.token)
  console.log('AuthStore role:', authStore.role)
  console.log('AuthStore user:', authStore.user)
  console.log('Route meta:', to.meta)

  // If store has no token but localStorage does, restore token so guards use it.
  if (!authStore.token && typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_token')
    if (stored) {
      try {
        console.log('Restoring token from localStorage')
        // restore token and axios header
        authStore.restoreFromStorage()
      } catch (e) {
        console.error('Failed to restore token:', e)
      }
    }
  }

  // If requires guest and already authenticated
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const target = authStore.isAdmin ? 'admin-materials' : 'dashboard'
    console.log('User is authenticated, redirecting to:', target)
    if (to.name !== target) {
      next({ name: target })
      return
    }
    // already heading to the right page; proceed
  }

  // If requires auth
  if (to.meta.requiresAuth) {
    // Prefer a simple token check so navigation works immediately after login
    const hasToken = !!(authStore.token || (typeof window !== 'undefined' && localStorage.getItem('auth_token')))
    console.log('Route requires auth, hasToken:', hasToken)
    
    if (!hasToken) {
      console.log('No token, redirecting to login')
      next({ name: 'login', query: { redirect: to.path } })
      return
    }

    // Check role-based access
    if (to.meta.roles) {
      // Prefer role from store, fallback to localStorage
      const roleValue = authStore.role || (typeof window !== 'undefined' && localStorage.getItem('role'))
      console.log('Required roles:', to.meta.roles, 'User role:', roleValue)

      // If role is known and doesn't match required roles, redirect appropriately
      if (roleValue && !to.meta.roles.includes(roleValue)) {
        const target = roleValue === 'admin' ? 'admin-materials' : 'dashboard'
        console.log('Role mismatch, redirecting to:', target)
        if (to.name !== target) {
          next({ name: target })
          return
        }
        // If target equals current destination, allow navigation to avoid loops
      }

      // If role is not yet known (roleValue falsy) but token exists, allow navigation
      // and let the page fetch user info; this prevents redirect loops while user data loads
    }
  }

  console.log('Allowing navigation to:', to.name)
  next()
})

export default router

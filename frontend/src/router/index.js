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
    component: () => import('../pages/ForgotPassword.vue')
    // No requiresGuest — user may want to reset password while logged in
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../pages/ResetPassword.vue')
    // No requiresGuest — user clicks reset link from email, may be logged in elsewhere
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('../pages/VerifyEmail.vue')
    // No requiresGuest — user may click verification link while logged in elsewhere
  },
  {
    path: '/verify',
    name: 'verify',
    component: () => import('../pages/VerifyEmail.vue')
  },
  {
    path: '/services',
    redirect: '/user/design-2d-map'
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
    path: '/admin/maps',
    name: 'admin-maps',
    component: () => import('../pages/AdminMaps.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/user/working-drawings/:mapId',
    name: 'working-drawings',
    component: () => import('../pages/WorkingDrawings.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
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
    path: '/location-map',
    name: 'location-map',
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

  // Ensure store is in sync with localStorage (e.g. after page refresh)
  if (!authStore.token) {
    authStore.restoreFromStorage()
  }

  // If requires guest and already authenticated, redirect away
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const target = authStore.isAdmin ? 'admin-materials' : 'landing'
    if (to.name !== target) {
      next({ name: target })
      return
    }
  }

  // If requires auth
  if (to.meta.requiresAuth) {
    if (!authStore.token) {
      next({ name: 'login', query: { redirect: to.path } })
      return
    }

    // Check role-based access
    if (to.meta.roles && authStore.role) {
      if (!to.meta.roles.includes(authStore.role)) {
        const target = authStore.role === 'admin' ? 'admin-materials' : 'dashboard'
        if (to.name !== target) {
          next({ name: target })
          return
        }
      }
    }
  }

  next()
})

export default router

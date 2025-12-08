<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-light to-white px-6 py-10 md:py-16">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <!-- Left: Content -->
        <div class="md:col-span-7">
          <div class="animate-slideUp">
            <div class="inline-flex items-center gap-4 mb-6">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-xl">
                <span class="text-3xl text-white font-bold">🏠</span>
              </div>
              <div>
                <div class="accent-pill">New · Featured</div>
              </div>
            </div>

            <h1 class="text-4xl md:text-6xl leading-tight font-extrabold text-dark mb-4">
              Design Smartly,
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Build Beautifully</span>
            </h1>

            <p class="text-lg text-gray-600 mb-6 max-w-xl">Create floor plans, visualize in 3D, and estimate costs — everything you need to plan your dream home.</p>

            <div class="flex flex-wrap gap-4 items-center mb-6">
              <RouterLink to="/register" class="btn-primary">Get Started</RouterLink>
              <RouterLink to="/login" class="btn-secondary">Sign In</RouterLink>
              <a class="text-sm text-gray-600">Explore services · Pricing · Support</a>
            </div>

            <!-- Category chips (visual) -->
            <div class="flex flex-wrap gap-3 mt-6">
              <div class="chip">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">M</div>
                <div class="text-sm">
                  <div class="font-semibold">Map Services</div>
                  <div class="text-xs text-gray-500">Explore high-quality maps</div>
                </div>
              </div>
              <div class="chip">
                <div class="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-bold">C</div>
                <div class="text-sm">
                  <div class="font-semibold">Cost Estimation</div>
                  <div class="text-xs text-gray-500">Quick budgeting tools</div>
                </div>
              </div>
              <div class="chip">
                <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">R</div>
                <div class="text-sm">
                  <div class="font-semibold">Resources</div>
                  <div class="text-xs text-gray-500">Materials & guidance</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Visual -->
        <div class="md:col-span-5 flex justify-center md:justify-end">
          <div class="hero-plate w-full max-w-sm md:max-w-md">
            <div class="flex flex-col items-start gap-4">
              <div class="w-full flex items-center gap-4">
                <div class="hero-image-circle bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
                  📍
                </div>
                <div>
                  <div class="text-sm text-gray-500">Featured Map</div>
                  <div class="font-semibold text-dark">City Center Renovation</div>
                </div>
              </div>

              <div class="w-full grid grid-cols-2 gap-3 mt-2">
                <div class="card p-3 flex flex-col gap-2">
                  <div class="text-sm text-gray-500">Area</div>
                  <div class="font-bold">1200 sq.ft</div>
                </div>
                <div class="card p-3 flex flex-col gap-2">
                  <div class="text-sm text-gray-500">Estimate</div>
                  <div class="font-bold">$4,500</div>
                </div>
              </div>

              <div class="w-full mt-3 flex gap-2">
                <RouterLink to="/dashboard" class="btn-outline flex-1">View Project</RouterLink>
                <RouterLink to="/map/new" class="btn-primary flex-1">Create Map</RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

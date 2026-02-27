<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
    <!-- Header -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-red-600">Map2Home Admin</h1>
          <p class="text-sm text-gray-600">Materials Management</p>
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="scrapePrices"
            :disabled="scraping"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition font-semibold flex items-center gap-2"
          >
            <svg v-if="!scraping" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ scraping ? 'Scraping...' : 'Scrape from CostZone' }}
          </button>
          <button
            @click="exportToCSV"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            {{ adminName }}
          </span>
          <button
            @click="logout"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-12">
      <!-- Alert -->
      <div
        v-if="alert.show"
        :class="[
          'mb-6 p-4 rounded-lg border-l-4 animate-slideUp',
          alert.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <svg v-if="alert.type === 'success'" class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p :class="alert.type === 'success' ? 'text-green-700' : 'text-red-700'" class="font-medium">
              {{ alert.message }}
            </p>
          </div>
          <button @click="alert.show = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Page Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Material Cost Management</h2>
        <p class="text-gray-600">Update material costs for cost estimation calculations</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Materials</p>
              <p class="text-3xl font-bold text-gray-900">{{ materials.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Avg Cost/Unit</p>
              <p class="text-3xl font-bold text-gray-900">Rs {{ formatCurrency(totalMaterialsValue / materials.length || 0) }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Filtered Results</p>
              <p class="text-3xl font-bold text-gray-900">{{ filteredMaterials.length }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Search Input -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Search Materials</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or description..."
                class="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 transition"
              />
              <svg class="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Filter by Category</label>
            <select
              v-model="filterCategory"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 transition"
            >
              <option value="all">All Categories</option>
              <option value="construction">Construction</option>
              <option value="finishing">Finishing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-red-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Loading materials...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h3 class="text-red-800 font-semibold mb-2">Failed to load materials</h3>
        <p class="text-sm text-red-700 mb-4">{{ error }}</p>
        <button @click="fetchMaterials" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
          Retry
        </button>
      </div>

      <!-- Materials Table -->
      <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold">Material Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Category</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Unit</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Current Cost</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">New Cost</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="material in filteredMaterials" :key="material.id" :data-material-id="material.id" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                  <div>
                    <p class="font-semibold text-gray-900">{{ material.name }}</p>
                    <p class="text-xs text-gray-500">{{ material.description }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span 
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      material.category === 'construction' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    ]"
                  >
                    {{ material.category }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-700">{{ material.unit }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span 
                      @dblclick="quickEdit(material)"
                      class="text-lg font-bold text-gray-900 cursor-pointer hover:text-green-600 transition-colors"
                      title="Double-click to edit"
                    >
                      Rs {{ formatCurrency(material.cost_per_unit) }}
                    </span>
                    <span v-if="material.last_scraped_at" class="text-xs text-gray-500" :title="`Last scraped: ${formatDate(material.last_scraped_at)}`">
                      <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="relative">
                    <span class="absolute left-3 top-2.5 text-gray-500 font-semibold">Rs</span>
                    <input
                      v-model.number="material.newCost"
                      type="number"
                      step="0.01"
                      min="0"
                      :placeholder="formatCurrency(material.cost_per_unit)"
                      @keyup.enter="canSaveMaterial(material) ? updateCost(material) : null"
                      @keyup.esc="material.newCost = null"
                      class="w-40 pl-12 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white"
                      :class="{ 'border-green-400 bg-green-50': material.newCost && material.newCost !== material.cost_per_unit }"
                    />
                    <div v-if="material.newCost && material.newCost !== material.cost_per_unit" class="absolute right-2 top-2">
                      <span class="text-xs font-semibold" :class="material.newCost > material.cost_per_unit ? 'text-red-600' : 'text-green-600'">
                        {{ material.newCost > material.cost_per_unit ? '↑' : '↓' }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <button
                    @click="updateCost(material)"
                    :disabled="!canSaveMaterial(material)"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
                    :title="getSaveButtonTitle(material)"
                  >
                    <span v-if="savingId === material.id" class="flex items-center">
                      <svg class="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                    <span v-else class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredMaterials.length === 0 && materials.length > 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h4 class="text-xl font-semibold text-gray-600 mb-2">No Materials Found</h4>
          <p class="text-gray-500 mb-4">No materials match your search criteria</p>
          <button
            @click="searchQuery = ''; filterCategory = 'all'"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>
        <div v-else-if="materials.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h4 class="text-xl font-semibold text-gray-600 mb-2">No Materials Found</h4>
          <p class="text-gray-500">No materials available to manage</p>
        </div>
      </div>

      <!-- Scraping Logs Section -->
      <div class="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white">Scraping Logs</h3>
              <p class="text-sm text-blue-100">View history of automatic price scraping from CostZone.org</p>
            </div>
            <button
              @click="fetchScrapingLogs"
              :disabled="loadingLogs"
              class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <svg v-if="!loadingLogs" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Refresh
            </button>
          </div>
        </div>

        <!-- Scraping Stats -->
        <div v-if="scrapingStats" class="px-6 py-4 bg-gray-50 border-b">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-xs text-gray-600">Last Scraped</p>
              <p class="text-sm font-semibold text-gray-900">{{ formatDate(scrapingStats.lastScrapedAt) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Total Runs</p>
              <p class="text-sm font-semibold text-gray-900">{{ scrapingStats.stats?.total_runs || 0 }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Successful</p>
              <p class="text-sm font-semibold text-green-600">{{ scrapingStats.stats?.successful_runs || 0 }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Failed</p>
              <p class="text-sm font-semibold text-red-600">{{ scrapingStats.stats?.failed_runs || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Logs Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date & Time</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Materials</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Triggered By</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Duration</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Error</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="log in scrapingLogs" :key="log.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ formatDate(log.started_at) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ log.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  <div>
                    <span class="font-semibold">{{ log.total_materials || 0 }}</span> total
                    <span class="text-gray-500">({{ log.materials_updated || 0 }} updated, {{ log.materials_inserted || 0 }} inserted)</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  <div>
                    <span class="font-semibold">{{ log.triggered_by }}</span>
                    <div v-if="log.triggered_by_user_name" class="text-xs text-gray-500">
                      by {{ log.triggered_by_user_name }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ log.execution_time_ms ? `${log.execution_time_ms}ms` : 'N/A' }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span v-if="log.error_message" class="text-red-600 text-xs max-w-xs truncate block" :title="log.error_message">
                    {{ log.error_message }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
              <tr v-if="scrapingLogs.length === 0 && !loadingLogs">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  No scraping logs found
                </td>
              </tr>
              <tr v-if="loadingLogs">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="flex items-center justify-center">
                    <svg class="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="ml-2 text-gray-600">Loading logs...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="logsPagination && logsPagination.totalPages > 1" class="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Page {{ logsPagination.page }} of {{ logsPagination.totalPages }}
          </div>
          <div class="flex gap-2">
            <button
              @click="loadLogsPage(logsPagination.page - 1)"
              :disabled="logsPagination.page <= 1"
              class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="loadLogsPage(logsPagination.page + 1)"
              :disabled="logsPagination.page >= logsPagination.totalPages"
              class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div>
            <h4 class="font-semibold text-blue-900 mb-1">How to Update Material Costs</h4>
            <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li><strong>Quick edit:</strong> Double-click on any current price to quickly edit it</li>
              <li><strong>Enter new price:</strong> Type the new cost in the "New Cost" field for any material</li>
              <li><strong>Save changes:</strong> Click the green "Save" button or press Enter to update the cost</li>
              <li><strong>Cancel edit:</strong> Press Esc to cancel editing</li>
              <li><strong>Immediate effect:</strong> Updated costs will be used immediately in cost estimation calculations</li>
              <li><strong>Currency:</strong> All costs are in Rs (Pakistani Rupees) per unit</li>
              <li><strong>Auto-updates:</strong> Prices are automatically scraped from CostZone.org every 5 minutes</li>
              <li><strong>Manual override:</strong> You can manually set prices anytime, which will override scraped prices</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const materials = ref([])
const loading = ref(true)
const error = ref(null)
const savingId = ref(null)
const scraping = ref(false)
const searchQuery = ref('')
const filterCategory = ref('all')
const alert = ref({
  show: false,
  type: 'success',
  message: ''
})
const scrapingLogs = ref([])
const loadingLogs = ref(false)
const scrapingStats = ref(null)
const logsPagination = ref(null)
const currentLogsPage = ref(1)

const adminName = computed(() => authStore.user?.name || 'Admin')

const filteredMaterials = computed(() => {
  let result = materials.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query)
    )
  }

  // Filter by category
  if (filterCategory.value !== 'all') {
    result = result.filter(m => m.category === filterCategory.value)
  }

  return result
})

const totalMaterialsValue = computed(() => {
  return materials.value.reduce((sum, m) => sum + parseFloat(m.cost_per_unit), 0)
})

const fetchMaterials = async () => {
  loading.value = true
  error.value = null

  console.log('Fetching materials...')
  console.log('AuthStore token:', authStore.token)
  console.log('AuthStore role:', authStore.role)

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    
    console.log('Making request to:', `${apiUrl}/admin/materials`)
    
    const response = await axios.get(`${apiUrl}/admin/materials`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      timeout: 30000 // 30 second timeout
    })

    console.log('Materials response:', response.data)

    if (response.data && response.data.success !== false) {
      // Handle both formats: {success: true, materials: []} and {materials: []}
      const materialsList = response.data.materials || response.data || []
      
      if (Array.isArray(materialsList)) {
        materials.value = materialsList.map(m => ({
          ...m,
          newCost: null,
          cost_per_unit: parseFloat(m.cost_per_unit) || 0 // Ensure it's a number
        }))
        
        console.log('Materials loaded:', materials.value.length)
        error.value = null // Clear any previous errors
      } else {
        console.error('Materials response is not an array:', materialsList)
        materials.value = []
        error.value = 'Invalid response format: materials is not an array'
      }
    } else {
      console.error('Materials response format error:', response.data)
      materials.value = []
      error.value = response.data?.message || 'Invalid response format from server'
    }
  } catch (err) {
    console.error('Materials fetch error:', err)
    console.error('Error response:', err.response)
    console.error('Error details:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      url: err.config?.url
    })
    
    error.value = err.response?.data?.message || err.message || 'Failed to load materials'
    materials.value = [] // Ensure materials is set even on error
    
    // If unauthorized, redirect to admin login
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.log('Unauthorized, redirecting to login')
      authStore.logout()
      router.push({ name: 'admin-login' })
    }
  } finally {
    loading.value = false
    console.log('Fetch materials complete')
  }
}

const scrapePrices = async () => {
  scraping.value = true
  alert.value.show = false

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    
    const response = await axios.post(
      `${apiUrl}/materials/scrape-prices`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    // Show success message
    alert.value = {
      show: true,
      type: 'success',
      message: response.data.message || 'Scraping initiated. Prices will be updated shortly. Refresh the page in a few moments.'
    }

    // Refresh materials and logs after a delay
    setTimeout(() => {
      fetchMaterials()
      fetchScrapingLogs()
      fetchScrapingStats()
    }, 5000)

    // Auto-hide alert after 8 seconds
    setTimeout(() => {
      alert.value.show = false
    }, 8000)
  } catch (err) {
    console.error('Scraping error:', err)
    alert.value = {
      show: true,
      type: 'error',
      message: err.response?.data?.message || 'Failed to initiate scraping. Please try again.'
    }
  } finally {
    scraping.value = false
  }
}

const quickEdit = (material) => {
  // Set newCost to current cost for quick editing (ensure it's a number)
  material.newCost = parseFloat(material.cost_per_unit) || 0
  // Focus the input field after a short delay
  setTimeout(() => {
    const row = document.querySelector(`[data-material-id="${material.id}"]`)
    if (row) {
      const input = row.querySelector('input[type="number"]')
      if (input) {
        input.focus()
        input.select()
      }
    }
  }, 50)
}

const updateCost = async (material) => {
  // Validate using the same logic as canSaveMaterial
  if (!canSaveMaterial(material)) {
    return
  }
  
  // Ensure we have valid numbers
  const newCost = parseFloat(material.newCost)
  const currentCost = parseFloat(material.cost_per_unit)
  
  if (isNaN(newCost) || newCost < 0) {
    alert.value = {
      show: true,
      type: 'error',
      message: 'Please enter a valid price (must be a positive number)'
    }
    return
  }
  
  // Check if actually different
  const difference = Math.abs(newCost - currentCost)
  if (difference < 0.01) {
    alert.value = {
      show: true,
      type: 'error',
      message: 'New price must be different from current price'
    }
    return
  }

  savingId.value = material.id
  alert.value.show = false

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    
    const response = await axios.put(
      `${apiUrl}/admin/materials/cost`,
      {
        materialId: material.id,
        costPerUnit: newCost
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    if (response.data.success) {
      // Update local data
      const oldCost = parseFloat(material.cost_per_unit)
      material.cost_per_unit = newCost
      material.newCost = null

      // Show success message with change indicator
      const change = newCost - oldCost
      const changePercent = ((change / oldCost) * 100).toFixed(1)
      const changeText = change > 0 
        ? `increased by Rs ${formatCurrency(Math.abs(change))} (+${changePercent}%)`
        : `decreased by Rs ${formatCurrency(Math.abs(change))} (${changePercent}%)`
      
      alert.value = {
        show: true,
        type: 'success',
        message: `✅ ${material.name} cost updated successfully! New price: Rs ${formatCurrency(material.cost_per_unit)} (${changeText})`
      }

      // Auto-hide alert after 6 seconds
      setTimeout(() => {
        alert.value.show = false
      }, 6000)
    }
  } catch (err) {
    console.error('Update cost error:', err)
    alert.value = {
      show: true,
      type: 'error',
      message: err.response?.data?.message || 'Failed to update material cost. Please try again.'
    }

    // If unauthorized, redirect to admin login
    if (err.response?.status === 401 || err.response?.status === 403) {
      authStore.logout()
      router.push({ name: 'admin-login' })
    }
  } finally {
    savingId.value = null
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value)
}

const exportToCSV = () => {
  const headers = ['Name', 'Category', 'Unit', 'Cost per Unit', 'Description']
  const rows = filteredMaterials.value.map(m => [
    m.name,
    m.category,
    m.unit,
    m.cost_per_unit,
    m.description || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `materials_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  alert.value = {
    show: true,
    type: 'success',
    message: 'Materials exported to CSV successfully'
  }
  setTimeout(() => { alert.value.show = false }, 3000)
}

const logout = () => {
  authStore.logout()
  router.push({ name: 'admin-login' })
}

const fetchScrapingLogs = async () => {
  loadingLogs.value = true
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    console.log('Fetching scraping logs from:', `${apiUrl}/materials/scraping-logs`)
    
    const response = await axios.get(
      `${apiUrl}/materials/scraping-logs?page=${currentLogsPage.value}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        timeout: 30000 // 30 second timeout
      }
    )
    
    console.log('Scraping logs response:', response.data)
    
    if (response.data.success) {
      scrapingLogs.value = response.data.logs || []
      logsPagination.value = response.data.pagination
    } else {
      console.error('Scraping logs response not successful:', response.data)
      scrapingLogs.value = []
    }
  } catch (err) {
    console.error('Error fetching scraping logs:', err)
    console.error('Error details:', err.response?.data)
    
    // Show error to user
    if (err.response?.status === 401 || err.response?.status === 403) {
      authStore.logout()
      router.push({ name: 'admin-login' })
    } else {
      scrapingLogs.value = []
    }
  } finally {
    loadingLogs.value = false
  }
}

const fetchScrapingStats = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    console.log('Fetching scraping stats from:', `${apiUrl}/materials/scraping-stats`)
    
    const response = await axios.get(
      `${apiUrl}/materials/scraping-stats`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        timeout: 30000 // 30 second timeout
      }
    )
    
    console.log('Scraping stats response:', response.data)
    
    if (response.data.success) {
      scrapingStats.value = response.data
    } else {
      console.error('Scraping stats response not successful:', response.data)
      scrapingStats.value = null
    }
  } catch (err) {
    console.error('Error fetching scraping stats:', err)
    console.error('Error details:', err.response?.data)
    
    // Don't redirect on stats error, just log it
    scrapingStats.value = null
  }
}

const loadLogsPage = (page) => {
  if (page < 1 || (logsPagination.value && page > logsPagination.value.totalPages)) return
  currentLogsPage.value = page
  fetchScrapingLogs()
}

onMounted(async () => {
  // Check if user is admin
  if (!authStore.user || authStore.user.role !== 'admin') {
    router.push({ name: 'admin-login' })
    return
  }

  // Load data sequentially to avoid race conditions
  try {
    await fetchMaterials()
    // Load logs and stats in parallel after materials are loaded
    await Promise.all([
      fetchScrapingLogs(),
      fetchScrapingStats()
    ])
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
})
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
</style>

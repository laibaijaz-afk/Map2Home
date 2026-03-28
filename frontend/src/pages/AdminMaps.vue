<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
    <!-- Header -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-red-600">Map2Home Admin</h1>
          <p class="text-sm text-gray-600">Maps Management</p>
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="showAddModal = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Map
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
          'mb-6 p-4 rounded-lg border-l-4',
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
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Map Management</h2>
        <p class="text-gray-600">Upload DXF maps with plot dimensions (length × width), marla, and floor count so users can find matching plans</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Maps</p>
              <p class="text-3xl font-bold text-gray-900">{{ maps.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Recently Added</p>
              <p class="text-3xl font-bold text-gray-900">{{ recentCount }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">With Marla set</p>
              <p class="text-3xl font-bold text-gray-900">{{ mapsWithMarlaCount }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
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
          <p class="text-gray-600">Loading maps...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h3 class="text-red-800 font-semibold mb-2">Failed to load maps</h3>
        <p class="text-sm text-red-700 mb-4">{{ error }}</p>
        <button @click="fetchMaps" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="maps.length === 0" class="bg-white rounded-xl shadow-lg p-12 text-center">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Maps Uploaded Yet</h3>
        <p class="text-gray-500 mb-6">Click "Add New Map" to upload your first DXF floor plan with room specifications.</p>
        <button @click="showAddModal = true" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
          Add Your First Map
        </button>
      </div>

      <!-- Maps Table -->
      <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Floors</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Plot (ft)</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Marla</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="map in maps" :key="map.id" class="hover:bg-gray-50 transition">
                <td class="px-4 py-3">
                  <div>
                    <p class="font-semibold text-gray-800">{{ map.title }}</p>
                    <p v-if="map.description" class="text-xs text-gray-500 truncate max-w-[200px]">{{ map.description }}</p>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">{{ map.floors?.length || 1 }} floor{{ (map.floors?.length || 1) > 1 ? 's' : '' }}</span>
                </td>
                <td class="px-4 py-3 text-center text-xs text-gray-600">
                  <span v-if="map.plot_length && map.plot_width">{{ map.plot_length }} × {{ map.plot_width }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-center font-medium text-gray-800">
                  <span v-if="map.marla != null && map.marla !== ''">{{ map.marla }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(map.created_at) }}</td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="openEditModal(map)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="confirmDelete(map)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Add / Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="closeModals">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-800">{{ showEditModal ? 'Edit Map' : 'Add New Map' }}</h3>
          <button @click="closeModals" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="showEditModal ? updateMap() : addMap()" class="p-6 space-y-5">
          <!-- Floor count & DXF File Upload (only for Add) -->
          <div v-if="!showEditModal">
            <div class="flex items-center gap-4 mb-3">
              <label class="text-sm font-semibold text-gray-700">Number of Floors</label>
              <input
                type="number" min="1" max="10" :value="form.numFloors"
                @input="updateNumFloors($event.target.value)"
                class="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div class="space-y-3">
              <div v-for="(_, idx) in form.numFloors" :key="idx">
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                  {{ FLOOR_NAMES[idx] || 'Floor ' + idx }} DXF *
                </label>
                <div
                  class="border-2 border-dashed rounded-lg p-4 text-center transition"
                  :class="form.dxfFiles[idx] ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'"
                >
                  <input type="file" accept=".dxf" @change="handleFloorFileSelect($event, idx)" class="hidden" :ref="el => { if (el) floorFileInputs[idx] = el }" />
                  <div v-if="form.dxfFiles[idx]" class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span class="font-medium text-green-700 text-sm">{{ form.dxfFiles[idx].name }}</span>
                    <button type="button" @click="form.dxfFiles[idx] = null" class="text-red-500 hover:text-red-700 ml-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div v-else>
                    <button type="button" @click="floorFileInputs[idx]?.click()" class="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                      Click to upload .dxf for {{ FLOOR_NAMES[idx] || 'Floor ' + idx }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Supporting drawings (optional): Elevation, Working Plan, Electric Plan, Sanitary Plan -->
            <div class="mt-5 pt-4 border-t border-dashed">
              <h4 class="text-sm font-bold text-gray-700 mb-1">Supporting Drawings (optional)</h4>
              <p class="text-xs text-gray-500 mb-3">Upload elevation, working plan, electric, and sanitary drawings in DXF format.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Elevation Drawing -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Elevation Drawing (DXF)</label>
                  <div class="border-2 border-dashed rounded-lg p-4 text-center transition"
                    :class="form.elevationFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'">
                    <input type="file" accept=".dxf" @change="handleExtraFileSelect($event, 'elevationFile')" class="hidden" ref="elevationInput" />
                    <div v-if="form.elevationFile" class="flex items-center justify-center gap-2">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="font-medium text-green-700 text-sm truncate max-w-[140px]">{{ form.elevationFile.name }}</span>
                      <button type="button" @click="form.elevationFile = null" class="text-red-500 hover:text-red-700 ml-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button v-else type="button" @click="elevationInput?.click()" class="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                      Click to upload elevation .dxf
                    </button>
                  </div>
                </div>
                <!-- Working Plan Drawing -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Working Plan (DXF)</label>
                  <div class="border-2 border-dashed rounded-lg p-4 text-center transition"
                    :class="form.workingDrawingFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'">
                    <input type="file" accept=".dxf" @change="handleExtraFileSelect($event, 'workingDrawingFile')" class="hidden" ref="workingInput" />
                    <div v-if="form.workingDrawingFile" class="flex items-center justify-center gap-2">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="font-medium text-green-700 text-sm truncate max-w-[140px]">{{ form.workingDrawingFile.name }}</span>
                      <button type="button" @click="form.workingDrawingFile = null" class="text-red-500 hover:text-red-700 ml-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button v-else type="button" @click="workingInput?.click()" class="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                      Click to upload working plan .dxf
                    </button>
                  </div>
                </div>
                <!-- Electric Plan Drawing -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Electric Plan (DXF)</label>
                  <div class="border-2 border-dashed rounded-lg p-4 text-center transition"
                    :class="form.electricFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'">
                    <input type="file" accept=".dxf" @change="handleExtraFileSelect($event, 'electricFile')" class="hidden" ref="electricInput" />
                    <div v-if="form.electricFile" class="flex items-center justify-center gap-2">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="font-medium text-green-700 text-sm truncate max-w-[140px]">{{ form.electricFile.name }}</span>
                      <button type="button" @click="form.electricFile = null" class="text-red-500 hover:text-red-700 ml-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button v-else type="button" @click="electricInput?.click()" class="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                      Click to upload electric plan .dxf
                    </button>
                  </div>
                </div>
                <!-- Sanitary Plan Drawing -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Sanitary Plan (DXF)</label>
                  <div class="border-2 border-dashed rounded-lg p-4 text-center transition"
                    :class="form.sanitaryFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'">
                    <input type="file" accept=".dxf" @change="handleExtraFileSelect($event, 'sanitaryFile')" class="hidden" ref="sanitaryInput" />
                    <div v-if="form.sanitaryFile" class="flex items-center justify-center gap-2">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="font-medium text-green-700 text-sm truncate max-w-[140px]">{{ form.sanitaryFile.name }}</span>
                      <button type="button" @click="form.sanitaryFile = null" class="text-red-500 hover:text-red-700 ml-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button v-else type="button" @click="sanitaryInput?.click()" class="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                      Click to upload sanitary plan .dxf
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Title & Description -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input v-model="form.title" type="text" required placeholder="e.g. 3 Bed House Plan"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <input v-model="form.description" type="text" placeholder="Optional description"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <!-- Plot size (used for user search: length×width first, then marla) -->
          <div>
            <h4 class="text-sm font-bold text-gray-700 mb-3">Plot specifications *</h4>
            <p class="text-xs text-gray-500 mb-3">Enter the same length × width (feet) and marla you want users to search for. Number of floors is set by how many DXF files you upload above.</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Length (feet) *</label>
                <input v-model.number="form.plot_length" type="number" min="0" step="0.1" required placeholder="e.g. 30"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Width (feet) *</label>
                <input v-model.number="form.plot_width" type="number" min="0" step="0.1" required placeholder="e.g. 45"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Marla *</label>
                <input v-model.number="form.marla" type="number" min="0" step="0.01" required placeholder="e.g. 5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex justify-end gap-3 pt-2 border-t">
            <button type="button" @click="closeModals" class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" :disabled="submitting"
              class="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <svg v-if="submitting" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ showEditModal ? 'Save Changes' : 'Upload Map' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showDeleteModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">Delete Map</h3>
          <p class="text-gray-600 mb-6">Are you sure you want to delete "<strong>{{ deleteTarget?.title }}</strong>"? This will also remove the DXF file. This action cannot be undone.</p>
          <div class="flex gap-3 justify-center">
            <button @click="showDeleteModal = false" class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button @click="deleteMap" :disabled="submitting"
              class="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition"
            >
              {{ submitting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const maps = ref([])
const loading = ref(true)
const error = ref(null)
const submitting = ref(false)

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const editingId = ref(null)

const alert = ref({ show: false, type: 'success', message: '' })

const FLOOR_NAMES = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', '6th Floor', '7th Floor', '8th Floor', '9th Floor']

const defaultForm = () => ({
  title: '',
  description: '',
  dxfFile: null,
  dxfFiles: [null],
  elevationFile: null,
  workingDrawingFile: null,
  electricFile: null,
  sanitaryFile: null,
  numFloors: 1,
  plot_length: null,
  plot_width: null,
  marla: null,
  bedrooms: 0,
  bathrooms: 0,
  kitchen: 0,
  drawing_room: 0,
  dining_room: 0,
  store_room: 0,
  garage: 0,
  servant_quarter: 0,
  tv_lounge: 0
})

const form = ref(defaultForm())
const fileInput = ref(null)
const floorFileInputs = ref([])

const adminName = computed(() => authStore.user?.name || 'Admin')

const recentCount = computed(() => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return maps.value.filter(m => new Date(m.created_at).getTime() > weekAgo).length
})

const mapsWithMarlaCount = computed(() =>
  maps.value.filter(m => m.marla != null && m.marla !== '').length
)

const showAlert = (type, message) => {
  alert.value = { show: true, type, message }
  setTimeout(() => { alert.value.show = false }, 4000)
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const authHeaders = () => ({
  'Authorization': `Bearer ${authStore.token || localStorage.getItem('auth_token')}`
})

const fetchMaps = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${API_URL}/admin/maps`, { headers: authHeaders() })
    const data = await res.json()
    if (data.success) {
      maps.value = data.maps
    } else {
      throw new Error(data.message || 'Failed to fetch maps')
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file && file.name.toLowerCase().endsWith('.dxf')) {
    form.value.dxfFile = file
  } else {
    showAlert('error', 'Only .dxf files are allowed')
  }
}

const handleFloorFileSelect = (e, index) => {
  const file = e.target.files[0]
  if (file && file.name.toLowerCase().endsWith('.dxf')) {
    form.value.dxfFiles[index] = file
  } else {
    showAlert('error', 'Only .dxf files are allowed')
  }
}

// Optional supporting drawings (elevation, working plans)
const handleExtraFileSelect = (e, field) => {
  const file = e.target.files[0]
  if (file && file.name.toLowerCase().endsWith('.dxf')) {
    form.value[field] = file
  } else {
    showAlert('error', 'Only .dxf files are allowed')
  }
}
const elevationInput = ref(null)
const workingInput = ref(null)
const electricInput = ref(null)
const sanitaryInput = ref(null)

const updateNumFloors = (n) => {
  const num = Math.max(1, Math.min(10, parseInt(n) || 1))
  form.value.numFloors = num
  while (form.value.dxfFiles.length < num) form.value.dxfFiles.push(null)
  form.value.dxfFiles.length = num
}

const addMap = async () => {
  const files = form.value.dxfFiles.filter(f => f !== null)
  if (files.length === 0) {
    showAlert('error', 'Please select at least one DXF file')
    return
  }
  for (let i = 0; i < form.value.numFloors; i++) {
    if (!form.value.dxfFiles[i]) {
      showAlert('error', `Please select a DXF file for ${FLOOR_NAMES[i] || 'Floor ' + i}`)
      return
    }
  }
  if (!form.value.title.trim()) {
    showAlert('error', 'Title is required')
    return
  }
  const pl = Number(form.value.plot_length)
  const pw = Number(form.value.plot_width)
  const marla = Number(form.value.marla)
  if (!pl || pl <= 0 || !pw || pw <= 0) {
    showAlert('error', 'Plot length and width (feet) are required')
    return
  }
  if (!Number.isFinite(marla) || marla <= 0) {
    showAlert('error', 'Marla is required and must be greater than zero')
    return
  }

  submitting.value = true
  try {
    const fd = new FormData()
    const floorNames = []
    for (let i = 0; i < form.value.numFloors; i++) {
      fd.append('dxfFiles', form.value.dxfFiles[i])
      floorNames.push(FLOOR_NAMES[i] || `Floor ${i}`)
    }
    fd.append('floor_names', JSON.stringify(floorNames))
    fd.append('title', form.value.title)
    fd.append('description', form.value.description)
    fd.append('room_type', 'house')
    fd.append('plot_length', String(pl))
    fd.append('plot_width', String(pw))
    fd.append('marla', String(marla))
    if (form.value.elevationFile) fd.append('elevationFile', form.value.elevationFile)
    if (form.value.workingDrawingFile) fd.append('workingDrawingFile', form.value.workingDrawingFile)
    if (form.value.electricFile) fd.append('electricFile', form.value.electricFile)
    if (form.value.sanitaryFile) fd.append('sanitaryFile', form.value.sanitaryFile)

    const res = await fetch(`${API_URL}/admin/maps`, {
      method: 'POST',
      headers: authHeaders(),
      body: fd
    })
    const data = await res.json()
    if (data.success) {
      showAlert('success', `Map uploaded successfully (${form.value.numFloors} floor${form.value.numFloors > 1 ? 's' : ''})`)
      closeModals()
      await fetchMaps()
    } else {
      throw new Error(data.message || 'Failed to add map')
    }
  } catch (e) {
    showAlert('error', e.message)
  } finally {
    submitting.value = false
  }
}

const openEditModal = (map) => {
  editingId.value = map.id
  form.value = {
    ...defaultForm(),
    title: map.title,
    description: map.description || '',
    bedrooms: map.bedrooms || 0,
    bathrooms: map.bathrooms || 0,
    kitchen: map.kitchen || 0,
    drawing_room: map.drawing_room || 0,
    dining_room: map.dining_room || 0,
    store_room: map.store_room || 0,
    garage: map.garage || 0,
    servant_quarter: map.servant_quarter || 0,
    tv_lounge: map.tv_lounge || 0,
    plot_length: map.plot_length || null,
    plot_width: map.plot_width || null,
    marla: map.marla != null && map.marla !== '' ? map.marla : null
  }
  showEditModal.value = true
}

const updateMap = async () => {
  const pl = Number(form.value.plot_length)
  const pw = Number(form.value.plot_width)
  const marla = Number(form.value.marla)
  if (!pl || pl <= 0 || !pw || pw <= 0) {
    showAlert('error', 'Plot length and width (feet) are required')
    return
  }
  if (!Number.isFinite(marla) || marla <= 0) {
    showAlert('error', 'Marla is required and must be greater than zero')
    return
  }
  submitting.value = true
  try {
    const body = {
      title: form.value.title,
      description: form.value.description,
      room_type: 'house',
      plot_length: pl,
      plot_width: pw,
      marla,
      bedrooms: form.value.bedrooms || 0,
      bathrooms: form.value.bathrooms || 0,
      kitchen: form.value.kitchen || 0,
      drawing_room: form.value.drawing_room || 0,
      dining_room: form.value.dining_room || 0,
      store_room: form.value.store_room || 0,
      garage: form.value.garage || 0,
      servant_quarter: form.value.servant_quarter || 0,
      tv_lounge: form.value.tv_lounge || 0
    }

    const res = await fetch(`${API_URL}/admin/maps/${editingId.value}`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (data.success) {
      showAlert('success', 'Map updated successfully')
      closeModals()
      await fetchMaps()
    } else {
      throw new Error(data.message || 'Failed to update map')
    }
  } catch (e) {
    showAlert('error', e.message)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (map) => {
  deleteTarget.value = map
  showDeleteModal.value = true
}

const deleteMap = async () => {
  submitting.value = true
  try {
    const res = await fetch(`${API_URL}/admin/maps/${deleteTarget.value.id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    const data = await res.json()
    if (data.success) {
      showAlert('success', 'Map deleted successfully')
      showDeleteModal.value = false
      deleteTarget.value = null
      await fetchMaps()
    } else {
      throw new Error(data.message || 'Failed to delete map')
    }
  } catch (e) {
    showAlert('error', e.message)
  } finally {
    submitting.value = false
  }
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingId.value = null
  form.value = defaultForm()
}

const logout = () => {
  authStore.logout()
  router.push({ name: 'landing' })
}

onMounted(fetchMaps)
</script>

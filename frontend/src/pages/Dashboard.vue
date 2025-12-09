<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-light to-white py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">Welcome back, {{ userName }}!</h1>
        <p class="text-gray-600">Here's your dashboard</p>
      </div>

      <!-- User Profile Section -->
      <div class="glass rounded-3xl p-6 md:p-8 mb-8">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {{ userInitial }}
          </div>
          <div class="flex-1">
            <h3 class="text-2xl md:text-3xl font-extrabold text-gray-900">{{ userName }}</h3>
            <p class="text-gray-600 mb-2">{{ userEmail }}</p>
            <div class="mt-2">
              <span v-if="isVerified" class="inline-flex items-center px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                <svg class="w-4 h-4 mr-1 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Verified
              </span>
            </div>
          </div>
          <div class="mt-4 md:mt-0">
            <RouterLink to="/dashboard" class="btn-outline">Go to Dashboard</RouterLink>
          </div>
        </div>
      </div>

      <!-- Services & Planning Section -->
      <div class="glass rounded-3xl p-6 md:p-8 mb-8">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">Services & Planning</h1>
            <p class="text-gray-600">Manage your property planning, visualization, and cost estimation</p>
          </div>
          <RouterLink to="/" class="btn-primary">View All Services</RouterLink>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-8">
          <div class="flex gap-4 md:gap-8 flex-wrap">
            <button
              @click="activeTab = '2d'"
              :class="[
                'pb-4 px-2 font-medium text-base transition-colors border-b-2',
                activeTab === '2d'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              ]"
            >
              2D Floor Plan
            </button>
            <button
              @click="activeTab = '3d'"
              :class="[
                'pb-4 px-2 font-medium text-base transition-colors border-b-2',
                activeTab === '3d'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              ]"
            >
              3D Visualization
            </button>
            <button
              @click="activeTab = 'studio'"
              :class="[
                'pb-4 px-2 font-medium text-base transition-colors border-b-2 flex items-center gap-2',
                activeTab === 'studio'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Design Studio
              <span class="px-2 py-0.5 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">Live</span>
            </button>
            <button
              @click="activeTab = 'cost'"
              :class="[
                'pb-4 px-2 font-medium text-base transition-colors border-b-2',
                activeTab === 'cost'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              ]"
            >
              Cost Estimation
            </button>
            <button
              @click="activeTab = 'saved'"
              :class="[
                'pb-4 px-2 font-medium text-base transition-colors border-b-2 flex items-center gap-2',
                activeTab === 'saved'
                  ? 'text-emerald-600 border-emerald-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              My Plans
              <span v-if="savedMaps.length > 0" class="px-1.5 py-0.5 text-xs bg-emerald-500 text-white rounded-full min-w-[20px] text-center">{{ savedMaps.length }}</span>
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div>
          <!-- 2D Floor Plan Tab -->
          <div v-if="activeTab === '2d'" class="space-y-6">
            <!-- Show JSON Map Editor (when editing) -->
            <div v-if="isEditingMap" class="max-w-7xl mx-auto space-y-3">
              <!-- Save to My Plans bar -->
              <div class="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-emerald-800 text-sm">Save changes to My Plans</p>
                    <p class="text-xs text-emerald-600 mt-0.5">Your edited plan will be saved to your account and visible next time you log in</p>
                  </div>
                </div>
                <button
                  @click="saveEditedPlanToMyPlans"
                  :disabled="isSavingPlan"
                  class="ml-4 shrink-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow transition-all"
                >
                  <svg v-if="!isSavingPlan" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <svg v-else class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {{ isSavingPlan ? 'Saving…' : 'Save to My Plans' }}
                </button>
              </div>
              <JsonMapEditor
                :map-data="convertedMapData"
                :map-title="selectedMap?.title || 'Floor Plan'"
                :initial-edit-mode="true"
                @close="closeMapEditor"
                @save="handleJsonMapSave"
                @map-loaded="handleJsonMapLoaded"
                @map-changed="handleMapChanged"
              />
            </div>
            
            <!-- Show Form if no map is displayed -->
            <div v-else-if="!showDxfViewer" class="max-w-6xl mx-auto">
              <h2 class="text-3xl font-bold text-gray-800 mb-4 text-center">Find a floor plan</h2>
              <p class="text-center text-gray-600 mb-8 text-sm max-w-xl mx-auto">
                Enter plot length and width (feet), marla, and number of floors. We first match plans with the same plot size; if none are found, we match by marla. Only plans that match your floor count are shown.
              </p>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Form (left 2 cols) -->
                <div class="lg:col-span-2 card rounded-2xl p-6 md:p-8 space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Plot length (feet) *</label>
                      <input
                        v-model.number="roomDimensions.length"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="e.g. 30"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Plot width (feet) *</label>
                      <input
                        v-model.number="roomDimensions.width"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="e.g. 45"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Marla *</label>
                      <input
                        v-model.number="searchMarla"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 5"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        :class="marlaAutoFilled ? 'bg-indigo-50 border-indigo-300' : ''"
                      />
                      <p v-if="marlaAutoFilled" class="text-xs text-indigo-500 mt-1">Auto-calculated from dimensions (1 marla = 272.25 sq ft)</p>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Number of floors *</label>
                      <input
                        v-model.number="searchNumFloors"
                        type="number"
                        min="1"
                        max="20"
                        placeholder="1"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <!-- No map warning -->
                  <div v-if="noMapWarning" class="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p class="text-sm text-amber-700">{{ noMapWarning }}</p>
                  </div>

                  <!-- Generate Maps Button -->
                  <div class="pt-4 border-t">
                    <button
                      @click="generateMaps"
                      :disabled="!canGenerateMaps || generatingMaps"
                      class="w-full btn-primary"
                    >
                      <span v-if="generatingMaps" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Maps...
                      </span>
                      <span v-else>Generate Maps</span>
                    </button>
                  </div>
                </div>

                <!-- Standard Plot Sizes (right panel) -->
                <div class="card rounded-2xl p-5 h-fit">
                  <h3 class="text-base font-bold text-gray-800 mb-1">Standard Plot Sizes</h3>
                  <p class="text-xs text-gray-500 mb-4">Click to auto-fill dimensions</p>
                  <div class="space-y-2">
                    <button
                      v-for="plot in standardPlots"
                      :key="plot.marla + '-' + plot.length"
                      @click="applyStandardPlot(plot)"
                      class="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left group"
                      :class="isActivePlot(plot) ? 'border-indigo-400 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'"
                    >
                      <div>
                        <span class="font-bold text-sm" :class="isActivePlot(plot) ? 'text-indigo-700' : 'text-gray-800 group-hover:text-indigo-700'">{{ plot.marla }} Marla</span>
                        <span v-if="plot.variants" class="text-xs text-gray-400 ml-1">({{ plot.variantLabel }})</span>
                      </div>
                      <span class="text-sm font-mono" :class="isActivePlot(plot) ? 'text-indigo-600' : 'text-gray-500'">{{ plot.length }} x {{ plot.width }} ft</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Show results after form submission -->
            <div v-else-if="showDxfViewer" class="max-w-7xl mx-auto">
              <!-- Loading spinner -->
              <div v-if="generatingMaps" class="flex items-center justify-center py-20">
                <div class="text-center">
                  <svg class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-gray-600">Finding matching floor plans...</p>
                </div>
              </div>

              <!-- Map Selection Grid (when multiple maps and none selected yet) -->
              <div v-else-if="!selectedMap && generatedMaps.length > 0">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h2 class="text-2xl font-bold text-gray-800">Matching Floor Plans</h2>
                    <p class="text-gray-500 text-sm mt-1">{{ generatedMaps.length }} plan(s) found. Click one to view it.</p>
                  </div>
                  <button @click="handleCloseViewer" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Form
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div
                    v-for="map in generatedMaps"
                    :key="map.id"
                    @click="selectMapFromGrid(map)"
                    class="bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-400 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div class="p-5">
                      <div class="flex items-start justify-between mb-3">
                        <div class="flex-1 min-w-0">
                          <h3 class="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition truncate">{{ map.title }}</h3>
                          <span v-if="map.isJsonMap" class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full mt-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                            My Saved Plan
                          </span>
                        </div>
                        <span v-if="map.matchReason" class="text-xs font-semibold px-2 py-1 rounded-full shrink-0 ml-2"
                          :class="map.matchReason === 'dimensions' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'"
                        >
                          {{ map.matchReason === 'dimensions' ? 'Plot size match' : 'Marla match' }}
                        </span>
                      </div>
                      <p v-if="map.description" class="text-sm text-gray-500 mb-4 line-clamp-2">{{ map.description }}</p>

                      <div class="grid grid-cols-2 gap-2 text-center text-sm">
                        <div v-if="map.plot_length && map.plot_width" class="bg-slate-50 rounded-lg p-2">
                          <p class="font-bold text-slate-800">{{ map.plot_length }} × {{ map.plot_width }} ft</p>
                          <p class="text-xs text-slate-500">Plot</p>
                        </div>
                        <div v-if="map.marla != null" class="bg-indigo-50 rounded-lg p-2">
                          <p class="font-bold text-indigo-800">{{ map.marla }}</p>
                          <p class="text-xs text-indigo-600">Marla</p>
                        </div>
                        <div v-if="map.floors?.length" class="bg-purple-50 rounded-lg p-2 col-span-2">
                          <p class="font-bold text-purple-800">{{ map.floors.length }} floor{{ map.floors.length > 1 ? 's' : '' }}</p>
                          <p class="text-xs text-purple-600">{{ map.isJsonMap ? 'Saved plan' : 'DXF files' }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="bg-indigo-50 group-hover:bg-indigo-100 px-5 py-3 text-center rounded-b-xl transition">
                      <span class="text-sm font-semibold text-indigo-600">View Floor Plan</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- DXF Viewer for selected map -->
              <div v-else-if="selectedMap">
                <!-- Back to results button (only if there are multiple maps) -->
                <div v-if="generatedMaps.length > 1" class="mb-4">
                  <button @click="backToResults" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Results ({{ generatedMaps.length }} plans)
                  </button>
                </div>

                <!-- Floor Selector + Complete Working Drawings -->
                <div class="mb-4 flex items-center gap-2 flex-wrap bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                  <template v-if="selectedMapFloors.length > 1">
                    <span class="text-sm font-semibold text-gray-700 mr-2">Floor:</span>
                    <button
                      v-for="(floor, idx) in selectedMapFloors"
                      :key="idx"
                      @click="switchFloor(idx)"
                      :class="[
                        'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                        idx === activeFloorIndex
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-indigo-100 border border-gray-200'
                      ]"
                    >
                      {{ floor.floor_name }}
                    </button>
                  </template>
                  <span v-else class="text-sm font-semibold text-gray-700">Floor plan</span>

                  <!-- Complete Working Drawings (right side) -->
                  <button
                    @click="openWorkingDrawings"
                    class="ml-auto flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Complete Working Drawings
                  </button>
                </div>

                <!-- Action bar: Save to My Plans + Edit Map -->
                <div class="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <!-- Save to My Plans (works even without editing) -->
                  <button
                    @click="saveEditedPlanToMyPlans"
                    :disabled="isSavingPlan || (!convertedMapData && !parsedDxfData)"
                    class="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow transition-all"
                  >
                    <svg v-if="!isSavingPlan" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <svg v-else class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {{ isSavingPlan ? 'Saving…' : 'Save to My Plans' }}
                  </button>

                  <!-- Edit Map -->
                  <div class="flex-1 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl px-4 py-3 border border-amber-200">
                    <div>
                      <p class="font-semibold text-gray-800 text-sm">Want to customize this floor plan?</p>
                      <p class="text-xs text-gray-600">Move furniture, adjust room labels, and modify the layout</p>
                    </div>
                    <button
                      @click="enableMapEditing"
                      :disabled="isConvertingForEdit"
                      :class="isConvertingForEdit ? 'opacity-75 cursor-wait' : ''"
                      class="ml-3 shrink-0 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow transition-all flex items-center gap-2 text-sm"
                    >
                      <div v-if="isConvertingForEdit" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {{ isConvertingForEdit ? 'Preparing…' : 'Edit Map' }}
                    </button>
                  </div>
                </div>
                
                <!-- DxfViewer displays DXF; hidden for JSON maps (they load directly into editor) -->
                <DxfViewer
                  v-if="!isEditingMap && !selectedMap.isJsonMap"
                  :key="'dxf-' + selectedMap.file_path"
                  :dxf-url="selectedMap.file_path"
                  :map-title="selectedMap.title"
                  :map-description="selectedMap.description"
                  @close="handleCloseViewer"
                  @dxf-parsed="handleDxfParsed"
                />
              </div>
            </div>
          </div>

          <!-- 3D Visualization Tab -->
          <div v-if="activeTab === '3d'" class="space-y-6">
            <!-- Show 3D Viewer if map data is available -->
            <div v-if="show3DViewer && convertedMapData" class="max-w-7xl mx-auto space-y-4">
              <div v-if="selectedMapFloors.length > 1" class="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 text-sm text-blue-800">
                <svg class="w-5 h-5 shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This is a {{ selectedMapFloors.length }}-floor plan. Floors are stacked in 3D — use the <strong>Show</strong> buttons in the viewer to view a single floor, or enter <strong>Walk</strong> mode and climb the stairs to go up.</span>
              </div>
              <ThreeDViewer
                :map-data="convertedMapData"
                :floors-data="selectedMapFloors.length > 1 ? floorMapDataList : null"
                :floor-names="selectedMapFloors.length > 1 ? selectedMapFloors.map(f => f.floor_name) : null"
                :map-title="selectedMap?.title || 'Floor Plan'"
                @close="close3DViewer"
              />
            </div>
            
            <!-- Show prompt to generate map first -->
            <div v-else class="max-w-4xl mx-auto">
              <h2 class="text-2xl font-bold text-gray-800 mb-6">3D Visualization</h2>
              
              <div v-if="!parsedDxfData" class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">No Floor Plan Loaded</h3>
                <p class="text-gray-500 mb-6">Generate a 2D floor plan first to view it in 3D</p>
                <button
                  @click="activeTab = '2d'"
                  class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Go to 2D Floor Plan
                </button>
              </div>
              
              <!-- Map available - show button to view in 3D -->
              <div v-else class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200 text-center">
                <svg class="w-20 h-20 mx-auto mb-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Floor Plan Ready for 3D</h3>
                <p class="text-gray-600 mb-6">Your floor plan has been loaded. Click below to view it in interactive 3D.</p>
                
                <button
                  @click="open3DViewer"
                  class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto text-lg"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4" />
                  </svg>
                  Launch 3D Viewer
                </button>
                
                <div class="mt-6 flex items-center justify-center gap-8 text-sm text-gray-500">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Drag to rotate
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Scroll to zoom
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Right-drag to pan
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Design Studio Tab - Split View with Real-time Sync -->
          <div v-if="activeTab === 'studio'" class="space-y-4">
            <!-- Header with sync status -->
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  Design Studio
                  <span class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live Sync Active
                  </span>
                </h2>
                <p class="text-gray-600 text-sm mt-1">Edit in 2D and see changes instantly in 3D - Real-time synchronization</p>
                <p class="text-amber-800 text-xs mt-2 max-w-3xl">
                  3D preview tracks straight wall lines, doors, and windows best. Arcs, dense hatches, and some block inserts may look simplified or omit until redraw.
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span
                  class="px-3 py-1 text-xs rounded-full font-medium"
                  :class="{
                    'bg-gray-100 text-gray-700': sync3DStatus === 'idle',
                    'bg-blue-100 text-blue-700': sync3DStatus === 'syncing',
                    'bg-green-100 text-green-700': sync3DStatus === 'synced',
                    'bg-red-100 text-red-700': sync3DStatus === 'error'
                  }"
                >
                  {{ sync3DStatus === 'syncing' ? 'Syncing 3D API...' : sync3DStatus === 'synced' ? '3D API Synced' : sync3DStatus === 'error' ? '3D API Error' : '3D API Idle' }}
                </span>
                <button
                  @click="studioViewMode = studioViewMode === 'split' ? 'stacked' : 'split'"
                  class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg v-if="studioViewMode === 'split'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {{ studioViewMode === 'split' ? 'Stacked View' : 'Split View' }}
                </button>
              </div>
            </div>
            <p v-if="sync3DStatus === 'error'" class="text-xs text-red-600">{{ sync3DError || '3D service is unavailable. Showing local 3D preview.' }}</p>

            <!-- No map loaded state -->
            <div v-if="!convertedMapData" class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-12 text-center border-2 border-dashed border-indigo-300">
              <svg class="w-20 h-20 mx-auto mb-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              <h3 class="text-2xl font-bold text-gray-800 mb-2">Start Your Design Journey</h3>
              <p class="text-gray-600 mb-6">Generate a floor plan first to use the Design Studio with real-time 2D/3D sync</p>
              <button
                @click="activeTab = '2d'"
                class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Generate Floor Plan
              </button>
            </div>

            <!-- Split/Stacked View when map is loaded -->
            <div v-else class="space-y-4">
              <div v-if="selectedMapFloors.length > 1" class="flex items-center gap-2 flex-wrap bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                <span class="text-sm font-semibold text-gray-700 mr-2">Floor (2D &amp; 3D):</span>
                <button
                  v-for="(floor, idx) in selectedMapFloors"
                  :key="'studio-floor-' + idx"
                  type="button"
                  @click="switchFloor(idx)"
                  :class="[
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                    idx === activeFloorIndex
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-indigo-100 border border-gray-200'
                  ]"
                >
                  {{ floor.floor_name }}
                </button>
              </div>
              <div :class="[
                'gap-4',
                studioViewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2' : 'flex flex-col'
              ]">
              <!-- 2D Editor Panel -->
              <div class="bg-white rounded-xl shadow-lg border-2 border-indigo-200 overflow-hidden">
                <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 flex items-center justify-between">
                  <h3 class="text-white font-semibold flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                    </svg>
                    2D Floor Plan Editor
                  </h3>
                  <span class="text-xs text-indigo-200">Edit walls, doors, windows</span>
                </div>
                <div class="p-2" :style="studioViewMode === 'split' ? 'height: 550px;' : 'height: 500px;'">
                  <JsonMapEditor
                    :map-data="convertedMapData"
                    :map-title="selectedMap?.title || 'Floor Plan'"
                    :initial-edit-mode="true"
                    :compact-mode="true"
                    @close="closeStudio"
                    @save="handleStudioSave"
                    @map-changed="handleMapChanged"
                  />
                </div>
              </div>

              <!-- 3D Viewer Panel -->
              <div class="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 flex items-center justify-between">
                  <h3 class="text-white font-semibold flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    3D Real-time Preview
                  </h3>
                  <span class="text-xs text-purple-200 flex items-center gap-1">
                    <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Synced with 2D
                  </span>
                </div>
                <div class="p-2" :style="studioViewMode === 'split' ? 'height: 550px;' : 'height: 500px;'">
                  <ThreeDViewer
                    :map-data="liveMapData"
                    :map-title="selectedMap?.title || 'Floor Plan'"
                    :compact-mode="true"
                    @close="closeStudio"
                  />
                </div>
              </div>
              </div>
            </div>

            <!-- Feature highlights -->
            <div v-if="convertedMapData" class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                <svg class="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p class="text-sm font-semibold text-blue-800">Real-time Sync</p>
                <p class="text-xs text-blue-600">Changes update instantly</p>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                <svg class="w-8 h-8 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p class="text-sm font-semibold text-purple-800">Walk Through</p>
                <p class="text-xs text-purple-600">Explore in first person</p>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                <svg class="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p class="text-sm font-semibold text-green-800">360° View</p>
                <p class="text-xs text-green-600">Rotate and zoom freely</p>
              </div>
              <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center">
                <svg class="w-8 h-8 mx-auto mb-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p class="text-sm font-semibold text-amber-800">Lighting Modes</p>
                <p class="text-xs text-amber-600">Day, evening, night</p>
              </div>
            </div>
          </div>

          <!-- Cost Estimation Tab -->
          <div v-if="activeTab === 'cost'" class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-800">Cost Estimation</h2>
            <p class="text-sm text-gray-600">
              Figures use the same calculator as the full Estimation page (grey structure, default single floor, standard quality).
              Plot size comes from the selected floor plan when available, otherwise from your requirement dimensions.
            </p>

            <div v-if="dashboardCostEstimate?.ok" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-indigo-50 rounded-lg p-6">
                  <p class="text-sm text-gray-600 mb-1">Grey structure (total)</p>
                  <p class="text-3xl font-bold text-indigo-600 mb-2">Rs {{ formatEst(dashboardCostEstimate.result.greyCost) }}</p>
                  <p class="text-sm text-gray-500">≈ {{ dashboardCostEstimate.result.coveredArea.toFixed(0) }} sq ft covered (all floors)</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-6">
                  <p class="text-sm text-gray-600 mb-1">Finishing (grey-only preset here)</p>
                  <p class="text-3xl font-bold text-purple-600 mb-2">Rs {{ formatEst(dashboardCostEstimate.result.finishingCost) }}</p>
                  <p class="text-sm text-gray-500">Open full estimator for “complete house” finishing.</p>
                </div>
              </div>

              <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <p class="text-lg font-medium mb-1">Estimated total (this tab)</p>
                    <p class="text-sm opacity-90">
                      Plot {{ costPlotLength }} × {{ costPlotWidth }} ft · default city: Lahore · see breakdown on the full page
                    </p>
                  </div>
                  <p class="text-4xl sm:text-5xl font-bold">Rs {{ formatEst(dashboardCostEstimate.result.totalCost) }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <button
                  type="button"
                  @click="downloadDashboardCostSummary"
                  class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Download summary (.txt)
                </button>
                <RouterLink
                  :to="{ name: 'cost-estimation', query: costEstimationLinkQuery }"
                  class="px-6 py-3 border-2 border-indigo-600 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors inline-flex items-center"
                >
                  Open full cost calculator
                </RouterLink>
                <RouterLink
                  to="/material-prices"
                  class="px-6 py-3 border-2 border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center"
                >
                  Material prices
                </RouterLink>
              </div>
            </div>

            <div v-else class="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 text-sm">
              <p class="font-semibold mb-2">Not enough to run an estimate yet</p>
              <p v-if="dashboardCostEstimate?.code === 'dimensions'">
                Select a map with plot dimensions or enter length/width in the 2D tab, then return here.
              </p>
              <p v-else-if="dashboardCostEstimate?.message">{{ dashboardCostEstimate.message }}</p>
              <p v-else>Load a plan or fill requirements and generate maps.</p>
            </div>
          </div>

          <!-- My Plans Tab -->
          <div v-if="activeTab === 'saved'" class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-800">My Saved Plans</h2>
                <p class="text-gray-500 text-sm mt-1">Floor plans you've edited and saved. Open any plan to edit, view in 3D, or use all tools.</p>
              </div>
              <button
                @click="fetchSavedMaps"
                :disabled="savedMapsLoading"
                class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                <svg class="w-4 h-4" :class="savedMapsLoading ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            <!-- Loading -->
            <div v-if="savedMapsLoading" class="flex items-center justify-center py-20">
              <div class="text-center">
                <svg class="animate-spin h-10 w-10 text-emerald-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p class="text-gray-500 text-sm">Loading your plans…</p>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else-if="savedMaps.length === 0" class="border-2 border-dashed border-gray-300 rounded-2xl p-14 text-center bg-gray-50">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 class="text-xl font-semibold text-gray-600 mb-2">No saved plans yet</h3>
              <p class="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Generate a floor plan, edit it in the 2D editor, then click <strong>"Save to My Plans"</strong> to have it appear here.</p>
              <button @click="activeTab = '2d'" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition">
                Go to 2D Floor Plan
              </button>
            </div>

            <!-- Plans Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div
                v-for="plan in savedMaps"
                :key="plan.id"
                class="bg-white rounded-xl border-2 border-gray-200 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all group flex flex-col"
              >
                <!-- Card header -->
                <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 rounded-t-xl">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="text-white font-bold text-base leading-snug line-clamp-2 flex-1">{{ plan.name }}</h3>
                    <span class="shrink-0 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Saved Plan</span>
                  </div>
                  <p class="text-emerald-100 text-xs mt-1">
                    Last edited {{ formatSavedDate(plan.updated_at) }}
                  </p>
                </div>

                <!-- Card body -->
                <div class="p-4 flex-1 space-y-3">
                  <div v-if="plan.description" class="text-sm text-gray-500 line-clamp-2">{{ plan.description }}</div>

                  <div class="grid grid-cols-2 gap-2 text-center text-sm">
                    <div v-if="plan.plot_length && plan.plot_width" class="bg-slate-50 rounded-lg p-2">
                      <p class="font-bold text-slate-800 text-sm">{{ plan.plot_length }} × {{ plan.plot_width }}</p>
                      <p class="text-xs text-slate-500">ft (plot)</p>
                    </div>
                    <div v-if="plan.marla" class="bg-indigo-50 rounded-lg p-2">
                      <p class="font-bold text-indigo-800 text-sm">{{ plan.marla }}</p>
                      <p class="text-xs text-indigo-600">Marla</p>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-2" :class="plan.plot_length ? '' : 'col-span-2'">
                      <p class="font-bold text-purple-800 text-sm">{{ plan.num_floors || 1 }} floor{{ (plan.num_floors || 1) > 1 ? 's' : '' }}</p>
                      <p class="text-xs text-purple-600">Floor plan</p>
                    </div>
                    <div v-if="plan.entity_count" class="bg-amber-50 rounded-lg p-2">
                      <p class="font-bold text-amber-800 text-sm">{{ plan.entity_count }}</p>
                      <p class="text-xs text-amber-600">Entities</p>
                    </div>
                  </div>
                </div>

                <!-- Card actions -->
                <div class="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
                  <!-- Edit -->
                  <button
                    @click="openSavedMap(plan, 'edit')"
                    :disabled="loadingSavedMapId === plan.id"
                    class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition"
                  >
                    <svg v-if="loadingSavedMapId === plan.id" class="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <!-- View 3D -->
                  <button
                    @click="openSavedMap(plan, '3d')"
                    :disabled="loadingSavedMapId === plan.id"
                    class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    View 3D
                  </button>
                  <!-- Delete -->
                  <button
                    @click="deleteSavedMap(plan)"
                    :disabled="deletingMapId === plan.id"
                    class="flex items-center justify-center p-2 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 disabled:opacity-60 rounded-lg transition"
                    title="Delete plan"
                  >
                    <svg v-if="deletingMapId === plan.id" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">Share Your Feedback</h3>
        <FeedbackForm />
        <div class="mt-8">
          <h4 class="text-xl font-semibold text-gray-800 mb-4">Recent Feedback</h4>
          <FeedbackList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import FeedbackForm from '../components/FeedbackForm.vue'
import FeedbackList from '../components/FeedbackList.vue'
import DxfViewer from '../components/DxfViewer.vue'
import JsonMapEditor from '../components/JsonMapEditor.vue'
import ThreeDViewer from '../components/ThreeDViewer.vue'
import { stripDxfTextFormatting } from '../utils/dxfTextUtils'
import { applyLinearScaleToJsonMap, resolveDxfToFeetScale } from '../utils/dxfUnitsToFeet.js'
import { computeConstructionEstimate, formatEstimateCurrency } from '../utils/constructionEstimate'
import { syncFloorPlanTo3D } from '../services/floorPlanTo3DApi'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const activeTab = ref('2d')

watch(() => route.name, (name) => {
  if (name === 'design-2d-map' || name === 'dashboard') {
    activeTab.value = '2d'
  }
})

// Watch for tab changes - auto-convert DXF data when switching to studio or 3d tab;
// also fetch saved maps when user opens the My Plans tab
watch(() => activeTab.value, (newTab) => {
  if ((newTab === 'studio' || newTab === '3d') && parsedDxfData.value && !convertedMapData.value) {
    convertedMapData.value = convertDxfToJson(parsedDxfData.value)
    if (convertedMapData.value) {
      liveMapData.value = JSON.parse(JSON.stringify(convertedMapData.value))
    }
  }
  if (newTab === 'saved' && !savedMapsLoading.value) {
    fetchSavedMaps()
  }
})

// ─── My Plans state ────────────────────────────────────────────────────────────
const savedMaps = ref([])
const savedMapsLoading = ref(false)
const loadingSavedMapId = ref(null)
const deletingMapId = ref(null)

const formatSavedDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const fetchSavedMaps = async () => {
  savedMapsLoading.value = true
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const token = authStore.token || localStorage.getItem('auth_token')
    if (!token) { savedMapsLoading.value = false; return }
    const res = await fetch(`${API_URL}/json-maps`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    let data
    try { data = await res.json() } catch { data = {} }
    if (!res.ok) {
      console.error('[Dashboard] fetchSavedMaps HTTP', res.status, data)
      return
    }
    savedMaps.value = Array.isArray(data.maps) ? data.maps : []
  } catch (e) {
    console.error('[Dashboard] fetchSavedMaps network error:', e)
  } finally {
    savedMapsLoading.value = false
  }
}

const openSavedMap = async (plan, mode = 'edit') => {
  if (loadingSavedMapId.value) return
  loadingSavedMapId.value = plan.id
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const token = authStore.token || localStorage.getItem('auth_token')
    const res = await fetch(`${API_URL}/json-maps/${plan.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!res.ok || !data.map?.map_data) throw new Error(data.message || 'Failed to load plan')

    const clone = JSON.parse(JSON.stringify(data.map.map_data))

    // Set up selectedMap so the editor / save-flow knows which plan this is
    selectedMap.value = {
      id: plan.id,
      title: plan.name,
      description: plan.description || '',
      plot_length: plan.plot_length,
      plot_width: plan.plot_width,
      marla: plan.marla,
      num_floors: plan.num_floors || 1,
      floors: Array(plan.num_floors || 1).fill({}),
      isJsonMap: true,
      source_map_id: plan.source_map_id,
      file_path: null
    }

    convertedMapData.value = clone
    liveMapData.value = JSON.parse(JSON.stringify(clone))
    parsedDxfData.value = null
    savedJsonMapId.value = plan.id
    showDxfViewer.value = true

    if (mode === 'edit') {
      isEditingMap.value = true
      activeTab.value = '2d'
    } else if (mode === '3d') {
      isEditingMap.value = false
      show3DViewer.value = true
      activeTab.value = '3d'
    }
  } catch (e) {
    console.error('[Dashboard] openSavedMap', e)
    alert(e.message || 'Could not load saved plan.')
  } finally {
    loadingSavedMapId.value = null
  }
}

const deleteSavedMap = async (plan) => {
  if (!confirm(`Delete "${plan.name}"? This cannot be undone.`)) return
  deletingMapId.value = plan.id
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const token = authStore.token || localStorage.getItem('auth_token')
    const res = await fetch(`${API_URL}/json-maps/${plan.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error(d.message || 'Delete failed')
    }
    savedMaps.value = savedMaps.value.filter(m => m.id !== plan.id)
    // If the currently loaded map was deleted, clear it
    if (savedJsonMapId.value === plan.id) {
      savedJsonMapId.value = null
      convertedMapData.value = null
      liveMapData.value = null
      selectedMap.value = null
      isEditingMap.value = false
      showDxfViewer.value = false
    }
  } catch (e) {
    console.error('[Dashboard] deleteSavedMap', e)
    alert(e.message || 'Could not delete plan.')
  } finally {
    deletingMapId.value = null
  }
}

// 3D Model settings
const rotation = ref(45)
const zoom = ref(100)
const show3DViewer = ref(false)
const lighting = ref('Studio')

// Map Editor state - integrated into main flow
const isEditingMap = ref(false)
const parsedDxfData = ref(null)
const convertedMapData = ref(null)

// Multi-floor state
const floorMapDataList = ref([])
const activeFloorIndex = ref(0)
const selectedMapFloors = ref([])
const activeDxfUrl = ref(null) // override URL for floor switching
let _switchingFloor = false

// Design Studio state - Split view with real-time sync
const studioViewMode = ref('split') // 'split' or 'stacked'
const liveMapData = ref(null) // Real-time map data for 3D sync
const sync3DStatus = ref('idle') // idle | syncing | synced | error
const sync3DError = ref('')
const latest3DRevision = ref(0)
let sync3DTimer = null

// 2D map search: plot dimensions (ft), marla, floor count (must match admin-stored maps)
const roomDimensions = ref({
  length: null,
  width: null
})
const searchMarla = ref(null)
const searchNumFloors = ref(1)
const marlaAutoFilled = ref(false)
const noMapWarning = ref('')

// Standard Pakistani plot sizes (1 marla = 272.25 sq ft standard)
const standardPlots = [
  { marla: 3,  length: 18, width: 45 },
  { marla: 4,  length: 24, width: 45 },
  { marla: 5,  length: 30, width: 45, variantLabel: 'Option 1', variants: true },
  { marla: 5,  length: 27, width: 50, variantLabel: 'Option 2', variants: true },
  { marla: 7,  length: 35, width: 54 },
  { marla: 10, length: 45, width: 60 },
  { marla: 15, length: 45, width: 90 },
  { marla: 20, length: 54, width: 100 }
]

// Known valid dimension combinations for warning detection
const knownDimensions = standardPlots.map(p => `${p.length}x${p.width}`)

const applyStandardPlot = (plot) => {
  roomDimensions.value.length = plot.length
  roomDimensions.value.width = plot.width
  searchMarla.value = plot.marla
  marlaAutoFilled.value = false
  noMapWarning.value = ''
}

const isActivePlot = (plot) => {
  return Number(roomDimensions.value.length) === plot.length &&
         Number(roomDimensions.value.width) === plot.width
}

// Auto-calculate marla when dimensions change
let _dimWatcherSetting = false
watch([() => roomDimensions.value.length, () => roomDimensions.value.width], ([l, w]) => {
  const length = Number(l)
  const width = Number(w)
  if (!length || !width) {
    noMapWarning.value = ''
    return
  }

  const area = length * width
  const matched = standardPlots.find(p => p.length === length && p.width === width)
  _dimWatcherSetting = true
  if (matched) {
    searchMarla.value = matched.marla
    marlaAutoFilled.value = true
    noMapWarning.value = ''
  } else {
    // Auto-calculate marla from area (1 marla = 272.25 sq ft)
    const calculatedMarla = Math.round((area / 272.25) * 100) / 100
    searchMarla.value = calculatedMarla
    marlaAutoFilled.value = true
    noMapWarning.value = `${length}×${width} ft is not a standard plot size. No floor plans may exist for these dimensions. Try a standard size from the panel on the right.`
  }
  _dimWatcherSetting = false
})

// Clear marlaAutoFilled when user manually types in marla field
watch(searchMarla, () => {
  if (!_dimWatcherSetting) {
    marlaAutoFilled.value = false
  }
})

const generatingMaps = ref(false)
const generatedMaps = ref([])
const showDxfViewer = ref(false)
const selectedMap = ref(null)

const savedJsonMapId = ref(null)

const costPlotLength = computed(() => {
  const m = selectedMap.value
  const fromMap = Number(m?.plot_length)
  if (fromMap > 0) return fromMap
  const l = Number(roomDimensions.value.length)
  return l > 0 ? l : 0
})

const costPlotWidth = computed(() => {
  const m = selectedMap.value
  const fromMap = Number(m?.plot_width)
  if (fromMap > 0) return fromMap
  const w = Number(roomDimensions.value.width)
  return w > 0 ? w : 0
})

const dashboardCostEstimate = computed(() => {
  const pl = costPlotLength.value
  const pw = costPlotWidth.value
  if (!pl || !pw) return { ok: false, code: 'dimensions' }
  const m = selectedMap.value
  const floors = m?.floors?.length || searchNumFloors.value || 1
  return computeConstructionEstimate({
    plotLength: pl,
    plotWidth: pw,
    location: 'lahore',
    constructionType: 'grey',
    floors: Math.max(1, floors),
    quality: 'standard',
    rooms: {
      bedrooms: m?.bedrooms || 0,
      bathrooms: m?.bathrooms || 0,
      kitchen: m?.kitchen || 0,
      drawingRoom: m?.drawing_room || 0,
      diningRoom: m?.dining_room || 0,
      storeRoom: m?.store_room || 0,
      garage: m?.garage || 0,
      servantQuarter: m?.servant_quarter || 0
    }
  })
})

const costEstimationLinkQuery = computed(() => ({
  plotLength: String(costPlotLength.value),
  plotWidth: String(costPlotWidth.value),
  location: 'lahore'
}))

const formatEst = (n) => formatEstimateCurrency(n)

const downloadDashboardCostSummary = () => {
  const est = dashboardCostEstimate.value
  if (!est?.ok) return
  const r = est.result
  const lines = [
    'Map2Home — Cost summary (dashboard tab)',
    `Plot: ${costPlotLength.value} ft x ${costPlotWidth.value} ft`,
    `Grey structure: Rs ${formatEst(r.greyCost)}`,
    `Finishing (this tab preset): Rs ${formatEst(r.finishingCost)}`,
    `Total: Rs ${formatEst(r.totalCost)}`,
    '',
    'Use the full Cost Estimation page for city, floors, quality, and complete-house finishing.',
    `Generated: ${new Date().toISOString()}`
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cost-summary-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// When user selects a different map, clear converted data so DxfViewer loads fresh
watch(() => selectedMap.value?.file_path, (newPath, oldPath) => {
  if (_switchingFloor) return
  if (newPath && newPath !== oldPath) {
    convertedMapData.value = null
    parsedDxfData.value = null
    floorMapDataList.value = []
    activeFloorIndex.value = 0
    activeDxfUrl.value = null
  }
})

watch(() => selectedMap.value?.id, (newId) => {
  savedJsonMapId.value = null
  if (newId) {
    selectedMapFloors.value = selectedMap.value?.floors || []
    activeFloorIndex.value = 0
    loadAllFloorsDxf()
  } else {
    selectedMapFloors.value = []
    floorMapDataList.value = []
  }
})

// Map Editor functions - integrated into the main flow

// Handle parsed DXF data from DxfViewer
const handleDxfParsed = (dxfData) => {
  parsedDxfData.value = dxfData

  // Auto-convert to JSON format for Design Studio and 3D viewer
  const jsonData = convertDxfToJson(dxfData)
  if (jsonData) {
    convertedMapData.value = jsonData
    liveMapData.value = JSON.parse(JSON.stringify(jsonData))
    queue3DSync(jsonData, 'dxf-parsed')

    // Store in floorMapDataList for the active floor
    if (selectedMapFloors.value.length > 0) {
      const list = [...floorMapDataList.value]
      list[activeFloorIndex.value] = jsonData
      floorMapDataList.value = list
    }
  }
}

// Load and parse all floors' DXF files for 3D stacking
const loadAllFloorsDxf = async () => {
  const floors = selectedMapFloors.value
  if (!floors || floors.length <= 1) return

  const token = authStore.token || localStorage.getItem('auth_token')
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const results = new Array(floors.length).fill(null)
  for (let i = 0; i < floors.length; i++) {
    if (floorMapDataList.value[i]) {
      results[i] = floorMapDataList.value[i]
      continue
    }
    try {
      const resp = await fetch(floors[i].file_path, { headers })
      if (!resp.ok) continue
      const text = await resp.text()
      const DxfParserModule = await import('dxf-parser')
      const DxfParser = DxfParserModule.default || DxfParserModule
      const parser = new DxfParser()
      const dxfData = parser.parseSync(text)
      if (dxfData) {
        results[i] = convertDxfToJson(dxfData)
      }
    } catch (e) {
      console.warn(`[Dashboard] Failed to load floor ${i} DXF:`, e)
    }
  }
  // Ground floor is often already parsed by DxfViewer — use it if fetch duplicate failed or skipped
  if (results[0] == null && convertedMapData.value) {
    results[0] = convertedMapData.value
  }
  floorMapDataList.value = results
}

const switchFloor = (index) => {
  if (index === activeFloorIndex.value) return
  activeFloorIndex.value = index
  const floorData = floorMapDataList.value[index]
  if (floorData) {
    convertedMapData.value = floorData
    liveMapData.value = JSON.parse(JSON.stringify(floorData))
  } else {
    convertedMapData.value = null
    parsedDxfData.value = null
  }
  const floors = selectedMapFloors.value
  if (floors[index]) {
    _switchingFloor = true
    activeDxfUrl.value = floors[index].file_path
    selectedMap.value = { ...selectedMap.value, file_path: floors[index].file_path }
    setTimeout(() => { _switchingFloor = false }, 50)
  }
}

// Convert DXF data to JSON format for the editor
const convertDxfToJson = (dxfData) => {
  if (!dxfData || !dxfData.entities) {
    return null
  }

  // Calculate bounds from ALL entities
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  
  dxfData.entities.forEach(entity => {
    const entityType = typeof entity.type === 'string' ? entity.type.split(' ')[0].toUpperCase() : String(entity.type).toUpperCase()
    
    // Handle LINE entities
    if (entityType === 'LINE') {
      // Try different property formats
      const x1 = entity.start?.x ?? entity.vertices?.[0]?.x
      const y1 = entity.start?.y ?? entity.vertices?.[0]?.y
      const x2 = entity.end?.x ?? entity.vertices?.[1]?.x
      const y2 = entity.end?.y ?? entity.vertices?.[1]?.y
      
      if (x1 != null && y1 != null && x2 != null && y2 != null) {
        minX = Math.min(minX, x1, x2)
        minY = Math.min(minY, y1, y2)
        maxX = Math.max(maxX, x1, x2)
        maxY = Math.max(maxY, y1, y2)
      }
    } 
    // Handle POLYLINE/LWPOLYLINE
    else if (entityType === 'POLYLINE' || entityType === 'LWPOLYLINE') {
      const vertices = entity.vertices || []
      vertices.forEach(v => {
        if (v.x != null && v.y != null) {
          minX = Math.min(minX, v.x)
          minY = Math.min(minY, v.y)
          maxX = Math.max(maxX, v.x)
          maxY = Math.max(maxY, v.y)
        }
      })
    } 
    // Handle CIRCLE/ARC
    else if ((entityType === 'CIRCLE' || entityType === 'ARC') && entity.center && entity.radius) {
      const cx = entity.center.x
      const cy = entity.center.y
      const r = entity.radius
      if (cx != null && cy != null && r != null) {
        minX = Math.min(minX, cx - r)
        minY = Math.min(minY, cy - r)
        maxX = Math.max(maxX, cx + r)
        maxY = Math.max(maxY, cy + r)
      }
    }
    // Handle HATCH (boundary paths)
    else if (entityType === 'HATCH' && entity.boundary) {
      const boundaries = Array.isArray(entity.boundary) ? entity.boundary : [entity.boundary]
      boundaries.forEach(boundary => {
        if (boundary.polyline) {
          boundary.polyline.forEach(v => {
            if (v.x != null && v.y != null) {
              minX = Math.min(minX, v.x)
              minY = Math.min(minY, v.y)
              maxX = Math.max(maxX, v.x)
              maxY = Math.max(maxY, v.y)
            }
          })
        }
      })
    }
    // Handle SOLID/3DFACE (3-4 corner points)
    else if ((entityType === 'SOLID' || entityType === '3DFACE') && (entity.points || entity.vertices)) {
      const pts = entity.points || entity.vertices || []
      pts.forEach(p => {
        if (p?.x != null && p?.y != null) {
          minX = Math.min(minX, p.x)
          minY = Math.min(minY, p.y)
          maxX = Math.max(maxX, p.x)
          maxY = Math.max(maxY, p.y)
        }
      })
    }
    // Handle ELLIPSE
    else if (entityType === 'ELLIPSE' && entity.center && entity.majorAxisEndPoint) {
      const mx = entity.majorAxisEndPoint.x || 0
      const my = entity.majorAxisEndPoint.y || 0
      const majorR = Math.sqrt(mx * mx + my * my)
      if (entity.center.x != null && entity.center.y != null) {
        minX = Math.min(minX, entity.center.x - majorR)
        minY = Math.min(minY, entity.center.y - majorR)
        maxX = Math.max(maxX, entity.center.x + majorR)
        maxY = Math.max(maxY, entity.center.y + majorR)
      }
    }
    // Handle SPLINE (control/fit points)
    else if (entityType === 'SPLINE') {
      const pts = entity.fitPoints?.length > 1 ? entity.fitPoints : entity.controlPoints
      if (pts) {
        pts.forEach(p => {
          if (p?.x != null && p?.y != null) {
            minX = Math.min(minX, p.x)
            minY = Math.min(minY, p.y)
            maxX = Math.max(maxX, p.x)
            maxY = Math.max(maxY, p.y)
          }
        })
      }
    }
  })

  // Create JSON structure with more layers
  const jsonData = {
    metadata: {
      name: selectedMap.value?.title || 'Floor Plan',
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Map2Home',
      units: 'feet',
      bounds: { 
        minX: isFinite(minX) ? minX : 0, 
        minY: isFinite(minY) ? minY : 0, 
        maxX: isFinite(maxX) ? maxX : 100, 
        maxY: isFinite(maxY) ? maxY : 100 
      }
    },
    layers: [
      { id: 'walls', name: 'Walls', visible: true, locked: false, color: '#1e293b', lineWidth: 3 },
      { id: 'doors', name: 'Doors', visible: true, locked: false, color: '#dc2626', lineWidth: 2 },
      { id: 'windows', name: 'Windows', visible: true, locked: false, color: '#2563eb', lineWidth: 2 },
      { id: 'stairs', name: 'Stairs', visible: true, locked: false, color: '#059669', lineWidth: 2 },
      { id: 'stair-up', name: 'Stair Start', visible: true, locked: false, color: '#10b981', lineWidth: 2 },
      { id: 'stair-down', name: 'Stair Landing', visible: true, locked: false, color: '#6ee7b7', lineWidth: 2 },
      { id: 'labels', name: 'Labels', visible: true, locked: false, color: '#7c3aed', lineWidth: 1 },
      { id: 'furniture', name: 'Furniture', visible: true, locked: false, color: '#f97316', lineWidth: 2 },
      { id: 'hatch', name: 'Hatches', visible: true, locked: false, color: '#94a3b8', lineWidth: 1 },
      { id: 'other', name: 'Other', visible: true, locked: false, color: '#6b7280', lineWidth: 2 }
    ],
    entities: []
  }

  // Convert DXF entities to JSON entities
  let entityId = 0
  let convertedCounts = { line: 0, arc: 0, text: 0, hatch: 0, solid: 0, ellipse: 0, spline: 0, skipped: 0 }

  const radToDeg = (rad) => (rad != null ? rad * 180 / Math.PI : 0)

  // Classify a DXF layer name + block name into an internal layerId
  const classifyLayer = (rawLayer, rawBlock) => {
    const ln = (rawLayer || '').toLowerCase().trim()
    const bn = (rawBlock || '').toLowerCase()
    const combined = ln + ' ' + bn
    if (ln === '0') {
      return 'walls'
    }
    if (/\bstair\b|stairs|staircase|stairway|stairwell|escalera|treppe|escalier/i.test(combined) ||
        /^a-stair|^ar-stair/i.test(combined)) {
      return 'stairs'
    }
    if (ln === 'up') {
      return 'stair-up'
    }
    if (ln === 'down') {
      return 'stair-down'
    }
    if (/\bwall\b|wall|structure|outline|strc|strct|muro|arwall|proy|partition|enclosure|boundary|\bline\b|\bhatch\b|hatch|fill|patron/i.test(combined) ||
        /^a-wall|^ar-wall|^a-strc|^ar-strc/i.test(combined)) {
      return 'walls'
    } else if (/\bdoor\b|door|entry|puerta|cerr|porta|porte/i.test(combined) ||
        /^a-door|^ar-door/i.test(combined)) {
      return 'doors'
    } else if (/\bwindow\b|window|glass|ventana|glaz|fenetre|janela/i.test(combined) ||
        /^a-wind|^a-glaz|^ar-glass|^wd\b/i.test(combined)) {
      return 'windows'
    } else if (/\btext\b|text|label|dim|annotation|titl|note/i.test(combined) ||
        /^a-anno|^a-dims|^a-titles/i.test(combined)) {
      return 'labels'
    } else if (/\bfurniture\b|furniture|furn|fixture|equip|meuble|mobiliario|chair|desk|table|seat|workstation|reception|counter/i.test(combined) ||
        /toilet|sink|lavatory|sanitary|bathroom|wc\b/i.test(combined) ||
        /^a-furn|^a-equip|^ar-furn|^fn\b/i.test(combined) ||
        /\bfix\b|carpet|sofa|bed|wardrobe|closet|cabinet|shelf|appliance|plumb/i.test(combined)) {
      return 'furniture'
    }
    return 'other'
  }

  // Expand a single entity (any type) into jsonData; transform is an optional {fn, scaleX, scaleY} for INSERT context
  const convertEntity = (entity, parentLayerId, parentLayer, transformCtx, fromBlock, depth) => {
    const entityType = (typeof entity.type === 'string' ? entity.type.split(' ')[0] : String(entity.type || '')).toUpperCase()

    // For block sub-entities: if the sub-entity has its own meaningful layer (not "0"), reclassify
    let layerId = parentLayerId
    const subLayer = (entity.layer || entity.layerName || '').toLowerCase()
    if (subLayer && subLayer !== '0' && subLayer !== parentLayer) {
      const reclassified = classifyLayer(subLayer, '')
      if (reclassified !== 'other') layerId = reclassified
    }

    if (entityType === 'LINE') {
      const x1 = entity.start?.x ?? entity.vertices?.[0]?.x
      const y1 = entity.start?.y ?? entity.vertices?.[0]?.y
      const x2 = entity.end?.x ?? entity.vertices?.[1]?.x
      const y2 = entity.end?.y ?? entity.vertices?.[1]?.y
      if (x1 != null && y1 != null && x2 != null && y2 != null) {
        const p1 = transformCtx ? transformCtx.fn(x1, y1) : { x: x1, y: y1 }
        const p2 = transformCtx ? transformCtx.fn(x2, y2) : { x: x2, y: y2 }
        jsonData.entities.push({ id: `line-${entityId++}`, type: 'line', layerId, start: p1, end: p2, properties: { layer: entity.layer || parentLayer, fromBlock } })
        convertedCounts.line++
      }
    } else if ((entityType === 'POLYLINE' || entityType === 'LWPOLYLINE') && entity.vertices?.length > 1) {
      for (let i = 0; i < entity.vertices.length - 1; i++) {
        const v1 = entity.vertices[i]
        const v2 = entity.vertices[i + 1]
        if (v1.x != null && v1.y != null && v2.x != null && v2.y != null) {
          const p1 = transformCtx ? transformCtx.fn(v1.x, v1.y) : { x: v1.x, y: v1.y }
          const p2 = transformCtx ? transformCtx.fn(v2.x, v2.y) : { x: v2.x, y: v2.y }
          jsonData.entities.push({ id: `line-${entityId++}`, type: 'line', layerId, start: p1, end: p2, properties: { layer: entity.layer || parentLayer, fromPolyline: true, fromBlock } })
          convertedCounts.line++
        }
      }
      const isClosed = entity.closed || entity.shape
      if (isClosed && entity.vertices.length > 2) {
        const vLast = entity.vertices[entity.vertices.length - 1]
        const vFirst = entity.vertices[0]
        if (vLast?.x != null && vLast?.y != null && vFirst?.x != null && vFirst?.y != null) {
          const p1 = transformCtx ? transformCtx.fn(vLast.x, vLast.y) : { x: vLast.x, y: vLast.y }
          const p2 = transformCtx ? transformCtx.fn(vFirst.x, vFirst.y) : { x: vFirst.x, y: vFirst.y }
          jsonData.entities.push({ id: `line-${entityId++}`, type: 'line', layerId, start: p1, end: p2, properties: { layer: entity.layer || parentLayer, fromPolyline: true, closingSegment: true, fromBlock } })
          convertedCounts.line++
        }
      }
    } else if (entityType === 'CIRCLE' && entity.center && entity.radius != null) {
      const c = transformCtx ? transformCtx.fn(entity.center.x, entity.center.y) : { x: entity.center.x, y: entity.center.y }
      const r = transformCtx ? entity.radius * Math.sqrt(Math.abs(transformCtx.scaleX * transformCtx.scaleY)) : entity.radius
      jsonData.entities.push({ id: `circle-${entityId++}`, type: 'arc', layerId, center: c, radius: r, startAngle: 0, endAngle: 360, properties: { layer: entity.layer || parentLayer, isCircle: true, fromBlock } })
      convertedCounts.arc++
    } else if (entityType === 'ARC' && entity.center && entity.radius != null) {
      const c = transformCtx ? transformCtx.fn(entity.center.x, entity.center.y) : { x: entity.center.x, y: entity.center.y }
      const r = transformCtx ? entity.radius * Math.sqrt(Math.abs(transformCtx.scaleX * transformCtx.scaleY)) : entity.radius
      const startDeg = radToDeg(entity.startAngle)
      const endDeg = radToDeg(entity.endAngle)
      jsonData.entities.push({ id: `arc-${entityId++}`, type: 'arc', layerId, center: c, radius: r, startAngle: startDeg, endAngle: endDeg, properties: { layer: entity.layer || parentLayer, fromBlock } })
      convertedCounts.arc++
    } else if (entityType === 'TEXT' || entityType === 'MTEXT') {
      let text = entity.text || entity.string || entity.value || entity.textString || ''
      if (Array.isArray(text)) text = text.join(' ')
      text = stripDxfTextFormatting(String(text))
      let tx = entity.position?.x ?? entity.startPoint?.x ?? entity.insertionPoint?.x ?? entity.point?.x ?? entity.firstAlignmentPoint?.x ?? 0
      let ty = entity.position?.y ?? entity.startPoint?.y ?? entity.insertionPoint?.y ?? entity.point?.y ?? entity.firstAlignmentPoint?.y ?? 0
      if (transformCtx) {
        const tp = transformCtx.fn(tx, ty)
        tx = tp.x; ty = tp.y
      }
      if (text && text.trim()) {
        jsonData.entities.push({
          id: `text-${entityId++}`, type: 'text', layerId: 'labels',
          position: { x: tx, y: ty }, text: text.trim(),
          fontSize: entity.height || entity.textHeight || 100, fontFamily: 'Arial', textAlign: 'center',
          properties: { layer: entity.layer || parentLayer, fromBlock }
        })
        convertedCounts.text++
      }
    } else if (entityType === 'ELLIPSE' && entity.center && entity.majorAxisEndPoint) {
      const cx = entity.center.x
      const cy = entity.center.y
      const mx = entity.majorAxisEndPoint.x
      const my = entity.majorAxisEndPoint.y
      const majorRadius = Math.sqrt(mx * mx + my * my)
      const minorRadius = majorRadius * (entity.axisRatio || 1)
      const segments = Math.max(16, Math.min(64, Math.round(majorRadius * 4)))
      const startAng = entity.startAngle ?? 0
      const endAng = entity.endAngle ?? (Math.PI * 2)
      const rotAngle = Math.atan2(my, mx)
      for (let i = 0; i < segments; i++) {
        const t1 = startAng + (endAng - startAng) * (i / segments)
        const t2 = startAng + (endAng - startAng) * ((i + 1) / segments)
        const x1 = cx + majorRadius * Math.cos(t1) * Math.cos(rotAngle) - minorRadius * Math.sin(t1) * Math.sin(rotAngle)
        const y1 = cy + majorRadius * Math.cos(t1) * Math.sin(rotAngle) + minorRadius * Math.sin(t1) * Math.cos(rotAngle)
        const x2 = cx + majorRadius * Math.cos(t2) * Math.cos(rotAngle) - minorRadius * Math.sin(t2) * Math.sin(rotAngle)
        const y2 = cy + majorRadius * Math.cos(t2) * Math.sin(rotAngle) + minorRadius * Math.sin(t2) * Math.cos(rotAngle)
        const p1 = transformCtx ? transformCtx.fn(x1, y1) : { x: x1, y: y1 }
        const p2 = transformCtx ? transformCtx.fn(x2, y2) : { x: x2, y: y2 }
        jsonData.entities.push({ id: `ellipse-${entityId++}`, type: 'line', layerId, start: p1, end: p2, properties: { layer: entity.layer || parentLayer, fromEllipse: true, fromBlock } })
        convertedCounts.ellipse++
      }
    } else if (entityType === 'SPLINE') {
      const pts = entity.fitPoints?.length > 1 ? entity.fitPoints : entity.controlPoints
      if (pts && pts.length > 1) {
        for (let i = 0; i < pts.length - 1; i++) {
          const v1 = pts[i], v2 = pts[i + 1]
          if (v1.x != null && v1.y != null && v2.x != null && v2.y != null) {
            const p1 = transformCtx ? transformCtx.fn(v1.x, v1.y) : { x: v1.x, y: v1.y }
            const p2 = transformCtx ? transformCtx.fn(v2.x, v2.y) : { x: v2.x, y: v2.y }
            jsonData.entities.push({ id: `spline-${entityId++}`, type: 'line', layerId, start: p1, end: p2, properties: { layer: entity.layer || parentLayer, fromSpline: true, fromBlock } })
            convertedCounts.spline++
          }
        }
        if (entity.closed && pts.length > 2) {
          const vLast = pts[pts.length - 1], vFirst = pts[0]
          if (vLast?.x != null && vFirst?.x != null) {
            const p1 = transformCtx ? transformCtx.fn(vLast.x, vLast.y) : { x: vLast.x, y: vLast.y }
            const p2 = transformCtx ? transformCtx.fn(vFirst.x, vFirst.y) : { x: vFirst.x, y: vFirst.y }
            jsonData.entities.push({ id: `spline-${entityId++}`, type: 'line', layerId, start: p1, end: p2, properties: { layer: entity.layer || parentLayer, fromSpline: true, closingSegment: true, fromBlock } })
            convertedCounts.spline++
          }
        }
      }
    } else if (entityType === 'SOLID' || entityType === '3DFACE') {
      const pts = entity.points || entity.vertices || []
      const validPts = []
      for (let i = 0; i < Math.min(pts.length, 4); i++) {
        if (pts[i]?.x != null && pts[i]?.y != null) validPts.push(pts[i])
      }
      if (validPts.length >= 3) {
        for (let i = 0; i < validPts.length; i++) {
          const v1 = validPts[i]
          const v2 = validPts[(i + 1) % validPts.length]
          const p1 = transformCtx ? transformCtx.fn(v1.x, v1.y) : { x: v1.x, y: v1.y }
          const p2 = transformCtx ? transformCtx.fn(v2.x, v2.y) : { x: v2.x, y: v2.y }
          jsonData.entities.push({ id: `solid-${entityId++}`, type: 'line', layerId, start: p1, end: p2, properties: { layer: entity.layer || parentLayer, fromSolid: true, fromBlock } })
          convertedCounts.solid++
        }
      }
    } else if (entityType === 'HATCH' && entity.boundary) {
      const boundaries = Array.isArray(entity.boundary) ? entity.boundary : [entity.boundary]
      boundaries.forEach(boundary => {
        if (boundary.polyline && boundary.polyline.length > 1) {
          for (let i = 0; i < boundary.polyline.length - 1; i++) {
            const bp1 = boundary.polyline[i]
            const bp2 = boundary.polyline[i + 1]
            if (bp1.x != null && bp1.y != null && bp2.x != null && bp2.y != null) {
              const p1 = transformCtx ? transformCtx.fn(bp1.x, bp1.y) : { x: bp1.x, y: bp1.y }
              const p2 = transformCtx ? transformCtx.fn(bp2.x, bp2.y) : { x: bp2.x, y: bp2.y }
              jsonData.entities.push({ id: `hatch-line-${entityId++}`, type: 'line', layerId, start: p1, end: p2, properties: { layer: entity.layer || parentLayer, fromHatch: true, fromBlock } })
              convertedCounts.hatch++
            }
          }
        }
      })
    } else if (entityType === 'INSERT' && (entity.name || entity.block)) {
      if (depth > 8) return
      const blkName = entity.name || entity.block
      const block = dxfData.blocks?.[blkName]
      const blockEnts = block?.entities || block?.data?.entities || []

      const insX = entity.position?.x ?? entity.insertionPoint?.x ?? 0
      const insY = entity.position?.y ?? entity.insertionPoint?.y ?? 0
      const sX = entity.xScale ?? 1
      const sY = entity.yScale ?? 1
      const rotR = (entity.rotation ?? 0) * Math.PI / 180
      const cosR = Math.cos(rotR), sinR = Math.sin(rotR)

      const innerTransform = (x, y) => {
        const sx = x * sX, sy = y * sY
        const rx = sx * cosR - sy * sinR + insX
        const ry = sx * sinR + sy * cosR + insY
        return transformCtx ? transformCtx.fn(rx, ry) : { x: rx, y: ry }
      }
      const innerScaleX = sX * (transformCtx ? transformCtx.scaleX : 1)
      const innerScaleY = sY * (transformCtx ? transformCtx.scaleY : 1)

      // Reclassify for this INSERT based on its own layer + block name
      let insertLayerId = parentLayerId
      const insLayer = (entity.layer || '').toLowerCase()
      const reclassified = classifyLayer(insLayer, blkName)
      if (reclassified !== 'other') insertLayerId = reclassified
      else if (insLayer && insLayer !== '0' && insLayer !== parentLayer) {
        insertLayerId = reclassified
      }

      blockEnts.forEach(blkEnt => {
        convertEntity(blkEnt, insertLayerId, insLayer || parentLayer, { fn: innerTransform, scaleX: innerScaleX, scaleY: innerScaleY }, blkName, depth + 1)
      })
    } else if (entityType === 'POINT') {
      let px = entity.position?.x ?? entity.x ?? 0
      let py = entity.position?.y ?? entity.y ?? 0
      if (transformCtx) { const tp = transformCtx.fn(px, py); px = tp.x; py = tp.y }
      jsonData.entities.push({ id: `point-${entityId++}`, type: 'point', layerId, position: { x: px, y: py }, properties: { layer: entity.layer || parentLayer, fromBlock } })
    } else {
      convertedCounts.skipped++
    }
  }

  // Log layer distribution for debugging
  const layerDebug = {}
  dxfData.entities.forEach((entity, index) => {
    const entityType = (typeof entity.type === 'string' ? entity.type.split(' ')[0] : String(entity.type || '')).toUpperCase()
    const layerName = (entity.layer || entity.layerName || '').toLowerCase()
    const blockName = (entity.name || entity.block || '').toLowerCase()
    const layerId = classifyLayer(layerName, blockName)
    const key = `${entityType}@${layerName}→${layerId}`
    layerDebug[key] = (layerDebug[key] || 0) + 1
  })

  dxfData.entities.forEach((entity) => {
    const entityType = (typeof entity.type === 'string' ? entity.type.split(' ')[0] : String(entity.type || '')).toUpperCase()
    const layerName = (entity.layer || entity.layerName || '').toLowerCase()
    const blockName = (entity.name || entity.block || '').toLowerCase()
    const layerId = classifyLayer(layerName, blockName)

    // For top-level TEXT/MTEXT, always use 'labels'
    if (entityType === 'TEXT' || entityType === 'MTEXT') {
      convertEntity(entity, 'labels', layerName, null, null, 0)
    } else {
      convertEntity(entity, layerId, layerName, null, null, 0)
    }
  })

  // Recompute bounds from converted entities (handles blocks/INSERT; fixes empty bounds from DXF with only inserts)
  let finalMinX = Infinity, finalMinY = Infinity, finalMaxX = -Infinity, finalMaxY = -Infinity
  jsonData.entities.forEach(e => {
    if (e.type === 'line' && e.start && e.end) {
      finalMinX = Math.min(finalMinX, e.start.x, e.end.x)
      finalMinY = Math.min(finalMinY, e.start.y, e.end.y)
      finalMaxX = Math.max(finalMaxX, e.start.x, e.end.x)
      finalMaxY = Math.max(finalMaxY, e.start.y, e.end.y)
    } else if (e.type === 'arc' && e.center && e.radius != null) {
      const r = e.radius
      finalMinX = Math.min(finalMinX, e.center.x - r)
      finalMinY = Math.min(finalMinY, e.center.y - r)
      finalMaxX = Math.max(finalMaxX, e.center.x + r)
      finalMaxY = Math.max(finalMaxY, e.center.y + r)
    } else if (e.type === 'text' && e.position) {
      finalMinX = Math.min(finalMinX, e.position.x)
      finalMinY = Math.min(finalMinY, e.position.y)
      finalMaxX = Math.max(finalMaxX, e.position.x)
      finalMaxY = Math.max(finalMaxY, e.position.y)
    }
  })
  if (isFinite(finalMinX)) {
    jsonData.metadata.bounds = {
      minX: finalMinX,
      minY: finalMinY,
      maxX: finalMaxX,
      maxY: finalMaxY
    }
  }

  const unitInfo = resolveDxfToFeetScale(dxfData)
  jsonData.metadata.units = 'feet'
  jsonData.metadata.dxfImport = {
    linearToFeet: unitInfo.scale,
    source: unitInfo.source,
    rawUnit: unitInfo.rawUnit,
    ...(unitInfo.maxDimRaw != null ? { maxDimRaw: unitInfo.maxDimRaw } : {})
  }
  applyLinearScaleToJsonMap(jsonData, unitInfo.scale)

  finalMinX = Infinity
  finalMinY = Infinity
  finalMaxX = -Infinity
  finalMaxY = -Infinity
  jsonData.entities.forEach((e) => {
    if (e.type === 'line' && e.start && e.end) {
      finalMinX = Math.min(finalMinX, e.start.x, e.end.x)
      finalMinY = Math.min(finalMinY, e.start.y, e.end.y)
      finalMaxX = Math.max(finalMaxX, e.start.x, e.end.x)
      finalMaxY = Math.max(finalMaxY, e.start.y, e.end.y)
    } else if (e.type === 'arc' && e.center && e.radius != null) {
      const r = e.radius
      finalMinX = Math.min(finalMinX, e.center.x - r)
      finalMinY = Math.min(finalMinY, e.center.y - r)
      finalMaxX = Math.max(finalMaxX, e.center.x + r)
      finalMaxY = Math.max(finalMaxY, e.center.y + r)
    } else if (e.type === 'text' && e.position) {
      finalMinX = Math.min(finalMinX, e.position.x)
      finalMinY = Math.min(finalMinY, e.position.y)
      finalMaxX = Math.max(finalMaxX, e.position.x)
      finalMaxY = Math.max(finalMaxY, e.position.y)
    }
  })
  if (isFinite(finalMinX)) {
    jsonData.metadata.bounds = {
      minX: finalMinX,
      minY: finalMinY,
      maxX: finalMaxX,
      maxY: finalMaxY
    }
  }

  // ─── POST-PROCESS: infer room rect entities from text labels + wall geometry ───
  // Runs AFTER unit scaling so coordinates are already in feet.
  // DXF maps have no explicit rect rooms — we detect them from TEXT/MTEXT labels
  // whose position falls inside a wall-enclosed cell. This enables constraint
  // validation (min size, overlap, circulation) in the editor.
  try {
    const wallLines = jsonData.entities.filter(
      (e) => e.type === 'line' && (e.layerId === 'walls' || e.layerId === 'other') && e.start && e.end
    )
    const textLabels = jsonData.entities.filter((e) => e.type === 'text' && e.position)

    const inferRoomType = (text) => {
      const t = (text || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ')
      if (/\bbed\b|bedroom|master\b|guest\b/.test(t)) return 'bedroom'
      if (/\bliving\b|lounge\b|drawing\b|sitting\b|family\b/.test(t)) return 'living'
      if (/\bkitchen\b|dining\b|pantry\b/.test(t)) return 'kitchen'
      if (/\bbath\b|bathroom\b|washroom\b|toilet\b|\bwc\b|lavatory\b/.test(t)) return 'bathroom'
      if (/\bstair\b|stairs\b|staircase\b/.test(t)) return 'stairs'
      if (/\bcorridor\b|hallway\b|passage\b|lobby\b/.test(t)) return 'corridor'
      if (/\bgarage\b/.test(t)) return 'garage'
      if (/\bstore\b|storage\b/.test(t)) return 'store'
      if (/\bservant\b/.test(t)) return 'servant'
      if (/\btv\b|tv lounge\b/.test(t)) return 'tv_lounge'
      return null
    }

    // Ray-cast from label position to find enclosing wall cell (in feet)
    const inferCellBounds = (px, py, lines) => {
      const pad = 0.25
      const maxRay = 80 // ft — max room dimension
      let leftX = -Infinity, rightX = Infinity, bottomY = -Infinity, topY = Infinity
      for (const ln of lines) {
        const sx = ln.start.x, sy = ln.start.y, ex = ln.end.x, ey = ln.end.y
        const dx = Math.abs(ex - sx), dy = Math.abs(ey - sy)
        const span = Math.max(dx, dy) || 1e-9
        const isVert = dx <= span * 0.15
        const isHoriz = dy <= span * 0.15
        if (isVert && !isHoriz) {
          const xWall = (sx + ex) / 2
          const y0 = Math.min(sy, ey) - pad, y1 = Math.max(sy, ey) + pad
          if (py < y0 || py > y1) continue
          if (xWall < px && px - xWall <= maxRay) leftX = Math.max(leftX, xWall)
          if (xWall > px && xWall - px <= maxRay) rightX = Math.min(rightX, xWall)
        } else if (isHoriz && !isVert) {
          const yWall = (sy + ey) / 2
          const x0 = Math.min(sx, ex) - pad, x1 = Math.max(sx, ex) + pad
          if (px < x0 || px > x1) continue
          if (yWall < py && py - yWall <= maxRay) bottomY = Math.max(bottomY, yWall)
          if (yWall > py && yWall - py <= maxRay) topY = Math.min(topY, yWall)
        }
      }
      if (!isFinite(leftX) || !isFinite(rightX) || !isFinite(bottomY) || !isFinite(topY)) return null
      const w = rightX - leftX, h = topY - bottomY
      // Sanity: room must be at least 2×2 ft and no bigger than 80×80 ft
      if (w < 2 || h < 2 || w > maxRay * 2 || h > maxRay * 2) return null
      return { x: leftX, y: bottomY, width: w, height: h }
    }

    const addedRects = []
    const usedCells = []
    let roomRectId = 0

    for (const txt of textLabels) {
      const roomType = inferRoomType(txt.text || '')
      if (!roomType) continue
      const px = txt.position.x, py = txt.position.y
      const cell = inferCellBounds(px, py, wallLines)
      if (!cell) continue

      // Deduplicate: skip if >60% overlap with an already-added rect
      const isDuplicate = usedCells.some((r) => {
        const ix0 = Math.max(r.x, cell.x), ix1 = Math.min(r.x + r.width, cell.x + cell.width)
        const iy0 = Math.max(r.y, cell.y), iy1 = Math.min(r.y + r.height, cell.y + cell.height)
        const iArea = Math.max(0, ix1 - ix0) * Math.max(0, iy1 - iy0)
        const minArea = Math.min(r.width * r.height, cell.width * cell.height)
        return minArea > 0 && iArea / minArea > 0.6
      })
      if (isDuplicate) continue

      usedCells.push(cell)
      const isCirculation = /stairs|corridor/.test(roomType)
      addedRects.push({
        id: `room-rect-${roomRectId++}`,
        type: 'rect',
        layerId: 'rooms',
        x: cell.x,
        y: cell.y,
        width: cell.width,
        height: cell.height,
        rotation: 0,
        properties: {
          roomType,
          isRoom: true,
          ...(isCirculation ? { isCirculation: true } : {})
        }
      })
    }

    if (addedRects.length > 0) {
      if (!jsonData.layers.find((l) => l.id === 'rooms')) {
        jsonData.layers.push({
          id: 'rooms',
          name: 'Rooms',
          visible: false, // hidden — used for constraint logic only, not rendered
          locked: false,
          color: 'rgba(99,102,241,0.12)',
          lineWidth: 1
        })
      }
      jsonData.entities.push(...addedRects)
    }
  } catch (roomInferErr) {
    console.warn('[Dashboard] Room rect inference failed (non-fatal):', roomInferErr)
  }
  // ─────────────────────────────────────────────────────────────────────────────

  return jsonData
}

const isConvertingForEdit = ref(false)
const isSavingPlan = ref(false)

const saveEditedPlanToMyPlans = async () => {
  if (isSavingPlan.value) return

  // Ensure we have JSON map data — convert from DXF if needed
  if (!convertedMapData.value && parsedDxfData.value) {
    convertedMapData.value = convertDxfToJson(parsedDxfData.value)
    if (convertedMapData.value) {
      liveMapData.value = JSON.parse(JSON.stringify(convertedMapData.value))
    }
  }
  if (!convertedMapData.value) {
    alert('The map is still loading. Please wait a moment and try again.')
    return
  }

  const defaultName = selectedMap.value?.title || convertedMapData.value?.metadata?.name || 'My Floor Plan'
  const planName = window.prompt('Enter a name for this plan:', defaultName)
  if (planName === null) return          // user cancelled
  const trimmed = planName.trim()
  if (!trimmed) { alert('Please enter a name for the plan.'); return }

  isSavingPlan.value = true
  try {
    await persistJsonMap(convertedMapData.value, trimmed)
    await fetchSavedMaps()
    alert(`"${trimmed}" saved to My Plans! You can find it in the My Plans tab.`)
  } catch (e) {
    console.error('[Dashboard] save plan', e)
    alert(e.message || 'Could not save plan.')
  } finally {
    isSavingPlan.value = false
  }
}

// Complete Working Drawings — open the drawing set page for the selected plan
const openWorkingDrawings = () => {
  if (!selectedMap.value) {
    alert('Please select a floor plan first.')
    return
  }
  const map = selectedMap.value
  const query = { title: map.title || 'Floor Plan' }
  if (map.elevation_file) query.elevation = map.elevation_file
  if (map.working_drawing_file) query.working = map.working_drawing_file
  if (map.electric_file) query.electric = map.electric_file
  if (map.sanitary_file) query.sanitary = map.sanitary_file
  router.push({
    name: 'working-drawings',
    params: { mapId: String(map.id ?? 'plan') },
    query
  })
}

const enableMapEditing = async () => {
  if (!parsedDxfData.value && !convertedMapData.value) {
    alert('The drawing is still loading. Please wait until the DXF view appears, then try Edit Map again.')
    return
  }

  // Reuse already-converted/edited data to preserve any previous edits.
  // Only run the expensive DXF conversion when we have no JSON data yet.
  if (convertedMapData.value) {
    liveMapData.value = JSON.parse(JSON.stringify(convertedMapData.value))
    isEditingMap.value = true
    showDxfViewer.value = false
    return
  }

  isConvertingForEdit.value = true
  // Yield to let the browser paint the loading state before heavy work
  await new Promise((r) => setTimeout(r, 50))

  let jsonData
  try {
    jsonData = convertDxfToJson(parsedDxfData.value)
  } catch (e) {
    console.error('[Dashboard] convertDxfToJson', e)
    isConvertingForEdit.value = false
    alert(`Could not convert this DXF for editing: ${e?.message || 'Unknown error'}`)
    return
  }

  if (!jsonData?.entities?.length) {
    isConvertingForEdit.value = false
    alert('This file has no editable entities after conversion. It may be empty or use unsupported geometry.')
    return
  }

  convertedMapData.value = jsonData
  liveMapData.value = JSON.parse(JSON.stringify(jsonData))
  isConvertingForEdit.value = false
  isEditingMap.value = true
  showDxfViewer.value = false
}

const closeMapEditor = async () => {
  // Auto-save edits to backend so the edited map is stored in the system
  if (convertedMapData.value) {
    try {
      await persistJsonMap(convertedMapData.value)
    } catch (e) {
      console.warn('[Dashboard] Auto-save on editor close failed:', e)
    }
  }
  isEditingMap.value = false
  showDxfViewer.value = true
}

// Round every number in a plain JS value to at most `dp` decimal places.
// This strips the 15-digit float precision DXF files carry and can shrink
// payloads by 40-60 % without losing any visible detail.
const roundDeep = (val, dp = 4) => {
  if (typeof val === 'number') return parseFloat(val.toFixed(dp))
  if (Array.isArray(val)) return val.map(v => roundDeep(v, dp))
  if (val !== null && typeof val === 'object') {
    const out = {}
    for (const k of Object.keys(val)) out[k] = roundDeep(val[k], dp)
    return out
  }
  return val
}

const slimMapForStorage = (mapData) => {
  // Deep-clone so we don't mutate the live editor state
  const slim = JSON.parse(JSON.stringify(mapData))

  // Strip DXF-specific 'properties' sub-object from every entity — not needed
  // for editing/display and is the largest source of payload bloat.
  slim.entities = (slim.entities || []).map(({ properties: _drop, ...e }) => roundDeep(e, 4))

  if (slim.metadata) {
    // Keep only fields actually needed; drop raw DXF import blobs
    const { dxfImport: _di, rawDxf: _rd, ...meta } = slim.metadata
    slim.metadata = roundDeep(meta, 4)
  }

  return slim
}

const persistJsonMap = async (mapData, customName) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const token = authStore.token || localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Please log in to save your map.')
  }
  const name = (customName || selectedMap.value?.title || mapData.metadata?.name || 'My floor plan').slice(0, 250)
  const description = (selectedMap.value?.description || '').slice(0, 2000)

  // Attach plot characteristics so saved maps appear in future searches
  const src = selectedMap.value
  const plotPayload = {
    plot_length: src?.plot_length ?? null,
    plot_width: src?.plot_width ?? null,
    marla: src?.marla ?? null,
    num_floors: src?.num_floors ?? (selectedMapFloors.value.length || 1),
    source_map_id: src?.isJsonMap ? (src?.source_map_id ?? null) : (src?.id ?? null)
  }

  // Mirror plot data into metadata so JSON_EXTRACT fallback in getUserMaps always works
  if (!mapData.metadata) mapData.metadata = {}
  mapData.metadata.plotLength = plotPayload.plot_length
  mapData.metadata.plotWidth = plotPayload.plot_width
  mapData.metadata.marla = plotPayload.marla
  mapData.metadata.numFloors = plotPayload.num_floors

  // Slim the payload: round floats to 4 dp — shrinks DXF-derived maps by ~50 %
  const slimData = slimMapForStorage(mapData)

  if (savedJsonMapId.value) {
    const res = await fetch(`${API_URL}/json-maps/${savedJsonMapId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, map_data: slimData, ...plotPayload })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || `Save failed (${res.status})`)
    }
    return savedJsonMapId.value
  }

  const res = await fetch(`${API_URL}/json-maps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, description, map_data: slimData, ...plotPayload })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Save failed (${res.status})`)
  }
  if (data.mapId) {
    savedJsonMapId.value = data.mapId
  }
  return data.mapId
}

const handleJsonMapSave = async (mapData) => {
  try {
    await persistJsonMap(mapData)
    const clone = JSON.parse(JSON.stringify(mapData))
    convertedMapData.value = clone
    liveMapData.value = JSON.parse(JSON.stringify(clone))
    fetchSavedMaps()  // refresh My Plans badge & list
    alert('Map saved to your account.')
  } catch (e) {
    console.error('[Dashboard] save map', e)
    alert(e.message || 'Could not save map.')
  }
}

const handleJsonMapLoaded = (_mapData) => {
}

// Design Studio functions - Real-time sync
const handleMapChanged = (updatedMapData) => {
  const clone = JSON.parse(JSON.stringify(updatedMapData))
  convertedMapData.value = clone  // keep the standalone 3D tab in sync with edits
  liveMapData.value = clone
  queue3DSync(updatedMapData, 'map-edit')
}

const request3DSync = async (mapData, source = 'studio') => {
  const token = authStore.token || localStorage.getItem('auth_token')
  if (!token || !mapData) return

  latest3DRevision.value += 1
  const currentRevision = latest3DRevision.value
  sync3DStatus.value = 'syncing'
  sync3DError.value = ''

  try {
    const response = await syncFloorPlanTo3D({
      mapData,
      token,
      revision: currentRevision,
      source
    })

    // Ignore stale responses to keep the latest edit authoritative.
    if (response.revision !== latest3DRevision.value) return

    if (response?.model?.mapData) {
      liveMapData.value = JSON.parse(JSON.stringify(response.model.mapData))
    }
    sync3DStatus.value = 'synced'
  } catch (error) {
    if (currentRevision !== latest3DRevision.value) return
    sync3DStatus.value = 'error'
    sync3DError.value = error.message || '3D sync failed'
  }
}

const queue3DSync = (mapData, source = 'studio') => {
  if (!mapData) return
  if (sync3DTimer) clearTimeout(sync3DTimer)
  sync3DTimer = setTimeout(() => {
    request3DSync(mapData, source)
  }, 800)
}

onMounted(() => {
  fetchSavedMaps()
})

onUnmounted(() => {
  if (sync3DTimer) clearTimeout(sync3DTimer)
})

const handleStudioSave = async (mapData) => {
  try {
    await persistJsonMap(mapData)
    convertedMapData.value = JSON.parse(JSON.stringify(mapData))
    liveMapData.value = JSON.parse(JSON.stringify(mapData))
    fetchSavedMaps()  // refresh My Plans badge & list
    alert('Design saved to your account.')
  } catch (e) {
    console.error('[Dashboard] studio save', e)
    alert(e.message || 'Could not save design.')
  }
}

const closeStudio = () => {
  // Don't close, just switch to 2D tab
  activeTab.value = '2d'
}

// Initialize live map data when convertedMapData changes
watch(() => convertedMapData.value, (newData) => {
  if (newData && !liveMapData.value) {
    liveMapData.value = JSON.parse(JSON.stringify(newData))
  }
}, { immediate: true })

// 3D Viewer functions
const open3DViewer = async () => {
  if (!parsedDxfData.value) {
    alert('Please generate a floor plan first from the 2D Floor Plan tab.')
    return
  }
  
  // Convert DXF data to JSON format if not already done
  if (!convertedMapData.value) {
    convertedMapData.value = convertDxfToJson(parsedDxfData.value)
  }
  
  if (!convertedMapData.value) {
    alert('Failed to convert map data for 3D view.')
    return
  }

  // Load every floor DXF so floor toggles (2D/3D) have data per floor
  if (selectedMapFloors.value.length > 1) {
    await loadAllFloorsDxf()
    const need = selectedMapFloors.value.length
    const list = floorMapDataList.value.length >= need
      ? [...floorMapDataList.value]
      : [...floorMapDataList.value, ...Array(need - floorMapDataList.value.length).fill(null)]
    if (list[0] == null && convertedMapData.value) list[0] = convertedMapData.value
    while (list.length < need) list.push(null)
    floorMapDataList.value = list.slice(0, need)
  }
  
  show3DViewer.value = true
}

const close3DViewer = () => {
  show3DViewer.value = false
}

// User profile computed properties
const userName = computed(() => authStore.user?.name || 'User')
const userEmail = computed(() => authStore.user?.email || 'user@example.com')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const isVerified = computed(() => authStore.user?.is_verified === 1)

// Check if form can be submitted - for now, just need any input (will be used later for filtering)
const canGenerateMaps = computed(() => {
  const l = Number(roomDimensions.value.length)
  const w = Number(roomDimensions.value.width)
  const marla = Number(searchMarla.value)
  const nf = Number(searchNumFloors.value)
  return (
    Number.isFinite(l) && l > 0 &&
    Number.isFinite(w) && w > 0 &&
    Number.isFinite(marla) && marla > 0 &&
    Number.isFinite(nf) && nf >= 1 && nf <= 20
  )
})

// Generate maps function
const generateMaps = async () => {
  if (!canGenerateMaps.value) {
    return
  }

  generatingMaps.value = true
  generatedMaps.value = []
  noMapWarning.value = ''

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const token = authStore.token || localStorage.getItem('auth_token')

    if (!token) {
      alert('Please login to generate maps.')
      generatingMaps.value = false
      return
    }

    const requestBody = {
      length: Number(roomDimensions.value.length),
      width: Number(roomDimensions.value.width),
      marla: Number(searchMarla.value),
      numFloors: Number(searchNumFloors.value)
    }
    // Send dimensions and room specifications to backend
    const response = await fetch(`${API_URL}/maps/generate-2d`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 401) {
        alert('Please login to generate maps. Your session may have expired.')
        return
      }
      throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Also fetch user's saved (edited) JSON maps that match the same requirements
    let savedJsonMaps = []
    try {
      const searchParams = new URLSearchParams({
        plot_length: requestBody.length,
        plot_width: requestBody.width,
        marla: requestBody.marla,
        num_floors: requestBody.numFloors
      })
      const jsonRes = await fetch(`${API_URL}/json-maps/search?${searchParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (jsonRes.ok) {
        const jsonData = await jsonRes.json()
        savedJsonMaps = (jsonData.maps || []).map(m => ({
          ...m,
          title: m.name,
          floors: Array(m.num_floors || 1).fill({}),
          file_path: null,
          isJsonMap: true
        }))
      }
    } catch (e) {
      console.warn('[generateMaps] Could not fetch saved JSON maps:', e)
    }

    // Store generated maps from backend
    const dxfMaps = (data.success && Array.isArray(data.maps)) ? data.maps : []
    const allMaps = [...dxfMaps, ...savedJsonMaps]

    if (allMaps.length > 0) {
      generatedMaps.value = allMaps
      showDxfViewer.value = true

      // If only one result, select it directly; otherwise show the grid
      if (allMaps.length === 1) {
        selectedMap.value = allMaps[0]
      } else {
        selectedMap.value = null
      }

      setTimeout(() => {
        const viewerElement = document.querySelector('.dxf-viewer-container')
        if (viewerElement) {
          viewerElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else {
      generatedMaps.value = []
      showDxfViewer.value = false
      selectedMap.value = null
      const l = Number(roomDimensions.value.length)
      const w = Number(roomDimensions.value.width)
      noMapWarning.value = `No floor plans found for ${l}×${w} ft, ${searchMarla.value} marla, ${searchNumFloors.value} floor(s). Try a standard plot size from the panel on the right.`
    }
  } catch (error) {
    console.error('[generateMaps] Error:', error)
    generatedMaps.value = []
    let errorMessage = 'Failed to load maps. Please try again.'
    if (error.message === 'Failed to fetch') {
      errorMessage = 'Cannot connect to server. Please check if the backend is running on port 5000.'
    } else if (error.message) {
      errorMessage = error.message
    }
    noMapWarning.value = errorMessage
  } finally {
    generatingMaps.value = false
  }
}

// Select a map from the multi-result grid
const selectMapFromGrid = (map) => {
  selectedMap.value = map

  // JSON maps (user-saved edits) load directly — no DXF parsing needed
  if (map.isJsonMap && map.map_data) {
    const clone = JSON.parse(JSON.stringify(map.map_data))
    convertedMapData.value = clone
    liveMapData.value = JSON.parse(JSON.stringify(clone))
    parsedDxfData.value = null
    isEditingMap.value = true
    savedJsonMapId.value = map.id
  }

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 50)
}

// Go back to the results grid without losing data
const backToResults = () => {
  selectedMap.value = null
  parsedDxfData.value = null
  convertedMapData.value = null
  isEditingMap.value = false
  savedJsonMapId.value = null
}

// Handle closing the DXF viewer
const handleCloseViewer = () => {
  showDxfViewer.value = false
  selectedMap.value = null
  generatedMaps.value = []
  parsedDxfData.value = null
  convertedMapData.value = null
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

// Helper function to format room type for display
const formatRoomType = (roomType) => {
  if (!roomType) return ''
  return roomType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Handle image loading errors
const handleImageError = (event) => {
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  if (parent && !parent.querySelector('.error-placeholder')) {
    const placeholder = document.createElement('div')
    placeholder.className = 'error-placeholder w-full h-full flex items-center justify-center bg-gray-100'
    placeholder.innerHTML = '<p class="text-gray-400 text-sm">Image not found</p>'
    parent.appendChild(placeholder)
  }
}
</script>

<style scoped>
/* Minimal styles - most styling is done via Tailwind classes */
</style>

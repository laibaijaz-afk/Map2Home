<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-light to-white py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {{ userName }}!
        </h1>
        <p class="text-gray-600">Here's your dashboard</p>
      </div>

      <!-- User Profile Section -->
      <div class="glass rounded-3xl p-6 md:p-8 mb-8">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div
            class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg"
          >
            {{ userInitial }}
          </div>
          <div class="flex-1">
            <h3 class="text-2xl md:text-3xl font-extrabold text-gray-900">
              {{ userName }}
            </h3>
            <p class="text-gray-600 mb-2">{{ userEmail }}</p>
            <div class="mt-2">
              <span
                v-if="isVerified"
                class="inline-flex items-center px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium"
              >
                <svg
                  class="w-4 h-4 mr-1 text-accent"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Verified
              </span>
            </div>
          </div>
          <div class="mt-4 md:mt-0">
            <RouterLink to="/dashboard" class="btn-outline"
              >Go to Dashboard</RouterLink
            >
          </div>
        </div>
      </div>

      <!-- Services & Planning Section -->
      <div class="glass rounded-3xl p-6 md:p-8 mb-8">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
              Services & Planning
            </h1>
            <p class="text-gray-600">
              Manage your property planning, visualization, and cost estimation
            </p>
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
                  : 'text-gray-500 border-transparent hover:text-gray-700',
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
                  : 'text-gray-500 border-transparent hover:text-gray-700',
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
                  : 'text-gray-500 border-transparent hover:text-gray-700',
              ]"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
              Design Studio
              <span
                class="px-2 py-0.5 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full"
                >Live</span
              >
            </button>
            <button
              @click="activeTab = 'cost'"
              :class="[
                'pb-4 px-2 font-medium text-base transition-colors border-b-2',
                activeTab === 'cost'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700',
              ]"
            >
              Cost Estimation
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div>
          <!-- 2D Floor Plan Tab -->
          <div v-if="activeTab === '2d'" class="space-y-6">
            <!-- Show JSON Map Editor (when editing) -->
            <div v-if="isEditingMap" class="max-w-7xl mx-auto">
              <JsonMapEditor
                :map-data="convertedMapData"
                :map-title="selectedMap?.title || 'Floor Plan'"
                :initial-edit-mode="true"
                @close="closeMapEditor"
                @save="handleJsonMapSave"
                @map-loaded="handleJsonMapLoaded"
              />
            </div>

            <!-- Show Form if no map is displayed -->
            <div v-else-if="!showDxfViewer" class="max-w-4xl mx-auto">
              <h2 class="text-3xl font-bold text-gray-800 mb-4 text-center">
                Enter Your Requirements
              </h2>
              <p class="text-center text-gray-600 mb-8 text-sm">
                Fill in your room requirements below and click "Generate Maps"
                to find matching floor plans.
              </p>

              <div class="card rounded-2xl p-6 md:p-8 space-y-6">
                <!-- Room Dimensions Section -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Room Length -->
                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                      >Room Length (in feet)
                      <span class="text-gray-400 font-normal"
                        >(optional)</span
                      ></label
                    >
                    <input
                      v-model.number="roomDimensions.length"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Enter length (optional)"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <!-- Room Width -->
                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                      >Room Width (in feet)
                      <span class="text-gray-400 font-normal"
                        >(optional)</span
                      ></label
                    >
                    <input
                      v-model.number="roomDimensions.width"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Enter width (optional)"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <!-- Room Specifications Section -->
                <div class="border-t pt-6">
                  <div class="flex items-center gap-3 mb-6">
                    <div
                      class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"
                    >
                      <svg
                        class="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">
                      Room Specifications
                    </h3>
                  </div>

                  <div
                    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  >
                    <!-- Bedrooms -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        >Bedrooms</label
                      >
                      <input
                        v-model.number="roomSpecifications.bedrooms"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Bathrooms -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        >Bathrooms</label
                      >
                      <input
                        v-model.number="roomSpecifications.bathrooms"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Kitchen -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        >Kitchen</label
                      >
                      <input
                        v-model.number="roomSpecifications.kitchen"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Drawing Room -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        >Drawing Room</label
                      >
                      <input
                        v-model.number="roomSpecifications.drawingRoom"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Dining Room -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        >Dining Room</label
                      >
                      <input
                        v-model.number="roomSpecifications.diningRoom"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Store Room -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        >Store Room</label
                      >
                      <input
                        v-model.number="roomSpecifications.storeRoom"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Garage (Cars) -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        >Garage (Cars)</label
                      >
                      <input
                        v-model.number="roomSpecifications.garage"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Servant Quarter -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        >Servant Quarter</label
                      >
                      <input
                        v-model.number="roomSpecifications.servantQuarter"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- TV Lounge -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        >TV Lounge</label
                      >
                      <input
                        v-model.number="roomSpecifications.tvLounge"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <!-- Generate Maps Button -->
                <div class="pt-4 border-t">
                  <button
                    @click="generateMaps"
                    :disabled="!canGenerateMaps || generatingMaps"
                    class="w-full btn-primary"
                  >
                    <span
                      v-if="generatingMaps"
                      class="flex items-center justify-center gap-2"
                    >
                      <svg
                        class="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating Maps...
                    </span>
                    <span v-else>Generate Maps</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Show results after form submission -->
            <div v-else-if="showDxfViewer" class="max-w-7xl mx-auto">
              <!-- Loading spinner -->
              <div
                v-if="generatingMaps"
                class="flex items-center justify-center py-20"
              >
                <div class="text-center">
                  <svg
                    class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p class="text-gray-600">Finding matching floor plans...</p>
                </div>
              </div>

              <!-- Map Selection Grid (when multiple maps and none selected yet) -->
              <div v-else-if="!selectedMap && generatedMaps.length > 0">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h2 class="text-2xl font-bold text-gray-800">
                      Matching Floor Plans
                    </h2>
                    <p class="text-gray-500 text-sm mt-1">
                      {{ generatedMaps.length }} plan(s) found. Click one to
                      view it.
                    </p>
                  </div>
                  <button
                    @click="handleCloseViewer"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Form
                  </button>
                </div>

                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  <div
                    v-for="map in generatedMaps"
                    :key="map.id"
                    @click="selectMapFromGrid(map)"
                    class="bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-400 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div class="p-5">
                      <div class="flex items-start justify-between mb-3">
                        <h3
                          class="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition"
                        >
                          {{ map.title }}
                        </h3>
                        <span
                          v-if="map.score != null"
                          class="text-xs font-semibold px-2 py-1 rounded-full"
                          :class="
                            map.score >= 4
                              ? 'bg-green-100 text-green-700'
                              : map.score >= 1
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-600'
                          "
                        >
                          {{
                            map.score >= 4
                              ? "Best Match"
                              : map.score >= 1
                                ? "Good Match"
                                : "Partial"
                          }}
                        </span>
                      </div>
                      <p
                        v-if="map.description"
                        class="text-sm text-gray-500 mb-4 line-clamp-2"
                      >
                        {{ map.description }}
                      </p>

                      <div class="grid grid-cols-3 gap-2 text-center">
                        <div
                          v-if="map.bedrooms"
                          class="bg-indigo-50 rounded-lg p-2"
                        >
                          <p class="text-lg font-bold text-indigo-700">
                            {{ map.bedrooms }}
                          </p>
                          <p class="text-xs text-indigo-500">Bed</p>
                        </div>
                        <div
                          v-if="map.bathrooms"
                          class="bg-blue-50 rounded-lg p-2"
                        >
                          <p class="text-lg font-bold text-blue-700">
                            {{ map.bathrooms }}
                          </p>
                          <p class="text-xs text-blue-500">Bath</p>
                        </div>
                        <div
                          v-if="map.kitchen"
                          class="bg-green-50 rounded-lg p-2"
                        >
                          <p class="text-lg font-bold text-green-700">
                            {{ map.kitchen }}
                          </p>
                          <p class="text-xs text-green-500">Kitchen</p>
                        </div>
                        <div
                          v-if="map.drawing_room"
                          class="bg-purple-50 rounded-lg p-2"
                        >
                          <p class="text-lg font-bold text-purple-700">
                            {{ map.drawing_room }}
                          </p>
                          <p class="text-xs text-purple-500">Drawing</p>
                        </div>
                        <div
                          v-if="map.garage"
                          class="bg-amber-50 rounded-lg p-2"
                        >
                          <p class="text-lg font-bold text-amber-700">
                            {{ map.garage }}
                          </p>
                          <p class="text-xs text-amber-500">Garage</p>
                        </div>
                        <div
                          v-if="map.tv_lounge"
                          class="bg-rose-50 rounded-lg p-2"
                        >
                          <p class="text-lg font-bold text-rose-700">
                            {{ map.tv_lounge }}
                          </p>
                          <p class="text-xs text-rose-500">Lounge</p>
                        </div>
                      </div>

                      <div
                        v-if="map.plot_length && map.plot_width"
                        class="mt-3 text-xs text-gray-500 text-center"
                      >
                        Plot: {{ map.plot_length }} x {{ map.plot_width }} ft
                      </div>
                    </div>
                    <div
                      class="bg-indigo-50 group-hover:bg-indigo-100 px-5 py-3 text-center rounded-b-xl transition"
                    >
                      <span class="text-sm font-semibold text-indigo-600"
                        >View Floor Plan</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- DXF Viewer for selected map -->
              <div v-else-if="selectedMap">
                <!-- Back to results button (only if there are multiple maps) -->
                <div v-if="generatedMaps.length > 1" class="mb-4">
                  <button
                    @click="backToResults"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Results ({{ generatedMaps.length }} plans)
                  </button>
                </div>

                <!-- Edit Map Button -->
                <div
                  class="mb-4 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"
                    >
                      <svg
                        class="w-6 h-6 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800">
                        Want to customize this floor plan?
                      </p>
                      <p class="text-sm text-gray-600">
                        Move furniture, adjust room labels, and modify the
                        layout
                      </p>
                    </div>
                  </div>
                  <button
                    @click="enableMapEditing"
                    class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Map
                  </button>
                </div>

                <!-- DxfViewer displays DXF (dxf-viewer WebGL); JsonMapEditor only when editing -->
                <DxfViewer
                  v-show="!isEditingMap"
                  :key="selectedMapViewerKey"
                  :dxf-url="selectedMapViewDxfUrl"
                  :map-title="selectedMap.title"
                  :map-description="selectedMap.description"
                  @close="handleCloseViewer"
                  @dxf-parsed="handleDxfParsed"
                />
                <JsonMapEditor
                  v-if="convertedMapData && isEditingMap"
                  :map-data="convertedMapData"
                  :initial-edit-mode="true"
                  :map-title="selectedMap.title"
                  @close="closeMapEditor"
                  @save="handleJsonMapSave"
                  @map-loaded="handleJsonMapLoaded"
                />
              </div>
            </div>
          </div>

          <!-- 3D Visualization Tab -->
          <div v-if="activeTab === '3d'" class="space-y-6">
            <!-- Show 3D Viewer if map data is available -->
            <div
              v-if="show3DViewer && convertedMapData"
              class="max-w-7xl mx-auto"
            >
              <ThreeDViewer
                :map-data="convertedMapData"
                :map-title="selectedMap?.title || 'Floor Plan'"
                @close="close3DViewer"
              />
            </div>

            <!-- Show prompt to generate map first -->
            <div v-else class="max-w-4xl mx-auto">
              <h2 class="text-2xl font-bold text-gray-800 mb-6">
                3D Visualization
              </h2>

              <div
                v-if="!parsedDxfData"
                class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50"
              >
                <svg
                  class="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">
                  No Floor Plan Loaded
                </h3>
                <p class="text-gray-500 mb-6">
                  Generate a 2D floor plan first to view it in 3D
                </p>
                <button
                  @click="activeTab = '2d'"
                  class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Go to 2D Floor Plan
                </button>
              </div>

              <!-- Map available - show button to view in 3D -->
              <div
                v-else
                class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200 text-center"
              >
                <svg
                  class="w-20 h-20 mx-auto mb-4 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">
                  Floor Plan Ready for 3D
                </h3>
                <p class="text-gray-600 mb-6">
                  Your floor plan has been loaded. Click below to view it in
                  interactive 3D.
                </p>

                <button
                  @click="open3DViewer"
                  class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto text-lg"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4"
                    />
                  </svg>
                  Launch 3D Viewer
                </button>

                <div
                  class="mt-6 flex items-center justify-center gap-8 text-sm text-gray-500"
                >
                  <div class="flex items-center gap-2">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                    Drag to rotate
                  </div>
                  <div class="flex items-center gap-2">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                    Scroll to zoom
                  </div>
                  <div class="flex items-center gap-2">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
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
                <h2
                  class="text-2xl font-bold text-gray-800 flex items-center gap-3"
                >
                  Design Studio
                  <span
                    class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full flex items-center gap-1"
                  >
                    <span
                      class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                    ></span>
                    Live Sync Active
                  </span>
                </h2>
                <p class="text-gray-600 text-sm mt-1">
                  Edit in 2D and see changes instantly in 3D - Real-time
                  synchronization
                </p>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="
                    studioViewMode =
                      studioViewMode === 'split' ? 'stacked' : 'split'
                  "
                  class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg
                    v-if="studioViewMode === 'split'"
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {{
                    studioViewMode === "split" ? "Stacked View" : "Split View"
                  }}
                </button>
              </div>
            </div>

            <!-- No map loaded state -->
            <div
              v-if="!convertedMapData"
              class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-12 text-center border-2 border-dashed border-indigo-300"
            >
              <svg
                class="w-20 h-20 mx-auto mb-4 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
                />
              </svg>
              <h3 class="text-2xl font-bold text-gray-800 mb-2">
                Start Your Design Journey
              </h3>
              <p class="text-gray-600 mb-6">
                Generate a floor plan first to use the Design Studio with
                real-time 2D/3D sync
              </p>
              <button
                @click="activeTab = '2d'"
                class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Generate Floor Plan
              </button>
            </div>

            <!-- Split/Stacked View when map is loaded -->
            <div
              v-else
              :class="[
                'gap-4',
                studioViewMode === 'split'
                  ? 'grid grid-cols-1 lg:grid-cols-2'
                  : 'flex flex-col',
              ]"
            >
              <!-- 2D Editor Panel -->
              <div
                class="bg-white rounded-xl shadow-lg border-2 border-indigo-200 overflow-hidden"
              >
                <div
                  class="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 flex items-center justify-between"
                >
                  <h3 class="text-white font-semibold flex items-center gap-2">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
                      />
                    </svg>
                    2D Floor Plan Editor
                  </h3>
                  <span class="text-xs text-indigo-200"
                    >Edit walls, doors, windows</span
                  >
                </div>
                <div
                  class="p-2"
                  :style="
                    studioViewMode === 'split'
                      ? 'height: 550px;'
                      : 'height: 500px;'
                  "
                >
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
              <div
                class="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden"
              >
                <div
                  class="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 flex items-center justify-between"
                >
                  <h3 class="text-white font-semibold flex items-center gap-2">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    3D Real-time Preview
                  </h3>
                  <span class="text-xs text-purple-200 flex items-center gap-1">
                    <span
                      class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    ></span>
                    Synced with 2D
                  </span>
                </div>
                <div
                  class="p-2"
                  :style="
                    studioViewMode === 'split'
                      ? 'height: 550px;'
                      : 'height: 500px;'
                  "
                >
                  <ThreeDViewer
                    :map-data="liveMapData"
                    :map-title="selectedMap?.title || 'Floor Plan'"
                    :compact-mode="true"
                    @close="closeStudio"
                  />
                </div>
              </div>
            </div>

            <!-- Feature highlights -->
            <div
              v-if="convertedMapData"
              class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4"
            >
              <div
                class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center"
              >
                <svg
                  class="w-8 h-8 mx-auto mb-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <p class="text-sm font-semibold text-blue-800">
                  Real-time Sync
                </p>
                <p class="text-xs text-blue-600">Changes update instantly</p>
              </div>
              <div
                class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center"
              >
                <svg
                  class="w-8 h-8 mx-auto mb-2 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                <p class="text-sm font-semibold text-purple-800">
                  Walk Through
                </p>
                <p class="text-xs text-purple-600">Explore in first person</p>
              </div>
              <div
                class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center"
              >
                <svg
                  class="w-8 h-8 mx-auto mb-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <p class="text-sm font-semibold text-green-800">360° View</p>
                <p class="text-xs text-green-600">Rotate and zoom freely</p>
              </div>
              <div
                class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center"
              >
                <svg
                  class="w-8 h-8 mx-auto mb-2 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p class="text-sm font-semibold text-amber-800">
                  Lighting Modes
                </p>
                <p class="text-xs text-amber-600">Day, evening, night</p>
              </div>
            </div>
          </div>

          <!-- Cost Estimation Tab -->
          <div v-if="activeTab === 'cost'" class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-800">Cost Estimation</h2>

            <!-- Cost Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-indigo-50 rounded-lg p-6">
                <p class="text-sm text-gray-600 mb-1">Base Cost (per m²)</p>
                <p class="text-4xl font-bold text-indigo-600 mb-2">Rs 0.00</p>
                <p class="text-sm text-gray-500">Area: 0 m²</p>
              </div>

              <div class="bg-purple-50 rounded-lg p-6">
                <p class="text-sm text-gray-600 mb-1">Total Base Cost</p>
                <p class="text-4xl font-bold text-purple-600 mb-2">Rs 0.00</p>
                <p class="text-sm text-gray-500">For 0 m²</p>
              </div>
            </div>

            <!-- Estimated Total Cost -->
            <div
              class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white"
            >
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-lg font-medium mb-1">Estimated Total Cost</p>
                  <p class="text-sm opacity-90">
                    Based on 0 m² with 0 active layer(s)
                  </p>
                </div>
                <p class="text-5xl font-bold">Rs 0.00</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
              <button
                class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Download Estimate
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">
          Share Your Feedback
        </h3>
        <FeedbackForm />
        <div class="mt-8">
          <h4 class="text-xl font-semibold text-gray-800 mb-4">
            Recent Feedback
          </h4>
          <FeedbackList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import FeedbackForm from "../components/FeedbackForm.vue";
import FeedbackList from "../components/FeedbackList.vue";
import DxfViewer from "../components/DxfViewer.vue";
import JsonMapEditor from "../components/JsonMapEditor.vue";
import ThreeDViewer from "../components/ThreeDViewer.vue";
import { stripDxfTextFormatting } from "../utils/dxfTextUtils";

const authStore = useAuthStore();
const route = useRoute();

// Active tab state - set to '2d' if route is design-2d-map, otherwise default to 'cost'
const activeTab = ref(route.name === "design-2d-map" ? "2d" : "cost");

// Watch for route changes to update active tab
watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName === "design-2d-map") {
      activeTab.value = "2d";
    }
  },
);

// Watch for tab changes - auto-convert DXF data when switching to studio or 3d tab
watch(
  () => activeTab.value,
  (newTab) => {
    if (
      (newTab === "studio" || newTab === "3d") &&
      parsedDxfData.value &&
      !convertedMapData.value
    ) {
      console.log("[Dashboard] Auto-converting DXF data for", newTab, "tab");
      convertedMapData.value = convertDxfToJson(parsedDxfData.value);
      if (convertedMapData.value) {
        liveMapData.value = JSON.parse(JSON.stringify(convertedMapData.value));
      }
    }
  },
);

// 3D Model settings
const rotation = ref(45);
const zoom = ref(100);
const show3DViewer = ref(false);
const lighting = ref("Studio");

// Map Editor state - integrated into main flow
const isEditingMap = ref(false);
const parsedDxfData = ref(null);
const convertedMapData = ref(null);

// Design Studio state - Split view with real-time sync
const studioViewMode = ref("split"); // 'split' or 'stacked'
const liveMapData = ref(null); // Real-time map data for 3D sync

// 2D Map Design state - Dummy inputs for showing map stored in backend
const roomDimensions = ref({
  length: 30,
  width: 45,
});

const roomSpecifications = ref({
  bedrooms: 2,
  bathrooms: 3,
  kitchen: 1,
  drawingRoom: 1,
  diningRoom: 0, // Wrong/default value
  storeRoom: 0, // Wrong/default value
  garage: 1,
  servantQuarter: 0, // Wrong/default value
  tvLounge: 1,
});

const generatingMaps = ref(false);
const generatedMaps = ref([]);
const showDxfViewer = ref(false);
const selectedMap = ref(null);
const sessionEditedMaps = ref({}); // { [mapId]: { mapData, dxfUrl, version } }
let sessionEditVersionCounter = 0;

const dxfNum = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n * 1e6) / 1e6;
  const str = String(rounded);
  return str.includes(".") ? str.replace(/\.?0+$/, "") : str;
};

const sanitizeDxfText = (value) =>
  String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\^/g, " ")
    .replace(/\u0000/g, " ");

const convertJsonToDxf = (mapData) => {
  if (!mapData || !Array.isArray(mapData.entities)) return null;

  const layerNameById = new Map();
  for (const layer of mapData.layers || []) {
    if (layer?.id) layerNameById.set(layer.id, layer.name || layer.id);
  }

  const layers = new Set(["0"]);
  for (const e of mapData.entities) {
    const lname = layerNameById.get(e.layerId) || e.layerId || "0";
    layers.add(String(lname));
  }

  const out = [];
  const add = (...pairs) => {
    for (const [g, v] of pairs) {
      out.push(String(g), String(v));
    }
  };

  add([0, "SECTION"], [2, "HEADER"], [9, "$ACADVER"], [1, "AC1015"], [0, "ENDSEC"]);

  add([0, "SECTION"], [2, "TABLES"]);
  add([0, "TABLE"], [2, "LAYER"], [70, layers.size]);
  for (const name of layers) {
    add([0, "LAYER"], [2, name], [70, 0], [62, 7], [6, "CONTINUOUS"]);
  }
  add([0, "ENDTAB"], [0, "ENDSEC"]);

  add([0, "SECTION"], [2, "ENTITIES"]);

  for (const entity of mapData.entities) {
    const layerName = layerNameById.get(entity.layerId) || entity.layerId || "0";

    if (entity.type === "line" && entity.start && entity.end) {
      add(
        [0, "LINE"],
        [8, layerName],
        [10, dxfNum(entity.start.x)],
        [20, dxfNum(entity.start.y)],
        [30, 0],
        [11, dxfNum(entity.end.x)],
        [21, dxfNum(entity.end.y)],
        [31, 0],
      );
      continue;
    }

    if (entity.type === "arc" && entity.center) {
      add(
        [0, "ARC"],
        [8, layerName],
        [10, dxfNum(entity.center.x)],
        [20, dxfNum(entity.center.y)],
        [30, 0],
        [40, dxfNum(Math.max(0.01, Number(entity.radius) || 0.01))],
        [50, dxfNum(Number(entity.startAngle) || 0)],
        [51, dxfNum(Number(entity.endAngle) || 0)],
      );
      continue;
    }

    if (entity.type === "text" && entity.position) {
      add(
        [0, "TEXT"],
        [8, layerName],
        [10, dxfNum(entity.position.x)],
        [20, dxfNum(entity.position.y)],
        [30, 0],
        [40, dxfNum(Math.max(0.1, Number(entity.fontSize) || 1))],
        [1, sanitizeDxfText(entity.text)],
      );
      continue;
    }

    if (entity.type === "point" && entity.position) {
      add(
        [0, "POINT"],
        [8, layerName],
        [10, dxfNum(entity.position.x)],
        [20, dxfNum(entity.position.y)],
        [30, 0],
      );
      continue;
    }

    if (entity.type === "polyline" && Array.isArray(entity.points) && entity.points.length >= 2) {
      add([0, "LWPOLYLINE"], [8, layerName], [90, entity.points.length], [70, entity.closed ? 1 : 0]);
      for (const p of entity.points) {
        add([10, dxfNum(p.x)], [20, dxfNum(p.y)]);
      }
      continue;
    }

    if (entity.type === "rect" && Number.isFinite(entity.x) && Number.isFinite(entity.y)) {
      const x = Number(entity.x);
      const y = Number(entity.y);
      const w = Number(entity.width) || 0;
      const h = Number(entity.height) || 0;
      const pts = [
        { x, y },
        { x: x + w, y },
        { x: x + w, y: y + h },
        { x, y: y + h },
      ];
      add([0, "LWPOLYLINE"], [8, layerName], [90, 4], [70, 1]);
      for (const p of pts) add([10, dxfNum(p.x)], [20, dxfNum(p.y)]);
    }
  }

  add([0, "ENDSEC"], [0, "EOF"]);
  return `${out.join("\n")}\n`;
};

const revokeSessionEditUrl = (entry) => {
  if (entry?.dxfUrl && entry.dxfUrl.startsWith("blob:")) {
    URL.revokeObjectURL(entry.dxfUrl);
  }
};

const clearSessionEditedMaps = () => {
  for (const entry of Object.values(sessionEditedMaps.value || {})) {
    revokeSessionEditUrl(entry);
  }
  sessionEditedMaps.value = {};
};

const selectedMapSessionEdit = computed(() => {
  const mapId = selectedMap.value?.id;
  if (!mapId) return null;
  return sessionEditedMaps.value[mapId] || null;
});

const selectedMapViewDxfUrl = computed(() => {
  return selectedMapSessionEdit.value?.dxfUrl || selectedMap.value?.file_path || "";
});

const selectedMapViewerKey = computed(() => {
  const mapId = selectedMap.value?.id || "none";
  const version = selectedMapSessionEdit.value?.version || 0;
  const base = selectedMap.value?.file_path || "";
  return `dxf-${mapId}-${version}-${base}`;
});

// When user selects a different map, clear converted data so DxfViewer loads fresh
watch(
  () => selectedMap.value?.file_path,
  (newPath, oldPath) => {
    if (newPath && newPath !== oldPath) {
      convertedMapData.value = null;
      parsedDxfData.value = null;
    }
  },
);

// Map Editor functions - integrated into the main flow

// Handle parsed DXF data from DxfViewer
const handleDxfParsed = (dxfData) => {
  console.log("[Dashboard] DXF parsed, entities:", dxfData.entities?.length);
  parsedDxfData.value = dxfData;

  // Auto-convert to JSON format for Design Studio and 3D viewer
  const jsonData = convertDxfToJson(dxfData);
  if (jsonData) {
    convertedMapData.value = jsonData;
    liveMapData.value = JSON.parse(JSON.stringify(jsonData));
    console.log(
      "[Dashboard] Map data auto-converted for Design Studio, entities:",
      jsonData.entities?.length,
    );
  }
};

// Convert DXF data to JSON format for the editor
const convertDxfToJson = (dxfData) => {
  if (!dxfData || !dxfData.entities) {
    console.error("[Dashboard] No DXF data to convert");
    return null;
  }

  console.log(
    "[Dashboard] Converting DXF with",
    dxfData.entities.length,
    "entities",
  );

  // Log entity types to debug
  const entityTypes = {};
  dxfData.entities.forEach((entity) => {
    const type =
      typeof entity.type === "string"
        ? entity.type.split(" ")[0]
        : String(entity.type);
    entityTypes[type] = (entityTypes[type] || 0) + 1;
  });
  console.log("[Dashboard] Entity types in DXF:", entityTypes);

  // Calculate bounds from ALL entities
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  dxfData.entities.forEach((entity) => {
    const entityType =
      typeof entity.type === "string"
        ? entity.type.split(" ")[0].toUpperCase()
        : String(entity.type).toUpperCase();

    // Handle LINE entities
    if (entityType === "LINE") {
      // Try different property formats
      const x1 = entity.start?.x ?? entity.vertices?.[0]?.x;
      const y1 = entity.start?.y ?? entity.vertices?.[0]?.y;
      const x2 = entity.end?.x ?? entity.vertices?.[1]?.x;
      const y2 = entity.end?.y ?? entity.vertices?.[1]?.y;

      if (x1 != null && y1 != null && x2 != null && y2 != null) {
        minX = Math.min(minX, x1, x2);
        minY = Math.min(minY, y1, y2);
        maxX = Math.max(maxX, x1, x2);
        maxY = Math.max(maxY, y1, y2);
      }
    }
    // Handle POLYLINE/LWPOLYLINE
    else if (entityType === "POLYLINE" || entityType === "LWPOLYLINE") {
      const vertices = entity.vertices || [];
      vertices.forEach((v) => {
        if (v.x != null && v.y != null) {
          minX = Math.min(minX, v.x);
          minY = Math.min(minY, v.y);
          maxX = Math.max(maxX, v.x);
          maxY = Math.max(maxY, v.y);
        }
      });
    }
    // Handle CIRCLE/ARC
    else if (
      (entityType === "CIRCLE" || entityType === "ARC") &&
      entity.center &&
      entity.radius
    ) {
      const cx = entity.center.x;
      const cy = entity.center.y;
      const r = entity.radius;
      if (cx != null && cy != null && r != null) {
        minX = Math.min(minX, cx - r);
        minY = Math.min(minY, cy - r);
        maxX = Math.max(maxX, cx + r);
        maxY = Math.max(maxY, cy + r);
      }
    }
    // Handle HATCH (boundary paths)
    else if (entityType === "HATCH" && entity.boundary) {
      // HATCH entities often contain wall boundaries
      const boundaries = Array.isArray(entity.boundary)
        ? entity.boundary
        : [entity.boundary];
      boundaries.forEach((boundary) => {
        if (boundary.polyline) {
          boundary.polyline.forEach((v) => {
            if (v.x != null && v.y != null) {
              minX = Math.min(minX, v.x);
              minY = Math.min(minY, v.y);
              maxX = Math.max(maxX, v.x);
              maxY = Math.max(maxY, v.y);
            }
          });
        }
      });
    }
  });

  console.log("[Dashboard] Calculated bounds:", { minX, minY, maxX, maxY });

  // Create JSON structure with more layers
  const jsonData = {
    metadata: {
      name: selectedMap.value?.title || "Floor Plan",
      version: "1.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Map2Home",
      units: "units",
      bounds: {
        minX: isFinite(minX) ? minX : 0,
        minY: isFinite(minY) ? minY : 0,
        maxX: isFinite(maxX) ? maxX : 100,
        maxY: isFinite(maxY) ? maxY : 100,
      },
    },
    layers: [
      {
        id: "walls",
        name: "Walls",
        visible: true,
        locked: false,
        color: "#1e293b",
        lineWidth: 3,
      },
      {
        id: "doors",
        name: "Doors",
        visible: true,
        locked: false,
        color: "#dc2626",
        lineWidth: 2,
      },
      {
        id: "windows",
        name: "Windows",
        visible: true,
        locked: false,
        color: "#2563eb",
        lineWidth: 2,
      },
      {
        id: "labels",
        name: "Labels",
        visible: true,
        locked: false,
        color: "#7c3aed",
        lineWidth: 1,
      },
      {
        id: "furniture",
        name: "Furniture",
        visible: true,
        locked: false,
        color: "#f97316",
        lineWidth: 2,
      },
      {
        id: "hatch",
        name: "Hatches",
        visible: true,
        locked: false,
        color: "#94a3b8",
        lineWidth: 1,
      },
      {
        id: "other",
        name: "Other",
        visible: true,
        locked: false,
        color: "#6b7280",
        lineWidth: 2,
      },
    ],
    entities: [],
  };

  // Convert DXF entities to JSON entities
  let entityId = 0;
  let convertedCounts = { line: 0, arc: 0, text: 0, hatch: 0, skipped: 0 };

  const classifyLayerId = (layerNameInput, blockNameInput = "", entityTypeInput = "") => {
    const layerName = String(layerNameInput || "").toLowerCase();
    const blockName = String(blockNameInput || "").toLowerCase();
    const combined = (layerName + " " + blockName).trim();
    const entityType = String(entityTypeInput || "").toUpperCase();

    if (entityType === "TEXT" || entityType === "MTEXT") return "labels";
    if (entityType === "HATCH") return "hatch";

    if (
      /\bwall\b|wall|structure|outline|strc|strct|muro|arwall|proy|partition|enclosure|boundary/i.test(
        combined,
      ) ||
      /^a-wall|^ar-wall|^a-strc|^ar-strc/i.test(combined)
    ) {
      return "walls";
    }
    if (
      /\bdoor\b|door|entry|puerta|cerr|porta|porte/i.test(combined) ||
      /^a-door|^ar-door/i.test(combined)
    ) {
      return "doors";
    }
    if (
      /\bwindow\b|window|glass|ventana|glaz|fenetre|janela/i.test(combined) ||
      /^a-wind|^a-glaz|^ar-glass|^wd\b/i.test(combined)
    ) {
      return "windows";
    }
    if (
      /\btext\b|text|label|dim|annotation|titl|note/i.test(combined) ||
      /^a-anno|^a-dims|^a-titles/i.test(combined)
    ) {
      return "labels";
    }
    if (
      /\bfurniture\b|furniture|furn|fixture|equip|meuble|mobiliario|chair|desk|table|seat|workstation|reception|counter/i.test(
        combined,
      ) ||
      /toilet|sink|lavatory|sanitary|bathroom|wc\b/i.test(combined) ||
      /^a-furn|^a-equip|^ar-furn|^fn\b/i.test(combined)
    ) {
      return "furniture";
    }
    if (/\bhatch\b|hatch|fill|patron|fill/i.test(combined)) {
      return "hatch";
    }
    return "other";
  };

  dxfData.entities.forEach((entity, index) => {
    const entityType =
      typeof entity.type === "string"
        ? entity.type.split(" ")[0].toUpperCase()
        : String(entity.type).toUpperCase();
    const layerName = (entity.layer || entity.layerName || "").toLowerCase();
    const blockName = (entity.name || entity.block || "").toLowerCase(); // for INSERT - block name can hint category

    // Determine layer from DXF layer name + block name (for INSERT)
    // DXF files use varied conventions: AIA (A-WALL), generic (WALL), abbreviations (AR-WALL, WD), default (0)
    const layerId = classifyLayerId(layerName, blockName, entityType);
    const sourceGroupId = `src-${index}`;

    // Debug first few entities
    if (index < 5) {
      console.log(
        `[Dashboard] Entity ${index}:`,
        entityType,
        "layer:",
        layerName,
        "→",
        layerId,
      );
    }

    // Handle LINE entities
    if (entityType === "LINE") {
      const x1 = entity.start?.x ?? entity.vertices?.[0]?.x;
      const y1 = entity.start?.y ?? entity.vertices?.[0]?.y;
      const x2 = entity.end?.x ?? entity.vertices?.[1]?.x;
      const y2 = entity.end?.y ?? entity.vertices?.[1]?.y;

      if (x1 != null && y1 != null && x2 != null && y2 != null) {
        jsonData.entities.push({
          id: `line-${entityId++}`,
          type: "line",
          layerId: layerId,
          groupId: sourceGroupId,
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          properties: { layer: entity.layer, originalType: "LINE" },
        });
        convertedCounts.line++;
      }
    }
    // Handle POLYLINE/LWPOLYLINE
    else if (
      (entityType === "POLYLINE" || entityType === "LWPOLYLINE") &&
      entity.vertices &&
      entity.vertices.length > 1
    ) {
      // Convert polyline to multiple lines
      for (let i = 0; i < entity.vertices.length - 1; i++) {
        const v1 = entity.vertices[i];
        const v2 = entity.vertices[i + 1];
        if (v1.x != null && v1.y != null && v2.x != null && v2.y != null) {
          jsonData.entities.push({
            id: `line-${entityId++}`,
            type: "line",
            layerId: layerId,
            groupId: sourceGroupId,
            start: { x: v1.x, y: v1.y },
            end: { x: v2.x, y: v2.y },
            properties: { layer: entity.layer, fromPolyline: true },
          });
          convertedCounts.line++;
        }
      }
      // Close the polyline if needed (dxf-viewer uses 'shape', dxf-parser uses 'closed')
      const isClosed = entity.closed || entity.shape;
      if (isClosed && entity.vertices.length > 2) {
        const last = entity.vertices.length - 1;
        const vLast = entity.vertices[last];
        const vFirst = entity.vertices[0];
        if (
          vLast.x != null &&
          vLast.y != null &&
          vFirst.x != null &&
          vFirst.y != null
        ) {
          jsonData.entities.push({
            id: `line-${entityId++}`,
            type: "line",
            layerId: layerId,
            groupId: sourceGroupId,
            start: { x: vLast.x, y: vLast.y },
            end: { x: vFirst.x, y: vFirst.y },
            properties: {
              layer: entity.layer,
              fromPolyline: true,
              closingSegment: true,
            },
          });
          convertedCounts.line++;
        }
      }
    }
    // Handle CIRCLE
    else if (entityType === "CIRCLE" && entity.center && entity.radius) {
      jsonData.entities.push({
        id: `circle-${entityId++}`,
        type: "arc",
        layerId: layerId,
        groupId: sourceGroupId,
        center: { x: entity.center.x, y: entity.center.y },
        radius: entity.radius,
        startAngle: 0,
        endAngle: 360,
        properties: { layer: entity.layer, isCircle: true },
      });
      convertedCounts.arc++;
    }
    // Handle ARC (dxf-viewer uses radians for angles; JsonMapEditor expects degrees)
    else if (entityType === "ARC" && entity.center && entity.radius) {
      const radToDeg = (rad) => (rad != null ? (rad * 180) / Math.PI : 0);
      const startDeg = radToDeg(entity.startAngle);
      const endDeg = radToDeg(entity.endAngle);
      jsonData.entities.push({
        id: `arc-${entityId++}`,
        type: "arc",
        layerId: layerId,
        groupId: sourceGroupId,
        center: { x: entity.center.x, y: entity.center.y },
        radius: entity.radius,
        startAngle: startDeg,
        endAngle: endDeg,
        properties: { layer: entity.layer },
      });
      convertedCounts.arc++;
    }
    // Handle TEXT/MTEXT
    else if (entityType === "TEXT" || entityType === "MTEXT") {
      let text =
        entity.text || entity.string || entity.value || entity.textString || "";
      if (Array.isArray(text)) text = text.join(" ");
      text = stripDxfTextFormatting(String(text));
      const x =
        entity.position?.x ||
        entity.startPoint?.x ||
        entity.insertionPoint?.x ||
        entity.point?.x ||
        entity.firstAlignmentPoint?.x ||
        0;
      const y =
        entity.position?.y ||
        entity.startPoint?.y ||
        entity.insertionPoint?.y ||
        entity.point?.y ||
        entity.firstAlignmentPoint?.y ||
        0;

      if (text && text.trim()) {
        jsonData.entities.push({
          id: `text-${entityId++}`,
          type: "text",
          layerId: "labels",
          groupId: sourceGroupId,
          position: { x, y },
          text: text.trim(),
          fontSize: entity.height || entity.textHeight || 100,
          fontFamily: "Arial",
          textAlign: "center",
          properties: { layer: entity.layer },
        });
        convertedCounts.text++;
      }
    }
    // Handle INSERT (block references) - expand block geometry
    // dxf-viewer: block.entities or block.data.entities; block LINE uses vertices not start/end
    else if (entityType === "INSERT" && (entity.name || entity.block)) {
      const blockName = entity.name || entity.block;
      const block = dxfData.blocks?.[blockName];
      const blockEnts = block?.entities || block?.data?.entities || [];
      const insertGroupId = `insert-${index}`;
      if (blockEnts.length === 0 && block) {
        console.warn("[Dashboard] Block", blockName, "has no entities");
      }
      const insertX = entity.position?.x ?? entity.insertionPoint?.x ?? 0;
      const insertY = entity.position?.y ?? entity.insertionPoint?.y ?? 0;
      const scaleX = entity.xScale ?? 1;
      const scaleY = entity.yScale ?? 1;
      const rotDeg = entity.rotation ?? 0;
      const rotation = (rotDeg * Math.PI) / 180;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const transform = (x, y) => {
        const sx = x * scaleX;
        const sy = y * scaleY;
        return {
          x: sx * cos - sy * sin + insertX,
          y: sx * sin + sy * cos + insertY,
        };
      };
      const radToDeg = (rad) => (rad != null ? (rad * 180) / Math.PI : 0);
      blockEnts.forEach((blkEnt) => {
        const blkType = (
          typeof blkEnt.type === "string"
            ? blkEnt.type.split(" ")[0]
            : String(blkEnt.type || "")
        ).toUpperCase();
        const blkLayerName = (blkEnt.layer || entity.layer || entity.layerName || "").toLowerCase();
        const blkLayerId = classifyLayerId(blkLayerName, blockName, blkType);
        // dxf-viewer LINE uses vertices[0], vertices[1]; dxf-parser uses start, end
        if (blkType === "LINE") {
          const x1 = blkEnt.start?.x ?? blkEnt.vertices?.[0]?.x;
          const y1 = blkEnt.start?.y ?? blkEnt.vertices?.[0]?.y;
          const x2 = blkEnt.end?.x ?? blkEnt.vertices?.[1]?.x;
          const y2 = blkEnt.end?.y ?? blkEnt.vertices?.[1]?.y;
          if (x1 != null && y1 != null && x2 != null && y2 != null) {
            const p1 = transform(x1, y1);
            const p2 = transform(x2, y2);
            jsonData.entities.push({
              id: `insert-line-${entityId++}`,
              type: "line",
              layerId: blkLayerId,
              groupId: insertGroupId,
              start: p1,
              end: p2,
              properties: { layer: blkEnt.layer || entity.layer, fromBlock: blockName },
            });
            convertedCounts.line++;
          }
        } else if (
          (blkType === "LWPOLYLINE" || blkType === "POLYLINE") &&
          blkEnt.vertices?.length > 1
        ) {
          const isClosed = blkEnt.closed || blkEnt.shape;
          for (let i = 0; i < blkEnt.vertices.length - 1; i++) {
            const v1 = blkEnt.vertices[i];
            const v2 = blkEnt.vertices[i + 1];
            if (v1.x != null && v1.y != null && v2.x != null && v2.y != null) {
              const p1 = transform(v1.x, v1.y);
              const p2 = transform(v2.x, v2.y);
              jsonData.entities.push({
                id: `insert-line-${entityId++}`,
                type: "line",
                layerId: blkLayerId,
                groupId: insertGroupId,
                start: p1,
                end: p2,
                properties: { layer: blkEnt.layer || entity.layer, fromBlock: blockName },
              });
              convertedCounts.line++;
            }
          }
          if (isClosed && blkEnt.vertices.length > 2) {
            const vFirst = blkEnt.vertices[0];
            const vLast = blkEnt.vertices[blkEnt.vertices.length - 1];
            if (vFirst?.x != null && vLast?.x != null) {
              const p1 = transform(vLast.x, vLast.y);
              const p2 = transform(vFirst.x, vFirst.y);
              jsonData.entities.push({
                id: `insert-line-${entityId++}`,
                type: "line",
                layerId: blkLayerId,
                groupId: insertGroupId,
                start: p1,
                end: p2,
                properties: { layer: blkEnt.layer || entity.layer, fromBlock: blockName },
              });
              convertedCounts.line++;
            }
          }
        } else if (
          blkType === "CIRCLE" &&
          blkEnt.center &&
          blkEnt.radius != null
        ) {
          const c = transform(blkEnt.center.x, blkEnt.center.y);
          const r = (blkEnt.radius || 0) * Math.sqrt(scaleX * scaleY);
          jsonData.entities.push({
            id: `insert-arc-${entityId++}`,
            type: "arc",
            layerId: blkLayerId,
            groupId: insertGroupId,
            center: c,
            radius: r,
            startAngle: 0,
            endAngle: 360,
            properties: { layer: blkEnt.layer || entity.layer, fromBlock: blockName },
          });
          convertedCounts.arc++;
        } else if (
          blkType === "ARC" &&
          blkEnt.center &&
          blkEnt.radius != null
        ) {
          const c = transform(blkEnt.center.x, blkEnt.center.y);
          const r = (blkEnt.radius || 0) * Math.sqrt(scaleX * scaleY);
          const startDeg = radToDeg(blkEnt.startAngle);
          const endDeg = radToDeg(blkEnt.endAngle);
          jsonData.entities.push({
            id: `insert-arc-${entityId++}`,
            type: "arc",
            layerId: blkLayerId,
            groupId: insertGroupId,
            center: c,
            radius: r,
            startAngle: startDeg,
            endAngle: endDeg,
            properties: { layer: blkEnt.layer || entity.layer, fromBlock: blockName },
          });
          convertedCounts.arc++;
        }
      });
    }
    // Handle HATCH - extract boundary as lines
    else if (entityType === "HATCH" && entity.boundary) {
      const boundaries = Array.isArray(entity.boundary)
        ? entity.boundary
        : [entity.boundary];
      boundaries.forEach((boundary) => {
        if (boundary.polyline && boundary.polyline.length > 1) {
          for (let i = 0; i < boundary.polyline.length - 1; i++) {
            const p1 = boundary.polyline[i];
            const p2 = boundary.polyline[i + 1];
            if (p1.x != null && p1.y != null && p2.x != null && p2.y != null) {
              jsonData.entities.push({
                id: `hatch-line-${entityId++}`,
                type: "line",
                layerId: "hatch",
                groupId: sourceGroupId,
                start: { x: p1.x, y: p1.y },
                end: { x: p2.x, y: p2.y },
                properties: { layer: entity.layer, fromHatch: true },
              });
              convertedCounts.hatch++;
            }
          }
        }
      });
    } else {
      convertedCounts.skipped++;
    }
  });

  console.log("[Dashboard] Conversion complete:", convertedCounts);
  console.log("[Dashboard] Total JSON entities:", jsonData.entities.length);

  // Recompute bounds from converted entities
  let finalMinX = Infinity, finalMinY = Infinity, finalMaxX = -Infinity, finalMaxY = -Infinity;
  jsonData.entities.forEach((e) => {
    if (e.type === "line" && e.start && e.end) {
      finalMinX = Math.min(finalMinX, e.start.x, e.end.x);
      finalMinY = Math.min(finalMinY, e.start.y, e.end.y);
      finalMaxX = Math.max(finalMaxX, e.start.x, e.end.x);
      finalMaxY = Math.max(finalMaxY, e.start.y, e.end.y);
    } else if (e.type === "arc" && e.center && e.radius != null) {
      const r = e.radius;
      finalMinX = Math.min(finalMinX, e.center.x - r);
      finalMinY = Math.min(finalMinY, e.center.y - r);
      finalMaxX = Math.max(finalMaxX, e.center.x + r);
      finalMaxY = Math.max(finalMaxY, e.center.y + r);
    } else if (e.type === "text" && e.position) {
      finalMinX = Math.min(finalMinX, e.position.x);
      finalMinY = Math.min(finalMinY, e.position.y);
      finalMaxX = Math.max(finalMaxX, e.position.x);
      finalMaxY = Math.max(finalMaxY, e.position.y);
    }
  });
  if (isFinite(finalMinX)) {
    jsonData.metadata.bounds = { minX: finalMinX, minY: finalMinY, maxX: finalMaxX, maxY: finalMaxY };
  }

  // ========================================================================
  // OUTER WALL DETECTION
  // ========================================================================
  const bounds = jsonData.metadata.bounds;
  if (bounds && isFinite(bounds.minX)) {
    const bw = bounds.maxX - bounds.minX;
    const bh = bounds.maxY - bounds.minY;
    const OUTER_TOL = Math.min(bw, bh) * 0.02;
    const isOnBoundary = (x, y) => (
      Math.abs(x - bounds.minX) <= OUTER_TOL || Math.abs(x - bounds.maxX) <= OUTER_TOL ||
      Math.abs(y - bounds.minY) <= OUTER_TOL || Math.abs(y - bounds.maxY) <= OUTER_TOL
    );
    jsonData.entities.forEach((e) => {
      if (e.layerId === "walls" && e.type === "line") {
        if (isOnBoundary(e.start.x, e.start.y) && isOnBoundary(e.end.x, e.end.y)) {
          e.isOuterWall = true;
        }
      }
    });
  }

  // ========================================================================
  // ROOM DETECTION using TEXT LABELS as anchors + RAY CASTING to find walls
  // 1. Each text label (Kitchen, offices, etc.) marks a room center
  // 2. From each label, cast rays in 4 directions to find the nearest wall
  // 3. The found walls define the room bounding box
  // 4. All entities (walls, doors, furniture) inside that box belong to the room
  // ========================================================================
  const wallEntities = jsonData.entities.filter((e) => e.layerId === "walls" && e.type === "line");
  const textLabels = jsonData.entities.filter((e) => e.type === "text" && e.layerId === "labels");

  // Helper: find nearest wall intersection from point in a given direction
  const castRay = (px, py, dirX, dirY, walls) => {
    let bestDist = Infinity;
    let bestHit = null;
    for (const w of walls) {
      // For horizontal ray (dirY=0): find wall segments that cross the Y of the ray
      // For vertical ray (dirX=0): find wall segments that cross the X of the ray
      if (dirX !== 0 && dirY === 0) {
        // Horizontal ray - look for vertical-ish walls
        const wMinY = Math.min(w.start.y, w.end.y);
        const wMaxY = Math.max(w.start.y, w.end.y);
        if (py < wMinY || py > wMaxY) continue;
        // Wall must be mostly vertical (height > width)
        const wHeight = wMaxY - wMinY;
        const wWidth = Math.abs(w.end.x - w.start.x);
        if (wHeight < wWidth * 0.5 && wHeight > 1) continue; // skip horizontal walls
        // Interpolate x at py
        const t = wHeight > 0.01 ? (py - w.start.y) / (w.end.y - w.start.y) : 0.5;
        const hitX = w.start.x + t * (w.end.x - w.start.x);
        const dist = (hitX - px) * dirX;
        if (dist > 0.5 && dist < bestDist) { bestDist = dist; bestHit = hitX; }
      } else if (dirY !== 0 && dirX === 0) {
        // Vertical ray - look for horizontal-ish walls
        const wMinX = Math.min(w.start.x, w.end.x);
        const wMaxX = Math.max(w.start.x, w.end.x);
        if (px < wMinX || px > wMaxX) continue;
        const wWidth = wMaxX - wMinX;
        const wHeight = Math.abs(w.end.y - w.start.y);
        if (wWidth < wHeight * 0.5 && wWidth > 1) continue; // skip vertical walls
        const t = wWidth > 0.01 ? (px - w.start.x) / (w.end.x - w.start.x) : 0.5;
        const hitY = w.start.y + t * (w.end.y - w.start.y);
        const dist = (hitY - py) * dirY;
        if (dist > 0.5 && dist < bestDist) { bestDist = dist; bestHit = hitY; }
      }
    }
    return bestHit;
  };

  const roomDefs = [];
  let roomIdCounter = 0;
  const totalArea = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);

  for (const label of textLabels) {
    const cx = label.position.x;
    const cy = label.position.y;

    // Cast rays in 4 directions to find bounding walls
    const rightWall = castRay(cx, cy, 1, 0, wallEntities);
    const leftWall = castRay(cx, cy, -1, 0, wallEntities);
    const topWall = castRay(cx, cy, 0, 1, wallEntities);
    const bottomWall = castRay(cx, cy, 0, -1, wallEntities);

    // Require all four walls; fallback to global bounds creates oversized fake rooms
    if ([rightWall, leftWall, topWall, bottomWall].some((v) => v == null)) continue;

    const rMinX = leftWall;
    const rMaxX = rightWall;
    const rMinY = bottomWall;
    const rMaxY = topWall;
    const roomWidth = rMaxX - rMinX;
    const roomHeight = rMaxY - rMinY;
    if (roomWidth < 1 || roomHeight < 1) continue;

    // Skip if room is too small or too large
    const roomArea = (rMaxX - rMinX) * (rMaxY - rMinY);
    if (roomArea < 1 || roomArea > totalArea * 0.45) continue;

    const roomId = `room-${roomIdCounter++}`;
    const roomName = label.text || "Room";
    label.roomId = roomId;

    roomDefs.push({ roomId, name: roomName, minX: rMinX, minY: rMinY, maxX: rMaxX, maxY: rMaxY, cx, cy });
  }

  // Merge overlapping rooms with same name (e.g. multiple "offices" labels in same space)
  // Sort rooms smallest-first so smaller rooms take priority in assignment
  roomDefs.sort((a, b) => {
    const areaA = (a.maxX - a.minX) * (a.maxY - a.minY);
    const areaB = (b.maxX - b.minX) * (b.maxY - b.minY);
    return areaA - areaB;
  });

  // Helper: get entity center
  const getEntityCenter = (e) => {
    if (e.type === "line") return { x: (e.start.x + e.end.x) / 2, y: (e.start.y + e.end.y) / 2 };
    if (e.type === "arc") return { x: e.center.x, y: e.center.y };
    if (e.type === "text" || e.type === "point") return { x: e.position.x, y: e.position.y };
    return null;
  };

  // Assign ALL entities to rooms (walls, doors, furniture, everything)
  const WALL_TOL = Math.min(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.005;
  jsonData.entities.forEach((e) => {
    if (e.roomId) return; // already assigned (text label itself)

    const center = getEntityCenter(e);
    if (!center) return;

    // For wall segments: check if the wall midpoint is inside the room
    // or if the wall lies along the room boundary
    let bestRoom = null;
    let bestArea = Infinity;

    for (const rd of roomDefs) {
      const inside = center.x >= rd.minX - WALL_TOL && center.x <= rd.maxX + WALL_TOL &&
                     center.y >= rd.minY - WALL_TOL && center.y <= rd.maxY + WALL_TOL;
      if (!inside) continue;

      const area = (rd.maxX - rd.minX) * (rd.maxY - rd.minY);
      if (area < bestArea) {
        bestArea = area;
        bestRoom = rd;
      }
    }
    if (bestRoom) {
      e.roomId = bestRoom.roomId;
    }
  });

  // Store room definitions in metadata for the editor to use
  jsonData.metadata.rooms = roomDefs.map((rd) => ({
    roomId: rd.roomId,
    name: rd.name,
    bbox: { minX: rd.minX, minY: rd.minY, maxX: rd.maxX, maxY: rd.maxY },
  }));

  console.log("[Dashboard] Room detection: " + roomDefs.length + " rooms identified:",
    roomDefs.map((r) => r.name + " (" + r.roomId + ")").join(", "));

  // Log layer distribution
  const layerCounts = {};
  jsonData.entities.forEach((e) => {
    layerCounts[e.layerId] = (layerCounts[e.layerId] || 0) + 1;
  });
  console.log("[Dashboard] Entities by layer:", layerCounts);

  return jsonData;
};

const enableMapEditing = () => {
  (async () => {
    const mapId = selectedMap.value?.id;

    // 1) Session-only edited map for this user/session
    if (mapId && sessionEditedMaps.value[mapId]?.mapData) {
      convertedMapData.value = JSON.parse(
        JSON.stringify(sessionEditedMaps.value[mapId].mapData),
      );
      isEditingMap.value = true;
      showDxfViewer.value = false;
      return;
    }

    // 2) Fallback: convert current DXF
    if (!parsedDxfData.value) {
      alert("Please wait for the map to fully load before editing.");
      return;
    }

    const jsonData = convertDxfToJson(parsedDxfData.value);
    if (!jsonData) {
      alert("Failed to convert map data for editing.");
      return;
    }

    convertedMapData.value = jsonData;
    isEditingMap.value = true;
    showDxfViewer.value = false;
  })();
};

const closeMapEditor = () => {
  // Return to DXF viewer from editor
  isEditingMap.value = false;
  showDxfViewer.value = true;
};

const handleJsonMapSave = async (mapData) => {
  console.log("[Dashboard] JSON map saved:", mapData);
  convertedMapData.value = JSON.parse(JSON.stringify(mapData));
  liveMapData.value = JSON.parse(JSON.stringify(mapData));

  const mapId = selectedMap.value?.id;
  if (mapId) {
    const dxfString = convertJsonToDxf(mapData);
    if (dxfString) {
      const blob = new Blob([dxfString], { type: "application/dxf" });
      const dxfUrl = URL.createObjectURL(blob);

      const prev = sessionEditedMaps.value[mapId];
      if (prev) revokeSessionEditUrl(prev);

      sessionEditVersionCounter += 1;
      sessionEditedMaps.value = {
        ...sessionEditedMaps.value,
        [mapId]: {
          mapData: JSON.parse(JSON.stringify(mapData)),
          dxfUrl,
          version: sessionEditVersionCounter,
        },
      };
    } else {
      // Keep JSON in session even if DXF conversion fails.
      const prev = sessionEditedMaps.value[mapId];
      sessionEditVersionCounter += 1;
      sessionEditedMaps.value = {
        ...sessionEditedMaps.value,
        [mapId]: {
          mapData: JSON.parse(JSON.stringify(mapData)),
          dxfUrl: prev?.dxfUrl || selectedMap.value?.file_path || "",
          version: sessionEditVersionCounter,
        },
      };
    }
  }

  alert("Map changes saved successfully!");
};

const handleJsonMapLoaded = (mapData) => {
  console.log("[Dashboard] JSON map loaded:", mapData.metadata?.name);
};

// Design Studio functions - Real-time sync
const handleMapChanged = (updatedMapData) => {
  // Real-time sync: Update the 3D viewer whenever the 2D editor changes
  console.log("[Dashboard] Map changed - syncing to 3D viewer");
  liveMapData.value = JSON.parse(JSON.stringify(updatedMapData));
};

const handleStudioSave = (mapData) => {
  console.log("[Dashboard] Studio save:", mapData);
  convertedMapData.value = JSON.parse(JSON.stringify(mapData));
  liveMapData.value = JSON.parse(JSON.stringify(mapData));
  alert("Design saved successfully!");
};

const closeStudio = () => {
  // Don't close, just switch to 2D tab
  activeTab.value = "2d";
};

// Initialize live map data when convertedMapData changes
watch(
  () => convertedMapData.value,
  (newData) => {
    if (newData && !liveMapData.value) {
      liveMapData.value = JSON.parse(JSON.stringify(newData));
    }
  },
  { immediate: true },
);

// 3D Viewer functions
const open3DViewer = () => {
  if (!parsedDxfData.value) {
    alert("Please generate a floor plan first from the 2D Floor Plan tab.");
    return;
  }

  // Convert DXF data to JSON format if not already done
  if (!convertedMapData.value) {
    convertedMapData.value = convertDxfToJson(parsedDxfData.value);
  }

  if (!convertedMapData.value) {
    alert("Failed to convert map data for 3D view.");
    return;
  }

  show3DViewer.value = true;
  console.log(
    "[Dashboard] Opening 3D viewer with",
    convertedMapData.value.entities?.length,
    "entities",
  );
};

const close3DViewer = () => {
  show3DViewer.value = false;
};

// User profile computed properties
const userName = computed(() => authStore.user?.name || "User");
const userEmail = computed(() => authStore.user?.email || "user@example.com");
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());
const isVerified = computed(() => authStore.user?.is_verified === 1);

// Check if form can be submitted - for now, just need any input (will be used later for filtering)
const canGenerateMaps = computed(() => {
  // Allow submission with just length OR width, or any room specification
  const hasLength = roomDimensions.value.length > 0;
  const hasWidth = roomDimensions.value.width > 0;
  const hasDimensions = hasLength || hasWidth;
  const hasSpecifications = Object.values(roomSpecifications.value).some(
    (val) => val > 0,
  );
  return hasDimensions || hasSpecifications;
});

// Generate maps function
const generateMaps = async () => {
  if (!canGenerateMaps.value) {
    return;
  }

  // New generation should start from original maps.
  clearSessionEditedMaps();

  generatingMaps.value = true;
  generatedMaps.value = [];

  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    const token = authStore.token || localStorage.getItem("auth_token");

    console.log("[generateMaps] Starting map generation...");
    console.log("[generateMaps] API URL:", API_URL);
    console.log("[generateMaps] Token exists:", !!token);

    if (!token) {
      alert("Please login to generate maps.");
      generatingMaps.value = false;
      return;
    }

    const requestBody = {
      length: roomDimensions.value.length,
      width: roomDimensions.value.width,
      roomSpecifications: {
        bedrooms: roomSpecifications.value.bedrooms || 0,
        bathrooms: roomSpecifications.value.bathrooms || 0,
        kitchen: roomSpecifications.value.kitchen || 0,
        drawingRoom: roomSpecifications.value.drawingRoom || 0,
        diningRoom: roomSpecifications.value.diningRoom || 0,
        storeRoom: roomSpecifications.value.storeRoom || 0,
        garage: roomSpecifications.value.garage || 0,
        servantQuarter: roomSpecifications.value.servantQuarter || 0,
        tvLounge: roomSpecifications.value.tvLounge || 0,
      },
    };
    console.log("[generateMaps] Request body:", requestBody);

    // Send dimensions and room specifications to backend
    const response = await fetch(`${API_URL}/maps/generate-2d`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[generateMaps] Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[generateMaps] Error response:", errorData);
      if (response.status === 401) {
        alert("Please login to generate maps. Your session may have expired.");
        return;
      }
      throw new Error(
        errorData.message ||
          `Server error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("[generateMaps] Response data:", data);

    // Store generated maps from backend
    if (
      data.success &&
      data.maps &&
      Array.isArray(data.maps) &&
      data.maps.length > 0
    ) {
      generatedMaps.value = data.maps;
      showDxfViewer.value = true;

      // If only one result, select it directly; otherwise show the grid
      if (data.maps.length === 1) {
        selectedMap.value = data.maps[0];
      } else {
        selectedMap.value = null;
      }

      setTimeout(() => {
        const viewerElement = document.querySelector(".dxf-viewer-container");
        if (viewerElement) {
          viewerElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      generatedMaps.value = [];
      showDxfViewer.value = false;
      selectedMap.value = null;
      alert(
        data.message ||
          "No maps found for your requirements. Please try different specifications.",
      );
    }
  } catch (error) {
    console.error("[generateMaps] Error:", error);
    generatedMaps.value = [];

    // Provide more specific error messages
    let errorMessage = "Failed to load maps. Please try again.";
    if (error.message === "Failed to fetch") {
      errorMessage =
        "Cannot connect to server. Please check if the backend is running on port 5000.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    alert(errorMessage);
  } finally {
    generatingMaps.value = false;
  }
};

// Select a map from the multi-result grid
const selectMapFromGrid = (map) => {
  selectedMap.value = map;
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 50);
};

// Go back to the results grid without losing data
const backToResults = () => {
  selectedMap.value = null;
  parsedDxfData.value = null;
  convertedMapData.value = null;
};

// Handle closing the DXF viewer
const handleCloseViewer = () => {
  showDxfViewer.value = false;
  selectedMap.value = null;
  generatedMaps.value = [];
  parsedDxfData.value = null;
  convertedMapData.value = null;
  clearSessionEditedMaps();
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 100);
};

onBeforeUnmount(() => {
  clearSessionEditedMaps();
});

// Helper function to format room type for display
const formatRoomType = (roomType) => {
  if (!roomType) return "";
  return roomType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Handle image loading errors
const handleImageError = (event) => {
  event.target.style.display = "none";
  const parent = event.target.parentElement;
  if (parent && !parent.querySelector(".error-placeholder")) {
    const placeholder = document.createElement("div");
    placeholder.className =
      "error-placeholder w-full h-full flex items-center justify-center bg-gray-100";
    placeholder.innerHTML =
      '<p class="text-gray-400 text-sm">Image not found</p>';
    parent.appendChild(placeholder);
  }
};
</script>

<style scoped>
/* Minimal styles - most styling is done via Tailwind classes */
</style>

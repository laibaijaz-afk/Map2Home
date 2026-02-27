<template>
  <div class="min-h-screen py-8 relative overflow-hidden">
    <!-- Construction Site Background -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-20">
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'); filter: grayscale(30%) brightness(1.1);"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-br from-wood-50/60 via-wood-100/50 to-construction-50/60"></div>
    </div>
    
    <!-- Decorative Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-0 left-0 w-96 h-96 bg-construction-400/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-wood-400/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-construction-300/5 rounded-full blur-3xl"></div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 relative z-20">
      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-construction-500 to-construction-600 rounded-2xl shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
        </div>
        <h1 class="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-wood-800 via-construction-600 to-wood-700 bg-clip-text text-transparent">
          Cost Estimation Calculator
        </h1>
        <p class="text-xl text-wood-700 mb-6">Get precise construction cost estimates for your home in Pakistan</p>
        <div class="mt-6 construction-card p-6 max-w-2xl mx-auto text-left">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="text-base font-bold text-wood-800">Required Fields (marked with <span class="text-construction-600">*</span>):</p>
          </div>
          <ul class="text-sm text-wood-700 space-y-2 list-none">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-construction-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Plot Length & Width (in feet)
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-construction-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              City/Location
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-construction-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Construction Type & Quality
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-construction-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Number of Floors
            </li>
          </ul>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Input Form -->
        <div class="lg:col-span-2 space-y-6">
          <form @submit.prevent="calculateCost" class="space-y-6">
            <!-- Plot Information Section -->
            <div class="construction-card p-8 transform hover:scale-[1.01] transition-transform duration-300">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
                </div>
                <h2 class="text-3xl font-bold text-wood-800">Plot Information</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Plot Length -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                    </svg>
                    Plot Length (feet) <span class="text-construction-600">*</span>
                  </label>
                  <input
                    v-model.number="formData.plotLength"
                    type="number"
                    step="0.1"
                    min="10"
                    max="1000"
                    @input="handleDimensionInput('plotLength', $event)"
                    @blur="validateDimension('plotLength')"
                    :class="[
                      'w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md',
                      exceedsMaxArea || belowMinArea ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'
                    ]"
                    placeholder="e.g., 50"
                    required
                  />
                </div>

                <!-- Plot Width -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                    </svg>
                    Plot Width (feet) <span class="text-construction-600">*</span>
                  </label>
                  <input
                    v-model.number="formData.plotWidth"
                    type="number"
                    step="0.1"
                    min="10"
                    max="1000"
                    @input="handleDimensionInput('plotWidth', $event)"
                    @blur="validateDimension('plotWidth')"
                    :class="[
                      'w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md',
                      exceedsMaxArea || belowMinArea ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'
                    ]"
                    placeholder="e.g., 30"
                    required
                  />
                </div>

                <!-- Plot Area (Auto-calculated) -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2">Total Plot Area</label>
                  <input
                    :value="calculatedPlotArea"
                    type="text"
                    :class="[
                      'w-full px-4 py-3.5 border-2 rounded-xl bg-wood-50 shadow-sm',
                      exceedsMaxArea || belowMinArea ? 'border-red-500' : 'border-wood-300'
                    ]"
                    readonly
                  />
                  <p class="text-xs text-wood-600 mt-2 font-medium">
                    {{ calculatedPlotAreaSqm }} m² ({{ calculatedPlotArea }} sq ft / {{ calculatedPlotAreaMarla }} marla)
                  </p>
                  <p v-if="belowMinArea" class="text-xs text-red-600 mt-2 font-bold flex items-center gap-1">
                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    This service deals with plots of 2 marla ({{ MIN_AREA_SQ_FEET }} sq feet) or more. Your plot area is {{ calculatedPlotArea }} sq feet ({{ calculatedPlotAreaMarla }} marla).
                  </p>
                  <p v-else-if="exceedsMaxArea" class="text-xs text-red-600 mt-2 font-bold flex items-center gap-1">
                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    {{ areaError }}
                  </p>
                  <p v-else-if="calculatedPlotArea !== '0.00'" class="text-xs text-green-600 mt-2 font-medium">
                    ✓ Within 2-20 marla limit
                  </p>
                </div>

                <!-- Location -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    City/Location <span class="text-construction-600">*</span>
                  </label>
                  <select
                    v-model="formData.location"
                    class="w-full px-4 py-3.5 border-2 border-wood-300 rounded-xl focus:outline-none focus:border-construction-500 focus:ring-4 focus:ring-construction-200 transition-all bg-white shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="">Select City</option>
                    <option value="karachi">Karachi</option>
                    <option value="lahore">Lahore</option>
                    <option value="islamabad">Islamabad</option>
                    <option value="rawalpindi">Rawalpindi</option>
                    <option value="faisalabad">Faisalabad</option>
                    <option value="multan">Multan</option>
                    <option value="peshawar">Peshawar</option>
                    <option value="quetta">Quetta</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Building Specifications Section -->
            <div class="construction-card p-8 transform hover:scale-[1.01] transition-transform duration-300">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-wood-600 to-wood-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                </div>
                <h2 class="text-3xl font-bold text-wood-800">Building Specifications</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Construction Type -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    Construction Type <span class="text-construction-600">*</span>
                  </label>
                  <select
                    v-model="formData.constructionType"
                    class="w-full px-4 py-3.5 border-2 border-wood-300 rounded-xl focus:outline-none focus:border-construction-500 focus:ring-4 focus:ring-construction-200 transition-all bg-white shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="grey">Grey Structure Only</option>
                    <option value="complete">Full Ready House</option>
                  </select>
                  <p class="text-xs text-wood-600 mt-2 font-medium">
                    <span v-if="formData.constructionType === 'grey'">Only basic structure (cement, bricks, steel, etc.)</span>
                    <span v-else>Complete house with all finishing (tiles, paint, etc.)</span>
                  </p>
                </div>

                <!-- Number of Floors -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    Number of Floors <span class="text-construction-600">*</span>
                  </label>
                  <select
                    v-model.number="formData.floors"
                    class="w-full px-4 py-3.5 border-2 border-wood-300 rounded-xl focus:outline-none focus:border-construction-500 focus:ring-4 focus:ring-construction-200 transition-all bg-white shadow-sm hover:shadow-md"
                    required
                  >
                    <option :value="1">Ground Floor Only</option>
                    <option :value="2">Ground + 1st Floor</option>
                    <option :value="3">Ground + 2 Floors</option>
                    <option :value="4">Ground + 3 Floors</option>
                    <option :value="5">Ground + 4 Floors</option>
                  </select>
                </div>

                <!-- Construction Quality -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                    </svg>
                    Construction Quality <span class="text-construction-600">*</span>
                  </label>
                  <select
                    v-model="formData.quality"
                    class="w-full px-4 py-3.5 border-2 border-wood-300 rounded-xl focus:outline-none focus:border-construction-500 focus:ring-4 focus:ring-construction-200 transition-all bg-white shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="economy">Economy (Basic)</option>
                    <option value="standard">Standard (Good)</option>
                    <option value="luxury">Luxury (Premium)</option>
                  </select>
                </div>

                <!-- Basement -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    Basement
                  </label>
                  <select
                    v-model="formData.basement"
                    class="w-full px-4 py-3.5 border-2 border-wood-300 rounded-xl focus:outline-none focus:border-construction-500 focus:ring-4 focus:ring-construction-200 transition-all bg-white shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="no">No Basement</option>
                    <option value="partial">Partial Basement</option>
                    <option value="full">Full Basement</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Room Specifications Section -->
            <div class="construction-card p-8 transform hover:scale-[1.01] transition-transform duration-300">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-construction-400 to-construction-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                </div>
                <div class="flex-1">
                  <h2 class="text-3xl font-bold text-wood-800">Room Specifications</h2>
                  <p v-if="calculatedPlotArea !== '0.00'" class="text-sm text-wood-600 mt-1">
                    Maximum recommended rooms (excluding bathrooms) for {{ calculatedPlotAreaMarla }} marla with {{ formData.floors }} floor(s): <span class="font-bold text-construction-600">{{ maxRooms }}</span>
                    <span v-if="totalRoomsEntered > 0" class="ml-2">
                      (Currently: <span :class="totalRoomsEntered > maxRooms ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">{{ totalRoomsEntered }}</span>)
                    </span>
                    <span class="block text-xs text-wood-500 mt-1">Note: Bathrooms are counted separately due to their smaller size (60 sq ft each)</span>
                  </p>
                </div>
              </div>
              
              <!-- Room constraint warning -->
              <div v-if="roomErrors.total" class="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <p class="text-sm text-red-800 font-bold">{{ roomErrors.total }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Bedrooms -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Bedrooms
                  </label>
                  <input
                    v-model.number="formData.rooms.bedrooms"
                    type="number"
                    min="1"
                    max="20"
                    @input="handleRoomInput('bedrooms', $event)"
                    :class="[
                      'w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md',
                      roomErrors.bedrooms ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'
                    ]"
                    placeholder="e.g., 3"
                    required
                  />
                  <p v-if="roomErrors.bedrooms" class="text-xs text-red-600 mt-1 font-medium">{{ roomErrors.bedrooms }}</p>
                </div>

                <!-- Bathrooms -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Bathrooms
                    <span v-if="recommendedBathrooms > 0" class="text-xs text-wood-500 font-normal ml-1">
                      (Recommended: {{ recommendedBathrooms }})
                    </span>
                  </label>
                  <input
                    v-model.number="formData.rooms.bathrooms"
                    type="number"
                    min="1"
                    max="20"
                    @input="handleRoomInput('bathrooms', $event)"
                    :class="[
                      'w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md',
                      roomErrors.bathrooms ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'
                    ]"
                    placeholder="e.g., 2"
                    required
                  />
                  <p v-if="roomErrors.bathrooms" class="text-xs text-red-600 mt-1 font-medium">{{ roomErrors.bathrooms }}</p>
                  <p v-else-if="recommendedBathrooms > 0 && formData.rooms.bathrooms !== recommendedBathrooms" class="text-xs text-wood-500 mt-1">
                    Recommended: {{ recommendedBathrooms }} bathrooms for {{ calculatedPlotAreaMarla }} marla with {{ formData.floors }} floor(s)
                  </p>
                </div>

                <!-- Kitchen -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Kitchen
                  </label>
                  <input
                    v-model.number="formData.rooms.kitchen"
                    type="number"
                    min="1"
                    max="5"
                    @input="handleRoomInput('kitchen', $event)"
                    :class="[
                      'w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md',
                      roomErrors.kitchen ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'
                    ]"
                    placeholder="e.g., 1"
                    required
                  />
                  <p v-if="roomErrors.kitchen" class="text-xs text-red-600 mt-1 font-medium">{{ roomErrors.kitchen }}</p>
                </div>

                <!-- Drawing Room -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Drawing Room
                  </label>
                  <input
                    v-model.number="formData.rooms.drawingRoom"
                    type="number"
                    min="0"
                    max="5"
                    @input="handleRoomInput('drawingRoom', $event)"
                    :class="[
                      'w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md',
                      roomErrors.drawingRoom ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'
                    ]"
                    placeholder="e.g., 1"
                    required
                  />
                  <p v-if="roomErrors.drawingRoom" class="text-xs text-red-600 mt-1 font-medium">{{ roomErrors.drawingRoom }}</p>
                </div>

                <!-- Dining Room / TV Lounge -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-construction-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Dining Room / TV Lounge
                  </label>
                  <input
                    v-model.number="formData.rooms.diningRoom"
                    type="number"
                    min="0"
                    max="5"
                    @input="handleRoomInput('diningRoom', $event)"
                    :class="[
                      'w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md',
                      roomErrors.diningRoom ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'
                    ]"
                    placeholder="e.g., 1"
                    required
                  />
                  <p v-if="roomErrors.diningRoom" class="text-xs text-red-600 mt-1 font-medium">{{ roomErrors.diningRoom }}</p>
                </div>

                <!-- Store Room -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Store Room</label>
                  <input
                    v-model.number="formData.rooms.storeRoom"
                    type="number"
                    min="0"
                    max="5"
                    @input="handleRoomInput('storeRoom', $event)"
                    class="w-full px-4 py-3.5 border-2 border-wood-300 rounded-xl focus:outline-none focus:border-construction-500 focus:ring-4 focus:ring-construction-200 transition-all bg-white shadow-sm hover:shadow-md"
                    placeholder="e.g., 1"
                    required
                  />
                </div>

                <!-- Garage -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Garage (Cars)</label>
                  <input
                    v-model.number="formData.rooms.garage"
                    type="number"
                    min="0"
                    max="1"
                    @input="handleRoomInput('garage', $event)"
                    :class="[
                      'w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md',
                      roomErrors.garage ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'
                    ]"
                    placeholder="e.g., 1"
                    required
                  />
                  <p v-if="roomErrors.garage" class="text-xs text-red-600 mt-1 font-medium">{{ roomErrors.garage }}</p>
                </div>

                <!-- Servant Quarter -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Servant Quarter</label>
                  <input
                    v-model.number="formData.rooms.servantQuarter"
                    type="number"
                    min="0"
                    max="5"
                    @input="handleRoomInput('servantQuarter', $event)"
                    class="w-full px-4 py-3.5 border-2 border-wood-300 rounded-xl focus:outline-none focus:border-construction-500 focus:ring-4 focus:ring-construction-200 transition-all bg-white shadow-sm hover:shadow-md"
                    placeholder="e.g., 1"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Additional Features Section (Only for Full Ready House) -->
            <div v-if="formData.constructionType === 'complete'" class="construction-card p-8 transform hover:scale-[1.01] transition-transform duration-300">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                </div>
                <h2 class="text-3xl font-bold text-wood-800">Finishing & Additional Features</h2>
              </div>
              <p class="text-sm text-gray-600 mb-4">Select the finishing materials and features you want for your complete house:</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition">
                  <input
                    v-model="formData.features.electrical"
                    type="checkbox"
                    class="w-5 h-5 text-orange-600 rounded cursor-pointer"
                  />
                  <span class="ml-3 text-gray-700 font-medium">Complete Electrical System</span>
                </label>

                <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition">
                  <input
                    v-model="formData.features.plumbing"
                    type="checkbox"
                    class="w-5 h-5 text-orange-600 rounded cursor-pointer"
                  />
                  <span class="ml-3 text-gray-700 font-medium">Complete Plumbing System</span>
                </label>

                <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition">
                  <input
                    v-model="formData.features.hvac"
                    type="checkbox"
                    class="w-5 h-5 text-orange-600 rounded cursor-pointer"
                  />
                  <span class="ml-3 text-gray-700 font-medium">HVAC (Heating, Ventilation, AC)</span>
                </label>

                <label class="flex items-center p-5 border-2 border-wood-200 rounded-xl hover:border-construction-400 cursor-pointer transition-all duration-300 bg-gradient-to-r from-white to-wood-50/50 hover:from-wood-50 hover:to-construction-50/30 shadow-sm hover:shadow-md transform hover:scale-[1.02]">
                  <input
                    v-model="formData.features.tiles"
                    type="checkbox"
                    class="w-5 h-5 text-construction-600 rounded cursor-pointer focus:ring-2 focus:ring-construction-300"
                  />
                  <span class="ml-3 text-wood-800 font-bold">Premium Tiles/Flooring</span>
                </label>

                <label class="flex items-center p-5 border-2 border-wood-200 rounded-xl hover:border-construction-400 cursor-pointer transition-all duration-300 bg-gradient-to-r from-white to-wood-50/50 hover:from-wood-50 hover:to-construction-50/30 shadow-sm hover:shadow-md transform hover:scale-[1.02]">
                  <input
                    v-model="formData.features.paint"
                    type="checkbox"
                    class="w-5 h-5 text-construction-600 rounded cursor-pointer focus:ring-2 focus:ring-construction-300"
                  />
                  <span class="ml-3 text-wood-800 font-bold">Premium Paint & Finishing</span>
                </label>

                <label class="flex items-center p-5 border-2 border-wood-200 rounded-xl hover:border-construction-400 cursor-pointer transition-all duration-300 bg-gradient-to-r from-white to-wood-50/50 hover:from-wood-50 hover:to-construction-50/30 shadow-sm hover:shadow-md transform hover:scale-[1.02]">
                  <input
                    v-model="formData.features.landscaping"
                    type="checkbox"
                    class="w-5 h-5 text-construction-600 rounded cursor-pointer focus:ring-2 focus:ring-construction-300"
                  />
                  <span class="ml-3 text-wood-800 font-bold">Landscaping & Garden</span>
                </label>

                <label class="flex items-center p-5 border-2 border-wood-200 rounded-xl hover:border-construction-400 cursor-pointer transition-all duration-300 bg-gradient-to-r from-white to-wood-50/50 hover:from-wood-50 hover:to-construction-50/30 shadow-sm hover:shadow-md transform hover:scale-[1.02]">
                  <input
                    v-model="formData.features.boundaryWall"
                    type="checkbox"
                    class="w-5 h-5 text-construction-600 rounded cursor-pointer focus:ring-2 focus:ring-construction-300"
                  />
                  <span class="ml-3 text-wood-800 font-bold">Boundary Wall</span>
                </label>

                <label class="flex items-center p-5 border-2 border-wood-200 rounded-xl hover:border-construction-400 cursor-pointer transition-all duration-300 bg-gradient-to-r from-white to-wood-50/50 hover:from-wood-50 hover:to-construction-50/30 shadow-sm hover:shadow-md transform hover:scale-[1.02]">
                  <input
                    v-model="formData.features.gate"
                    type="checkbox"
                    class="w-5 h-5 text-construction-600 rounded cursor-pointer focus:ring-2 focus:ring-construction-300"
                  />
                  <span class="ml-3 text-wood-800 font-bold">Main Gate</span>
                </label>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="construction-card p-8">
              <button
                type="submit"
                :disabled="isCalculating"
                class="w-full px-8 py-5 btn-primary text-lg font-extrabold relative overflow-hidden group"
              >
                <span class="relative z-10 flex items-center justify-center gap-3">
                  <svg v-if="!isCalculating" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  <svg v-else class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                {{ isCalculating ? 'Calculating Cost...' : 'Calculate Construction Cost' }}
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Result Section -->
        <div class="lg:col-span-1">
          <div class="sticky top-8 space-y-6">
            <!-- Total Construction Cost Card -->
            <transition name="fade">
              <div v-if="estimationResult" class="construction-card p-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-wood-800">Total Construction Cost</h3>
                </div>

                <div class="space-y-3 mb-6">
                  <div class="flex justify-between items-center pb-3 border-b-2 border-wood-200">
                    <span class="text-wood-700 text-sm font-semibold flex items-center gap-2">
                      <div class="w-2 h-2 bg-construction-500 rounded-full"></div>
                      Total Material Cost
                    </span>
                    <span class="font-bold text-wood-800 text-lg">Rs {{ formatCurrency(estimationResult.materialBreakdownTotal || estimationResult.materialCost) }}</span>
                  </div>
                  <div class="flex justify-between items-center pb-3 border-b border-wood-200">
                    <span class="text-wood-700 text-sm font-semibold flex items-center gap-2">
                      <div class="w-2 h-2 bg-wood-500 rounded-full"></div>
                      Labor Cost
                    </span>
                    <span class="font-bold text-wood-800">Rs {{ formatCurrency(estimationResult.laborCost) }}</span>
                  </div>
                  <div class="flex justify-between items-center pb-3 border-b border-wood-200">
                    <span class="text-wood-700 text-sm font-semibold">Machinery Rental</span>
                    <span class="font-bold text-wood-800">Rs {{ formatCurrency(estimationResult.machineryRentalCost || 0) }}</span>
                  </div>
                  <div class="flex justify-between items-center pb-3 border-b border-wood-200">
                    <span class="text-wood-700 text-sm font-semibold">Overheads & Profit</span>
                    <span class="font-bold text-wood-800">Rs {{ formatCurrency(estimationResult.overheadCost || 0) }}</span>
                  </div>
                  <div v-if="estimationResult.roomCost > 0" class="flex justify-between items-center pb-3 border-b border-wood-200">
                    <span class="text-wood-700 text-sm font-semibold">Room Fittings</span>
                    <span class="font-bold text-wood-800">Rs {{ formatCurrency(estimationResult.roomCost) }}</span>
                  </div>
                  <div v-if="estimationResult.featuresCost > 0" class="flex justify-between items-center pb-3 border-b-2 border-wood-300">
                    <span class="text-wood-700 text-sm font-semibold">Additional Features</span>
                    <span class="font-bold text-wood-800">Rs {{ formatCurrency(estimationResult.featuresCost) }}</span>
                  </div>
                </div>

                <!-- Total -->
                <div class="bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl p-6 mb-4 shadow-xl transform hover:scale-[1.02] transition-transform">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-extrabold text-white">Total Estimated Cost</span>
                    <span class="text-3xl font-extrabold text-white">Rs {{ formatCurrency(estimationResult.totalCost) }}</span>
                  </div>
                </div>

                <!-- Cost Per Sq Meter -->
                <div class="text-center bg-gradient-to-br from-wood-100 to-wood-50 rounded-xl p-4 mb-4 border-2 border-wood-200 shadow-md">
                  <p class="text-xs text-wood-600 mb-2 font-semibold uppercase tracking-wide">Cost per Square Meter</p>
                  <p class="text-2xl font-extrabold text-construction-600">Rs {{ formatCurrency(estimationResult.costPerSqm) }}</p>
                </div>

                <!-- Actions -->
                <div class="space-y-3">
                  <button
                    @click="downloadEstimate"
                    class="w-full px-5 py-3 bg-gradient-to-r from-wood-600 to-wood-700 hover:from-wood-700 hover:to-wood-800 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Download Report
                  </button>
                  <button
                    @click="shareEstimate"
                    class="w-full px-5 py-3 bg-gradient-to-r from-construction-400 to-construction-500 hover:from-construction-500 hover:to-construction-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C9.589 12.938 10 12.052 10 11c0-1.657-.895-3-2-3s-2 1.343-2 3 .895 3 2 3c.348 0 .646-.051.924-.154m12.768-6.618A9 9 0 009.002 12c0 .998.158 1.970.46 2.908m0 0a15.326 15.326 0 01-4.77 3.646m16.31-6.554A9.001 9.001 0 009 2.049c-4.418 0-8.402 2.02-11.084 5.099m0 0a15.33 15.33 0 015.3 4.613m11.084-5.099a8.994 8.994 0 01-7.679 3.957"/>
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </transition>

            <!-- Complete Material Info Button -->
            <transition name="fade">
              <div v-if="estimationResult && estimationResult.materialBreakdown && estimationResult.materialBreakdown.length > 0" class="construction-card p-6">
                <div class="text-center">
                  <div class="w-16 h-16 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-wood-900 mb-2">View Complete Material Breakdown</h3>
                  <p class="text-wood-700 mb-6">See detailed breakdown of all materials organized by category</p>
                  <RouterLink
                    to="/complete-material-info"
                    class="inline-flex items-center gap-3 px-8 py-4 btn-primary text-lg font-extrabold"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Complete Material Info
                  </RouterLink>
                </div>
              </div>
            </transition>


            <!-- Info Card -->
            <div class="construction-card p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-gradient-to-br from-wood-500 to-wood-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-wood-800">Estimation Notes</h3>
              </div>
              <ul class="space-y-3 text-sm">
                <li class="flex gap-3 items-start">
                  <div class="w-6 h-6 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <span class="text-wood-700 font-medium">Based on current Pakistan market rates (2025)</span>
                </li>
                <li class="flex gap-3 items-start">
                  <div class="w-6 h-6 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <span class="text-wood-700 font-medium">Includes all standard construction materials</span>
                </li>
                <li class="flex gap-3 items-start">
                  <div class="w-6 h-6 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <span class="text-wood-700 font-medium">Labor costs for skilled & unskilled workers</span>
                </li>
                <li class="flex gap-3 items-start">
                  <div class="w-6 h-6 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <span class="text-wood-700 font-medium">Valid for 30 days from generation date</span>
                </li>
                <li class="flex gap-3 items-start">
                  <div class="w-6 h-6 bg-gradient-to-br from-wood-500 to-wood-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <span class="text-wood-700 font-medium">Final cost may vary based on site conditions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Restore token from localStorage on component mount
onMounted(() => {
  authStore.restoreFromStorage()
})

const formData = ref({
  plotLength: '',
  plotWidth: '',
  location: '',
  constructionType: 'grey', // 'grey' or 'complete'
  floors: 1,
  quality: 'standard',
  coveredAreaPercent: 100, // Always 100% - full plot coverage
  basement: 'no',
  rooms: {
    bedrooms: 3,
    bathrooms: 2,
    kitchen: 1,
    drawingRoom: 1,
    diningRoom: 1,
    storeRoom: 1,
    garage: 0,
    servantQuarter: 0
  },
  features: {
    electrical: true,
    plumbing: true,
    hvac: false,
    tiles: false,
    paint: false,
    landscaping: false,
    boundaryWall: false,
    gate: false
  }
})

const estimationResult = ref(null)
const isCalculating = ref(false)

// Constants for constraints (based on standard measurements)
const MIN_AREA_SQ_FEET = 544.5 // 2 marla (1 marla = 272.25 sq feet)
const MAX_AREA_SQ_FEET = 5445 // 20 marla (1 marla = 272.25 sq feet)
const MARLA_SIZE_SQ_FEET = 270

// Standard room sizes (in sq feet)
const ROOM_SIZES = {
  bedroom: 120,      // Average: 120-224 sq ft
  bathroom: 35,      // Average: 40-80 sq ft
  kitchen: 100,       // Average: 120-224 sq ft
  drawingRoom: 120,  // Average: 192-360 sq ft (living room)
  diningRoom: 200,   // Average: 150-250 sq ft
  storeRoom: 100,    // Average: 80-120 sq ft
  garage: 200,       // Per car: 200-300 sq ft
  servantQuarter: 150 // Average: 120-180 sq ft
}

// Usable area percentage (after accounting for walls, corridors, etc.)
const USABLE_AREA_PERCENT = 0.72 // 72% usable space

// Error messages
const areaError = ref('')
const roomErrors = ref({})

// Watch construction type and reset finishing features if grey structure is selected
watch(() => formData.value.constructionType, (newType) => {
  if (newType === 'grey') {
    // Reset finishing features for grey structure
    formData.value.features.tiles = false
    formData.value.features.paint = false
    formData.value.features.hvac = false
    formData.value.features.landscaping = false
  }
})

// Calculate plot area
const calculatedPlotArea = computed(() => {
  if (formData.value.plotLength && formData.value.plotWidth) {
    return (formData.value.plotLength * formData.value.plotWidth).toFixed(2)
  }
  return '0.00'
})

// Calculate plot area in marlas
const calculatedPlotAreaMarla = computed(() => {
  if (calculatedPlotArea.value !== '0.00') {
    return (parseFloat(calculatedPlotArea.value) / MARLA_SIZE_SQ_FEET).toFixed(2)
  }
  return '0.00'
})

// Check if area is below minimum (2 marla)
const belowMinArea = computed(() => {
  if (calculatedPlotArea.value !== '0.00') {
    const area = parseFloat(calculatedPlotArea.value)
    return area < MIN_AREA_SQ_FEET
  }
  return false
})

// Check if area exceeds maximum (20 marla)
const exceedsMaxArea = computed(() => {
  if (calculatedPlotArea.value !== '0.00') {
    const area = parseFloat(calculatedPlotArea.value)
    return area > MAX_AREA_SQ_FEET
  }
  return false
})

// Calculate maximum rooms based on covered area and number of floors
// Note: This is for display purposes only - actual validation uses area-based calculations
// Bathrooms are NOT counted as full rooms since they're much smaller (60 sq ft vs 150+ sq ft)
const maxRooms = computed(() => {
  if (calculatedPlotArea.value === '0.00' || !formData.value.plotLength || !formData.value.plotWidth || !formData.value.floors) {
    return 0
  }
  
  const plotArea = parseFloat(calculatedPlotArea.value)
  const singleFloorCoveredArea = plotArea * (100 / 100) // Always 100% coverage
  const totalCoveredArea = singleFloorCoveredArea * formData.value.floors // Multiply by number of floors
  const usableArea = totalCoveredArea * USABLE_AREA_PERCENT // 72% usable after accounting for walls, corridors
  
  // Using smaller average room size to allow more rooms
  // Reduced average accounts for mix of larger rooms (bedrooms, drawing room) and smaller rooms (store rooms, etc.)
  // This allows more rooms to fit within the available space
  const avgRoomSize = 100 // Reduced from ~197 sq ft to 100 sq ft to allow more rooms
  
  const maxRoomsCount = Math.floor(usableArea / avgRoomSize)
  
  return Math.max(1, maxRoomsCount) // At least 1 room
})

// Calculate recommended bathrooms based on plot dimensions
const recommendedBathrooms = computed(() => {
  if (calculatedPlotArea.value === '0.00' || !formData.value.plotLength || !formData.value.plotWidth || !formData.value.floors) {
    return 0
  }
  
  const marla = parseFloat(calculatedPlotAreaMarla.value)
  const floors = formData.value.floors || 1
  
  let bathroomsPerFloor
  if (marla <= 5) {
    bathroomsPerFloor = 4 // 5 marla = 4 per floor
  } else if (marla <= 10) {
    bathroomsPerFloor = 5 // 10 marla = 5 per floor
  } else if (marla <= 15) {
    bathroomsPerFloor = 6 // 15 marla = 6 per floor
  } else {
    bathroomsPerFloor = 7 // 20 marla = 7 per floor
  }
  
  return floors * bathroomsPerFloor
})

// Calculate total rooms entered (excluding bathrooms since they're much smaller)
const totalRoomsEntered = computed(() => {
  return (
    (formData.value.rooms.bedrooms || 0) +
    (formData.value.rooms.kitchen || 0) +
    (formData.value.rooms.drawingRoom || 0) +
    (formData.value.rooms.diningRoom || 0) +
    (formData.value.rooms.storeRoom || 0) +
    (formData.value.rooms.garage || 0) +
    (formData.value.rooms.servantQuarter || 0)
    // Bathrooms excluded - they're counted separately due to small size
  )
})

// Handle dimension input to prevent negative values
const handleDimensionInput = (field, event) => {
  const inputValue = event.target.value
  
  // Allow empty string for user to clear the field
  if (inputValue === '' || inputValue === '-') {
    formData.value[field] = ''
    return
  }
  
  const value = parseFloat(inputValue)
  
  // If negative, clear the field
  if (!isNaN(value) && value < 0) {
    formData.value[field] = ''
    event.target.value = ''
    return
  }
  
  // If valid positive number, update the model
  if (!isNaN(value) && value >= 0) {
    formData.value[field] = value
  }
}

// Validate dimension on blur
const validateDimension = (field) => {
  const value = formData.value[field]
  if (value !== '' && (isNaN(value) || value <= 0)) {
    formData.value[field] = ''
    alert(`${field === 'plotLength' ? 'Plot Length' : 'Plot Width'} must be a positive number greater than 0.`)
  } else if (value !== '' && value < 10) {
    alert(`${field === 'plotLength' ? 'Plot Length' : 'Plot Width'} must be at least 10 feet.`)
    formData.value[field] = 10
  } else if (value !== '' && value > 1000) {
    alert(`${field === 'plotLength' ? 'Plot Length' : 'Plot Width'} cannot exceed 1000 feet.`)
    formData.value[field] = 1000
  }
}


// Handle room input to prevent negative values
const handleRoomInput = (roomType, event) => {
  const inputValue = event.target.value
  const minValue = event.target.getAttribute('min') ? parseFloat(event.target.getAttribute('min')) : 0
  
  // Allow empty string or just minus sign for user to clear/modify the field
  if (inputValue === '' || inputValue === '-') {
    return
  }
  
  const value = parseFloat(inputValue)
  
  // If negative, set to minimum value
  if (!isNaN(value) && value < 0) {
    formData.value.rooms[roomType] = minValue
    event.target.value = minValue
    return
  }
  
  // If valid number, ensure it's at least the minimum
  if (!isNaN(value) && value >= 0) {
    formData.value.rooms[roomType] = Math.max(minValue, value)
  }
}

// Watch for area changes and validate
watch([() => formData.value.plotLength, () => formData.value.plotWidth], () => {
  // Ensure values are positive
  if (formData.value.plotLength !== '' && formData.value.plotLength <= 0) {
    formData.value.plotLength = ''
  }
  if (formData.value.plotWidth !== '' && formData.value.plotWidth <= 0) {
    formData.value.plotWidth = ''
  }
  
  if (belowMinArea.value) {
    areaError.value = `This service deals with plots of 2 marla (${MIN_AREA_SQ_FEET} sq feet) or more. Your plot area is ${calculatedPlotArea.value} sq feet (${calculatedPlotAreaMarla.value} marla).`
  } else if (exceedsMaxArea.value) {
    areaError.value = `This service deals with 20 marla (${MAX_AREA_SQ_FEET} sq feet) or less only. Your plot area is ${calculatedPlotArea.value} sq feet (${calculatedPlotAreaMarla.value} marla).`
  } else {
    areaError.value = ''
  }
  
  // Auto-update bathroom count when plot dimensions change
  if (calculatedPlotArea.value !== '0.00' && recommendedBathrooms.value > 0) {
    formData.value.rooms.bathrooms = recommendedBathrooms.value
  }
  
  // Revalidate rooms when area changes
  validateRooms()
})

// Watch for room changes and validate
watch(() => formData.value.rooms, () => {
  // Ensure all room values are non-negative
  Object.keys(formData.value.rooms).forEach(key => {
    const value = formData.value.rooms[key]
    if (value !== null && value !== undefined && (isNaN(value) || value < 0)) {
      // Get minimum value based on room type
      const minValue = (key === 'bedrooms' || key === 'bathrooms' || key === 'kitchen') ? 1 : 0
      formData.value.rooms[key] = minValue
    }
  })
  
  validateRooms()
}, { deep: true })

// Covered area is always 100% - no watcher needed

// Watch for number of floors changes
watch(() => formData.value.floors, () => {
  // Auto-update bathroom count when floors change
  if (calculatedPlotArea.value !== '0.00' && recommendedBathrooms.value > 0) {
    formData.value.rooms.bathrooms = recommendedBathrooms.value
  }
  
  validateRooms()
})

// Validate room specifications based on realistic capacity calculations
const validateRooms = () => {
  roomErrors.value = {}
  
  if (maxRooms.value === 0) {
    return // Can't validate without area
  }
  
  // Calculate total covered area and usable area
  const plotArea = parseFloat(calculatedPlotArea.value)
  const singleFloorCoveredArea = plotArea * (100 / 100) // Always 100% coverage
  const totalCoveredArea = singleFloorCoveredArea * (formData.value.floors || 1)
  const usableArea = totalCoveredArea * USABLE_AREA_PERCENT
  const marla = parseFloat(calculatedPlotAreaMarla.value)
  const floors = formData.value.floors || 1
  
  // Calculate total area required by entered rooms
  const totalRoomArea = 
    (formData.value.rooms.bedrooms || 0) * ROOM_SIZES.bedroom +
    (formData.value.rooms.bathrooms || 0) * ROOM_SIZES.bathroom +
    (formData.value.rooms.kitchen || 0) * ROOM_SIZES.kitchen +
    (formData.value.rooms.drawingRoom || 0) * ROOM_SIZES.drawingRoom +
    (formData.value.rooms.diningRoom || 0) * ROOM_SIZES.diningRoom +
    (formData.value.rooms.storeRoom || 0) * ROOM_SIZES.storeRoom +
    (formData.value.rooms.garage || 0) * ROOM_SIZES.garage +
    (formData.value.rooms.servantQuarter || 0) * ROOM_SIZES.servantQuarter
  
  // Check if total room area exceeds usable area
  // This is the primary validation - ensures all rooms fit within available space
  if (totalRoomArea > usableArea) {
    const excessArea = totalRoomArea - usableArea
    roomErrors.value.total = `Total room area (${Math.round(totalRoomArea)} sq ft) exceeds usable area (${Math.round(usableArea)} sq ft) by ${Math.round(excessArea)} sq ft for ${calculatedPlotAreaMarla.value} marla plot with ${floors} floor(s). Please reduce the number or size of rooms.`
  }
  
  // Individual room type validations based on realistic examples
  // Based on research: Single-story (3240 sq ft): 3-4 bedrooms, 2-3 bathrooms
  // Double-story (6480 sq ft): 5-6 bedrooms, 3-4 bathrooms
  // Triple-story (9720 sq ft): 7-8 bedrooms, 4-5 bathrooms
  
  // Bedrooms: Based on example - 5 marla with 2 floors = 5 bedrooms total
  // As floors increase, bedrooms increase proportionally
  if (formData.value.rooms.bedrooms > 0) {
    let maxBedroomsTotal
    if (marla <= 5) {
      maxBedroomsTotal = 5 // 5 marla = 5 bedrooms total
    } else if (marla <= 10) {
      maxBedroomsTotal = Math.floor(5 * (marla / 5)) // Scale proportionally
    } else if (marla <= 15) {
      maxBedroomsTotal = Math.floor(5 * (marla / 5))
    } else {
      maxBedroomsTotal = Math.floor(5 * (marla / 5)) // 20 marla = 20 bedrooms
    }
    // Scale with floors: 2 floors = base, 3 floors = base * 1.5, etc.
    const maxBedrooms = Math.floor(maxBedroomsTotal * (floors / 2))
    
    if (formData.value.rooms.bedrooms > maxBedrooms) {
      roomErrors.value.bedrooms = `Maximum ${maxBedrooms} bedrooms recommended for ${calculatedPlotAreaMarla.value} marla plot with ${floors} floor(s).`
    }
  }
  
  // Bathrooms: Based on example - 5 marla with 2 floors = 4 bathrooms per floor (8 total)
  // Scales with plot size: smaller plots have fewer bathrooms per floor
  if (formData.value.rooms.bathrooms > 0) {
    let bathroomsPerFloor
    if (marla <= 5) {
      bathroomsPerFloor = 4 // 5 marla = 4 per floor
    } else if (marla <= 10) {
      bathroomsPerFloor = 5 // 10 marla = 5 per floor
    } else if (marla <= 15) {
      bathroomsPerFloor = 6 // 15 marla = 6 per floor
    } else {
      bathroomsPerFloor = 7 // 20 marla = 7 per floor
    }
    const maxBathrooms = floors * bathroomsPerFloor
    
    if (formData.value.rooms.bathrooms > maxBathrooms) {
      roomErrors.value.bathrooms = `Maximum ${maxBathrooms} bathrooms recommended for ${calculatedPlotAreaMarla.value} marla plot with ${floors} floor(s) (${bathroomsPerFloor} per floor).`
    }
  }
  
  // Kitchen: Based on example - 1 per floor
  const maxKitchens = floors // 1 per floor
  if (formData.value.rooms.kitchen > maxKitchens) {
    roomErrors.value.kitchen = `Maximum ${maxKitchens} kitchen(s) recommended for ${floors} floor(s) (1 per floor).`
  }
  
  // Drawing Room: Only 1 total for the entire house (not per floor)
  const maxDrawingRooms = 1
  if (formData.value.rooms.drawingRoom > maxDrawingRooms) {
    roomErrors.value.drawingRoom = `Maximum 1 drawing room recommended for the entire house (not per floor).`
  }
  
  // Dining Room / TV Lounge: Based on example - 1 per floor
  const maxDiningRooms = floors // 1 per floor
  if (formData.value.rooms.diningRoom > maxDiningRooms) {
    roomErrors.value.diningRoom = `Maximum ${maxDiningRooms} dining room/TV lounge(s) recommended for ${floors} floor(s) (1 per floor).`
  }
  
  // Garage: Only 1 total for the entire house (not per floor)
  if (formData.value.rooms.garage > 0) {
    const maxGarage = 1
    if (formData.value.rooms.garage > maxGarage) {
      roomErrors.value.garage = `Maximum 1 garage recommended for the entire house (not per floor).`
    }
  }
}

const calculatedPlotAreaSqm = computed(() => {
  if (calculatedPlotArea.value !== '0.00') {
    return (parseFloat(calculatedPlotArea.value) * 0.092903).toFixed(2)
  }
  return '0.00'
})

const calculateCost = async () => {
  // Frontend validation before sending request
  const missingFields = []
  
  // Validate plot dimensions are positive
  if (!formData.value.plotLength || formData.value.plotLength <= 0 || isNaN(formData.value.plotLength)) {
    missingFields.push('Plot Length (must be a positive number)')
  }
  if (!formData.value.plotWidth || formData.value.plotWidth <= 0 || isNaN(formData.value.plotWidth)) {
    missingFields.push('Plot Width (must be a positive number)')
  }
  if (!formData.value.location || formData.value.location.trim() === '') {
    missingFields.push('City/Location')
  }
  if (!formData.value.floors || formData.value.floors < 1) {
    missingFields.push('Number of Floors')
  }
  if (!formData.value.quality) {
    missingFields.push('Construction Quality')
  }
  if (!formData.value.constructionType) {
    missingFields.push('Construction Type')
  }
  
  if (missingFields.length > 0) {
    alert(`Please fill in the following required fields:\n\n• ${missingFields.join('\n• ')}\n\nThese fields are mandatory to calculate the cost.`)
    return
  }
  
  // Validate area constraints (2 marla minimum, 20 marla maximum)
  if (belowMinArea.value) {
    alert(`This service deals with plots of 2 marla (${MIN_AREA_SQ_FEET} sq feet) or more.\n\nYour plot area is ${calculatedPlotArea.value} sq feet (${calculatedPlotAreaMarla.value} marla).\n\nPlease enter dimensions for a plot of at least 2 marla.`)
    return
  }
  
  if (exceedsMaxArea.value) {
    alert(`This service deals with 20 marla (${MAX_AREA_SQ_FEET} sq feet) or less only.\n\nYour plot area is ${calculatedPlotArea.value} sq feet (${calculatedPlotAreaMarla.value} marla).\n\nPlease enter dimensions for a plot of 20 marla or less.`)
    return
  }
  
  // Validate room constraints (bathrooms excluded from count since they're much smaller)
  // Primary validation is done by area calculation in validateRooms()
  // This is a secondary check for room count
  if (totalRoomsEntered.value > maxRooms.value) {
    alert(`Total rooms (${totalRoomsEntered.value}, excluding bathrooms) exceed the maximum recommended rooms (${maxRooms.value}) for a ${calculatedPlotAreaMarla.value} marla plot with ${formData.value.floors} floor(s).\n\nPlease reduce the number of rooms to proceed. Note: Bathrooms are counted separately due to their smaller size.`)
    return
  }
  
  // Check individual room errors
  const roomErrorMessages = []
  if (roomErrors.value.bedrooms) roomErrorMessages.push(roomErrors.value.bedrooms)
  if (roomErrors.value.bathrooms) roomErrorMessages.push(roomErrors.value.bathrooms)
  if (roomErrors.value.kitchen) roomErrorMessages.push(roomErrors.value.kitchen)
  if (roomErrors.value.drawingRoom) roomErrorMessages.push(roomErrors.value.drawingRoom)
  if (roomErrors.value.diningRoom) roomErrorMessages.push(roomErrors.value.diningRoom)
  if (roomErrors.value.garage) roomErrorMessages.push(roomErrors.value.garage)
  
  if (roomErrorMessages.length > 0) {
    alert(`Please adjust the following room specifications:\n\n• ${roomErrorMessages.join('\n• ')}\n\nThese constraints are based on the plot size to ensure realistic room layouts.`)
    return
  }

  // Check if user is authenticated
  if (!authStore.token || !authStore.isAuthenticated) {
    alert('You need to be logged in to calculate cost estimates. Please login first.')
    router.push('/login')
    return
  }

  isCalculating.value = true
  try {
    const plotAreaSqm = parseFloat(calculatedPlotAreaSqm.value)
    
    if (isNaN(plotAreaSqm) || plotAreaSqm <= 0) {
      alert('Please enter valid plot dimensions. Plot Length and Width must be greater than 0.')
      isCalculating.value = false
      return
    }
    
    const coveredAreaSqm = plotAreaSqm * (100 / 100) // Always 100% coverage
    
    // Ensure all values are properly formatted
    const requestData = {
      plotLength: parseFloat(formData.value.plotLength),
      plotWidth: parseFloat(formData.value.plotWidth),
      plotAreaSqm: parseFloat(plotAreaSqm),
      coveredAreaSqm: parseFloat(coveredAreaSqm),
      location: String(formData.value.location).trim(),
      constructionType: String(formData.value.constructionType),
      floors: parseInt(formData.value.floors),
      quality: String(formData.value.quality),
      coveredAreaPercent: 100, // Always 100% coverage
      basement: String(formData.value.basement),
      rooms: formData.value.rooms,
      features: formData.value.features
    }

    // Debug logging
    console.log('Sending request data:', requestData)
    console.log('Form data values:', {
      plotLength: formData.value.plotLength,
      plotWidth: formData.value.plotWidth,
      location: formData.value.location,
      floors: formData.value.floors,
      quality: formData.value.quality,
      coveredAreaPercent: formData.value.coveredAreaPercent
    })

    const response = await axios.post(
      `${API_URL}/cost-estimation/calculate`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    if (response.data.success) {
      estimationResult.value = {
        ...response.data.estimate,
        plotAreaSqm: plotAreaSqm,
        coveredAreaSqm: coveredAreaSqm
      }

      // Save estimate to localStorage for Complete Material Info page
      try {
        localStorage.setItem('lastEstimate', JSON.stringify(estimationResult.value))
      } catch (e) {
        console.error('Failed to save estimate to localStorage:', e)
      }

      // Save estimate
      try {
        await axios.post(
          `${API_URL}/cost-estimation/save`,
          {
            ...requestData,
            totalCost: estimationResult.value.totalCost
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`
            }
          }
        )
      } catch (error) {
        console.error('Failed to save estimate:', error)
      }
    }
  } catch (error) {
    console.error('Calculation error:', error)
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || 'Your session has expired. Please login again.'
      alert(errorMessage)
      authStore.logout()
      router.push('/login')
      return
    }
    
    // Show specific error message if backend provides missing fields
    if (error.response?.data?.missingFields) {
      alert(`Please fill in the following required fields:\n\n• ${error.response.data.missingFields.join('\n• ')}`)
    } else {
      const errorMessage = error.response?.data?.message || 'Error calculating cost. Please try again.'
      alert(errorMessage)
    }
  } finally {
    isCalculating.value = false
  }
}

// Helper function to format currency in Lakhs (Indian/Pakistani format)
const formatCurrencyInLakhs = (value) => {
  if (!value || isNaN(value)) return '0.00 Lakh'
  const lakhs = value / 100000
  return `${lakhs.toFixed(2)} Lakh`
}

// Helper function to format numbers with commas
const formatNumber = (value) => {
  if (!value || isNaN(value)) return '0'
  return parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0
  }).format(value)
}

const downloadEstimate = () => {
  if (!estimationResult.value) return

  const content = `COST ESTIMATION REPORT - MAP2HOME
Generated: ${new Date().toLocaleString('en-PK')}

PROJECT DETAILS
Plot Dimensions: ${formData.value.plotLength} ft x ${formData.value.plotWidth} ft
Plot Area: ${estimationResult.value.plotAreaSqm.toFixed(2)} m² (${calculatedPlotArea.value} sq ft)
Covered Area: ${estimationResult.value.coveredAreaSqm.toFixed(2)} m²
Location: ${formData.value.location}
Floors: ${formData.value.floors}
Construction Type: ${formData.value.constructionType === 'grey' ? 'Grey Structure Only' : 'Full Ready House'}
Construction Quality: ${formData.value.quality}
Basement: ${formData.value.basement}

ROOM SPECIFICATIONS
Bedrooms: ${formData.value.rooms.bedrooms}
Bathrooms: ${formData.value.rooms.bathrooms}
Kitchen: ${formData.value.rooms.kitchen}
Drawing Room: ${formData.value.rooms.drawingRoom}
Dining Room: ${formData.value.rooms.diningRoom}
Store Room: ${formData.value.rooms.storeRoom}
Garage: ${formData.value.rooms.garage}
Servant Quarter: ${formData.value.rooms.servantQuarter}

TOTAL CONSTRUCTION COST BREAKDOWN
Total Material Cost: Rs ${formatCurrency(estimationResult.value.materialBreakdownTotal || estimationResult.value.materialCost)}
Labor Cost: Rs ${formatCurrency(estimationResult.value.laborCost)}
Machinery Rental: Rs ${formatCurrency(estimationResult.value.machineryRentalCost || 0)}
Overheads & Contractor Profit: Rs ${formatCurrency(estimationResult.value.overheadCost || 0)}
Room Fittings: Rs ${formatCurrency(estimationResult.value.roomCost || 0)}
Additional Features: Rs ${formatCurrency(estimationResult.value.featuresCost)}

MATERIAL BREAKDOWN
${estimationResult.value.materialBreakdown ? estimationResult.value.materialBreakdown.map(m => 
  `${m.name}: ${m.quantity} ${m.unit} × Rs ${formatCurrency(m.unitPrice)}/${m.unit} = Rs ${formatCurrency(m.totalPrice)}`
).join('\n') : 'N/A'}

Total Material Cost: Rs ${formatCurrency(estimationResult.value.materialBreakdownTotal || estimationResult.value.materialCost)}

FEATURE BREAKDOWN
${estimationResult.value.featureBreakdown ? estimationResult.value.featureBreakdown.map(f => 
  `${f.name}: ${f.quantity} ${f.unit} × Rs ${formatCurrency(f.unitPrice)}/${f.unit} = Rs ${formatCurrency(f.totalPrice)}\n  (${f.description})`
).join('\n') : 'N/A'}

Total Features Cost: Rs ${formatCurrency(estimationResult.value.featureBreakdownTotal || estimationResult.value.featuresCost)}

TOTAL ESTIMATED COST: Rs ${formatCurrency(estimationResult.value.totalCost)}
Cost per Sq Meter: Rs ${formatCurrency(estimationResult.value.costPerSqm)}

Note: This estimate is valid for 30 days from the date of generation.
Final cost may vary based on site conditions and market fluctuations.`

  const blob = new Blob([content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cost-estimate-${Date.now()}.txt`
  link.click()
}

const shareEstimate = () => {
  if (!estimationResult.value) return
  const text = `Cost Estimation from Map2Home: Rs ${formatCurrency(estimationResult.value.totalCost)} for ${estimationResult.value.plotAreaSqm.toFixed(2)}m² plot in ${formData.value.location}`
  if (navigator.share) {
    navigator.share({
      title: 'Map2Home Cost Estimation',
      text: text
    })
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert('Estimate copied to clipboard!')
    })
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

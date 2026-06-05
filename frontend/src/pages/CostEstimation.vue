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
              <svg class="w-4 h-4 text-construction-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Plot Length &amp; Width (in feet)
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-construction-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              City/Location
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-construction-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Construction Type &amp; Quality
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-construction-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
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
                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    This service deals with plots of 2 marla ({{ MIN_AREA_SQ_FEET }} sq feet) or more.
                  </p>
                  <p v-else-if="exceedsMaxArea" class="text-xs text-red-600 mt-2 font-bold flex items-center gap-1">
                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    Maximum plot size is 20 marla ({{ MAX_AREA_SQ_FEET }} sq feet).
                  </p>
                  <p v-else-if="calculatedPlotArea !== '0.00'" class="text-xs text-green-600 mt-2 font-medium">
                    Within 2-20 marla limit
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

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <option value="complete">Full Ready House (Grey + Finishing)</option>
                  </select>
                  <p class="text-xs text-wood-600 mt-2 font-medium">
                    <span v-if="formData.constructionType === 'grey'">Only grey structure (foundation, bricks, concrete, etc.)</span>
                    <span v-else>Complete house with finishing (tiles, paint, woodwork, etc.)</span>
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
                  <p class="text-xs text-wood-600 mt-2 font-medium">
                    Grey Rate: Rs {{ GREY_RATES[formData.quality] }}/sq ft
                    <span v-if="formData.constructionType === 'complete'"> | Finishing Rate: Rs {{ FINISHING_RATES[formData.quality] }}/sq ft</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Lawn Section -->
            <div class="construction-card p-8 transform hover:scale-[1.01] transition-transform duration-300">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-3xl font-bold text-wood-800">Lawn / Open Space</h2>
                  <p class="text-sm text-wood-600 mt-1">Lawn area is left unbuilt on the ground floor — it reduces covered area and construction cost.</p>
                </div>
              </div>

              <!-- Toggle -->
              <div class="flex items-center gap-4 mb-6">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="formData.lawnPercent > 0"
                    @change="formData.lawnPercent = $event.target.checked ? 10 : 0"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span class="text-sm font-semibold text-wood-700">{{ formData.lawnPercent > 0 ? 'Lawn included' : 'No lawn (full plot covered)' }}</span>
              </div>

              <!-- Slider (only shown when lawn is enabled) -->
              <div v-if="formData.lawnPercent > 0" class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-wood-700">Lawn percentage of plot</span>
                  <span class="text-2xl font-extrabold text-green-600">{{ formData.lawnPercent }}%</span>
                </div>
                <input
                  v-model.number="formData.lawnPercent"
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div class="flex justify-between text-xs text-wood-500 font-medium">
                  <span>5%</span>
                  <span>10%</span>
                  <span>15%</span>
                  <span>20%</span>
                  <span>25%</span>
                  <span>30%</span>
                  <span>35%</span>
                  <span>40%</span>
                  <span>45%</span>
                  <span>50%</span>
                </div>

                <!-- Live preview of deduction -->
                <div v-if="formData.plotLength && formData.plotWidth" class="grid grid-cols-3 gap-3 mt-4">
                  <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p class="text-xs text-green-600 font-semibold mb-1">Lawn Area</p>
                    <p class="text-lg font-extrabold text-green-700">{{ (formData.plotLength * formData.plotWidth * formData.lawnPercent / 100).toFixed(0) }} sq ft</p>
                    <p class="text-xs text-green-500 mt-0.5">{{ formData.lawnPercent }}% of plot</p>
                  </div>
                  <div class="bg-construction-50 border border-construction-200 rounded-xl p-4 text-center">
                    <p class="text-xs text-construction-600 font-semibold mb-1">Built Ground Floor</p>
                    <p class="text-lg font-extrabold text-construction-700">{{ (formData.plotLength * formData.plotWidth * (1 - formData.lawnPercent / 100)).toFixed(0) }} sq ft</p>
                    <p class="text-xs text-construction-500 mt-0.5">{{ 100 - formData.lawnPercent }}% of plot</p>
                  </div>
                  <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p class="text-xs text-amber-600 font-semibold mb-1">Cost Saving</p>
                    <p class="text-lg font-extrabold text-amber-700">~{{ formData.lawnPercent }}% less</p>
                    <p class="text-xs text-amber-500 mt-0.5">on grey structure</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Room Specifications Section -->
            <div class="construction-card p-8 transform hover:scale-[1.01] transition-transform duration-300">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-construction-400 to-construction-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <h2 class="text-3xl font-bold text-wood-800">Room Specifications</h2>
                  <p class="text-sm text-wood-600 mt-1">Room counts are used for electrical &amp; plumbing material estimation.</p>
                </div>
              </div>

              <!-- Plot size context banner -->
              <div v-if="plotMarla > 0" class="mb-6 flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                <svg class="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-indigo-700 font-medium">
                  Limits are set for a <strong>{{ plotMarla.toFixed(1) }} marla</strong> plot ({{ formData.plotLength }}×{{ formData.plotWidth }} ft), {{ formData.floors }} floor(s).
                  Max values auto-update as you change the plot size or floors.
                </p>
              </div>
              <div v-else class="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-amber-700 font-medium">Enter plot dimensions above to activate smart room constraints based on your plot size.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                <!-- Bedrooms -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-1">Bedrooms</label>
                  <p class="text-xs text-wood-500 mb-2">Max {{ roomConstraints.bedrooms.max }} for this plot</p>
                  <input
                    v-model.number="formData.rooms.bedrooms"
                    type="number"
                    :min="roomConstraints.bedrooms.min"
                    :max="roomConstraints.bedrooms.max"
                    class="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md"
                    :class="formData.rooms.bedrooms > roomConstraints.bedrooms.max ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'"
                    placeholder="e.g., 3"
                    required
                  />
                  <p v-if="formData.rooms.bedrooms > roomConstraints.bedrooms.max" class="text-xs text-red-600 mt-1 font-semibold">
                    Exceeds max ({{ roomConstraints.bedrooms.max }}) for this plot size
                  </p>
                </div>

                <!-- Bathrooms -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-1">Bathrooms</label>
                  <p class="text-xs text-wood-500 mb-2">Max {{ Math.min(formData.rooms.bedrooms + 2, roomConstraints.bathrooms.max) }} (bedrooms + 2)</p>
                  <input
                    v-model.number="formData.rooms.bathrooms"
                    type="number"
                    :min="roomConstraints.bathrooms.min"
                    :max="Math.min(formData.rooms.bedrooms + 2, roomConstraints.bathrooms.max)"
                    class="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md"
                    :class="formData.rooms.bathrooms > Math.min(formData.rooms.bedrooms + 2, roomConstraints.bathrooms.max) ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'"
                    placeholder="e.g., 2"
                    required
                  />
                  <p v-if="formData.rooms.bathrooms > Math.min(formData.rooms.bedrooms + 2, roomConstraints.bathrooms.max)" class="text-xs text-red-600 mt-1 font-semibold">
                    Too many for {{ formData.rooms.bedrooms }} bedrooms
                  </p>
                </div>

                <!-- Kitchen -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-1">Kitchen</label>
                  <p class="text-xs text-wood-500 mb-2">Max {{ roomConstraints.kitchen.max }}</p>
                  <input
                    v-model.number="formData.rooms.kitchen"
                    type="number"
                    min="1"
                    :max="roomConstraints.kitchen.max"
                    class="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md"
                    :class="formData.rooms.kitchen > roomConstraints.kitchen.max ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'"
                    placeholder="1"
                    required
                  />
                  <p v-if="roomConstraints.kitchen.note" class="text-xs text-amber-600 mt-1">{{ roomConstraints.kitchen.note }}</p>
                </div>

                <!-- Drawing Room -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-1">Drawing Room</label>
                  <p class="text-xs text-wood-500 mb-2">Max {{ roomConstraints.drawingRoom.max }}</p>
                  <input
                    v-model.number="formData.rooms.drawingRoom"
                    type="number"
                    min="0"
                    :max="roomConstraints.drawingRoom.max"
                    class="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md"
                    :class="formData.rooms.drawingRoom > roomConstraints.drawingRoom.max ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'"
                    placeholder="1"
                    required
                  />
                </div>

                <!-- Dining Room / TV Lounge -->
                <div>
                  <label class="block text-sm font-bold text-wood-700 mb-1">Dining / TV Lounge</label>
                  <p class="text-xs text-wood-500 mb-2">Max {{ roomConstraints.diningRoom.max }}</p>
                  <input
                    v-model.number="formData.rooms.diningRoom"
                    type="number"
                    min="0"
                    :max="roomConstraints.diningRoom.max"
                    class="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white shadow-sm hover:shadow-md"
                    :class="formData.rooms.diningRoom > roomConstraints.diningRoom.max ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-wood-300 focus:border-construction-500 focus:ring-construction-200'"
                    placeholder="1"
                    required
                  />
                  <p v-if="roomConstraints.diningRoom.note" class="text-xs text-amber-600 mt-1">{{ roomConstraints.diningRoom.note }}</p>
                </div>

                <!-- Store Room -->
                <div>
                  <label class="block text-sm font-bold mb-1" :class="roomConstraints.storeRoom.disabled ? 'text-gray-400' : 'text-wood-700'">Store Room</label>
                  <p class="text-xs mb-2" :class="roomConstraints.storeRoom.disabled ? 'text-gray-400' : 'text-wood-500'">
                    {{ roomConstraints.storeRoom.disabled ? 'Not available on this plot' : 'Max ' + roomConstraints.storeRoom.max }}
                  </p>
                  <input
                    v-model.number="formData.rooms.storeRoom"
                    type="number"
                    min="0"
                    :max="roomConstraints.storeRoom.max"
                    :disabled="roomConstraints.storeRoom.disabled"
                    class="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all shadow-sm"
                    :class="roomConstraints.storeRoom.disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-wood-300 focus:border-construction-500 focus:ring-construction-200 hover:shadow-md'"
                    placeholder="0"
                  />
                  <p v-if="roomConstraints.storeRoom.disabled" class="text-xs text-gray-400 mt-1">Plot too small for store room</p>
                </div>

                <!-- Garage -->
                <div>
                  <label class="block text-sm font-bold mb-1" :class="roomConstraints.garage.disabled ? 'text-gray-400' : 'text-wood-700'">Garage (Cars)</label>
                  <p class="text-xs mb-2" :class="roomConstraints.garage.disabled ? 'text-gray-400' : 'text-wood-500'">
                    {{ roomConstraints.garage.disabled ? 'Not available on this plot' : 'Max ' + roomConstraints.garage.max + ' car(s)' }}
                  </p>
                  <input
                    v-model.number="formData.rooms.garage"
                    type="number"
                    min="0"
                    :max="roomConstraints.garage.max"
                    :disabled="roomConstraints.garage.disabled"
                    class="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all shadow-sm"
                    :class="roomConstraints.garage.disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-wood-300 focus:border-construction-500 focus:ring-construction-200 hover:shadow-md'"
                    placeholder="0"
                  />
                  <p v-if="roomConstraints.garage.note" class="text-xs text-indigo-600 mt-1">{{ roomConstraints.garage.note }}</p>
                  <p v-if="roomConstraints.garage.disabled" class="text-xs text-gray-400 mt-1">{{ roomConstraints.garage.note || 'No garage space on this plot' }}</p>
                </div>

                <!-- Servant Quarter -->
                <div>
                  <label class="block text-sm font-bold mb-1" :class="roomConstraints.servantQuarter.disabled ? 'text-gray-400' : 'text-wood-700'">Servant Quarter</label>
                  <p class="text-xs mb-2" :class="roomConstraints.servantQuarter.disabled ? 'text-gray-400' : 'text-wood-500'">
                    {{ roomConstraints.servantQuarter.disabled ? 'Not available on this plot' : 'Max ' + roomConstraints.servantQuarter.max }}
                  </p>
                  <input
                    v-model.number="formData.rooms.servantQuarter"
                    type="number"
                    min="0"
                    :max="roomConstraints.servantQuarter.max"
                    :disabled="roomConstraints.servantQuarter.disabled"
                    class="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all shadow-sm"
                    :class="roomConstraints.servantQuarter.disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-wood-300 focus:border-construction-500 focus:ring-construction-200 hover:shadow-md'"
                    placeholder="0"
                  />
                  <p v-if="roomConstraints.servantQuarter.note" class="text-xs mt-1" :class="roomConstraints.servantQuarter.disabled ? 'text-gray-400' : 'text-amber-600'">
                    {{ roomConstraints.servantQuarter.note }}
                  </p>
                </div>

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
                  {{ isCalculating ? 'Calculating...' : 'Calculate Construction Cost' }}
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- ============================================================ -->
        <!-- Result Section -->
        <!-- ============================================================ -->
        <div class="lg:col-span-1">
          <div class="sticky top-8 space-y-5">

            <!-- Cost Summary Card -->
            <transition name="fade">
              <div v-if="result" class="construction-card p-6">
                <div class="flex items-center gap-3 mb-5">
                  <div class="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-wood-800">Cost Summary</h3>
                </div>

                <div class="space-y-2 text-sm mb-4">
                  <div class="flex justify-between p-2 bg-wood-50 rounded-lg">
                    <span class="text-wood-700 font-semibold">Total Plot Area</span>
                    <span class="font-bold text-wood-800">{{ formatNumber(result.totalPlotArea) }} sq ft</span>
                  </div>
                  <div v-if="result.lawnArea > 0" class="flex justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                    <span class="text-green-700 font-semibold flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                      Lawn Area ({{ result.lawnPercent }}%)
                    </span>
                    <span class="font-bold text-green-700">− {{ formatNumber(result.lawnArea) }} sq ft</span>
                  </div>
                  <div class="flex justify-between p-2 bg-wood-50 rounded-lg">
                    <span class="text-wood-700 font-semibold">Ground Floor (Built)</span>
                    <span class="font-bold text-wood-800">{{ formatNumber(result.groundFloorArea) }} sq ft</span>
                  </div>
                  <div class="flex justify-between p-2 bg-wood-50 rounded-lg">
                    <span class="text-wood-700 font-semibold">Upper Floors Area</span>
                    <span class="font-bold text-wood-800">{{ formatNumber(result.upperFloorsArea) }} sq ft</span>
                  </div>
                  <div class="flex justify-between p-2 bg-construction-50 rounded-lg border border-construction-200">
                    <span class="text-construction-700 font-bold">Covered Area</span>
                    <span class="font-extrabold text-construction-800">{{ formatNumber(result.coveredArea) }} sq ft</span>
                  </div>
                </div>

                <div class="space-y-2 text-sm mb-4">
                  <div class="flex justify-between items-center p-2 border-b border-wood-200">
                    <span class="text-wood-700 font-semibold flex items-center gap-2">
                      <div class="w-2 h-2 bg-construction-500 rounded-full"></div>
                      Grey Structure Cost
                    </span>
                    <span class="font-bold text-wood-800">Rs {{ formatCurrency(result.greyCost) }}</span>
                  </div>
                  <div v-if="result.finishingCost > 0" class="flex justify-between items-center p-2 border-b border-wood-200">
                    <span class="text-wood-700 font-semibold flex items-center gap-2">
                      <div class="w-2 h-2 bg-wood-500 rounded-full"></div>
                      Finishing Cost
                    </span>
                    <span class="font-bold text-wood-800">Rs {{ formatCurrency(result.finishingCost) }}</span>
                  </div>
                </div>

                <!-- Total -->
                <div class="bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl p-5 shadow-xl">
                  <div class="flex justify-between items-center">
                    <span class="text-base font-extrabold text-white">Total Cost</span>
                    <span class="text-2xl font-extrabold text-white">Rs {{ formatCurrency(result.totalCost) }}</span>
                  </div>
                  <div class="text-xs text-white/80 mt-1 text-right">
                    Rs {{ formatCurrency(Math.round(result.totalCost / result.coveredArea)) }} / sq ft
                  </div>
                </div>
              </div>
            </transition>

            <!-- Grey Structure Breakdown Card -->
            <transition name="fade">
              <div v-if="result" class="construction-card p-5">
                <button @click="showGrey = !showGrey" class="w-full flex items-center justify-between mb-3">
                  <h3 class="text-base font-bold text-wood-800 flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                    Grey Structure Breakdown
                  </h3>
                  <svg :class="['w-5 h-5 text-wood-500 transition-transform', showGrey ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div v-show="showGrey" class="space-y-1.5">
                  <div v-for="item in result.greyBreakdown" :key="item.name" class="flex justify-between items-center p-2 bg-wood-50 rounded-lg text-xs">
                    <span class="text-wood-700 font-medium">{{ item.name }} <span class="text-wood-500">({{ item.percent }}%)</span></span>
                    <span class="font-bold text-wood-800">Rs {{ formatCurrency(item.amount) }}</span>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-construction-100 rounded-lg text-xs border border-construction-200 mt-2">
                    <span class="text-construction-700 font-bold">Total Grey Cost</span>
                    <span class="font-extrabold text-construction-800">Rs {{ formatCurrency(result.greyCost) }}</span>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Finishing Breakdown Card -->
            <transition name="fade">
              <div v-if="result && result.finishingCost > 0" class="construction-card p-5">
                <button @click="showFinishing = !showFinishing" class="w-full flex items-center justify-between mb-3">
                  <h3 class="text-base font-bold text-wood-800 flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-wood-500 to-wood-600 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                    </div>
                    Finishing Breakdown
                  </h3>
                  <svg :class="['w-5 h-5 text-wood-500 transition-transform', showFinishing ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div v-show="showFinishing" class="space-y-1.5">
                  <div v-for="item in result.finishingBreakdown" :key="item.name" class="flex justify-between items-center p-2 bg-wood-50 rounded-lg text-xs">
                    <span class="text-wood-700 font-medium">{{ item.name }} <span class="text-wood-500">({{ item.percent }}%)</span></span>
                    <span class="font-bold text-wood-800">Rs {{ formatCurrency(item.amount) }}</span>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-wood-200 rounded-lg text-xs border border-wood-300 mt-2">
                    <span class="text-wood-700 font-bold">Total Finishing Cost</span>
                    <span class="font-extrabold text-wood-800">Rs {{ formatCurrency(result.finishingCost) }}</span>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Material Estimation Card -->
            <transition name="fade">
              <div v-if="result" class="construction-card p-5">
                <button @click="showMaterials = !showMaterials" class="w-full flex items-center justify-between mb-3">
                  <h3 class="text-base font-bold text-wood-800 flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-construction-400 to-construction-500 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    </div>
                    Material Estimation
                  </h3>
                  <svg :class="['w-5 h-5 text-wood-500 transition-transform', showMaterials ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div v-show="showMaterials" class="space-y-1.5">
                  <div v-for="item in result.materials" :key="item.name" class="flex justify-between items-center p-2 bg-wood-50 rounded-lg text-xs">
                    <span class="text-wood-700 font-medium">{{ item.name }}</span>
                    <span class="font-bold text-wood-800">{{ formatNumber(item.qty) }} {{ item.unit }}</span>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Electrical System Card -->
            <transition name="fade">
              <div v-if="result" class="construction-card p-5">
                <button @click="showElectrical = !showElectrical" class="w-full flex items-center justify-between mb-3">
                  <h3 class="text-base font-bold text-wood-800 flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    Electrical System
                  </h3>
                  <svg :class="['w-5 h-5 text-wood-500 transition-transform', showElectrical ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div v-show="showElectrical" class="space-y-1.5">
                  <div v-for="item in result.electrical" :key="item.name" class="flex justify-between items-center p-2 bg-yellow-50 rounded-lg text-xs">
                    <span class="text-wood-700 font-medium">{{ item.name }}</span>
                    <span class="font-bold text-wood-800">{{ formatNumber(item.qty) }} {{ item.unit }}</span>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Plumbing System Card -->
            <transition name="fade">
              <div v-if="result" class="construction-card p-5">
                <button @click="showPlumbing = !showPlumbing" class="w-full flex items-center justify-between mb-3">
                  <h3 class="text-base font-bold text-wood-800 flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                    </div>
                    Plumbing System
                  </h3>
                  <svg :class="['w-5 h-5 text-wood-500 transition-transform', showPlumbing ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div v-show="showPlumbing" class="space-y-1.5">
                  <div v-for="item in result.plumbing" :key="item.name" class="flex justify-between items-center p-2 bg-blue-50 rounded-lg text-xs">
                    <span class="text-wood-700 font-medium">{{ item.name }}</span>
                    <span class="font-bold text-wood-800">{{ formatNumber(item.qty) }} {{ item.unit }}</span>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Actions Card -->
            <transition name="fade">
              <div v-if="result" class="construction-card p-5 space-y-3">
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-1.657-.895-3-2-3s-2 1.343-2 3 .895 3 2 3c.383 0 .74-.098 1.055-.27m7.261-4.46A2.996 2.996 0 0117 9c1.105 0 2 1.343 2 3s-.895 3-2 3c-.383 0-.74-.098-1.055-.27"/>
                  </svg>
                  Share
                </button>
              </div>
            </transition>

            <!-- Info Card -->
            <div class="construction-card p-5">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-gradient-to-br from-wood-500 to-wood-600 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="text-base font-bold text-wood-800">How It Works</h3>
              </div>
              <ul class="space-y-2 text-xs text-wood-700">
                <li class="flex gap-2 items-start">
                  <span class="text-construction-500 font-bold mt-0.5">1.</span>
                  <span>Covered Area = Ground Floor + Upper Floors</span>
                </li>
                <li class="flex gap-2 items-start">
                  <span class="text-construction-500 font-bold mt-0.5">2.</span>
                  <span>Grey Cost = Covered Area x Grey Rate</span>
                </li>
                <li class="flex gap-2 items-start">
                  <span class="text-construction-500 font-bold mt-0.5">3.</span>
                  <span>Finishing Cost = Covered Area x Finishing Rate</span>
                </li>
                <li class="flex gap-2 items-start">
                  <span class="text-construction-500 font-bold mt-0.5">4.</span>
                  <span>Total = Grey Cost + Finishing Cost</span>
                </li>
                <li class="flex gap-2 items-start">
                  <span class="text-wood-500 font-bold mt-0.5">*</span>
                  <span>Material, electrical &amp; plumbing estimates use industry-standard formulas for Pakistan</span>
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
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import {
  computeConstructionEstimate,
  GREY_RATES,
  FINISHING_RATES,
  MIN_AREA_SQ_FEET,
  MAX_AREA_SQ_FEET,
  MARLA_SIZE_SQ_FEET
} from '../utils/constructionEstimate'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// ──────────────────────────────────────────────
// Form data
// ──────────────────────────────────────────────
const formData = ref({
  plotLength: '',
  plotWidth: '',
  location: '',
  constructionType: 'grey',
  floors: 1,
  quality: 'standard',
  lawnPercent: 0,
  rooms: {
    bedrooms: 3,
    bathrooms: 2,
    kitchen: 1,
    drawingRoom: 1,
    diningRoom: 1,
    storeRoom: 1,
    garage: 0,
    servantQuarter: 0
  }
})

// ──────────────────────────────────────────────
// Room constraints based on plot size + floors
// ──────────────────────────────────────────────
const plotMarla = computed(() => {
  const l = Number(formData.value.plotLength)
  const w = Number(formData.value.plotWidth)
  if (!l || !w) return 0
  return (l * w) / MARLA_SIZE_SQ_FEET
})

// Returns { max, min, disabled, note } for each room type given current marla + floors
const roomConstraints = computed(() => {
  const m = plotMarla.value
  const f = Number(formData.value.floors) || 1

  // Bedrooms scale with floors: base + 1-2 per additional floor
  let maxBeds, maxBaths, maxKitchen, maxDrawing, maxDining, maxStore, maxGarage, maxServant
  let noteServant = '', noteGarage = '', noteKitchen = '', noteDining = ''

  if (m <= 0) {
    // No plot entered yet — use wide defaults
    return {
      bedrooms:       { min: 1, max: 8,  disabled: false },
      bathrooms:      { min: 1, max: 8,  disabled: false },
      kitchen:        { min: 1, max: 2,  disabled: false },
      drawingRoom:    { min: 0, max: 2,  disabled: false },
      diningRoom:     { min: 0, max: 2,  disabled: false },
      storeRoom:      { min: 0, max: 3,  disabled: false },
      garage:         { min: 0, max: 3,  disabled: false },
      servantQuarter: { min: 0, max: 1,  disabled: false }
    }
  }

  if (m < 3) {
    // < 3 marla — very tight
    maxBeds    = Math.min(1 + f, 3)
    maxBaths   = Math.min(1 + f, 3)
    maxKitchen = 1
    maxDrawing = 1
    maxDining  = 1
    maxStore   = 0
    maxGarage  = 0
    maxServant = 0
    noteServant = 'Not possible on plots below 3 marla'
    noteGarage  = 'No space for a garage below 3 marla'
    noteDining  = 'Combined with lounge on small plots'
  } else if (m < 4) {
    // 3 marla
    maxBeds    = Math.min(1 + f, 4)
    maxBaths   = Math.min(1 + f, 4)
    maxKitchen = 1
    maxDrawing = 1
    maxDining  = 1
    maxStore   = f >= 2 ? 1 : 0
    maxGarage  = 1
    maxServant = 0
    noteServant = 'Not feasible on 3 marla — no space for servant quarter'
    noteDining  = 'Usually combined lounge/dining on 3 marla'
  } else if (m < 5) {
    // 4 marla
    maxBeds    = Math.min(2 + f, 5)
    maxBaths   = Math.min(2 + f, 5)
    maxKitchen = 1
    maxDrawing = 1
    maxDining  = 1
    maxStore   = f >= 2 ? 1 : 0
    maxGarage  = 1
    maxServant = 0
    noteServant = 'Not feasible on 4 marla — insufficient space'
  } else if (m < 7) {
    // 5 marla
    maxBeds    = Math.min(2 + f, 6)
    maxBaths   = Math.min(2 + f, 6)
    maxKitchen = f >= 2 ? 2 : 1
    maxDrawing = 1
    maxDining  = f >= 2 ? 2 : 1
    maxStore   = 1
    maxGarage  = 1
    maxServant = 0
    noteServant = 'Servant quarter is not practical on 5 marla'
    noteKitchen = f < 2 ? 'Second kitchen only on double storey+' : ''
  } else if (m < 10) {
    // 7 marla
    maxBeds    = Math.min(2 + f * 2, 8)
    maxBaths   = Math.min(2 + f * 2, 7)
    maxKitchen = f >= 3 ? 3 : (f >= 2 ? 2 : 1)
    maxDrawing = f >= 2 ? 2 : 1
    maxDining  = f >= 2 ? 2 : 1
    maxStore   = 1
    maxGarage  = 1
    maxServant = 0
    noteServant = 'Servant quarter only available from 10 marla and above'
    noteGarage  = '1 car maximum on 7 marla'
  } else if (m < 15) {
    // 10 marla
    maxBeds    = Math.min(3 + f, 6)
    maxBaths   = Math.min(3 + f, 7)
    maxKitchen = 2
    maxDrawing = 1
    maxDining  = 2
    maxStore   = 1
    maxGarage  = 2
    maxServant = 1
    noteGarage  = '2-car garage standard on 10 marla'
  } else if (m < 20) {
    // 15 marla
    maxBeds    = Math.min(3 + f, 7)
    maxBaths   = Math.min(4 + f, 8)
    maxKitchen = 2
    maxDrawing = 1
    maxDining  = 2
    maxStore   = 2
    maxGarage  = 2
    maxServant = 1
  } else {
    // 20 marla / 1 kanal
    maxBeds    = Math.min(4 + f, 8)
    maxBaths   = Math.min(4 + f, 8)
    maxKitchen = 2
    maxDrawing = 1
    maxDining  = 2
    maxStore   = 3
    maxGarage  = 3
    maxServant = 1
    noteGarage  = 'Up to 3-car garage on 1 kanal'
  }

  return {
    bedrooms:       { min: 1, max: maxBeds,    disabled: false },
    bathrooms:      { min: 1, max: maxBaths,   disabled: false },
    kitchen:        { min: 1, max: maxKitchen, disabled: false, note: noteKitchen },
    drawingRoom:    { min: 0, max: maxDrawing, disabled: false },
    diningRoom:     { min: 0, max: maxDining,  disabled: false, note: noteDining },
    storeRoom:      { min: 0, max: maxStore,   disabled: maxStore === 0 },
    garage:         { min: 0, max: maxGarage,  disabled: maxGarage === 0, note: noteGarage },
    servantQuarter: { min: 0, max: maxServant, disabled: maxServant === 0, note: noteServant }
  }
})

// Auto-clamp room values when constraints change (plot size or floors change)
watch(roomConstraints, (c) => {
  const r = formData.value.rooms
  if (r.bedrooms    > c.bedrooms.max)       r.bedrooms       = c.bedrooms.max
  if (r.bedrooms    < c.bedrooms.min)       r.bedrooms       = c.bedrooms.min
  if (r.bathrooms   > c.bathrooms.max)      r.bathrooms      = c.bathrooms.max
  if (r.bathrooms   < c.bathrooms.min)      r.bathrooms      = c.bathrooms.min
  if (r.kitchen     > c.kitchen.max)        r.kitchen        = c.kitchen.max
  if (r.drawingRoom > c.drawingRoom.max)    r.drawingRoom    = c.drawingRoom.max
  if (r.diningRoom  > c.diningRoom.max)     r.diningRoom     = c.diningRoom.max
  if (r.storeRoom   > c.storeRoom.max)      r.storeRoom      = c.storeRoom.max
  if (c.storeRoom.disabled)                 r.storeRoom      = 0
  if (r.garage      > c.garage.max)         r.garage         = c.garage.max
  if (c.garage.disabled)                    r.garage         = 0
  if (r.servantQuarter > c.servantQuarter.max) r.servantQuarter = c.servantQuarter.max
  if (c.servantQuarter.disabled)            r.servantQuarter = 0
  // Bathrooms should not exceed bedrooms + 2
  const maxBathsByBeds = r.bedrooms + 2
  if (r.bathrooms > maxBathsByBeds) r.bathrooms = maxBathsByBeds
}, { deep: true })

// Also clamp bathrooms reactively when bedrooms change
watch(() => formData.value.rooms.bedrooms, (beds) => {
  const maxBaths = Math.min(beds + 2, roomConstraints.value.bathrooms.max)
  if (formData.value.rooms.bathrooms > maxBaths) {
    formData.value.rooms.bathrooms = maxBaths
  }
})

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
const result = ref(null)
const isCalculating = ref(false)

// Section toggles (all expanded by default)
const showGrey = ref(true)
const showFinishing = ref(true)
const showMaterials = ref(true)
const showElectrical = ref(true)
const showPlumbing = ref(true)

onMounted(() => {
  authStore.restoreFromStorage()
  const q = route.query
  if (q.plotLength != null && q.plotLength !== '') {
    const v = parseFloat(q.plotLength)
    if (!isNaN(v) && v > 0) formData.value.plotLength = v
  }
  if (q.plotWidth != null && q.plotWidth !== '') {
    const v = parseFloat(q.plotWidth)
    if (!isNaN(v) && v > 0) formData.value.plotWidth = v
  }
  if (typeof q.location === 'string' && q.location) {
    formData.value.location = q.location
  }
})

// ──────────────────────────────────────────────
// Computed: area helpers
// ──────────────────────────────────────────────
const calculatedPlotArea = computed(() => {
  if (formData.value.plotLength && formData.value.plotWidth) {
    return (formData.value.plotLength * formData.value.plotWidth).toFixed(2)
  }
  return '0.00'
})

const calculatedPlotAreaMarla = computed(() => {
  if (calculatedPlotArea.value !== '0.00') {
    return (parseFloat(calculatedPlotArea.value) / MARLA_SIZE_SQ_FEET).toFixed(2)
  }
  return '0.00'
})

const calculatedPlotAreaSqm = computed(() => {
  if (calculatedPlotArea.value !== '0.00') {
    return (parseFloat(calculatedPlotArea.value) * 0.092903).toFixed(2)
  }
  return '0.00'
})

const belowMinArea = computed(() => {
  if (calculatedPlotArea.value !== '0.00') {
    return parseFloat(calculatedPlotArea.value) < MIN_AREA_SQ_FEET
  }
  return false
})

const exceedsMaxArea = computed(() => {
  if (calculatedPlotArea.value !== '0.00') {
    return parseFloat(calculatedPlotArea.value) > MAX_AREA_SQ_FEET
  }
  return false
})

// ──────────────────────────────────────────────
// Input handlers
// ──────────────────────────────────────────────
const handleDimensionInput = (field, event) => {
  const inputValue = event.target.value
  if (inputValue === '' || inputValue === '-') {
    formData.value[field] = ''
    return
  }
  const value = parseFloat(inputValue)
  if (!isNaN(value) && value < 0) {
    formData.value[field] = ''
    event.target.value = ''
    return
  }
  if (!isNaN(value) && value >= 0) {
    formData.value[field] = value
  }
}

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

// ──────────────────────────────────────────────
// Watchers
// ──────────────────────────────────────────────
watch([() => formData.value.plotLength, () => formData.value.plotWidth], () => {
  if (formData.value.plotLength !== '' && formData.value.plotLength <= 0) {
    formData.value.plotLength = ''
  }
  if (formData.value.plotWidth !== '' && formData.value.plotWidth <= 0) {
    formData.value.plotWidth = ''
  }
})

// ──────────────────────────────────────────────
// Main calculation
// ──────────────────────────────────────────────
const calculateCost = () => {
  // --- validation ---
  const missing = []
  if (!formData.value.plotLength || formData.value.plotLength <= 0) missing.push('Plot Length')
  if (!formData.value.plotWidth || formData.value.plotWidth <= 0) missing.push('Plot Width')
  if (!formData.value.location) missing.push('City/Location')
  if (!formData.value.floors || formData.value.floors < 1) missing.push('Number of Floors')
  if (!formData.value.quality) missing.push('Construction Quality')

  if (missing.length > 0) {
    alert(`Please fill in:\n\n• ${missing.join('\n• ')}`)
    return
  }
  if (belowMinArea.value) {
    alert(`Plot must be at least 2 marla (${MIN_AREA_SQ_FEET} sq ft). Your plot: ${calculatedPlotArea.value} sq ft.`)
    return
  }
  if (exceedsMaxArea.value) {
    alert(`Plot must be at most 20 marla (${MAX_AREA_SQ_FEET} sq ft). Your plot: ${calculatedPlotArea.value} sq ft.`)
    return
  }

  if (!authStore.token || !authStore.isAuthenticated) {
    alert('Please login first to use the cost estimator.')
    router.push('/login')
    return
  }

  isCalculating.value = true

  // Small timeout for UX (shows spinner briefly)
  setTimeout(() => {
    try {
      const out = computeConstructionEstimate({
        plotLength: formData.value.plotLength,
        plotWidth: formData.value.plotWidth,
        location: formData.value.location,
        constructionType: formData.value.constructionType,
        floors: formData.value.floors,
        quality: formData.value.quality,
        lawnPercent: formData.value.lawnPercent,
        rooms: formData.value.rooms
      })

      if (!out.ok) {
        alert(out.message)
        return
      }

      result.value = out.result

      try {
        localStorage.setItem('lastEstimate', JSON.stringify(result.value))
      } catch (e) {
        console.error('Failed to save estimate to localStorage:', e)
      }
    } catch (error) {
      console.error('Calculation error:', error)
      alert('Something went wrong. Please check your inputs and try again.')
    } finally {
      isCalculating.value = false
    }
  }, 300)
}

// ──────────────────────────────────────────────
// Formatters
// ──────────────────────────────────────────────
const formatCurrency = (value) => {
  if (!value || isNaN(value)) return '0'
  return new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(value)
}

const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

// ──────────────────────────────────────────────
// Download report
// ──────────────────────────────────────────────
const downloadEstimate = () => {
  if (!result.value) return

  const r = result.value
  const fd = formData.value
  const lines = []

  lines.push('═══════════════════════════════════════════════════')
  lines.push('       COST ESTIMATION REPORT - MAP2HOME')
  lines.push('═══════════════════════════════════════════════════')
  lines.push(`Generated: ${new Date().toLocaleString('en-PK')}`)
  lines.push('')
  lines.push('── PROJECT DETAILS ──────────────────────────────')
  lines.push(`Plot Dimensions:    ${fd.plotLength} ft x ${fd.plotWidth} ft`)
  lines.push(`Plot Area:          ${calculatedPlotArea.value} sq ft (${calculatedPlotAreaMarla.value} marla)`)
  lines.push(`Location:           ${fd.location}`)
  lines.push(`Floors:             ${fd.floors}`)
  lines.push(`Construction Type:  ${fd.constructionType === 'grey' ? 'Grey Structure Only' : 'Full Ready House'}`)
  lines.push(`Quality:            ${fd.quality.charAt(0).toUpperCase() + fd.quality.slice(1)}`)
  if (r.lawnArea > 0) {
    lines.push(`Lawn / Open Space:  ${r.lawnPercent}% of plot (${formatNumber(r.lawnArea)} sq ft unbuilt)`)
  }
  lines.push('')
  lines.push('── COVERED AREA ─────────────────────────────────')
  lines.push(`Total Plot Area:    ${formatNumber(r.totalPlotArea)} sq ft`)
  if (r.lawnArea > 0) {
    lines.push(`Lawn Area (${r.lawnPercent}%):  − ${formatNumber(r.lawnArea)} sq ft`)
  }
  lines.push(`Ground Floor (Built): ${formatNumber(r.groundFloorArea)} sq ft`)
  lines.push(`Upper Floors Area:  ${formatNumber(r.upperFloorsArea)} sq ft`)
  lines.push(`Total Covered Area: ${formatNumber(r.coveredArea)} sq ft`)
  lines.push('')
  lines.push('── COST CALCULATION ─────────────────────────────')
  lines.push(`Grey Structure Cost:  Rs ${formatCurrency(r.greyCost)}  (${formatNumber(r.coveredArea)} x ${r.greyRate})`)
  if (r.finishingCost > 0) {
    lines.push(`Finishing Cost:       Rs ${formatCurrency(r.finishingCost)}  (${formatNumber(r.coveredArea)} x ${r.finishingRate})`)
  }
  lines.push(`────────────────────────────────────────────`)
  lines.push(`TOTAL COST:           Rs ${formatCurrency(r.totalCost)}`)
  lines.push('')
  lines.push('── GREY STRUCTURE BREAKDOWN ──────────────────────')
  r.greyBreakdown.forEach(item => {
    lines.push(`  ${item.name.padEnd(25)} ${String(item.percent).padStart(3)}%    Rs ${formatCurrency(item.amount)}`)
  })
  if (r.finishingCost > 0) {
    lines.push('')
    lines.push('── FINISHING BREAKDOWN ──────────────────────────')
    r.finishingBreakdown.forEach(item => {
      lines.push(`  ${item.name.padEnd(25)} ${String(item.percent).padStart(3)}%    Rs ${formatCurrency(item.amount)}`)
    })
  }
  lines.push('')
  lines.push('── MATERIAL ESTIMATION ──────────────────────────')
  r.materials.forEach(item => {
    lines.push(`  ${item.name.padEnd(25)} ${formatNumber(item.qty)} ${item.unit}`)
  })
  lines.push('')
  lines.push('── ROOM SPECIFICATIONS ─────────────────────────')
  lines.push(`  Bedrooms:      ${fd.rooms.bedrooms}`)
  lines.push(`  Bathrooms:     ${fd.rooms.bathrooms}`)
  lines.push(`  Kitchen:       ${fd.rooms.kitchen}`)
  lines.push(`  Drawing Room:  ${fd.rooms.drawingRoom}`)
  lines.push(`  Dining Room:   ${fd.rooms.diningRoom}`)
  lines.push(`  Store Room:    ${fd.rooms.storeRoom}`)
  lines.push(`  Garage:        ${fd.rooms.garage}`)
  lines.push(`  Servant Qtr:   ${fd.rooms.servantQuarter}`)
  lines.push('')
  lines.push('── ELECTRICAL SYSTEM ───────────────────────────')
  r.electrical.forEach(item => {
    lines.push(`  ${item.name.padEnd(25)} ${formatNumber(item.qty)} ${item.unit}`)
  })
  lines.push('')
  lines.push('── PLUMBING SYSTEM ────────────────────────────')
  r.plumbing.forEach(item => {
    lines.push(`  ${item.name.padEnd(25)} ${formatNumber(item.qty)} ${item.unit}`)
  })
  lines.push('')
  lines.push('═══════════════════════════════════════════════════')
  lines.push('Note: Estimate valid for 30 days. Final cost may')
  lines.push('vary based on site conditions & market rates.')
  lines.push('═══════════════════════════════════════════════════')

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cost-estimate-${Date.now()}.txt`
  link.click()
  window.URL.revokeObjectURL(url)
}

// ──────────────────────────────────────────────
// Share
// ──────────────────────────────────────────────
const shareEstimate = () => {
  if (!result.value) return
  const text = `Map2Home Cost Estimate: Rs ${formatCurrency(result.value.totalCost)} for ${formatNumber(result.value.coveredArea)} sq ft covered area (${formData.value.quality} quality) in ${formData.value.location}`
  if (navigator.share) {
    navigator.share({ title: 'Map2Home Cost Estimation', text })
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

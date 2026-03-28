<template>
  <div ref="editorRoot" class="json-map-editor h-full">
    <div :class="[
      'bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl border-2 border-indigo-100 h-full flex flex-col',
      compactMode ? 'p-2' : 'p-8'
    ]">
      <!-- Header -->
      <div :class="['flex items-center justify-between', compactMode ? 'mb-2' : 'mb-6']">
        <div>
          <h2 :class="[
            'font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent',
            compactMode ? 'text-lg' : 'text-3xl'
          ]">
            {{ mapData?.metadata?.name || 'JSON Map Editor' }}
          </h2>
          <p v-if="!compactMode" class="text-gray-600 text-sm mt-2 font-medium">
            Interactive floor plan editor - Click and drag to move objects
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Edit Mode Toggle -->
          <button
            @click="toggleEditMode"
            :class="[
              'px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold',
              editMode
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            ]"
            :title="editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'"
          >
            <svg v-if="editMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ editMode ? 'Editing' : 'View Only' }}
          </button>
          
          <!-- Save Button -->
          <button
            v-if="hasUnsavedChanges"
            @click="saveChanges"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2 font-semibold"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Changes
          </button>
          
          <!-- Fullscreen Toggle -->
          <button
            @click="toggleFullscreen"
            class="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors flex items-center gap-2 font-medium"
            :title="isFullscreen ? 'Exit Full Screen (Esc)' : 'Full Screen (F11)'"
          >
            <svg v-if="!isFullscreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4H4m0 0l5 5M9 15v5H4m0 0l5-5m6-6V4h5m0 0l-5 5m5 6v5h-5m0 0l5-5" />
            </svg>
            {{ isFullscreen ? 'Exit' : 'Full Screen' }}
          </button>

          <!-- Back to View Button -->
          <button
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Map View
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Loading map data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-red-800 font-semibold mb-2">Failed to load map</h3>
        <p class="text-sm text-red-700 mb-4">{{ error }}</p>
        <button @click="loadMapData" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
          Retry
        </button>
      </div>

      <!-- Map Editor -->
      <div v-else class="space-y-4">
        <!-- Tool strip (edit mode) -->
        <div
          v-if="editMode"
          class="flex flex-wrap items-center gap-2 bg-slate-800 text-white rounded-xl px-4 py-3 shadow-md border border-slate-600"
        >
          <span class="text-xs font-bold uppercase tracking-wide text-slate-300 mr-2">Tools</span>
          <button
            type="button"
            @click="toolMode = 'select'"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
              toolMode === 'select' ? 'bg-indigo-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            ]"
            title="Select and edit entities (V)"
          >Select</button>
          <button
            type="button"
            @click="toolMode = 'pan'"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
              toolMode === 'pan' ? 'bg-indigo-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            ]"
            title="Pan the view (H). Middle mouse always pans."
          >Pan</button>
          <button
            type="button"
            @click="toolMode = 'placeText'; insertMenuOpen = false"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
              toolMode === 'placeText' ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            ]"
            title="Click map to place a text note (T)"
          >Add text</button>
          <button
            type="button"
            @click="toggleMeasureMode(); insertMenuOpen = false"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1',
              measureMode ? 'bg-amber-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            ]"
            title="Measure distance between two points (M)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11v2M11 10v4M15 11v2M19 10v4" />
            </svg>
            Measure
          </button>
          <div class="relative">
            <button
              type="button"
              @click="insertMenuOpen = !insertMenuOpen"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center gap-1"
              title="Insert furniture / fixtures"
            >
              Insert
              <span class="text-[10px] opacity-80">▾</span>
            </button>
            <div
              v-if="insertMenuOpen"
              class="absolute left-0 top-full mt-1 z-30 min-w-[11rem] rounded-lg border border-slate-600 bg-slate-900 py-1 shadow-xl"
              @click.stop
            >
              <button
                v-for="item in furnitureMenuItems"
                :key="item.key"
                type="button"
                class="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 text-slate-100"
                @click="insertFurniturePreset(item.key); insertMenuOpen = false"
              >
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <!-- Icons are simplified; they only need to clearly indicate the furniture type -->
                    <path v-if="item.key === 'sofa'" d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
                    <path v-if="item.key === 'sofa'" d="M6 11h12v6H6z" />
                    <path v-if="item.key === 'bed'" d="M4 10h16v10" />
                    <path v-if="item.key === 'bed'" d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
                    <path v-if="item.key === 'table'" d="M4 7h16" />
                    <path v-if="item.key === 'table'" d="M6 7v6" />
                    <path v-if="item.key === 'table'" d="M18 7v6" />
                    <path v-if="item.key === 'table'" d="M5 13h14v7H5z" />
                    <path v-if="item.key === 'chair'" d="M9 11V7a2 2 0 0 1 2-2h2" />
                    <path v-if="item.key === 'chair'" d="M7 11h12v8H7z" />
                    <path v-if="item.key === 'toilet'" d="M9 6h6" />
                    <path v-if="item.key === 'toilet'" d="M9 6v5a4 4 0 0 0 4 4h2" />
                    <path v-if="item.key === 'toilet'" d="M7 19h10" />
                    <path v-if="item.key === 'kitchen'" d="M7 10h10v10H7z" />
                    <path v-if="item.key === 'kitchen'" d="M9 10V6h6v4" />
                    <path v-if="item.key === 'wardrobe'" d="M7 4h10v16H7z" />
                    <path v-if="item.key === 'wardrobe'" d="M12 4v16" />
                  </svg>
                  <span>{{ item.label }}</span>
                </span>
              </button>
            </div>
          </div>
          <span class="w-px h-6 bg-slate-600 mx-1" aria-hidden="true" />
          <button
            v-if="clipboard.length"
            type="button"
            @click="pasteMode = true; render()"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
              pasteMode ? 'bg-sky-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            ]"
            title="Paste copied object — click on map to place (Ctrl+V)"
          >Paste</button>
          <button
            type="button"
            @click="undoMap"
            :disabled="!canUndo"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >Undo</button>
          <button
            type="button"
            @click="redoMap"
            :disabled="!canRedo"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          >Redo</button>
          <span class="w-px h-6 bg-slate-600 mx-1" aria-hidden="true" />
          <button
            type="button"
            @click="fitMapToView"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white"
            title="Zoom to fit entire plan (F)"
          >Fit all</button>
          <button
            type="button"
            @click="fitSelectionToView"
            :disabled="!selectionCount"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom to selected object(s)"
          >Fit selection</button>
          <button
            type="button"
            @click="exportMapJson"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white"
            title="Download map JSON"
          >Export JSON</button>
          <span class="text-xs text-slate-400 ml-auto hidden sm:inline">Drag empty: box select · Ctrl+box: add · Shift+click: toggle · Alt+click: cycle stack</span>
        </div>

        <div
          v-if="editMode && constraintBanner"
          class="rounded-xl border border-amber-400/80 bg-amber-50 text-amber-950 px-4 py-2 text-sm shadow-sm flex items-center gap-2"
          role="alert"
        >
          <svg class="w-4 h-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span class="flex-1">{{ constraintBanner }}</span>
          <span v-if="constraintBannerAll.length > 1" class="text-xs text-amber-700 shrink-0">({{ constraintBannerAll.length }} issues)</span>
          <button
            v-if="constraintBannerAll.length > 1"
            class="text-xs underline text-amber-700 shrink-0 hover:text-amber-900"
            @click="nextConstraintBanner()"
          >next ›</button>
          <button
            class="ml-1 text-amber-600 hover:text-amber-900 shrink-0"
            @click="dismissConstraintBanner()"
            title="Dismiss"
          >✕</button>
        </div>

        <!-- Controls -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 shadow-md border border-indigo-200">
          <div class="flex flex-wrap items-center gap-2 sm:gap-4">
            <!-- Zoom Controls -->
            <button
              @click="zoomIn"
              class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md hover:shadow-lg"
              title="Zoom In"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              @click="zoomOut"
              class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md hover:shadow-lg"
              title="Zoom Out"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <button
              @click="resetView"
              class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md hover:shadow-lg"
              title="Reset View"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <span class="text-sm font-semibold text-indigo-700 bg-white px-3 py-1 rounded-lg shadow-sm">
              {{ Math.round(zoom * 100) }}%
            </span>
            <span v-if="marlaHintText" class="text-xs text-indigo-800 bg-white/90 px-2 py-1 rounded-lg border border-indigo-100 max-w-[14rem] leading-snug">
              {{ marlaHintText }}
            </span>
            <button
              @click="activateSelectMode"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm',
                editMode && toolMode === 'select' && !measureMode
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-white hover:bg-indigo-50 text-gray-700 border border-gray-200 hover:border-indigo-300'
              ]"
              title="Select &amp; drag objects. Shift+click to multi-select. (V)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13l6 6" />
              </svg>
              Select
            </button>
            <!-- Axis lock buttons -->
            <div class="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                @click="axisLock = 'free'"
                :class="[
                  'px-2.5 py-1.5 text-xs font-semibold transition-all',
                  axisLock === 'free'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
                title="Free movement — drag in any direction"
              >Free</button>
              <button
                @click="axisLock = axisLock === 'x' ? 'free' : 'x'"
                :class="[
                  'px-2.5 py-1.5 text-xs font-semibold transition-all border-l border-gray-200 flex items-center gap-1',
                  axisLock === 'x'
                    ? 'bg-rose-500 text-white'
                    : 'text-gray-600 hover:bg-rose-50'
                ]"
                title="Lock to X axis — move left/right only (X)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M16 8l4 4-4 4" />
                </svg>
                X
              </button>
              <button
                @click="axisLock = axisLock === 'y' ? 'free' : 'y'"
                :class="[
                  'px-2.5 py-1.5 text-xs font-semibold transition-all border-l border-gray-200 flex items-center gap-1',
                  axisLock === 'y'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:bg-emerald-50'
                ]"
                title="Lock to Y axis — move up/down only (Y)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M8 16l4 4 4-4" />
                </svg>
                Y
              </button>
            </div>
            <button
              @click="toggleMeasureMode"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm',
                measureMode
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white hover:bg-amber-50 text-gray-700 border border-gray-200 hover:border-amber-300'
              ]"
              title="Measure distance between two points (M). Click start → click end."
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11v2M11 10v4M15 11v2M19 10v4" />
              </svg>
              {{ measureMode ? (measureAnchor && !measureFixed ? 'Click endpoint���' : 'Measuring') : 'Measure' }}
            </button>
          </div>

          <!-- Layer Controls -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex flex-wrap items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 max-w-full">
              <span class="text-xs font-semibold text-gray-600 mr-1 shrink-0">Layers</span>
              <template v-for="layer in mapData?.layers" :key="layer.id">
                <div class="flex items-center gap-0.5 rounded border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    @click="toggleLayer(layer.id)"
                    :class="[
                      'flex items-center gap-1 px-2 py-1 text-xs transition-all',
                      layer.visible ? 'bg-gray-100' : 'bg-gray-50 opacity-50'
                    ]"
                    :title="layer.visible ? 'Hide ' + layer.name : 'Show ' + layer.name"
                  >
                    <div class="w-3 h-3 rounded shrink-0" :style="{ backgroundColor: layer.color }"></div>
                    <span class="text-gray-700 max-w-[5.5rem] truncate">{{ layer.name }}</span>
                  </button>
                  <button
                    type="button"
                    @click="toggleLayerLock(layer.id)"
                    class="px-1.5 py-1 text-xs bg-gray-50 hover:bg-amber-100 border-l border-gray-200"
                    :title="layer.locked ? 'Unlock layer' : 'Lock layer (no edit)'"
                  >{{ layer.locked ? '🔒' : '🔓' }}</button>
                </div>
              </template>
            </div>
          </div>

          <!-- Selected object(s) + edit actions -->
          <div v-if="selectionCount" class="flex flex-wrap items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <span class="text-xs font-semibold text-gray-600">Selected:</span>
            <template v-if="selectionCount === 1">
              <span class="text-xs text-indigo-600 font-bold">{{ selectedEntity.id }}</span>
              <span class="text-xs text-gray-500">({{ selectedEntity.type }})</span>
            </template>
            <template v-else>
              <span class="text-xs text-indigo-600 font-bold">{{ selectionCount }} objects</span>
            </template>
            <template v-if="editMode && selectionCount && hasUnlockedInSelection">
              <button
                type="button"
                class="text-xs px-2 py-1 rounded bg-white border border-gray-300 text-gray-800 hover:bg-gray-50"
                title="Shrink selection (~10%)"
                @click="scaleSelectedEntities(0.9)"
              >Smaller</button>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded bg-white border border-gray-300 text-gray-800 hover:bg-gray-50"
                title="Grow selection (~10%)"
                @click="scaleSelectedEntities(1.1)"
              >Larger</button>
            </template>
            <template v-if="editMode && hasDeletableSelection">
              <button
                v-if="singleLineSelected"
                type="button"
                class="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                @click="rotateLine90Selected"
              >Rotate 90°</button>
              <button
                v-if="!singleLineSelected && selectionCount > 0"
                type="button"
                class="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                title="Rotate selected items 90° around their center"
                @click="rotateSelectionGroup90()"
              >Rotate 90°</button>
              <button
                v-if="singleLineSelected"
                type="button"
                class="text-xs px-2 py-1 rounded bg-slate-100 text-slate-800 hover:bg-slate-200"
                @click="snapLineOrthogonalSelected"
              >Snap H/V</button>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded bg-sky-100 text-sky-900 hover:bg-sky-200"
                title="Copy selection — then click on map to place (Ctrl+C)"
                @click="copySelection"
              >Copy</button>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded bg-amber-100 text-amber-900 hover:bg-amber-200"
                title="Duplicate with fixed offset (Ctrl+D)"
                @click="duplicateSelection"
              >Duplicate</button>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                @click="deleteSelection"
              >Delete</button>
            </template>
          </div>
        </div>

        <!-- Property editor: dimensions, labels, rotation -->
        <div
          v-if="false && propertyPanelVisible && selectedEntity && !isEntityProtected(selectedEntity)"
          class="bg-white rounded-xl border border-indigo-200 shadow-md p-4 space-y-3"
        >
          <div class="flex flex-wrap items-center gap-2 justify-between">
            <h3 class="text-sm font-bold text-indigo-800">Edit properties</h3>
            <span class="text-xs text-gray-500 font-mono">{{ selectedEntity.id }}</span>
          </div>
          <div v-if="mapData?.metadata" class="text-xs">
            <label class="block text-gray-600 mb-0.5 font-semibold">Plan title</label>
            <input
              v-model="localMetadataName"
              type="text"
              class="w-full max-w-md border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Name shown in header / exports"
              @change="applyMapMetadataName"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <template v-if="wallBundleSelectionMeta">
              <div class="sm:col-span-2 lg:col-span-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p class="text-[11px] font-semibold text-slate-700">Thick wall (single unit)</p>
                <p class="text-[10px] text-slate-500">{{ wallBundleSelectionMeta.lines.length }} parallel lines move together. Drag blue corner squares to change length; drag the wall body to slide. Hold Shift while dragging an endpoint for horizontal/vertical snap.</p>
                <label class="block text-[11px] text-gray-600 font-semibold">Thickness preset (applies to pair)</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="p in WALL_THICKNESS_PRESETS_IN"
                    :key="p.ft"
                    type="button"
                    class="text-[11px] px-2 py-1 rounded-md bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300"
                    @click="applyWallThicknessPreset(p.ft)"
                  >{{ p.label }}</button>
                </div>
              </div>
            </template>
            <template v-if="selectedEntity.type === 'rect'">
              <div>
                <label class="block text-gray-600 mb-0.5">Width (ft)</label>
                <input
                  v-model.number="selectionPropsForm.width"
                  type="number"
                  min="0.01"
                  step="0.1"
                  class="w-full border border-gray-200 rounded px-2 py-1.5"
                />
              </div>
              <div>
                <label class="block text-gray-600 mb-0.5">Height (ft)</label>
                <input
                  v-model.number="selectionPropsForm.height"
                  type="number"
                  min="0.01"
                  step="0.1"
                  class="w-full border border-gray-200 rounded px-2 py-1.5"
                />
              </div>
              <div>
                <label class="block text-gray-600 mb-0.5">Rotation (°)</label>
                <input
                  v-model.number="selectionPropsForm.rotation"
                  type="number"
                  step="1"
                  class="w-full border border-gray-200 rounded px-2 py-1.5"
                />
                <p class="text-[10px] text-gray-400 mt-0.5">CCW · pivot = center</p>
              </div>
              <!-- Room minimum size hint -->
              <div v-if="selectedEntity.properties?.roomType" class="sm:col-span-2 lg:col-span-4">
                <p class="text-[11px] text-indigo-600 bg-indigo-50 rounded px-2 py-1">
                  {{ getRoomTypeLabel(selectedEntity.properties.roomType) }} minimum:
                  {{ getRoomMinSpec(selectedEntity.properties.roomType).w }} × {{ getRoomMinSpec(selectedEntity.properties.roomType).h }} ft
                  <span
                    v-if="!roomMeetsMinimumFootprint(selectionPropsForm.width, selectionPropsForm.height, getRoomMinSpec(selectedEntity.properties.roomType))"
                    class="ml-1 text-red-600 font-semibold"
                  >⚠ Below minimum</span>
                  <span v-else class="ml-1 text-green-600 font-semibold">✓ OK</span>
                </p>
              </div>
            </template>
            <template v-else-if="selectedEntity.type === 'text'">
              <div class="sm:col-span-2">
                <label class="block text-gray-600 mb-0.5">Label / title</label>
                <input
                  v-model="selectionPropsForm.text"
                  type="text"
                  class="w-full border border-gray-200 rounded px-2 py-1.5"
                />
              </div>
              <div>
                <label class="block text-gray-600 mb-0.5">Font size (ft)</label>
                <input
                  v-model.number="selectionPropsForm.fontSize"
                  type="number"
                  min="0.05"
                  step="0.05"
                  class="w-full border border-gray-200 rounded px-2 py-1.5"
                />
              </div>
              <div>
                <label class="block text-gray-600 mb-0.5">Rotation (°)</label>
                <input
                  v-model.number="selectionPropsForm.rotation"
                  type="number"
                  step="1"
                  class="w-full border border-gray-200 rounded px-2 py-1.5"
                />
              </div>
            </template>
            <template v-else-if="selectedEntity.type === 'line' && !wallBundleSelectionMeta">
              <div>
                <label class="block text-gray-600 mb-0.5">Length (ft)</label>
                <input
                  v-model.number="selectionPropsForm.lineLength"
                  type="number"
                  min="0.01"
                  step="0.1"
                  class="w-full border border-gray-200 rounded px-2 py-1.5"
                />
              </div>
              <div>
                <label class="block text-gray-600 mb-0.5">Angle (°)</label>
                <input
                  v-model.number="selectionPropsForm.lineAngleDeg"
                  type="number"
                  step="1"
                  class="w-full border border-gray-200 rounded px-2 py-1.5"
                />
                <p class="text-[10px] text-gray-400 mt-0.5">From +X; keeps midpoint</p>
              </div>
            </template>
            <template v-else-if="selectedEntity.type === 'polyline'">
              <div class="sm:col-span-2 space-y-3">
                <div>
                  <label class="block text-gray-600 mb-0.5">Rotate polyline by (°)</label>
                  <div class="flex gap-2">
                    <input
                      v-model.number="selectionPropsForm.polylineRotateDelta"
                      type="number"
                      step="1"
                      class="flex-1 border border-gray-200 rounded px-2 py-1.5"
                    />
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                      @click="applyPolylineRotateDelta"
                    >Apply</button>
                  </div>
                  <p class="text-[10px] text-gray-400 mt-0.5">Around centroid; use 90° to move furniture to another wall</p>
                </div>

                <div v-if="selectedEntity.layerId === 'furniture'">
                  <label class="block text-gray-600 mb-0.5">Furniture size</label>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-gray-600 mb-0.5 text-[11px]">Length (ft)</label>
                      <input
                        v-model.number="selectionPropsForm.furnitureLength"
                        type="number"
                        min="0.01"
                        step="0.1"
                        class="w-full border border-gray-200 rounded px-2 py-1.5"
                      />
                    </div>
                    <div>
                      <label class="block text-gray-600 mb-0.5 text-[11px]">Width (ft)</label>
                      <input
                        v-model.number="selectionPropsForm.furnitureWidth"
                        type="number"
                        min="0.01"
                        step="0.1"
                        class="w-full border border-gray-200 rounded px-2 py-1.5"
                      />
                    </div>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <button
                      type="button"
                      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg w-full"
                      @click="applyFurnitureSize"
                    >Apply furniture size</button>
                  </div>
                  <p class="text-[10px] text-gray-400 mt-0.5">
                    Scales the silhouette; Length/Width are based on the current axis-aligned bbox.
                  </p>
                </div>
              </div>
            </template>
            <template v-else-if="selectedEntity.type === 'arc' || selectedEntity.type === 'point'">
              <p class="text-gray-500 sm:col-span-2">Use drag to move. Rotation applies to rectangles and text.</p>
            </template>
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            <button
              v-if="selectedEntity.type === 'rect' || selectedEntity.type === 'text' || (selectedEntity.type === 'line' && !wallBundleSelectionMeta)"
              type="button"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
              @click="applySelectionPropsFromPanel"
            >Apply selection changes</button>
          </div>
        </div>

        <!-- Paste mode banner -->
        <div
          v-if="pasteMode"
          class="rounded-xl border border-sky-400/80 bg-sky-50 text-sky-950 px-4 py-2 text-sm shadow-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4 shrink-0 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="flex-1 font-medium">Click anywhere on the map to place the copied object</span>
          <button
            type="button"
            class="text-xs px-2 py-1 rounded bg-sky-200 hover:bg-sky-300 text-sky-900 font-semibold"
            @click="cancelPaste"
          >Cancel (Esc)</button>
        </div>

        <!-- Canvas Container -->
        <div
          ref="canvasContainer"
          :class="[
            'bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 rounded-xl overflow-hidden shadow-2xl relative',
            compactMode ? 'flex-1 border-2 border-indigo-200' : 'border-4 border-indigo-300',
            isFullscreen ? 'fullscreen-canvas-container' : ''
          ]"
          :style="isFullscreen ? '' : (compactMode ? 'min-height: 350px; width: 100%;' : 'height: 700px; width: 100%;')"
        >
          <canvas
            ref="canvas"
            style="display: block; width: 100%; height: 100%; touch-action: none;"
            :class="canvasCursorClass"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"
            @wheel="handleWheel"
            @contextmenu.prevent
          ></canvas>

          <!-- Directional smooth pan buttons -->
          <template v-if="showNavButtons">
            <button
              type="button"
              class="absolute top-3 left-1/2 -translate-x-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-md border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
              title="Pan up"
              @click="smoothPanBy(0, navPanStepWorld())"
            >
              <svg class="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5l-7 7m7-7l7 7" />
              </svg>
            </button>
            <button
              type="button"
              class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-md border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
              title="Pan down"
              @click="smoothPanBy(0, -navPanStepWorld())"
            >
              <svg class="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l-7-7m7 7l7-7" />
              </svg>
            </button>
            <button
              type="button"
              class="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-md border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
              title="Pan left"
              @click="smoothPanBy(-navPanStepWorld(), 0)"
            >
              <svg class="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12l7-7m-7 7l7 7" />
              </svg>
            </button>
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-md border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
              title="Pan right"
              @click="smoothPanBy(navPanStepWorld(), 0)"
            >
              <svg class="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 12l-7-7m7 7l-7 7" />
              </svg>
            </button>
          </template>

          <!-- Right-click context menu -->
          <div
            v-if="contextMenu.open"
            class="absolute z-40 min-w-[14rem] rounded-lg border border-gray-200 bg-white/95 backdrop-blur shadow-xl overflow-hidden"
            :style="{ left: contextMenu.screen.x + 'px', top: contextMenu.screen.y + 'px' }"
            @mousedown.stop
            @contextmenu.prevent
          >
            <div class="px-3 py-2 text-[11px] text-gray-500 border-b border-gray-100">
              {{ contextMenuTitle }}
            </div>
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="contextMenuSelectOnlyThis"
              :disabled="!editMode || !contextMenu.hitEntity || isEntityProtected(contextMenu.hitEntity)"
            >Select this (replace)</button>
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="contextMenuAddToSelection"
              :disabled="!editMode || !contextMenu.hitEntity || isEntityProtected(contextMenu.hitEntity)"
            >Add to selection</button>
            <div class="h-px bg-gray-100" />
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="copySelection(); closeContextMenu()"
              :disabled="!editMode || !hasDeletableSelection"
            >Copy (click to place)</button>
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="pasteMode = true; render(); closeContextMenu()"
              :disabled="!editMode || !clipboard.length"
            >Paste here</button>
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="contextMenuDuplicate"
              :disabled="!editMode || !hasDeletableSelection"
            >Duplicate</button>
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="contextMenuDelete"
              :disabled="!editMode || !hasDeletableSelection"
            >Delete</button>
            <div class="h-px bg-gray-100" />
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="contextMenuAddText"
              :disabled="!editMode"
            >Add text here</button>
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="contextMenuOpenFurniture"
              :disabled="!editMode"
            >Add furniture…</button>
            <div class="h-px bg-gray-100" />
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="rotateSelectionGroup90(); closeContextMenu()"
              :disabled="!editMode || !hasDeletableSelection"
            >Rotate 90°</button>
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="contextMenuScale(0.9)"
              :disabled="!editMode || !hasUnlockedInSelection"
            >Smaller</button>
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="contextMenuScale(1.1)"
              :disabled="!editMode || !hasUnlockedInSelection"
            >Larger</button>
          </div>

          <!-- Furniture modal (from context menu) -->
          <div
            v-if="furnitureModal.open"
            class="absolute inset-0 z-50 flex items-center justify-center bg-black/30"
            @mousedown.self="closeFurnitureModal"
          >
            <div class="w-[min(36rem,calc(100vw-2rem))] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
              <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <div class="font-semibold text-gray-900">Add furniture</div>
                  <div class="text-xs text-gray-500">Click an item to place it where you right-clicked.</div>
                </div>
                <button
                  type="button"
                  class="h-9 w-9 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                  @click="closeFurnitureModal"
                  aria-label="Close"
                >✕</button>
              </div>
              <div class="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  v-for="item in furnitureMenuItems"
                  :key="item.key"
                  type="button"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm"
                  @click="placeFurnitureFromModal(item.key)"
                >
                  <svg class="w-5 h-5 shrink-0 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path v-if="item.key === 'sofa'" d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
                    <path v-if="item.key === 'sofa'" d="M6 11h12v6H6z" />
                    <path v-if="item.key === 'bed'" d="M4 10h16v10" />
                    <path v-if="item.key === 'bed'" d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
                    <path v-if="item.key === 'table'" d="M4 7h16" />
                    <path v-if="item.key === 'table'" d="M6 7v6" />
                    <path v-if="item.key === 'table'" d="M18 7v6" />
                    <path v-if="item.key === 'table'" d="M5 13h14v7H5z" />
                    <path v-if="item.key === 'chair'" d="M9 11V7a2 2 0 0 1 2-2h2" />
                    <path v-if="item.key === 'chair'" d="M7 11h12v8H7z" />
                    <path v-if="item.key === 'toilet'" d="M9 6h6" />
                    <path v-if="item.key === 'toilet'" d="M9 6v5a4 4 0 0 0 4 4h2" />
                    <path v-if="item.key === 'toilet'" d="M7 19h10" />
                    <path v-if="item.key === 'kitchen'" d="M7 10h10v10H7z" />
                    <path v-if="item.key === 'kitchen'" d="M9 10V6h6v4" />
                    <path v-if="item.key === 'wardrobe'" d="M7 4h10v16H7z" />
                    <path v-if="item.key === 'wardrobe'" d="M12 4v16" />
                  </svg>
                  <span class="font-medium text-gray-900">{{ item.label }}</span>
                </button>
              </div>
              <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  @click="closeFurnitureModal"
                >Cancel</button>
              </div>
            </div>
          </div>
          
          <!-- Help: hidden until hover on eye -->
          <div class="absolute bottom-4 left-4 z-20 group">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
              aria-label="Show editor help"
              title="Hover for tips"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <div
              class="pointer-events-none invisible absolute bottom-11 left-0 w-[min(22rem,calc(100vw-2rem))] opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto"
            >
              <div class="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200 text-xs text-gray-600 space-y-1">
                <p v-if="editMode">
                  <span class="font-semibold text-green-600">Edit mode:</span>
                  <strong>Select</strong> — drag objects; empty drag = <strong>box select</strong> (Ctrl adds). <strong>Shift+click</strong> adds/removes (thick walls add as a pair).
                  <strong>Right‑click</strong> → <strong>Add to selection</strong> or <strong>Select this</strong>. Wall <strong>blue corners</strong> = resize length; <strong>Shift</strong> snaps orthogonal.
                  <strong>Insert</strong> adds furniture; <strong>Add text</strong> places notes. Green dot = <strong>rotate</strong> handle.
                  <strong>Smaller / Larger</strong> scales walls &amp; objects. <strong>Pan</strong> or middle mouse moves the view.
                  <span class="block mt-1 text-gray-500">V select · H pan · T add text · M measure · [ ] scale · F fit · Esc clear · Del remove · Ctrl+C copy · Ctrl+V paste · Ctrl+D duplicate · Ctrl+Z/Y undo redo</span>
                </p>
                <p v-else>
                  <span class="font-semibold text-gray-700">View mode:</span>
                  Scroll to zoom; drag to pan; right-click drag also pans.
                  <strong>M</strong> — measure tool: click two points to see distance.
                </p>
                <p class="text-gray-500 border-t border-gray-100 pt-1 mt-1">
                  Rooms detected: <span class="font-mono font-semibold text-gray-700">{{ roomsDetectedCount }}</span>
                  <span class="ml-1">(labels layer)</span>
                </p>
              </div>
            </div>
          </div>
          
          <!-- Coordinates Display -->
          <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs font-mono">
            <p class="text-gray-600">
              World: ({{ mouseWorldCoords.x.toFixed(1) }}, {{ mouseWorldCoords.y.toFixed(1) }}) ft
            </p>
          </div>
        </div>

        <!-- Entity List (for debugging/documentation) -->
        <div v-if="showEntityList" class="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
          <h4 class="font-semibold text-gray-700 mb-2">Entities ({{ mapData?.entities?.length || 0 }})</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div 
              v-for="entity in mapData?.entities" 
              :key="entity.id"
                @click="selectEntityRespectingWallBundle(entity)"
              :class="[
                'px-2 py-1 rounded cursor-pointer transition-all',
                isEntityInSelection(entity) ? 'bg-indigo-200 text-indigo-800' : 'bg-white hover:bg-gray-100'
              ]"
            >
              {{ entity.id }} ({{ entity.type }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * JsonMapEditor.vue - JSON-based Editable Map Component
 * 
 * This component provides an interactive canvas-based map editor that:
 * 1. Loads map data from a JSON file
 * 2. Renders entities (lines, rectangles, arcs, text, points) on a canvas
 * 3. Supports zoom and pan navigation
 * 4. Allows selecting and dragging objects in edit mode
 * 5. Saves changes back to JSON format
 * 
 * COORDINATE SYSTEMS:
 * - World Coordinates: The actual map space (in feet, as defined in JSON)
 * - Screen Coordinates: The canvas pixel coordinates
 * 
 * Transformation: screenCoord = (worldCoord - panOffset) * zoom * scale + canvasCenter
 */

import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import {
  annotatePerimeterEntities,
  annotatePerimeterForShellClusters,
  boundsIntersectionArea,
  computeWallGeometryBounds,
  computeWallShellClusters,
  DEFAULT_SETBACKS_FT,
  getMarlaSoftMaxDims,
  insetPlotBounds,
  isEntityPerimeterLocked,
  isValidBounds,
  pickSmallestShellBoundsContainingPoint,
  resolveShellBoundsForMap,
  unionBoundsArray,
  validateRoomLayout,
  validateSingleRoomRect,
  pointInAxisAlignedRect,
  extractRoomLabelPrefix,
  inferRoomAxisBoundsFromInteriorPoint,
  isWallCandidateLine,
  stripMtextLeaderCodes,
  getRoomTypeLabel,
  getRoomMinSpec,
  roomMeetsMinimumFootprint
} from '../utils/mapEditorConstraints.js'
import {
  assignWallBundleIds,
  applyThicknessToBundle,
  expandPerimeterLockToParallelWallFaces,
  getWallBundleLines,
  WALL_THICKNESS_PRESETS_IN
} from '../utils/wallBundleUtils.js'

// ============================================================================
// PROPS & EMITS
// ============================================================================

const props = defineProps({
  // URL to the JSON map file (optional if mapData is provided)
  mapUrl: {
    type: String,
    default: ''
  },
  // Direct map data object (optional if mapUrl is provided)
  mapData: {
    type: Object,
    default: null
  },
  // Title override
  mapTitle: {
    type: String,
    default: ''
  },
  // Initial edit mode state
  initialEditMode: {
    type: Boolean,
    default: false
  },
  compactMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save', 'entitySelected', 'mapLoaded', 'mapChanged'])

// ============================================================================
// REACTIVE STATE
// ============================================================================

// Refs
const editorRoot = ref(null)

// Canvas and rendering
const canvasContainer = ref(null)
const canvas = ref(null)
const ctx = ref(null)
const canvasWidth = ref(1200)
const canvasHeight = ref(700)

// Map data
const mapData = ref(null)
const originalMapData = ref(null) // For tracking changes
const loading = ref(true)
const error = ref(null)
const isFullscreen = ref(false)

// Render scheduling
let _renderRAF = 0
let _hoverRAF = 0

// View state (zoom and pan)
const zoom = ref(1)
const panOffset = ref({ x: 0, y: 0 })
const baseScale = ref(1) // Calculated to fit map in canvas

// Interaction state
const editMode = ref(false)
/** Multi-select: all selected map entities (same references as mapData.entities) */
const selectedEntities = ref([])
const hoveredEntity = ref(null)
const isDragging = ref(false)
const isPanning = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const entityDragStart = ref({ x: 0, y: 0 })
/** Snapshot of polyline points at drag start (whole-entity move) */
const dragPolylineSnapshot = ref(null)

// Mouse tracking
const mouseScreenCoords = ref({ x: 0, y: 0 })
const mouseWorldCoords = ref({ x: 0, y: 0 })

// UI state
const showEntityList = ref(false)
const hasUnsavedChanges = ref(false)

/** Rooms detected: count of inferred room rects (from DXF label inference) or text labels. */
const roomsDetectedCount = computed(() => {
  if (!mapData.value?.entities?.length) return 0
  const rects = mapData.value.entities.filter(
    e => e.type === 'rect' && (e.properties?.roomType || e.properties?.isRoom)
  ).length
  if (rects > 0) return rects
  return mapData.value.entities.filter(
    e => e.type === 'text' && e.layerId === 'labels'
  ).length
})

// Axis-lock for dragging: 'free' = both axes, 'x' = horizontal only, 'y' = vertical only
const axisLock = ref('free')

// Handle drag: line endpoints | rect SE resize | rotate | bbox corner resize
const draggingHandle = ref(null) // null | { kind: 'line', lineId, end } | { kind: 'rect-se' } | { kind: 'rotate' } | { kind: 'bbox', corner }
const rectResizeTopY = ref(0)
/** While dragging green rotation handle */
const rotateDragRef = ref(null) // { cx, cy, baseEntityDeg, basePointerRad }

const insertMenuOpen = ref(false)

// Copy / Paste clipboard
const clipboard = ref([])     // deep-cloned entities waiting to be pasted
const pasteMode = ref(false)  // true while user is clicking to place the copy
const pasteCursorWorld = ref({ x: 0, y: 0 })

// ============================================================================
// MEASUREMENT TOOL STATE
// ============================================================================
const measureMode = ref(false)
const measureAnchor = ref(null)  // { x, y } world coords — first click
const measureLive = ref(null)    // { x, y } world coords — cursor / second click
const measureFixed = ref(false)  // true after second click (measurement locked)

const HANDLE_HIT_PX = 14

// Canvas navigation buttons + context menu
const showNavButtons = ref(true)
const contextMenu = ref({
  open: false,
  screen: { x: 0, y: 0 }, // inside canvas container
  world: { x: 0, y: 0 },
  hasSelectionAtOpen: false,
  hitEntity: null
})
const furnitureModal = ref({
  open: false,
  world: { x: 0, y: 0 }
})

// Right-click: pan if dragged; otherwise open menu
const rightClickRef = ref({
  down: false,
  startedPan: false,
  startScreen: { x: 0, y: 0 }
})

// BBox corner resize support (polyline furniture + axis-aligned rect)
const BBOX_HANDLE_HIT_PX = 12
const bboxResizeRef = ref(null) // { ent, corner, bb, origPoints, origRect }

const contextMenuTitle = computed(() => {
  if (!contextMenu.value.open) return ''
  const x = contextMenu.value.world.x.toFixed(1)
  const y = contextMenu.value.world.y.toFixed(1)
  return contextMenu.value.hasSelectionAtOpen ? `Selection • (${x}, ${y})` : `Canvas • (${x}, ${y})`
})

const closeContextMenu = () => {
  contextMenu.value.open = false
}

const closeFurnitureModal = () => {
  furnitureModal.value.open = false
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const openContextMenuAt = (screenX, screenY) => {
  if (!canvasContainer.value) return
  const w = screenToWorld(screenX, screenY)
  const hasSel = selectedEntities.value.length > 0
  // Keep menu inside container bounds (simple clamp)
  const maxX = Math.max(0, canvasWidth.value - 240)
  const maxY = Math.max(0, canvasHeight.value - 240)
  const hitEntity =
    editMode.value && toolMode.value === 'select' ? findEntityAtPosition(screenX, screenY) : null
  contextMenu.value = {
    open: true,
    screen: { x: clamp(screenX, 6, maxX), y: clamp(screenY, 6, maxY) },
    world: { x: w.x, y: w.y },
    hasSelectionAtOpen: hasSel,
    hitEntity
  }
}

const contextMenuSelectOnlyThis = () => {
  const hit = contextMenu.value.hitEntity
  closeContextMenu()
  if (!editMode.value || !hit || isEntityProtected(hit)) return
  selectEntityRespectingWallBundle(hit)
  render()
}

const contextMenuAddToSelection = () => {
  const hit = contextMenu.value.hitEntity
  closeContextMenu()
  if (!editMode.value || !hit || isEntityProtected(hit)) return
  const expanded = expandSelectionWithWallBundles([hit])
  const ids = new Set(selectedEntities.value.map((e) => e.id))
  for (const e of expanded) {
    if (!ids.has(e.id)) {
      selectedEntities.value.push(e)
      ids.add(e.id)
    }
  }
  selectedEntities.value = expandSelectionWithWallBundles([...selectedEntities.value])
  emit('entitySelected', selectedEntities.value[0] ?? null)
  render()
}

const contextMenuDuplicate = () => {
  closeContextMenu()
  if (!editMode.value) return
  if (hasDeletableSelection.value) duplicateSelection()
}

const contextMenuDelete = () => {
  closeContextMenu()
  if (!editMode.value) return
  if (hasDeletableSelection.value) deleteSelection()
}

const contextMenuAddText = () => {
  if (!editMode.value) return
  const w = { ...contextMenu.value.world }
  closeContextMenu()
  recordHistoryBeforeMutation()
  addTextNoteAtWorld(w.x, w.y)
  toolMode.value = 'select'
}

const contextMenuOpenFurniture = () => {
  if (!editMode.value) return
  furnitureModal.value = { open: true, world: { ...contextMenu.value.world } }
  closeContextMenu()
}

const contextMenuScale = (factor) => {
  closeContextMenu()
  if (!editMode.value) return
  if (hasUnlockedInSelection.value) scaleSelectedEntities(factor)
}

const placeFurnitureFromModal = (key) => {
  const w = { ...furnitureModal.value.world }
  closeFurnitureModal()
  insertFurniturePreset(key, w)
}

const navPanStepWorld = () => {
  // Move by ~25% of the visible span (world units), clamped
  const scale = baseScale.value * zoom.value
  const worldPerPx = 1 / Math.max(1e-6, scale)
  const step = Math.max(2, Math.min(20, Math.min(canvasWidth.value, canvasHeight.value) * worldPerPx * 0.25))
  return step
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const smoothPanBy = (dxWorld, dyWorld, durationMs = 220) => {
  const start = { ...panOffset.value }
  const target = { x: start.x + dxWorld, y: start.y + dyWorld }
  const t0 = performance.now()
  const tick = (now) => {
    const t = Math.min(1, (now - t0) / durationMs)
    const k = easeOutCubic(t)
    panOffset.value = {
      x: start.x + (target.x - start.x) * k,
      y: start.y + (target.y - start.y) * k
    }
    render()
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** ~14px on screen in world units — easier to grab walls when zoomed out */
const getWorldHitTolerance = () => {
  const scale = baseScale.value * zoom.value
  return Math.max(0.08, 14 / scale)
}

const DEBUG = false

const toolMode = ref('select') // 'select' | 'pan' | 'placeText'

const canvasCursorClass = computed(() => {
  if (pasteMode.value) return 'cursor-copy'
  if (measureMode.value) return 'cursor-crosshair'
  if (isPanning.value) return 'cursor-grabbing'
  if (!editMode.value) return 'cursor-grab'
  if (toolMode.value === 'placeText') return 'cursor-cell'
  if (toolMode.value === 'pan') return isDragging.value ? 'cursor-grabbing' : 'cursor-grab'
  if (isDragging.value) return 'cursor-grabbing'
  return 'cursor-crosshair'
})

/** Alt+click stack for overlapping entities */
const lastAltPickScreen = ref({ x: -9999, y: -9999 })
const altPickCycle = ref(0)

/** Cached layer lookup map — rebuilt lazily when layers array ref changes. */
let _layerMapCache = null
let _layerMapSrc = null
const getLayerMap = () => {
  const layers = mapData.value?.layers
  if (!layers) return {}
  if (layers === _layerMapSrc && _layerMapCache) return _layerMapCache
  const m = {}
  for (const l of layers) m[l.id] = l
  _layerMapCache = m
  _layerMapSrc = layers
  return m
}

const isLayerLocked = (entity) => {
  const layer = getLayerMap()[entity.layerId]
  return !!(layer && layer.locked)
}

/** Layer lock OR outer shell (perimeter walls / plot corners) — cannot select or edit. */
const isEntityProtected = (entity) => isLayerLocked(entity) || isEntityPerimeterLocked(entity)

const isRoomFootprint = (entity) =>
  !!(
    entity &&
    entity.type === 'rect' &&
    (entity.properties?.roomType || entity.properties?.isRoom) &&
    Math.abs(entity.rotation || 0) < 1e-3
  )

/** Room/hatch rectangles: show live W×H on canvas (many DXF maps omit roomType). */
const isRectEligibleForDimensionOverlay = (e) =>
  !!(
    e &&
    e.type === 'rect' &&
    Math.abs(e.rotation || 0) < 1e-3 &&
    e.layerId !== 'furniture' &&
    e.layerId !== 'rooms' &&
    (e.width || 0) >= 0.35 &&
    (e.height || 0) >= 0.35
  )

/** Snapshot at load: fixed building/plot outline for perimeter detection & setbacks. */
const fixedConstraintBounds = ref(null)
/** Each entry: { bounds, lineSet: Set of line entities } for multi-plan DXFs. */
const shellClusters = ref([])
const constraintBanner = ref('')
const constraintBannerAll = ref([])
const constraintBannerIdx = ref(0)
const roomDragLastGoodDelta = ref({ dx: 0, dy: 0 })
const groupDragLastGoodDelta = ref({ dx: 0, dy: 0 })
/** Dotted clearance guide while dragging wall bundles (world coords + labels). */
const wallDragGuide = ref(null)
/** Live dimension tooltip during any drag (world center + label string). */
const dragDimOverlay = ref(null)

const effectivePlotBounds = computed(() => {
  const m = mapData.value?.metadata
  if (m?.plotBounds && isValidBounds(m.plotBounds)) {
    return {
      minX: Number(m.plotBounds.minX),
      maxX: Number(m.plotBounds.maxX),
      minY: Number(m.plotBounds.minY),
      maxY: Number(m.plotBounds.maxY)
    }
  }
  if (fixedConstraintBounds.value && isValidBounds(fixedConstraintBounds.value)) {
    return { ...fixedConstraintBounds.value }
  }
  return null
})

const innerConstraintRect = computed(() => {
  const plot = effectivePlotBounds.value
  if (!plot || !isValidBounds(plot)) return null
  const m = mapData.value?.metadata
  const hasLandPlot = m?.plotBounds && isValidBounds(m.plotBounds)
  if (!hasLandPlot) {
    return { ...plot }
  }
  const raw = m?.setbacks
  const sb =
    raw && typeof raw === 'object'
      ? { ...DEFAULT_SETBACKS_FT, ...raw }
      : DEFAULT_SETBACKS_FT
  return insetPlotBounds(plot, sb) || { ...plot }
})

const marlaHintText = computed(() => {
  const m = mapData.value?.metadata?.plotMarla
  if (m == null || m === '') return ''
  const dims = getMarlaSoftMaxDims(Number(m))
  if (!dims) return `Plot: ${m} marla`
  return `${m} marla — max footprint ≈ ${dims.w}×${dims.d} ft`
})

const recomputeConstraintBanner = () => {
  const inner = innerConstraintRect.value
  if (!mapData.value?.entities?.length || !inner || !isValidBounds(inner)) {
    constraintBanner.value = ''
    constraintBannerAll.value = []
    constraintBannerIdx.value = 0
    return
  }
  const marla = mapData.value?.metadata?.plotMarla ?? null
  const { ok, issues } = validateRoomLayout(mapData.value.entities, inner, { plotMarla: marla })
  if (ok) {
    constraintBanner.value = ''
    constraintBannerAll.value = []
    constraintBannerIdx.value = 0
  } else {
    constraintBannerAll.value = issues.map((i) => i.message).filter(Boolean)
    constraintBannerIdx.value = 0
    constraintBanner.value = constraintBannerAll.value[0] || 'Layout rule violation'
  }
}

const dismissConstraintBanner = () => {
  constraintBanner.value = ''
  constraintBannerAll.value = []
  constraintBannerIdx.value = 0
}

const nextConstraintBanner = () => {
  if (!constraintBannerAll.value.length) return
  constraintBannerIdx.value = (constraintBannerIdx.value + 1) % constraintBannerAll.value.length
  constraintBanner.value = constraintBannerAll.value[constraintBannerIdx.value]
}
const fmtDimFt = (v) => {
  const n = Math.round((Number(v) || 0) * 10) / 10
  return Number.isInteger(n) ? `${Math.round(n)}` : n.toFixed(1)
}

/** For CAD walls ~axis-aligned, show run (max Δ) instead of diagonal jitter across the sheet. */
const LINE_AXIS_ALIGN_RATIO = 0.06
const displayLineRunLengthFt = (line) => {
  if (!line?.start || !line?.end) return 0
  const dx = line.end.x - line.start.x
  const dy = line.end.y - line.start.y
  const ax = Math.abs(dx)
  const ay = Math.abs(dy)
  const h = Math.hypot(dx, dy)
  if (h < 1e-6) return 0
  const ratio = Math.min(ax, ay) / Math.max(ax, ay, 1e-9)
  if (ratio <= LINE_AXIS_ALIGN_RATIO) return Math.max(ax, ay)
  return h
}

const drawRoomDimensionOverlays = (context) => {
  const ents = mapData.value?.entities
  if (!ents?.length || !editMode.value) return
  const inner = innerConstraintRect.value

  const drawDimLabel = (pos, label, strokeRgb = '79, 70, 229', bgAlpha = 0.94) => {
    context.save()
    const fs = Math.max(11, Math.min(18, 11 + 4 * Math.sqrt(zoom.value)))
    context.font = `600 ${fs}px system-ui, Segoe UI, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    const pad = 5
    const tw = context.measureText(label).width
    const th = fs
    context.fillStyle = `rgba(255,255,255,${bgAlpha})`
    context.strokeStyle = `rgba(${strokeRgb}, 0.55)`
    context.lineWidth = 1.5
    context.fillRect(pos.x - tw / 2 - pad, pos.y - th / 2 - pad, tw + pad * 2, th + pad * 2)
    context.strokeRect(pos.x - tw / 2 - pad, pos.y - th / 2 - pad, tw + pad * 2, th + pad * 2)
    context.fillStyle = `rgb(${strokeRgb})`
    context.fillText(label, pos.x, pos.y)
    context.restore()
  }

  for (const e of ents) {
    if (!isRectEligibleForDimensionOverlay(e)) continue
    const cx = e.x + e.width / 2
    const cy = e.y + e.height / 2
    const label = `${fmtDimFt(e.width)} × ${fmtDimFt(e.height)} ft`

    // Check if this room violates minimum size — show red
    let rgb = '79, 70, 229' // indigo default
    if (isRoomFootprint(e) && inner && isValidBounds(inner)) {
      const spec = getRoomMinSpec(e.properties?.roomType)
      if (!roomMeetsMinimumFootprint(e.width, e.height, spec)) {
        rgb = '220, 38, 38' // red for violation
      }
    }
    // Highlight selected room with green
    if (selectedEntity.value?.id === e.id) {
      rgb = '22, 163, 74'
    }
    drawDimLabel(worldToScreen(cx, cy), label, rgb)
  }

  if (selectionCount.value === 1) {
    const e = selectedEntity.value
    if (e?.type === 'line' && e.start && e.end && !isEntityProtected(e)) {
      const len = displayLineRunLengthFt(e)
      if (len >= 0.04) {
        const mx = (e.start.x + e.end.x) / 2
        const my = (e.start.y + e.end.y) / 2
        const pos = worldToScreen(mx, my)
        drawDimLabel(pos, `${fmtDimFt(len)} ft`, '14, 116, 144')
      }
    }
  }
}

// ============================================================================
// MEASUREMENT TOOL DRAWING
// ============================================================================

const clearMeasure = () => {
  measureAnchor.value = null
  measureLive.value = null
  measureFixed.value = false
}

const toggleMeasureMode = () => {
  measureMode.value = !measureMode.value
  if (!measureMode.value) {
    clearMeasure()
    render()
  }
}

const activateSelectMode = () => {
  // Exit measure mode if active
  if (measureMode.value) {
    measureMode.value = false
    clearMeasure()
  }
  // Enter edit mode with select tool
  if (!editMode.value) {
    editMode.value = true
  }
  toolMode.value = 'select'
  insertMenuOpen.value = false
  render()
}

const drawMeasureOverlay = (context) => {
  if (!measureMode.value || !measureAnchor.value || !measureLive.value) return

  const a = measureAnchor.value
  const b = measureLive.value

  const sa = worldToScreen(a.x, a.y)
  const sb = worldToScreen(b.x, b.y)

  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy)

  const sdx = sb.x - sa.x
  const sdy = sb.y - sa.y
  const screenDist = Math.hypot(sdx, sdy)
  const angle = screenDist > 0 ? Math.atan2(sdy, sdx) : 0
  const perpAngle = angle + Math.PI / 2
  const tickLen = 10

  const color = measureFixed.value ? '#dc2626' : '#7c3aed'
  const bgColor = measureFixed.value ? 'rgba(220, 38, 38, 0.92)' : 'rgba(109, 40, 217, 0.92)'

  context.save()

  // Main measurement line
  context.beginPath()
  context.moveTo(sa.x, sa.y)
  context.lineTo(sb.x, sb.y)
  context.strokeStyle = color
  context.lineWidth = measureFixed.value ? 2 : 1.5
  context.setLineDash(measureFixed.value ? [] : [6, 4])
  context.stroke()
  context.setLineDash([])

  // Extension ticks at both endpoints
  ;[sa, sb].forEach((pt, i) => {
    if (i === 1 && screenDist < 4) return
    context.beginPath()
    context.moveTo(pt.x + Math.cos(perpAngle) * tickLen, pt.y + Math.sin(perpAngle) * tickLen)
    context.lineTo(pt.x - Math.cos(perpAngle) * tickLen, pt.y - Math.sin(perpAngle) * tickLen)
    context.strokeStyle = color
    context.lineWidth = 2
    context.stroke()
  })

  // Arrowheads when line is long enough to show them
  if (screenDist > 24) {
    const arr = 8
    const arrowAt = (tip, dir) => {
      const hx = tip.x + Math.cos(dir) * arr
      const hy = tip.y + Math.sin(dir) * arr
      context.beginPath()
      context.moveTo(tip.x, tip.y)
      context.lineTo(hx + Math.cos(perpAngle) * arr * 0.4, hy + Math.sin(perpAngle) * arr * 0.4)
      context.moveTo(tip.x, tip.y)
      context.lineTo(hx - Math.cos(perpAngle) * arr * 0.4, hy - Math.sin(perpAngle) * arr * 0.4)
      context.strokeStyle = color
      context.lineWidth = 2
      context.stroke()
    }
    arrowAt(sa, angle)          // arrow at start pointing toward sb
    arrowAt(sb, angle + Math.PI) // arrow at end pointing toward sa
  }

  // Endpoint dots (ring style)
  ;[sa, sb].forEach((pt, i) => {
    if (i === 1 && screenDist < 4) return
    context.beginPath()
    context.arc(pt.x, pt.y, 4, 0, Math.PI * 2)
    context.fillStyle = color
    context.fill()
    context.beginPath()
    context.arc(pt.x, pt.y, 2, 0, Math.PI * 2)
    context.fillStyle = '#ffffff'
    context.fill()
  })

  // Distance label
  if (dist > 0.001) {
    const mx = (sa.x + sb.x) / 2
    const my = (sa.y + sb.y) / 2

    // Total distance
    const label = `${fmtDimFt(dist)} ft`

    const fs = 13
    context.font = `700 ${fs}px system-ui, 'Segoe UI', sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    const tw = context.measureText(label).width
    const pad = 6
    const bw = tw + pad * 2
    const bh = fs + pad * 2

    // Offset label away from line so it doesn't overlap
    const offMag = screenDist > 30 ? 20 : 0
    const lx = mx + Math.cos(perpAngle) * offMag
    const ly = my + Math.sin(perpAngle) * offMag

    context.beginPath()
    if (context.roundRect) {
      context.roundRect(lx - bw / 2, ly - bh / 2, bw, bh, 4)
    } else {
      context.rect(lx - bw / 2, ly - bh / 2, bw, bh)
    }
    context.fillStyle = bgColor
    context.fill()
    context.fillStyle = '#ffffff'
    context.fillText(label, lx, ly)

    // Sub-label: W × H component dimensions (only for diagonal lines)
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    const diagRatio = adx > 1e-6 && ady > 1e-6
      ? Math.min(adx, ady) / Math.max(adx, ady)
      : 0
    if (diagRatio > 0.08 && dist > 0.1) {
      const subLabel = `${fmtDimFt(adx)} × ${fmtDimFt(ady)} ft`
      const sfs = 10
      context.font = `600 ${sfs}px system-ui, 'Segoe UI', sans-serif`
      const stw = context.measureText(subLabel).width
      const sbw = stw + 8
      const sbh = sfs + 6
      const slx = lx
      const sly = ly + bh / 2 + sbh / 2 + 2

      context.beginPath()
      if (context.roundRect) {
        context.roundRect(slx - sbw / 2, sly - sbh / 2, sbw, sbh, 3)
      } else {
        context.rect(slx - sbw / 2, sly - sbh / 2, sbw, sbh)
      }
      context.fillStyle = measureFixed.value ? 'rgba(220, 38, 38, 0.75)' : 'rgba(109, 40, 217, 0.75)'
      context.fill()
      context.fillStyle = '#ffffff'
      context.fillText(subLabel, slx, sly)
    }
  }

  // "Click to remeasure" hint when measurement is locked
  if (measureFixed.value && screenDist > 20) {
    context.font = '10px system-ui, sans-serif'
    context.fillStyle = 'rgba(220, 38, 38, 0.75)'
    context.textAlign = 'left'
    context.textBaseline = 'middle'
    context.fillText('Click to remeasure · Esc to exit', sb.x + 10, sb.y - 14)
  }

  context.restore()
}

const selectedEntity = computed({
  get: () => selectedEntities.value[0] ?? null,
  set(v) {
    selectedEntities.value = v ? [v] : []
  }
})

const selectionCount = computed(() => selectedEntities.value.length)

const wallBundleSelectionMeta = computed(() => {
  if (!selectedEntities.value.length) return null
  const lines = selectedEntities.value.filter(
    (e) => e.type === 'line' && e.start && e.end && !isEntityProtected(e)
  )
  if (lines.length < 2) return null
  const id = lines[0].properties?.wallBundleId
  if (!id || !lines.every((e) => e.properties?.wallBundleId === id)) return null
  return { bundleId: id, lines }
})

const singleSelectionEditable = computed(
  () => selectionCount.value === 1 && selectedEntity.value && !isEntityProtected(selectedEntity.value)
)

const propertyPanelVisible = computed(
  () => editMode.value && (singleSelectionEditable.value || !!wallBundleSelectionMeta.value)
)

const singleLineSelected = computed(
  () => selectedEntities.value.length === 1 && selectedEntities.value[0]?.type === 'line'
)

const hasDeletableSelection = computed(() =>
  selectedEntities.value.some((e) => !isEntityProtected(e))
)

const hasUnlockedInSelection = computed(() =>
  selectedEntities.value.some((e) => !isEntityProtected(e))
)

const isEntityInSelection = (entity) =>
  !!(entity && selectedEntities.value.some((e) => e.id === entity.id))

const isWallBundlePeerOfSelection = (entity) => {
  const bid = entity?.type === 'line' && entity.properties?.wallBundleId
  if (bid == null || bid === '') return false
  const key = String(bid)
  return selectedEntities.value.some(
    (e) => e?.type === 'line' && e.properties?.wallBundleId && String(e.properties.wallBundleId) === key
  )
}

/** Screen-space marquee (box) selection */
const MARQUEE_MIN_PX = 5
const pendingMarquee = ref(false)
const marqueeActive = ref(false)
const marqueeStart = ref({ x: 0, y: 0 })
const marqueeEnd = ref({ x: 0, y: 0 })
const marqueeAdditive = ref(false)

/** Multi-entity drag: snapshots per entity (polylines need own point arrays) */
const groupDragItems = ref(null)

const isEntityMarqueeSelectable = (entity) => {
  if (!entity || isEntityProtected(entity)) return false
  const layer = getLayerMap()[entity.layerId]
  if (layer && layer.visible === false) return false
  return true
}

const rectsIntersectScreen = (a, b) =>
  !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY)

const getBBoxScreenRect = (bbox) => {
  const c1 = worldToScreen(bbox.minX, bbox.minY)
  const c2 = worldToScreen(bbox.minX, bbox.maxY)
  const c3 = worldToScreen(bbox.maxX, bbox.minY)
  const c4 = worldToScreen(bbox.maxX, bbox.maxY)
  const xs = [c1.x, c2.x, c3.x, c4.x]
  const ys = [c1.y, c2.y, c3.y, c4.y]
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  }
}

/** If any picked line belongs to a thick-wall bundle, include all parallel lines in the selection. */
const expandSelectionWithWallBundles = (list) => {
  const out = []
  const seen = new Set()
  const ents = mapData.value?.entities || []
  for (const p of list) {
    if (!p || seen.has(p.id)) continue
    if (p.type === 'line' && p.properties?.wallBundleId) {
      const peers = getWallBundleLines(ents, p).filter((e) => !isEntityProtected(e))
      if (peers.length > 1) {
        for (const q of peers) {
          if (!seen.has(q.id)) {
            seen.add(q.id)
            out.push(q)
          }
        }
        continue
      }
    }
    seen.add(p.id)
    out.push(p)
  }
  return out
}

/** Check if an entity is fully contained inside a screen-space rectangle. */
const isEntityFullyInsideScreenRect = (entity, r) => {
  if (entity.type === 'line' && entity.start && entity.end) {
    const s1 = worldToScreen(entity.start.x, entity.start.y)
    const s2 = worldToScreen(entity.end.x, entity.end.y)
    return s1.x >= r.minX && s1.x <= r.maxX && s1.y >= r.minY && s1.y <= r.maxY &&
           s2.x >= r.minX && s2.x <= r.maxX && s2.y >= r.minY && s2.y <= r.maxY
  }
  if (entity.type === 'polyline' && entity.points?.length) {
    for (const p of entity.points) {
      const s = worldToScreen(p.x, p.y)
      if (s.x < r.minX || s.x > r.maxX || s.y < r.minY || s.y > r.maxY) return false
    }
    return true
  }
  // For rect, arc, text, point: check bounding box fully inside
  const bb = getEntityBoundingBox(entity)
  if (!bb) return false
  const sr = getBBoxScreenRect(bb)
  return sr.minX >= r.minX && sr.maxX <= r.maxX && sr.minY >= r.minY && sr.maxY <= r.maxY
}

const finalizeMarqueeSelection = () => {
  const x1 = marqueeStart.value.x
  const y1 = marqueeStart.value.y
  const x2 = marqueeEnd.value.x
  const y2 = marqueeEnd.value.y
  const r = {
    minX: Math.min(x1, x2),
    maxX: Math.max(x1, x2),
    minY: Math.min(y1, y2),
    maxY: Math.max(y1, y2)
  }
  const rw = r.maxX - r.minX
  const rh = r.maxY - r.minY
  if (rw < MARQUEE_MIN_PX && rh < MARQUEE_MIN_PX) {
    if (!marqueeAdditive.value) {
      selectedEntities.value = []
      emit('entitySelected', null)
    }
    return
  }

  // Select ALL entities fully contained inside the marquee box
  const hits = []
  for (const entity of mapData.value.entities || []) {
    if (!isEntityMarqueeSelectable(entity)) continue
    if (isEntityFullyInsideScreenRect(entity, r)) {
      hits.push(entity)
    }
  }

  // Expand wall bundles: if any line in a bundle is selected, include peers
  const expanded = hits.length ? expandSelectionWithWallBundles(hits) : hits

  if (marqueeAdditive.value) {
    const ids = new Set(selectedEntities.value.map((e) => e.id))
    for (const e of expanded) {
      if (!ids.has(e.id)) {
        selectedEntities.value.push(e)
        ids.add(e.id)
      }
    }
  } else {
    selectedEntities.value = expanded
  }
  emit('entitySelected', selectedEntities.value[0] ?? null)
}

/** Compute the length of a line segment clipped to a screen rect */
const clipLineToRect = (p1, p2, rect) => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.hypot(dx, dy)
  if (len < 1e-6) return 0
  let tMin = 0, tMax = 1
  if (Math.abs(dx) > 1e-6) {
    const t1 = (rect.minX - p1.x) / dx
    const t2 = (rect.maxX - p1.x) / dx
    tMin = Math.max(tMin, Math.min(t1, t2))
    tMax = Math.min(tMax, Math.max(t1, t2))
  } else if (p1.x < rect.minX || p1.x > rect.maxX) return 0
  if (Math.abs(dy) > 1e-6) {
    const t1 = (rect.minY - p1.y) / dy
    const t2 = (rect.maxY - p1.y) / dy
    tMin = Math.max(tMin, Math.min(t1, t2))
    tMax = Math.min(tMax, Math.max(t1, t2))
  } else if (p1.y < rect.minY || p1.y > rect.maxY) return 0
  return tMax > tMin ? (tMax - tMin) * len : 0
}

const clearMarqueeState = () => {
  pendingMarquee.value = false
  marqueeActive.value = false
  marqueeAdditive.value = false
}

// ============================================================================
// COORDINATE TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Convert world coordinates (map space) to screen coordinates (canvas pixels)
 * @param {number} worldX - X coordinate in world space
 * @param {number} worldY - Y coordinate in world space
 * @returns {{x: number, y: number}} Screen coordinates
 */
const worldToScreen = (worldX, worldY) => {
  const scale = baseScale.value * zoom.value
  const x = (worldX - panOffset.value.x) * scale + canvasWidth.value / 2
  // Flip Y axis: world Y increases upward, screen Y increases downward
  const y = canvasHeight.value / 2 - (worldY - panOffset.value.y) * scale
  return { x, y }
}

/**
 * Convert screen coordinates (canvas pixels) to world coordinates (map space)
 * @param {number} screenX - X coordinate in screen space
 * @param {number} screenY - Y coordinate in screen space
 * @returns {{x: number, y: number}} World coordinates
 */
const screenToWorld = (screenX, screenY) => {
  const scale = baseScale.value * zoom.value
  const x = (screenX - canvasWidth.value / 2) / scale + panOffset.value.x
  // Flip Y axis
  const y = (canvasHeight.value / 2 - screenY) / scale + panOffset.value.y
  return { x, y }
}

/**
 * Convert a distance in world units to screen pixels
 * @param {number} worldDistance - Distance in world units
 * @returns {number} Distance in screen pixels
 */
const worldDistanceToScreen = (worldDistance) => {
  return worldDistance * baseScale.value * zoom.value
}

// ============================================================================
// MAP DATA LOADING
// ============================================================================

/**
 * Load map data from URL or use provided data directly
 */
const loadMapData = async () => {
  loading.value = true
  error.value = null

  try {
    let data
    
    // If direct mapData is provided, deep-clone so mergeBounds / edits never mutate the
    // parent's object (would retrigger a deep watch and loop with loading=true).
    if (props.mapData) {
      console.log('[JsonMapEditor] Using provided map data (cloned)')
      data = JSON.parse(JSON.stringify(props.mapData))
    } 
    // Otherwise, fetch from URL
    else if (props.mapUrl) {
      console.log('[JsonMapEditor] Fetching map from:', props.mapUrl)
      const response = await fetch(props.mapUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch map: ${response.statusText}`)
      }
      data = await response.json()
    } else {
      throw new Error('No map data or URL provided')
    }
    
    mapData.value = data
    originalMapData.value = JSON.parse(JSON.stringify(data))

    mergeBoundsIntoMetadata()
    ensureValidBounds()

    applyShellClusterLayout()
    assignWallBundleIds(mapData.value.entities, {
      isLineExcluded: (e) => isEntityPerimeterLocked(e)
    })
    constraintBanner.value = ''
    constraintBannerAll.value = []
    constraintBannerIdx.value = 0
    nextTick(() => recomputeConstraintBanner())

    clearHistoryStacks()
    
    console.log('[JsonMapEditor] Map data loaded:', data.metadata?.name)
    console.log('[JsonMapEditor] Entities count:', data.entities?.length)
    
    emit('mapLoaded', data)
    
    // IMPORTANT: Set loading to false FIRST so the canvas element is rendered in DOM
    loading.value = false
    
    // Wait for DOM to update (canvas is now in DOM since loading is false)
    await nextTick()
    
    await new Promise(resolve => setTimeout(resolve, 50))
    await nextTick()

    if (!canvas.value) {
      await new Promise(requestAnimationFrame)
      await nextTick()
    }

    if (canvas.value) {
      initializeCanvas()
      calculateBaseScale()
      centerMap()
      render()
      console.log('[JsonMapEditor] Canvas initialized successfully')
    } else {
      console.error('[JsonMapEditor] Canvas element not found after DOM update')
    }
    
  } catch (err) {
    console.error('[JsonMapEditor] Error loading map:', err)
    error.value = err.message
    loading.value = false
  }
}

// ============================================================================
// CANVAS INITIALIZATION
// ============================================================================

/**
 * Initialize the canvas element and context
 */
const initializeCanvas = () => {
  if (!canvas.value) {
    console.error('[JsonMapEditor] Canvas element not found!')
    return
  }
  
  // Use canvasContainer ref or fallback to parent
  const container = canvasContainer.value || canvas.value.parentElement
  if (!container) {
    console.error('[JsonMapEditor] Canvas container not found!')
    return
  }
  
  const rect = container.getBoundingClientRect()
  console.log('[JsonMapEditor] Container dimensions:', rect.width, 'x', rect.height)
  
  // Use container dimensions, fallback to defaults if zero
  const containerWidth = rect.width > 0 ? rect.width : 1200
  const containerHeight = rect.height > 0 ? rect.height : 700
  
  // Set canvas size with device pixel ratio for sharp rendering
  const dpr = window.devicePixelRatio || 1
  canvasWidth.value = containerWidth
  canvasHeight.value = containerHeight
  
  // Set the actual canvas buffer size (for sharp rendering)
  canvas.value.width = canvasWidth.value * dpr
  canvas.value.height = canvasHeight.value * dpr
  
  // Set display size via CSS
  canvas.value.style.width = canvasWidth.value + 'px'
  canvas.value.style.height = canvasHeight.value + 'px'
  
  // Get context and scale for HiDPI displays
  ctx.value = canvas.value.getContext('2d')
  if (!ctx.value) {
    console.error('[JsonMapEditor] Failed to get canvas 2D context!')
    return
  }
  ctx.value.scale(dpr, dpr)
  
  console.log('[JsonMapEditor] Canvas initialized:', canvasWidth.value, 'x', canvasHeight.value, 'DPR:', dpr)
}

/**
 * Calculate the base scale to fit the map within the canvas
 */
const calculateBaseScale = () => {
  const bounds = getViewportFitBounds()
  if (!bounds) {
    console.warn('[JsonMapEditor] No bounds for viewport, using default scale')
    baseScale.value = 1
    return
  }
  const mapWidth = bounds.maxX - bounds.minX
  const mapHeight = bounds.maxY - bounds.minY
  
  console.log('[JsonMapEditor] Map dimensions:', mapWidth, 'x', mapHeight)
  
  // Ensure valid dimensions
  if (mapWidth <= 0 || mapHeight <= 0 || !isFinite(mapWidth) || !isFinite(mapHeight)) {
    console.warn('[JsonMapEditor] Invalid map dimensions, using default scale')
    baseScale.value = 1
    return
  }
  
  // Add padding (10% on each side)
  const padding = 0.2
  const availableWidth = canvasWidth.value * (1 - padding)
  const availableHeight = canvasHeight.value * (1 - padding)
  
  // Calculate scale to fit map in canvas
  const scaleX = availableWidth / mapWidth
  const scaleY = availableHeight / mapHeight
  baseScale.value = Math.min(scaleX, scaleY)
  
  // Ensure scale is reasonable
  if (baseScale.value <= 0 || !isFinite(baseScale.value)) {
    console.warn('[JsonMapEditor] Invalid scale calculated, using default')
    baseScale.value = 0.01 // Very small scale for large maps
  }
  
  console.log('[JsonMapEditor] Base scale calculated:', baseScale.value, 'Canvas:', canvasWidth.value, 'x', canvasHeight.value)
}

/**
 * Center the map in the canvas
 */
const centerMap = () => {
  const bounds = getViewportFitBounds()
  if (!isValidBounds(bounds)) return
  panOffset.value = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2
  }
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

/**
 * Schedules a render on the next animation frame (coalesces multiple calls per frame)
 */
const render = () => {
  if (_renderRAF) return
  _renderRAF = requestAnimationFrame(() => {
    _renderRAF = 0
    renderImmediate()
  })
}

/**
 * Main render function - clears canvas and draws all entities
 */
const renderImmediate = () => {
  if (!ctx.value || !mapData.value) return
  
  const context = ctx.value
  
  // Clear canvas
  context.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Draw background
  drawBackground(context)
  
  // Draw grid
  drawGrid(context)
  
  // Compute viewport bounds once for culling
  const vpTL = screenToWorld(0, 0)
  const vpBR = screenToWorld(canvasWidth.value, canvasHeight.value)
  const vpMinX = Math.min(vpTL.x, vpBR.x)
  const vpMaxX = Math.max(vpTL.x, vpBR.x)
  const vpMinY = Math.min(vpTL.y, vpBR.y)
  const vpMaxY = Math.max(vpTL.y, vpBR.y)
  
  // Build layer visibility lookup once
  const layers = mapData.value.layers || []
  const entities = mapData.value.entities || []
  const layerVisible = {}
  const layerMap = {}
  for (const layer of layers) {
    layerVisible[layer.id] = layer.visible !== false
    layerMap[layer.id] = layer
  }
  
  // Render visible entities with viewport culling
  for (const entity of entities) {
    const lid = entity.layerId || 'default'
    if (!layerVisible[lid]) continue
    
    // Fast viewport culling
    const bb = _fastBounds(entity)
    if (bb && (bb.maxX < vpMinX || bb.minX > vpMaxX || bb.maxY < vpMinY || bb.minY > vpMaxY)) continue
    
    const layer = layerMap[lid]
    if (layer) renderEntity(context, entity, layer)
  }

  drawRoomDimensionOverlays(context)
  drawWallDragGuideOverlay(context)
  drawDragDimOverlay(context)
  drawMeasureOverlay(context)

  // Draw selection highlights (multi-select); one box per wall bundle, not per parallel line
  const drawnWallBundles = new Set()
  for (const ent of selectedEntities.value) {
    if (isEntityProtected(ent)) {
      drawLockedSelectionOutline(context, ent)
      continue
    }
    const bid = ent?.type === 'line' && ent.properties?.wallBundleId
    if (bid != null && bid !== '') {
      const key = String(bid)
      if (drawnWallBundles.has(key)) continue
      drawnWallBundles.add(key)
    }
    drawSelectionHighlight(context, ent)
  }

  // Draw hover highlight (skip entities already in selection)
  if (
    hoveredEntity.value &&
    !isEntityProtected(hoveredEntity.value) &&
    !isEntityInSelection(hoveredEntity.value) &&
    !isWallBundlePeerOfSelection(hoveredEntity.value)
  ) {
    drawHoverHighlight(context, hoveredEntity.value)
  }

  drawSelectionInteractionHandles(context)

  // Marquee (screen-space box) — mouse coords are CSS pixels; context is scaled by DPR,
  // so reset then apply the same scale so the dashed rect tracks the pointer on HiDPI.
  if (pendingMarquee.value || marqueeActive.value) {
    context.save()
    const dpr =
      canvas.value && canvasWidth.value > 0
        ? canvas.value.width / canvasWidth.value
        : window.devicePixelRatio || 1
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.strokeStyle = 'rgba(37, 99, 235, 0.9)'
    context.lineWidth = 1
    context.setLineDash([5, 4])
    const mx0 = Math.min(marqueeStart.value.x, marqueeEnd.value.x)
    const my0 = Math.min(marqueeStart.value.y, marqueeEnd.value.y)
    const mrw = Math.abs(marqueeEnd.value.x - marqueeStart.value.x)
    const mrh = Math.abs(marqueeEnd.value.y - marqueeStart.value.y)
    context.strokeRect(mx0, my0, mrw, mrh)
    context.setLineDash([])
    context.restore()
  }

  // Ghost preview — draw clipboard entities at cursor while in paste mode
  if (pasteMode.value && clipboard.value.length && editMode.value) {
    const center = getClipboardCenter()
    const dx = pasteCursorWorld.value.x - center.x
    const dy = pasteCursorWorld.value.y - center.y
    context.save()
    context.globalAlpha = 0.45
    const ghostLayer = { color: '#6366f1', lineWidth: 1.5, visible: true }
    for (const ent of clipboard.value) {
      const ghost = JSON.parse(JSON.stringify(ent))
      offsetEntityCoords(ghost, dx, dy)
      renderEntity(context, ghost, ghostLayer)
    }
    context.restore()
  }
}

/** Cheap AABB for viewport culling — skips entities entirely outside the view */
const _fastBounds = (entity) => {
  switch (entity.type) {
    case 'line':
      if (!entity.start || !entity.end) return null
      return {
        minX: Math.min(entity.start.x, entity.end.x),
        maxX: Math.max(entity.start.x, entity.end.x),
        minY: Math.min(entity.start.y, entity.end.y),
        maxY: Math.max(entity.start.y, entity.end.y)
      }
    case 'rect':
      return { minX: entity.x, maxX: entity.x + (entity.width || 0), minY: entity.y, maxY: entity.y + (entity.height || 0) }
    case 'arc':
      if (!entity.center) return null
      return { minX: entity.center.x - entity.radius, maxX: entity.center.x + entity.radius, minY: entity.center.y - entity.radius, maxY: entity.center.y + entity.radius }
    case 'text':
    case 'point':
      if (!entity.position) return null
      return { minX: entity.position.x - 2, maxX: entity.position.x + 10, minY: entity.position.y - 2, maxY: entity.position.y + 2 }
    case 'polyline': {
      if (!entity.points?.length) return null
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
      for (const p of entity.points) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y }
      return { minX: x0, maxX: x1, minY: y0, maxY: y1 }
    }
    default: return null
  }
}

/**
 * Draw canvas background
 */
const drawBackground = (context) => {
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
}

/**
 * Draw coordinate grid
 */
const drawGrid = (context) => {
  const gridSpacing = 5
  if (!getViewportFitBounds()) return

  const topLeft = screenToWorld(0, 0)
  const bottomRight = screenToWorld(canvasWidth.value, canvasHeight.value)

  const minX = Math.floor(Math.min(topLeft.x, bottomRight.x) / gridSpacing) * gridSpacing
  const maxX = Math.ceil(Math.max(topLeft.x, bottomRight.x) / gridSpacing) * gridSpacing
  const minY = Math.floor(Math.min(topLeft.y, bottomRight.y) / gridSpacing) * gridSpacing
  const maxY = Math.ceil(Math.max(topLeft.y, bottomRight.y) / gridSpacing) * gridSpacing

  // Cap grid lines to avoid freeze when zoomed out very far
  const maxLines = 200
  const xCount = (maxX - minX) / gridSpacing
  const yCount = (maxY - minY) / gridSpacing
  const step = Math.max(gridSpacing, gridSpacing * Math.ceil(Math.max(xCount, yCount) / maxLines))

  context.beginPath()
  for (let x = minX; x <= maxX; x += step) {
    const s = worldToScreen(x, minY)
    const e = worldToScreen(x, maxY)
    context.moveTo(s.x, s.y)
    context.lineTo(e.x, e.y)
  }
  for (let y = minY; y <= maxY; y += step) {
    const s = worldToScreen(minX, y)
    const e = worldToScreen(maxX, y)
    context.moveTo(s.x, s.y)
    context.lineTo(e.x, e.y)
  }
  context.strokeStyle = '#e5e7eb'
  context.lineWidth = 0.5
  context.stroke()
}

/**
 * Render a single entity based on its type
 */
const renderEntity = (context, entity, layer) => {
  switch (entity.type) {
    case 'line':
      renderLine(context, entity, layer)
      break
    case 'rect':
      renderRect(context, entity, layer)
      break
    case 'arc':
      renderArc(context, entity, layer)
      break
    case 'text':
      renderText(context, entity, layer)
      break
    case 'point':
      renderPoint(context, entity, layer)
      break
    case 'polyline':
      renderPolyline(context, entity, layer)
      break
    default:
      console.warn('[JsonMapEditor] Unknown entity type:', entity.type)
  }
}

/**
 * Render a line entity
 */
const renderLine = (context, entity, layer) => {
  if (!entity.start || !entity.end) {
    console.warn('[JsonMapEditor] Line entity missing start/end:', entity)
    return
  }
  
  const start = worldToScreen(entity.start.x, entity.start.y)
  const end = worldToScreen(entity.end.x, entity.end.y)
  
  const dxw = entity.end.x - entity.start.x
  const dyw = entity.end.y - entity.start.y
  const lenW = Math.sqrt(dxw * dxw + dyw * dyw)
  if (lenW < 0.02) return
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length < 0.25) return
  
  context.beginPath()
  context.moveTo(start.x, start.y)
  context.lineTo(end.x, end.y)
  context.strokeStyle = layer.color || '#000000'
  context.lineWidth = Math.max((layer.lineWidth || 2) * zoom.value, 1)
  context.lineCap = 'round'
  context.stroke()
}

/**
 * Render a rectangle entity (supports rotation ° CCW around center)
 */
const renderRect = (context, entity, layer) => {
  const corners = getRectCornersWorld(entity)
  const screenPts = corners.map((p) => worldToScreen(p.x, p.y))
  context.beginPath()
  context.moveTo(screenPts[0].x, screenPts[0].y)
  for (let i = 1; i < 4; i++) context.lineTo(screenPts[i].x, screenPts[i].y)
  context.closePath()

  if (entity.fill) {
    context.fillStyle = entity.fill
    context.fill()
  }

  if (entity.stroke !== null) {
    context.strokeStyle = entity.stroke || layer.color || '#000000'
    context.lineWidth = (layer.lineWidth || 2) * zoom.value
    context.stroke()
  }
}

/**
 * Render an arc entity (for doors)
 */
const renderArc = (context, entity, layer) => {
  const center = worldToScreen(entity.center.x, entity.center.y)
  const radius = worldDistanceToScreen(entity.radius)
  
  // Convert angles from degrees to radians
  // Adjust for flipped Y-axis: negate and swap angles
  const startAngleRad = -entity.endAngle * Math.PI / 180
  const endAngleRad = -entity.startAngle * Math.PI / 180
  
  context.beginPath()
  context.arc(center.x, center.y, radius, startAngleRad, endAngleRad)
  context.strokeStyle = layer.color || '#000000'
  context.lineWidth = (layer.lineWidth || 2) * zoom.value
  context.stroke()
}

/**
 * Render a text entity (optional rotation ° CCW around anchor)
 */
const renderText = (context, entity, layer) => {
  const pos = worldToScreen(entity.position.x, entity.position.y)
  const fontSize = worldDistanceToScreen(entity.fontSize || 1)
  const rot = entity.rotation || 0

  context.save()
  context.translate(pos.x, pos.y)
  context.rotate(-rot * DEG2RAD)
  context.font = `bold ${Math.max(fontSize, 10)}px ${entity.fontFamily || 'Arial'}`
  context.textAlign = entity.textAlign || 'center'
  context.textBaseline = 'middle'

  const metrics = context.measureText(entity.text || '')
  const textWidth = metrics.width
  const textHeight = fontSize
  const padding = 4

  context.fillStyle = 'rgba(255, 255, 255, 0.9)'
  context.fillRect(
    -textWidth / 2 - padding,
    -textHeight / 2 - padding,
    textWidth + padding * 2,
    textHeight + padding * 2
  )

  context.fillStyle = layer.color || '#000000'
  context.fillText(entity.text || '', 0, 0)
  context.restore()
}

/**
 * Render a point entity
 */
const renderPoint = (context, entity, layer) => {
  const pos = worldToScreen(entity.position.x, entity.position.y)
  const radius = worldDistanceToScreen(entity.radius || 0.3)
  
  context.beginPath()
  context.arc(pos.x, pos.y, Math.max(radius, 3), 0, Math.PI * 2)
  context.fillStyle = layer.color || '#000000'
  context.fill()
}

/**
 * Render a polyline entity
 */
const renderPolyline = (context, entity, layer) => {
  if (!entity.points || entity.points.length < 2) return
  
  context.beginPath()
  const firstPoint = worldToScreen(entity.points[0].x, entity.points[0].y)
  context.moveTo(firstPoint.x, firstPoint.y)
  
  for (let i = 1; i < entity.points.length; i++) {
    const point = worldToScreen(entity.points[i].x, entity.points[i].y)
    context.lineTo(point.x, point.y)
  }
  
  if (entity.closed) {
    context.closePath()
  }
  
  if (entity.closed && entity.fill) {
    context.fillStyle = entity.fill
    context.fill()
  }
  
  if (entity.stroke !== null) {
    context.strokeStyle = entity.stroke ?? layer.color ?? '#000000'
    context.lineWidth = Math.max((layer.lineWidth || 2) * zoom.value, 1)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke()
  }

  // Furniture icon details (extra lines inside silhouette)
  if (entity.layerId === 'furniture' && entity.furnitureKey) {
    drawFurnitureIconDetails(context, entity, layer)
  }
}

const drawFurnitureIconDetails = (context, entity, layer) => {
  const bb = getEntityBoundingBox(entity)
  if (!bb) return

  const key = entity.furnitureKey
  const left = bb.minX
  const right = bb.maxX
  const bottom = bb.minY
  const top = bb.maxY

  const w = Math.max(0.001, right - left)
  const h = Math.max(0.001, top - bottom)
  const cx = left + w / 2
  const cy = bottom + h / 2

  const strokeCol = entity.stroke ?? 'rgba(0,0,0,0.35)'
  const accentPalette = {
    sofa: '#f5efe4',
    bed: '#f9fafb',
    table: '#f8f5f1',
    chair: '#ede9e3',
    toilet: '#f4f7fa',
    kitchen: '#fff8e8',
    wardrobe: '#f5f5f6'
  }
  const lineW = Math.max((layer.lineWidth || 2) * zoom.value * 0.6, 1)

  const drawWorldLine = (x1, y1, x2, y2) => {
    const s1 = worldToScreen(x1, y1)
    const s2 = worldToScreen(x2, y2)
    context.beginPath()
    context.moveTo(s1.x, s1.y)
    context.lineTo(s2.x, s2.y)
    context.stroke()
  }

  const drawWorldRect = (x, y, rw, rh, fill) => {
    const tl = worldToScreen(x, y + rh)
    const br = worldToScreen(x + rw, y)
    context.fillStyle = fill
    context.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y)
  }

  context.save()
  context.strokeStyle = strokeCol
  context.globalAlpha = 0.45
  context.lineWidth = lineW
  context.lineCap = 'round'
  context.lineJoin = 'round'

  if (key === 'sofa') {
    // Cushions + split seams for a cleaner sofa look.
    drawWorldRect(left + w * 0.08, bottom + h * 0.60, w * 0.84, h * 0.26, accentPalette.sofa)
    drawWorldRect(left + w * 0.12, bottom + h * 0.28, w * 0.32, h * 0.24, accentPalette.sofa)
    drawWorldRect(left + w * 0.56, bottom + h * 0.28, w * 0.32, h * 0.24, accentPalette.sofa)
    drawWorldLine(left + w * 0.15, bottom + h * 0.55, right - w * 0.15, bottom + h * 0.55)
    drawWorldLine(cx, bottom + h * 0.25, cx, bottom + h * 0.62)
    drawWorldLine(right - w * 0.22, bottom + h * 0.30, right - w * 0.22, bottom + h * 0.62)
  } else if (key === 'bed') {
    // Pillow band + mattress seams.
    drawWorldRect(left + w * 0.10, top - h * 0.22, w * 0.80, h * 0.14, accentPalette.bed)
    drawWorldLine(left + w * 0.10, bottom + h * 0.62, right - w * 0.10, bottom + h * 0.62)
    drawWorldLine(left + w * 0.18, bottom + h * 0.76, right - w * 0.18, bottom + h * 0.76)
    drawWorldLine(cx, bottom + h * 0.62, cx, bottom + h * 0.30)
  } else if (key === 'table') {
    // Inner top panel + central split and subtle leg hints.
    drawWorldRect(left + w * 0.18, bottom + h * 0.24, w * 0.64, h * 0.52, accentPalette.table)
    drawWorldLine(cx - w * 0.22, cy, cx + w * 0.22, cy)
    drawWorldLine(cx, cy - h * 0.12, cx, cy + h * 0.12)
    drawWorldLine(left + w * 0.18, bottom + h * 0.28, left + w * 0.18, bottom + h * 0.45)
    drawWorldLine(right - w * 0.18, bottom + h * 0.28, right - w * 0.18, bottom + h * 0.45)
  } else if (key === 'chair') {
    // Backrest and seat separation.
    drawWorldRect(left + w * 0.18, bottom + h * 0.58, w * 0.64, h * 0.22, accentPalette.chair)
    drawWorldRect(left + w * 0.22, bottom + h * 0.20, w * 0.56, h * 0.26, accentPalette.chair)
    drawWorldLine(left + w * 0.20, bottom + h * 0.62, right - w * 0.20, bottom + h * 0.62)
    drawWorldLine(cx, bottom + h * 0.25, cx, bottom + h * 0.75)
  } else if (key === 'toilet') {
    // Tank and bowl hints for clearer plumbing fixture silhouette.
    drawWorldRect(left + w * 0.30, bottom + h * 0.68, w * 0.40, h * 0.17, accentPalette.toilet)
    drawWorldLine(left + w * 0.18, bottom + h * 0.55, right - w * 0.18, bottom + h * 0.55)
    drawWorldLine(cx, bottom + h * 0.25, cx, top - h * 0.20)
    drawWorldLine(left + w * 0.35, bottom + h * 0.32, right - w * 0.35, bottom + h * 0.32)
  } else if (key === 'kitchen') {
    // Countertop strip and sink marker.
    drawWorldRect(left + w * 0.10, bottom + h * 0.48, w * 0.80, h * 0.20, accentPalette.kitchen)
    drawWorldLine(left + w * 0.20, bottom + h * 0.42, right - w * 0.05, bottom + h * 0.42)
    drawWorldLine(cx, bottom + h * 0.20, cx, bottom + h * 0.68)
    // Sink “dot”
    const s = worldToScreen(cx + w * 0.05, bottom + h * 0.48)
    context.beginPath()
    context.arc(s.x, s.y, Math.max(2, 2.5 * zoom.value), 0, Math.PI * 2)
    context.fillStyle = strokeCol
    context.fill()
  } else if (key === 'wardrobe') {
    // Double door panel and shelf split.
    drawWorldRect(left + w * 0.08, bottom + h * 0.16, w * 0.84, h * 0.68, accentPalette.wardrobe)
    drawWorldLine(cx, bottom + h * 0.18, cx, top - h * 0.18)
    drawWorldLine(left + w * 0.20, bottom + h * 0.50, right - w * 0.20, bottom + h * 0.50)
  }

  context.restore()
}

/**
 * Draw selection highlight around selected entity
 */
const drawSelectionHighlight = (context, entity) => {
  const bbox = getWallBundleUnionBoundingBox(entity) || getEntityBoundingBox(entity)
  if (!bbox) return
  
  const topLeft = worldToScreen(bbox.minX, bbox.maxY)
  const bottomRight = worldToScreen(bbox.maxX, bbox.minY)
  
  const padding = 5
  context.strokeStyle = '#3b82f6'
  context.lineWidth = 2
  context.setLineDash([5, 5])
  context.strokeRect(
    topLeft.x - padding,
    topLeft.y - padding,
    bottomRight.x - topLeft.x + padding * 2,
    bottomRight.y - topLeft.y + padding * 2
  )
  context.setLineDash([])
}

/** Perimeter / locked entities: visible selection but no blue “edit” affordance. */
const drawLockedSelectionOutline = (context, entity) => {
  const bbox = getWallBundleUnionBoundingBox(entity) || getEntityBoundingBox(entity)
  if (!bbox) return
  const topLeft = worldToScreen(bbox.minX, bbox.maxY)
  const bottomRight = worldToScreen(bbox.maxX, bbox.minY)
  const padding = 4
  context.strokeStyle = 'rgba(217, 119, 6, 0.92)'
  context.lineWidth = 1.5
  context.setLineDash([6, 4])
  context.strokeRect(
    topLeft.x - padding,
    topLeft.y - padding,
    bottomRight.x - topLeft.x + padding * 2,
    bottomRight.y - topLeft.y + padding * 2
  )
  context.setLineDash([])
}

/** Endpoint squares for all selected walls + single-entity rect/furniture handles. */
const drawSelectionInteractionHandles = (context) => {
  if (!editMode.value) return

  const lines = selectedEntities.value.filter(
    (e) => e.type === 'line' && e.start && e.end && !isEntityProtected(e)
  )
  const handleSize = 8
  const drawHandle = (sx, sy) => {
    context.fillStyle = '#2563eb'
    context.fillRect(sx - handleSize / 2, sy - handleSize / 2, handleSize, handleSize)
    context.strokeStyle = '#fff'
    context.lineWidth = 1
    context.strokeRect(sx - handleSize / 2, sy - handleSize / 2, handleSize, handleSize)
  }
  for (const ln of lines) {
    const s1 = worldToScreen(ln.start.x, ln.start.y)
    const s2 = worldToScreen(ln.end.x, ln.end.y)
    drawHandle(s1.x, s1.y)
    drawHandle(s2.x, s2.y)
  }

  if (lines.length > 0 && selectedEntities.value.length > 1) return
  if (lines.length > 0 && selectedEntities.value.length === 1 && selectedEntities.value[0]?.type === 'line') {
    return
  }

  if (selectedEntities.value.length !== 1) return
  const entity = selectedEntity.value
  if (!entity || isEntityProtected(entity)) return

  if (entity.type === 'rect' && Math.abs(entity.rotation || 0) < 1e-3) {
    const sex = worldToScreen(entity.x + entity.width, entity.y)
    context.fillStyle = '#2563eb'
    context.fillRect(sex.x - handleSize / 2, sex.y - handleSize / 2, handleSize, handleSize)
    context.strokeStyle = '#fff'
    context.lineWidth = 1
    context.strokeRect(sex.x - handleSize / 2, sex.y - handleSize / 2, handleSize, handleSize)
    drawRotationHandleGraphic(context, entity)
  } else if (entity.type === 'text') {
    drawRotationHandleGraphic(context, entity)
  }

  const canBBoxResize =
    (entity.type === 'polyline' && entity.layerId === 'furniture' && entity.points?.length) ||
    (entity.type === 'rect' && Math.abs(entity.rotation || 0) < 1e-3)
  if (!canBBoxResize) return

  const bb = getEntityBoundingBox(entity)
  if (!bb) return
  const topLeft = worldToScreen(bb.minX, bb.maxY)
  const bottomRight = worldToScreen(bb.maxX, bb.minY)
  const padding = 5
  context.fillStyle = '#3b82f6'
  context.fillRect(topLeft.x - padding - handleSize / 2, topLeft.y - padding - handleSize / 2, handleSize, handleSize)
  context.fillRect(bottomRight.x + padding - handleSize / 2, topLeft.y - padding - handleSize / 2, handleSize, handleSize)
  context.fillRect(topLeft.x - padding - handleSize / 2, bottomRight.y + padding - handleSize / 2, handleSize, handleSize)
  context.fillRect(bottomRight.x + padding - handleSize / 2, bottomRight.y + padding - handleSize / 2, handleSize, handleSize)
}

/**
 * Draw hover highlight
 */
const drawHoverHighlight = (context, entity) => {
  if (!editMode.value) return

  const bbox = getWallBundleUnionBoundingBox(entity) || getEntityBoundingBox(entity)
  if (!bbox) return
  
  const topLeft = worldToScreen(bbox.minX, bbox.maxY)
  const bottomRight = worldToScreen(bbox.maxX, bbox.minY)
  
  const padding = 3
  context.strokeStyle = '#10b981'
  context.lineWidth = 1
  context.setLineDash([3, 3])
  context.strokeRect(
    topLeft.x - padding,
    topLeft.y - padding,
    bottomRight.x - topLeft.x + padding * 2,
    bottomRight.y - topLeft.y + padding * 2
  )
  context.setLineDash([])
}

// ============================================================================
// HIT TESTING
// ============================================================================

const DEG2RAD = Math.PI / 180

/** Rotate point (px,py) around (cx,cy); angle rad is CCW in world (y up) */
const rotatePointAroundWorld = (px, py, cx, cy, rad) => {
  const dx = px - cx
  const dy = py - cy
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c }
}

const getRectCornersWorld = (e) => {
  const corners = [
    { x: e.x, y: e.y },
    { x: e.x + e.width, y: e.y },
    { x: e.x + e.width, y: e.y + e.height },
    { x: e.x, y: e.y + e.height }
  ]
  const r = e.rotation || 0
  if (Math.abs(r) < 1e-6) return corners
  const cx = e.x + e.width / 2
  const cy = e.y + e.height / 2
  const rad = r * DEG2RAD
  return corners.map((p) => rotatePointAroundWorld(p.x, p.y, cx, cy, rad))
}

const pointInPolygonWorld = (wx, wy, poly) => {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x
    const yi = poly[i].y
    const xj = poly[j].x
    const yj = poly[j].y
    const intersect =
      yi > wy !== yj > wy &&
      wx < ((xj - xi) * (wy - yi)) / (yj - yi + 1e-15) + xi
    if (intersect) inside = !inside
  }
  return inside
}

const getEntityRotationCenterWorld = (entity) => {
  if (entity.type === 'rect') {
    return { x: entity.x + entity.width / 2, y: entity.y + entity.height / 2 }
  }
  if (entity.type === 'text') {
    return { x: entity.position.x, y: entity.position.y }
  }
  return null
}

/** Green rotation handle: offset along local +Y from entity center (plan up) */
const getRotateHandleWorld = (entity) => {
  const c = getEntityRotationCenterWorld(entity)
  if (!c) return null
  const r = DEG2RAD * (entity.rotation || 0)
  if (entity.type === 'rect') {
    const halfH = entity.height / 2
    const pad = Math.max(entity.width, entity.height) * 0.12 + 0.35
    const dist = halfH + pad
    return { x: c.x - dist * Math.sin(r), y: c.y + dist * Math.cos(r) }
  }
  if (entity.type === 'text') {
    const fs = (entity.fontSize || 1) * 2.2 + 0.35
    return { x: c.x - fs * Math.sin(r), y: c.y + fs * Math.cos(r) }
  }
  return null
}

const drawRotationHandleGraphic = (context, entity) => {
  if (!editMode.value || isEntityProtected(entity) || selectedEntities.value.length > 1) return
  if (entity.type !== 'rect' && entity.type !== 'text') return
  const hw = getRotateHandleWorld(entity)
  if (!hw) return
  const s = worldToScreen(hw.x, hw.y)
  context.beginPath()
  context.arc(s.x, s.y, 7, 0, Math.PI * 2)
  context.fillStyle = '#22c55e'
  context.fill()
  context.strokeStyle = '#fff'
  context.lineWidth = 1.5
  context.stroke()
}

/**
 * Get the bounding box of an entity in world coordinates
 */
const getEntityBoundingBox = (entity) => {
  switch (entity.type) {
    case 'line':
      return {
        minX: Math.min(entity.start.x, entity.end.x),
        maxX: Math.max(entity.start.x, entity.end.x),
        minY: Math.min(entity.start.y, entity.end.y),
        maxY: Math.max(entity.start.y, entity.end.y)
      }
    case 'rect': {
      const corners = getRectCornersWorld(entity)
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const p of corners) {
        minX = Math.min(minX, p.x)
        maxX = Math.max(maxX, p.x)
        minY = Math.min(minY, p.y)
        maxY = Math.max(maxY, p.y)
      }
      return { minX, maxX, minY, maxY }
    }
    case 'arc':
      return {
        minX: entity.center.x - entity.radius,
        maxX: entity.center.x + entity.radius,
        minY: entity.center.y - entity.radius,
        maxY: entity.center.y + entity.radius
      }
    case 'text':
      const textSize = entity.fontSize || 1
      return {
        minX: entity.position.x - textSize * 3,
        maxX: entity.position.x + textSize * 3,
        minY: entity.position.y - textSize,
        maxY: entity.position.y + textSize
      }
    case 'point':
      const r = entity.radius || 0.3
      return {
        minX: entity.position.x - r,
        maxX: entity.position.x + r,
        minY: entity.position.y - r,
        maxY: entity.position.y + r
      }
    case 'polyline':
      if (!entity.points?.length) return null
      let minXp = Infinity
      let minYp = Infinity
      let maxXp = -Infinity
      let maxYp = -Infinity
      entity.points.forEach(p => {
        minXp = Math.min(minXp, p.x)
        maxXp = Math.max(maxXp, p.x)
        minYp = Math.min(minYp, p.y)
        maxYp = Math.max(maxYp, p.y)
      })
      return { minX: minXp, maxX: maxXp, minY: minYp, maxY: maxYp }
    default:
      return null
  }
}

/** Union bbox of all lines in the same wall bundle (thick wall = one hover target). */
const getWallBundleUnionBoundingBox = (entity) => {
  if (!entity || entity.type !== 'line' || !entity.properties?.wallBundleId || !mapData.value?.entities) {
    return null
  }
  const peers = getWallBundleLines(mapData.value.entities, entity)
  if (!peers || peers.length < 2) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const ln of peers) {
    if (!ln?.start || !ln?.end) continue
    const bb = getEntityBoundingBox(ln)
    if (!bb) continue
    minX = Math.min(minX, bb.minX)
    maxX = Math.max(maxX, bb.maxX)
    minY = Math.min(minY, bb.minY)
    maxY = Math.max(maxY, bb.maxY)
  }
  if (!Number.isFinite(minX) || minX > maxX || minY > maxY) return null
  return { minX, maxX, minY, maxY }
}

/**
 * Check if a world point is inside an entity (hit test)
 */
const hitTestEntity = (entity, worldX, worldY) => {
  const lm = getLayerMap()
  const layer = lm[entity.layerId]
  if (layer && layer.locked) return false

  // Fast AABB pre-filter: skip entities far from the point
  const tolerance = getWorldHitTolerance()
  const wallBoost = entity.layerId === 'walls' ? 1.35 : 1
  const tol = tolerance * wallBoost
  const bb = _fastBounds(entity)
  if (bb && (worldX < bb.minX - tol || worldX > bb.maxX + tol ||
             worldY < bb.minY - tol || worldY > bb.maxY + tol)) {
    return false
  }

  switch (entity.type) {
    case 'line':
      return hitTestLine(entity, worldX, worldY, tol)
    case 'rect':
      return hitTestRect(entity, worldX, worldY)
    case 'arc':
      return hitTestArc(entity, worldX, worldY, tol)
    case 'text':
      return hitTestText(entity, worldX, worldY)
    case 'point':
      return hitTestPoint(entity, worldX, worldY, tol)
    case 'polyline':
      return hitTestPolyline(entity, worldX, worldY, tol)
    default:
      return false
  }
}

const hitTestPolyline = (entity, worldX, worldY, tolerance) => {
  const pts = entity.points
  if (!pts || pts.length < 2) return false
  if (entity.closed && pts.length > 2 && pointInPolygonWorld(worldX, worldY, pts)) {
    return true
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const seg = { start: pts[i], end: pts[i + 1] }
    if (hitTestLine(seg, worldX, worldY, tolerance)) return true
  }
  if (entity.closed && pts.length > 2) {
    const seg = { start: pts[pts.length - 1], end: pts[0] }
    if (hitTestLine(seg, worldX, worldY, tolerance)) return true
  }
  return false
}

/**
 * Hit test for line - checks distance from point to line segment
 */
const hitTestLine = (entity, worldX, worldY, tolerance) => {
  const { start, end } = entity
  
  // Calculate distance from point to line segment
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSq = dx * dx + dy * dy
  
  if (lengthSq === 0) {
    // Line is a point
    const dist = Math.sqrt((worldX - start.x) ** 2 + (worldY - start.y) ** 2)
    return dist <= tolerance
  }
  
  // Project point onto line
  let t = ((worldX - start.x) * dx + (worldY - start.y) * dy) / lengthSq
  t = Math.max(0, Math.min(1, t))
  
  const projX = start.x + t * dx
  const projY = start.y + t * dy
  
  const dist = Math.sqrt((worldX - projX) ** 2 + (worldY - projY) ** 2)
  return dist <= tolerance
}

/**
 * Hit test for rectangle (axis-aligned or rotated)
 */
const hitTestRect = (entity, worldX, worldY) => {
  const r = entity.rotation || 0
  if (Math.abs(r) < 1e-6) {
    return (
      worldX >= entity.x &&
      worldX <= entity.x + entity.width &&
      worldY >= entity.y &&
      worldY <= entity.y + entity.height
    )
  }
  const poly = getRectCornersWorld(entity)
  return pointInPolygonWorld(worldX, worldY, poly)
}

/**
 * Hit test for arc - checks distance from point to arc
 */
const hitTestArc = (entity, worldX, worldY, tolerance) => {
  const dx = worldX - entity.center.x
  const dy = worldY - entity.center.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  
  // Check if near the arc radius
  if (Math.abs(dist - entity.radius) > tolerance) return false
  
  // Check if angle is within arc range
  let angle = Math.atan2(dy, dx) * 180 / Math.PI
  if (angle < 0) angle += 360
  
  const start = entity.startAngle
  const end = entity.endAngle
  
  if (start <= end) {
    return angle >= start && angle <= end
  } else {
    return angle >= start || angle <= end
  }
}

/**
 * Hit test for text
 */
const hitTestText = (entity, worldX, worldY) => {
  const bbox = getEntityBoundingBox(entity)
  return bbox && 
         worldX >= bbox.minX && worldX <= bbox.maxX &&
         worldY >= bbox.minY && worldY <= bbox.maxY
}

/**
 * Hit test for point
 */
const hitTestPoint = (entity, worldX, worldY, tolerance) => {
  const dx = worldX - entity.position.x
  const dy = worldY - entity.position.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return dist <= (entity.radius || 0.3) + tolerance
}

/**
 * Find entity at screen position
 */
const findEntityAtPosition = (screenX, screenY) => {
  const world = screenToWorld(screenX, screenY)
  const entities = mapData.value?.entities || []
  const lm = getLayerMap()

  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i]
    const layer = lm[entity.layerId]
    if (layer && layer.visible === false) continue
    if (hitTestEntity(entity, world.x, world.y)) return entity
  }
  return null
}

const findAllEntitiesAtWorld = (worldX, worldY) => {
  const entities = mapData.value?.entities || []
  const lm = getLayerMap()
  const hits = []
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i]
    const layer = lm[entity.layerId]
    if (layer && layer.visible === false) continue
    if (hitTestEntity(entity, worldX, worldY)) hits.push(entity)
  }
  return hits
}

const computeBoundsFromEntities = (entities) => {
  if (!entities?.length) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let any = false
  for (const e of entities) {
    const bb = getEntityBoundingBox(e)
    if (!bb) continue
    if (![bb.minX, bb.minY, bb.maxX, bb.maxY].every((v) => Number.isFinite(Number(v)))) continue
    any = true
    minX = Math.min(minX, bb.minX)
    maxX = Math.max(maxX, bb.maxX)
    minY = Math.min(minY, bb.minY)
    maxY = Math.max(maxY, bb.maxY)
  }
  return any && isValidBounds({ minX, minY, maxX, maxY }) ? { minX, minY, maxX, maxY } : null
}

/**
 * Bounds used to fit/center the canvas. Prefers real geometry over bad DXF $LIMMIN/HEADER boxes
 * that are disjoint from the drawing. When stray entities inflate the full bbox, prefer wall lines.
 */
const getViewportFitBounds = () => {
  const entities = mapData.value?.entities || []
  const eb = computeBoundsFromEntities(entities)
  const wb = computeWallGeometryBounds(entities)
  if (eb && isValidBounds(eb) && wb && isValidBounds(wb)) {
    const ew = eb.maxX - eb.minX
    const eh = eb.maxY - eb.minY
    const ww = wb.maxX - wb.minX
    const wh = wb.maxY - wb.minY
    const ea = Math.max(ew * eh, 1e-9)
    const wa = Math.max(ww * wh, 1e-9)
    if (ea > wa * 2.5 && ww > 1e-6 && wh > 1e-6) return wb
  }
  if (eb && isValidBounds(eb)) return eb
  const mb = mapData.value?.metadata?.bounds
  return isValidBounds(mb) ? mb : null
}

const mergeBoundsIntoMetadata = () => {
  if (!mapData.value?.entities?.length || !mapData.value.metadata) return
  const eb = computeBoundsFromEntities(mapData.value.entities)
  if (!eb) return
  const m = mapData.value.metadata
  if (!m.bounds || !isValidBounds(m.bounds)) {
    m.bounds = { ...eb }
    return
  }
  const b = m.bounds
  const mnX = Number(b.minX)
  const mnY = Number(b.minY)
  const mxX = Number(b.maxX)
  const mxY = Number(b.maxY)
  if (![mnX, mnY, mxX, mxY].every(Number.isFinite)) {
    m.bounds = { ...eb }
    return
  }
  const ab = Math.max((mxX - mnX) * (mxY - mnY), 0)
  const ae = Math.max((eb.maxX - eb.minX) * (eb.maxY - eb.minY), 0)
  const minArea = Math.min(ab, ae)
  const inter = boundsIntersectionArea(b, eb)
  // Header/LIMITS often disagree with real geometry (e.g. 0–1200 vs content at 22k); don't union junk.
  if (minArea <= 0 || inter <= 0 || inter < 0.01 * minArea) {
    m.bounds = { ...eb }
    return
  }
  m.bounds = {
    minX: Math.min(mnX, eb.minX),
    maxX: Math.max(mxX, eb.maxX),
    minY: Math.min(mnY, eb.minY),
    maxY: Math.max(mxY, eb.maxY)
  }
}

/** If metadata.bounds is missing or NaN, replace with entity-derived bounds */
const ensureValidBounds = () => {
  const m = mapData.value?.metadata
  if (!m) return
  if (isValidBounds(m.bounds)) return
  const eb = computeBoundsFromEntities(mapData.value.entities || [])
  if (eb) {
    m.bounds = eb
    return
  }
  m.bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 }
}

const pickShellBoundsAtWorld = (x, y) => {
  if (!shellClusters.value.length) return fixedConstraintBounds.value
  const allBounds = shellClusters.value.map((c) => c.bounds).filter((b) => isValidBounds(b))
  const inner = pickSmallestShellBoundsContainingPoint(x, y, allBounds)
  if (inner) return inner
  let best = null
  let bestD = Infinity
  for (const c of shellClusters.value) {
    const b = c.bounds
    const cx = (b.minX + b.maxX) / 2
    const cy = (b.minY + b.maxY) / 2
    const d = (cx - x) ** 2 + (cy - y) ** 2
    if (d < bestD) {
      bestD = d
      best = b
    }
  }
  return best || fixedConstraintBounds.value
}

const getShellClusterBoundsForLineEntity = (line) => {
  if (!line || line.type !== 'line' || !line.start || !line.end) {
    return fixedConstraintBounds.value
  }
  const id = line.id != null ? String(line.id) : ''
  if (id) {
    for (const c of shellClusters.value) {
      if (c.lineIds?.has(id)) return c.bounds
    }
    for (const c of shellClusters.value) {
      if (c.lineSet?.has(line)) return c.bounds
    }
  } else {
    for (const c of shellClusters.value) {
      if (c.lineSet?.has(line)) return c.bounds
    }
  }
  const mx = (line.start.x + line.end.x) / 2
  const my = (line.start.y + line.end.y) / 2
  return pickShellBoundsAtWorld(mx, my)
}

/** All dragged wall lines should share one floor shell; if not, use the first line’s shell. */
const getShellClusterBoundsForWallDragItems = (items) => {
  const lines = (items || []).map((it) => it.entity).filter((e) => e?.type === 'line' && e.start && e.end)
  if (!lines.length) return fixedConstraintBounds.value
  const shells = lines.map((ln) => getShellClusterBoundsForLineEntity(ln)).filter((b) => isValidBounds(b))
  if (!shells.length) return fixedConstraintBounds.value
  const first = shells[0]
  const eqB = (a, b) =>
    Math.abs(a.minX - b.minX) < 1e-3 &&
    Math.abs(a.maxX - b.maxX) < 1e-3 &&
    Math.abs(a.minY - b.minY) < 1e-3 &&
    Math.abs(a.maxY - b.maxY) < 1e-3
  const same = shells.every((b) => eqB(b, first))
  if (same) return first
  const mx =
    lines.reduce((s, ln) => s + (ln.start.x + ln.end.x) / 2, 0) / lines.length
  const my =
    lines.reduce((s, ln) => s + (ln.start.y + ln.end.y) / 2, 0) / lines.length
  return pickShellBoundsAtWorld(mx, my)
}

/** Re-cluster wall lines, tag per-plan outer walls, refresh bundle exclusions. Call after load / undo / duplicate. */
const applyShellClusterLayout = () => {
  if (!mapData.value?.entities) {
    shellClusters.value = []
    fixedConstraintBounds.value = null
    return
  }
  const clusters = computeWallShellClusters(mapData.value.entities)
  if (clusters.length) {
    shellClusters.value = clusters.map((c) => ({
      bounds: { ...c.bounds },
      lineIds: new Set((c.lines || []).map((ln) => ln.id).filter(Boolean)),
      lineSet: new Set(c.lines)
    }))
    annotatePerimeterForShellClusters(mapData.value, clusters)
    expandPerimeterLockToParallelWallFaces(mapData.value.entities, { maxGapFt: 3.5, minOverlapRatio: 0.35 })
    const u = unionBoundsArray(clusters.map((c) => c.bounds))
    fixedConstraintBounds.value = u && isValidBounds(u) ? u : null
  } else {
    shellClusters.value = []
    const shell = resolveShellBoundsForMap(mapData.value)
    if (shell && isValidBounds(shell)) {
      fixedConstraintBounds.value = { ...shell }
      annotatePerimeterEntities(mapData.value, shell)
      expandPerimeterLockToParallelWallFaces(mapData.value.entities, { maxGapFt: 3.5, minOverlapRatio: 0.35 })
    } else {
      fixedConstraintBounds.value = null
    }
  }
}

/** Undo/redo: full map JSON snapshots (before each committed edit) */
const HISTORY_MAX = 80
const undoStack = ref([])
const redoStack = ref([])
const isApplyingHistory = ref(false)

const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

const clearHistoryStacks = () => {
  undoStack.value = []
  redoStack.value = []
}

const recordHistoryBeforeMutation = () => {
  if (!mapData.value || isApplyingHistory.value) return
  undoStack.value.push(JSON.stringify(mapData.value))
  while (undoStack.value.length > HISTORY_MAX) undoStack.value.shift()
  redoStack.value = []
}

const syncSelectionAfterHistoryRestore = () => {
  const entities = mapData.value?.entities || []
  const ids = selectedEntities.value.map((e) => e.id)
  selectedEntities.value = ids
    .map((id) => entities.find((e) => e.id === id))
    .filter(Boolean)
  hoveredEntity.value = null
  emit('entitySelected', selectedEntities.value[0] ?? null)
}

const localMetadataName = ref('')
watch(
  () => mapData.value?.metadata?.name,
  (n) => {
    localMetadataName.value = n ?? ''
  },
  { immediate: true }
)

const selectionPropsForm = ref({
  rotation: 0,
  width: 1,
  height: 1,
  text: '',
  fontSize: 1,
  lineLength: 1,
  lineAngleDeg: 0,
  polylineRotateDelta: 0,
  // Furniture (polyline) only
  furnitureLength: 1,
  furnitureWidth: 1,
})

const syncSelectionPropsFormFromEntity = () => {
  const ent = selectedEntity.value
  if (!ent || selectionCount.value !== 1) return
  selectionPropsForm.value.rotation = ent.rotation ?? 0
  selectionPropsForm.value.polylineRotateDelta = 0
  if (ent.type === 'rect') {
    selectionPropsForm.value.width = ent.width
    selectionPropsForm.value.height = ent.height
  }
  if (ent.type === 'text') {
    selectionPropsForm.value.text = ent.text ?? ''
    selectionPropsForm.value.fontSize = ent.fontSize ?? 1
  }
  if (ent.type === 'line' && ent.start && ent.end) {
    const dx = ent.end.x - ent.start.x
    const dy = ent.end.y - ent.start.y
    selectionPropsForm.value.lineLength = Math.max(0.01, displayLineRunLengthFt(ent))
    selectionPropsForm.value.lineAngleDeg = Math.atan2(dy, dx) * 180 / Math.PI
  }

  // Furniture resizing fields: derive from current (axis-aligned) polyline bbox
  if (ent.type === 'polyline' && ent.layerId === 'furniture') {
    const bb = getEntityBoundingBox(ent)
    if (bb) {
      const l = Math.max(0.01, bb.maxX - bb.minX)
      const w = Math.max(0.01, bb.maxY - bb.minY)
      selectionPropsForm.value.furnitureLength = l
      selectionPropsForm.value.furnitureWidth = w
    }
  }
}

watch(
  () => (selectedEntity.value ? `${selectedEntity.value.id}:${selectedEntity.value.type}` : ''),
  () => {
    syncSelectionPropsFormFromEntity()
  }
)

const setLineFromLengthAndAngle = (line, len, angleDeg) => {
  const mx = (line.start.x + line.end.x) / 2
  const my = (line.start.y + line.end.y) / 2
  const half = Math.max(0.005, len) / 2
  const rad = angleDeg * DEG2RAD
  const dx = Math.cos(rad) * half
  const dy = Math.sin(rad) * half
  line.start.x = mx - dx
  line.start.y = my - dy
  line.end.x = mx + dx
  line.end.y = my + dy
}

const getPolylineCentroid = (entity) => {
  const pts = entity.points
  if (!pts?.length) return { x: 0, y: 0 }
  let sx = 0
  let sy = 0
  for (const p of pts) {
    sx += p.x
    sy += p.y
  }
  return { x: sx / pts.length, y: sy / pts.length }
}

const rotatePolylineAroundCentroid = (entity, deltaDeg) => {
  const pts = entity.points
  if (!pts?.length) return
  const c = getPolylineCentroid(entity)
  const rad = deltaDeg * DEG2RAD
  for (const p of pts) {
    const q = rotatePointAroundWorld(p.x, p.y, c.x, c.y, rad)
    p.x = q.x
    p.y = q.y
  }
}

const applySelectionPropsFromPanel = () => {
  const ent = selectedEntity.value
  if (!ent || !mapData.value || isEntityProtected(ent)) return
  const f = selectionPropsForm.value
  const snap =
    ent.type === 'rect'
      ? { x: ent.x, y: ent.y, w: ent.width, h: ent.height, rot: ent.rotation }
      : null
  recordHistoryBeforeMutation()
  if (ent.type === 'rect' || ent.type === 'text') {
    ent.rotation = Number(f.rotation) || 0
  }
  if (ent.type === 'rect') {
    ent.width = Math.max(0.01, Number(f.width) || 0.01)
    ent.height = Math.max(0.01, Number(f.height) || 0.01)
  }
  if (ent.type === 'text') {
    ent.text = f.text ?? ''
    ent.fontSize = Math.max(0.05, Number(f.fontSize) || 0.05)
  }
  if (ent.type === 'line' && ent.start && ent.end) {
    setLineFromLengthAndAngle(ent, Number(f.lineLength) || 0.01, Number(f.lineAngleDeg) || 0)
  }
  if (isRoomFootprint(ent)) {
    const inner = innerConstraintRect.value
    if (inner && isValidBounds(inner)) {
      const v = validateSingleRoomRect(ent, mapData.value.entities, inner)
      if (!v.ok) {
        Object.assign(ent, { x: snap.x, y: snap.y, width: snap.w, height: snap.h, rotation: snap.rot })
        constraintBanner.value = v.issues[0]?.message || 'Invalid room size or layout'
        syncSelectionPropsFormFromEntity()
        render()
        return
      }
    }
  }
  constraintBanner.value = ''
  hasUnsavedChanges.value = true
  syncRoomDimensionLabels()
  recomputeConstraintBanner()
  emitMapChanged()
  render()
}

const applyPolylineRotateDelta = () => {
  const ent = selectedEntity.value
  if (!ent || ent.type !== 'polyline' || isEntityProtected(ent)) return
  const d = Number(selectionPropsForm.value.polylineRotateDelta) || 0
  if (Math.abs(d) < 1e-9) return
  recordHistoryBeforeMutation()
  rotatePolylineAroundCentroid(ent, d)
  selectionPropsForm.value.polylineRotateDelta = 0
  hasUnsavedChanges.value = true
  emitMapChanged()
  render()
}

const applyFurnitureSize = () => {
  const ent = selectedEntity.value
  if (!ent || ent.type !== 'polyline' || ent.layerId !== 'furniture') return
  if (isEntityProtected(ent)) return
  if (!mapData.value) return

  const bb = getEntityBoundingBox(ent)
  if (!bb) return
  const curL = Math.max(0.0001, bb.maxX - bb.minX)
  const curW = Math.max(0.0001, bb.maxY - bb.minY)

  const newL = Math.max(0.01, Number(selectionPropsForm.value.furnitureLength) || curL)
  const newW = Math.max(0.01, Number(selectionPropsForm.value.furnitureWidth) || curW)

  const sx = newL / curL
  const sy = newW / curW

  // Avoid no-op mutations
  if (Math.abs(1 - sx) < 1e-6 && Math.abs(1 - sy) < 1e-6) return

  recordHistoryBeforeMutation()
  const c = getPolylineCentroid(ent)
  for (const p of ent.points || []) {
    p.x = c.x + (p.x - c.x) * sx
    p.y = c.y + (p.y - c.y) * sy
  }

  hasUnsavedChanges.value = true
  emitMapChanged()
  syncSelectionPropsFormFromEntity()
  render()
}

const applyMapMetadataName = () => {
  if (!mapData.value?.metadata) return
  recordHistoryBeforeMutation()
  mapData.value.metadata.name = localMetadataName.value || 'Plan'
  hasUnsavedChanges.value = true
  emitMapChanged()
  render()
}

/** Footprints in world units, points relative to shape center (insert at view center). */
const FURNITURE_PRESETS = {
  sofa: {
    fill: '#cdb8a0',
    stroke: '#5c4632',
    points: [
      { x: -4.2, y: -2.2 },
      { x: 4.2, y: -2.2 },
      { x: 4.2, y: 2.0 },
      { x: 3.2, y: 2.0 },
      { x: 3.2, y: 3.0 },
      { x: 1.9, y: 3.0 },
      { x: 1.9, y: 2.0 },
      { x: -1.9, y: 2.0 },
      { x: -1.9, y: 3.0 },
      { x: -3.2, y: 3.0 },
      { x: -3.2, y: 2.0 },
      { x: -4.2, y: 2.0 }
    ]
  },
  bed: {
    fill: '#dce8f6',
    stroke: '#475569',
    points: [
      { x: -3.5, y: -4.8 },
      { x: 3.5, y: -4.8 },
      { x: 3.5, y: 4.6 },
      { x: -3.5, y: 4.6 }
    ]
  },
  table: {
    fill: '#d1b38a',
    stroke: '#5b4636',
    points: [
      { x: -2.6, y: -2.0 },
      { x: 2.6, y: -2.0 },
      { x: 2.6, y: 2.0 },
      { x: -2.6, y: 2.0 }
    ]
  },
  chair: {
    fill: '#bca28a',
    stroke: '#5f4634',
    points: [
      { x: -1.8, y: -2.1 },
      { x: 1.8, y: -2.1 },
      { x: 1.8, y: 1.8 },
      { x: 0.8, y: 1.8 },
      { x: 0.8, y: 2.7 },
      { x: -0.8, y: 2.7 },
      { x: -0.8, y: 1.8 },
      { x: -1.8, y: 1.8 }
    ]
  },
  toilet: {
    fill: '#eaf0f5',
    stroke: '#6b7280',
    points: [
      { x: -1.8, y: -2.3 },
      { x: 1.8, y: -2.3 },
      { x: 2.0, y: -0.2 },
      { x: 1.7, y: 1.3 },
      { x: 1.2, y: 2.4 },
      { x: -1.2, y: 2.4 },
      { x: -1.7, y: 1.3 },
      { x: -2.0, y: -0.2 }
    ]
  },
  kitchen: {
    fill: '#d9ddd2',
    stroke: '#4b5563',
    points: [
      { x: -5.0, y: -3.8 },
      { x: 5.0, y: -3.8 },
      { x: 5.0, y: -1.1 },
      { x: -0.9, y: -1.1 },
      { x: -0.9, y: 3.8 },
      { x: -5.0, y: 3.8 }
    ]
  },
  wardrobe: {
    fill: '#c6c8cf',
    stroke: '#4b5563',
    points: [
      { x: -3.0, y: -2.0 },
      { x: 3.0, y: -2.0 },
      { x: 3.0, y: 2.0 },
      { x: -3.0, y: 2.0 }
    ]
  }
}

const furnitureMenuItems = [
  { key: 'sofa', label: 'Sofa' },
  { key: 'bed', label: 'Bed' },
  { key: 'table', label: 'Table' },
  { key: 'chair', label: 'Chair' },
  { key: 'toilet', label: 'Toilet' },
  { key: 'kitchen', label: 'Kitchen block' },
  { key: 'wardrobe', label: 'Wardrobe' }
]

const ensureMapLayer = (id, name, color) => {
  if (!mapData.value?.layers) mapData.value.layers = []
  if (mapData.value.layers.some((l) => l.id === id)) return
  mapData.value.layers.push({
    id,
    name,
    visible: true,
    locked: false,
    color: color || '#78716c',
    lineWidth: 2
  })
}

const nextUniqueEntityId = (prefix) => {
  const ids = new Set((mapData.value.entities || []).map((e) => e.id))
  let n = 1
  let id = `${prefix}_${n}`
  while (ids.has(id)) {
    n++
    id = `${prefix}_${n}`
  }
  return id
}

const viewCenterWorld = () => ({ x: panOffset.value.x, y: panOffset.value.y })

const insertFurniturePreset = (key, atWorld = null) => {
  if (!mapData.value?.entities) return
  const spec = FURNITURE_PRESETS[key]
  if (!spec?.points?.length) return
  recordHistoryBeforeMutation()
  ensureMapLayer('furniture', 'Furniture', '#78716c')
  const c = atWorld && isFinite(atWorld.x) && isFinite(atWorld.y) ? atWorld : viewCenterWorld()
  const points = spec.points.map((p) => ({ x: c.x + p.x, y: c.y + p.y }))
  const ent = {
    type: 'polyline',
    id: nextUniqueEntityId(`furn_${key}`),
    layerId: 'furniture',
    furnitureKey: key,
    points,
    closed: true,
    fill: spec.fill,
    stroke: spec.stroke
  }
  mapData.value.entities.push(ent)
  selectEntity(ent)
  syncSelectionPropsFormFromEntity()
  toolMode.value = 'select'
  hasUnsavedChanges.value = true
  emitMapChanged()
  render()
}

const ensureNotesLayer = () => {
  ensureMapLayer('notes', 'Notes', '#6366f1')
}

const addTextNoteAtWorld = (wx, wy) => {
  if (!mapData.value?.entities) return
  ensureNotesLayer()
  const ent = {
    type: 'text',
    id: nextUniqueEntityId('note'),
    layerId: 'notes',
    position: { x: wx, y: wy },
    text: 'Note',
    fontSize: 0.75,
    rotation: 0,
    textAlign: 'center'
  }
  mapData.value.entities.push(ent)
  selectEntity(ent)
  syncSelectionPropsFormFromEntity()
  hasUnsavedChanges.value = true
  emitMapChanged()
  render()
}

const scaleSelectedEntities = (factor) => {
  if (!mapData.value?.entities || selectionCount.value < 1) return
  const f = Math.max(0.25, Math.min(4, factor))
  const movable = selectedEntities.value.filter((e) => !isEntityProtected(e))
  if (!movable.length) return
  recordHistoryBeforeMutation()
  for (const ent of movable) {
    if (ent.type === 'rect') {
      const cx = ent.x + ent.width / 2
      const cy = ent.y + ent.height / 2
      ent.width = Math.max(0.01, ent.width * f)
      ent.height = Math.max(0.01, ent.height * f)
      ent.x = cx - ent.width / 2
      ent.y = cy - ent.height / 2
    } else if (ent.type === 'line' && ent.start && ent.end) {
      const mx = (ent.start.x + ent.end.x) / 2
      const my = (ent.start.y + ent.end.y) / 2
      ent.start.x = mx + (ent.start.x - mx) * f
      ent.start.y = my + (ent.start.y - my) * f
      ent.end.x = mx + (ent.end.x - mx) * f
      ent.end.y = my + (ent.end.y - my) * f
    } else if (ent.type === 'text') {
      ent.fontSize = Math.max(0.05, (ent.fontSize || 1) * f)
    } else if (ent.type === 'polyline' && ent.points?.length) {
      const c = getPolylineCentroid(ent)
      for (const p of ent.points) {
        p.x = c.x + (p.x - c.x) * f
        p.y = c.y + (p.y - c.y) * f
      }
    } else if (ent.type === 'arc') {
      ent.radius = Math.max(0.05, (ent.radius || 0.5) * f)
    } else if (ent.type === 'point') {
      ent.radius = Math.max(0.05, (ent.radius || 0.3) * f)
    }
  }
  syncSelectionPropsFormFromEntity()
  hasUnsavedChanges.value = true
  syncRoomDimensionLabels()
  recomputeConstraintBanner()
  emitMapChanged()
  render()
}

const undoMap = () => {
  if (!canUndo.value || !mapData.value) return
  isApplyingHistory.value = true
  try {
    redoStack.value.push(JSON.stringify(mapData.value))
    while (redoStack.value.length > HISTORY_MAX) redoStack.value.shift()
    const prev = JSON.parse(undoStack.value.pop())
    mapData.value = prev
    mergeBoundsIntoMetadata()
    ensureValidBounds()
    applyShellClusterLayout()
    assignWallBundleIds(mapData.value.entities, {
      isLineExcluded: (e) => isEntityPerimeterLocked(e)
    })
    syncSelectionAfterHistoryRestore()
    syncSelectionPropsFormFromEntity()
    hasUnsavedChanges.value = true
    syncRoomDimensionLabels()
    emitMapChanged()
    render()
  } finally {
    isApplyingHistory.value = false
  }
}

const redoMap = () => {
  if (!canRedo.value || !mapData.value) return
  isApplyingHistory.value = true
  try {
    undoStack.value.push(JSON.stringify(mapData.value))
    while (undoStack.value.length > HISTORY_MAX) undoStack.value.shift()
    const next = JSON.parse(redoStack.value.pop())
    mapData.value = next
    mergeBoundsIntoMetadata()
    ensureValidBounds()
    applyShellClusterLayout()
    assignWallBundleIds(mapData.value.entities, {
      isLineExcluded: (e) => isEntityPerimeterLocked(e)
    })
    syncSelectionAfterHistoryRestore()
    syncSelectionPropsFormFromEntity()
    hasUnsavedChanges.value = true
    syncRoomDimensionLabels()
    emitMapChanged()
    render()
  } finally {
    isApplyingHistory.value = false
  }
}

const pickHandleForSelected = (screenX, screenY) => {
  if (!editMode.value) return null

  let bestLine = null
  let bestD = Infinity
  for (const ent of selectedEntities.value) {
    if (ent.type !== 'line' || !ent.start || !ent.end || isEntityProtected(ent)) continue
    const s1 = worldToScreen(ent.start.x, ent.start.y)
    const s2 = worldToScreen(ent.end.x, ent.end.y)
    const d1 = Math.hypot(screenX - s1.x, screenY - s1.y)
    const d2 = Math.hypot(screenX - s2.x, screenY - s2.y)
    if (d1 <= HANDLE_HIT_PX && d1 < bestD) {
      bestLine = { kind: 'line', lineId: ent.id, end: 'start' }
      bestD = d1
    }
    if (d2 <= HANDLE_HIT_PX && d2 < bestD) {
      bestLine = { kind: 'line', lineId: ent.id, end: 'end' }
      bestD = d2
    }
  }
  if (bestLine) return bestLine

  if (selectedEntities.value.length !== 1) return null
  const ent = selectedEntity.value
  if (!ent || isEntityProtected(ent)) return null

  // BBox corner resize handles (furniture polylines + axis-aligned rect)
  const canBBoxResize =
    (ent.type === 'polyline' && ent.layerId === 'furniture' && ent.points?.length) ||
    (ent.type === 'rect' && Math.abs(ent.rotation || 0) < 1e-3)
  if (canBBoxResize) {
    const bb = getEntityBoundingBox(ent)
    if (bb) {
      const corners = [
        { corner: 'nw', x: bb.minX, y: bb.maxY },
        { corner: 'ne', x: bb.maxX, y: bb.maxY },
        { corner: 'sw', x: bb.minX, y: bb.minY },
        { corner: 'se', x: bb.maxX, y: bb.minY }
      ]
      for (const c of corners) {
        const s = worldToScreen(c.x, c.y)
        if (Math.hypot(screenX - s.x, screenY - s.y) <= BBOX_HANDLE_HIT_PX) {
          return { kind: 'bbox', corner: c.corner }
        }
      }
    }
  }

  if (ent.type === 'rect' && Math.abs(ent.rotation || 0) < 1e-3) {
    const sex = ent.x + ent.width
    const sey = ent.y
    const s = worldToScreen(sex, sey)
    const d = Math.hypot(screenX - s.x, screenY - s.y)
    if (d <= HANDLE_HIT_PX) return { kind: 'rect-se' }
  }
  if (ent.type === 'rect' || ent.type === 'text') {
    const rh = getRotateHandleWorld(ent)
    if (rh) {
      const s = worldToScreen(rh.x, rh.y)
      if (Math.hypot(screenX - s.x, screenY - s.y) <= HANDLE_HIT_PX + 5) return { kind: 'rotate' }
    }
  }
  return null
}

const deleteSelection = () => {
  const toRemove = selectedEntities.value.filter((e) => !isEntityProtected(e))
  if (!toRemove.length || !mapData.value?.entities) return
  const n = toRemove.length
  const msg =
    n === 1
      ? 'Remove this element from the floor plan?'
      : `Remove ${n} elements from the floor plan?`
  if (!window.confirm(msg)) return
  recordHistoryBeforeMutation()
  const ids = new Set(toRemove.map((e) => e.id))
  mapData.value.entities = mapData.value.entities.filter((e) => !ids.has(e.id))
  selectedEntities.value = []
  hoveredEntity.value = null
  hasUnsavedChanges.value = true
  emit('entitySelected', null)
  emitMapChanged()
  render()
}

const DUPLICATE_OFFSET = 2

const offsetEntityCoords = (entity, dx, dy) => {
  switch (entity.type) {
    case 'line':
      entity.start.x += dx
      entity.start.y += dy
      entity.end.x += dx
      entity.end.y += dy
      break
    case 'rect':
      entity.x += dx
      entity.y += dy
      break
    case 'arc':
      entity.center.x += dx
      entity.center.y += dy
      break
    case 'text':
    case 'point':
      entity.position.x += dx
      entity.position.y += dy
      break
    case 'polyline':
      for (const p of entity.points || []) {
        p.x += dx
        p.y += dy
      }
      break
    default:
      break
  }
}

const duplicateSelection = () => {
  const src = selectedEntities.value.filter((e) => !isEntityProtected(e))
  if (!src.length || !mapData.value?.entities) return
  recordHistoryBeforeMutation()
  const existing = new Set(mapData.value.entities.map((e) => e.id))
  const genId = (baseId) => {
    let id
    do {
      id = `${baseId}__dup_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
    } while (existing.has(id))
    existing.add(id)
    return id
  }
  const clones = []
  for (const ent of src) {
    const c = JSON.parse(JSON.stringify(ent))
    c.id = genId(ent.id)
    offsetEntityCoords(c, DUPLICATE_OFFSET, DUPLICATE_OFFSET)
    mapData.value.entities.push(c)
    clones.push(c)
  }
  for (const e of mapData.value.entities) {
    if (e.type === 'line' && e.properties?.wallBundleId) {
      const p = { ...e.properties }
      delete p.wallBundleId
      e.properties = Object.keys(p).length ? p : {}
    }
  }
  applyShellClusterLayout()
  assignWallBundleIds(mapData.value.entities, {
    isLineExcluded: (e) => isEntityPerimeterLocked(e)
  })
  selectedEntities.value = clones
  hasUnsavedChanges.value = true
  emit('entitySelected', clones[0] ?? null)
  emitMapChanged()
  render()
}

const getClipboardCenter = () => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const e of clipboard.value) {
    const bb = _fastBounds(e)
    if (bb) {
      minX = Math.min(minX, bb.minX); minY = Math.min(minY, bb.minY)
      maxX = Math.max(maxX, bb.maxX); maxY = Math.max(maxY, bb.maxY)
    }
  }
  if (!isFinite(minX)) return { x: 0, y: 0 }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
}

const copySelection = () => {
  const src = selectedEntities.value.filter((e) => !isEntityProtected(e))
  if (!src.length) return
  clipboard.value = JSON.parse(JSON.stringify(src))
  pasteMode.value = true
  pasteCursorWorld.value = { ...mouseWorldCoords.value }
  render()
}

const pasteAtWorld = (wx, wy) => {
  if (!clipboard.value.length || !mapData.value?.entities) return
  const center = getClipboardCenter()
  const dx = wx - center.x
  const dy = wy - center.y
  recordHistoryBeforeMutation()
  const existing = new Set(mapData.value.entities.map((e) => e.id))
  const genId = (baseId) => {
    let id
    do {
      id = `${baseId}__cp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
    } while (existing.has(id))
    existing.add(id)
    return id
  }
  const placed = []
  for (const ent of clipboard.value) {
    const c = JSON.parse(JSON.stringify(ent))
    c.id = genId(ent.id)
    offsetEntityCoords(c, dx, dy)
    mapData.value.entities.push(c)
    placed.push(c)
  }
  applyShellClusterLayout()
  assignWallBundleIds(mapData.value.entities, {
    isLineExcluded: (e) => isEntityPerimeterLocked(e)
  })
  selectedEntities.value = placed
  pasteMode.value = false
  hasUnsavedChanges.value = true
  emit('entitySelected', placed[0] ?? null)
  emitMapChanged()
  render()
}

const cancelPaste = () => {
  pasteMode.value = false
  render()
}

const toggleEntityInSelection = (entity) => {
  if (!entity) return
  const i = selectedEntities.value.findIndex((e) => e.id === entity.id)
  if (i >= 0) selectedEntities.value.splice(i, 1)
  else {
    const expanded = expandSelectionWithWallBundles([entity])
    const ids = new Set(selectedEntities.value.map((e) => e.id))
    for (const q of expanded) {
      if (!ids.has(q.id)) {
        selectedEntities.value.push(q)
        ids.add(q.id)
      }
    }
    selectedEntities.value = expandSelectionWithWallBundles([...selectedEntities.value])
  }
  emit('entitySelected', selectedEntities.value[0] ?? null)
  render()
}

const rotateLine90Selected = () => {
  const line = selectedEntity.value
  if (!line || line.type !== 'line' || isEntityProtected(line)) return
  recordHistoryBeforeMutation()
  const mx = (line.start.x + line.end.x) / 2
  const my = (line.start.y + line.end.y) / 2
  const dx = line.end.x - line.start.x
  const dy = line.end.y - line.start.y
  const ndx = -dy
  const ndy = dx
  line.start.x = mx - ndx / 2
  line.start.y = my - ndy / 2
  line.end.x = mx + ndx / 2
  line.end.y = my + ndy / 2
  hasUnsavedChanges.value = true
  emitMapChanged()
  render()
}

/** Rotate all selected (non-protected) entities 90° CCW around their collective bounding-box center. */
const rotateSelectionGroup90 = () => {
  const movable = selectedEntities.value.filter((e) => !isEntityProtected(e))
  if (!movable.length) return
  recordHistoryBeforeMutation()

  // Compute collective center
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const e of movable) {
    const bb = getEntityBoundingBox(e)
    if (!bb) continue
    minX = Math.min(minX, bb.minX); maxX = Math.max(maxX, bb.maxX)
    minY = Math.min(minY, bb.minY); maxY = Math.max(maxY, bb.maxY)
  }
  if (!isFinite(minX)) return
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  // Rotate 90° CCW: (x,y) → (-(y-cy)+cx, (x-cx)+cy)
  const rot90 = (x, y) => ({ x: -(y - cy) + cx, y: (x - cx) + cy })

  for (const e of movable) {
    if (e.type === 'line' && e.start && e.end) {
      const ns = rot90(e.start.x, e.start.y)
      const ne = rot90(e.end.x, e.end.y)
      e.start.x = ns.x; e.start.y = ns.y
      e.end.x = ne.x; e.end.y = ne.y
    } else if (e.type === 'rect') {
      // Rotate rect center, then update x/y (swap w/h for 90°)
      const rc = rot90(e.x + e.width / 2, e.y + e.height / 2)
      const nw = e.height
      const nh = e.width
      e.x = rc.x - nw / 2
      e.y = rc.y - nh / 2
      e.width = nw
      e.height = nh
    } else if (e.type === 'polyline' && e.points?.length) {
      for (const p of e.points) {
        const np = rot90(p.x, p.y)
        p.x = np.x; p.y = np.y
      }
    } else if (e.type === 'text' && e.position) {
      const np = rot90(e.position.x, e.position.y)
      e.position.x = np.x; e.position.y = np.y
      e.rotation = ((e.rotation || 0) + 90) % 360
    } else if (e.type === 'arc' && e.center) {
      const np = rot90(e.center.x, e.center.y)
      e.center.x = np.x; e.center.y = np.y
    }
  }

  syncRoomDimensionLabels()
  recomputeConstraintBanner()
  hasUnsavedChanges.value = true
  emitMapChanged()
  render()
}

const snapLineOrthogonalSelected = () => {
  const line = selectedEntity.value
  if (!line || line.type !== 'line' || isEntityProtected(line)) return
  recordHistoryBeforeMutation()
  const dx = Math.abs(line.end.x - line.start.x)
  const dy = Math.abs(line.end.y - line.start.y)
  if (dx >= dy) {
    const y = (line.start.y + line.end.y) / 2
    line.start.y = y
    line.end.y = y
  } else {
    const x = (line.start.x + line.end.x) / 2
    line.start.x = x
    line.end.x = x
  }
  hasUnsavedChanges.value = true
  emitMapChanged()
  render()
}

const onEditorKeyDown = (e) => {
  if (!mapData.value) return
  const tag = (e.target && e.target.tagName) || ''
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return
  if (e.key === 'Escape') {
    if (pasteMode.value) {
      cancelPaste()
      return
    }
    // If measuring: first Escape clears the current measurement, second exits measure mode
    if (measureMode.value) {
      if (measureAnchor.value) {
        clearMeasure()
        render()
      } else {
        measureMode.value = false
        render()
      }
      return
    }
    selectedEntities.value = []
    hoveredEntity.value = null
    clearMarqueeState()
    emit('entitySelected', null)
    render()
    return
  }
  if (e.key === 'f' || e.key === 'F') {
    e.preventDefault()
    fitMapToView()
    return
  }
  if (e.key === 'v' || e.key === 'V') {
    toolMode.value = 'select'
    return
  }
  if (e.key === 'h' || e.key === 'H') {
    toolMode.value = 'pan'
    return
  }
  if (e.key === 't' || e.key === 'T') {
    if (!editMode.value) return
    e.preventDefault()
    toolMode.value = 'placeText'
    insertMenuOpen.value = false
    return
  }
  if (e.key === 'm' || e.key === 'M') {
    e.preventDefault()
    toggleMeasureMode()
    return
  }
  if (e.key === 'x' || e.key === 'X') {
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      axisLock.value = axisLock.value === 'x' ? 'free' : 'x'
      return
    }
  }
  if (e.key === 'y' || e.key === 'Y') {
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      axisLock.value = axisLock.value === 'y' ? 'free' : 'y'
      return
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    if (e.shiftKey) {
      if (canRedo.value) redoMap()
    } else {
      if (canUndo.value) undoMap()
    }
    return
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
    e.preventDefault()
    if (canRedo.value) redoMap()
    return
  }
  if (!editMode.value) return
  if (e.key === '[') {
    if (hasUnlockedInSelection.value) {
      e.preventDefault()
      scaleSelectedEntities(0.9)
    }
    return
  }
  if (e.key === ']') {
    if (hasUnlockedInSelection.value) {
      e.preventDefault()
      scaleSelectedEntities(1.1)
    }
    return
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
    if (hasDeletableSelection.value) {
      e.preventDefault()
      copySelection()
    }
    return
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
    if (clipboard.value.length) {
      e.preventDefault()
      pasteMode.value = true
      render()
    }
    return
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
    if (hasDeletableSelection.value) {
      e.preventDefault()
      duplicateSelection()
    }
    return
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (hasDeletableSelection.value) {
      e.preventDefault()
      deleteSelection()
    }
  } else if (e.key === 'r' || e.key === 'R') {
    if (selectedEntity.value?.type === 'line') {
      e.preventDefault()
      rotateLine90Selected()
    }
  }
}

// ============================================================================
// MOUSE EVENT HANDLERS
// ============================================================================

/**
 * Handle mouse down event
 */
const handleMouseDown = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top

  insertMenuOpen.value = false
  closeContextMenu()

  if (event.button === 1) {
    event.preventDefault()
    isPanning.value = true
    dragStart.value = { x: screenX, y: screenY }
    return
  }

  if (event.button === 0) { // Left click
    // Measurement tool — intercepts click before any edit/pan logic
    if (measureMode.value) {
      const w = screenToWorld(screenX, screenY)
      if (!measureAnchor.value || measureFixed.value) {
        // First click or remeasure: set anchor
        measureAnchor.value = { x: w.x, y: w.y }
        measureLive.value = { x: w.x, y: w.y }
        measureFixed.value = false
      } else {
        // Second click: lock the measurement
        measureLive.value = { x: w.x, y: w.y }
        measureFixed.value = true
      }
      render()
      return
    }

    if (editMode.value && toolMode.value === 'pan') {
      isPanning.value = true
      dragStart.value = { x: screenX, y: screenY }
      return
    }

    if (editMode.value && pasteMode.value) {
      const w = screenToWorld(screenX, screenY)
      pasteAtWorld(w.x, w.y)
      return
    }

    if (editMode.value && toolMode.value === 'placeText') {
      const w = screenToWorld(screenX, screenY)
      recordHistoryBeforeMutation()
      addTextNoteAtWorld(w.x, w.y)
      toolMode.value = 'select'
      return
    }

    if (editMode.value && toolMode.value === 'select' && event.altKey) {
      const world = screenToWorld(screenX, screenY)
      const hits = findAllEntitiesAtWorld(world.x, world.y)
      if (hits.length) {
        const dist = Math.hypot(screenX - lastAltPickScreen.value.x, screenY - lastAltPickScreen.value.y)
        if (dist > 14) altPickCycle.value = 0
        const pick = hits[altPickCycle.value % hits.length]
        altPickCycle.value++
        lastAltPickScreen.value = { x: screenX, y: screenY }
        selectEntityRespectingWallBundle(pick)
        if (isEntityProtected(pick)) return
        dragPolylineSnapshot.value =
          pick.type === 'polyline' && pick.points?.length
            ? JSON.parse(JSON.stringify(pick.points))
            : null
        recordHistoryBeforeMutation()
        isDragging.value = true
        dragStart.value = screenToWorld(screenX, screenY)
        entityDragStart.value = getEntityPosition(pick)
        roomDragLastGoodDelta.value = isRoomFootprint(pick) ? { dx: 0, dy: 0 } : roomDragLastGoodDelta.value
        return
      }
    }

    if (editMode.value) {
      const entityUnder = findEntityAtPosition(screenX, screenY)

      if (toolMode.value === 'select' && event.shiftKey && entityUnder) {
        toggleEntityInSelection(entityUnder)
        return
      }

      const multi = selectedEntities.value.length > 1
      const inSel = !!(entityUnder && isEntityInSelection(entityUnder))

      const hLine = pickHandleForSelected(screenX, screenY)
      if (hLine?.kind === 'line') {
        draggingHandle.value = hLine
        recordHistoryBeforeMutation()
        isDragging.value = true
        dragStart.value = screenToWorld(screenX, screenY)
        return
      }

      if (
        !multi &&
        entityUnder?.type === 'rect' &&
        !isEntityProtected(entityUnder) &&
        Math.abs(entityUnder.rotation || 0) < 1e-3
      ) {
        const s = worldToScreen(entityUnder.x + entityUnder.width, entityUnder.y)
        if (Math.hypot(screenX - s.x, screenY - s.y) <= HANDLE_HIT_PX) {
          selectEntity(entityUnder)
          draggingHandle.value = { kind: 'rect-se' }
          rectResizeTopY.value = entityUnder.y + entityUnder.height
          recordHistoryBeforeMutation()
          isDragging.value = true
          dragStart.value = screenToWorld(screenX, screenY)
          return
        }
      }

      const h = pickHandleForSelected(screenX, screenY)
      if (h) {
        if (h.kind === 'rotate' && selectedEntity.value) {
          const ent = selectedEntity.value
          const c = getEntityRotationCenterWorld(ent)
          const w0 = screenToWorld(screenX, screenY)
          rotateDragRef.value = {
            cx: c.x,
            cy: c.y,
            baseEntityDeg: ent.rotation || 0,
            basePointerRad: Math.atan2(w0.y - c.y, w0.x - c.x)
          }
        }
        if (h.kind === 'bbox' && selectedEntity.value) {
          const ent = selectedEntity.value
          const bb = getEntityBoundingBox(ent)
          if (bb) {
            bboxResizeRef.value = {
              ent,
              corner: h.corner,
              bb,
              origPoints:
                ent.type === 'polyline' && ent.points?.length
                  ? JSON.parse(JSON.stringify(ent.points))
                  : null,
              origRect:
                ent.type === 'rect'
                  ? { x: ent.x, y: ent.y, width: ent.width, height: ent.height }
                  : null
            }
          }
        }
        draggingHandle.value = h
        if (h.kind === 'rect-se' && selectedEntity.value?.type === 'rect') {
          rectResizeTopY.value = selectedEntity.value.y + selectedEntity.value.height
        }
        recordHistoryBeforeMutation()
        isDragging.value = true
        dragStart.value = screenToWorld(screenX, screenY)
        return
      }

      if (entityUnder) {
        draggingHandle.value = null

        if (isEntityProtected(entityUnder)) {
          selectEntityRespectingWallBundle(entityUnder)
          return
        }

        // Add clicked entity to selection (additive by default)
        if (!inSel) {
          selectEntityRespectingWallBundle(entityUnder)
        }

        // Start drag on ALL selected entities as a group
        const movable = selectedEntities.value.filter((e) => !isEntityProtected(e))
        if (!movable.length) return

        if (movable.length > 1) {
          // Group drag
          groupDragLastGoodDelta.value = { dx: 0, dy: 0 }
          wallDragGuide.value = null
          groupDragItems.value = movable.map((entity) => ({
            entity,
            origPos: getEntityPosition(entity),
            polySnap:
              entity.type === 'polyline' && entity.points?.length
                ? JSON.parse(JSON.stringify(entity.points))
                : null
          }))
          dragPolylineSnapshot.value = null
          recordHistoryBeforeMutation()
          isDragging.value = true
          dragStart.value = screenToWorld(screenX, screenY)
        } else {
          // Single entity drag
          const ent = movable[0]
          recordHistoryBeforeMutation()
          isDragging.value = true
          dragStart.value = screenToWorld(screenX, screenY)
          entityDragStart.value = getEntityPosition(ent)
          dragPolylineSnapshot.value =
            ent.type === 'polyline' && ent.points?.length
              ? JSON.parse(JSON.stringify(ent.points))
              : null
          roomDragLastGoodDelta.value = isRoomFootprint(ent) ? { dx: 0, dy: 0 } : roomDragLastGoodDelta.value
        }
      } else if (toolMode.value === 'select') {
        draggingHandle.value = null
        pendingMarquee.value = true
        marqueeActive.value = false
        marqueeStart.value = { x: screenX, y: screenY }
        marqueeEnd.value = { x: screenX, y: screenY }
        marqueeAdditive.value = !!(event.ctrlKey || event.metaKey)
      } else {
        draggingHandle.value = null
        selectedEntities.value = []
        emit('entitySelected', null)
      }
    } else {
      // Pan mode
      isPanning.value = true
      dragStart.value = { x: screenX, y: screenY }
    }
  } else if (event.button === 2) { // Right click
    // If user drags in edit mode: marquee selection. Otherwise: context menu on mouse up.
    rightClickRef.value = {
      down: true,
      startedPan: false,
      startedMarquee: false,
      startScreen: { x: screenX, y: screenY }
    }
  }
}

/**
 * Handle mouse move event
 */
const handleMouseMove = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  
  // Update mouse coordinates
  mouseScreenCoords.value = { x: screenX, y: screenY }
  mouseWorldCoords.value = screenToWorld(screenX, screenY)

  // Ghost preview follows cursor in paste mode
  if (pasteMode.value) {
    pasteCursorWorld.value = { ...mouseWorldCoords.value }
    render()
  }

  // Live measurement line follows cursor
  if (measureMode.value && measureAnchor.value && !measureFixed.value) {
    measureLive.value = { ...mouseWorldCoords.value }
    render()
  }

  // Right-click drag: in edit mode → marquee selection; otherwise → pan
  if (rightClickRef.value.down && !rightClickRef.value.startedPan && !rightClickRef.value.startedMarquee) {
    const dx = screenX - rightClickRef.value.startScreen.x
    const dy = screenY - rightClickRef.value.startScreen.y
    if (Math.hypot(dx, dy) >= 6) {
      if (editMode.value) {
        // Start marquee selection via right-click drag
        rightClickRef.value.startedMarquee = true
        pendingMarquee.value = true
        marqueeActive.value = false
        marqueeStart.value = { x: rightClickRef.value.startScreen.x, y: rightClickRef.value.startScreen.y }
        marqueeEnd.value = { x: screenX, y: screenY }
        marqueeAdditive.value = false
      } else {
        rightClickRef.value.startedPan = true
        isPanning.value = true
        dragStart.value = { x: screenX, y: screenY }
      }
    }
  }

  if (pendingMarquee.value) {
    marqueeEnd.value = { x: screenX, y: screenY }
    const mdx = screenX - marqueeStart.value.x
    const mdy = screenY - marqueeStart.value.y
    if (!marqueeActive.value && Math.hypot(mdx, mdy) >= MARQUEE_MIN_PX) marqueeActive.value = true
    render()
    return
  }

  if (isDragging.value && draggingHandle.value?.kind === 'rotate' && selectedEntity.value && rotateDragRef.value) {
    const w = screenToWorld(screenX, screenY)
    const r0 = rotateDragRef.value
    const cur = Math.atan2(w.y - r0.cy, w.x - r0.cx)
    selectedEntity.value.rotation = r0.baseEntityDeg + (cur - r0.basePointerRad) * 180 / Math.PI
    syncSelectionPropsFormFromEntity()
    hasUnsavedChanges.value = true
    render()
    return
  }

  if (isDragging.value && groupDragItems.value?.length) {
    const currentWorld = screenToWorld(screenX, screenY)
    let dx = currentWorld.x - dragStart.value.x
    let dy = currentWorld.y - dragStart.value.y
    if (axisLock.value === 'x') dy = 0
    else if (axisLock.value === 'y') dx = 0
    for (const item of groupDragItems.value) {
      moveEntity(item.entity, item.origPos, dx, dy, item.polySnap)
    }
    const inner = innerConstraintRect.value
    if (inner && isValidBounds(inner)) {
      // Lightweight boundary check during drag — full validation deferred to mouseup
      let outOfBounds = false
      for (const item of groupDragItems.value) {
        const bb = _fastBounds(item.entity)
        if (bb && (bb.minX < inner.minX - 0.5 || bb.maxX > inner.maxX + 0.5 ||
                   bb.minY < inner.minY - 0.5 || bb.maxY > inner.maxY + 0.5)) {
          outOfBounds = true
          break
        }
      }
      if (outOfBounds) {
        const g = groupDragLastGoodDelta.value
        for (const item of groupDragItems.value) {
          moveEntity(item.entity, item.origPos, g.dx, g.dy, item.polySnap)
        }
        constraintBanner.value = 'Cannot place outside boundary.'
        wallDragGuide.value = null
      } else {
        groupDragLastGoodDelta.value = { dx, dy }
        constraintBanner.value = ''
      }
    }
    updateWallDragGuideFromGroupDrag(dx, dy, groupDragItems.value)
    updateDragOverlays(dx, dy, groupDragItems.value[0]?.entity, groupDragItems.value)
    hasUnsavedChanges.value = true
    render()
    return
  }

  if (isDragging.value && draggingHandle.value) {
    const dh = draggingHandle.value
    const w = screenToWorld(screenX, screenY)

    if (dh.kind === 'line') {
      const lineEnt =
        dh.lineId != null
          ? mapData.value?.entities?.find((e) => e.id === dh.lineId)
          : selectedEntity.value
      if (!lineEnt || lineEnt.type !== 'line' || isEntityProtected(lineEnt)) return
      let wx = w.x
      let wy = w.y
      if (event.shiftKey) {
        const other = dh.end === 'start' ? lineEnt.end : lineEnt.start
        if (Math.abs(wx - other.x) < Math.abs(wy - other.y)) wx = other.x
        else wy = other.y
      }
      if (dh.end === 'start') {
        lineEnt.start.x = wx
        lineEnt.start.y = wy
      } else {
        lineEnt.end.x = wx
        lineEnt.end.y = wy
      }
      updateDragOverlays(0, 0, lineEnt, null)
      hasUnsavedChanges.value = true
      render()
      return
    }

    const ent = selectedEntity.value
    if (!ent || isEntityProtected(ent)) return
    if (dh.kind === 'rect-se' && ent.type === 'rect') {
      const top = rectResizeTopY.value
      const prev = { x: ent.x, y: ent.y, w: ent.width, h: ent.height }
      // Use room-type minimum if available, else 0.5 ft fallback
      const spec = isRoomFootprint(ent) ? getRoomMinSpec(ent.properties?.roomType) : null
      // spec.w/h are sorted-agnostic (roomMeetsMinimumFootprint checks both orientations)
      // For SE handle: enforce spec minimums on each axis independently
      const minW = spec ? Math.min(spec.w, spec.h) : 0.5
      const minH = spec ? Math.min(spec.w, spec.h) : 0.5
      ent.width = Math.max(minW, w.x - ent.x)
      ent.y = Math.min(w.y, top - minH)
      ent.height = Math.max(minH, top - ent.y)
      const inner = innerConstraintRect.value
      if (inner && isValidBounds(inner) && isRoomFootprint(ent)) {
        const v = validateSingleRoomRect(ent, mapData.value.entities, inner)
        if (!v.ok) {
          ent.x = prev.x
          ent.y = prev.y
          ent.width = prev.w
          ent.height = prev.h
          constraintBanner.value = v.issues[0]?.message || 'Invalid room'
        } else {
          constraintBanner.value = ''
        }
      }
      updateDragOverlays(0, 0, ent, null)
      hasUnsavedChanges.value = true
      render()
      return
    }
    if (dh.kind === 'bbox' && bboxResizeRef.value && bboxResizeRef.value.ent?.id === ent.id) {
      const bb0 = bboxResizeRef.value.bb
      const minW = 0.5
      const minH = 0.5

      // Opposite corner is anchor
      const anchor =
        dh.corner === 'nw' ? { x: bb0.maxX, y: bb0.minY }
        : dh.corner === 'ne' ? { x: bb0.minX, y: bb0.minY }
        : dh.corner === 'sw' ? { x: bb0.maxX, y: bb0.maxY }
        : { x: bb0.minX, y: bb0.maxY } // se

      const corner0 =
        dh.corner === 'nw' ? { x: bb0.minX, y: bb0.maxY }
        : dh.corner === 'ne' ? { x: bb0.maxX, y: bb0.maxY }
        : dh.corner === 'sw' ? { x: bb0.minX, y: bb0.minY }
        : { x: bb0.maxX, y: bb0.minY } // se

      // New corner follows pointer, but keep min size
      let newCorner = { x: w.x, y: w.y }
      if (Math.abs(newCorner.x - anchor.x) < minW) newCorner.x = anchor.x + Math.sign(newCorner.x - anchor.x || 1) * minW
      if (Math.abs(newCorner.y - anchor.y) < minH) newCorner.y = anchor.y + Math.sign(newCorner.y - anchor.y || 1) * minH

      const sx = (newCorner.x - anchor.x) / (corner0.x - anchor.x || 1e-6)
      const sy = (newCorner.y - anchor.y) / (corner0.y - anchor.y || 1e-6)

      if (ent.type === 'polyline' && bboxResizeRef.value.origPoints?.length) {
        const orig = bboxResizeRef.value.origPoints
        for (let i = 0; i < ent.points.length; i++) {
          const op = orig[i]
          const p = ent.points[i]
          if (!op || !p) continue
          p.x = anchor.x + (op.x - anchor.x) * sx
          p.y = anchor.y + (op.y - anchor.y) * sy
        }
      } else if (ent.type === 'rect' && bboxResizeRef.value.origRect) {
        // Convert to bbox-style update then back to rect
        const x1 = anchor.x
        const y1 = anchor.y
        const x2 = newCorner.x
        const y2 = newCorner.y
        const nx = Math.min(x1, x2)
        const ny = Math.min(y1, y2)
        const nw = Math.max(minW, Math.abs(x2 - x1))
        const nh = Math.max(minH, Math.abs(y2 - y1))
        const before = { x: ent.x, y: ent.y, width: ent.width, height: ent.height }
        ent.x = nx
        ent.y = ny
        ent.width = nw
        ent.height = nh
        // Keep rotation at 0 for this interaction
        ent.rotation = 0
        const inner = innerConstraintRect.value
        if (inner && isValidBounds(inner) && isRoomFootprint(ent)) {
          const v = validateSingleRoomRect(ent, mapData.value.entities, inner)
          if (!v.ok) {
            ent.x = before.x
            ent.y = before.y
            ent.width = before.width
            ent.height = before.height
            constraintBanner.value = v.issues[0]?.message || 'Invalid room'
          } else {
            constraintBanner.value = ''
          }
        }
      } else {
        return
      }

      syncSelectionPropsFormFromEntity()
      updateDragOverlays(0, 0, ent, null)
      hasUnsavedChanges.value = true
      render()
      return
    }
  }

  if (isPanning.value) {
    // Pan the view
    const dx = screenX - dragStart.value.x
    const dy = screenY - dragStart.value.y
    
    const scale = baseScale.value * zoom.value
    panOffset.value = {
      x: panOffset.value.x - dx / scale,
      y: panOffset.value.y + dy / scale // Flip Y
    }
    
    dragStart.value = { x: screenX, y: screenY }
    render()
  } else if (isDragging.value && selectedEntity.value && !draggingHandle.value) {
    const currentWorld = screenToWorld(screenX, screenY)
    let dx = currentWorld.x - dragStart.value.x
    let dy = currentWorld.y - dragStart.value.y
    if (axisLock.value === 'x') dy = 0
    else if (axisLock.value === 'y') dx = 0
    const ent = selectedEntity.value
    if (isEntityProtected(ent)) return
    const inner = innerConstraintRect.value
    const shell = fixedConstraintBounds.value
    if (inner && isValidBounds(inner) && isRoomFootprint(ent)) {
      const ox = entityDragStart.value.x
      const oy = entityDragStart.value.y
      ent.x = ox + dx
      ent.y = oy + dy
      const v = validateSingleRoomRect(ent, mapData.value.entities, inner)
      if (!v.ok) {
        const g = roomDragLastGoodDelta.value
        ent.x = ox + g.dx
        ent.y = oy + g.dy
        constraintBanner.value = v.issues[0]?.message || 'Invalid layout'
      } else {
        roomDragLastGoodDelta.value = { dx, dy }
        constraintBanner.value = ''
      }
    } else {
      moveEntity(ent, entityDragStart.value, dx, dy, undefined)
      // Non-room entities: prevent dragging outside boundary shell
      if (shell && isValidBounds(shell) && ent.type !== 'text') {
        const bb = getEntityBoundingBox(ent)
        if (bb && (bb.minX < shell.minX - 0.5 || bb.maxX > shell.maxX + 0.5 ||
                   bb.minY < shell.minY - 0.5 || bb.maxY > shell.maxY + 0.5)) {
          // Revert to last good position
          moveEntity(ent, entityDragStart.value, roomDragLastGoodDelta.value.dx, roomDragLastGoodDelta.value.dy, undefined)
          constraintBanner.value = 'Cannot place object outside boundary walls.'
        } else {
          roomDragLastGoodDelta.value = { dx, dy }
          constraintBanner.value = ''
        }
      }
    }
    updateDragOverlays(dx, dy, ent, null)
    hasUnsavedChanges.value = true
    render()
  } else if (editMode.value && (toolMode.value === 'select' || toolMode.value === 'placeText')) {
    // Throttle hover hit-testing to at most once per frame
    if (!_hoverRAF) {
      _hoverRAF = requestAnimationFrame(() => {
        _hoverRAF = 0
        if (!canvas.value) return
        const entity = findEntityAtPosition(screenX, screenY)
        if (entity !== hoveredEntity.value) {
          hoveredEntity.value = entity
          render()
        }
      })
    }
  }
}

/**
 * Handle mouse up event
 */
const handleMouseUp = (event) => {
  if (pendingMarquee.value || marqueeActive.value) {
    if (marqueeActive.value) finalizeMarqueeSelection()
    else {
      const mdx = marqueeEnd.value.x - marqueeStart.value.x
      const mdy = marqueeEnd.value.y - marqueeStart.value.y
      if (Math.hypot(mdx, mdy) < MARQUEE_MIN_PX && !marqueeAdditive.value) {
        selectedEntities.value = []
        emit('entitySelected', null)
      }
    }
    clearMarqueeState()
  }

  // If right-click wasn't used for panning or marquee, open the context menu here
  if (rightClickRef.value.down) {
    const rect = canvas.value.getBoundingClientRect()
    const screenX = (event?.clientX ?? rect.left) - rect.left
    const screenY = (event?.clientY ?? rect.top) - rect.top
    if (!rightClickRef.value.startedPan && !rightClickRef.value.startedMarquee) {
      if (editMode.value) {
        const entityUnder = findEntityAtPosition(screenX, screenY)
        if (entityUnder && !isEntityInSelection(entityUnder)) {
          selectEntityRespectingWallBundle(entityUnder)
        }
      }
      openContextMenuAt(screenX, screenY)
    }
    rightClickRef.value.down = false
    rightClickRef.value.startedPan = false
    rightClickRef.value.startedMarquee = false
  }

  const shouldRelayoutShell =
    editMode.value && isDragging.value && mapData.value?.entities?.length
  isDragging.value = false
  isPanning.value = false
  draggingHandle.value = null
  dragPolylineSnapshot.value = null
  groupDragItems.value = null
  rotateDragRef.value = null
  bboxResizeRef.value = null
  wallDragGuide.value = null
  dragDimOverlay.value = null
  if (shouldRelayoutShell) {
    applyShellClusterLayout()
    assignWallBundleIds(mapData.value.entities, {
      isLineExcluded: (e) => isEntityPerimeterLocked(e)
    })
  }
  syncRoomDimensionLabels()
  recomputeConstraintBanner()
  if (shouldRelayoutShell || hasUnsavedChanges.value) {
    emitMapChanged()
  }
}

/**
 * Handle mouse leave event
 */
const handleMouseLeave = () => {
  if (pendingMarquee.value || marqueeActive.value) clearMarqueeState()
  isDragging.value = false
  isPanning.value = false
  draggingHandle.value = null
  dragPolylineSnapshot.value = null
  groupDragItems.value = null
  rotateDragRef.value = null
  bboxResizeRef.value = null
  wallDragGuide.value = null
  dragDimOverlay.value = null
  rightClickRef.value.down = false
  rightClickRef.value.startedPan = false
  rightClickRef.value.startedMarquee = false
  hoveredEntity.value = null
  render()
}

/**
 * Handle mouse wheel event (zoom)
 */
const handleWheel = (event) => {
  event.preventDefault()
  
  const rect = canvas.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  
  // Get world position before zoom
  const worldBefore = screenToWorld(screenX, screenY)
  
  // Adjust zoom
  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
  const newZoom = Math.max(0.1, Math.min(10, zoom.value * zoomFactor))
  zoom.value = newZoom
  
  // Get world position after zoom
  const worldAfter = screenToWorld(screenX, screenY)
  
  // Adjust pan to keep the point under cursor fixed
  panOffset.value = {
    x: panOffset.value.x + (worldBefore.x - worldAfter.x),
    y: panOffset.value.y + (worldBefore.y - worldAfter.y)
  }
  
  render()
}

// ============================================================================
// ENTITY MANIPULATION
// ============================================================================

/**
 * Get the position of an entity (for drag start)
 */
const getEntityPosition = (entity) => {
  switch (entity.type) {
    case 'line':
      return { x: entity.start.x, y: entity.start.y }
    case 'rect':
      return { x: entity.x, y: entity.y }
    case 'arc':
      return { x: entity.center.x, y: entity.center.y }
    case 'text':
    case 'point':
      return { x: entity.position.x, y: entity.position.y }
    case 'polyline':
      if (!entity.points?.length) return { x: 0, y: 0 }
      const bb = getEntityBoundingBox(entity)
      return bb
        ? { x: (bb.minX + bb.maxX) / 2, y: (bb.minY + bb.maxY) / 2 }
        : { x: entity.points[0].x, y: entity.points[0].y }
    default:
      return { x: 0, y: 0 }
  }
}

/**
 * Move an entity by delta from its original position
 */
const moveEntity = (entity, originalPos, dx, dy, polySnapOverride = undefined) => {
  if (isEntityProtected(entity)) return
  // Apply axis lock
  if (axisLock.value === 'x') dy = 0
  else if (axisLock.value === 'y') dx = 0
  const polySnap =
    polySnapOverride !== undefined ? polySnapOverride : dragPolylineSnapshot.value
  switch (entity.type) {
    case 'line':
      const lineDx = entity.end.x - entity.start.x
      const lineDy = entity.end.y - entity.start.y
      entity.start.x = originalPos.x + dx
      entity.start.y = originalPos.y + dy
      entity.end.x = entity.start.x + lineDx
      entity.end.y = entity.start.y + lineDy
      break
    case 'rect':
      entity.x = originalPos.x + dx
      entity.y = originalPos.y + dy
      break
    case 'arc':
      entity.center.x = originalPos.x + dx
      entity.center.y = originalPos.y + dy
      break
    case 'text':
    case 'point':
      entity.position.x = originalPos.x + dx
      entity.position.y = originalPos.y + dy
      break
    case 'polyline':
      if (!entity.points?.length || !polySnap) break
      entity.points.forEach((p, i) => {
        const o = polySnap[i]
        if (o) {
          p.x = o.x + dx
          p.y = o.y + dy
        }
      })
      break
  }
}

/**
 * Select an entity
 */
const selectEntity = (entity) => {
  selectedEntities.value = entity ? [entity] : []
  emit('entitySelected', entity)
}

/** Add entity (and its wall-bundle peers) to the current selection. */
const addEntityToSelection = (entity) => {
  if (!entity) return
  if (isEntityInSelection(entity)) return
  const toAdd = []
  if (entity.type === 'line' && entity.properties?.wallBundleId && mapData.value?.entities) {
    const peers = getWallBundleLines(mapData.value.entities, entity).filter((e) => !isEntityProtected(e))
    if (peers.length > 1) {
      for (const p of peers) {
        if (!isEntityInSelection(p)) toAdd.push(p)
      }
    } else {
      toAdd.push(entity)
    }
  } else {
    toAdd.push(entity)
  }
  selectedEntities.value = [...selectedEntities.value, ...toAdd]
  emit('entitySelected', entity)
}

/** Remove entity (and its wall-bundle peers) from the current selection. */
const removeEntityFromSelection = (entity) => {
  if (!entity) return
  const idsToRemove = new Set([entity.id])
  if (entity.type === 'line' && entity.properties?.wallBundleId && mapData.value?.entities) {
    const peers = getWallBundleLines(mapData.value.entities, entity)
    for (const p of peers) idsToRemove.add(p.id)
  }
  selectedEntities.value = selectedEntities.value.filter((e) => !idsToRemove.has(e.id))
  emit('entitySelected', selectedEntities.value[0] ?? null)
}

const selectEntityRespectingWallBundle = (entity) => {
  if (!entity) {
    selectedEntities.value = []
    emit('entitySelected', null)
    return
  }
  // Additive selection: add to existing selection instead of replacing
  if (isEntityInSelection(entity)) return // already selected, keep it
  addEntityToSelection(entity)
}

const applyWallThicknessPreset = (thicknessFt) => {
  const meta = wallBundleSelectionMeta.value
  if (!meta || !mapData.value) return
  recordHistoryBeforeMutation()
  if (applyThicknessToBundle(meta.lines, thicknessFt)) {
    hasUnsavedChanges.value = true
    syncRoomDimensionLabels()
    recomputeConstraintBanner()
    emitMapChanged()
    render()
  }
}

const updateWallDragGuideFromGroupDrag = (dx, dy, items) => {
  const shell = getShellClusterBoundsForWallDragItems(items)
  if (!shell || !isValidBounds(shell) || !items?.length) {
    wallDragGuide.value = null
    return
  }
  if (!items.every((it) => it.entity?.type === 'line')) {
    wallDragGuide.value = null
    return
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const it of items) {
    const e = it.entity
    const ox = it.origPos.x
    const oy = it.origPos.y
    const edx = e.end.x - e.start.x
    const edy = e.end.y - e.start.y
    const sx = ox + dx
    const sy = oy + dy
    const ex = sx + edx
    const ey = sy + edy
    for (const p of [
      { x: sx, y: sy },
      { x: ex, y: ey }
    ]) {
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
    }
  }
  const adx = Math.abs(dx)
  const ady = Math.abs(dy)
  const labels = []
  let x1
  let y1
  let x2
  let y2
  if (adx >= ady && adx > 0.02) {
    const cy = (minY + maxY) / 2
    if (dx > 0) {
      x1 = maxX
      y1 = cy
      x2 = shell.maxX
      y2 = cy
      labels.push(`Boundary gap →: ${(shell.maxX - maxX).toFixed(2)} ft`)
    } else {
      x1 = shell.minX
      y1 = cy
      x2 = minX
      y2 = cy
      labels.push(`Boundary gap ←: ${(minX - shell.minX).toFixed(2)} ft`)
    }
  } else if (ady > 0.02) {
    const cx = (minX + maxX) / 2
    if (dy > 0) {
      x1 = cx
      y1 = maxY
      x2 = cx
      y2 = shell.maxY
      labels.push(`Boundary gap ↑: ${(shell.maxY - maxY).toFixed(2)} ft`)
    } else {
      x1 = cx
      y1 = shell.minY
      x2 = cx
      y2 = minY
      labels.push(`Boundary gap ↓: ${(minY - shell.minY).toFixed(2)} ft`)
    }
  } else {
    wallDragGuide.value = null
    return
  }
  wallDragGuide.value = { x1, y1, x2, y2, labels }
}

const drawWallDragGuideOverlay = (context) => {
  const g = wallDragGuide.value
  if (!g || !editMode.value) return
  const p1 = worldToScreen(g.x1, g.y1)
  const p2 = worldToScreen(g.x2, g.y2)
  context.save()
  context.strokeStyle = 'rgba(8, 145, 178, 0.95)'
  context.lineWidth = 1.5
  context.setLineDash([5, 4])
  context.beginPath()
  context.moveTo(p1.x, p1.y)
  context.lineTo(p2.x, p2.y)
  context.stroke()
  context.setLineDash([])
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2
  context.font = '600 11px system-ui, Segoe UI, sans-serif'
  context.fillStyle = 'rgba(15, 118, 110, 0.98)'
  context.textAlign = 'left'
  g.labels.forEach((t, i) => {
    context.fillText(t, mx + 10, my - 8 + i * 15)
  })
  context.restore()
}

/**
 * Update dragDimOverlay and wallDragGuide for any dragged entity/group.
 * Call from mousemove during drag.
 */
const updateDragOverlays = (dx, dy, entity, items) => {
  const shell = fixedConstraintBounds.value
  // --- Wall bundle group drag: existing guide + dim overlay ---
  if (items?.length && items.every((it) => it.entity?.type === 'line')) {
    updateWallDragGuideFromGroupDrag(dx, dy, items)
    // Compute actual bounding box of the dragged lines (current position)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const it of items) {
      const e = it.entity
      minX = Math.min(minX, e.start.x, e.end.x)
      maxX = Math.max(maxX, e.start.x, e.end.x)
      minY = Math.min(minY, e.start.y, e.end.y)
      maxY = Math.max(maxY, e.start.y, e.end.y)
    }
    const w = maxX - minX
    const h = maxY - minY
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    // Show W×H if it's a 2D block, otherwise show length of dominant axis
    const label = (w > 0.1 && h > 0.1)
      ? `${fmtDimFt(w)} × ${fmtDimFt(h)} ft`
      : `${fmtDimFt(Math.max(w, h))} ft`
    dragDimOverlay.value = { cx, cy, label }
    return
  }
  wallDragGuide.value = null

  // --- Mixed group drag (multiple entities, not all lines) ---
  if (items?.length > 1) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const it of items) {
      const bb = getEntityBoundingBox(it.entity)
      if (!bb) continue
      minX = Math.min(minX, bb.minX); maxX = Math.max(maxX, bb.maxX)
      minY = Math.min(minY, bb.minY); maxY = Math.max(maxY, bb.maxY)
    }
    if (isFinite(minX)) {
      const w = maxX - minX
      const h = maxY - minY
      dragDimOverlay.value = {
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
        label: `${fmtDimFt(w)} × ${fmtDimFt(h)} ft`
      }
    } else {
      dragDimOverlay.value = null
    }
    return
  }

  if (!entity) { dragDimOverlay.value = null; return }

  // --- Rect entity ---
  if (entity.type === 'rect') {
    const cx = entity.x + entity.width / 2
    const cy = entity.y + entity.height / 2
    dragDimOverlay.value = { cx, cy, label: `${fmtDimFt(entity.width)} × ${fmtDimFt(entity.height)} ft` }
    // Gap guide to shell boundary
    if (shell && isValidBounds(shell)) {
      const adx = Math.abs(dx), ady = Math.abs(dy)
      if (adx >= ady && adx > 0.02) {
        const side = dx > 0 ? 'right' : 'left'
        const ex = side === 'right' ? entity.x + entity.width : entity.x
        const bx = side === 'right' ? shell.maxX : shell.minX
        const gap = Math.abs(bx - ex)
        wallDragGuide.value = {
          x1: ex, y1: cy, x2: bx, y2: cy,
          labels: [`Gap ${side === 'right' ? '→' : '←'}: ${fmtDimFt(gap)} ft`]
        }
      } else if (ady > 0.02) {
        const side = dy > 0 ? 'top' : 'bottom'
        const ey = side === 'top' ? entity.y + entity.height : entity.y
        const by = side === 'top' ? shell.maxY : shell.minY
        const gap = Math.abs(by - ey)
        wallDragGuide.value = {
          x1: cx, y1: ey, x2: cx, y2: by,
          labels: [`Gap ${side === 'top' ? '↑' : '↓'}: ${fmtDimFt(gap)} ft`]
        }
      }
    }
    return
  }

  // --- Single line entity ---
  if (entity.type === 'line' && entity.start && entity.end) {
    const len = Math.hypot(entity.end.x - entity.start.x, entity.end.y - entity.start.y)
    const cx = (entity.start.x + entity.end.x) / 2
    const cy = (entity.start.y + entity.end.y) / 2
    dragDimOverlay.value = { cx, cy, label: `${fmtDimFt(len)} ft` }
    if (shell && isValidBounds(shell)) {
      const adx = Math.abs(dx), ady = Math.abs(dy)
      if (adx >= ady && adx > 0.02) {
        const ex = dx > 0 ? Math.max(entity.start.x, entity.end.x) : Math.min(entity.start.x, entity.end.x)
        const bx = dx > 0 ? shell.maxX : shell.minX
        wallDragGuide.value = {
          x1: ex, y1: cy, x2: bx, y2: cy,
          labels: [`Gap: ${fmtDimFt(Math.abs(bx - ex))} ft`]
        }
      } else if (ady > 0.02) {
        const ey = dy > 0 ? Math.max(entity.start.y, entity.end.y) : Math.min(entity.start.y, entity.end.y)
        const by = dy > 0 ? shell.maxY : shell.minY
        wallDragGuide.value = {
          x1: cx, y1: ey, x2: cx, y2: by,
          labels: [`Gap: ${fmtDimFt(Math.abs(by - ey))} ft`]
        }
      }
    }
    return
  }

  // --- Polyline / furniture ---
  if (entity.type === 'polyline' && entity.points?.length) {
    const bb = getEntityBoundingBox(entity)
    if (bb) {
      const cx = (bb.minX + bb.maxX) / 2
      const cy = (bb.minY + bb.maxY) / 2
      const w = bb.maxX - bb.minX
      const h = bb.maxY - bb.minY
      dragDimOverlay.value = { cx, cy, label: `${fmtDimFt(w)} × ${fmtDimFt(h)} ft` }
    }
    return
  }

  dragDimOverlay.value = null
}

/** Draw live W×H (or length) tooltip at center of dragged entity. */
const drawDragDimOverlay = (context) => {
  const d = dragDimOverlay.value
  if (!d || !editMode.value) return
  const pos = worldToScreen(d.cx, d.cy)
  context.save()
  const fs = Math.max(12, Math.min(16, 12 + 2 * Math.sqrt(zoom.value)))
  context.font = `700 ${fs}px system-ui, Segoe UI, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const pad = 6
  const tw = context.measureText(d.label).width
  const th = fs
  // Background pill
  context.fillStyle = 'rgba(15,23,42,0.82)'
  const rx = pos.x - tw / 2 - pad
  const ry = pos.y - th / 2 - pad - 22 // float above entity
  const rw = tw + pad * 2
  const rh = th + pad * 2
  const r = 5
  context.beginPath()
  context.moveTo(rx + r, ry)
  context.lineTo(rx + rw - r, ry)
  context.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r)
  context.lineTo(rx + rw, ry + rh - r)
  context.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh)
  context.lineTo(rx + r, ry + rh)
  context.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r)
  context.lineTo(rx, ry + r)
  context.quadraticCurveTo(rx, ry, rx + r, ry)
  context.closePath()
  context.fill()
  context.fillStyle = '#f0fdf4'
  context.fillText(d.label, pos.x, ry + rh / 2)
  context.restore()
}

const syncRoomDimensionLabels = () => {
  const ents = mapData.value?.entities
  if (!ents?.length) return
  const rects = ents.filter(
    (e) =>
      e.type === 'rect' &&
      Math.abs(e.rotation || 0) < 1e-3 &&
      e.layerId !== 'furniture' &&
      (e.width || 0) >= 0.4 &&
      (e.height || 0) >= 0.4
  )
  const wallLines = ents.filter((e) => e.type === 'line' && isWallCandidateLine(e))
  const texts = ents.filter((e) => e.type === 'text' && e.position && e.layerId === 'labels')
  for (const t of texts) {
    const s = stripMtextLeaderCodes(String(t.text || ''))
    if (!/\d/.test(s) || !/[x×X]/.test(s)) continue
    const px = t.position.x
    const py = t.position.y
    const prefix = extractRoomLabelPrefix(s)
    const formatDims = (w, h) => `${fmtDimFt(w)} × ${fmtDimFt(h)} ft`
    let w = null
    let h = null
    for (const r of rects) {
      if (!pointInAxisAlignedRect(px, py, r)) continue
      w = r.width
      h = r.height
      break
    }
    if (w == null) {
      const inf = inferRoomAxisBoundsFromInteriorPoint(px, py, wallLines)
      if (inf) {
        w = inf.width
        h = inf.height
      }
    }
    if (
      w != null &&
      h != null &&
      w > 0 &&
      h > 0 &&
      Number.isFinite(w) &&
      Number.isFinite(h)
    ) {
      t.text = prefix ? `${prefix} ${formatDims(w, h)}` : formatDims(w, h)
    }
  }
}

// ============================================================================
// VIEW CONTROLS
// ============================================================================

/**
 * Zoom in
 */
const zoomIn = () => {
  zoom.value = Math.min(10, zoom.value * 1.2)
  render()
}

/**
 * Zoom out
 */
const zoomOut = () => {
  zoom.value = Math.max(0.1, zoom.value / 1.2)
  render()
}

/**
 * Reset view to default
 */
const resetView = () => {
  zoom.value = 1
  centerMap()
  render()
}

/**
 * Toggle edit mode
 */
const toggleEditMode = () => {
  editMode.value = !editMode.value
  toolMode.value = 'select'
  insertMenuOpen.value = false
  altPickCycle.value = 0
  if (!editMode.value) {
    selectedEntities.value = []
    hoveredEntity.value = null
  }
  render()
}

/**
 * Toggle layer visibility
 */
const toggleLayer = (layerId) => {
  const layer = getLayerMap()[layerId]
  if (layer) {
    layer.visible = !layer.visible
    _layerMapCache = null // invalidate cache (visibility changed)
    render()
    emitMapChanged()
  }
}

const toggleLayerLock = (layerId) => {
  const layer = getLayerMap()[layerId]
  if (layer) {
    layer.locked = !layer.locked
    _layerMapCache = null // invalidate cache (lock changed)
    render()
  }
}

const fitMapToView = () => {
  const b = computeBoundsFromEntities(mapData.value?.entities)
  if (!b || !mapData.value) return
  const mw = Math.max(b.maxX - b.minX, 1e-3)
  const mh = Math.max(b.maxY - b.minY, 1e-3)
  panOffset.value = { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 }
  const pad = 0.92
  const zx = (canvasWidth.value * pad) / (mw * baseScale.value)
  const zy = (canvasHeight.value * pad) / (mh * baseScale.value)
  zoom.value = Math.max(0.1, Math.min(10, Math.min(zx, zy)))
  render()
}

const fitSelectionToView = () => {
  const ents = selectedEntities.value
  if (!ents.length) return
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let any = false
  for (const ent of ents) {
    const b = getEntityBoundingBox(ent)
    if (!b) continue
    any = true
    minX = Math.min(minX, b.minX)
    maxX = Math.max(maxX, b.maxX)
    minY = Math.min(minY, b.minY)
    maxY = Math.max(maxY, b.maxY)
  }
  if (!any) return
  const mw = Math.max(maxX - minX, 1e-3)
  const mh = Math.max(maxY - minY, 1e-3)
  panOffset.value = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
  const pad = 0.88
  const zx = (canvasWidth.value * pad) / (mw * baseScale.value)
  const zy = (canvasHeight.value * pad) / (mh * baseScale.value)
  zoom.value = Math.max(0.1, Math.min(10, Math.min(zx, zy)))
  render()
}

// ============================================================================
// SAVE FUNCTIONALITY
// ============================================================================

/**
 * Emit map changed event for real-time sync with 3D viewer
 * Debounced to avoid too many updates during drag operations
 */
let emitTimeout = null
const emitMapChanged = () => {
  if (!mapData.value) return
  
  // Debounce: wait 300ms before emitting to avoid flooding during drag
  if (emitTimeout) clearTimeout(emitTimeout)
  emitTimeout = setTimeout(() => {
    emit('mapChanged', JSON.parse(JSON.stringify(mapData.value)))
  }, 300)
}

/**
 * Save changes back to JSON
 */
const saveChanges = () => {
  if (!mapData.value) return
  
  // Update metadata
  mapData.value.metadata.updatedAt = new Date().toISOString()
  
  // Create a clean copy for saving
  const saveData = JSON.parse(JSON.stringify(mapData.value))
  
  // Emit save event with the data
  emit('save', saveData)
  
  // Update original data reference
  originalMapData.value = JSON.parse(JSON.stringify(mapData.value))
  hasUnsavedChanges.value = false
  
  // Log for debugging
  console.log('[JsonMapEditor] Changes saved:', saveData)
  
  // Also save to localStorage for persistence
  try {
    localStorage.setItem('map2home_edited_map', JSON.stringify(saveData))
    console.log('[JsonMapEditor] Map saved to localStorage')
  } catch (e) {
    console.warn('[JsonMapEditor] Failed to save to localStorage:', e)
  }
}

/**
 * Export map data as JSON file download
 */
const exportMapJson = () => {
  if (!mapData.value) return
  
  const dataStr = JSON.stringify(mapData.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${mapData.value.metadata?.name || 'map'}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

onMounted(async () => {
  console.log('[JsonMapEditor] Component mounted')
  editMode.value = props.initialEditMode
  
  // Wait for DOM to be fully ready
  await nextTick()
  
  // Load map data (has built-in retry for canvas initialization)
  loadMapData()
  
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', onEditorKeyDown)
  window.addEventListener('mousedown', onGlobalMouseDown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', onEditorKeyDown)
  window.removeEventListener('mousedown', onGlobalMouseDown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (_renderRAF) { cancelAnimationFrame(_renderRAF); _renderRAF = 0 }
  if (_hoverRAF) { cancelAnimationFrame(_hoverRAF); _hoverRAF = 0 }
})

/**
 * Handle window resize
 */
const handleResize = () => {
  if (!canvas.value || !mapData.value) return
  initializeCanvas()
  calculateBaseScale()
  render()
}

const toggleFullscreen = () => {
  const el = editorRoot.value
  if (!el) return
  if (!document.fullscreenElement) {
    el.requestFullscreen().catch((err) => console.warn('[Editor] Fullscreen failed:', err))
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  nextTick(() => {
    setTimeout(() => handleResize(), 50)
    setTimeout(() => handleResize(), 150)
    setTimeout(() => handleResize(), 350)
  })
}

const onGlobalMouseDown = () => {
  if (contextMenu.value.open) closeContextMenu()
}

// Watch for mapUrl changes
// Watch for mapUrl or mapData changes
watch(() => props.mapUrl, () => {
  if (props.mapUrl) loadMapData()
})

// Shallow only: internal edits mutate cloned mapData, not props.mapData — deep watch
// would re-enter loadMapData() while loading and leave the spinner stuck.
watch(
  () => props.mapData,
  (next) => {
    if (next) loadMapData()
  }
)

// ============================================================================
// EXPOSE FOR PARENT COMPONENT
// ============================================================================

defineExpose({
  saveChanges,
  exportMapJson,
  selectEntity,
  resetView,
  fitMapToView,
  undoMap,
  redoMap,
  mapData
})
</script>

<style scoped>
.json-map-editor {
  width: 100%;
}

canvas {
  display: block;
}

/* Prevent text selection while dragging */
.json-map-editor * {
  user-select: none;
}

.fullscreen-canvas-container {
  flex: 1 1 auto;
  height: 0;
  min-height: 0;
}
</style>

<style>
.json-map-editor:fullscreen {
  background: white;
  width: 100vw;
  height: 100vh;
  overflow: auto;
}

.json-map-editor:fullscreen > div {
  height: 100vh;
  border-radius: 0;
  border: none;
  padding: 8px 16px;
  box-sizing: border-box;
}
</style>

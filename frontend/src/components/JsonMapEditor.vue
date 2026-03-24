<template>
  <div class="json-map-editor h-full">
    <div
      :class="[
        'bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl border-2 border-indigo-100 h-full flex flex-col',
        compactMode ? 'p-2' : 'p-8',
      ]"
    >
      <!-- Header -->
      <div
        :class="[
          'flex items-center justify-between',
          compactMode ? 'mb-2' : 'mb-6',
        ]"
      >
        <div>
          <h2
            :class="[
              'font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent',
              compactMode ? 'text-lg' : 'text-3xl',
            ]"
          >
            {{ mapData?.metadata?.name || "JSON Map Editor" }}
          </h2>
          <p v-if="!compactMode" class="text-gray-600 text-sm mt-2 font-medium">
            Click pencil on any room to edit. Drag items freely.
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
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
            ]"
            :title="editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="editMode" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path v-if="!editMode" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ editMode ? "Editing" : "View Only" }}
          </button>

          <!-- Save Button -->
          <button
            v-if="hasUnsavedChanges"
            @click="saveChanges"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2 font-semibold"
          >
            Save Changes
          </button>

          <!-- Back -->
          <button
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
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
        <h3 class="text-red-800 font-semibold mb-2">Failed to load map</h3>
        <p class="text-sm text-red-700 mb-4">{{ error }}</p>
        <button @click="loadMapData" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Retry</button>
      </div>

      <!-- Map Editor -->
      <div v-else class="space-y-4 flex-1 flex flex-col">
        <!-- Controls Bar -->
        <div class="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 shadow-md border border-indigo-200">
          <div class="flex items-center gap-3">
            <button @click="zoomIn" class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md" title="Zoom In">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
            <button @click="zoomOut" class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md" title="Zoom Out">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
            </button>
            <button @click="resetView" class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md" title="Reset View">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
            <span class="text-sm font-semibold text-indigo-700 bg-white px-3 py-1 rounded-lg shadow-sm">{{ Math.round(zoom * 100) }}%</span>
          </div>

          <!-- Layer Controls -->
          <div class="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
            <span class="text-xs font-semibold text-gray-600 mr-1">Layers:</span>
            <template v-for="layer in mapData?.layers" :key="layer.id">
              <button @click="toggleLayer(layer.id)"
                :class="['flex items-center gap-1 px-2 py-1 rounded text-xs transition-all', layer.visible ? 'bg-gray-100' : 'bg-gray-50 opacity-50']"
                :title="layer.visible ? 'Hide ' + layer.name : 'Show ' + layer.name">
                <div class="w-3 h-3 rounded" :style="{ backgroundColor: layer.color }"></div>
                <span class="text-gray-600">{{ layer.name }}</span>
              </button>
            </template>
          </div>

          <!-- Active Room Info -->
          <div v-if="activeRoom" class="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border-2 border-blue-300">
            <span class="text-xs font-semibold text-blue-600">Editing:</span>
            <span class="text-xs text-blue-800 font-bold">{{ activeRoom.name }}</span>
          </div>
        </div>

        <!-- Canvas Container -->
        <div
          ref="canvasContainer"
          :class="[
            'bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 rounded-xl overflow-hidden shadow-2xl relative flex-1',
            compactMode ? 'border-2 border-indigo-200' : 'border-4 border-indigo-300',
          ]"
          :style="compactMode ? 'min-height: 350px; width: 100%;' : 'height: 700px; width: 100%;'"
        >
          <canvas
            ref="canvas"
            :width="compactMode ? 800 : 1200"
            :height="compactMode ? 450 : 700"
            style="display: block; width: 100%; height: 100%"
            :style="{ cursor: currentCursor }"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"
            @wheel="handleWheel"
            @contextmenu.prevent
          ></canvas>

          <!-- Instructions Overlay -->
          <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg text-xs text-gray-600">
            <p v-if="editMode">
              <span class="font-semibold text-green-600">Edit Mode:</span>
              Click a line/curve to show controls (resize, delete, rotate line H/V) | Drag furniture/doors freely
            </p>
            <p v-else>
              <span class="font-semibold text-gray-700">View Mode:</span>
              Scroll to zoom, drag to pan
            </p>
            <p v-if="editMode" class="mt-1 text-[11px] text-gray-500">
              Rooms detected: {{ mapData?.metadata?.rooms?.length || 0 }}
            </p>
          </div>

          <!-- Coordinates Display -->
          <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs font-mono">
            <p class="text-gray-600">
              World: ({{ mouseWorldCoords.x.toFixed(1) }}, {{ mouseWorldCoords.y.toFixed(1) }}) ft
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * JsonMapEditor.vue - Interactive Floor Plan Editor
 *
 * Interaction Model:
 * - Each room has a PENCIL icon (visible in edit mode)
 * - Clicking pencil activates room editing with:
 *   - CENTER: 4-arrow move handle to drag the room
 *   - EDGES: resize arrows on each wall
 *   - TOP-RIGHT: minus icon to delete the room
 * - Inner elements (furniture, doors) can be freely dragged like kanban
 * - Dragging room A onto room B SWAPS their positions
 * - Outer walls (building boundary) cannot be modified
 */

import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

// ============================================================================
// PROPS & EMITS
// ============================================================================
const props = defineProps({
  mapUrl: { type: String, default: "" },
  mapData: { type: Object, default: null },
  mapTitle: { type: String, default: "" },
  initialEditMode: { type: Boolean, default: false },
  compactMode: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "save", "entitySelected", "mapLoaded", "mapChanged"]);

// ============================================================================
// REACTIVE STATE
// ============================================================================
const canvasContainer = ref(null);
const canvas = ref(null);
const ctx = ref(null);
const canvasWidth = ref(1200);
const canvasHeight = ref(700);

const mapData = ref(null);
const originalMapData = ref(null);
const loading = ref(true);
const error = ref(null);

const zoom = ref(1);
const panOffset = ref({ x: 0, y: 0 });
const baseScale = ref(1);

const editMode = ref(false);
const activeRoom = ref(null); // The room currently being edited (clicked pencil)
const activeRoomIndex = ref(-1); // Index of the room currently being edited
const hoveredIcon = ref(null); // Which icon is hovered: { type, roomId, roomIndex } or { type: 'entity', entity }
const selectedEntity = ref(null);

const isDragging = ref(false);
const isPanning = ref(false);
const dragMode = ref(null); // 'room-move', 'room-resize', 'entity-drag', 'wall-resize', 'arc-resize'
const resizeDirection = ref(null); // 'n','s','e','w'
const dragStart = ref({ x: 0, y: 0 });
const dragStartPositions = ref([]); // Entity positions at drag start
const dragStartBbox = ref(null); // Room bbox at resize start
const wallResizeState = ref(null); // { entity, endpoint, lockAxis }
const selectedLineEntity = ref(null); // Currently selected wall line
const hoveredLineControl = ref(null); // { type: 'start'|'end'|'delete', entity }
const selectedArcEntity = ref(null); // Currently selected arc entity
const hoveredArcControl = ref(null); // { type: 'center'|'radius'|'delete', entity }
const arcResizeState = ref(null); // { entity }

const mouseScreenCoords = ref({ x: 0, y: 0 });
const mouseWorldCoords = ref({ x: 0, y: 0 });

const hasUnsavedChanges = ref(false);
const wallThickness = ref(0.5);
const currentCursor = ref('default');

// ============================================================================
// COORDINATE TRANSFORMS
// ============================================================================
const worldToScreen = (worldX, worldY) => {
  const scale = baseScale.value * zoom.value;
  return {
    x: (worldX - panOffset.value.x) * scale + canvasWidth.value / 2,
    y: canvasHeight.value / 2 - (worldY - panOffset.value.y) * scale,
  };
};

const screenToWorld = (screenX, screenY) => {
  const scale = baseScale.value * zoom.value;
  return {
    x: (screenX - canvasWidth.value / 2) / scale + panOffset.value.x,
    y: (canvasHeight.value / 2 - screenY) / scale + panOffset.value.y,
  };
};

const worldDistanceToScreen = (d) => d * baseScale.value * zoom.value;

const deepCloneMapData = (input) => {
  if (!input) return input;
  try {
    if (typeof structuredClone === "function") return structuredClone(input);
  } catch (e) {
    // fall through
  }
  return JSON.parse(JSON.stringify(input));
};

// ============================================================================
// MAP DATA LOADING
// ============================================================================
const loadMapData = async () => {
  loading.value = true;
  error.value = null;
  try {
    let sourceData;
    if (props.mapData) {
      sourceData = props.mapData;
    } else if (props.mapUrl) {
      const response = await fetch(props.mapUrl);
      if (!response.ok) throw new Error(`Failed to fetch map: ${response.statusText}`);
      sourceData = await response.json();
    } else {
      throw new Error("No map data or URL provided");
    }

    const data = deepCloneMapData(sourceData);
    mapData.value = data;
    normalizeEntityLayersFromProperties();
    ensureRoomDefinitions();
    normalizeRoomBboxesFromGeometry();
    originalMapData.value = deepCloneMapData(data);
    activeRoom.value = null;
    activeRoomIndex.value = -1;
    selectedLineEntity.value = null;
    hoveredLineControl.value = null;
    selectedArcEntity.value = null;
    hoveredArcControl.value = null;
    arcResizeState.value = null;
    emit("mapLoaded", data);
    loading.value = false;

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (canvas.value) {
      initializeCanvas();
      calculateBaseScale();
      computeWallThickness();
      centerMap();
      render();
    }
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
};

// ============================================================================
// CANVAS INITIALIZATION
// ============================================================================
const initializeCanvas = () => {
  if (!canvas.value) return;
  const container = canvasContainer.value || canvas.value.parentElement;
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const containerWidth = rect.width > 0 ? rect.width : 1200;
  const containerHeight = rect.height > 0 ? rect.height : 700;
  const dpr = window.devicePixelRatio || 1;
  canvasWidth.value = containerWidth;
  canvasHeight.value = containerHeight;
  canvas.value.width = canvasWidth.value * dpr;
  canvas.value.height = canvasHeight.value * dpr;
  canvas.value.style.width = canvasWidth.value + "px";
  canvas.value.style.height = canvasHeight.value + "px";
  ctx.value = canvas.value.getContext("2d");
  if (ctx.value) ctx.value.scale(dpr, dpr);
};

const calculateBaseScale = () => {
  if (!mapData.value?.metadata?.bounds) { baseScale.value = 1; return; }
  const bounds = mapData.value.metadata.bounds;
  const mapWidth = bounds.maxX - bounds.minX;
  const mapHeight = bounds.maxY - bounds.minY;
  if (mapWidth <= 0 || mapHeight <= 0) { baseScale.value = 1; return; }
  const padding = 0.2;
  const scaleX = canvasWidth.value * (1 - padding) / mapWidth;
  const scaleY = canvasHeight.value * (1 - padding) / mapHeight;
  baseScale.value = Math.min(scaleX, scaleY);
  if (baseScale.value <= 0 || !isFinite(baseScale.value)) baseScale.value = 0.01;
};

const computeWallThickness = () => {
  if (!mapData.value?.metadata?.bounds) { wallThickness.value = 0.5; return; }
  const b = mapData.value.metadata.bounds;
  const shortDim = Math.min(b.maxX - b.minX, b.maxY - b.minY);
  wallThickness.value = Math.max(0.2, Math.min(shortDim * 0.003, 30));
};

const centerMap = () => {
  if (!mapData.value?.metadata?.bounds) return;
  const b = mapData.value.metadata.bounds;
  panOffset.value = { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
};

// ============================================================================
// ROOM HELPERS
// ============================================================================
const getRoomDefs = () => mapData.value?.metadata?.rooms || [];
const getRoomByIndex = (roomIndex) => {
  const rooms = getRoomDefs();
  if (roomIndex < 0 || roomIndex >= rooms.length) return null;
  return rooms[roomIndex];
};

const bboxArea = (bbox) => {
  if (!bbox) return 0;
  return Math.max(0, (bbox.maxX - bbox.minX) * (bbox.maxY - bbox.minY));
};

const getMapArea = () => {
  const b = mapData.value?.metadata?.bounds;
  if (!b) return 0;
  return Math.max(0, (b.maxX - b.minX) * (b.maxY - b.minY));
};

const inferLayerIdFromRaw = (rawLayerName, entityType = "") => {
  const raw = String(rawLayerName || "").toLowerCase();
  const type = String(entityType || "").toUpperCase();
  if (type === "TEXT") return "labels";
  if (type === "HATCH") return "hatch";
  if (!raw) return "other";
  if (
    /\bwall\b|wall|structure|outline|strc|strct|muro|arwall|proy|partition|enclosure|boundary/i.test(
      raw,
    ) ||
    /^a-wall|^ar-wall|^a-strc|^ar-strc/i.test(raw)
  ) return "walls";
  if (/\bdoor\b|door|entry|puerta|cerr|porta|porte/i.test(raw) || /^a-door|^ar-door/i.test(raw)) return "doors";
  if (
    /\bwindow\b|window|glass|ventana|glaz|fenetre|janela/i.test(raw) ||
    /^a-wind|^a-glaz|^ar-glass|^wd\b/i.test(raw)
  ) return "windows";
  if (/\btext\b|text|label|dim|annotation|titl|note/i.test(raw) || /^a-anno|^a-dims|^a-titles/i.test(raw)) return "labels";
  if (
    /\bfurniture\b|furniture|furn|fixture|equip|meuble|mobiliario|chair|desk|table|seat|workstation|reception|counter/i.test(
      raw,
    ) ||
    /toilet|sink|lavatory|sanitary|bathroom|wc\b/i.test(raw) ||
    /^a-furn|^a-equip|^ar-furn|^fn\b/i.test(raw)
  ) return "furniture";
  if (/\bhatch\b|hatch|fill|patron|fill/i.test(raw)) return "hatch";
  return "other";
};

const normalizeEntityLayersFromProperties = () => {
  if (!mapData.value?.entities?.length) return;
  for (const e of mapData.value.entities) {
    if (e.type === "text") {
      e.layerId = "labels";
      continue;
    }
    const raw = `${e.properties?.layer || ""} ${e.properties?.fromBlock || ""}`.trim();
    const inferred = inferLayerIdFromRaw(raw, e.type);
    if (!inferred || inferred === "other") continue;
    // Keep existing explicit mapping unless this is likely a block-misclassification.
    if (
      e.layerId === "other" ||
      e.layerId === "walls" ||
      e.properties?.fromBlock
    ) {
      e.layerId = inferred;
    }
  }
};

const computeBboxFromEntities = (entities) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const e of entities || []) {
    const bbox = getEntityBoundingBox(e);
    if (!bbox) continue;
    minX = Math.min(minX, bbox.minX);
    minY = Math.min(minY, bbox.minY);
    maxX = Math.max(maxX, bbox.maxX);
    maxY = Math.max(maxY, bbox.maxY);
  }
  if (!isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
};

const getRoomDefById = (roomId) => getRoomDefs().find((r) => r.roomId === roomId) || null;

const getRoomEntitiesById = (roomId) => {
  if (!roomId || !mapData.value?.entities) return [];
  return mapData.value.entities.filter((e) => e.roomId === roomId);
};

const isPointInsideBbox = (x, y, bbox, padding = 0.1) => {
  if (!bbox) return false;
  return (
    x >= bbox.minX - padding &&
    x <= bbox.maxX + padding &&
    y >= bbox.minY - padding &&
    y <= bbox.maxY + padding
  );
};

const getEntityAnchor = (entity) => {
  const bbox = getEntityBoundingBox(entity);
  if (!bbox) return null;
  return {
    x: (bbox.minX + bbox.maxX) / 2,
    y: (bbox.minY + bbox.maxY) / 2,
  };
};

/**
 * Return entities for a room.
 * By default this keeps old behavior (roomId-only).
 * For room operations, pass limitToBbox=true so only entities physically inside
 * that room bbox are manipulated.
 */
const getRoomEntities = (
  roomId,
  { limitToBbox = false, roomBbox = null, includeOuterWalls = true } = {}
) => {
  let entities = getRoomEntitiesById(roomId);
  if (!includeOuterWalls) entities = entities.filter((e) => !e.isOuterWall);
  if (!limitToBbox) return entities;

  const bbox = roomBbox || getRoomDefById(roomId)?.bbox || computeBboxFromEntities(entities);
  if (!bbox) return entities;

  return entities.filter((e) => {
    const anchor = getEntityAnchor(e);
    return anchor ? isPointInsideBbox(anchor.x, anchor.y, bbox) : false;
  });
};

const roundCoord = (v) => Math.round(v * 1000) / 1000;

const getLineGeometryKey = (line) => {
  if (!line || line.type !== "line") return null;
  const a = { x: roundCoord(line.start.x), y: roundCoord(line.start.y) };
  const b = { x: roundCoord(line.end.x), y: roundCoord(line.end.y) };
  const first = (a.x < b.x || (a.x === b.x && a.y <= b.y)) ? a : b;
  const second = first === a ? b : a;
  return `${first.x},${first.y}|${second.x},${second.y}`;
};

const dedupeCoincidentLines = (entities, roomId) => {
  const out = [];
  const lineBuckets = new Map();
  for (const e of entities || []) {
    if (e.type !== "line") {
      out.push(e);
      continue;
    }
    const key = getLineGeometryKey(e);
    if (!key) {
      out.push(e);
      continue;
    }
    if (!lineBuckets.has(key)) lineBuckets.set(key, []);
    lineBuckets.get(key).push(e);
  }

  for (const bucket of lineBuckets.values()) {
    if (bucket.length === 1) {
      out.push(bucket[0]);
      continue;
    }
    const exactMatch = bucket.find((e) => e.roomId === roomId);
    out.push(exactMatch || bucket[0]);
  }
  return out;
};

const entityBelongsToRoomIndex = (
  entity,
  roomIndex,
  roomBbox = null,
  { requireRoomIdMatch = true, padding = 0.1 } = {}
) => {
  const room = getRoomByIndex(roomIndex);
  if (!room || !entity) return false;
  if (entity.isOuterWall) return false;

  if (requireRoomIdMatch && room.roomId && entity.roomId && entity.roomId !== room.roomId) {
    return false;
  }

  const bbox = roomBbox || getEffectiveRoomBbox(room);
  const anchor = getEntityAnchor(entity);
  if (!bbox || !anchor) return false;
  return isPointInsideBbox(anchor.x, anchor.y, bbox, padding);
};

const getRoomEditEntities = (
  roomIndex,
  { roomBbox = null, includeOuterWalls = false } = {}
) => {
  const room = getRoomByIndex(roomIndex);
  if (!room || !mapData.value?.entities) return [];

  const bbox = roomBbox || getEffectiveRoomBbox(room);
  if (!bbox) return [];

  const selected = mapData.value.entities.filter((e) => {
    if (!includeOuterWalls && e.isOuterWall) return false;
    return entityBelongsToRoomIndex(e, roomIndex, bbox, { requireRoomIdMatch: true, padding: 0.1 });
  });

  return dedupeCoincidentLines(selected, room.roomId);
};

const computeRoomBbox = (roomId) => {
  return computeBboxFromEntities(getRoomEntitiesById(roomId));
};

const computeRoomBboxByIndex = (roomIndex) => {
  const room = getRoomByIndex(roomIndex);
  if (!room) return null;
  const bbox = getEffectiveRoomBbox(room);
  const ents = getRoomEditEntities(roomIndex, { roomBbox: bbox, includeOuterWalls: false });
  return computeBboxFromEntities(ents) || bbox || null;
};

const bboxUnion = (a, b) => ({
  minX: Math.min(a.minX, b.minX),
  minY: Math.min(a.minY, b.minY),
  maxX: Math.max(a.maxX, b.maxX),
  maxY: Math.max(a.maxY, b.maxY),
});

const bboxCenter = (b) => ({
  x: (b.minX + b.maxX) / 2,
  y: (b.minY + b.maxY) / 2,
});

const bboxIntersectionArea = (a, b) => {
  const minX = Math.max(a.minX, b.minX);
  const minY = Math.max(a.minY, b.minY);
  const maxX = Math.min(a.maxX, b.maxX);
  const maxY = Math.min(a.maxY, b.maxY);
  if (maxX <= minX || maxY <= minY) return 0;
  return (maxX - minX) * (maxY - minY);
};

const bboxIntersection = (a, b) => {
  const minX = Math.max(a.minX, b.minX);
  const minY = Math.max(a.minY, b.minY);
  const maxX = Math.min(a.maxX, b.maxX);
  const maxY = Math.min(a.maxY, b.maxY);
  if (maxX <= minX || maxY <= minY) return null;
  return { minX, minY, maxX, maxY };
};

const bboxIoU = (a, b) => {
  const inter = bboxIntersectionArea(a, b);
  if (inter <= 0) return 0;
  const union = bboxArea(a) + bboxArea(b) - inter;
  return union > 0 ? inter / union : 0;
};

const nameKey = (name) => String(name || "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const normalizeRoomName = (name) => {
  const trimmed = String(name || "").trim();
  return trimmed || "Room";
};

const isLikelyRoomLabel = (text) => {
  const trimmed = String(text || "").trim();
  if (!trimmed) return false;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return false;
  if (/^[\W_]+$/.test(trimmed)) return false;
  return true;
};

const clampBboxToBounds = (bbox, bounds) => {
  if (!bbox || !bounds) return bbox || null;
  const clamped = {
    minX: Math.max(bounds.minX, bbox.minX),
    minY: Math.max(bounds.minY, bbox.minY),
    maxX: Math.min(bounds.maxX, bbox.maxX),
    maxY: Math.min(bounds.maxY, bbox.maxY),
  };
  if (clamped.maxX <= clamped.minX || clamped.maxY <= clamped.minY) return null;
  return clamped;
};

const shouldMergeRoomCandidates = (a, b) => {
  if (!a?.bbox || !b?.bbox) return false;
  const inter = bboxIntersectionArea(a.bbox, b.bbox);
  if (inter <= 0) return false;
  const minArea = Math.max(1e-6, Math.min(bboxArea(a.bbox), bboxArea(b.bbox)));
  const overlapRatio = inter / minArea;
  const iou = bboxIoU(a.bbox, b.bbox);
  const sameName = nameKey(a.name) === nameKey(b.name);
  if (sameName && (overlapRatio >= 0.55 || iou >= 0.4)) return true;
  return iou >= 0.9;
};

const mergeRoomCandidate = (target, source) => {
  const inter = bboxIntersection(target.bbox, source.bbox);
  const interArea = inter ? bboxArea(inter) : 0;
  const minArea = Math.max(1e-6, Math.min(bboxArea(target.bbox), bboxArea(source.bbox)));
  let mergedBbox = null;

  if (inter && interArea / minArea >= 0.6) {
    mergedBbox = inter;
  } else {
    mergedBbox = bboxUnion(target.bbox, source.bbox);
  }

  const targetCount = target.labelCount || 1;
  const sourceCount = source.labelCount || 1;
  const total = targetCount + sourceCount;
  target.cx = (target.cx * targetCount + source.cx * sourceCount) / total;
  target.cy = (target.cy * targetCount + source.cy * sourceCount) / total;
  target.labelCount = total;
  target.bbox = mergedBbox;
  if (nameKey(target.name) === "room" && nameKey(source.name) !== "room") {
    target.name = source.name;
  }
  if (!target.labels) target.labels = [];
  target.labels.push(...(source.labels || []));
};

const buildRoomCandidatesFromLabels = () => {
  if (!mapData.value?.entities) return [];
  const bounds = mapData.value.metadata?.bounds;
  if (!bounds) return [];

  const walls = mapData.value.entities.filter((e) => e.layerId === "walls" && e.type === "line");
  const labels = mapData.value.entities.filter(
    (e) => e.type === "text" && e.position && isLikelyRoomLabel(e.text),
  );
  if (!labels.length) return [];

  const mapW = Math.max(10, bounds.maxX - bounds.minX);
  const mapH = Math.max(10, bounds.maxY - bounds.minY);
  const fallbackHalfW = Math.max(2.5, Math.min(mapW * 0.07, 10));
  const fallbackHalfH = Math.max(2.5, Math.min(mapH * 0.07, 10));
  const totalArea = Math.max(1, mapW * mapH);

  const candidates = [];
  for (const label of labels) {
    const px = label.position.x;
    const py = label.position.y;
    const name = normalizeRoomName(label.text);

    let bbox = null;
    if (walls.length) {
      const right = castRoomRayToWalls(px, py, 1, 0, walls);
      const left = castRoomRayToWalls(px, py, -1, 0, walls);
      const top = castRoomRayToWalls(px, py, 0, 1, walls);
      const bottom = castRoomRayToWalls(px, py, 0, -1, walls);
      if ([right, left, top, bottom].every((v) => v != null)) {
        const rayBbox = clampBboxToBounds({ minX: left, minY: bottom, maxX: right, maxY: top }, bounds);
        if (rayBbox) {
          const w = rayBbox.maxX - rayBbox.minX;
          const h = rayBbox.maxY - rayBbox.minY;
          const a = w * h;
          if (w >= 1 && h >= 1 && a >= 1 && a <= totalArea * 0.4) {
            bbox = rayBbox;
          }
        }
      }
    }

    if (!bbox) {
      bbox = clampBboxToBounds({
        minX: px - fallbackHalfW,
        minY: py - fallbackHalfH,
        maxX: px + fallbackHalfW,
        maxY: py + fallbackHalfH,
      }, bounds);
    }

    if (!bbox || bboxArea(bbox) <= 0) continue;
    candidates.push({
      name,
      bbox,
      cx: px,
      cy: py,
      labelCount: 1,
      labels: [label],
    });
  }

  if (!candidates.length) return [];
  candidates.sort((a, b) => bboxArea(a.bbox) - bboxArea(b.bbox));

  const merged = [];
  for (const candidate of candidates) {
    let mergedInto = false;
    for (const existing of merged) {
      if (shouldMergeRoomCandidates(existing, candidate)) {
        mergeRoomCandidate(existing, candidate);
        mergedInto = true;
        break;
      }
    }
    if (!mergedInto) merged.push({ ...candidate });
  }
  return merged;
};

const synthesizeRoomDefinitionsFromEntityGroups = () => {
  if (!mapData.value?.entities) return false;
  if (!mapData.value.metadata) mapData.value.metadata = {};

  const groups = new Map();
  for (const e of mapData.value.entities) {
    if (!e.roomId || e.isOuterWall) continue;
    if (!groups.has(e.roomId)) groups.set(e.roomId, []);
    groups.get(e.roomId).push(e);
  }
  if (!groups.size) return false;

  const roomDefs = [];
  for (const [roomId, ents] of groups.entries()) {
    const bbox = computeBboxFromEntities(ents);
    if (!bbox || bboxArea(bbox) <= 0) continue;
    const label = mapData.value.entities.find(
      (e) => e.type === "text" && e.roomId === roomId && e.text
    );
    roomDefs.push({
      roomId,
      name: (label?.text || roomId || "Room").trim(),
      bbox,
    });
  }
  if (!roomDefs.length) return false;
  mapData.value.metadata.rooms = roomDefs;
  return true;
};

const synthesizeRoomDefinitionsFromLabels = () => {
  if (!mapData.value?.entities) return false;
  if (!mapData.value.metadata) mapData.value.metadata = {};
  const bounds = mapData.value.metadata.bounds;
  if (!bounds) return false;

  const roomCandidates = buildRoomCandidatesFromLabels();
  if (!roomCandidates.length) return false;

  const roomDefs = roomCandidates.map((candidate, idx) => ({
    roomId: `room-auto-${idx}`,
    name: normalizeRoomName(candidate.name),
    bbox: { ...candidate.bbox },
    cx: candidate.cx,
    cy: candidate.cy,
    labels: candidate.labels || [],
  }));
  if (!roomDefs.length) return false;

  // Clear existing assignments so each load gets a consistent room map.
  for (const e of mapData.value.entities) {
    delete e.roomId;
  }

  const tol = Math.min(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.005;

  // Assign labels first.
  for (const room of roomDefs) {
    for (const label of room.labels || []) {
      label.roomId = room.roomId;
    }
  }

  // Assign all entities to the smallest containing room bbox.
  for (const e of mapData.value.entities) {
    const anchor = getEntityAnchor(e);
    if (!anchor) continue;
    let best = null;
    let bestArea = Infinity;
    for (const room of roomDefs) {
      const b = room.bbox;
      const inside =
        anchor.x >= b.minX - tol &&
        anchor.x <= b.maxX + tol &&
        anchor.y >= b.minY - tol &&
        anchor.y <= b.maxY + tol;
      if (!inside) continue;
      const area = bboxArea(b);
      if (area < bestArea) {
        bestArea = area;
        best = room;
      }
    }
    if (best) e.roomId = best.roomId;
  }

  // Tighten each room bbox from its assigned entities to prevent spillover
  // (e.g. kitchen capturing neighboring call center).
  const mapArea = Math.max(1, getMapArea());
  for (const room of roomDefs) {
    const assigned = mapData.value.entities.filter(
      (e) => e.roomId === room.roomId && !e.isOuterWall,
    );
    const assignedBbox = computeBboxFromEntities(assigned);
    if (!assignedBbox || bboxArea(assignedBbox) <= 0) continue;
    const clamped = clampBboxToBounds(assignedBbox, bounds);
    if (!clamped) continue;
    const area = bboxArea(clamped);
    if (area > 0 && area <= mapArea * 0.45) {
      room.bbox = clamped;
    }
  }

  // Remove noisy/duplicate rooms with no meaningful entities.
  const canonicalRooms = [];
  for (const room of roomDefs) {
    const nonLabelCount = mapData.value.entities.filter(
      (e) => e.roomId === room.roomId && e.type !== "text",
    ).length;
    const isTiny = bboxArea(room.bbox) < mapArea * 0.002;
    if (nonLabelCount === 0 && isTiny) continue;

    const duplicate = canonicalRooms.find((existing) => shouldMergeRoomCandidates(existing, room));
    if (duplicate) {
      mergeRoomCandidate(duplicate, room);
      const reassignedTo = duplicate.roomId;
      for (const e of mapData.value.entities) {
        if (e.roomId === room.roomId) e.roomId = reassignedTo;
      }
    } else {
      canonicalRooms.push({
        roomId: room.roomId,
        name: room.name,
        bbox: room.bbox ? { ...room.bbox } : null,
        cx: room.cx ?? bboxCenter(room.bbox || { minX: 0, minY: 0, maxX: 0, maxY: 0 }).x,
        cy: room.cy ?? bboxCenter(room.bbox || { minX: 0, minY: 0, maxX: 0, maxY: 0 }).y,
        labelCount: 1,
        labels: [],
      });
    }
  }

  if (!canonicalRooms.length) return false;

  canonicalRooms.sort((a, b) => {
    const ay = (a.bbox?.maxY ?? 0);
    const by = (b.bbox?.maxY ?? 0);
    if (Math.abs(by - ay) > 0.1) return by - ay;
    return (a.bbox?.minX ?? 0) - (b.bbox?.minX ?? 0);
  });

  mapData.value.metadata.rooms = canonicalRooms.map((room, idx) => ({
    roomId: room.roomId || `room-auto-${idx}`,
    name: normalizeRoomName(room.name),
    bbox: room.bbox ? { ...room.bbox } : null,
  }));
  return mapData.value.metadata.rooms.length > 0;
};

const ensureRoomDefinitions = () => {
  if (!mapData.value) return;
  // Always canonicalize from labels first so stale/duplicate persisted room
  // metadata does not produce missing or duplicated pencils.
  const rebuiltFromLabels = synthesizeRoomDefinitionsFromLabels();
  if (!rebuiltFromLabels) {
    synthesizeRoomDefinitionsFromEntityGroups();
  }

  for (const room of getRoomDefs()) {
    if (!room.bbox || bboxArea(room.bbox) <= 0) {
      const b = computeRoomBbox(room.roomId);
      if (b) room.bbox = b;
    }
  }
};

const castRoomRayToWalls = (px, py, dirX, dirY, walls) => {
  let bestPreferredDist = Infinity;
  let bestPreferredHit = null;
  let bestAnyDist = Infinity;
  let bestAnyHit = null;
  const eps = 1e-6;
  const minDist = 0.2;

  for (const w of walls || []) {
    if (!w?.start || !w?.end) continue;
    const dx = w.end.x - w.start.x;
    const dy = w.end.y - w.start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (dirX !== 0 && dirY === 0) {
      // Horizontal ray: prefer vertical-ish walls.
      const wMinY = Math.min(w.start.y, w.end.y);
      const wMaxY = Math.max(w.start.y, w.end.y);
      if (py < wMinY || py > wMaxY) continue;
      const t = absDy > eps ? (py - w.start.y) / dy : 0.5;
      if (t < -0.01 || t > 1.01) continue;
      const hitX = w.start.x + t * (w.end.x - w.start.x);
      const dist = (hitX - px) * dirX;
      if (dist <= minDist) continue;

      const isPreferred = absDy >= absDx * 0.75;
      if (isPreferred && dist < bestPreferredDist) {
        bestPreferredDist = dist;
        bestPreferredHit = hitX;
      }
      if (dist < bestAnyDist) {
        bestAnyDist = dist;
        bestAnyHit = hitX;
      }
    } else if (dirY !== 0 && dirX === 0) {
      // Vertical ray: prefer horizontal-ish walls.
      const wMinX = Math.min(w.start.x, w.end.x);
      const wMaxX = Math.max(w.start.x, w.end.x);
      if (px < wMinX || px > wMaxX) continue;
      const t = absDx > eps ? (px - w.start.x) / dx : 0.5;
      if (t < -0.01 || t > 1.01) continue;
      const hitY = w.start.y + t * (w.end.y - w.start.y);
      const dist = (hitY - py) * dirY;
      if (dist <= minDist) continue;

      const isPreferred = absDx >= absDy * 0.75;
      if (isPreferred && dist < bestPreferredDist) {
        bestPreferredDist = dist;
        bestPreferredHit = hitY;
      }
      if (dist < bestAnyDist) {
        bestAnyDist = dist;
        bestAnyHit = hitY;
      }
    }
  }
  return bestPreferredHit ?? bestAnyHit;
};

const computeRoomBboxFromLabelGeometry = (roomDef) => {
  if (!roomDef || !mapData.value?.entities?.length) return null;
  const labels = mapData.value.entities.filter(
    (e) => e.type === "text" && e.roomId === roomDef.roomId && e.position
  );
  if (!labels.length) return null;

  const walls = mapData.value.entities.filter((e) => e.layerId === "walls" && e.type === "line");
  if (!walls.length) return null;

  let label = labels[0];
  if (roomDef.bbox) {
    const cx = (roomDef.bbox.minX + roomDef.bbox.maxX) / 2;
    const cy = (roomDef.bbox.minY + roomDef.bbox.maxY) / 2;
    label = labels.reduce((best, cur) => {
      const bestD = (best.position.x - cx) ** 2 + (best.position.y - cy) ** 2;
      const curD = (cur.position.x - cx) ** 2 + (cur.position.y - cy) ** 2;
      return curD < bestD ? cur : best;
    }, labels[0]);
  }

  const px = label.position.x;
  const py = label.position.y;
  const right = castRoomRayToWalls(px, py, 1, 0, walls);
  const left = castRoomRayToWalls(px, py, -1, 0, walls);
  const top = castRoomRayToWalls(px, py, 0, 1, walls);
  const bottom = castRoomRayToWalls(px, py, 0, -1, walls);
  if ([right, left, top, bottom].some((v) => v == null)) return null;

  const bbox = { minX: left, minY: bottom, maxX: right, maxY: top };
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  if (width < 1 || height < 1) return null;

  const mapArea = getMapArea();
  const area = bboxArea(bbox);
  if (mapArea > 0 && area > mapArea * 0.45) return null;
  return bbox;
};

const normalizeRoomBboxesFromGeometry = () => {
  const rooms = getRoomDefs();
  if (!rooms.length) return;
  const mapArea = getMapArea();
  if (mapArea <= 0) return;

  for (const room of rooms) {
    const current = room.bbox || null;
    const currentArea = bboxArea(current);
    const suspicious = !current || currentArea <= 0 || currentArea > mapArea * 0.35;
    if (!suspicious) continue;
    const rebuilt = computeRoomBboxFromLabelGeometry(room);
    if (!rebuilt) continue;
    room.bbox = rebuilt;
  }
};

const getEffectiveRoomBbox = (roomDef) => {
  if (!roomDef) return null;
  const metadataBbox = roomDef.bbox || null;
  if (!metadataBbox) return computeRoomBbox(roomDef.roomId);

  const mapArea = getMapArea();
  if (mapArea <= 0) return metadataBbox;

  const metadataArea = bboxArea(metadataBbox);
  // If metadata bbox is very large, prefer tighter entity-derived bbox when available.
  if (metadataArea > mapArea * 0.4) {
    const rebuiltBbox = computeRoomBboxFromLabelGeometry(roomDef);
    if (rebuiltBbox) return rebuiltBbox;
    const derivedBbox = computeRoomBbox(roomDef.roomId);
    const derivedArea = bboxArea(derivedBbox);
    if (derivedBbox && derivedArea > 0 && derivedArea < metadataArea) {
      return derivedBbox;
    }
  }
  return metadataBbox;
};

const getRoomLabel = (roomDef) => {
  return roomDef.name || roomDef.roomId;
};

// ============================================================================
// RENDERING
// ============================================================================
const render = () => {
  if (!ctx.value || !mapData.value) return;
  const c = ctx.value;

  c.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

  // Background
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, canvasWidth.value, canvasHeight.value);

  // Grid
  drawGrid(c);

  // Entities by layer
  const layers = mapData.value.layers || [];
  const entities = mapData.value.entities || [];
  const entitiesByLayer = {};
  for (const e of entities) {
    const lid = e.layerId || "default";
    if (!entitiesByLayer[lid]) entitiesByLayer[lid] = [];
    entitiesByLayer[lid].push(e);
  }
  for (const layer of layers) {
    if (!layer.visible) continue;
    for (const entity of (entitiesByLayer[layer.id] || [])) {
      renderEntity(c, entity, layer);
    }
  }

  // Outer wall indicators in edit mode
  if (editMode.value) {
    drawOuterWallIndicators(c);
    drawSelectedLineControls(c);
    drawSelectedArcControls(c);
  }

  // Drag entity highlight
  if (isDragging.value && dragMode.value === 'entity-drag' && selectedEntity.value) {
    drawEntityHighlight(c, selectedEntity.value, '#3b82f6');
  }
};

const drawGrid = (c) => {
  const gridSpacing = 5;
  const bounds = mapData.value?.metadata?.bounds;
  if (!bounds) return;
  c.strokeStyle = "rgba(200, 210, 220, 0.35)";
  c.lineWidth = 0.5;
  const topLeft = screenToWorld(0, 0);
  const bottomRight = screenToWorld(canvasWidth.value, canvasHeight.value);
  const minX = Math.floor(Math.min(topLeft.x, bottomRight.x) / gridSpacing) * gridSpacing;
  const maxX = Math.ceil(Math.max(topLeft.x, bottomRight.x) / gridSpacing) * gridSpacing;
  const minY = Math.floor(Math.min(topLeft.y, bottomRight.y) / gridSpacing) * gridSpacing;
  const maxY = Math.ceil(Math.max(topLeft.y, bottomRight.y) / gridSpacing) * gridSpacing;
  for (let x = minX; x <= maxX; x += gridSpacing) {
    const s = worldToScreen(x, minY), e = worldToScreen(x, maxY);
    c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(e.x, e.y); c.stroke();
  }
  for (let y = minY; y <= maxY; y += gridSpacing) {
    const s = worldToScreen(minX, y), e = worldToScreen(maxX, y);
    c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(e.x, e.y); c.stroke();
  }
};

// ============================================================================
// ENTITY RENDERING
// ============================================================================
const renderEntity = (c, entity, layer) => {
  switch (entity.type) {
    case "line": renderLine(c, entity, layer); break;
    case "rect": renderRect(c, entity, layer); break;
    case "arc": renderArc(c, entity, layer); break;
    case "text": renderText(c, entity, layer); break;
    case "point": renderPoint(c, entity, layer); break;
    case "polyline": renderPolyline(c, entity, layer); break;
  }
};

const renderLine = (c, entity, layer) => {
  if (!entity.start || !entity.end) return;
  const start = worldToScreen(entity.start.x, entity.start.y);
  const end = worldToScreen(entity.end.x, entity.end.y);
  const dx = end.x - start.x, dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 0.5) return;

  if (entity.layerId === "walls") {
    const halfThickness = worldDistanceToScreen(wallThickness.value) / 2;
    const MIN_WALL_PX = 3;
    if (halfThickness < MIN_WALL_PX / 2) {
      c.beginPath(); c.moveTo(start.x, start.y); c.lineTo(end.x, end.y);
      c.strokeStyle = entity.isOuterWall ? "#1a1a2e" : "#1e293b";
      c.lineWidth = MIN_WALL_PX; c.lineCap = "butt"; c.stroke();
      return;
    }
    const angle = Math.atan2(dy, dx);
    const perpX = Math.sin(angle) * halfThickness;
    const perpY = Math.cos(angle) * halfThickness;
    c.beginPath();
    c.moveTo(start.x - perpX, start.y + perpY);
    c.lineTo(end.x - perpX, end.y + perpY);
    c.lineTo(end.x + perpX, end.y - perpY);
    c.lineTo(start.x + perpX, start.y - perpY);
    c.closePath();
    c.fillStyle = entity.isOuterWall ? "#1a1a2e" : "#1e293b";
    c.fill();
    c.strokeStyle = "#0f172a"; c.lineWidth = 1; c.stroke();
    return;
  }

  c.beginPath(); c.moveTo(start.x, start.y); c.lineTo(end.x, end.y);
  c.strokeStyle = layer.color || "#000000";
  c.lineWidth = Math.max((layer.lineWidth || 2) * zoom.value, 1);
  c.lineCap = "round"; c.stroke();
};

const renderRect = (c, entity, layer) => {
  const tl = worldToScreen(entity.x, entity.y + entity.height);
  const w = worldDistanceToScreen(entity.width);
  const h = worldDistanceToScreen(entity.height);
  if (entity.fill) { c.fillStyle = entity.fill; c.fillRect(tl.x, tl.y, w, h); }
  if (entity.stroke !== null) {
    c.strokeStyle = entity.stroke || layer.color || "#000000";
    c.lineWidth = (layer.lineWidth || 2) * zoom.value;
    c.strokeRect(tl.x, tl.y, w, h);
  }
};

const renderArc = (c, entity, layer) => {
  const center = worldToScreen(entity.center.x, entity.center.y);
  const radius = worldDistanceToScreen(entity.radius);
  const startRad = (-entity.endAngle * Math.PI) / 180;
  const endRad = (-entity.startAngle * Math.PI) / 180;
  c.beginPath(); c.arc(center.x, center.y, radius, startRad, endRad);
  c.strokeStyle = layer.color || "#000000";
  c.lineWidth = (layer.lineWidth || 2) * zoom.value; c.stroke();
};

const renderText = (c, entity, layer) => {
  const pos = worldToScreen(entity.position.x, entity.position.y);
  const fontSize = worldDistanceToScreen(entity.fontSize || 1);
  c.font = `bold ${Math.max(fontSize, 10)}px ${entity.fontFamily || "Arial"}`;
  c.textAlign = entity.textAlign || "center";
  c.textBaseline = "middle";
  const metrics = c.measureText(entity.text);
  const tw = metrics.width, th = fontSize, pad = 4;
  c.fillStyle = "rgba(255, 255, 255, 0.9)";
  c.fillRect(pos.x - tw / 2 - pad, pos.y - th / 2 - pad, tw + pad * 2, th + pad * 2);
  c.fillStyle = entity.layerId === "labels" ? "#7c3aed" : (layer.color || "#000000");
  c.fillText(entity.text, pos.x, pos.y);
};

const renderPoint = (c, entity, layer) => {
  const pos = worldToScreen(entity.position.x, entity.position.y);
  const radius = worldDistanceToScreen(entity.radius || 0.3);
  c.beginPath(); c.arc(pos.x, pos.y, Math.max(radius, 3), 0, Math.PI * 2);
  c.fillStyle = layer.color || "#000000"; c.fill();
};

const renderPolyline = (c, entity, layer) => {
  if (!entity.points || entity.points.length < 2) return;
  c.beginPath();
  const fp = worldToScreen(entity.points[0].x, entity.points[0].y);
  c.moveTo(fp.x, fp.y);
  for (let i = 1; i < entity.points.length; i++) {
    const p = worldToScreen(entity.points[i].x, entity.points[i].y);
    c.lineTo(p.x, p.y);
  }
  if (entity.closed) c.closePath();
  c.strokeStyle = layer.color || "#000000";
  c.lineWidth = (layer.lineWidth || 2) * zoom.value; c.stroke();
};

// ============================================================================
// ROOM ICONS DRAWING
// ============================================================================
const drawRoomIcons = (c) => {
  const rooms = getRoomDefs();

  for (const [roomIndex, room] of rooms.entries()) {
    const bbox = getEffectiveRoomBbox(room);
    if (!bbox) continue;

    const tl = worldToScreen(bbox.minX, bbox.maxY);
    const br = worldToScreen(bbox.maxX, bbox.minY);
    const cx = (tl.x + br.x) / 2;
    const cy = (tl.y + br.y) / 2;
    const w = br.x - tl.x;
    const h = br.y - tl.y;

    if (activeRoomIndex.value === roomIndex) {
      // ---- ACTIVE ROOM: show edit controls ----
      // Room highlight border
      c.strokeStyle = '#3b82f6';
      c.lineWidth = 2.5;
      c.setLineDash([8, 4]);
      c.strokeRect(tl.x - 4, tl.y - 4, w + 8, h + 8);
      c.setLineDash([]);

      // Semi-transparent overlay
      c.fillStyle = 'rgba(59, 130, 246, 0.04)';
      c.fillRect(tl.x - 4, tl.y - 4, w + 8, h + 8);

      // ---- CENTER: Move handle (4-directional arrow) ----
      drawMoveIcon(c, cx, cy, hoveredIcon.value?.type === 'move' && hoveredIcon.value?.roomIndex === roomIndex);

      // ---- EDGES: Resize arrows ----
      drawResizeIcon(c, cx, tl.y - 2, 'n', roomIndex); // top
      drawResizeIcon(c, cx, br.y + 2, 's', roomIndex); // bottom
      drawResizeIcon(c, tl.x - 2, cy, 'w', roomIndex); // left
      drawResizeIcon(c, br.x + 2, cy, 'e', roomIndex); // right

      // ---- TOP-RIGHT: Delete (minus) icon ----
      drawDeleteIcon(c, br.x + 4, tl.y - 4, roomIndex);

      // Room name label
      c.font = 'bold 13px Inter, sans-serif';
      c.fillStyle = '#3b82f6';
      c.textAlign = 'left';
      c.fillText(room.name, tl.x, tl.y - 10);

    } else {
      // ---- INACTIVE ROOM: show pencil icon ----
      drawPencilIcon(c, br.x - 16, tl.y + 16, roomIndex);
    }
  }
};

/**
 * Draw a pencil icon at (x, y)
 */
const drawPencilIcon = (c, x, y, roomIndex) => {
  const isHovered = hoveredIcon.value?.type === 'pencil' && hoveredIcon.value?.roomIndex === roomIndex;
  const size = isHovered ? 22 : 18;

  // Background circle
  c.beginPath();
  c.arc(x, y, size / 2 + 4, 0, Math.PI * 2);
  c.fillStyle = isHovered ? '#3b82f6' : 'rgba(59, 130, 246, 0.85)';
  c.fill();
  c.strokeStyle = '#ffffff';
  c.lineWidth = 2;
  c.stroke();

  // Pencil shape
  c.save();
  c.translate(x, y);
  c.strokeStyle = '#ffffff';
  c.fillStyle = '#ffffff';
  c.lineWidth = 1.5;
  const s = size / 18;

  // Pencil body
  c.beginPath();
  c.moveTo(-6 * s, 6 * s);
  c.lineTo(-2 * s, 7 * s);
  c.lineTo(7 * s, -2 * s);
  c.lineTo(5 * s, -5 * s);
  c.closePath();
  c.stroke();

  // Pencil tip
  c.beginPath();
  c.moveTo(-6 * s, 6 * s);
  c.lineTo(-8 * s, 8 * s);
  c.lineTo(-2 * s, 7 * s);
  c.fill();

  c.restore();
};

/**
 * Draw 4-directional move icon at center
 */
const drawMoveIcon = (c, x, y, isHovered) => {
  const size = isHovered ? 28 : 24;

  // Background circle
  c.beginPath();
  c.arc(x, y, size / 2 + 6, 0, Math.PI * 2);
  c.fillStyle = isHovered ? '#2563eb' : 'rgba(37, 99, 235, 0.9)';
  c.fill();
  c.strokeStyle = '#ffffff';
  c.lineWidth = 2;
  c.stroke();

  // 4-directional arrows
  c.save();
  c.translate(x, y);
  c.strokeStyle = '#ffffff';
  c.fillStyle = '#ffffff';
  c.lineWidth = 2;
  const a = size / 4;

  // Draw arrow in each direction
  for (let angle = 0; angle < 4; angle++) {
    c.save();
    c.rotate((angle * Math.PI) / 2);
    c.beginPath();
    c.moveTo(0, -2); c.lineTo(0, -a);
    c.stroke();
    // Arrow head
    c.beginPath();
    c.moveTo(0, -a - 3); c.lineTo(-3, -a + 2); c.lineTo(3, -a + 2);
    c.closePath(); c.fill();
    c.restore();
  }

  c.restore();
};

/**
 * Draw resize arrow on an edge
 */
const drawResizeIcon = (c, x, y, direction, roomIndex) => {
  const isHovered = hoveredIcon.value?.type === 'resize' &&
    hoveredIcon.value?.roomIndex === roomIndex &&
    hoveredIcon.value?.direction === direction;
  const size = isHovered ? 12 : 10;

  c.beginPath();
  c.arc(x, y, size, 0, Math.PI * 2);
  c.fillStyle = isHovered ? '#8b5cf6' : 'rgba(139, 92, 246, 0.8)';
  c.fill();
  c.strokeStyle = '#ffffff';
  c.lineWidth = 1.5;
  c.stroke();

  // Double-headed arrow
  c.save();
  c.translate(x, y);
  c.strokeStyle = '#ffffff';
  c.fillStyle = '#ffffff';
  c.lineWidth = 1.5;

  const isVertical = direction === 'n' || direction === 's';
  if (!isVertical) c.rotate(Math.PI / 2);

  const a = size * 0.6;
  c.beginPath(); c.moveTo(0, -a); c.lineTo(0, a); c.stroke();
  // Top arrow
  c.beginPath(); c.moveTo(0, -a - 2); c.lineTo(-2.5, -a + 2); c.lineTo(2.5, -a + 2); c.closePath(); c.fill();
  // Bottom arrow
  c.beginPath(); c.moveTo(0, a + 2); c.lineTo(-2.5, a - 2); c.lineTo(2.5, a - 2); c.closePath(); c.fill();

  c.restore();
};

/**
 * Draw delete (minus) icon
 */
const drawDeleteIcon = (c, x, y, roomIndex) => {
  const isHovered = hoveredIcon.value?.type === 'delete' && hoveredIcon.value?.roomIndex === roomIndex;
  const size = isHovered ? 12 : 10;

  c.beginPath();
  c.arc(x, y, size, 0, Math.PI * 2);
  c.fillStyle = isHovered ? '#dc2626' : 'rgba(220, 38, 38, 0.85)';
  c.fill();
  c.strokeStyle = '#ffffff';
  c.lineWidth = 1.5;
  c.stroke();

  // Minus sign
  c.strokeStyle = '#ffffff';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(x - size * 0.5, y);
  c.lineTo(x + size * 0.5, y);
  c.stroke();
};

/**
 * Draw highlight around an entity being dragged
 */
const drawEntityHighlight = (c, entity, color) => {
  const bbox = getEntityBoundingBox(entity);
  if (!bbox) return;
  const tl = worldToScreen(bbox.minX, bbox.maxY);
  const br = worldToScreen(bbox.maxX, bbox.minY);
  c.strokeStyle = color;
  c.lineWidth = 2;
  c.setLineDash([4, 3]);
  c.strokeRect(tl.x - 3, tl.y - 3, br.x - tl.x + 6, br.y - tl.y + 6);
  c.setLineDash([]);
};

/**
 * Draw outer wall amber indicators
 */
const drawOuterWallIndicators = (c) => {
  if (!mapData.value?.entities) return;
  c.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  c.lineWidth = 1;
  c.setLineDash([2, 4]);
  for (const e of mapData.value.entities) {
    if (!e.isOuterWall || e.type !== 'line') continue;
    const s = worldToScreen(e.start.x, e.start.y);
    const en = worldToScreen(e.end.x, e.end.y);
    c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(en.x, en.y); c.stroke();
  }
  c.setLineDash([]);
};

const getSelectedLineControlPoints = () => {
  const line = selectedLineEntity.value;
  if (!line || !isEditableLineEntity(line) || !line.start || !line.end) return null;
  if (!mapData.value?.entities?.includes(line)) return null;

  const start = worldToScreen(line.start.x, line.start.y);
  const end = worldToScreen(line.end.x, line.end.y);
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const deletePos = { x: mid.x + nx * 18, y: mid.y + ny * 18 };
  const rotatePos = { x: mid.x - nx * 18, y: mid.y - ny * 18 };

  return { line, start, end, deletePos, rotatePos };
};

const drawSelectedLineControls = (c) => {
  if (!editMode.value) return;
  const controls = getSelectedLineControlPoints();
  if (!controls) return;

  const { line, start, end, deletePos, rotatePos } = controls;

  c.strokeStyle = "#3b82f6";
  c.lineWidth = 2;
  c.setLineDash([6, 4]);
  c.beginPath();
  c.moveTo(start.x, start.y);
  c.lineTo(end.x, end.y);
  c.stroke();
  c.setLineDash([]);

  const drawEndpoint = (p, type) => {
    const hovered = hoveredLineControl.value?.entity === line && hoveredLineControl.value?.type === type;
    c.beginPath();
    c.arc(p.x, p.y, hovered ? 8 : 6, 0, Math.PI * 2);
    c.fillStyle = hovered ? "#2563eb" : "#ffffff";
    c.fill();
    c.strokeStyle = "#2563eb";
    c.lineWidth = 2;
    c.stroke();
  };

  drawEndpoint(start, "start");
  drawEndpoint(end, "end");

  const delHovered = hoveredLineControl.value?.entity === line && hoveredLineControl.value?.type === "delete";
  c.beginPath();
  c.arc(deletePos.x, deletePos.y, delHovered ? 11 : 9, 0, Math.PI * 2);
  c.fillStyle = delHovered ? "#b91c1c" : "#ef4444";
  c.fill();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 1.5;
  c.stroke();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 2.4;
  c.beginPath();
  c.moveTo(deletePos.x - 4, deletePos.y);
  c.lineTo(deletePos.x + 4, deletePos.y);
  c.stroke();

  const rotHovered = hoveredLineControl.value?.entity === line && hoveredLineControl.value?.type === "rotate";
  c.beginPath();
  c.arc(rotatePos.x, rotatePos.y, rotHovered ? 11 : 9, 0, Math.PI * 2);
  c.fillStyle = rotHovered ? "#0f766e" : "#14b8a6";
  c.fill();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 1.5;
  c.stroke();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 1.8;
  c.beginPath();
  c.moveTo(rotatePos.x - 3.5, rotatePos.y);
  c.lineTo(rotatePos.x + 3.5, rotatePos.y);
  c.moveTo(rotatePos.x, rotatePos.y - 3.5);
  c.lineTo(rotatePos.x, rotatePos.y + 3.5);
  c.stroke();
};

const findLineControlAtPosition = (screenX, screenY) => {
  const controls = getSelectedLineControlPoints();
  if (!controls) return null;
  const { line, start, end, deletePos, rotatePos } = controls;

  const dist = (a) => Math.hypot(screenX - a.x, screenY - a.y);
  if (dist(start) <= 12) return { type: "start", entity: line };
  if (dist(end) <= 12) return { type: "end", entity: line };
  if (dist(deletePos) <= 13) return { type: "delete", entity: line };
  if (dist(rotatePos) <= 13) return { type: "rotate", entity: line };
  return null;
};

const toggleLineOrientation = (lineEntity) => {
  if (!lineEntity?.start || !lineEntity?.end) return;
  detachEntityGeometry(lineEntity);
  const dx = lineEntity.end.x - lineEntity.start.x;
  const dy = lineEntity.end.y - lineEntity.start.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.01) return;

  const cx = (lineEntity.start.x + lineEntity.end.x) / 2;
  const cy = (lineEntity.start.y + lineEntity.end.y) / 2;
  const isHorizontal = Math.abs(dx) >= Math.abs(dy);

  if (isHorizontal) {
    lineEntity.start.x = cx;
    lineEntity.end.x = cx;
    lineEntity.start.y = cy - len / 2;
    lineEntity.end.y = cy + len / 2;
  } else {
    lineEntity.start.y = cy;
    lineEntity.end.y = cy;
    lineEntity.start.x = cx - len / 2;
    lineEntity.end.x = cx + len / 2;
  }

  hasUnsavedChanges.value = true;
  render();
  emitMapChanged();
};

const getSelectedArcControlPoints = () => {
  const arc = selectedArcEntity.value;
  if (!arc || arc.type !== "arc" || !arc.center) return null;
  if (!mapData.value?.entities?.includes(arc)) return null;

  const center = worldToScreen(arc.center.x, arc.center.y);
  const radius = Math.max(1, worldDistanceToScreen(Math.max(0.1, arc.radius || 0.1)));
  const radiusPos = { x: center.x + radius, y: center.y };
  const deletePos = { x: center.x, y: center.y - 22 };
  return { arc, center, radiusPos, deletePos };
};

const drawSelectedArcControls = (c) => {
  if (!editMode.value) return;
  const controls = getSelectedArcControlPoints();
  if (!controls) return;
  const { arc, center, radiusPos, deletePos } = controls;

  const startRad = (-arc.endAngle * Math.PI) / 180;
  const endRad = (-arc.startAngle * Math.PI) / 180;
  const radiusPx = Math.max(1, worldDistanceToScreen(Math.max(0.1, arc.radius || 0.1)));
  c.strokeStyle = "#3b82f6";
  c.lineWidth = 2;
  c.setLineDash([6, 4]);
  c.beginPath();
  c.arc(center.x, center.y, radiusPx, startRad, endRad);
  c.stroke();
  c.setLineDash([]);

  const drawHandle = (p, type) => {
    const hovered = hoveredArcControl.value?.entity === arc && hoveredArcControl.value?.type === type;
    c.beginPath();
    c.arc(p.x, p.y, hovered ? 8 : 6, 0, Math.PI * 2);
    c.fillStyle = hovered ? "#2563eb" : "#ffffff";
    c.fill();
    c.strokeStyle = "#2563eb";
    c.lineWidth = 2;
    c.stroke();
  };

  drawHandle(center, "center");
  drawHandle(radiusPos, "radius");

  const delHovered = hoveredArcControl.value?.entity === arc && hoveredArcControl.value?.type === "delete";
  c.beginPath();
  c.arc(deletePos.x, deletePos.y, delHovered ? 11 : 9, 0, Math.PI * 2);
  c.fillStyle = delHovered ? "#b91c1c" : "#ef4444";
  c.fill();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 1.5;
  c.stroke();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 2.4;
  c.beginPath();
  c.moveTo(deletePos.x - 4, deletePos.y);
  c.lineTo(deletePos.x + 4, deletePos.y);
  c.stroke();
};

const findArcControlAtPosition = (screenX, screenY) => {
  const controls = getSelectedArcControlPoints();
  if (!controls) return null;
  const { arc, center, radiusPos, deletePos } = controls;
  const dist = (p) => Math.hypot(screenX - p.x, screenY - p.y);
  if (dist(center) <= 12) return { type: "center", entity: arc };
  if (dist(radiusPos) <= 12) return { type: "radius", entity: arc };
  if (dist(deletePos) <= 13) return { type: "delete", entity: arc };
  return null;
};

const deleteArcEntity = (arcEntity) => {
  if (!arcEntity || !mapData.value?.entities) return;
  mapData.value.entities = mapData.value.entities.filter((e) => e !== arcEntity);
  if (selectedArcEntity.value === arcEntity) selectedArcEntity.value = null;
  if (selectedEntity.value === arcEntity) selectedEntity.value = null;
  hoveredArcControl.value = null;
  hasUnsavedChanges.value = true;
  render();
  emitMapChanged();
};

// ============================================================================
// HIT TESTING
// ============================================================================
const getEntityBoundingBox = (entity) => {
  switch (entity.type) {
    case "line": return {
      minX: Math.min(entity.start.x, entity.end.x), maxX: Math.max(entity.start.x, entity.end.x),
      minY: Math.min(entity.start.y, entity.end.y), maxY: Math.max(entity.start.y, entity.end.y),
    };
    case "rect": return { minX: entity.x, maxX: entity.x + entity.width, minY: entity.y, maxY: entity.y + entity.height };
    case "arc": return {
      minX: entity.center.x - entity.radius, maxX: entity.center.x + entity.radius,
      minY: entity.center.y - entity.radius, maxY: entity.center.y + entity.radius,
    };
    case "text": {
      const s = entity.fontSize || 1;
      return { minX: entity.position.x - s * 3, maxX: entity.position.x + s * 3, minY: entity.position.y - s, maxY: entity.position.y + s };
    }
    case "point": {
      const r = entity.radius || 0.3;
      return { minX: entity.position.x - r, maxX: entity.position.x + r, minY: entity.position.y - r, maxY: entity.position.y + r };
    }
    case "polyline": {
      if (!entity.points?.length) return null;
      let mn = { x: Infinity, y: Infinity }, mx = { x: -Infinity, y: -Infinity };
      for (const p of entity.points) { mn.x = Math.min(mn.x, p.x); mn.y = Math.min(mn.y, p.y); mx.x = Math.max(mx.x, p.x); mx.y = Math.max(mx.y, p.y); }
      return { minX: mn.x, minY: mn.y, maxX: mx.x, maxY: mx.y };
    }
    default: return null;
  }
};

const hitTestEntity = (entity, worldX, worldY) => {
  let tolerance = (1 / (baseScale.value * zoom.value)) * 10;
  if (entity.layerId === "walls" && (entity.type === "line" || entity.type === "arc")) {
    tolerance = Math.max(tolerance, wallThickness.value * 2.2);
  }
  if (entity.type === "line") {
    const { start, end } = entity;
    const dx = end.x - start.x, dy = end.y - start.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.sqrt((worldX - start.x) ** 2 + (worldY - start.y) ** 2) <= tolerance;
    let t = ((worldX - start.x) * dx + (worldY - start.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const px = start.x + t * dx, py = start.y + t * dy;
    return Math.sqrt((worldX - px) ** 2 + (worldY - py) ** 2) <= tolerance;
  }
  if (entity.type === "arc") {
    const dx = worldX - entity.center.x, dy = worldY - entity.center.y;
    return Math.abs(Math.sqrt(dx * dx + dy * dy) - entity.radius) <= tolerance;
  }
  // Bbox test for everything else
  const bbox = getEntityBoundingBox(entity);
  if (!bbox) return false;
  return worldX >= bbox.minX - tolerance && worldX <= bbox.maxX + tolerance &&
         worldY >= bbox.minY - tolerance && worldY <= bbox.maxY + tolerance;
};

const findEntityAtPosition = (screenX, screenY, predicate = null) => {
  const world = screenToWorld(screenX, screenY);
  const entities = mapData.value?.entities || [];
  for (let i = entities.length - 1; i >= 0; i--) {
    const e = entities[i];
    if (predicate && !predicate(e)) continue;
    const layer = mapData.value?.layers?.find((l) => l.id === e.layerId);
    if (layer && !layer.visible) continue;
    if (hitTestEntity(e, world.x, world.y)) return e;
  }
  return null;
};

const isEntityDraggable = (entity) => {
  return !!entity && !entity.isOuterWall && entity.layerId !== "walls";
};

const isMovableWallEntity = (entity) => {
  return !!entity && entity.type === "line" && entity.layerId === "walls" && !entity.isOuterWall;
};

const isEditableLineEntity = (entity) => {
  return !!entity && entity.type === "line" && !entity.isOuterWall;
};

const isEditableArcEntity = (entity) => {
  return !!entity && entity.type === "arc" && !entity.isOuterWall && !!entity.center;
};

const getEntityGroupId = (entity) => {
  if (!entity) return null;
  return entity.groupId || entity.properties?.groupId || null;
};

const getDraggableEntityGroup = (entity) => {
  const entities = mapData.value?.entities || [];
  if (!isEntityDraggable(entity)) return [];
  if (entity.type === "line") return [entity];

  const groupId = getEntityGroupId(entity);
  if (groupId) {
    const grouped = entities.filter(
      (e) => isEntityDraggable(e) && getEntityGroupId(e) === groupId
    );
    if (grouped.length > 1) return grouped;
  }
  // Default behavior: move exactly one entity.
  return [entity];
};

const findWallEndpointAtPosition = (screenX, screenY) => {
  const world = screenToWorld(screenX, screenY);
  const tol = (1 / (baseScale.value * zoom.value)) * 12;
  let best = null;
  let bestDist = Infinity;
  const entities = mapData.value?.entities || [];

  for (let i = entities.length - 1; i >= 0; i--) {
    const e = entities[i];
    if (e.type !== "line" || e.layerId !== "walls" || e.isOuterWall) continue;
    const layer = mapData.value?.layers?.find((l) => l.id === e.layerId);
    if (layer && !layer.visible) continue;

    const ds = Math.hypot(world.x - e.start.x, world.y - e.start.y);
    const de = Math.hypot(world.x - e.end.x, world.y - e.end.y);
    if (ds <= tol && ds < bestDist) {
      bestDist = ds;
      const dx = e.end.x - e.start.x;
      const dy = e.end.y - e.start.y;
      const lockAxis = Math.abs(dx) > Math.abs(dy) * 2 ? "y" : (Math.abs(dy) > Math.abs(dx) * 2 ? "x" : null);
      best = { entity: e, endpoint: "start", lockAxis };
    }
    if (de <= tol && de < bestDist) {
      bestDist = de;
      const dx = e.end.x - e.start.x;
      const dy = e.end.y - e.start.y;
      const lockAxis = Math.abs(dx) > Math.abs(dy) * 2 ? "y" : (Math.abs(dy) > Math.abs(dx) * 2 ? "x" : null);
      best = { entity: e, endpoint: "end", lockAxis };
    }
  }
  return best;
};

// ============================================================================
// ICON HIT TESTING
// ============================================================================
/**
 * Check which icon (if any) is at the given screen position
 * Returns: { type: 'pencil'|'move'|'resize'|'delete', roomId, roomIndex, room, direction? } or null
 */
const findIconAtPosition = (screenX, screenY) => {
  const rooms = getRoomDefs();

  for (const [roomIndex, room] of rooms.entries()) {
    const bbox = getEffectiveRoomBbox(room);
    if (!bbox) continue;

    const tl = worldToScreen(bbox.minX, bbox.maxY);
    const br = worldToScreen(bbox.maxX, bbox.minY);
    const cx = (tl.x + br.x) / 2;
    const cy = (tl.y + br.y) / 2;

    if (activeRoomIndex.value === roomIndex) {
      // Check move icon (center)
      if (Math.sqrt((screenX - cx) ** 2 + (screenY - cy) ** 2) <= 18) {
        return { type: 'move', roomId: room.roomId, roomIndex, room };
      }

      // Check resize icons (edges)
      const resizeHits = [
        { dir: 'n', x: cx, y: tl.y - 2 },
        { dir: 's', x: cx, y: br.y + 2 },
        { dir: 'w', x: tl.x - 2, y: cy },
        { dir: 'e', x: br.x + 2, y: cy },
      ];
      for (const rh of resizeHits) {
        if (Math.sqrt((screenX - rh.x) ** 2 + (screenY - rh.y) ** 2) <= 14) {
          return { type: 'resize', roomId: room.roomId, roomIndex, room, direction: rh.dir };
        }
      }

      // Check delete icon (top-right)
      const dx = br.x + 4, dy = tl.y - 4;
      if (Math.sqrt((screenX - dx) ** 2 + (screenY - dy) ** 2) <= 14) {
        return { type: 'delete', roomId: room.roomId, roomIndex, room };
      }
    } else {
      // Check pencil icon (top-right inside)
      const px = br.x - 16, py = tl.y + 16;
      if (Math.sqrt((screenX - px) ** 2 + (screenY - py) ** 2) <= 16) {
        return { type: 'pencil', roomId: room.roomId, roomIndex, room };
      }
    }
  }
  return null;
};

// ============================================================================
// ENTITY POSITION HELPERS
// ============================================================================
const getEntityPosition = (entity) => {
  switch (entity.type) {
    case "line": return { x: entity.start.x, y: entity.start.y };
    case "rect": return { x: entity.x, y: entity.y };
    case "arc": return { x: entity.center.x, y: entity.center.y };
    case "text": case "point": return { x: entity.position.x, y: entity.position.y };
    default: return { x: 0, y: 0 };
  }
};

const detachEntityGeometry = (entity) => {
  if (!entity) return;
  if (entity.type === "line" && entity.start && entity.end) {
    entity.start = { x: entity.start.x, y: entity.start.y };
    entity.end = { x: entity.end.x, y: entity.end.y };
    return;
  }
  if (entity.type === "arc" && entity.center) {
    entity.center = { x: entity.center.x, y: entity.center.y };
    return;
  }
  if ((entity.type === "text" || entity.type === "point") && entity.position) {
    entity.position = { x: entity.position.x, y: entity.position.y };
    return;
  }
  if (entity.type === "polyline" && Array.isArray(entity.points)) {
    entity.points = entity.points.map((p) => ({ x: p.x, y: p.y }));
  }
};

const moveEntity = (entity, originalPos, dx, dy) => {
  if (entity.isOuterWall) return; // never move outer walls
  switch (entity.type) {
    case "line": {
      const ldx = entity.end.x - entity.start.x, ldy = entity.end.y - entity.start.y;
      entity.start.x = originalPos.x + dx; entity.start.y = originalPos.y + dy;
      entity.end.x = entity.start.x + ldx; entity.end.y = entity.start.y + ldy;
      break;
    }
    case "rect": entity.x = originalPos.x + dx; entity.y = originalPos.y + dy; break;
    case "arc": entity.center.x = originalPos.x + dx; entity.center.y = originalPos.y + dy; break;
    case "text": case "point": entity.position.x = originalPos.x + dx; entity.position.y = originalPos.y + dy; break;
  }
};

const deleteLineEntity = (lineEntity) => {
  if (!lineEntity || !mapData.value?.entities) return;
  mapData.value.entities = mapData.value.entities.filter((e) => e !== lineEntity);
  if (selectedLineEntity.value === lineEntity) selectedLineEntity.value = null;
  if (selectedEntity.value === lineEntity) selectedEntity.value = null;
  hoveredLineControl.value = null;
  wallResizeState.value = null;
  hasUnsavedChanges.value = true;
  render();
  emitMapChanged();
};

// ============================================================================
// MOUSE EVENT HANDLERS
// ============================================================================
const handleMouseDown = (event) => {
  const rect = canvas.value.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  if (event.button === 2) {
    // Right click - always pan
    isPanning.value = true;
    dragStart.value = { x: screenX, y: screenY };
    return;
  }

  if (event.button !== 0) return;

  if (editMode.value) {
    // 1) Click selected-line controls (resize endpoints or delete icon).
    const lineControl = findLineControlAtPosition(screenX, screenY);
    if (lineControl?.entity && isEditableLineEntity(lineControl.entity)) {
      if (lineControl.type === "delete") {
        deleteLineEntity(lineControl.entity);
        return;
      }
      if (lineControl.type === "rotate") {
        selectedLineEntity.value = lineControl.entity;
        selectedArcEntity.value = null;
        toggleLineOrientation(lineControl.entity);
        return;
      }
      detachEntityGeometry(lineControl.entity);
      selectedLineEntity.value = lineControl.entity;
      selectedArcEntity.value = null;
      selectedEntity.value = lineControl.entity;
      isDragging.value = true;
      dragMode.value = "wall-resize";
      const dx = lineControl.entity.end.x - lineControl.entity.start.x;
      const dy = lineControl.entity.end.y - lineControl.entity.start.y;
      const lockAxis = Math.abs(dx) > Math.abs(dy) * 2 ? "y" : (Math.abs(dy) > Math.abs(dx) * 2 ? "x" : null);
      wallResizeState.value = {
        entity: lineControl.entity,
        endpoint: lineControl.type === "start" ? "start" : "end",
        lockAxis,
      };
      dragStart.value = screenToWorld(screenX, screenY);
      render();
      return;
    }

    // 2) Click selected-arc controls (move/resize/delete).
    const arcControl = findArcControlAtPosition(screenX, screenY);
    if (arcControl?.entity && arcControl.entity.type === "arc") {
      if (arcControl.type === "delete") {
        deleteArcEntity(arcControl.entity);
        return;
      }
      detachEntityGeometry(arcControl.entity);
      selectedArcEntity.value = arcControl.entity;
      selectedLineEntity.value = null;
      selectedEntity.value = arcControl.entity;
      if (arcControl.type === "radius") {
        isDragging.value = true;
        dragMode.value = "arc-resize";
        arcResizeState.value = { entity: arcControl.entity };
        dragStart.value = screenToWorld(screenX, screenY);
      } else {
        isDragging.value = true;
        dragMode.value = "entity-drag";
        dragStart.value = screenToWorld(screenX, screenY);
        dragStartPositions.value = [{ entity: arcControl.entity, pos: { ...getEntityPosition(arcControl.entity) } }];
      }
      render();
      return;
    }

    // 3) Drag wall endpoints to resize individual walls.
    const wallEndpoint = findWallEndpointAtPosition(screenX, screenY);
    if (wallEndpoint) {
      detachEntityGeometry(wallEndpoint.entity);
      selectedLineEntity.value = wallEndpoint.entity;
      selectedArcEntity.value = null;
      selectedEntity.value = wallEndpoint.entity;
      isDragging.value = true;
      dragMode.value = 'wall-resize';
      wallResizeState.value = wallEndpoint;
      dragStart.value = screenToWorld(screenX, screenY);
      render();
      return;
    }

    // 4) Drag a wall line to move that wall segment.
    const wallEntity = findEntityAtPosition(
      screenX,
      screenY,
      (e) => isMovableWallEntity(e)
    );
    if (wallEntity) {
      detachEntityGeometry(wallEntity);
      selectedLineEntity.value = wallEntity;
      selectedArcEntity.value = null;
      selectedEntity.value = wallEntity;
      isDragging.value = true;
      dragMode.value = 'entity-drag';
      dragStart.value = screenToWorld(screenX, screenY);
      dragStartPositions.value = [{ entity: wallEntity, pos: { ...getEntityPosition(wallEntity) } }];
      render();
      return;
    }

    // 5) Select any editable curve (including wall arcs) to show arc controls.
    const arcEntity = findEntityAtPosition(
      screenX,
      screenY,
      (e) => isEditableArcEntity(e),
    );
    if (arcEntity) {
      selectedArcEntity.value = arcEntity;
      selectedLineEntity.value = null;
      selectedEntity.value = arcEntity;
      render();
      return;
    }

    // 6) Drag inner entities (furniture/doors/windows/text).
    const entity = findEntityAtPosition(
      screenX,
      screenY,
      (e) => isEntityDraggable(e)
    );
    if (entity) {
      selectedLineEntity.value = entity.type === "line" ? entity : null;
      selectedArcEntity.value = entity.type === "arc" ? entity : null;
      selectedEntity.value = entity;
      isDragging.value = true;
      dragMode.value = 'entity-drag';
      dragStart.value = screenToWorld(screenX, screenY);
      const grouped = getDraggableEntityGroup(entity);
      for (const e of grouped) detachEntityGeometry(e);
      dragStartPositions.value = grouped.map((e) => ({ entity: e, pos: { ...getEntityPosition(e) } }));
      render();
      return;
    }

    // 7) Otherwise pan and deselect controls.
    selectedLineEntity.value = null;
    hoveredLineControl.value = null;
    selectedArcEntity.value = null;
    hoveredArcControl.value = null;
    isPanning.value = true;
    dragStart.value = { x: screenX, y: screenY };

  } else {
    // View mode - pan
    isPanning.value = true;
    dragStart.value = { x: screenX, y: screenY };
  }
};

const handleMouseMove = (event) => {
  const rect = canvas.value.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;
  mouseScreenCoords.value = { x: screenX, y: screenY };
  mouseWorldCoords.value = screenToWorld(screenX, screenY);

  if (isPanning.value) {
    const dx = screenX - dragStart.value.x;
    const dy = screenY - dragStart.value.y;
    const scale = baseScale.value * zoom.value;
    panOffset.value = {
      x: panOffset.value.x - dx / scale,
      y: panOffset.value.y + dy / scale,
    };
    dragStart.value = { x: screenX, y: screenY };
    render();
    return;
  }

  if (isDragging.value) {
    const currentWorld = screenToWorld(screenX, screenY);
    const dx = currentWorld.x - dragStart.value.x;
    const dy = currentWorld.y - dragStart.value.y;

    if (dragMode.value === 'room-move') {
      // Move all room entities
      for (const item of dragStartPositions.value) {
        moveEntity(item.entity, item.pos, dx, dy);
      }
      // Update room bbox in metadata
      if (activeRoom.value && dragStartBbox.value) {
        const movedBbox = {
          minX: dragStartBbox.value.minX + dx,
          minY: dragStartBbox.value.minY + dy,
          maxX: dragStartBbox.value.maxX + dx,
          maxY: dragStartBbox.value.maxY + dy,
        };
        activeRoom.value.bbox = movedBbox;
        updateRoomDefBbox(activeRoomIndex.value, movedBbox);
      }
    } else if (dragMode.value === 'room-resize') {
      applyResize(resizeDirection.value, currentWorld);
    } else if (dragMode.value === 'entity-drag') {
      for (const item of dragStartPositions.value) {
        moveEntity(item.entity, item.pos, dx, dy);
      }
    } else if (dragMode.value === 'arc-resize' && arcResizeState.value?.entity) {
      const arc = arcResizeState.value.entity;
      if (arc.center) {
        const ndx = currentWorld.x - arc.center.x;
        const ndy = currentWorld.y - arc.center.y;
        arc.radius = Math.max(0.2, Math.hypot(ndx, ndy));
      }
    } else if (dragMode.value === 'wall-resize' && wallResizeState.value?.entity) {
      const target = wallResizeState.value.entity;
      const endpoint = wallResizeState.value.endpoint;
      const lockAxis = wallResizeState.value.lockAxis;
      const next = { x: currentWorld.x, y: currentWorld.y };
      if (lockAxis === "x") {
        const fixed = endpoint === "start" ? target.end : target.start;
        next.x = fixed.x;
      } else if (lockAxis === "y") {
        const fixed = endpoint === "start" ? target.end : target.start;
        next.y = fixed.y;
      }
      if (endpoint === "start") {
        target.start.x = next.x;
        target.start.y = next.y;
      } else {
        target.end.x = next.x;
        target.end.y = next.y;
      }
      // Keep active room bbox in sync while resizing a wall.
      if (activeRoom.value && activeRoomIndex.value >= 0) {
        const b = computeRoomBboxByIndex(activeRoomIndex.value);
        if (b) {
          activeRoom.value.bbox = b;
          updateRoomDefBbox(activeRoomIndex.value, b);
        }
      }
    }

    hasUnsavedChanges.value = true;
    render();
    emitMapChanged();
    return;
  }

  // Hover detection for direct editing (no room icon workflow).
  if (editMode.value) {
    const prevControl = hoveredLineControl.value;
    hoveredIcon.value = null;
    const lineControl = findLineControlAtPosition(screenX, screenY);
    hoveredLineControl.value = lineControl;
    if (lineControl) {
      const prevArcControl = hoveredArcControl.value;
      hoveredArcControl.value = null;
      currentCursor.value = (lineControl.type === "delete" || lineControl.type === "rotate")
        ? "pointer"
        : (lineControl.type === "start" || lineControl.type === "end" ? "crosshair" : "default");
      if (
        prevControl?.entity !== lineControl.entity ||
        prevControl?.type !== lineControl.type
      ) {
        render();
      }
      if (prevArcControl) render();
      return;
    }

    const prevArcControl = hoveredArcControl.value;
    const arcControl = findArcControlAtPosition(screenX, screenY);
    hoveredArcControl.value = arcControl;
    if (arcControl) {
      currentCursor.value = arcControl.type === "delete"
        ? "pointer"
        : (arcControl.type === "radius" ? "crosshair" : "move");
      if (
        prevArcControl?.entity !== arcControl.entity ||
        prevArcControl?.type !== arcControl.type
      ) {
        render();
      }
      return;
    }

    const wallEndpoint = findWallEndpointAtPosition(screenX, screenY);
    if (wallEndpoint) {
      currentCursor.value = (wallEndpoint.lockAxis === "x") ? "ns-resize" :
        (wallEndpoint.lockAxis === "y" ? "ew-resize" : "crosshair");
      if (prevControl) render();
      return;
    }
    hoveredLineControl.value = null;
    if (prevControl) render();
    hoveredArcControl.value = null;
    if (prevArcControl) render();

    const wallEntity = findEntityAtPosition(
      screenX,
      screenY,
      (e) => isMovableWallEntity(e),
    );
    if (wallEntity) {
      currentCursor.value = "move";
      return;
    }

    const arcEntity = findEntityAtPosition(
      screenX,
      screenY,
      (e) => isEditableArcEntity(e),
    );
    if (arcEntity) {
      currentCursor.value = "move";
      return;
    }

    const entity = findEntityAtPosition(
      screenX,
      screenY,
      (e) => isEntityDraggable(e),
    );
    if (entity) {
      currentCursor.value = "grab";
      return;
    }

    currentCursor.value = "default";
  } else {
    currentCursor.value = "default";
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  isPanning.value = false;
  dragMode.value = null;
  resizeDirection.value = null;
  wallResizeState.value = null;
  arcResizeState.value = null;
  selectedEntity.value = null;
  currentCursor.value = 'default';
  render();
};

const handleMouseLeave = () => {
  isDragging.value = false;
  isPanning.value = false;
  dragMode.value = null;
  wallResizeState.value = null;
  arcResizeState.value = null;
  hoveredIcon.value = null;
  hoveredLineControl.value = null;
  hoveredArcControl.value = null;
  currentCursor.value = 'default';
  render();
};

const handleWheel = (event) => {
  event.preventDefault();
  const rect = canvas.value.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;
  const worldBefore = screenToWorld(screenX, screenY);
  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
  zoom.value = Math.max(0.1, Math.min(10, zoom.value * zoomFactor));
  const worldAfter = screenToWorld(screenX, screenY);
  panOffset.value = {
    x: panOffset.value.x + (worldBefore.x - worldAfter.x),
    y: panOffset.value.y + (worldBefore.y - worldAfter.y),
  };
  render();
};

// ============================================================================
// ROOM OPERATIONS
// ============================================================================

const intersectionArea = (a, b) => {
  if (!a || !b) return 0;
  const minX = Math.max(a.minX, b.minX);
  const minY = Math.max(a.minY, b.minY);
  const maxX = Math.min(a.maxX, b.maxX);
  const maxY = Math.min(a.maxY, b.maxY);
  if (maxX <= minX || maxY <= minY) return 0;
  return (maxX - minX) * (maxY - minY);
};

const findRoomOverlapTarget = (movingRoomIndex) => {
  const movingRoom = getRoomByIndex(movingRoomIndex);
  const movingBbox = getEffectiveRoomBbox(movingRoom);
  if (!movingBbox) return null;
  const movingArea = bboxArea(movingBbox);
  if (movingArea <= 0) return null;

  let best = null;
  let bestArea = 0;
  const rooms = getRoomDefs();
  for (const [idx, room] of rooms.entries()) {
    if (idx === movingRoomIndex) continue;
    const bbox = getEffectiveRoomBbox(room);
    if (!bbox) continue;
    const overlap = intersectionArea(movingBbox, bbox);
    if (overlap > bestArea) {
      bestArea = overlap;
      best = { room, roomIndex: idx };
    }
  }
  if (!best) return null;
  return bestArea >= movingArea * 0.18 ? best : null;
};

/**
 * Apply resize to room entities based on drag direction
 */
const applyResize = (direction, currentWorld) => {
  if (!dragStartBbox.value || !dragStartPositions.value.length) return;
  const orig = dragStartBbox.value;
  const origW = orig.maxX - orig.minX;
  const origH = orig.maxY - orig.minY;
  if (origW < 0.01 || origH < 0.01) return;

  let newMinX = orig.minX, newMinY = orig.minY, newMaxX = orig.maxX, newMaxY = orig.maxY;
  if (direction === 'e') newMaxX = Math.max(orig.minX + 1, currentWorld.x);
  if (direction === 'w') newMinX = Math.min(orig.maxX - 1, currentWorld.x);
  if (direction === 'n') newMaxY = Math.max(orig.minY + 1, currentWorld.y);
  if (direction === 's') newMinY = Math.min(orig.maxY - 1, currentWorld.y);

  const scaleX = (newMaxX - newMinX) / origW;
  const scaleY = (newMaxY - newMinY) / origH;

  for (const item of dragStartPositions.value) {
    const e = item.entity;
    if (e.isOuterWall) continue;

    if (e.type === 'line') {
      e.start.x = newMinX + (item.sx - orig.minX) * scaleX;
      e.start.y = newMinY + (item.sy - orig.minY) * scaleY;
      e.end.x = newMinX + (item.ex - orig.minX) * scaleX;
      e.end.y = newMinY + (item.ey - orig.minY) * scaleY;
    } else if (e.type === 'arc') {
      e.center.x = newMinX + (item.cx - orig.minX) * scaleX;
      e.center.y = newMinY + (item.cy - orig.minY) * scaleY;
      e.radius = item.r * Math.min(scaleX, scaleY);
    } else if (e.type === 'text' || e.type === 'point') {
      e.position.x = newMinX + (item.px - orig.minX) * scaleX;
      e.position.y = newMinY + (item.py - orig.minY) * scaleY;
    } else if (e.type === 'rect') {
      e.x = newMinX + (item.rx - orig.minX) * scaleX;
      e.y = newMinY + (item.ry - orig.minY) * scaleY;
      e.width = item.rw * scaleX;
      e.height = item.rh * scaleY;
    }
  }

  // Update room bbox
  if (activeRoom.value) {
    activeRoom.value.bbox = { minX: newMinX, minY: newMinY, maxX: newMaxX, maxY: newMaxY };
    updateRoomDefBbox(activeRoomIndex.value, activeRoom.value.bbox);
  }
};

/**
 * Update room definition bbox in metadata
 */
const updateRoomDefBbox = (roomIndex, bbox) => {
  if (!mapData.value?.metadata?.rooms || !bbox) return;
  if (roomIndex < 0 || roomIndex >= mapData.value.metadata.rooms.length) return;
  mapData.value.metadata.rooms[roomIndex].bbox = { ...bbox };
};

/**
 * Delete a room - removes all non-outer-wall entities
 */
const deleteRoom = (roomId, roomIndex = -1, roomBbox = null) => {
  if (!mapData.value?.entities) return;
  const roomDef = getRoomByIndex(roomIndex);
  const resolvedRoomBbox =
    roomBbox ||
    getEffectiveRoomBbox(roomDef) ||
    getEffectiveRoomBbox(getRoomDefById(roomId)) ||
    computeRoomBbox(roomId);
  const roomEntities = roomIndex >= 0
    ? getRoomEditEntities(roomIndex, { roomBbox: resolvedRoomBbox, includeOuterWalls: false })
    : getRoomEntities(roomId, {
      limitToBbox: true,
      roomBbox: resolvedRoomBbox,
      includeOuterWalls: false,
    });
  const roomSet = new Set(roomEntities);
  mapData.value.entities = mapData.value.entities.filter((e) => !roomSet.has(e));
  // Remove from room defs
  if (mapData.value.metadata?.rooms) {
    if (roomIndex >= 0 && roomIndex < mapData.value.metadata.rooms.length) {
      mapData.value.metadata.rooms.splice(roomIndex, 1);
    } else {
      mapData.value.metadata.rooms = mapData.value.metadata.rooms.filter((r) => r.roomId !== roomId);
    }
  }
  if (
    (roomIndex >= 0 && activeRoomIndex.value === roomIndex) ||
    (roomIndex < 0 && activeRoom.value?.roomId === roomId)
  ) {
    activeRoom.value = null;
    activeRoomIndex.value = -1;
  }
  hasUnsavedChanges.value = true;
  render();
  emitMapChanged();
};

/**
 * Find which room a world point falls in (excluding a specific room)
 */
const findRoomAtWorldPosition = (wx, wy, excludeRoomIndex = -1) => {
  const rooms = getRoomDefs();
  for (const [roomIndex, room] of rooms.entries()) {
    if (roomIndex === excludeRoomIndex) continue;
    const bbox = getEffectiveRoomBbox(room);
    if (!bbox) continue;
    if (wx >= bbox.minX && wx <= bbox.maxX && wy >= bbox.minY && wy <= bbox.maxY) {
      return { room, roomIndex };
    }
  }
  return null;
};

/**
 * Swap two rooms: room A entities go to room B position and vice versa
 */
const swapRooms = (roomIndexA, roomIndexB) => {
  const roomA = getRoomByIndex(roomIndexA);
  const roomB = getRoomByIndex(roomIndexB);
  if (!roomA || !roomB) return;
  const roomIdA = roomA.roomId;
  const roomIdB = roomB.roomId;

  const bboxA = getEffectiveRoomBbox(roomA) || computeRoomBbox(roomIdA);
  const bboxB = getEffectiveRoomBbox(roomB) || computeRoomBbox(roomIdB);
  if (!bboxA || !bboxB) return;

  const entsA = getRoomEditEntities(roomIndexA, {
    roomBbox: bboxA,
    includeOuterWalls: false,
  });
  const entsB = getRoomEditEntities(roomIndexB, {
    roomBbox: bboxB,
    includeOuterWalls: false,
  });

  const centerA = { x: (bboxA.minX + bboxA.maxX) / 2, y: (bboxA.minY + bboxA.maxY) / 2 };
  const centerB = { x: (bboxB.minX + bboxB.maxX) / 2, y: (bboxB.minY + bboxB.maxY) / 2 };

  const offsetAtoB = { x: centerB.x - centerA.x, y: centerB.y - centerA.y };
  const offsetBtoA = { x: centerA.x - centerB.x, y: centerA.y - centerB.y };

  // First, collect original positions
  const aPosns = entsA.map((e) => ({ entity: e, pos: { ...getEntityPosition(e) } }));
  const bPosns = entsB.map((e) => ({ entity: e, pos: { ...getEntityPosition(e) } }));

  // Move A entities to B position
  for (const item of aPosns) {
    moveEntity(item.entity, item.pos, offsetAtoB.x, offsetAtoB.y);
    item.entity.roomId = roomIdB;
  }
  // Move B entities to A position
  for (const item of bPosns) {
    moveEntity(item.entity, item.pos, offsetBtoA.x, offsetBtoA.y);
    item.entity.roomId = roomIdA;
  }

  // Swap room names and bboxes in metadata for these two room slots
  const tempName = roomA.name;
  roomA.name = roomB.name;
  roomB.name = tempName;
  roomA.bbox = { ...bboxB };
  roomB.bbox = { ...bboxA };

  // Update active room
  if (activeRoomIndex.value >= 0) {
    activeRoom.value = getRoomByIndex(activeRoomIndex.value);
  }

  hasUnsavedChanges.value = true;
  render();
  emitMapChanged();
};

// ============================================================================
// KEYBOARD
// ============================================================================
const handleKeyDown = (event) => {
  if ((event.key === 'Delete' || event.key === 'Backspace') && editMode.value && selectedLineEntity.value) {
    event.preventDefault();
    deleteLineEntity(selectedLineEntity.value);
    return;
  }
  if ((event.key === 'Delete' || event.key === 'Backspace') && editMode.value && selectedArcEntity.value) {
    event.preventDefault();
    deleteArcEntity(selectedArcEntity.value);
    return;
  }
  if ((event.key === 'Delete' || event.key === 'Backspace') && editMode.value && activeRoom.value) {
    event.preventDefault();
    deleteRoom(activeRoom.value.roomId, activeRoomIndex.value, activeRoom.value.bbox || null);
  }
  if (event.key === 'Escape') {
    selectedLineEntity.value = null;
    hoveredLineControl.value = null;
    selectedArcEntity.value = null;
    hoveredArcControl.value = null;
    arcResizeState.value = null;
    activeRoom.value = null;
    activeRoomIndex.value = -1;
    selectedEntity.value = null;
    wallResizeState.value = null;
    render();
  }
};

// ============================================================================
// VIEW CONTROLS
// ============================================================================
const zoomIn = () => { zoom.value = Math.min(10, zoom.value * 1.2); render(); };
const zoomOut = () => { zoom.value = Math.max(0.1, zoom.value / 1.2); render(); };
const resetView = () => { zoom.value = 1; centerMap(); render(); };

const toggleEditMode = () => {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    activeRoom.value = null;
    activeRoomIndex.value = -1;
    selectedLineEntity.value = null;
    hoveredLineControl.value = null;
    selectedArcEntity.value = null;
    hoveredArcControl.value = null;
    arcResizeState.value = null;
    selectedEntity.value = null;
    wallResizeState.value = null;
    hoveredIcon.value = null;
  }
  render();
};

const toggleLayer = (layerId) => {
  const layer = mapData.value?.layers?.find((l) => l.id === layerId);
  if (layer) { layer.visible = !layer.visible; render(); }
};

// ============================================================================
// SAVE
// ============================================================================
let emitTimeout = null;
const emitMapChanged = () => {
  if (!mapData.value) return;
  if (emitTimeout) clearTimeout(emitTimeout);
  emitTimeout = setTimeout(() => {
    emit("mapChanged", JSON.parse(JSON.stringify(mapData.value)));
  }, 100);
};

const saveChanges = () => {
  if (!mapData.value) return;
  mapData.value.metadata.updatedAt = new Date().toISOString();
  const saveData = JSON.parse(JSON.stringify(mapData.value));
  emit("save", saveData);
  originalMapData.value = JSON.parse(JSON.stringify(mapData.value));
  hasUnsavedChanges.value = false;
  try { localStorage.setItem("map2home_edited_map", JSON.stringify(saveData)); } catch (e) {}
};

const exportMapJson = () => {
  if (!mapData.value) return;
  const blob = new Blob([JSON.stringify(mapData.value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${mapData.value.metadata?.name || "map"}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(async () => {
  editMode.value = props.initialEditMode;
  await nextTick();
  loadMapData();
  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeyDown);
});

const handleResize = () => { initializeCanvas(); calculateBaseScale(); render(); };

watch(() => props.mapUrl, () => { if (props.mapUrl) loadMapData(); });
watch(() => props.mapData, (next, prev) => {
  if (!next) return;
  if (next === prev) return;
  loadMapData();
});

defineExpose({ saveChanges, exportMapJson, selectEntity: () => {}, deleteRoom, resetView, mapData });
</script>

<style scoped>
.json-map-editor { width: 100%; }
canvas { display: block; }
.json-map-editor * { user-select: none; }
</style>

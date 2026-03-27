/**
 * Validation helpers for JsonMapEditor: setbacks, room sizes, overlap, perimeter lock, ventilation.
 * Coordinates are in map units (feet when metadata.units === 'feet').
 */

export const DEFAULT_SETBACKS_FT = {
  front: 7.5,
  back: 5,
  side: 4
}

/** Minimum room dimensions (ft). Order can be swapped when checking. */
export const ROOM_MIN_FT = {
  bedroom: { w: 10, h: 10 },
  bed: { w: 10, h: 10 },
  living: { w: 12, h: 14 },
  livingroom: { w: 12, h: 14 },
  kitchen: { w: 6, h: 8 },
  bathroom: { w: 4, h: 6 },
  bath: { w: 4, h: 6 },
  washroom: { w: 4, h: 6 },
  toilet: { w: 4, h: 6 },
  default: { w: 4, h: 4 }
}

/** Typical outerRect footprint for marla (pk style rough ft). Used for soft max hints & hard checks. */
export const MARLA_TYPICAL_MAX_FOOTPRINT_FT = {
  3: { w: 22, d: 38 },
  5: { w: 25, d: 45 },
  7: { w: 30, d: 50 },
  10: { w: 35, d: 56 },
  15: { w: 40, d: 62 },
  20: { w: 45, d: 68 }
}

export function getMarlaSoftMaxDims(marla) {
  const m = Number(marla)
  if (!m || !MARLA_TYPICAL_MAX_FOOTPRINT_FT[m]) return null
  const { w, d } = MARLA_TYPICAL_MAX_FOOTPRINT_FT[m]
  return { w, d }
}

export function isValidBounds(b) {
  if (!b) return false
  const { minX, minY, maxX, maxY } = b
  if (![minX, minY, maxX, maxY].every((v) => Number.isFinite(Number(v)))) return false
  return Number(maxX) > Number(minX) && Number(maxY) > Number(minY)
}

/** Intersection area of two axis-aligned rects (0 if disjoint). */
export function boundsIntersectionArea(a, b) {
  if (!isValidBounds(a) || !isValidBounds(b)) return 0
  const ix0 = Math.max(a.minX, b.minX)
  const ix1 = Math.min(a.maxX, b.maxX)
  const iy0 = Math.max(a.minY, b.minY)
  const iy1 = Math.min(a.maxY, b.maxY)
  const w = Math.max(0, ix1 - ix0)
  const h = Math.max(0, iy1 - iy0)
  return w * h
}

export function normalizeRoomTypeKey(raw) {
  if (raw == null || typeof raw !== 'string') return ''
  return raw.trim().toLowerCase().replace(/\s+/g, '')
}

/**
 * Human-readable room type label for constraint messages.
 */
export function getRoomTypeLabel(roomTypeRaw) {
  const key = normalizeRoomTypeKey(roomTypeRaw || '')
  if (!key) return 'Room'
  if (key.includes('bed')) return 'Bedroom'
  if (key.includes('living') || key.includes('lounge') || key.includes('drawing')) return 'Living Room'
  if (key.includes('kitchen') || key.includes('dining')) return 'Kitchen'
  if (key.includes('bath') || key.includes('wash') || key.includes('toilet') || key.includes('wc')) return 'Bathroom'
  if (key.includes('stair')) return 'Stairs'
  if (key.includes('corridor') || key.includes('hallway') || key.includes('passage')) return 'Corridor'
  if (key.includes('garage')) return 'Garage'
  if (key.includes('store')) return 'Store Room'
  if (key.includes('servant')) return 'Servant Quarter'
  if (key.includes('tv')) return 'TV Lounge'
  return 'Room'
}

export function getRoomMinSpec(roomTypeRaw) {
  const key = normalizeRoomTypeKey(roomTypeRaw)
  if (!key) return ROOM_MIN_FT.default
  for (const [k, spec] of Object.entries(ROOM_MIN_FT)) {
    if (k === 'default') continue
    if (key.includes(k) || k.includes(key)) return spec
  }
  if (key.includes('bed')) return ROOM_MIN_FT.bedroom
  if (key.includes('living') || key.includes('lounge') || key.includes('drawing')) return ROOM_MIN_FT.living
  if (key.includes('kitchen') || key.includes('dining')) return ROOM_MIN_FT.kitchen
  if (key.includes('bath') || key.includes('wash') || key.includes('toilet') || key.includes('wc')) {
    return ROOM_MIN_FT.bathroom
  }
  return ROOM_MIN_FT.default
}

/** Both sorted room dimensions must meet sorted spec (allows 12×14 vs 14×12). */
export function roomMeetsMinimumFootprint(width, height, spec) {
  const rw = Math.max(0, Number(width) || 0)
  const rh = Math.max(0, Number(height) || 0)
  const a = Math.min(rw, rh)
  const b = Math.max(rw, rh)
  const s0 = Math.min(spec.w, spec.h)
  const s1 = Math.max(spec.w, spec.h)
  return a >= s0 - 1e-4 && b >= s1 - 1e-4
}

export function isCirculationRoomType(roomTypeRaw) {
  const k = normalizeRoomTypeKey(roomTypeRaw)
  return /stair|stairs|corridor|hallway|lobby|passage/.test(k)
}

/** Plot minus setbacks; defaults to Y-up with maxY = back (common in this editor). */
export function insetPlotBounds(plotBounds, setbacks = DEFAULT_SETBACKS_FT) {
  if (!isValidBounds(plotBounds)) return null
  const f = Number(setbacks.front) || 0
  const bk = Number(setbacks.back) || 0
  const s = Number(setbacks.side) || 0
  const inner = {
    minX: plotBounds.minX + s,
    maxX: plotBounds.maxX - s,
    minY: plotBounds.minY + f,
    maxY: plotBounds.maxY - bk
  }
  if (inner.minX >= inner.maxX || inner.minY >= inner.maxY) return null
  return inner
}

export function rectInsideBounds(rect, bounds) {
  if (!rect || !isValidBounds(bounds)) return true
  return (
    rect.x >= bounds.minX - 1e-4 &&
    rect.y >= bounds.minY - 1e-4 &&
    rect.x + rect.width <= bounds.maxX + 1e-4 &&
    rect.y + rect.height <= bounds.maxY + 1e-4
  )
}

export function axisAlignedRectsOverlap(a, b, margin = 0) {
  if (!a || !b) return false
  return !(
    a.x + a.width <= b.x + margin ||
    b.x + b.width <= a.x + margin ||
    a.y + a.height <= b.y + margin ||
    b.y + b.height <= a.y + margin
  )
}

export function pointInAxisAlignedRect(px, py, r) {
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height
}

export function segmentWithinXBounds(start, end, b, tol) {
  const x0 = Math.min(start.x, end.x)
  const x1 = Math.max(start.x, end.x)
  return x0 >= b.minX - tol && x1 <= b.maxX + tol
}

export function segmentWithinYBounds(start, end, b, tol) {
  const y0 = Math.min(start.y, end.y)
  const y1 = Math.max(start.y, end.y)
  return y0 >= b.minY - tol && y1 <= b.maxY + tol
}

/** DXF/CAD layers that are never structural walls for shell detection. */
export function isLayerExcludedFromWallShell(layerId) {
  if (layerId == null || layerId === '') return false
  const s = String(layerId).toLowerCase()
  return (
    /door|window|glazing|opening|fixture|furniture|equip|anno|dim|text|hatch|defpoints|elev|section|stair/.test(s) ||
    s === 'labels' ||
    s === 'notes' ||
    s === 'hatch' ||
    s === 'stairs' ||
    s === 'stair-up' ||
    s === 'stair-down'
  )
}

/** Lines we use to infer the building bounding box (excludes openings furniture annotations). */
export function isWallCandidateLine(entity) {
  if (!entity || entity.type !== 'line' || !entity.start || !entity.end) return false
  if (entity.properties?.isOpening || entity.properties?.isDoor || entity.properties?.isWindow) return false
  return !isLayerExcludedFromWallShell(entity.layerId)
}

/** Union bbox of all wall-candidate segment endpoints. */
export function computeWallGeometryBounds(entities) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let any = false
  for (const e of entities || []) {
    if (!isWallCandidateLine(e)) continue
    any = true
    const { start, end } = e
    minX = Math.min(minX, start.x, end.x)
    maxX = Math.max(maxX, start.x, end.x)
    minY = Math.min(minY, start.y, end.y)
    maxY = Math.max(maxY, start.y, end.y)
  }
  return any && isValidBounds({ minX, minY, maxX, maxY }) ? { minX, minY, maxX, maxY } : null
}

function expandedLineBBox(line, pad) {
  const x0 = Math.min(line.start.x, line.end.x) - pad
  const x1 = Math.max(line.start.x, line.end.x) + pad
  const y0 = Math.min(line.start.y, line.end.y) - pad
  const y1 = Math.max(line.start.y, line.end.y) + pad
  return { minX: x0, maxX: x1, minY: y0, maxY: y1 }
}

function axesAlignedRectsOverlap2D(a, b) {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY)
}

/** Union of several axis-aligned bounds (for multi-plan sheets). */
export function unionBoundsArray(boundsList) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let any = false
  for (const b of boundsList || []) {
    if (!isValidBounds(b)) continue
    any = true
    minX = Math.min(minX, b.minX)
    minY = Math.min(minY, b.minY)
    maxX = Math.max(maxX, b.maxX)
    maxY = Math.max(maxY, b.maxY)
  }
  return any && isValidBounds({ minX, minY, maxX, maxY }) ? { minX, minY, maxX, maxY } : null
}

function segmentLengthFt(line) {
  if (!line?.start || !line?.end) return 0
  return Math.hypot(line.end.x - line.start.x, line.end.y - line.start.y)
}

function boundsFromLines(grp) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const ln of grp) {
    minX = Math.min(minX, ln.start.x, ln.end.x)
    maxX = Math.max(maxX, ln.start.x, ln.end.x)
    minY = Math.min(minY, ln.start.y, ln.end.y)
    maxY = Math.max(maxY, ln.start.y, ln.end.y)
  }
  const b = { minX, minY, maxX, maxY }
  return isValidBounds(b) ? b : null
}

function distPointToBoundsSq(px, py, b) {
  const x = Math.max(b.minX, Math.min(px, b.maxX))
  const y = Math.max(b.minY, Math.min(py, b.maxY))
  const dx = px - x
  const dy = py - y
  return dx * dx + dy * dy
}

function boundsArea(b) {
  if (!isValidBounds(b)) return Infinity
  return Math.max(0, b.maxX - b.minX) * Math.max(0, b.maxY - b.minY)
}

/**
 * Break a mega-cluster (e.g. linked by a long datum line) into separate floor plans using
 * the largest gap between segment midpoints along the long axis.
 */
function splitOversizedWallCluster(cluster, options) {
  const maxSpan = Number(options.maxSinglePlanSpanFt) > 0 ? options.maxSinglePlanSpanFt : 105
  const minGap = Number(options.minMidpointSeparationFt) > 0 ? options.minMidpointSeparationFt : 20
  const minGroup = Number(options.minLinesAfterSplit) > 0 ? options.minLinesAfterSplit : 5

  function splitRecursive(lines) {
    const b = boundsFromLines(lines)
    if (!b || lines.length < minGroup * 2) return [{ bounds: b, lines }]

    const w = b.maxX - b.minX
    const h = b.maxY - b.minY
    if (w <= maxSpan && h <= maxSpan) return [{ bounds: b, lines }]

    const useX = w >= h
    const coord = (ln) =>
      useX ? (ln.start.x + ln.end.x) / 2 : (ln.start.y + ln.end.y) / 2

    const sorted = [...lines].sort((a, b) => coord(a) - coord(b))
    let bestGap = 0
    let splitAfter = -1
    for (let i = 1; i < sorted.length; i++) {
      const g = coord(sorted[i]) - coord(sorted[i - 1])
      if (g > bestGap) {
        bestGap = g
        splitAfter = i - 1
      }
    }
    if (bestGap < minGap) return [{ bounds: b, lines }]

    const splitVal = (coord(sorted[splitAfter]) + coord(sorted[splitAfter + 1])) / 2
    const left = sorted.filter((ln) => coord(ln) <= splitVal)
    const right = sorted.filter((ln) => coord(ln) > splitVal)
    if (left.length < minGroup || right.length < minGroup) return [{ bounds: b, lines }]

    return [...splitRecursive(left), ...splitRecursive(right)]
  }

  return splitRecursive(cluster.lines)
}

/**
 * Split wall-candidate lines into spatially separated groups (e.g. Ground / 1st / roof on one DXF).
 * Lines whose padded bboxes touch or overlap chain into one cluster.
 *
 * Very long segments (datum / site lines) are excluded from linking so they do not merge separate plans.
 * Over-wide merged clusters are split by midpoint gaps along the long axis.
 */
export function computeWallShellClusters(entities, options = {}) {
  const pad =
    options.connectionPadFt != null && Number(options.connectionPadFt) >= 0
      ? Number(options.connectionPadFt)
      : 4
  const minPerCluster = options.minLinesPerCluster != null ? options.minLinesPerCluster : 1
  const maxLinkLen =
    Number(options.maxLinkSegmentLengthFt) > 0 ? options.maxLinkSegmentLengthFt : 96

  const lines = []
  for (const e of entities || []) {
    if (!isWallCandidateLine(e)) continue
    lines.push(e)
  }
  if (!lines.length) return []

  const linkableIdx = []
  const longLines = []
  for (let i = 0; i < lines.length; i++) {
    if (segmentLengthFt(lines[i]) <= maxLinkLen) linkableIdx.push(i)
    else longLines.push(lines[i])
  }

  if (!linkableIdx.length) {
    return lines.map((ln) => {
      const b = boundsFromLines([ln])
      return b ? { bounds: b, lines: [ln] } : null
    }).filter(Boolean)
  }

  const m = linkableIdx.length
  // For very large line sets the pair-checking loop would overflow the Set and freeze the browser.
  // Fall back to treating all linkable lines as a single cluster — bounds detection still works.
  if (m > 5000) {
    const allLines = linkableIdx.map((li) => lines[li]).concat(longLines)
    const bounds = boundsFromLines(allLines)
    return bounds ? [{ bounds, lines: allLines }] : []
  }
  const parent = Array.from({ length: m }, (_, i) => i)
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  const union = (a, b) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[rb] = ra
  }

  const bboxes = linkableIdx.map((li) => expandedLineBBox(lines[li], pad))
  const cell = Math.max(12, pad * 3)
  const grid = new Map()
  for (let i = 0; i < m; i++) {
    const b = bboxes[i]
    const ix0 = Math.floor(b.minX / cell) - 1
    const ix1 = Math.floor(b.maxX / cell) + 1
    const iy0 = Math.floor(b.minY / cell) - 1
    const iy1 = Math.floor(b.maxY / cell) + 1
    for (let ix = ix0; ix <= ix1; ix++) {
      for (let iy = iy0; iy <= iy1; iy++) {
        const key = `${ix},${iy}`
        if (!grid.has(key)) grid.set(key, [])
        grid.get(key).push(i)
      }
    }
  }

  const seen = new Set()
  for (const bucket of grid.values()) {
    const len = bucket.length
    for (let a = 0; a < len; a++) {
      for (let b = a + 1; b < len; b++) {
        const i = bucket[a]
        const j = bucket[b]
        if (i === j) continue
        const key = i < j ? `${i},${j}` : `${j},${i}`
        if (seen.has(key)) continue
        seen.add(key)
        if (axesAlignedRectsOverlap2D(bboxes[i], bboxes[j])) union(i, j)
      }
    }
  }

  const byRoot = new Map()
  for (let i = 0; i < m; i++) {
    const r = find(i)
    if (!byRoot.has(r)) byRoot.set(r, [])
    byRoot.get(r).push(lines[linkableIdx[i]])
  }

  let clusters = []
  for (const grp of byRoot.values()) {
    if (grp.length < minPerCluster) continue
    const bounds = boundsFromLines(grp)
    if (!bounds) continue
    clusters.push({ bounds, lines: grp })
  }

  const refined = []
  for (const c of clusters) {
    const parts = splitOversizedWallCluster(c, options)
    for (const p of parts) {
      if (p.lines.length >= minPerCluster) refined.push(p)
    }
  }
  if (refined.length) clusters = refined

  for (const ln of longLines) {
    const mx = (ln.start.x + ln.end.x) / 2
    const my = (ln.start.y + ln.end.y) / 2
    let best = -1
    let bestD = Infinity
    for (let k = 0; k < clusters.length; k++) {
      const d = distPointToBoundsSq(mx, my, clusters[k].bounds)
      if (d < bestD) {
        bestD = d
        best = k
      }
    }
    if (best >= 0) {
      clusters[best].lines.push(ln)
      const nb = boundsFromLines(clusters[best].lines)
      if (nb) clusters[best].bounds = nb
    } else {
      const b = boundsFromLines([ln])
      if (b) clusters.push({ bounds: b, lines: [ln] })
    }
  }

  clusters.sort((a, b) => a.bounds.minX - b.bounds.minX || a.bounds.minY - b.bounds.minY)
  return clusters
}

/** When several shells contain a point, prefer the smallest plan (tightest bbox). */
export function pickSmallestShellBoundsContainingPoint(px, py, clusterBoundsList) {
  if (!clusterBoundsList?.length) return null
  let best = null
  let bestArea = Infinity
  for (const b of clusterBoundsList) {
    if (!isValidBounds(b)) continue
    if (px >= b.minX && px <= b.maxX && py >= b.minY && py <= b.maxY) {
      const a = boundsArea(b)
      if (a < bestArea) {
        bestArea = a
        best = b
      }
    }
  }
  return best
}

/**
 * Prefer tight bbox from wall lines (works when layer is not exactly "walls").
 * Fall back to metadata.bounds.
 */
export function resolveShellBoundsForMap(mapData) {
  const wallBox = computeWallGeometryBounds(mapData?.entities)
  if (wallBox) return wallBox
  const b = mapData?.metadata?.bounds
  return isValidBounds(b) ? { ...b } : null
}

export function shellEdgeTolerance(bounds) {
  if (!isValidBounds(bounds)) return 1.5
  const w = bounds.maxX - bounds.minX
  const h = bounds.maxY - bounds.minY
  return Math.max(1.5, 0.012 * Math.max(w, h))
}

function segmentNearlyHorizontal(start, end, bounds) {
  const dx = Math.abs(end.x - start.x)
  const dy = Math.abs(end.y - start.y)
  const span = Math.max(dx, dy, 1e-6)
  const tolRatio = Math.max(0.04, 0.015 * Math.max((bounds.maxX - bounds.minX) / span, 1))
  return dy / span <= tolRatio
}

function segmentNearlyVertical(start, end, bounds) {
  const dx = Math.abs(end.x - start.x)
  const dy = Math.abs(end.y - start.y)
  const span = Math.max(dx, dy, 1e-6)
  const tolRatio = Math.max(0.04, 0.015 * Math.max((bounds.maxY - bounds.minY) / span, 1))
  return dx / span <= tolRatio
}

/**
 * True if this wall segment runs along the building bounding rectangle (outer shell).
 * Tolerates slightly off-axis CAD segments and real-world layer names.
 */
export function isOuterWallSegment(entity, bounds, tolOverride) {
  if (!entity || entity.type !== 'line' || !entity.start || !entity.end || !isValidBounds(bounds)) {
    return false
  }
  if (!isWallCandidateLine(entity)) return false
  const b = bounds
  const tol = tolOverride != null ? tolOverride : shellEdgeTolerance(b)
  const { start, end } = entity

  if (segmentNearlyHorizontal(start, end, b)) {
    const y = (start.y + end.y) / 2
    if (Math.abs(y - b.minY) <= tol && segmentWithinXBounds(start, end, b, tol)) return true
    if (Math.abs(y - b.maxY) <= tol && segmentWithinXBounds(start, end, b, tol)) return true
  }
  if (segmentNearlyVertical(start, end, b)) {
    const x = (start.x + end.x) / 2
    if (Math.abs(x - b.minX) <= tol && segmentWithinYBounds(start, end, b, tol)) return true
    if (Math.abs(x - b.maxX) <= tol && segmentWithinYBounds(start, end, b, tol)) return true
  }
  return false
}

function segmentOverlapsXOnBounds(start, end, b, tol) {
  const x0 = Math.min(start.x, end.x)
  const x1 = Math.max(start.x, end.x)
  return !(x1 < b.minX - tol || x0 > b.maxX + tol)
}

function segmentOverlapsYOnBounds(start, end, b, tol) {
  const y0 = Math.min(start.y, end.y)
  const y1 = Math.max(start.y, end.y)
  return !(y1 < b.minY - tol || y0 > b.maxY + tol)
}

/**
 * Tags short edge runs & thick-wall faces that miss "nearly horizontal/vertical" ratio checks.
 * Both endpoints hug the same bbox side (within tol) and the segment spans that side in projection.
 */
export function isOuterWallSegmentRelaxed(entity, bounds, tolOverride) {
  if (!entity || entity.type !== 'line' || !entity.start || !entity.end || !isValidBounds(bounds)) {
    return false
  }
  if (!isWallCandidateLine(entity)) return false
  const b = bounds
  const base = tolOverride != null ? tolOverride : shellEdgeTolerance(b)
  const tol = base * 2.15
  const { start, end } = entity

  const nearYMin =
    Math.abs(start.y - b.minY) <= tol &&
    Math.abs(end.y - b.minY) <= tol &&
    segmentOverlapsXOnBounds(start, end, b, tol)
  const nearYMax =
    Math.abs(start.y - b.maxY) <= tol &&
    Math.abs(end.y - b.maxY) <= tol &&
    segmentOverlapsXOnBounds(start, end, b, tol)
  if (nearYMin || nearYMax) return true

  const nearXMin =
    Math.abs(start.x - b.minX) <= tol &&
    Math.abs(end.x - b.minX) <= tol &&
    segmentOverlapsYOnBounds(start, end, b, tol)
  const nearXMax =
    Math.abs(start.x - b.maxX) <= tol &&
    Math.abs(end.x - b.maxX) <= tol &&
    segmentOverlapsYOnBounds(start, end, b, tol)
  if (nearXMin || nearXMax) return true

  return false
}

/**
 * Midpoint lies in a strip along one bbox side (thick double walls, parapet, or CAD offset).
 * Uses a looser axis test so short top bars still qualify.
 */
export function isOuterWallSegmentMidpointStrip(entity, bounds, tolOverride) {
  if (!entity || entity.type !== 'line' || !entity.start || !entity.end || !isValidBounds(bounds)) {
    return false
  }
  if (!isWallCandidateLine(entity)) return false
  const b = bounds
  const base = tolOverride != null ? tolOverride : shellEdgeTolerance(b)
  const w = b.maxX - b.minX
  const h = b.maxY - b.minY
  /** Cap distance from bbox side so partitions a few feet inside are not tagged outer. */
  const edgeDistMax = Math.min(
    Math.max(base * 2.5, 0.028 * Math.max(w, h)),
    base * 1.55 + 0.01 * Math.max(w, h)
  )
  const { start, end } = entity
  const dx = Math.abs(end.x - start.x)
  const dy = Math.abs(end.y - start.y)
  const span = Math.max(dx, dy, 1e-9)
  const horiz = dy / span <= 0.12
  const vert = dx / span <= 0.12
  if (horiz && !vert) {
    const yMid = (start.y + end.y) / 2
    const dEdge = Math.min(Math.abs(yMid - b.minY), Math.abs(yMid - b.maxY))
    if (dEdge <= edgeDistMax && segmentOverlapsXOnBounds(start, end, b, edgeDistMax)) return true
  }
  if (vert && !horiz) {
    const xMid = (start.x + end.x) / 2
    const dEdge = Math.min(Math.abs(xMid - b.minX), Math.abs(xMid - b.maxX))
    if (dEdge <= edgeDistMax && segmentOverlapsYOnBounds(start, end, b, edgeDistMax)) return true
  }
  return false
}

export function isOuterCornerPoint(entity, bounds, tolOverride) {
  if (!entity || entity.type !== 'point' || !entity.position || !isValidBounds(bounds)) return false
  if (!entity.properties?.isCorner) return false
  const tol = tolOverride != null ? tolOverride : shellEdgeTolerance(bounds)
  const { x, y } = entity.position
  const xs = [bounds.minX, bounds.maxX]
  const ys = [bounds.minY, bounds.maxY]
  for (const xi of xs) {
    for (const yi of ys) {
      if (Math.abs(x - xi) <= tol && Math.abs(y - yi) <= tol) return true
    }
  }
  return false
}

/** Remove auto-detected outer flags so we can re-tag after edits or multi-shell clustering. */
export function clearAutoOuterBoundaryFlags(mapData) {
  for (const e of mapData?.entities || []) {
    if (!e?.properties?.isOuterBoundary) continue
    const p = { ...e.properties }
    delete p.isOuterBoundary
    if (Object.keys(p).length === 0) delete e.properties
    else e.properties = p
  }
}

/**
 * Mark perimeter wall lines / outer corners so the editor can lock them without relying on ids.
 * @param {object} [options]
 * @param {(entity: object) => boolean} [options.includeEntity] — only consider lines/points passing this filter (multi-plan).
 */
export function annotatePerimeterEntities(mapData, bounds, options = {}) {
  if (!mapData?.entities?.length || !isValidBounds(bounds)) return
  const { includeEntity } = options
  const tol = shellEdgeTolerance(bounds)
  for (const e of mapData.entities) {
    if (includeEntity && !includeEntity(e)) continue
    if (
      e.type === 'line' &&
      isWallCandidateLine(e) &&
      (isOuterWallSegment(e, bounds, tol) ||
        isOuterWallSegmentRelaxed(e, bounds, tol) ||
        isOuterWallSegmentMidpointStrip(e, bounds, tol))
    ) {
      e.properties = { ...(e.properties || {}), isOuterBoundary: true }
    }
    if (e.type === 'point' && isOuterCornerPoint(e, bounds, tol)) {
      e.properties = { ...(e.properties || {}), isOuterBoundary: true }
    }
    const id = (e.id && String(e.id).toLowerCase()) || ''
    if (e.type === 'line' && isWallCandidateLine(e) && /(^|-)outer|perimeter|shell|boundary|foundation/.test(id)) {
      e.properties = { ...(e.properties || {}), isOuterBoundary: true }
    }
  }
}

/** Perimeter lock for each isolated floor plan on one sheet. */
export function annotatePerimeterForShellClusters(mapData, clusters) {
  if (!mapData?.entities?.length || !clusters?.length) return
  clearAutoOuterBoundaryFlags(mapData)
  for (const c of clusters) {
    const lineSet = new Set(c.lines || [])
    const b = c.bounds
    const margin = shellEdgeTolerance(b) * 3
    annotatePerimeterEntities(mapData, b, {
      includeEntity: (e) => {
        if (e.type === 'line' && isWallCandidateLine(e)) return lineSet.has(e)
        if (e.type === 'point' && e.position) {
          const { x, y } = e.position
          return (
            x >= b.minX - margin &&
            x <= b.maxX + margin &&
            y >= b.minY - margin &&
            y <= b.maxY + margin
          )
        }
        return false
      }
    })
  }
}

export function isEntityPerimeterLocked(entity) {
  if (!entity) return false
  if (entity.properties?.isOuterBoundary || entity.properties?.lockedPerimeter) return true
  const id = (entity.id && String(entity.id).toLowerCase()) || ''
  if (entity.type === 'line' && id.includes('outer') && id.includes('wall')) return true
  return false
}

export function collectRoomFootprints(entities) {
  const rooms = []
  for (const e of entities || []) {
    if (e.type !== 'rect') continue
    if (!e.properties?.roomType && !e.properties?.isRoom) continue
    if (Math.abs(e.rotation || 0) > 1e-3) continue
    rooms.push(e)
  }
  return rooms
}

export function collectCirculationFootprints(entities) {
  const xs = []
  for (const e of entities || []) {
    if (e.type !== 'rect') continue
    if (Math.abs(e.rotation || 0) > 1e-3) continue
    const rt = e.properties?.roomType || ''
    if (isCirculationRoomType(rt) || e.properties?.isCirculation || e.properties?.preserveAccess) {
      xs.push(e)
    }
  }
  return xs
}

/** Window segments whose midpoint lies inside room rectangle; total length in ft. */
export function windowOpeningLengthInsideRoom(roomRect, entities) {
  let len = 0
  for (const w of entities || []) {
    if (!w || w.type !== 'line') continue
    if (w.layerId !== 'windows') continue
    if (!w.start || !w.end) continue
    const mx = (w.start.x + w.end.x) / 2
    const my = (w.start.y + w.end.y) / 2
    if (!pointInAxisAlignedRect(mx, my, roomRect)) continue
    len += Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y)
  }
  return len
}

export function roomPassesVentilation(roomRect, entities) {
  const area = Math.max(0, roomRect.width) * Math.max(0, roomRect.height)
  if (area < 1e-6) return { ok: true, detail: 'empty' }
  const hasWindowsLayer = (entities || []).some((e) => e.layerId === 'windows')
  if (!hasWindowsLayer) return { ok: true, detail: 'no-windows-layer' }
  const L = windowOpeningLengthInsideRoom(roomRect, entities)
  if (L < 1e-3) return { ok: false, code: 'no-window', message: 'Each room needs at least one window.' }
  const requiredStrip = Math.max(1.5, Math.sqrt(area) * 0.12)
  if (L + 1e-4 < requiredStrip) {
    return {
      ok: false,
      code: 'window-area',
      message: 'Window opening length in this room is below the ~10% ventilation guideline.'
    }
  }
  return { ok: true, detail: 'ok' }
}

export function validateRoomLayout(entities, innerBounds, options = {}) {
  const rooms = collectRoomFootprints(entities)
  const circulation = collectCirculationFootprints(entities)
  const issues = []

  for (const room of rooms) {
    if (!rectInsideBounds(room, innerBounds)) {
      const label = getRoomTypeLabel(room.properties?.roomType)
      issues.push({
        id: room.id,
        code: 'outside-envelope',
        message: `${label} extends outside the allowed building envelope (plot setbacks).`
      })
    }
  }

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const A = rooms[i]
      const B = rooms[j]
      if (axisAlignedRectsOverlap(A, B, -1e-4)) {
        const lA = getRoomTypeLabel(A.properties?.roomType)
        const lB = getRoomTypeLabel(B.properties?.roomType)
        issues.push({
          code: 'overlap',
          message: `${lA} and ${lB} overlap each other.`,
          a: A.id,
          b: B.id
        })
        return { ok: false, issues }
      }
    }
  }

  for (const room of rooms) {
    const spec = getRoomMinSpec(room.properties?.roomType)
    if (!roomMeetsMinimumFootprint(room.width, room.height, spec)) {
      const label = getRoomTypeLabel(room.properties?.roomType)
      issues.push({
        id: room.id,
        code: 'below-min',
        message: `${label} is below minimum size (${spec.w}×${spec.h} ft required).`,
        spec
      })
    }
  }

  // Marla-based max footprint soft check
  const marla = options.plotMarla != null ? Number(options.plotMarla) : null
  if (marla && MARLA_TYPICAL_MAX_FOOTPRINT_FT[marla]) {
    const maxDims = MARLA_TYPICAL_MAX_FOOTPRINT_FT[marla]
    const plotW = innerBounds.maxX - innerBounds.minX
    const plotD = innerBounds.maxY - innerBounds.minY
    if (plotW > maxDims.w * 1.15 || plotD > maxDims.d * 1.15) {
      issues.push({
        code: 'marla-exceeded',
        message: `Building footprint exceeds typical ${marla} marla plot size (max ~${maxDims.w}×${maxDims.d} ft).`
      })
    }
  }

  for (const room of rooms) {
    const vent = roomPassesVentilation(room, entities)
    if (!vent.ok) {
      issues.push({ id: room.id, code: vent.code, message: vent.message })
    }
  }

  for (const room of rooms) {
    for (const zone of circulation) {
      if (axisAlignedRectsOverlap(room, zone, -1e-4)) {
        const label = getRoomTypeLabel(room.properties?.roomType)
        issues.push({
          code: 'circulation',
          message: `${label} overlaps stairs/circulation area — access path would be blocked.`,
          id: room.id
        })
        return { ok: false, issues }
      }
    }
  }

  return { ok: issues.length === 0, issues }
}

export function validateSingleRoomRect(roomRect, entities, innerBounds) {
  if (!rectInsideBounds(roomRect, innerBounds)) {
    return {
      ok: false,
      issues: [{ code: 'outside-envelope', message: 'Outside allowed envelope (plot setbacks).' }]
    }
  }
  const others = (entities || []).filter(
    (e) =>
      e.type === 'rect' &&
      (e.properties?.roomType || e.properties?.isRoom) &&
      e.id !== roomRect.id &&
      Math.abs(e.rotation || 0) < 1e-3
  )
  for (const o of others) {
    if (axisAlignedRectsOverlap(roomRect, o, -1e-4)) {
      const otherLabel = getRoomTypeLabel(o.properties?.roomType)
      return { ok: false, issues: [{ code: 'overlap', message: `Overlaps ${otherLabel}.` }] }
    }
  }
  const circ = collectCirculationFootprints(entities)
  for (const z of circ) {
    if (axisAlignedRectsOverlap(roomRect, z, -1e-4)) {
      return { ok: false, issues: [{ code: 'circulation', message: `Overlaps stairs/circulation — access path would be blocked.` }] }
    }
  }
  const spec = getRoomMinSpec(roomRect.properties?.roomType)
  if (!roomMeetsMinimumFootprint(roomRect.width, roomRect.height, spec)) {
    const label = getRoomTypeLabel(roomRect.properties?.roomType)
    return {
      ok: false,
      issues: [{
        code: 'below-min',
        message: `${label} is below minimum size (${spec.w}×${spec.h} ft required). Current: ${Math.round(roomRect.width * 10) / 10}×${Math.round(roomRect.height * 10) / 10} ft.`
      }]
    }
  }
  const vent = roomPassesVentilation(roomRect, entities)
  if (!vent.ok) {
    return { ok: false, issues: [{ message: vent.message, code: vent.code }] }
  }
  return { ok: true, issues: [] }
}

/** Strip common MTEXT control codes (alignment stacks, paragraph breaks) for parsing/display. */
export function stripMtextLeaderCodes(text) {
  if (text == null) return ''
  return String(text)
    .replace(/\\A\d+;/gi, '')
    .replace(/\\P/gi, ' ')
    .trim()
}

/**
 * Text before the first W×H dimension token (e.g. "Room" in `Room 11'-4" × 14'-0"`).
 * Skips strings like `Plot Size=30'x45'` where the dimension is not preceded by whitespace.
 */
export function extractRoomLabelPrefix(text) {
  const s = stripMtextLeaderCodes(text)
  const dimRe = /(?:^|\s)(\d[\d'\-\.\u201d\u2033\u0022]*)\s*[x×]\s*(\d[\d'\-\.\u201d\u2033\u0022]*)/i
  const m = s.match(dimRe)
  if (!m || m.index == null) return ''
  return s.slice(0, m.index).trim()
}

/**
 * For axis-aligned floor plans: estimate the axis-aligned cell containing (px, py) by taking the
 * nearest structural wall on each side (horizontal/vertical rays). Use with isWallCandidateLine segments.
 * Returns { minX, minY, maxX, maxY, width, height } in map units, or null if unreliable.
 */
export function inferRoomAxisBoundsFromInteriorPoint(px, py, lines, options = {}) {
  const pad = Number(options.pad) >= 0 ? Number(options.pad) : 0.35
  const maxRay = Number(options.maxRay) > 0 ? Number(options.maxRay) : 85
  if (!Number.isFinite(px) || !Number.isFinite(py) || !Array.isArray(lines)) return null

  let leftX = -Infinity
  let rightX = Infinity
  let bottomY = -Infinity
  let topY = Infinity

  for (const line of lines) {
    if (!line?.start || !line?.end) continue
    const sx = line.start.x
    const sy = line.start.y
    const ex = line.end.x
    const ey = line.end.y
    const dx = Math.abs(ex - sx)
    const dy = Math.abs(ey - sy)
    const span = Math.max(dx, dy) || 1e-9
    const isVert = dx <= span * 0.14
    const isHoriz = dy <= span * 0.14
    if (isVert && !isHoriz) {
      const xWall = (sx + ex) / 2
      const y0 = Math.min(sy, ey) - pad
      const y1 = Math.max(sy, ey) + pad
      if (py < y0 || py > y1) continue
      if (xWall < px && px - xWall <= maxRay) leftX = Math.max(leftX, xWall)
      if (xWall > px && xWall - px <= maxRay) rightX = Math.min(rightX, xWall)
    } else if (isHoriz && !isVert) {
      const yWall = (sy + ey) / 2
      const x0 = Math.min(sx, ex) - pad
      const x1 = Math.max(sx, ex) + pad
      if (px < x0 || px > x1) continue
      if (yWall < py && py - yWall <= maxRay) bottomY = Math.max(bottomY, yWall)
      if (yWall > py && yWall - py <= maxRay) topY = Math.min(topY, yWall)
    }
  }

  if (
    leftX === -Infinity ||
    rightX === Infinity ||
    bottomY === -Infinity ||
    topY === Infinity
  ) {
    return null
  }
  const width = rightX - leftX
  const height = topY - bottomY
  const minDim = 0.35
  const maxDim = maxRay * 2.2
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= minDim ||
    height <= minDim ||
    width > maxDim ||
    height > maxDim
  ) {
    return null
  }

  return {
    minX: leftX,
    maxX: rightX,
    minY: bottomY,
    maxY: topY,
    width,
    height
  }
}
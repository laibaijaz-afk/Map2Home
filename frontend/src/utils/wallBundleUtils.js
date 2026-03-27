/**
 * Thick walls as parallel line pairs — treat as one "wall unit" for move + thickness presets.
 */
import { isWallCandidateLine } from './mapEditorConstraints.js'

const lineLen = (e) => Math.hypot(e.end.x - e.start.x, e.end.y - e.start.y)

const nearlyHorizontal = (e) => {
  const dx = Math.abs(e.end.x - e.start.x)
  const dy = Math.abs(e.end.y - e.start.y)
  const s = Math.max(dx, dy, 1e-6)
  return dy / s < 0.08
}

const nearlyVertical = (e) => {
  const dx = Math.abs(e.end.x - e.start.x)
  const dy = Math.abs(e.end.y - e.start.y)
  const s = Math.max(dx, dy, 1e-6)
  return dx / s < 0.08
}

function intervalOverlap1D(a0, a1, b0, b1) {
  const lo = Math.max(Math.min(a0, a1), Math.min(b0, b1))
  const hi = Math.min(Math.max(a0, a1), Math.max(b0, b1))
  return Math.max(0, hi - lo)
}

/** Projected overlap length for axis-aligned-ish parallel segments. */
export function parallelOverlapAlongWall(a, b) {
  if (nearlyHorizontal(a) && nearlyHorizontal(b)) {
    return intervalOverlap1D(a.start.x, a.end.x, b.start.x, b.end.x)
  }
  if (nearlyVertical(a) && nearlyVertical(b)) {
    return intervalOverlap1D(a.start.y, a.end.y, b.start.y, b.end.y)
  }
  return 0
}

/** Shortest distance between two infinite lines containing the segments (world ft). */
export function parallelLineGapFt(a, b) {
  const ax = a.end.x - a.start.x
  const ay = a.end.y - a.start.y
  const al = Math.hypot(ax, ay)
  if (al < 1e-9) return Infinity
  const nx = -ay / al
  const ny = ax / al
  return Math.abs((b.start.x - a.start.x) * nx + (b.start.y - a.start.y) * ny)
}

export function linesFormThicknessPair(a, b, opts = {}) {
  const minGap = opts.minGapFt ?? 0.03
  const maxGap = opts.maxGapFt ?? 2.0
  const minOverlapRatio = opts.minOverlapRatio ?? 0.42
  if (a === b) return false
  if (!(nearlyHorizontal(a) && nearlyHorizontal(b)) && !(nearlyVertical(a) && nearlyVertical(b))) {
    return false
  }
  const gap = parallelLineGapFt(a, b)
  if (gap < minGap || gap > maxGap) return false
  const ov = parallelOverlapAlongWall(a, b)
  const need = Math.min(lineLen(a), lineLen(b)) * minOverlapRatio
  return ov >= need
}

function ufFind(parent, i) {
  if (parent[i] !== i) parent[i] = ufFind(parent, parent[parent[i]])
  return parent[i]
}

function ufUnion(parent, rank, i, j) {
  let ri = ufFind(parent, i)
  let rj = ufFind(parent, j)
  if (ri === rj) return
  if (rank[ri] < rank[rj]) [ri, rj] = [rj, ri]
  parent[rj] = ri
  if (rank[ri] === rank[rj]) rank[ri]++
}

/**
 * Cluster parallel wall lines into bundles (typical thick wall = 2+ lines).
 * Skips excluded lines (e.g. perimeter-locked).
 */
export function assignWallBundleIds(entities, { isLineExcluded = () => false } = {}) {
  const lines = (entities || []).filter(
    (e) => e.type === 'line' && e.start && e.end && isWallCandidateLine(e) && !isLineExcluded(e)
  )

  for (const e of entities || []) {
    if (e.type !== 'line' || !e.properties) continue
    if (!e.properties.wallBundleId) continue
    const next = { ...e.properties }
    delete next.wallBundleId
    e.properties = Object.keys(next).length ? next : {}
  }

  const n = lines.length
  if (n < 2) return
  // Skip bundle detection for very large maps — prevents Set overflow and browser freeze.
  // Wall bundles are a UI enhancement; correctness is unaffected by skipping them.
  if (n > 5000) return

  const parent = lines.map((_, i) => i)
  const rank = lines.map(() => 0)

  // Spatial grid: only compare nearby lines instead of all pairs.
  // Cell size ~3ft covers the max wall thickness gap (2ft) + margin.
  const CELL = 3
  const grid = new Map()
  for (let i = 0; i < n; i++) {
    const ln = lines[i]
    const x0 = Math.floor(Math.min(ln.start.x, ln.end.x) / CELL) - 1
    const x1 = Math.floor(Math.max(ln.start.x, ln.end.x) / CELL) + 1
    const y0 = Math.floor(Math.min(ln.start.y, ln.end.y) / CELL) - 1
    const y1 = Math.floor(Math.max(ln.start.y, ln.end.y) / CELL) + 1
    for (let gx = x0; gx <= x1; gx++) {
      for (let gy = y0; gy <= y1; gy++) {
        const key = gx * 100003 + gy
        if (!grid.has(key)) grid.set(key, [])
        grid.get(key).push(i)
      }
    }
  }

  const tested = new Set()
  for (const bucket of grid.values()) {
    for (let a = 0; a < bucket.length; a++) {
      for (let b = a + 1; b < bucket.length; b++) {
        const i = bucket[a], j = bucket[b]
        if (i === j) continue
        const pk = i < j ? i * n + j : j * n + i
        if (tested.has(pk)) continue
        tested.add(pk)
        if (linesFormThicknessPair(lines[i], lines[j])) {
          ufUnion(parent, rank, i, j)
        }
      }
    }
  }

  const groups = new Map()
  for (let i = 0; i < n; i++) {
    const r = ufFind(parent, i)
    if (!groups.has(r)) groups.set(r, [])
    groups.get(r).push(lines[i])
  }

  let bid = 1
  for (const [, members] of groups) {
    if (members.length < 2) continue
    const id = `wallbundle_${bid++}`
    for (const m of members) {
      m.properties = { ...(m.properties || {}), wallBundleId: id }
    }
  }
}

export function getWallBundleLines(entities, lineEntity) {
  if (!lineEntity?.properties?.wallBundleId) return [lineEntity].filter(Boolean)
  const id = lineEntity.properties.wallBundleId
  return (entities || []).filter(
    (e) => e.type === 'line' && e.properties?.wallBundleId === id && e.start && e.end
  )
}

/**
 * Reposition exactly two parallel segments to target thickness (ft) about their spine.
 */
export function applyThicknessToParallelPair(lineA, lineB, thicknessFt) {
  const t = Math.max(0.05, Number(thicknessFt) || 0.33)
  const half = t / 2
  let ax = lineA.end.x - lineA.start.x
  let ay = lineA.end.y - lineA.start.y
  const alen = Math.hypot(ax, ay)
  if (alen < 1e-6) return

  let bStart = lineB.start
  let bEnd = lineB.end
  const bx = bEnd.x - bStart.x
  const by = bEnd.y - bStart.y
  if (bx * ax + by * ay < 0) {
    bStart = lineB.end
    bEnd = lineB.start
  }

  const ux = ax / alen
  const uy = ay / alen
  let nx = -uy
  let ny = ux
  const midAx = (lineA.start.x + lineA.end.x) / 2
  const midAy = (lineA.start.y + lineA.end.y) / 2
  const midBx = (bStart.x + bEnd.x) / 2
  const midBy = (bStart.y + bEnd.y) / 2
  if ((midBx - midAx) * nx + (midBy - midAy) * ny < 0) {
    nx = -nx
    ny = -ny
  }

  const cx0 = (lineA.start.x + bStart.x) / 2
  const cy0 = (lineA.start.y + bStart.y) / 2
  const cx1 = (lineA.end.x + bEnd.x) / 2
  const cy1 = (lineA.end.y + bEnd.y) / 2

  lineA.start.x = cx0 + nx * half
  lineA.start.y = cy0 + ny * half
  lineA.end.x = cx1 + nx * half
  lineA.end.y = cy1 + ny * half
  lineB.start.x = cx0 - nx * half
  lineB.start.y = cy0 - ny * half
  lineB.end.x = cx1 - nx * half
  lineB.end.y = cy1 - ny * half
}

export function applyThicknessToBundle(lines, thicknessFt) {
  const xs = (lines || []).filter((e) => e?.type === 'line' && e.start && e.end)
  if (xs.length === 2) {
    applyThicknessToParallelPair(xs[0], xs[1], thicknessFt)
    return true
  }
  return false
}

/**
 * Propagate `isOuterBoundary` to parallel wall faces (typical double-line shell). Only one face may
 * hug the bbox edge in CAD; the inner parallel line stays editable without this pass.
 * maxGapFt kept tight (≤2.0 ft) so only the actual wall thickness pair gets locked,
 * not interior partition walls that happen to be parallel to the outer shell.
 */
export function expandPerimeterLockToParallelWallFaces(entities, options = {}) {
  const maxGap = options.maxGapFt != null ? options.maxGapFt : 2.0
  const minOv = options.minOverlapRatio != null ? options.minOverlapRatio : 0.40
  const list = entities || []
  const wallLines = list.filter(
    (e) => e.type === 'line' && e.start && e.end && isWallCandidateLine(e)
  )
  // Skip O(n²) expansion for very large maps to avoid browser freeze.
  // No entities are removed -- only the perimeter-lock annotation is skipped.
  if (wallLines.length > 2000) return

  let changed = true
  let guard = 0
  while (changed && guard < 10) {
    guard++
    changed = false
    const locked = wallLines.filter((e) => e.properties?.isOuterBoundary)
    const unlocked = wallLines.filter((e) => !e.properties?.isOuterBoundary)
    for (const L of locked) {
      for (const c of unlocked) {
        if (c.properties?.isOuterBoundary) continue
        if (linesFormThicknessPair(L, c, { maxGapFt: maxGap, minOverlapRatio: minOv })) {
          c.properties = { ...(c.properties || {}), isOuterBoundary: true }
          changed = true
        }
      }
    }
  }
}

export const WALL_THICKNESS_PRESETS_IN = [
  { label: '4" (≈0.33 ft)', ft: 4 /12 },
  { label: '6" (½ ft)', ft: 0.5 },
  { label: '9" (¾ ft)', ft: 9 / 12 },
  { label: '13" (≈1.08 ft)', ft: 13 / 12 },
  { label: '1\'-0" (1 ft)', ft: 1 }
]

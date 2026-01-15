/**
 * DXF drawing coordinates are often in inches (US architectural) while Map2Home treats world units as feet.
 * Uses $INSUNITS / $MEASUREMENT when present, otherwise a geometry heuristic on raw extent.
 */

function headerNumber(header, key) {
  const h = header || {}
  const v = h[key]
  if (v == null) return null
  if (typeof v === 'object' && 'x' in v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Rough max axis span from DXF entities (before conversion) for unit heuristics.
 */
export function estimateMaxDrawingDimensionRaw(dxfData) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let any = false

  const bump = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return
    any = true
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  for (const entity of dxfData?.entities || []) {
    const entityType =
      typeof entity.type === 'string' ? entity.type.split(' ')[0].toUpperCase() : String(entity.type).toUpperCase()

    if (entityType === 'LINE') {
      const x1 = entity.start?.x ?? entity.vertices?.[0]?.x
      const y1 = entity.start?.y ?? entity.vertices?.[0]?.y
      const x2 = entity.end?.x ?? entity.vertices?.[1]?.x
      const y2 = entity.end?.y ?? entity.vertices?.[1]?.y
      bump(x1, y1)
      bump(x2, y2)
    } else if (entityType === 'POLYLINE' || entityType === 'LWPOLYLINE') {
      for (const v of entity.vertices || []) bump(v.x, v.y)
    } else if ((entityType === 'CIRCLE' || entityType === 'ARC') && entity.center) {
      const r = entity.radius
      if (Number.isFinite(r)) {
        bump(entity.center.x - r, entity.center.y - r)
        bump(entity.center.x + r, entity.center.y + r)
      }
    } else if (entityType === 'HATCH' && entity.boundary) {
      const boundaries = Array.isArray(entity.boundary) ? entity.boundary : [entity.boundary]
      for (const boundary of boundaries) {
        for (const v of boundary.polyline || []) bump(v.x, v.y)
      }
    } else if (entityType === 'INSERT') {
      const ix = entity.position?.x ?? entity.insertionPoint?.x
      const iy = entity.position?.y ?? entity.insertionPoint?.y
      bump(ix, iy)
    } else if (entityType === 'TEXT' || entityType === 'MTEXT') {
      const x = entity.position?.x || entity.insertionPoint?.x || entity.startPoint?.x
      const y = entity.position?.y || entity.insertionPoint?.y || entity.startPoint?.y
      bump(x, y)
    }
  }

  if (!any || !Number.isFinite(minX)) return null
  return Math.max(maxX - minX, maxY - minY)
}

function scoreFootprintLikeness(spanFt) {
  if (!Number.isFinite(spanFt)) return 1e6
  if (spanFt < 6) return 500 + (6 - spanFt) * 40
  if (spanFt > 600) return 500 + (spanFt - 600) * 0.5
  const target = spanFt < 80 ? 38 : 120
  return Math.abs(spanFt - target)
}

/**
 * When $INSUNITS is missing or unitless, pick scale that maps raw extent to a plausible building size (ft).
 */
function inferScaleFromMaxRawExtent(maxDimRaw) {
  if (maxDimRaw == null || maxDimRaw < 1) {
    return { scale: 1, source: 'HEURISTIC_FALLBACK_FEET', rawUnit: 'foot' }
  }
  const treatAsFeet = maxDimRaw
  const treatAsInchesToFeet = maxDimRaw / 12
  const s0 = scoreFootprintLikeness(treatAsFeet)
  const s1 = scoreFootprintLikeness(treatAsInchesToFeet)
  if (s1 + 12 < s0) {
    return { scale: 1 / 12, source: 'HEURISTIC_ARCH_INCHES', rawUnit: 'inch' }
  }
  return { scale: 1, source: 'HEURISTIC_RAW_AS_FEET', rawUnit: 'foot' }
}

/**
 * @returns {{ scale: number, source: string, rawUnit: string, maxDimRaw?: number }}
 */
export function resolveDxfToFeetScale(dxfData) {
  const header = dxfData?.header || {}
  const ins = headerNumber(header, '$INSUNITS')
  const meas = headerNumber(header, '$MEASUREMENT')

  if (ins === 1) {
    return { scale: 1 / 12, source: 'DXF_INSUNITS_INCHES', rawUnit: 'inch' }
  }
  if (ins === 2) {
    return { scale: 1, source: 'DXF_INSUNITS_FEET', rawUnit: 'foot' }
  }
  if (ins === 3) {
    return { scale: 5280, source: 'DXF_INSUNITS_MILES', rawUnit: 'mile' }
  }
  if (ins === 7) {
    return { scale: 1000 * 3.2808398950131, source: 'DXF_INSUNITS_KILOMETERS', rawUnit: 'km' }
  }
  if (ins === 8) {
    return { scale: 1 / (12 * 1e6), source: 'DXF_INSUNITS_MICROINCHES', rawUnit: 'microinch' }
  }
  if (ins === 4) {
    return { scale: 0.0032808398950131, source: 'DXF_INSUNITS_MM', rawUnit: 'mm' }
  }
  if (ins === 5) {
    return { scale: 0.032808398950131, source: 'DXF_INSUNITS_CM', rawUnit: 'cm' }
  }
  if (ins === 6) {
    return { scale: 3.2808398950131, source: 'DXF_INSUNITS_METERS', rawUnit: 'm' }
  }
  if (ins === 10) {
    return { scale: 3, source: 'DXF_INSUNITS_YARDS', rawUnit: 'yard' }
  }

  const maxDim = estimateMaxDrawingDimensionRaw(dxfData)
  const inferred = inferScaleFromMaxRawExtent(maxDim)
  if (maxDim != null) inferred.maxDimRaw = maxDim

  if (ins === 0 || ins == null) {
    if (meas === 1) {
      return {
        scale: 0.0032808398950131,
        source: 'DXF_MEASUREMENT_METRIC_DEFAULT_MM',
        rawUnit: 'mm',
        maxDimRaw: maxDim
      }
    }
    return inferred
  }

  return inferred
}

/**
 * Multiply all map coordinates so world space is in feet. Safe to call once at DXF import.
 */
export function applyLinearScaleToJsonMap(jsonData, scale) {
  if (!jsonData?.entities || !Number.isFinite(scale) || Math.abs(scale - 1) < 1e-15) return

  const s = scale
  for (const e of jsonData.entities) {
    switch (e.type) {
      case 'line':
        if (e.start) {
          e.start.x *= s
          e.start.y *= s
        }
        if (e.end) {
          e.end.x *= s
          e.end.y *= s
        }
        break
      case 'arc':
        if (e.center) {
          e.center.x *= s
          e.center.y *= s
        }
        if (e.radius != null) e.radius *= s
        break
      case 'text':
        if (e.position) {
          e.position.x *= s
          e.position.y *= s
        }
        if (e.fontSize != null) e.fontSize *= s
        break
      case 'rect':
        e.x *= s
        e.y *= s
        e.width *= s
        e.height *= s
        break
      case 'point':
        if (e.position) {
          e.position.x *= s
          e.position.y *= s
        }
        if (e.radius != null) e.radius *= s
        break
      case 'polyline':
        for (const p of e.points || []) {
          p.x *= s
          p.y *= s
        }
        break
      default:
        break
    }
  }

  const b = jsonData.metadata?.bounds
  if (b && [b.minX, b.minY, b.maxX, b.maxY].every((v) => Number.isFinite(Number(v)))) {
    b.minX *= s
    b.minY *= s
    b.maxX *= s
    b.maxY *= s
  }

  const pb = jsonData.metadata?.plotBounds
  if (pb && [pb.minX, pb.minY, pb.maxX, pb.maxY].every((v) => Number.isFinite(Number(v)))) {
    pb.minX *= s
    pb.minY *= s
    pb.maxX *= s
    pb.maxY *= s
  }
}

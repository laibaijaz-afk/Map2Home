/**
 * Shared construction cost model (same rules as CostEstimation.vue).
 * Returns structured totals for dashboard embedding and the full calculator page.
 */

export const GREY_RATES = { economy: 2800, standard: 3000, luxury: 3500 }
export const FINISHING_RATES = { economy: 2000, standard: 2500, luxury: 3500 }

const GREY_BREAKDOWN = [
  { name: 'Foundation & RCC', percent: 28 },
  { name: 'Brick Work', percent: 11 },
  { name: 'Steel Reinforcement', percent: 11 },
  { name: 'Cement & Concrete', percent: 9 },
  { name: 'Plaster', percent: 6 },
  { name: 'Plumbing & Conduits', percent: 4 },
  { name: 'Waterproofing & Roof', percent: 5 },
  { name: 'Labor & Misc', percent: 26 }
]

const FINISHING_BREAKDOWN = [
  { name: 'Flooring & Tiles', percent: 12 },
  { name: 'Woodwork & Doors', percent: 15 },
  { name: 'Kitchen Work', percent: 8 },
  { name: 'Paint & Ceilings', percent: 7 },
  { name: 'Electrical Fixtures', percent: 7 },
  { name: 'Bathroom Fittings', percent: 8 },
  { name: 'Windows & Glass', percent: 5 },
  { name: 'Labor & Misc', percent: 38 }
]

const FLOOR_AREA_FACTOR = 100
const EXTRA_LENGTH_PER_FIXTURE = 10

export const MIN_AREA_SQ_FEET = 544.5
export const MAX_AREA_SQ_FEET = 5445
export const MARLA_SIZE_SQ_FEET = 270

/**
 * @param {object} input
 * @param {number} input.plotLength
 * @param {number} input.plotWidth
 * @param {string} input.location
 * @param {string} [input.constructionType]
 * @param {number} [input.floors]
 * @param {string} [input.quality]
 * @param {object} [input.rooms]
 * @param {number} [input.lawnPercent]  - 0-50, percentage of ground floor left as lawn (unbuilt)
 */
export function computeConstructionEstimate (input) {
  const {
    plotLength,
    plotWidth,
    location,
    constructionType = 'grey',
    floors = 1,
    quality = 'standard',
    rooms = {},
    lawnPercent = 0
  } = input

  const pl = Number(plotLength)
  const pw = Number(plotWidth)

  if (!pl || pl <= 0 || !pw || pw <= 0) {
    return { ok: false, code: 'dimensions', message: 'Plot length and width are required.' }
  }
  if (!location) {
    return { ok: false, code: 'location', message: 'City/location is required.' }
  }
  if (!floors || floors < 1) {
    return { ok: false, code: 'floors', message: 'Number of floors is required.' }
  }
  if (!quality || !GREY_RATES[quality]) {
    return { ok: false, code: 'quality', message: 'Construction quality is required.' }
  }

  const totalPlotArea = pl * pw
  if (totalPlotArea < MIN_AREA_SQ_FEET) {
    return {
      ok: false,
      code: 'min_area',
      message: `Plot must be at least 2 marla (${MIN_AREA_SQ_FEET} sq ft). Current: ${totalPlotArea.toFixed(2)} sq ft.`
    }
  }
  if (totalPlotArea > MAX_AREA_SQ_FEET) {
    return {
      ok: false,
      code: 'max_area',
      message: `Plot must be at most 20 marla (${MAX_AREA_SQ_FEET} sq ft). Current: ${totalPlotArea.toFixed(2)} sq ft.`
    }
  }

  const bedrooms = rooms.bedrooms || 0
  const bathrooms = rooms.bathrooms || 0
  const kitchens = rooms.kitchen || 0
  const drawingRooms = rooms.drawingRoom || 0
  const diningRooms = rooms.diningRoom || 0
  const garage = rooms.garage || 0

  // Lawn reduces only the ground floor covered area (lawn is unbuilt open space)
  const lawnFraction = Math.min(Math.max(Number(lawnPercent) || 0, 0), 50) / 100
  const lawnArea = totalPlotArea * lawnFraction
  const groundFloorArea = totalPlotArea * (1 - lawnFraction)
  const upperFloorsArea = totalPlotArea * (floors - 1)   // upper floors cover full plot
  const coveredArea = groundFloorArea + upperFloorsArea

  const greyRate = GREY_RATES[quality]
  const greyCost = coveredArea * greyRate
  const greyBreakdown = GREY_BREAKDOWN.map(item => ({
    name: item.name,
    percent: item.percent,
    amount: Math.round(greyCost * item.percent / 100)
  }))

  const isComplete = constructionType === 'complete'
  const finishingRate = FINISHING_RATES[quality]
  const finishingCost = isComplete ? coveredArea * finishingRate : 0
  const finishingBreakdown = isComplete
    ? FINISHING_BREAKDOWN.map(item => ({
        name: item.name,
        percent: item.percent,
        amount: Math.round(finishingCost * item.percent / 100)
      }))
    : []

  const totalCost = greyCost + finishingCost

  const A = coveredArea
  const materials = [
    { name: 'Kassu (Soil Filling)', qty: Math.round(A * 4), unit: 'cft' },
    { name: 'Cement', qty: Math.round(A * 0.45), unit: 'bags' },
    { name: 'Steel', qty: Math.round(A * 4.2), unit: 'kg' },
    { name: 'Bricks', qty: Math.round(A * 25), unit: 'pcs' },
    { name: 'Crush', qty: Math.round(A * 0.9), unit: 'cft' }
  ]

  const LP = (bedrooms * 2) + (bathrooms * 1) + (kitchens * 1) + (drawingRooms * 2) + (diningRooms * 2) + (garage * 1)
  const SW = LP + (bedrooms + bathrooms + kitchens + drawingRooms + diningRooms + garage)
  const SO = (bedrooms * 2) + (drawingRooms * 2) + (diningRooms * 2) + (kitchens * 2) + (bathrooms * 1)
  const wireLighting = LP * 35
  const wireSockets = SO * 40
  const wireTotal = wireLighting + wireSockets
  const ceilingFans = (bedrooms * 1) + (drawingRooms * 1) + (diningRooms * 1) + (kitchens * 1)
  const distributionBoards = floors

  const electrical = [
    { name: 'Light Points (LP)', qty: LP, unit: 'points' },
    { name: 'Switches (SW)', qty: SW, unit: 'pcs' },
    { name: 'Sockets (SO)', qty: SO, unit: 'pcs' },
    { name: 'Wire (Lighting)', qty: wireLighting, unit: 'ft' },
    { name: 'Wire (Sockets)', qty: wireSockets, unit: 'ft' },
    { name: 'Wire (Total)', qty: wireTotal, unit: 'ft' },
    { name: 'Ceiling Fans', qty: ceilingFans, unit: 'pcs' },
    { name: 'Distribution Boards', qty: distributionBoards, unit: 'pcs' }
  ]

  const TO = bathrooms * 1
  const WB = (bathrooms * 1) + (kitchens * 1)
  const SH = bathrooms * 1
  const KO = (kitchens * 1) + (garage * 1)
  const pipeLength = (floors * FLOOR_AREA_FACTOR) + (EXTRA_LENGTH_PER_FIXTURE * (TO + WB + SH + KO))

  const plumbing = [
    { name: 'Toilets', qty: TO, unit: 'pcs' },
    { name: 'Wash Basins', qty: WB, unit: 'pcs' },
    { name: 'Showers', qty: SH, unit: 'pcs' },
    { name: 'Kitchen Outlets', qty: KO, unit: 'pcs' },
    { name: 'Pipe Length', qty: pipeLength, unit: 'ft' }
  ]

  const result = {
    totalPlotArea,
    lawnArea,
    lawnPercent: lawnFraction * 100,
    groundFloorArea,
    upperFloorsArea,
    coveredArea,
    greyRate,
    greyCost,
    greyBreakdown,
    finishingRate: isComplete ? finishingRate : 0,
    finishingCost,
    finishingBreakdown,
    totalCost,
    materials,
    electrical,
    plumbing
  }

  return { ok: true, result }
}

export function formatEstimateCurrency (value) {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(value)
}

const pool = require('../config/database');

// Pakistan-specific construction rates (in PKR per sq meter) - Updated 2025
// 
// BASE CONSTRUCTION COST includes:
// 1. Foundation work (excavation, PCC, RCC foundation)
// 2. Structural work (columns, beams, slabs, staircases)
// 3. Brickwork (walls, partitions)
// 4. Roof structure (RCC roof slab)
// 5. Basic site preparation and leveling
// 6. Overheads and contractor profit (10-15%)
//
// Note: Base cost already includes materials and labor for structural work.
// Material breakdown shows individual material quantities for transparency.
// Labor cost is shown separately for structural labor.

// Grey Structure Rates (basic structure only)
const GREY_STRUCTURE_RATES = {
  economy: {
    baseCostPerSqm: 8500,       // Rs 8,500 per sqm (Rs 790 per sqft) - Includes foundation, structure, walls, roof
    materialCostPerSqm: 5500,   // Rs 5,500 per sqm - Material portion of base cost
    laborCostPerSqm: 3000       // Rs 3,000 per sqm - Labor portion of base cost
  },
  standard: {
    baseCostPerSqm: 10500,      // Rs 10,500 per sqm (Rs 975 per sqft) - Includes foundation, structure, walls, roof
    materialCostPerSqm: 6800,   // Rs 6,800 per sqm - Material portion of base cost
    laborCostPerSqm: 3700       // Rs 3,700 per sqm - Labor portion of base cost
  },
  luxury: {
    baseCostPerSqm: 12500,      // Rs 12,500 per sqm (Rs 1,160 per sqft) - Includes foundation, structure, walls, roof
    materialCostPerSqm: 8000,   // Rs 8,000 per sqm - Material portion of base cost
    laborCostPerSqm: 4500       // Rs 4,500 per sqm - Labor portion of base cost
  }
};

// Complete House Rates (with finishing)
const COMPLETE_HOUSE_RATES = {
  economy: {
    baseCostPerSqm: 13000,      // Rs 13,000 per sqm (Rs 1,208 per sqft) - Includes foundation, structure, walls, roof, basic finishing
    materialCostPerSqm: 8500,   // Rs 8,500 per sqm - Material portion of base cost
    laborCostPerSqm: 4500      // Rs 4,500 per sqm - Labor portion of base cost
  },
  standard: {
    baseCostPerSqm: 16000,      // Rs 16,000 per sqm (Rs 1,486 per sqft) - Includes foundation, structure, walls, roof, standard finishing
    materialCostPerSqm: 10500,  // Rs 10,500 per sqm - Material portion of base cost
    laborCostPerSqm: 5500       // Rs 5,500 per sqm - Labor portion of base cost
  },
  luxury: {
    baseCostPerSqm: 20000,      // Rs 20,000 per sqm (Rs 1,858 per sqft) - Includes foundation, structure, walls, roof, premium finishing
    materialCostPerSqm: 13000,  // Rs 13,000 per sqm - Material portion of base cost
    laborCostPerSqm: 7000       // Rs 7,000 per sqm - Labor portion of base cost
  }
};

// Location multipliers (cost varies by city)
const LOCATION_MULTIPLIERS = {
  karachi: 1.0,
  lahore: 1.05,
  islamabad: 1.15,
  rawalpindi: 1.08,
  faisalabad: 0.95,
  multan: 0.92,
  peshawar: 0.98,
  quetta: 0.90,
  other: 1.0
};

// Basement cost multipliers
const BASEMENT_MULTIPLIERS = {
  no: 0,
  partial: 0.3,  // 30% of ground floor cost
  full: 0.5       // 50% of ground floor cost
};

// Feature prices based on quality (Pakistan market rates 2025 - Updated with accurate prices)
const FEATURE_PRICES = {
  economy: {
    electrical: { pricePerPoint: 1500, pointsPerSqm: 0.15 },  // Rs 1,500 per point, ~0.15 points per sqm
    plumbing: { pricePerFixture: 12000, fixturesPerSqm: 0.08 }, // Rs 12,000 per fixture, ~0.08 fixtures per sqm
    hvac: { pricePerTon: 85000, tonsPerSqm: 0.015 },          // Rs 85,000 per ton, ~0.015 tons per sqm (1.5 ton per 100 sqm)
    tiles: { pricePerSqm: 200 },                               // Rs 200 per sqm (ceramic tiles)
    paint: { pricePerSqm: 30 },                                // Rs 30 per sqm (wall area, not floor)
    glass: { pricePerSqft: 250 },                              // Rs 250 per sqft (plain glass, cheap)
    landscaping: { pricePerSqm: 100 },                         // Rs 100 per sqm
    boundaryWall: { pricePerMeter: 2500 },                     // Rs 2,500 per meter (brick with plaster)
    gate: { price: 100000 }                                    // Rs 100,000 fixed
  },
  standard: {
    electrical: { pricePerPoint: 1800, pointsPerSqm: 0.18 },  // Rs 1,800 per point
    plumbing: { pricePerFixture: 15000, fixturesPerSqm: 0.10 }, // Rs 15,000 per fixture
    hvac: { pricePerTon: 95000, tonsPerSqm: 0.015 },          // Rs 95,000 per ton
    tiles: { pricePerSqm: 300 },                               // Rs 300 per sqm (better quality tiles)
    paint: { pricePerSqm: 35 },                                // Rs 35 per sqm
    glass: { pricePerSqft: 350 },                              // Rs 350 per sqft (standard glass)
    landscaping: { pricePerSqm: 150 },                         // Rs 150 per sqm
    boundaryWall: { pricePerMeter: 3000 },                     // Rs 3,000 per meter
    gate: { price: 130000 }                                    // Rs 130,000 fixed
  },
  luxury: {
    electrical: { pricePerPoint: 2500, pointsPerSqm: 0.25 },  // Rs 2,500 per point (premium fixtures)
    plumbing: { pricePerFixture: 20000, fixturesPerSqm: 0.12 }, // Rs 20,000 per fixture (premium)
    hvac: { pricePerTon: 120000, tonsPerSqm: 0.020 },         // Rs 120,000 per ton (premium AC)
    tiles: { pricePerSqm: 500 },                               // Rs 500 per sqm (premium tiles)
    paint: { pricePerSqm: 45 },                                // Rs 45 per sqm (premium paint)
    glass: { pricePerSqft: 500 },                               // Rs 500 per sqft (premium glass)
    landscaping: { pricePerSqm: 250 },                         // Rs 250 per sqm
    boundaryWall: { pricePerMeter: 4000 },                     // Rs 4,000 per meter (decorative)
    gate: { price: 180000 }                                    // Rs 180,000 fixed
  }
};

// Additional features costs (as percentage of base cost) - kept for backward compatibility
const FEATURE_COSTS = {
  electrical: 0.08,        // 8% of base cost
  plumbing: 0.10,          // 10% of base cost
  hvac: 0.15,              // 15% of base cost
  tiles: 0.12,             // 12% of base cost
  paint: 0.05,             // 5% of base cost
  landscaping: 0.08,       // 8% of base cost
  boundaryWall: 0.06,      // 6% of base cost
  gate: 0.02               // 2% of base cost
};

// Fallback material prices in PKR (used if database prices are not available)
// Updated December 2025 - Based on costzone.org market rates
const FALLBACK_MATERIAL_PRICES = {
  cement: { price: 1235, unit: 'bag' },           // Rs 1,235 per bag (50kg) - Average of Maple Leaf 1220-1250 range
  sand: { price: 7000, unit: 'truck' },          // Rs 7,000 per truck (700 cu ft) - ~Rs 10 per cu ft
  bricks: { price: 17, unit: 'piece' },          // Rs 17 per brick - average of 15-20
  steel: { price: 250000, unit: 'ton' },         // Rs 250,000 per ton - average of 230,000-270,000
  gravel: { price: 8000, unit: 'truck' },        // Rs 8,000 per truck (700 cu ft) - ~Rs 11 per cu ft
  tiles: { price: 400, unit: 'sqm' },            // Rs 400 per sqm (standard tiles)
  paint: { price: 2200, unit: 'liter' },        // Rs 2,200 per liter
  wood: { price: 1000, unit: 'sqft' },          // Rs 1,000 per sqft
  electricalWire: { price: 300, unit: 'meter' }, // Rs 300 per meter
  plumbingPipe: { price: 450, unit: 'meter' },   // Rs 450 per meter
  glass: { price: 700, unit: 'sqft' },          // Rs 700 per sqft
  aluminum: { price: 400, unit: 'kg' },         // Rs 400 per kg
  tilesPremium: { price: 1000, unit: 'sqm' }    // Rs 1,000 per sqm (premium tiles)
};

// Material name mapping for database lookup
// These should match the DB_MATERIAL_NAMES from costzoneScraper.js
const MATERIAL_NAME_MAPPING = {
  cement: ['Cement', 'cement'],
  steel: ['Steel', 'steel', 'Sariya', 'Reinforcement Steel'],
  bricks: ['Bricks', 'Brick', 'bricks'],
  sand: ['Sand', 'sand', 'Rait'],
  gravel: ['Gravel', 'gravel', 'Crush', 'Stone'],
  tiles: ['Tiles', 'Tile', 'tiles'],
  paint: ['Paint', 'paint'],
  aluminum: ['Aluminum', 'Aluminium', 'aluminum'],
  glass: ['Glass', 'glass'],
  electricalWire: ['Electrical Wire', 'Wire', 'Cable', 'Electric Wire', 'Electric Cable'],
  plumbingPipe: ['Plumbing Pipe', 'Pipe', 'PPRC Pipe', 'PVC Pipe'],
  tilesPremium: ['Premium Tiles', 'Premium Tile']
};

// Get material prices from database or use fallback
const getMaterialPrices = async () => {
  const pool = require('../config/database');
  const materialPrices = { ...FALLBACK_MATERIAL_PRICES };
  
  try {
    const connection = await pool.getConnection();
    
    // Check if last_scraped_at column exists
    let hasLastScrapedAt = false;
    try {
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'materials' 
        AND COLUMN_NAME = 'last_scraped_at'
      `);
      hasLastScrapedAt = columns.length > 0;
    } catch (err) {
      console.warn('[CostController] Could not check for last_scraped_at column:', err.message);
    }
    
    // Get materials ordered by most recently updated to ensure we use latest scraped prices
    const query = hasLastScrapedAt
      ? `SELECT name, cost_per_unit, unit, updated_at, last_scraped_at,
         COALESCE(last_scraped_at, updated_at) as last_updated
         FROM materials 
         WHERE is_active = TRUE 
         ORDER BY COALESCE(last_scraped_at, updated_at) DESC`
      : `SELECT name, cost_per_unit, unit, updated_at, updated_at as last_updated
         FROM materials 
         WHERE is_active = TRUE 
         ORDER BY updated_at DESC`;
    
    const [materials] = await connection.query(query);
    
    connection.release();
    
    console.log('[CostController] ===== FETCHING MATERIAL PRICES =====');
    console.log(`[CostController] Fetched ${materials.length} active materials from database`);
    
    // Log all materials from database for debugging
    console.log('[CostController] All materials from database:');
    for (const material of materials) {
      console.log(`  - ${material.name}: Rs ${material.cost_per_unit}/${material.unit} (updated: ${material.last_updated || material.updated_at})`);
    }
    
    // Specifically check Cement price
    const cementMaterial = materials.find(m => m.name.toLowerCase().trim() === 'cement');
    if (cementMaterial) {
      console.log(`[CostController] ⚠ CEMENT FOUND IN DB: Rs ${cementMaterial.cost_per_unit}/${cementMaterial.unit}`);
    } else {
      console.log(`[CostController] ⚠ CEMENT NOT FOUND IN DATABASE - will use fallback`);
    }
    
    // Map database materials to our material keys
    // First try exact match (case-insensitive), then try partial match
    for (const material of materials) {
      const materialNameLower = material.name.toLowerCase().trim();
      let matched = false;
      
      for (const [key, names] of Object.entries(MATERIAL_NAME_MAPPING)) {
        // Try exact match first (most reliable)
        if (names.some(name => name.toLowerCase().trim() === materialNameLower)) {
          const dbPrice = parseFloat(material.cost_per_unit);
          const oldPrice = materialPrices[key]?.price;
          materialPrices[key] = {
            price: dbPrice,
            unit: material.unit || FALLBACK_MATERIAL_PRICES[key]?.unit || 'unit'
          };
          console.log(`[CostController] ✓ EXACT MATCH: "${material.name}" → "${key}"`);
          console.log(`[CostController]   Price updated: Rs ${oldPrice || 'N/A'} → Rs ${dbPrice}/${materialPrices[key].unit}`);
          matched = true;
          break;
        }
      }
      
      // If no exact match, try partial match
      if (!matched) {
        for (const [key, names] of Object.entries(MATERIAL_NAME_MAPPING)) {
          if (names.some(name => {
            const nameLower = name.toLowerCase().trim();
            return materialNameLower.includes(nameLower) || nameLower.includes(materialNameLower);
          })) {
            const dbPrice = parseFloat(material.cost_per_unit);
            const oldPrice = materialPrices[key]?.price;
            materialPrices[key] = {
              price: dbPrice,
              unit: material.unit || FALLBACK_MATERIAL_PRICES[key]?.unit || 'unit'
            };
            console.log(`[CostController] ✓ PARTIAL MATCH: "${material.name}" → "${key}"`);
            console.log(`[CostController]   Price updated: Rs ${oldPrice || 'N/A'} → Rs ${dbPrice}/${materialPrices[key].unit}`);
            break;
          }
        }
      }
    }
    
    // Log which materials are using scraped prices vs fallback
    console.log('[CostController] ===== MATERIAL PRICES SUMMARY =====');
    for (const [key, priceData] of Object.entries(materialPrices)) {
      const matchedMaterial = materials.find(m => {
        const materialNameLower = m.name.toLowerCase().trim();
        return MATERIAL_NAME_MAPPING[key]?.some(name => 
          name.toLowerCase().trim() === materialNameLower ||
          materialNameLower.includes(name.toLowerCase().trim()) ||
          name.toLowerCase().trim().includes(materialNameLower)
        );
      });
      
      if (matchedMaterial) {
        const lastUpdated = matchedMaterial.last_updated || matchedMaterial.updated_at || 'unknown';
        console.log(`  ✓ ${key}: Rs ${priceData.price}/${priceData.unit} (from DB - last updated: ${lastUpdated})`);
      } else {
        console.log(`  ✗ ${key}: Rs ${priceData.price}/${priceData.unit} (FALLBACK - not found in DB)`);
      }
    }
    console.log('[CostController] ====================================');
    
  } catch (error) {
    console.error('[CostController] Error fetching material prices from database:', error.message);
    console.error('[CostController] Stack:', error.stack);
    // Use fallback prices if database fetch fails
  }
  
  return materialPrices;
};

// Material consumption rates per sqm of construction (Pakistan standards - Updated)
const MATERIAL_CONSUMPTION = {
  economy: {
    cement: 5.5,        // bags per sqm (reduced from 6.5)
    sand: 0.04,        // trucks per sqm (reduced)
    bricks: 50,        // bricks per sqm (reduced from 55)
    steel: 0.030,      // tons per sqm (reduced from 0.035)
    gravel: 0.025,     // trucks per sqm (reduced)
    tiles: 0.75,       // sqm per sqm (75% coverage)
    paint: 0.12,       // liters per sqm (reduced)
    electricalWire: 6, // meters per sqm (reduced)
    plumbingPipe: 2.5, // meters per sqm (reduced)
    glass: 0.08,       // sqft per sqm (reduced)
    aluminum: 0.4      // kg per sqm (reduced)
  },
  standard: {
    cement: 6.5,       // bags per sqm (reduced from 7.5)
    sand: 0.05,        // trucks per sqm (reduced)
    bricks: 55,        // bricks per sqm (reduced from 60)
    steel: 0.038,      // tons per sqm (reduced from 0.045)
    gravel: 0.030,     // trucks per sqm (reduced)
    tiles: 0.85,       // sqm per sqm (85% coverage)
    paint: 0.15,       // liters per sqm (reduced)
    electricalWire: 8, // meters per sqm (reduced)
    plumbingPipe: 3,   // meters per sqm (reduced)
    glass: 0.12,       // sqft per sqm (reduced)
    aluminum: 0.6      // kg per sqm (reduced)
  },
  luxury: {
    cement: 7.5,       // bags per sqm (reduced from 9)
    sand: 0.06,        // trucks per sqm (reduced)
    bricks: 65,        // bricks per sqm (reduced from 70)
    steel: 0.045,      // tons per sqm (reduced from 0.055)
    gravel: 0.035,     // trucks per sqm (reduced)
    tiles: 1.0,        // sqm per sqm (100% coverage)
    paint: 0.20,       // liters per sqm (reduced)
    electricalWire: 10, // meters per sqm (reduced)
    plumbingPipe: 4,   // meters per sqm (reduced)
    glass: 0.15,       // sqft per sqm (reduced)
    aluminum: 0.8      // kg per sqm (reduced)
  }
};

// Calculate material breakdown
const calculateMaterialBreakdown = async (coveredAreaSqm, floors, quality, features, location, constructionType = 'complete') => {
  const consumption = MATERIAL_CONSUMPTION[quality] || MATERIAL_CONSUMPTION.standard;
  const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;
  const totalArea = coveredAreaSqm * floors;
  const isGreyStructure = constructionType === 'grey';
  
  // Get material prices from database (fresh fetch to ensure latest scraped prices)
  console.log(`[CostController.calculateMaterialBreakdown] Fetching latest material prices for ${quality} quality, ${floors} floors, ${coveredAreaSqm.toFixed(2)} sqm`);
  const MATERIAL_PRICES = await getMaterialPrices();
  console.log(`[CostController.calculateMaterialBreakdown] Using prices: Cement=Rs ${MATERIAL_PRICES.cement.price}, Steel=Rs ${MATERIAL_PRICES.steel.price}, Bricks=Rs ${MATERIAL_PRICES.bricks.price}`);
  
  const materials = [];
  let totalMaterialCost = 0;

  // Cement - Use scraped price directly (no location multiplier for materials)
  const cementQty = totalArea * consumption.cement;
  const cementPrice = MATERIAL_PRICES.cement.price; // No location multiplier - materials are Pakistan-wide prices
  const cementTotal = cementQty * cementPrice;
  console.log(`[CostController] ===== CEMENT PRICE BREAKDOWN =====`);
  console.log(`[CostController] Scraped price from DB: Rs ${MATERIAL_PRICES.cement.price}`);
  console.log(`[CostController] Unit price (no location multiplier): Rs ${cementPrice}`);
  console.log(`[CostController] Quantity: ${cementQty.toFixed(2)} ${MATERIAL_PRICES.cement.unit}`);
  console.log(`[CostController] Total cost: Rs ${cementTotal.toFixed(2)}`);
  console.log(`[CostController] ====================================`);
  materials.push({
    name: 'Cement',
    quantity: Math.ceil(cementQty),
    unit: MATERIAL_PRICES.cement.unit,
    unitPrice: Math.round(cementPrice),
    totalPrice: Math.round(cementTotal)
  });
  totalMaterialCost += cementTotal;

  // Sand - Use scraped price directly
  const sandQty = totalArea * consumption.sand;
  const sandPrice = MATERIAL_PRICES.sand.price; // No location multiplier
  const sandTotal = sandQty * sandPrice;
  materials.push({
    name: 'Sand',
    quantity: Math.ceil(sandQty * 10) / 10, // Round to 1 decimal
    unit: MATERIAL_PRICES.sand.unit,
    unitPrice: Math.round(sandPrice),
    totalPrice: Math.round(sandTotal)
  });
  totalMaterialCost += sandTotal;

  // Bricks - Use scraped price directly
  const bricksQty = totalArea * consumption.bricks;
  const bricksPrice = MATERIAL_PRICES.bricks.price; // No location multiplier
  const bricksTotal = bricksQty * bricksPrice;
  materials.push({
    name: 'Bricks',
    quantity: Math.ceil(bricksQty),
    unit: MATERIAL_PRICES.bricks.unit,
    unitPrice: Math.round(bricksPrice),
    totalPrice: Math.round(bricksTotal)
  });
  totalMaterialCost += bricksTotal;

  // Steel - Use scraped price directly
  const steelQty = totalArea * consumption.steel;
  const steelPrice = MATERIAL_PRICES.steel.price; // No location multiplier
  const steelTotal = steelQty * steelPrice;
  materials.push({
    name: 'Steel (Reinforcement)',
    quantity: Math.ceil(steelQty * 100) / 100, // Round to 2 decimals
    unit: MATERIAL_PRICES.steel.unit,
    unitPrice: Math.round(steelPrice),
    totalPrice: Math.round(steelTotal)
  });
  totalMaterialCost += steelTotal;

  // Gravel - Use scraped price directly
  const gravelQty = totalArea * consumption.gravel;
  const gravelPrice = MATERIAL_PRICES.gravel.price; // No location multiplier
  const gravelTotal = gravelQty * gravelPrice;
  materials.push({
    name: 'Gravel/Stone',
    quantity: Math.ceil(gravelQty * 10) / 10,
    unit: MATERIAL_PRICES.gravel.unit,
    unitPrice: Math.round(gravelPrice),
    totalPrice: Math.round(gravelTotal)
  });
  totalMaterialCost += gravelTotal;

  // Finishing materials (only for complete house) - Use scraped prices directly
  if (!isGreyStructure) {
    // Tiles (if premium tiles feature is selected, use premium price)
    const tilesQty = totalArea * consumption.tiles;
    const tilesPrice = features?.tiles ? MATERIAL_PRICES.tilesPremium.price : MATERIAL_PRICES.tiles.price; // No location multiplier
    const tilesTotal = tilesQty * tilesPrice;
    materials.push({
      name: features?.tiles ? 'Premium Tiles' : 'Standard Tiles',
      quantity: Math.ceil(tilesQty * 10) / 10,
      unit: MATERIAL_PRICES.tiles.unit,
      unitPrice: Math.round(tilesPrice),
      totalPrice: Math.round(tilesTotal)
    });
    totalMaterialCost += tilesTotal;

    // Paint (if paint feature is selected)
    if (features?.paint) {
      const paintQty = totalArea * consumption.paint;
      const paintPrice = MATERIAL_PRICES.paint.price; // No location multiplier
      const paintTotal = paintQty * paintPrice;
      materials.push({
        name: 'Premium Paint',
        quantity: Math.ceil(paintQty * 10) / 10,
        unit: MATERIAL_PRICES.paint.unit,
        unitPrice: Math.round(paintPrice),
        totalPrice: Math.round(paintTotal)
      });
      totalMaterialCost += paintTotal;
    }

    // Glass
    const glassQty = totalArea * consumption.glass;
    const glassPrice = MATERIAL_PRICES.glass.price; // No location multiplier
    const glassTotal = glassQty * glassPrice;
    materials.push({
      name: 'Glass',
      quantity: Math.ceil(glassQty * 10) / 10,
      unit: MATERIAL_PRICES.glass.unit,
      unitPrice: Math.round(glassPrice),
      totalPrice: Math.round(glassTotal)
    });
    totalMaterialCost += glassTotal;

    // Aluminum (for windows/doors)
    const aluminumQty = totalArea * consumption.aluminum;
    const aluminumPrice = MATERIAL_PRICES.aluminum.price; // No location multiplier
    const aluminumTotal = aluminumQty * aluminumPrice;
    materials.push({
      name: 'Aluminum (Windows/Doors)',
      quantity: Math.ceil(aluminumQty * 10) / 10,
      unit: MATERIAL_PRICES.aluminum.unit,
      unitPrice: Math.round(aluminumPrice),
      totalPrice: Math.round(aluminumTotal)
    });
    totalMaterialCost += aluminumTotal;
  }

  // Electrical Wire (if electrical feature is selected - available for both)
  if (features?.electrical) {
    const wireQty = totalArea * consumption.electricalWire;
    const wirePrice = MATERIAL_PRICES.electricalWire.price; // No location multiplier
    const wireTotal = wireQty * wirePrice;
    materials.push({
      name: 'Electrical Wire',
      quantity: Math.ceil(wireQty),
      unit: MATERIAL_PRICES.electricalWire.unit,
      unitPrice: Math.round(wirePrice),
      totalPrice: Math.round(wireTotal)
    });
    totalMaterialCost += wireTotal;
  }

  // Plumbing Pipes (if plumbing feature is selected - available for both)
  if (features?.plumbing) {
    const pipeQty = totalArea * consumption.plumbingPipe;
    const pipePrice = MATERIAL_PRICES.plumbingPipe.price; // No location multiplier
    const pipeTotal = pipeQty * pipePrice;
    materials.push({
      name: 'Plumbing Pipes',
      quantity: Math.ceil(pipeQty),
      unit: MATERIAL_PRICES.plumbingPipe.unit,
      unitPrice: Math.round(pipePrice),
      totalPrice: Math.round(pipeTotal)
    });
    totalMaterialCost += pipeTotal;
  }

  return {
    materials: materials,
    totalMaterialCost: Math.round(totalMaterialCost)
  };
};

// Calculate feature breakdown with individual prices based on actual dimensions
// For grey structure, return empty breakdown (no additional features)
// For complete house, only include selected features
const calculateFeatureBreakdown = (coveredAreaSqm, plotLength, plotWidth, floors, quality, features, location, constructionType = 'complete') => {
  const featurePrices = FEATURE_PRICES[quality] || FEATURE_PRICES.standard;
  const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;
  const isGreyStructure = constructionType === 'grey';
  
  // For grey structure, don't show any feature breakdown
  if (isGreyStructure) {
    return {
      features: [],
      totalFeatureCost: 0
    };
  }
  
  const featureBreakdown = [];
  let totalFeatureCost = 0;

  // Calculate plot perimeter for boundary wall and gate
  const plotPerimeter = (plotLength + plotWidth) * 2; // in feet
  const plotPerimeterMeters = plotPerimeter * 0.3048; // convert to meters

  // Calculate wall area for paint (approximately 2.5x floor area for interior + exterior)
  const wallAreaSqm = coveredAreaSqm * floors * 2.5; // Total wall area including all floors

  // Electrical System - Calculate based on points (switches, sockets, lights)
  if (features?.electrical) {
    const electricalPoints = Math.ceil(coveredAreaSqm * floors * featurePrices.electrical.pointsPerSqm);
    const electricalPricePerPoint = featurePrices.electrical.pricePerPoint * locationMultiplier;
    const electricalTotal = electricalPoints * electricalPricePerPoint;
    featureBreakdown.push({
      name: 'Complete Electrical System',
      description: `Wiring, switches, sockets, lights (${electricalPoints} points)`,
      quantity: electricalPoints,
      unit: 'points',
      unitPrice: Math.round(electricalPricePerPoint),
      totalPrice: Math.round(electricalTotal)
    });
    totalFeatureCost += electricalTotal;
  }

  // Plumbing System - Calculate based on fixtures (taps, showers, commodes)
  if (features?.plumbing) {
    const plumbingFixtures = Math.ceil(coveredAreaSqm * floors * featurePrices.plumbing.fixturesPerSqm);
    const plumbingPricePerFixture = featurePrices.plumbing.pricePerFixture * locationMultiplier;
    const plumbingTotal = plumbingFixtures * plumbingPricePerFixture;
    featureBreakdown.push({
      name: 'Complete Plumbing System',
      description: `Pipes, fittings, fixtures, water supply (${plumbingFixtures} fixtures)`,
      quantity: plumbingFixtures,
      unit: 'fixtures',
      unitPrice: Math.round(plumbingPricePerFixture),
      totalPrice: Math.round(plumbingTotal)
    });
    totalFeatureCost += plumbingTotal;
  }

  // HVAC System - Calculate based on tonnage needed
  if (!isGreyStructure && features?.hvac) {
    const hvacTons = Math.ceil(coveredAreaSqm * floors * featurePrices.hvac.tonsPerSqm * 10) / 10; // Round to 1 decimal
    const hvacPricePerTon = featurePrices.hvac.pricePerTon * locationMultiplier;
    const hvacTotal = hvacTons * hvacPricePerTon;
    featureBreakdown.push({
      name: 'HVAC System',
      description: `Air conditioning units (${hvacTons.toFixed(1)} tons total)`,
      quantity: hvacTons.toFixed(1),
      unit: 'tons',
      unitPrice: Math.round(hvacPricePerTon),
      totalPrice: Math.round(hvacTotal)
    });
    totalFeatureCost += hvacTotal;
  }

  // Tiles/Flooring - Calculate based on floor area (typically 90% coverage)
  if (!isGreyStructure && features?.tiles) {
    const tilesArea = coveredAreaSqm * floors * 0.9; // 90% of floor area
    const tilesPricePerSqm = featurePrices.tiles.pricePerSqm * locationMultiplier;
    const tilesTotal = tilesArea * tilesPricePerSqm;
    featureBreakdown.push({
      name: 'Tiles/Flooring',
      description: `Floor and wall tiles (${tilesArea.toFixed(2)} sqm coverage)`,
      quantity: tilesArea.toFixed(2),
      unit: 'sqm',
      unitPrice: Math.round(tilesPricePerSqm),
      totalPrice: Math.round(tilesTotal)
    });
    totalFeatureCost += tilesTotal;
  }

  // Paint & Finishing - Calculate based on wall area (not floor area)
  if (!isGreyStructure && features?.paint) {
    const paintPricePerSqm = featurePrices.paint.pricePerSqm * locationMultiplier;
    const paintTotal = wallAreaSqm * paintPricePerSqm;
    featureBreakdown.push({
      name: 'Paint & Finishing',
      description: `Interior and exterior paint (${wallAreaSqm.toFixed(2)} sqm wall area)`,
      quantity: wallAreaSqm.toFixed(2),
      unit: 'sqm',
      unitPrice: Math.round(paintPricePerSqm),
      totalPrice: Math.round(paintTotal)
    });
    totalFeatureCost += paintTotal;
  }

  // Glass/Windows - Calculate based on window area (typically 15-20% of wall area)
  if (!isGreyStructure && features?.glass) {
    const glassAreaSqft = (wallAreaSqm * 0.15) * 10.764; // 15% of wall area, convert to sqft
    const glassPricePerSqft = featurePrices.glass.pricePerSqft * locationMultiplier;
    const glassTotal = glassAreaSqft * glassPricePerSqft;
    featureBreakdown.push({
      name: 'Glass/Windows',
      description: `Window glass and frames (${glassAreaSqft.toFixed(2)} sqft)`,
      quantity: glassAreaSqft.toFixed(2),
      unit: 'sqft',
      unitPrice: Math.round(glassPricePerSqft),
      totalPrice: Math.round(glassTotal)
    });
    totalFeatureCost += glassTotal;
  }

  // Landscaping - Calculate based on plot area (not covered area)
  if (!isGreyStructure && features?.landscaping) {
    const plotAreaSqm = (plotLength * plotWidth) * 0.092903; // Convert sqft to sqm
    const openAreaSqm = plotAreaSqm - coveredAreaSqm; // Open area for landscaping
    const landscapingPricePerSqm = featurePrices.landscaping.pricePerSqm * locationMultiplier;
    const landscapingTotal = openAreaSqm * landscapingPricePerSqm;
    featureBreakdown.push({
      name: 'Landscaping & Garden',
      description: `Garden design, plants, lawn (${openAreaSqm.toFixed(2)} sqm)`,
      quantity: openAreaSqm.toFixed(2),
      unit: 'sqm',
      unitPrice: Math.round(landscapingPricePerSqm),
      totalPrice: Math.round(landscapingTotal)
    });
    totalFeatureCost += landscapingTotal;
  }

  // Boundary Wall
  if (features?.boundaryWall) {
    const wallPricePerMeter = featurePrices.boundaryWall.pricePerMeter * locationMultiplier;
    const wallTotal = plotPerimeterMeters * wallPricePerMeter;
    featureBreakdown.push({
      name: 'Boundary Wall',
      description: `Brick wall with plaster (${plotPerimeterMeters.toFixed(2)} meters perimeter)`,
      quantity: plotPerimeterMeters.toFixed(2),
      unit: 'meter',
      unitPrice: Math.round(wallPricePerMeter),
      totalPrice: Math.round(wallTotal)
    });
    totalFeatureCost += wallTotal;
  }

  // Main Gate
  if (features?.gate) {
    const gatePrice = featurePrices.gate.price * locationMultiplier;
    featureBreakdown.push({
      name: 'Main Gate',
      description: `${quality.charAt(0).toUpperCase() + quality.slice(1)} quality main entrance gate`,
      quantity: 1,
      unit: 'piece',
      unitPrice: Math.round(gatePrice),
      totalPrice: Math.round(gatePrice)
    });
    totalFeatureCost += gatePrice;
  }

  return {
    features: featureBreakdown,
    totalFeatureCost: Math.round(totalFeatureCost)
  };
};

// Room-based adjustments (additional cost per room type) - Updated to realistic Pakistan rates
const ROOM_COSTS = {
  bedroom: 30000,          // Rs 30,000 per bedroom (fittings & fixtures)
  bathroom: 50000,         // Rs 50,000 per bathroom (sanitary fittings)
  kitchen: 80000,          // Rs 80,000 per kitchen (basic fittings)
  drawingRoom: 40000,      // Rs 40,000 per drawing room
  diningRoom: 25000,       // Rs 25,000 per dining room
  storeRoom: 15000,        // Rs 15,000 per store room
  garage: 40000,          // Rs 40,000 per car garage
  servantQuarter: 60000    // Rs 60,000 per servant quarter
};

// Get default cost data
const getDefaultData = async (req, res, next) => {
  try {
    const defaultData = {
      cities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Other'],
      constructionQualities: ['Economy', 'Standard', 'Luxury'],
      basementOptions: ['No Basement', 'Partial Basement', 'Full Basement'],
      floors: [1, 2, 3, 4, 5],
      greyStructureRates: GREY_STRUCTURE_RATES,
      completeHouseRates: COMPLETE_HOUSE_RATES,
      locationMultipliers: LOCATION_MULTIPLIERS
    };

    res.json({
      success: true,
      data: defaultData
    });
  } catch (error) {
    next(error);
  }
};

// Calculate cost estimate
const calculateCostEstimate = async (req, res, next) => {
  try {
    const {
      plotLength,
      plotWidth,
      plotAreaSqm,
      coveredAreaSqm,
      location,
      constructionType,
      floors,
      quality,
      coveredAreaPercent,
      basement,
      rooms,
      features
    } = req.body;

    // Detailed validation with specific error messages
    const missingFields = [];
    
    // Convert to numbers for validation
    const plotLengthNum = parseFloat(plotLength);
    const plotWidthNum = parseFloat(plotWidth);
    const floorsNum = parseInt(floors);
    const coveredAreaSqmNum = parseFloat(coveredAreaSqm);
    
    if (!plotLength || isNaN(plotLengthNum) || plotLengthNum <= 0) {
      missingFields.push('Plot Length (in feet)');
    }
    if (!plotWidth || isNaN(plotWidthNum) || plotWidthNum <= 0) {
      missingFields.push('Plot Width (in feet)');
    }
    if (!location || (typeof location === 'string' && location.trim() === '') || location === '') {
      missingFields.push('City/Location');
    }
    if (!floors || isNaN(floorsNum) || floorsNum < 1) {
      missingFields.push('Number of Floors');
    }
    if (!quality || !['economy', 'standard', 'luxury'].includes(quality)) {
      missingFields.push('Construction Quality');
    }
    if (!coveredAreaSqm || isNaN(coveredAreaSqmNum) || coveredAreaSqmNum <= 0) {
      missingFields.push('Covered Area (calculated from plot dimensions)');
    }
    
    if (missingFields.length > 0) {
      // Log the received data for debugging
      console.log('Validation failed. Received data:', {
        plotLength,
        plotWidth,
        location,
        floors,
        quality,
        coveredAreaSqm,
        plotLengthNum,
        plotWidthNum,
        floorsNum,
        coveredAreaSqmNum
      });
      
      return res.status(400).json({ 
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields,
        received: {
          plotLength: plotLength,
          plotWidth: plotWidth,
          location: location,
          floors: floors,
          quality: quality,
          coveredAreaSqm: coveredAreaSqm
        }
      });
    }

    // Get base rates based on quality and construction type
    const isGreyStructure = constructionType === 'grey';
    const rates = isGreyStructure 
      ? (GREY_STRUCTURE_RATES[quality] || GREY_STRUCTURE_RATES.standard)
      : (COMPLETE_HOUSE_RATES[quality] || COMPLETE_HOUSE_RATES.standard);
    const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;

    // Calculate base construction cost
    // Base cost includes: Foundation, Structure (columns/beams/slabs), Walls, Roof, Site prep, Overheads
    // Formula: Covered Area (sqm) × Base Rate per sqm × Number of Floors × Location Multiplier
    let baseCost = coveredAreaSqm * rates.baseCostPerSqm * floors * locationMultiplier;

    // Add basement cost if applicable
    if (basement !== 'no') {
      const basementMultiplier = BASEMENT_MULTIPLIERS[basement] || 0;
      const basementArea = coveredAreaSqm * basementMultiplier;
      baseCost += basementArea * rates.baseCostPerSqm * locationMultiplier;
    }

    // Calculate material cost
    let materialCost = coveredAreaSqm * rates.materialCostPerSqm * floors * locationMultiplier;
    
    // Add basement material cost
    if (basement !== 'no') {
      const basementMultiplier = BASEMENT_MULTIPLIERS[basement] || 0;
      const basementArea = coveredAreaSqm * basementMultiplier;
      materialCost += basementArea * rates.materialCostPerSqm * locationMultiplier;
    }

    // Calculate labor cost
    let laborCost = coveredAreaSqm * rates.laborCostPerSqm * floors * locationMultiplier;
    
    // Add basement labor cost
    if (basement !== 'no') {
      const basementMultiplier = BASEMENT_MULTIPLIERS[basement] || 0;
      const basementArea = coveredAreaSqm * basementMultiplier;
      laborCost += basementArea * rates.laborCostPerSqm * locationMultiplier;
    }

    // Calculate machinery rental cost (mixer, crane, excavator, etc.)
    // Typically 3-5% of base construction cost
    const machineryRentalCost = baseCost * 0.04 * locationMultiplier; // 4% of base cost

    // Add room-based costs
    let roomCost = 0;
    if (rooms) {
      roomCost += (rooms.bedrooms || 0) * ROOM_COSTS.bedroom;
      roomCost += (rooms.bathrooms || 0) * ROOM_COSTS.bathroom;
      roomCost += (rooms.kitchen || 0) * ROOM_COSTS.kitchen;
      roomCost += (rooms.drawingRoom || 0) * ROOM_COSTS.drawingRoom;
      roomCost += (rooms.diningRoom || 0) * ROOM_COSTS.diningRoom;
      roomCost += (rooms.storeRoom || 0) * ROOM_COSTS.storeRoom;
      roomCost += (rooms.garage || 0) * ROOM_COSTS.garage;
      roomCost += (rooms.servantQuarter || 0) * ROOM_COSTS.servantQuarter;
    }

    // Calculate feature breakdown with detailed pricing
    const featureBreakdown = calculateFeatureBreakdown(
      coveredAreaSqm,
      plotLengthNum,
      plotWidthNum,
      floorsNum,
      quality,
      features,
      location,
      constructionType || 'complete'
    );
    
    const featuresCost = featureBreakdown.totalFeatureCost;

    // Calculate material breakdown (uses scraped prices from database)
    console.log('[CostController] ===== CALCULATING MATERIAL BREAKDOWN =====');
    console.log('[CostController] Using current scraped prices from database...');
    const materialBreakdown = await calculateMaterialBreakdown(
      coveredAreaSqm,
      floorsNum,
      quality,
      features,
      location,
      constructionType || 'complete'
    );
    console.log('[CostController] Material breakdown calculated successfully');
    console.log(`[CostController] Total material cost: Rs ${materialBreakdown.totalMaterialCost.toLocaleString()}`);
    console.log(`[CostController] Number of materials: ${materialBreakdown.materials.length}`);
    console.log('[CostController] ===========================================');

    // Calculate total material cost from breakdown
    const totalMaterialCostFromBreakdown = materialBreakdown.totalMaterialCost;

    // Calculate total cost
    // Note: Base construction cost is not added separately as it overlaps with material and labor costs
    // Base construction includes materials + labor + overheads, which are already accounted for in material breakdown and labor cost
    // We add a small overhead percentage (5%) to account for contractor profit and site management
    const overheadCost = (totalMaterialCostFromBreakdown + laborCost) * 0.05;
    const totalCost = totalMaterialCostFromBreakdown + laborCost + machineryRentalCost + roomCost + featuresCost + overheadCost;
    const costPerSqm = totalCost / coveredAreaSqm;

    res.json({
      success: true,
      estimate: {
        plotAreaSqm: parseFloat(plotAreaSqm),
        coveredAreaSqm: parseFloat(coveredAreaSqm),
        baseCost: Math.round(baseCost), // Kept for reference but not used in total calculation
        materialCost: Math.round(totalMaterialCostFromBreakdown),
        laborCost: Math.round(laborCost),
        machineryRentalCost: Math.round(machineryRentalCost),
        overheadCost: Math.round(overheadCost), // Contractor profit and site management (5% of materials + labor)
        roomCost: Math.round(roomCost),
        featuresCost: Math.round(featuresCost),
        totalCost: Math.round(totalCost),
        costPerSqm: Math.round(costPerSqm),
        location: location,
        quality: quality,
        floors: floors,
        constructionType: constructionType || 'complete',
        materialBreakdown: materialBreakdown.materials,
        materialBreakdownTotal: materialBreakdown.totalMaterialCost,
        featureBreakdown: featureBreakdown.features,
        featureBreakdownTotal: featureBreakdown.totalFeatureCost
      }
    });
  } catch (error) {
    next(error);
  }
};

// Save cost estimation
const saveCostEstimate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      plotLength,
      plotWidth,
      plotAreaSqm,
      coveredAreaSqm,
      location,
      floors,
      quality,
      basement,
      rooms,
      features,
      totalCost
    } = req.body;

    // Validation
    if (!plotAreaSqm || !totalCost) {
      return res.status(400).json({ message: 'Plot area and total cost are required' });
    }

    const connection = await pool.getConnection();

    // Create table if it doesn't exist with updated schema
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cost_estimates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plot_length DECIMAL(10, 2),
        plot_width DECIMAL(10, 2),
        plot_area_sqm DECIMAL(10, 2),
        covered_area_sqm DECIMAL(10, 2),
        location VARCHAR(50),
        floors INT,
        quality VARCHAR(50),
        basement VARCHAR(50),
        rooms JSON,
        features JSON,
        total_cost DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Save estimate
    const [result] = await connection.query(
      `INSERT INTO cost_estimates 
       (user_id, plot_length, plot_width, plot_area_sqm, covered_area_sqm, location, floors, quality, basement, rooms, features, total_cost) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        plotLength,
        plotWidth,
        plotAreaSqm,
        coveredAreaSqm,
        location,
        floors,
        quality,
        basement,
        JSON.stringify(rooms),
        JSON.stringify(features),
        totalCost
      ]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Cost estimate saved successfully',
      estimateId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// Get user's cost estimates
const getUserEstimates = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();

    // Ensure table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cost_estimates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plot_length DECIMAL(10, 2),
        plot_width DECIMAL(10, 2),
        plot_area_sqm DECIMAL(10, 2),
        covered_area_sqm DECIMAL(10, 2),
        location VARCHAR(50),
        floors INT,
        quality VARCHAR(50),
        basement VARCHAR(50),
        rooms JSON,
        features JSON,
        total_cost DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    const [estimates] = await connection.query(
      'SELECT * FROM cost_estimates WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    connection.release();

    res.json({
      success: true,
      estimates: estimates || []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDefaultData,
  saveCostEstimate,
  calculateCostEstimate,
  getUserEstimates
};

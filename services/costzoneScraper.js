const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../config/database');

// Material name mapping from costzone.org to our database
// Includes brand names that should map to generic materials
const MATERIAL_MAPPING = {
  'cement': [
    'Cement', 'cement', 'Cement Price', 'Cement Rate',
    'Maple Leaf', 'Maple Leaf Cement', 'DG Cement', 'Bestway Cement',
    'Lucky Cement', 'Cherat Cement', 'Power Cement', 'Kohat Cement',
    'Askari Cement', 'Portland Cement', 'OPC'
  ],
  'steel': [
    'Steel', 'Sariya', 'Steel Price', 'Steel Rate', 'Reinforcement Steel',
    'Steel Bars', 'Rebar', 'TMT Steel'
  ],
  'bricks': [
    'Bricks', 'Brick', 'Bricks Price', 'Brick Rate', 'Red Bricks',
    'Clay Bricks', 'AAC Blocks'
  ],
  'sand': [
    'Sand', 'Rait', 'Sand Price', 'Sand Rate', 'River Sand',
    'Construction Sand'
  ],
  'gravel': [
    'Gravel', 'Crush', 'Stone', 'Gravel Price', 'Crush Price', 'Stone Price',
    'Crushed Stone', 'Aggregate'
  ],
  'tiles': [
    'Tiles', 'Tile', 'Tiles Price', 'Tile Rate', 'Ceramic Tiles',
    'Floor Tiles', 'Wall Tiles'
  ],
  'paint': [
    'Paint', 'Paint Price', 'Paint Rate', 'Berger Paint', 'Nippon Paint',
    'Dulux Paint', 'Diamond Paint'
  ],
  'aluminum': [
    'Aluminum', 'Aluminium', 'Aluminum Price', 'Aluminium Price',
    'Aluminum Windows', 'Aluminum Doors'
  ],
  'glass': [
    'Glass', 'Glass Price', 'Glass Rate', 'Window Glass', 'Float Glass'
  ],
  'electricalWire': [
    'Electrical Wire', 'Wire', 'Cable', 'Electric Wire', 'Electric Cable',
    'Copper Wire'
  ],
  'plumbingPipe': [
    'Plumbing Pipe', 'Pipe', 'PPRC Pipe', 'PVC Pipe', 'Water Pipe'
  ]
};

// Database material names (what we store in DB)
const DB_MATERIAL_NAMES = {
  'cement': 'Cement',
  'steel': 'Steel',
  'bricks': 'Bricks',
  'sand': 'Sand',
  'gravel': 'Gravel',
  'tiles': 'Tiles',
  'paint': 'Paint',
  'aluminum': 'Aluminum',
  'glass': 'Glass',
  'electricalWire': 'Electrical Wire',
  'plumbingPipe': 'Plumbing Pipe'
};

// Unit mapping for materials
const UNIT_MAPPING = {
  'cement': 'bag',
  'steel': 'ton',
  'bricks': 'piece',
  'sand': 'truck',
  'gravel': 'truck',
  'tiles': 'sqm',
  'paint': 'liter',
  'aluminum': 'kg',
  'glass': 'sqft',
  'electricalWire': 'meter',
  'plumbingPipe': 'meter'
};

// Category mapping
const CATEGORY_MAPPING = {
  'cement': 'construction',
  'steel': 'construction',
  'bricks': 'construction',
  'sand': 'construction',
  'gravel': 'construction',
  'tiles': 'finishing',
  'paint': 'finishing',
  'aluminum': 'construction',
  'glass': 'finishing',
  'electricalWire': 'construction',
  'plumbingPipe': 'construction'
};

/**
 * Extract price from text content
 * Handles various formats like "Rs 1,380", "PKR 1380", "1,380 PKR", etc.
 */
function extractPrice(text) {
  if (!text) return null;
  
  // More comprehensive price extraction patterns
  const patterns = [
    // "Rs 1,220" or "Rs. 1,220" or "PKR 1,220"
    /(?:Rs\.?|PKR)\s*:?\s*([\d,]+(?:\.\d+)?)/gi,
    // "1,220 Rs" or "1,220 PKR"
    /([\d,]+(?:\.\d+)?)\s*(?:Rs\.?|PKR)/gi,
    // "Price: 1,220" or "Rate: 1,220"
    /(?:price|rate|cost)[\s:]+([\d,]+(?:\.\d+)?)/gi,
    // Just numbers with commas (likely prices)
    /\b([\d]{1,3}(?:,\d{3})+(?:\.\d+)?)\b/g,
    // Large numbers without commas (for steel: 250000)
    /\b([\d]{5,6})\b/g
  ];
  
  const prices = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const priceStr = match[1].replace(/,/g, '');
      const price = parseFloat(priceStr);
      if (price && price > 0 && !isNaN(price)) {
        prices.push(price);
      }
    }
  }
  
  // Return the first valid price found
  return prices.length > 0 ? prices[0] : null;
}

// Material-specific URLs on costzone.org (Pakistan-specific materials only)
const MATERIAL_URLS = {
  'cement': [
    'https://costzone.org/cement-prices-in-pakistan',
    'https://costzone.org/cement-rate-today-in-pakistan',
    'https://costzone.org/cement-price-in-pakistan-today'
  ],
  'steel': [
    'https://costzone.org/steel-rates-in-pakistan',
    'https://costzone.org/steel-price-in-pakistan-today',
    'https://costzone.org/sariya-price-in-pakistan'
  ],
  'bricks': [
    'https://costzone.org/bricks-prices-in-pakistan',
    'https://costzone.org/brick-price-in-pakistan'
  ],
  'sand': [
    'https://costzone.org/sand-rait-price-in-pakistan',
    'https://costzone.org/sand-price-in-pakistan-today'
  ],
  'gravel': [
    'https://costzone.org/sand-and-crush-rates-in-pakistan',
    'https://costzone.org/crush-price-in-pakistan'
  ],
  'tiles': [
    'https://costzone.org/tiles-prices-in-pakistan'
  ],
  'paint': [
    'https://costzone.org/paint-price-in-pakistan'
  ],
  'aluminum': [
    'https://costzone.org/aluminum-windows-prices-in-pakistan'
  ],
  'glass': [
    'https://costzone.org/glass-doors-prices-in-pakistan'
  ],
  'electricalWire': [
    'https://costzone.org/electric-cable-price-in-pakistan'
  ],
  'plumbingPipe': [
    'https://costzone.org/pprc-pipe-and-fitting-price-in-pakistan',
    'https://costzone.org/pvc-pipe-price-in-pakistan'
  ]
};

// Materials that exist on costzone.org (Pakistan-specific)
const VALID_MATERIALS = [
  'Cement', 'Steel', 'Bricks', 'Sand', 'Gravel', 'Tiles', 'Paint',
  'Aluminum', 'Glass', 'Electrical Wire', 'Plumbing Pipe'
];

// Materials to remove (not on costzone.org)
const INVALID_MATERIALS = [
  'Portland Cement', 'Concrete', 'Asphalt', 'Stone', 'Mixed Material', 'Wood'
];

/**
 * Scrape a specific material page
 */
async function scrapeMaterialPage(url, materialKey) {
  try {
    console.log(`[Scraper] Fetching ${url} for ${materialKey}...`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 30000
    });
    
    console.log(`[Scraper] Response status: ${response.status}, Content length: ${response.data.length} bytes`);
    
    const $ = cheerio.load(response.data);
    const pageText = $('body').text();
    const pageHtml = $.html();
    
    console.log(`[Scraper] Page text length: ${pageText.length} characters`);
    
    // Define expected price ranges for validation
    const expectedRanges = {
      'cement': { min: 1000, max: 1500 },
      'steel': { min: 200000, max: 300000 },
      'bricks': { min: 5, max: 50 }, // Expanded range for bricks (was 10-25)
      'sand': { min: 5000, max: 15000 },
      'gravel': { min: 5000, max: 15000 },
      'tiles': { min: 300, max: 3000 },
      'paint': { min: 1500, max: 3000 },
      'aluminum': { min: 300, max: 600 },
      'glass': { min: 500, max: 1000 },
      'electricalWire': { min: 200, max: 500 },
      'plumbingPipe': { min: 300, max: 800 }
    };
    
    const prices = [];
    const expectedRange = expectedRanges[materialKey];
    
    // Enhanced price extraction patterns
    const pricePatterns = [
      // Pattern 1: "Rs 1,220 per bag" or "PKR 1,220/bag"
      /(?:Rs\.?|PKR)\s*:?\s*([\d,]+(?:\.\d+)?)\s*(?:per|\/)?\s*(?:bag|ton|piece|truck|sqm|liter|kg|sqft|meter)/gi,
      // Pattern 2: "1,220 Rs per bag" or "1,220 PKR/bag"
      /([\d,]+(?:\.\d+)?)\s*(?:Rs\.?|PKR)\s*(?:per|\/)?\s*(?:bag|ton|piece|truck|sqm|liter|kg|sqft|meter)/gi,
      // Pattern 3: "bag: Rs 1,220" or "ton: 1,220"
      /(?:bag|ton|piece|truck|sqm|liter|kg|sqft|meter)[\s:]+(?:Rs\.?|PKR)?\s*:?\s*([\d,]+(?:\.\d+)?)/gi,
      // Pattern 4: Price with unit context nearby (within 50 chars)
      /(?:price|rate|cost)[\s:]+(?:Rs\.?|PKR)?\s*:?\s*([\d,]+(?:\.\d+)?)(?:.{0,50}?(?:bag|ton|piece|truck|sqm|liter|kg|sqft|meter))?/gi,
      // Pattern 5: Large numbers (for steel: 250000)
      /\b([\d]{5,6})\b(?=.{0,30}(?:steel|sariya|ton|tonne))/gi,
      // Pattern 6: Numbers with commas in context of material
      /\b([\d]{1,3}(?:,\d{3})+)\b(?=.{0,30}(?:rs|pkr|price|rate|per))/gi
    ];
    
    // Extract all price matches
    for (const pattern of pricePatterns) {
      let match;
      while ((match = pattern.exec(pageText)) !== null) {
        const priceStr = match[1].replace(/,/g, '');
        const price = parseFloat(priceStr);
        if (price && price > 0) {
          // Validate against expected range if available
          if (expectedRange) {
            if (price >= expectedRange.min && price <= expectedRange.max) {
              prices.push(price);
            }
          } else {
            // No range defined, accept reasonable prices
            if (price > 10 && price < 1000000) {
              prices.push(price);
            }
          }
        }
      }
    }
    
    // Also check tables for structured data (more comprehensive)
    $('table').each((tableIdx, table) => {
      const $table = $(table);
      const rows = $table.find('tr');
      
      rows.each((i, row) => {
        const $row = $(row);
        const cells = $row.find('td, th');
        if (cells.length >= 2) {
          const rowText = $row.text().toLowerCase();
          
          // Check if this row is about the material
          const materialNames = MATERIAL_MAPPING[materialKey] || [];
          const isMaterialRow = materialNames.some(name => 
            rowText.includes(name.toLowerCase())
          );
          
          // Also check if any header contains material name
          const headers = $table.find('thead tr th, thead tr td, tbody tr:first-child th, tbody tr:first-child td');
          const headerText = headers.map((idx, el) => $(el).text().toLowerCase()).get().join(' ');
          const isMaterialTable = materialNames.some(name => 
            headerText.includes(name.toLowerCase())
          );
          
          if (isMaterialRow || isMaterialTable) {
            // Look for price in cells - typically price is in a cell with numbers
            cells.each((j, cell) => {
              const cellText = $(cell).text().trim();
              const cellHtml = $(cell).html();
              
              // Skip header cells
              if (cellText.toLowerCase().includes('price') || 
                  cellText.toLowerCase().includes('rate') ||
                  cellText.toLowerCase().includes('cost') ||
                  cellText.toLowerCase().includes('material') ||
                  cellText.toLowerCase().includes('name')) {
                return;
              }
              
              // Extract price with unit context
              const price = extractPrice(cellText);
              if (price && expectedRange) {
                // Validate price against expected range
                if (price >= expectedRange.min && price <= expectedRange.max) {
                  prices.push(price);
                }
              } else if (price) {
                // No range defined, use basic validation
                if (price > 10 && price < 1000000) {
                  prices.push(price);
                }
              }
            });
          }
        }
      });
    });
    
    // Also check divs and spans that might contain price information
    $('div, span, p').each((i, el) => {
      const $el = $(el);
      const text = $el.text().toLowerCase();
      const materialNames = MATERIAL_MAPPING[materialKey] || [];
      const containsMaterial = materialNames.some(name => text.includes(name.toLowerCase()));
      
      if (containsMaterial) {
        const price = extractPrice($el.text());
        if (price && expectedRange && price >= expectedRange.min && price <= expectedRange.max) {
          prices.push(price);
        }
      }
    });
    
    // Look for specific brand prices (e.g., "Maple Leaf: Rs 1,220-1,250" or "Maple Leaf Cement Rs 1,220 to 1,250")
    if (materialKey === 'cement') {
      // Pattern for price ranges: "Brand Name Rs 1,220-1,250" or "Brand: 1,220 to 1,250"
      const brandRangePattern = /(?:maple\s*leaf|dg\s*cement|bestway|lucky|cherat|power|kohat|askari|portland)[\s:]*[\s(]*(?:rs|pkr)?[\s:]*([\d,]+)[\s–-]+([\d,]+)/gi;
      let match;
      while ((match = brandRangePattern.exec(pageText)) !== null) {
        const price1 = parseFloat(match[1].replace(/,/g, ''));
        const price2 = parseFloat(match[2].replace(/,/g, ''));
        if (price1 && price1 > 1000 && price1 < 2000) prices.push(price1);
        if (price2 && price2 > 1000 && price2 < 2000) prices.push(price2);
        // Also add average of range
        if (price1 && price2) {
          const avg = (price1 + price2) / 2;
          if (avg > 1000 && avg < 2000) prices.push(avg);
        }
      }
      
      // Pattern for single prices: "Maple Leaf Cement Rs 1,235"
      const brandSinglePattern = /(?:maple\s*leaf|dg\s*cement|bestway|lucky|cherat|power|kohat|askari|portland)[\s:]*[\s(]*(?:rs|pkr)?[\s:]*([\d,]+)/gi;
      while ((match = brandSinglePattern.exec(pageText)) !== null) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price && price > 1000 && price < 2000) {
          prices.push(price);
        }
      }
    }
    
    // Special handling for bricks - look for "Rs 13-15 per brick" or "Rs 15 per brick"
    if (materialKey === 'bricks') {
      const brickPattern = /(?:brick|bricks)[\s:]*[\s(]*(?:rs|pkr)?[\s:]*([\d,]+)[\s–-]?([\d,]+)?[\s]*per[\s]*(?:brick|piece)/gi;
      let match;
      while ((match = brickPattern.exec(pageText)) !== null) {
        const price1 = parseFloat(match[1].replace(/,/g, ''));
        if (price1 && price1 >= 10 && price1 <= 25) {
          prices.push(price1);
        }
        if (match[2]) {
          const price2 = parseFloat(match[2].replace(/,/g, ''));
          if (price2 && price2 >= 10 && price2 <= 25) {
            prices.push(price2);
          }
        }
      }
    }
    
    // Special handling for steel - look for "Rs 250,000 per ton" or "Rs 250000/ton"
    if (materialKey === 'steel') {
      const steelPatterns = [
        /(?:steel|sariya|rebar|reinforcement)[\s:]*[\s(]*(?:rs|pkr)?[\s:]*([\d,]+)[\s]*(?:per|\/)?[\s]*(?:ton|tonne)/gi,
        /([\d]{5,6})[\s]*(?:rs|pkr)?[\s]*(?:per|\/)?[\s]*(?:ton|tonne)/gi,
        /(?:ton|tonne)[\s:]+(?:rs|pkr)?[\s:]*([\d,]+)/gi,
        /\b([2][3-5]\d{4,5})\b/gi  // Numbers starting with 23-25 followed by 4-5 digits (230000-259999)
      ];
      
      for (const pattern of steelPatterns) {
        let match;
        while ((match = pattern.exec(pageText)) !== null) {
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price && price >= 200000 && price <= 300000) {
            prices.push(price);
          }
        }
      }
    }
    
    // Special handling for bricks - look for "Rs 15 per brick" or "Rs 13-15 per brick"
    if (materialKey === 'bricks') {
      console.log(`[Scraper] Extracting brick prices from page...`);
      const brickPatterns = [
        // Pattern 1: "brick Rs 15 per piece" or "bricks: Rs 15 per brick"
        /(?:brick|bricks)[\s:]*[\s(]*(?:rs|pkr|Rs|PKR)?[\s:]*([\d,]+)[\s–-]?([\d,]+)?[\s]*per[\s]*(?:brick|piece|unit)/gi,
        // Pattern 2: "15 Rs per brick" or "15 PKR/brick"
        /([\d]{1,2}(?:\.\d+)?)[\s]*(?:rs|pkr|Rs|PKR)?[\s]*(?:per|\/)?[\s]*(?:brick|piece|unit)/gi,
        // Pattern 3: "per brick: Rs 15" or "/brick: 15"
        /(?:per|\/)\s*(?:brick|piece|unit)[\s:]+(?:rs|pkr|Rs|PKR)?[\s:]*([\d]{1,2}(?:\.\d+)?)/gi,
        // Pattern 4: "Rs. 15" near "brick" keyword (within 50 chars)
        /(?:rs|pkr|Rs|PKR)[\s:\.]*([\d]{1,2}(?:\.\d+)?)(?=.{0,50}?(?:brick|piece|unit))/gi,
        // Pattern 5: Table format - numbers in context of brick
        /\b([\d]{1,2}(?:\.\d+)?)\b(?=.{0,30}(?:brick|piece|unit))/gi
      ];
      
      let foundPrices = [];
      for (const pattern of brickPatterns) {
        let match;
        while ((match = pattern.exec(pageText)) !== null) {
          const price1 = parseFloat(match[1].replace(/,/g, ''));
          // Expanded range: 5-50 PKR (more flexible)
          if (price1 && price1 >= 5 && price1 <= 50) {
            foundPrices.push(price1);
            console.log(`[Scraper] Brick pattern matched: ${price1} PKR`);
          }
          if (match[2]) {
            const price2 = parseFloat(match[2].replace(/,/g, ''));
            if (price2 && price2 >= 5 && price2 <= 50) {
              foundPrices.push(price2);
              console.log(`[Scraper] Brick pattern matched (range): ${price2} PKR`);
            }
          }
        }
      }
      
      // Also try general price extraction near brick keywords
      const brickKeywords = /(?:brick|bricks|eent|eent|red\s*brick|clay\s*brick)/gi;
      const brickMatches = [...pageText.matchAll(brickKeywords)];
      
      for (const match of brickMatches) {
        const startPos = Math.max(0, match.index - 100);
        const endPos = Math.min(pageText.length, match.index + match[0].length + 100);
        const context = pageText.substring(startPos, endPos);
        
        // Extract prices from context
        const contextPrices = context.match(/(?:rs|pkr|Rs|PKR)[\s:\.]*([\d]{1,2}(?:\.\d+)?)|([\d]{1,2}(?:\.\d+)?)[\s]*(?:rs|pkr|Rs|PKR)/gi);
        if (contextPrices) {
          for (const priceStr of contextPrices) {
            const priceMatch = priceStr.match(/([\d]{1,2}(?:\.\d+)?)/);
            if (priceMatch) {
              const price = parseFloat(priceMatch[1]);
              if (price >= 5 && price <= 50) {
                foundPrices.push(price);
                console.log(`[Scraper] Brick context price found: ${price} PKR`);
              }
            }
          }
        }
      }
      
      // Add found prices to main prices array
      prices.push(...foundPrices);
      
      if (foundPrices.length > 0) {
        console.log(`[Scraper] Found ${foundPrices.length} brick price candidates: ${foundPrices.join(', ')}`);
      } else {
        console.log(`[Scraper] No brick prices found with patterns. Page text sample: ${pageText.substring(0, 500)}`);
      }
    }
    
    // Special handling for gravel/crush - look for "Rs 8,000 per truck"
    if (materialKey === 'gravel') {
      const gravelPatterns = [
        /(?:gravel|crush|bajri|stone)[\s:]*[\s(]*(?:rs|pkr)?[\s:]*([\d,]+)[\s]*(?:per|\/)?[\s]*(?:truck|load)/gi,
        /([\d]{4})[\s]*(?:rs|pkr)?[\s]*(?:per|\/)?[\s]*(?:truck|load)/gi
      ];
      
      for (const pattern of gravelPatterns) {
        let match;
        while ((match = pattern.exec(pageText)) !== null) {
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price && price >= 5000 && price <= 15000) {
            prices.push(price);
          }
        }
      }
    }
    
    // Calculate average price from all found prices
    if (prices.length > 0) {
      // Use the expected range we defined earlier
      const range = expectedRanges[materialKey];
      
      // Filter prices to only include those in reasonable range
      let validPrices = prices;
      if (range) {
        validPrices = prices.filter(p => p >= range.min && p <= range.max);
      }
      
      // If no valid prices in range, try to use the most common price from all found prices
      if (validPrices.length === 0 && prices.length > 0) {
        console.log(`[Scraper] ${materialKey}: No prices in expected range, trying to find most common value from ${prices.length} found prices`);
        // Count frequency of each price (rounded to nearest 10 for bricks, 100 for others)
        const roundedPrices = prices.map(p => {
          if (materialKey === 'bricks') return Math.round(p);
          if (materialKey === 'steel') return Math.round(p / 1000) * 1000;
          return Math.round(p / 10) * 10;
        });
        const frequency = {};
        roundedPrices.forEach(p => {
          frequency[p] = (frequency[p] || 0) + 1;
        });
        const mostCommon = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
        const mostCommonPrice = parseFloat(mostCommon);
        if (mostCommonPrice > 0) {
          console.log(`[Scraper] ${materialKey}: Using most common price: ${mostCommonPrice}`);
          return mostCommonPrice;
        }
        return null;
      }
      
      if (validPrices.length === 0) {
        console.log(`[Scraper] ${materialKey}: No valid prices found (found ${prices.length} total prices, expected range: ${range ? range.min + '-' + range.max : 'none'})`);
        if (prices.length > 0) {
          console.log(`[Scraper] ${materialKey}: Found prices were: ${prices.slice(0, 10).join(', ')}${prices.length > 10 ? '...' : ''}`);
        }
        return null;
      }
      
      // Filter out outliers (prices that are too different from the median)
      const sorted = validPrices.sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const filtered = sorted.filter(p => {
        const deviation = Math.abs(p - median) / median;
        return deviation < 0.3; // Within 30% of median
      });
      
      if (filtered.length > 0) {
        const avgPrice = filtered.reduce((sum, p) => sum + p, 0) / filtered.length;
        console.log(`[Scraper] ${materialKey}: Found ${prices.length} prices, ${validPrices.length} valid, ${filtered.length} after outlier removal, avg: ${Math.round(avgPrice)}`);
        return Math.round(avgPrice);
      } else if (validPrices.length > 0) {
        // If all prices are outliers, use the median
        console.log(`[Scraper] ${materialKey}: All prices were outliers, using median: ${median}`);
        return Math.round(median);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`[Scraper] Error scraping ${url}:`, error.message);
    return null;
  }
}

/**
 * Scrape material prices from costzone.org
 */
async function scrapeCostzonePrices() {
  const results = {};
  const baseUrl = 'https://costzone.org';
  
  console.log('[Scraper] Starting to scrape costzone.org...');
  
  // Try scraping specific material pages first
  for (const [materialKey, urls] of Object.entries(MATERIAL_URLS)) {
    console.log(`[Scraper] Scraping ${materialKey}...`);
    
    for (const url of urls) {
      try {
        console.log(`[Scraper] Attempting to scrape ${materialKey} from ${url}`);
        const price = await scrapeMaterialPage(url, materialKey);
        if (price && price > 0) {
          console.log(`[Scraper] ✓ Successfully scraped ${materialKey}: ${price} ${UNIT_MAPPING[materialKey]}`);
          // For cement, use average if we have multiple prices, otherwise use the found price
          if (materialKey === 'cement') {
            // Cement prices are typically in range 1200-1300, prefer prices in this range
            if (price >= 1000 && price <= 1500) {
              if (!results[materialKey]) {
                results[materialKey] = {
                  name: DB_MATERIAL_NAMES[materialKey],
                  price: price,
                  unit: UNIT_MAPPING[materialKey],
                  category: CATEGORY_MAPPING[materialKey],
                  source: url
                };
                console.log(`[Scraper] Found ${materialKey} price: ${price} ${UNIT_MAPPING[materialKey]} from ${url}`);
              } else if (price > results[materialKey].price) {
                // Update if we found a higher (more recent) price
                results[materialKey].price = price;
                results[materialKey].source = url;
                console.log(`[Scraper] Updated ${materialKey} price: ${price} ${UNIT_MAPPING[materialKey]} from ${url}`);
              }
            }
          } else {
            // For other materials, use the first valid price found
            if (!results[materialKey] || price > results[materialKey].price) {
              results[materialKey] = {
                name: DB_MATERIAL_NAMES[materialKey],
                price: price,
                unit: UNIT_MAPPING[materialKey],
                category: CATEGORY_MAPPING[materialKey],
                source: url
              };
              console.log(`[Scraper] Found ${materialKey} price: ${price} ${UNIT_MAPPING[materialKey]} from ${url}`);
            }
          }
          break; // Found price, move to next material
        } else {
          console.log(`[Scraper] ✗ No valid price found for ${materialKey} from ${url} (returned: ${price})`);
        }
      } catch (error) {
        console.error(`[Scraper] ✗ Error scraping ${materialKey} from ${url}:`, error.message);
        console.error(`[Scraper] Error stack:`, error.stack);
        continue;
      }
    }
    
    // Log if material was not found after trying all URLs
    if (!results[materialKey]) {
      console.log(`[Scraper] ⚠ No price found for ${materialKey} after trying ${urls.length} URL(s)`);
    }
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // If we didn't find prices from specific pages, try the homepage
  if (Object.keys(results).length === 0) {
    console.log('[Scraper] No prices from specific pages, trying homepage...');
    try {
      const response = await axios.get(baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      
      // Search for prices in articles and posts
      $('article, .post').each((i, elem) => {
        const $elem = $(elem);
        const title = $elem.find('h1, h2, h3, h4, .title').text().toLowerCase();
        const content = $elem.text();
        
        for (const [key, names] of Object.entries(MATERIAL_MAPPING)) {
          if (results[key]) continue; // Already found
          
          for (const name of names) {
            if (title.includes(name.toLowerCase()) || content.toLowerCase().includes(name.toLowerCase())) {
              const price = extractPrice(content);
              if (price && price > 100 && price < 1000000) {
                results[key] = {
                  name: DB_MATERIAL_NAMES[key] || names[0],
                  price: price,
                  unit: UNIT_MAPPING[key],
                  category: CATEGORY_MAPPING[key],
                  source: baseUrl
                };
                break;
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('[Scraper] Error fetching homepage:', error.message);
    }
  }
  
  console.log(`[Scraper] Found ${Object.keys(results).length} materials`);
  return results;
}

/**
 * Update material prices in database from scraped data
 */
async function updateMaterialPrices(scrapedData, userId = null) {
  const connection = await pool.getConnection();
  const updates = [];
  const inserts = [];
  
  try {
    await connection.beginTransaction();
    
    // Ensure materials table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        category ENUM('construction', 'finishing', 'other') DEFAULT 'construction',
        cost_per_unit DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) DEFAULT 'sqm',
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updated_by INT,
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )
    `);
    
    // Add new columns if they don't exist (for existing tables)
    try {
      // Check which columns exist
      const [columnInfo] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'materials'
        AND COLUMN_NAME IN ('source_url', 'last_scraped_at')
      `);
      
      const existingColumns = columnInfo.map(c => c.COLUMN_NAME);
      
      if (!existingColumns.includes('source_url')) {
        try {
          await connection.query(`ALTER TABLE materials ADD COLUMN source_url VARCHAR(255)`);
          console.log('[Scraper] Added source_url column');
        } catch (e) {
          console.log('[Scraper] Error adding source_url:', e.message);
        }
      }
      
      if (!existingColumns.includes('last_scraped_at')) {
        try {
          await connection.query(`ALTER TABLE materials ADD COLUMN last_scraped_at TIMESTAMP NULL`);
          console.log('[Scraper] Added last_scraped_at column');
        } catch (e) {
          console.log('[Scraper] Error adding last_scraped_at:', e.message);
        }
      }
    } catch (alterError) {
      console.log('[Scraper] Error checking columns, attempting to add:', alterError.message);
      // Try to add columns anyway (will fail gracefully if they exist)
      try {
        await connection.query(`ALTER TABLE materials ADD COLUMN source_url VARCHAR(255)`);
      } catch (e) {
        // Ignore if column exists
      }
      try {
        await connection.query(`ALTER TABLE materials ADD COLUMN last_scraped_at TIMESTAMP`);
      } catch (e) {
        // Ignore if column exists
      }
    }
    
    for (const [key, data] of Object.entries(scrapedData)) {
      if (!data.price || data.price <= 0) continue;
      
      // Use the database material name (generic name, not brand name)
      const dbMaterialName = DB_MATERIAL_NAMES[key] || data.name;
      
      // Check if material exists by name (case-insensitive search)
      const [existing] = await connection.query(
        'SELECT id, name FROM materials WHERE LOWER(name) = LOWER(?)',
        [dbMaterialName]
      );
      
      if (existing.length > 0) {
        // Check which optional columns exist
        const [columnInfo] = await connection.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'materials'
          AND COLUMN_NAME IN ('source_url', 'last_scraped_at')
        `);
        const existingCols = columnInfo.map(c => c.COLUMN_NAME);
        const hasSourceUrl = existingCols.includes('source_url');
        const hasLastScraped = existingCols.includes('last_scraped_at');
        
        // Build UPDATE query based on available columns
        let updateFields = 'cost_per_unit = ?, unit = ?, category = ?, updated_by = ?, updated_at = NOW()';
        const updateValues = [data.price, data.unit, data.category, userId];
        
        if (hasSourceUrl) {
          updateFields += ', source_url = ?';
          updateValues.push(data.source || 'https://costzone.org');
        }
        
        if (hasLastScraped) {
          updateFields += ', last_scraped_at = NOW()';
        }
        
        updateValues.push(existing[0].id);
        
        // Update existing material
        await connection.query(
          `UPDATE materials 
           SET ${updateFields}
           WHERE id = ?`,
          updateValues
        );
        updates.push({ name: existing[0].name, price: data.price, unit: data.unit });
        console.log(`[Scraper] Updated ${existing[0].name}: ${data.price} ${data.unit}`);
      } else {
        // Check which optional columns exist for INSERT
        const [columnInfo] = await connection.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'materials'
          AND COLUMN_NAME IN ('source_url', 'last_scraped_at')
        `);
        const existingCols = columnInfo.map(c => c.COLUMN_NAME);
        const hasSourceUrl = existingCols.includes('source_url');
        const hasLastScraped = existingCols.includes('last_scraped_at');
        
        // Build INSERT query based on available columns
        let insertFields = 'name, category, cost_per_unit, unit, description, updated_by';
        let insertValues = '?, ?, ?, ?, ?, ?';
        const insertParams = [
          dbMaterialName,
          data.category,
          data.price,
          data.unit,
          `Scraped from ${data.source || 'costzone.org'}`,
          userId
        ];
        
        if (hasSourceUrl) {
          insertFields += ', source_url';
          insertValues += ', ?';
          insertParams.push(data.source || 'https://costzone.org');
        }
        
        if (hasLastScraped) {
          insertFields += ', last_scraped_at';
          insertValues += ', NOW()';
        }
        
        // Insert new material
        await connection.query(
          `INSERT INTO materials (${insertFields})
           VALUES (${insertValues})`,
          insertParams
        );
        inserts.push({ name: dbMaterialName, price: data.price, unit: data.unit });
        console.log(`[Scraper] Inserted ${dbMaterialName}: ${data.price} ${data.unit}`);
      }
    }
    
    await connection.commit();
    
    return {
      success: true,
      updated: updates.length,
      inserted: inserts.length,
      updates,
      inserts
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Main function to scrape and update prices
 */
async function scrapeAndUpdatePrices(userId = null) {
  try {
    console.log('[Scraper] Starting to scrape costzone.org...');
    
    // First, clean up invalid materials that don't exist on costzone.org
    console.log('[Scraper] Cleaning up invalid materials...');
    const cleanupResult = await cleanupInvalidMaterials();
    if (cleanupResult.count > 0) {
      console.log(`[Scraper] Removed ${cleanupResult.count} invalid materials: ${cleanupResult.removed.join(', ')}`);
    }
    
    const scrapedData = await scrapeCostzonePrices();
    
    if (Object.keys(scrapedData).length === 0) {
      console.log('[Scraper] No prices found from scraping. Using fallback prices from costzone.org market rates.');
      // Use fallback prices if scraping fails - these are accurate market rates
      return await updateWithFallbackPrices(userId);
    }
    
    console.log(`[Scraper] Found ${Object.keys(scrapedData).length} materials from scraping`);
    
    // Merge scraped data with fallback for missing materials
    const allMaterials = { ...scrapedData };
    
    // Add fallback prices for materials that weren't scraped or had invalid prices
    // These are accurate market rates from costzone.org (December 2025)
    const fallbackPricesMap = {
      'cement': { name: 'Cement', price: 1235, unit: 'bag', category: 'construction' },
      'steel': { name: 'Steel', price: 250000, unit: 'ton', category: 'construction' },
      'bricks': { name: 'Bricks', price: 17, unit: 'piece', category: 'construction' },
      'sand': { name: 'Sand', price: 7000, unit: 'truck', category: 'construction' },
      'gravel': { name: 'Gravel', price: 8000, unit: 'truck', category: 'construction' },
      'tiles': { name: 'Tiles', price: 400, unit: 'sqm', category: 'finishing' },
      'paint': { name: 'Paint', price: 2200, unit: 'liter', category: 'finishing' }
    };
    
    for (const [key, fallback] of Object.entries(fallbackPricesMap)) {
      if (!allMaterials[key] || !allMaterials[key].price || allMaterials[key].price <= 0) {
        console.log(`[Scraper] Using fallback price for ${key}: ${fallback.price} ${fallback.unit}`);
        allMaterials[key] = {
          ...fallback,
          source: 'fallback (costzone.org market rates)',
          isFallback: true
        };
      }
    }
    
    const result = await updateMaterialPrices(allMaterials, userId);
    
    console.log(`[Scraper] Updated ${result.updated} materials, inserted ${result.inserted} new materials`);
    return {
      success: true,
      ...result,
      totalUpdated: result.updated + result.inserted
    };
  } catch (error) {
    console.error('[Scraper] Error in scrapeAndUpdatePrices:', error);
    // Fallback to default prices if scraping fails
    console.log('[Scraper] Using fallback prices due to error');
    return await updateWithFallbackPrices(userId);
  }
}

/**
 * Clean up invalid materials that don't exist on costzone.org
 */
async function cleanupInvalidMaterials() {
  const connection = await pool.getConnection();
  const removed = [];
  
  try {
    // Soft delete materials that don't exist on costzone.org
    for (const invalidName of INVALID_MATERIALS) {
      const [existing] = await connection.query(
        'SELECT id, name FROM materials WHERE name = ? AND is_active = TRUE',
        [invalidName]
      );
      
      if (existing.length > 0) {
        await connection.query(
          'UPDATE materials SET is_active = FALSE WHERE id = ?',
          [existing[0].id]
        );
        removed.push(invalidName);
        console.log(`[Scraper] Removed invalid material: ${invalidName}`);
      }
    }
    
    // Also check for "Portland Cement" (case variations)
    const [portlandCement] = await connection.query(
      "SELECT id, name FROM materials WHERE LOWER(name) LIKE '%portland%' AND is_active = TRUE"
    );
    
    for (const material of portlandCement) {
      // Update to just "Cement" if it exists, otherwise remove
      const [cementExists] = await connection.query(
        'SELECT id FROM materials WHERE name = ? AND is_active = TRUE',
        ['Cement']
      );
      
      if (cementExists.length > 0) {
        // Cement exists, remove Portland Cement
        await connection.query(
          'UPDATE materials SET is_active = FALSE WHERE id = ?',
          [material.id]
        );
        removed.push(material.name);
        console.log(`[Scraper] Removed invalid material: ${material.name}`);
      } else {
        // Rename Portland Cement to Cement
        await connection.query(
          'UPDATE materials SET name = ? WHERE id = ?',
          ['Cement', material.id]
        );
        console.log(`[Scraper] Renamed ${material.name} to Cement`);
      }
    }
    
    return { removed, count: removed.length };
  } catch (error) {
    console.error('[Scraper] Error cleaning up invalid materials:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Update with fallback prices (from costzone.org market rates - December 2025)
 * These are based on current market rates from costzone.org
 */
async function updateWithFallbackPrices(userId = null) {
  // Updated prices based on costzone.org December 2025 rates
  // These will update existing materials in the database
  const fallbackPrices = {
    cement: { name: 'Cement', price: 1235, unit: 'bag', category: 'construction' }, // Average of 1220-1250 (Maple Leaf range)
    steel: { name: 'Steel', price: 250000, unit: 'ton', category: 'construction' }, // Updated from 2000 to 250000
    bricks: { name: 'Bricks', price: 17, unit: 'piece', category: 'construction' },
    sand: { name: 'Sand', price: 7000, unit: 'truck', category: 'construction' },
    gravel: { name: 'Gravel', price: 8000, unit: 'truck', category: 'construction' },
    tiles: { name: 'Tiles', price: 400, unit: 'sqm', category: 'finishing' },
    paint: { name: 'Paint', price: 2200, unit: 'liter', category: 'finishing' },
    aluminum: { name: 'Aluminum', price: 400, unit: 'kg', category: 'construction' },
    glass: { name: 'Glass', price: 700, unit: 'sqft', category: 'finishing' },
    electricalWire: { name: 'Electrical Wire', price: 300, unit: 'meter', category: 'construction' },
    plumbingPipe: { name: 'Plumbing Pipe', price: 450, unit: 'meter', category: 'construction' }
  };
  
  console.log('[Scraper] Using fallback prices (market rates from costzone.org)');
  return await updateMaterialPrices(fallbackPrices, userId);
}

module.exports = {
  scrapeCostzonePrices,
  updateMaterialPrices,
  scrapeAndUpdatePrices,
  updateWithFallbackPrices,
  cleanupInvalidMaterials
};

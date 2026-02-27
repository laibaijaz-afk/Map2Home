/**
 * Script to seed the maps table with map records
 * 
 * Usage:
 *   node scripts/seedMaps.js
 * 
 * Make sure to:
 *   1. Set API_URL and AUTH_TOKEN environment variables, or modify the constants below
 *   2. Ensure map images exist in /public/uploads/maps/ folder
 *   3. Update the maps array with your actual map files
 * 
 * Note: Requires Node.js 18+ for native fetch, or install node-fetch for older versions
 */

require('dotenv').config();

// Handle fetch for older Node.js versions
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  try {
    fetch = require('node-fetch');
  } catch (e) {
    console.error('❌ ERROR: fetch is not available. Please install node-fetch:');
    console.error('   npm install node-fetch');
    console.error('   OR upgrade to Node.js 18+');
    process.exit(1);
  }
} else {
  fetch = globalThis.fetch;
}

const API_URL = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // Get this from browser localStorage after logging in

// Map data array - update this with your actual map files
const maps = [
  // Bedroom maps
  {
    room_type: 'bedroom',
    title: 'Modern Bedroom Design 1',
    file_path: 'uploads/maps/bedroom_1.png',
    description: 'Spacious modern bedroom with walk-in closet'
  },
  {
    room_type: 'bedroom',
    title: 'Modern Bedroom Design 2',
    file_path: 'uploads/maps/bedroom_2.png',
    description: 'Cozy bedroom with ensuite bathroom'
  },
  {
    room_type: 'bedroom',
    title: 'Master Bedroom Layout',
    file_path: 'uploads/maps/bedroom_3.png',
    description: 'Luxury master bedroom with sitting area'
  },
  
  // Kitchen maps
  {
    room_type: 'kitchen',
    title: 'Modern Kitchen Design 1',
    file_path: 'uploads/maps/kitchen_1.png',
    description: 'Open concept kitchen with island'
  },
  {
    room_type: 'kitchen',
    title: 'Modern Kitchen Design 2',
    file_path: 'uploads/maps/kitchen_2.png',
    description: 'U-shaped kitchen with breakfast nook'
  },
  {
    room_type: 'kitchen',
    title: 'Gourmet Kitchen Layout',
    file_path: 'uploads/maps/kitchen_3.png',
    description: 'Professional kitchen with double ovens'
  },
  
  // TV Lounge maps
  {
    room_type: 'tv_lounge',
    title: 'TV Lounge Design 1',
    file_path: 'uploads/maps/tv_lounge_1.png',
    description: 'Comfortable TV lounge with entertainment center'
  },
  {
    room_type: 'tv_lounge',
    title: 'TV Lounge Design 2',
    file_path: 'uploads/maps/tv_lounge_2.png',
    description: 'Modern media room with surround sound setup'
  },
  {
    room_type: 'tv_lounge',
    title: 'Home Theater Layout',
    file_path: 'uploads/maps/tv_lounge_3.png',
    description: 'Premium home theater experience'
  },
  
  // Bathroom maps
  {
    room_type: 'bathroom',
    title: 'Master Bathroom Design',
    file_path: 'uploads/maps/bathroom_1.png',
    description: 'Luxury master bathroom with double vanity'
  },
  {
    room_type: 'bathroom',
    title: 'Guest Bathroom Layout',
    file_path: 'uploads/maps/bathroom_2.png',
    description: 'Efficient guest bathroom design'
  },
  
  // Drawing Room maps
  {
    room_type: 'drawing_room',
    title: 'Formal Drawing Room',
    file_path: 'uploads/maps/drawing_room_1.png',
    description: 'Elegant formal living space'
  },
  {
    room_type: 'drawing_room',
    title: 'Contemporary Drawing Room',
    file_path: 'uploads/maps/drawing_room_2.png',
    description: 'Modern drawing room with fireplace'
  },
  
  // Dining Room maps
  {
    room_type: 'dining_room',
    title: 'Formal Dining Room',
    file_path: 'uploads/maps/dining_room_1.png',
    description: 'Elegant dining space for entertaining'
  },
  {
    room_type: 'dining_room',
    title: 'Casual Dining Area',
    file_path: 'uploads/maps/dining_room_2.png',
    description: 'Open dining area connected to kitchen'
  },
  
  // Store Room maps
  {
    room_type: 'store_room',
    title: 'Storage Room Design',
    file_path: 'uploads/maps/store_room_1.png',
    description: 'Efficient storage solution'
  },
  
  // Garage maps
  {
    room_type: 'garage',
    title: 'Single Car Garage',
    file_path: 'uploads/maps/garage_1.png',
    description: 'Standard single car garage layout'
  },
  {
    room_type: 'garage',
    title: 'Double Car Garage',
    file_path: 'uploads/maps/garage_2.png',
    description: 'Spacious two-car garage with storage'
  },
  
  // Servant Quarter maps
  {
    room_type: 'servant_quarter',
    title: 'Servant Quarter Design',
    file_path: 'uploads/maps/servant_quarter_1.png',
    description: 'Compact servant quarter layout'
  },
];

/**
 * Add a single map record to the database
 */
async function addMap(mapData) {
  try {
    const response = await fetch(`${API_URL}/maps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(mapData)
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      mapData: mapData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      mapData: mapData
    };
  }
}

/**
 * Main function to seed all maps
 */
async function seedMaps() {
  console.log('🚀 Starting map seeding process...\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`Total maps to add: ${maps.length}\n`);
  
  if (!AUTH_TOKEN) {
    console.error('❌ ERROR: AUTH_TOKEN is required!');
    console.log('\nTo get your auth token:');
    console.log('1. Log in to your application');
    console.log('2. Open browser console and run: localStorage.getItem("token")');
    console.log('3. Copy the token and set it as AUTH_TOKEN environment variable:');
    console.log('   export AUTH_TOKEN="your-token-here"');
    console.log('   OR create a .env file with: AUTH_TOKEN=your-token-here\n');
    process.exit(1);
  }

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  // Add maps one by one
  for (let i = 0; i < maps.length; i++) {
    const map = maps[i];
    console.log(`[${i + 1}/${maps.length}] Adding: ${map.title} (${map.room_type})...`);
    
    const result = await addMap(map);
    results.push(result);
    
    if (result.success) {
      successCount++;
      console.log(`✅ Success! Map ID: ${result.data.map?.id || 'N/A'}`);
      console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    } else {
      errorCount++;
      console.log(`❌ Failed! Status: ${result.status || 'N/A'}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      } else {
        console.log(`   Response:`, JSON.stringify(result.data, null, 2));
      }
    }
    console.log(''); // Empty line for readability
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SEEDING SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total maps processed: ${maps.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(50) + '\n');

  // Show failed maps if any
  if (errorCount > 0) {
    console.log('Failed maps:');
    results
      .filter(r => !r.success)
      .forEach((r, idx) => {
        console.log(`${idx + 1}. ${r.mapData.title} - ${r.mapData.file_path}`);
      });
    console.log('');
  }
}

// Run the seeding script
if (require.main === module) {
  seedMaps().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { seedMaps, addMap };


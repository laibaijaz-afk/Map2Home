# Map Seeding Scripts

This directory contains scripts to automatically add map records to the database.

## Prerequisites

1. **Node.js 18+** (for native fetch API support)
   - If using Node.js < 18, install `node-fetch`: `npm install node-fetch`
   - Then modify `seedMaps.js` to import fetch: `const fetch = require('node-fetch')`

2. **Authentication Token**
   - You need a valid JWT token to authenticate API requests
   - Get it by logging into the application

3. **Map Images**
   - Ensure map images exist in `/public/uploads/maps/` folder
   - Update the `maps` array in the script with your actual file names

## Usage

### Option 1: Node.js Script (Recommended)

1. **Get your authentication token:**
   ```bash
   # After logging in, get token from browser console:
   # localStorage.getItem('token')
   ```

2. **Set environment variables:**
   ```bash
   # Create a .env file in backend/ directory or export:
   export AUTH_TOKEN="your-jwt-token-here"
   export API_URL="http://localhost:5000/api"  # Optional, defaults to localhost:5000
   ```

3. **Update the maps array:**
   - Open `scripts/seedMaps.js`
   - Update the `maps` array with your actual map file paths
   - Ensure file paths match files in `/public/uploads/maps/`

4. **Run the script:**
   ```bash
   npm run seed-maps
   # OR
   node scripts/seedMaps.js
   ```

### Option 2: Browser Console Script

1. **Log in to your application** in the browser

2. **Open browser console** (F12)

3. **Copy the contents** of `seedMapsBrowser.js`

4. **Paste and modify:**
   - Update the `maps` array with your actual file paths
   - Update `API_URL` if needed

5. **Run:**
   ```javascript
   seedMaps()
   ```

## Map Data Structure

Each map object should have:

```javascript
{
  room_type: 'bedroom',        // Required: bedroom, kitchen, tv_lounge, bathroom, etc.
  title: 'Map Title',          // Required: Display name
  file_path: 'uploads/maps/filename.png',  // Required: Path relative to public folder
  description: 'Optional description'  // Optional: Map description
}
```

## Room Types

Valid room types:
- `bedroom`
- `kitchen`
- `tv_lounge`
- `bathroom`
- `drawing_room`
- `dining_room`
- `store_room`
- `garage`
- `servant_quarter`

## Example Output

```
🚀 Starting map seeding process...

API URL: http://localhost:5000/api
Total maps to add: 20

[1/20] Adding: Modern Bedroom Design 1 (bedroom)...
✅ Success! Map ID: 1
   Response: {
     "success": true,
     "message": "Map created successfully",
     "map": {
       "id": 1,
       "room_type": "bedroom",
       "title": "Modern Bedroom Design 1",
       "file_path": "http://localhost:5000/uploads/maps/bedroom_1.png",
       "description": "Spacious modern bedroom with walk-in closet"
     }
   }

...

==================================================
📊 SEEDING SUMMARY
==================================================
Total maps processed: 20
✅ Successful: 20
❌ Failed: 0
==================================================
```

## Troubleshooting

### "AUTH_TOKEN is required" error
- Make sure you've set the `AUTH_TOKEN` environment variable
- Or log in via browser and use the browser console script

### "Failed to fetch" or network errors
- Ensure the backend server is running
- Check that `API_URL` is correct
- Verify CORS settings allow requests from your origin

### "401 Unauthorized" errors
- Your token may have expired - get a new one by logging in again
- Verify the token is being sent correctly in the Authorization header

### "404 Not Found" errors
- Check that the API endpoint `/api/maps` exists
- Verify the server is running and routes are registered

### Images not displaying
- Ensure map images exist in `/public/uploads/maps/`
- Verify file paths in the database match actual file locations
- Check that static file serving is configured in `server.js`


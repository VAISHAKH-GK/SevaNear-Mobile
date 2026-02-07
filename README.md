# SevaNear Frontend

Simple mobile-first web app with Leaflet maps. Works with dummy data or your backend API.

## 📁 Files

```
sevanear-frontend/
├── index.html              # Main app (all pages)
├── config.js               # Config + dummy data
├── app.js                  # App logic
├── package.json            # For Capacitor (mobile)
└── capacitor.config.json   # Mobile app config
```

## 🚀 Quick Start

### Option 1: Open in Browser (No Install)

Just open `index.html` in your browser. Uses dummy data.

### Option 2: Use Local Server

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve

# Then open http://localhost:8000
```

## 📱 Build Android App

```bash
# 1. Install dependencies
npm install

# 2. Build Android app
npm run android
```

This will:
- Add Android platform
- Sync files
- Open Android Studio
- Click ▶️ Run to install on device/emulator

## 🍎 Build iOS App (macOS only)

```bash
npm run ios
```

Opens Xcode. Click ▶️ to run.

## 🔧 Connect to Your Backend

Edit `config.js`:

```javascript
const CONFIG = {
    USE_DUMMY_DATA: false,  // Change to false
    API_URL: 'https://your-api.com/api'  // Your backend URL
};
```

### Required API Endpoints

Your backend needs these endpoints:

```
GET  /api/hospitals
GET  /api/service-types
GET  /api/hospitals/:id/services?type=:typeId
GET  /api/services/:id
GET  /api/services/nearby?lat=:lat&lng=:lng&radius=:km
POST /api/services
```

### Expected Response Formats

**GET /api/hospitals**
```json
[
  {
    "id": "uuid",
    "name": "Hospital Name",
    "location": {"lat": 11.25, "lng": 75.78},
    "address": "Address",
    "district": "District",
    "phone": "Phone"
  }
]
```

**GET /api/service-types**
```json
[
  {"id": 1, "name": "Food", "icon": "🍽️"}
]
```

**GET /api/services/:id**
```json
{
  "id": "uuid",
  "hospital_id": "uuid",
  "hospital_name": "Hospital Name",
  "service_type_id": 1,
  "service_type_name": "Food",
  "provider_name": "Provider",
  "provider_contact": "Phone",
  "description": "Description",
  "timings": "9 AM - 5 PM",
  "eligibility": "Criteria",
  "required_documents": "Documents",
  "location": {"lat": 11.25, "lng": 75.78},
  "is_active": true
}
```

**POST /api/services**

Request body:
```json
{
  "hospital_id": "uuid",
  "service_type_id": 1,
  "provider_name": "Name",
  "provider_contact": "Phone",
  "description": "Description",
  "timings": "9 AM - 5 PM",
  "eligibility": "Criteria",
  "required_documents": "Documents",
  "location": {"lat": 11.25, "lng": 75.78}
}
```

Response:
```json
{
  "id": "new-uuid",
  "message": "Created successfully"
}
```

## 🎨 Features

### For Users:
- ✅ Search services by hospital
- ✅ Filter by service type
- ✅ View service details
- ✅ See location on map
- ✅ Call provider directly
- ✅ Get directions
- ✅ Find nearby services (using GPS)

### For Providers:
- ✅ Add new services
- ✅ Set location (manual or GPS)
- ✅ Specify eligibility & documents

## 📝 Dummy Data

Includes sample data for:
- 3 hospitals in Kozhikode
- 6 service types (Food, Medicine, Shelter, etc.)
- 6 sample services

Perfect for testing and demos!

## 🔄 Update API Config

When your backend is ready:

1. Set `USE_DUMMY_DATA: false` in `config.js`
2. Set your `API_URL`
3. Test in browser
4. Rebuild mobile app: `npm run sync`

## 📲 Mobile App Permissions

The app requests:
- **Location** - For "Find Nearby" and "Use My Location"

Permissions are requested when features are used.

## 🌐 Deploy Web Version

Upload these files to any static host:
- index.html
- config.js
- app.js

Works on: Netlify, Vercel, GitHub Pages, Firebase Hosting, etc.

## 📱 Publish Mobile App

### Android (Play Store)

1. In Android Studio: Build → Generate Signed Bundle
2. Create keystore
3. Build release APK/AAB
4. Upload to Play Console

### iOS (App Store)

1. In Xcode: Product → Archive
2. Distribute to App Store
3. Upload via App Store Connect

## 🛠️ Customization

### Change Colors

Edit styles in `index.html`:
```css
.header {
    background: #2563eb;  /* Change this */
}
button {
    background: #2563eb;  /* And this */
}
```

### Change App Name

Edit `capacitor.config.json`:
```json
{
  "appName": "Your App Name"
}
```

### Change Icons (Mobile)

After running `npm run android`:
- Android: Place icons in `android/app/src/main/res/`
- iOS: Use Xcode asset catalog

## 🐛 Troubleshooting

**Location not working?**
- Enable location permission in browser/app settings
- Use HTTPS (required for geolocation)

**Map not loading?**
- Check internet connection
- Maps load from OpenStreetMap CDN

**Android build fails?**
- Install Android Studio
- Install Android SDK
- Accept SDK licenses

**Backend connection fails?**
- Check API_URL is correct
- Check CORS is enabled on backend
- Use browser DevTools → Network tab

## 💡 Tips

- Test with dummy data first
- Use Chrome DevTools for debugging
- Test on real device for location features
- Enable CORS on your backend

## 📧 Need Help?

Check:
1. Browser console for errors (F12)
2. Network tab for API calls
3. Make sure backend is running

---

**Simple. Clean. Mobile-ready.** 🎯

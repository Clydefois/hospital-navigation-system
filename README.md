# ZC Medical Center Navigation System

A voice-powered hospital navigation app that helps patients and visitors find their way around the hospital.

**Live Website:** https://zcmedicalcenter.netlify.app

---

## What This System Does

- **Voice Navigation** – Talk to the app and it guides you to any department
- **Interactive Map** – See the hospital layout with real GPS tracking
- **AI Assistant** – Understands symptoms and suggests the right department
- **Turn-by-turn Directions** – Shows the path from your location to your destination

---

## Key Features

### 🎤 Voice Assistant

- Say things like "Where is the emergency room?" or "I have a headache"
- The AI understands 120+ keywords and responds with directions
- Works in English

### 🗺️ GPS Navigation

- Uses your phone's GPS to show your real-time location
- Draws a walking path to your destination
- Shows distance and estimated walking time

### 🏥 All Hospital Buildings Included

- Emergency Room
- Surgery, Pediatrics, Neurology, Cardiology
- Radiology, Laboratory, Dermatology, Ophthalmology, Nephrology, Orthopedic
- Doctors' Clinic
- Cafeteria, Comfort Room, Church, Parking

---

## How It Works

1. **Open the website** on your phone
2. **Allow location access** when prompted
3. **Tap the microphone** or select a destination from the dropdown
4. **Follow the green path** on the map to your destination

---

## Technologies Used

| What                        | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| **Next.js**                 | The web framework (makes the website work) |
| **Leaflet + OpenStreetMap** | Interactive maps with GPS                  |
| **Web Speech API**          | Voice recognition (built into browsers)    |
| **Custom AI Model**         | Understands symptoms and finds locations   |
| **Tailwind CSS**            | Styling and design                         |
| **Netlify**                 | Hosting the website online                 |
| **Framer Motion**           | Smooth animations                          |

---

## External Services

- **OpenStreetMap** – Free map tiles (no API key needed)
- **Netlify** – Free website hosting
- **Browser GPS** – Uses your device's built-in location

**No paid services required** – everything runs for free.

---

## How to Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## Deployment

The app is deployed on Netlify. Any push to the main branch automatically updates the live site.

---

## Credits

Developed for Zamboanga City Medical Center (CMZ) at Ateneo de Zamboanga University campus.

---

## Quick Summary

| Feature             | How It Helps                                  |
| ------------------- | --------------------------------------------- |
| Voice commands      | Hands-free navigation for patients            |
| GPS tracking        | Know exactly where you are                    |
| AI symptom matching | Don't know where to go? Describe your problem |
| Offline-capable map | Works even with slow internet                 |
| Mobile-friendly     | Works on any smartphone                       |

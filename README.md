# Hospital Navigation System

A comprehensive healthcare navigation system with voice recognition and interactive mapping features built with Next.js and Tailwind CSS.

## Features

### 1. Landing Page
- Welcome section with hospital statistics
- Hospital floor plan preview with zoom functionality
- Quick access to all major sections

### 2. Voice Assistant
- **Voice Recognition**: Uses Web Speech API for browser-based voice recognition
- **Floor Plan Navigation**: Voice commands to navigate to different departments
- **Real-time Transcription**: See what you say in real-time
- **Voice Response**: Text-to-speech responses for guided navigation
- **Command History**: Track your navigation queries

#### Supported Voice Commands:
- "Where is the Emergency Room?"
- "Take me to Cardiology"
- "Where is the pharmacy?"
- "Find the nearest restroom"
- "Where can I park?"
- "Show me the cafeteria"
- "Where is Radiology?"
- "How do I make an appointment?"

### 3. Quick Access Services
Six essential services with detailed information:
- **Emergency Services** - 24/7 emergency care
- **Appointments** - Schedule and manage appointments
- **Parking Information** - Parking facilities and access
- **Contact Information** - General inquiries and directory
- **Accessibility Services** - Support for special needs
- **Pharmacy** - Prescription and medical supplies

### 4. Interactive Hospital Map
- **Multi-floor Navigation**: Browse different hospital floors
- **Zoom Controls**: Zoom in/out for detailed viewing
- **Map Legend**: Color-coded department identification
- **Quick Navigation**: Shortcut buttons for common destinations
- **Interactive Markers**: Clickable location markers (ready for customization)

### 5. Department Directory
Complete directory with 8 major departments including Emergency Medicine, Cardiology, Neurology, Pediatrics, Orthopedics, Ophthalmology, Internal Medicine, and Pharmacy Services.

## Getting Started

```bash
cd "Hospital track"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser

## Adding Your Hospital Floor Plans

Place your PNG files in the `public` folder and update the components to reference them.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Voice Recognition**: Web Speech API (Browser-native)
- **Language**: TypeScript

## Browser Compatibility

Voice Recognition works best in Chrome, Edge, and Safari.
# hospital-navigation-system

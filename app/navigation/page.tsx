'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronUp, MapPin, ChevronDown, Navigation } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Dynamic import to avoid SSR issues with Leaflet
const InteractiveMapLeaflet = dynamic(
  () => import('@/components/InteractiveMapLeaflet'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

// Locations matching the rooms in InteractiveMapLeaflet.tsx
// Positions reference roads and gates for navigation
const locations = [
  // Top Row - near Gate 3, Gate 4, Gate 5
  { id: '2', name: 'Nephrology Department', category: 'Department', floor: 'Ground Floor', section: 'Near Road G & Road I' },
  { id: '5', name: 'Ophthalmology Department', category: 'Department', floor: 'Ground Floor', section: 'Below Nephrology, Road G area' },
  { id: '17', name: 'Dermatology Department', category: 'Department', floor: 'Ground Floor', section: 'Near Gate 5, Road I & J area' },
  { id: '9', name: 'Surgery Department', category: 'Department', floor: 'Ground Floor', section: 'Between Gate 3 & Gate 4, Road B area' },
  { id: '13', name: 'Church', category: 'Amenity', floor: 'Ground Floor', section: 'Left side, above Road A' },
  
  // Middle Section - near Road A, Road B, Road C
  { id: '6', name: 'Neurology Department', category: 'Department', floor: 'Ground Floor', section: 'Road C area, near Road D' },
  { id: '10', name: 'Pediatric Department', category: 'Department', floor: 'Ground Floor', section: 'Center, between Road B & Road C' },
  { id: '14', name: 'Emergency Room', category: 'Emergency', floor: 'Ground Floor', section: 'Near Gate 1 & Gate 2, Road F area' },
  
  // Bottom Row - near Road E, Road F, Gate 6
  { id: '7', name: 'Comfort Room', category: 'Amenity', floor: 'Ground Floor', section: 'Road C & Road E junction' },
  { id: '8', name: 'Cafeteria', category: 'Amenity', floor: 'Ground Floor', section: 'Below Comfort Room, Road E area' },
  { id: '11', name: 'Orthopedic Department', category: 'Department', floor: 'Ground Floor', section: 'Road C & Road F area' },
  { id: '12', name: 'Radiology Department', category: 'Department', floor: 'Ground Floor', section: 'Bottom, near Road F' },
  { id: '18', name: "Doctors' Clinic", category: 'Service', floor: 'Ground Floor', section: 'Bottom left, near Gate 1' },
  { id: '15', name: 'Cardio-Pulmonary Department', category: 'Department', floor: 'Ground Floor', section: 'Road E & Road K area' },
  { id: '16', name: 'Diagnostic/Laboratory', category: 'Service', floor: 'Ground Floor', section: 'Near Gate 6, Road K area' },
];

export default function NavigationPage() {
  const [locationGranted, setLocationGranted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<typeof locations[0] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    // Check if we're on HTTPS or localhost
    const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost';
    
    if (!isSecureContext) {
      setLocationError('Geolocation requires HTTPS. Please use https://zcmedicalcenter.netlify.app or skip to manual selection.');
      return;
    }

    // iOS Safari specific handling
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location granted:', position.coords);
        setLocationGranted(true);
        setLocationError(null);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Location access denied. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location in Settings > Safari > Location Services, or skip to manual selection.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const skipLocation = () => {
    setLocationGranted(true);
    setLocationError(null);
  };

  const startNavigation = () => {
    if (selectedDestination) {
      setIsNavigating(true);
      setIsDropdownOpen(false);
      setIsPanelOpen(true);
    }
  };

  if (!locationGranted) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-4"
        >
          <Link href="/">
            <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm flex flex-col items-center"
        >
          {/* Location Icon with Concentric Rings */}
          <div className="relative mb-12">
            {/* Outer rings */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.05, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
            >
              <div className="w-full h-full rounded-full border-2 border-[#3b7ea1]" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.08, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute inset-0 w-52 h-52 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
            >
              <div className="w-full h-full rounded-full border-2 border-[#3b7ea1]" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.1, 0.25] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute inset-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
            >
              <div className="w-full h-full rounded-full border-2 border-[#3b7ea1]" />
            </motion.div>
            
            {/* Small dots on the rings */}
            <div className="absolute w-2 h-2 bg-gray-300 rounded-full" style={{ top: '10%', left: '85%' }} />
            <div className="absolute w-2 h-2 bg-gray-300 rounded-full" style={{ top: '75%', left: '5%' }} />
            <div className="absolute w-2 h-2 bg-gray-300 rounded-full" style={{ top: '90%', left: '70%' }} />
            <div className="absolute w-1.5 h-1.5 bg-gray-400 rounded-full" style={{ top: '25%', left: '10%' }} />
            
            {/* Main circle with location icon */}
            <motion.div
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-28 h-28 bg-[#3b7ea1] rounded-full flex items-center justify-center shadow-xl"
            >
              <MapPin className="w-12 h-12 text-white" fill="white" stroke="white" />
            </motion.div>
          </div>

          {/* Text Content */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Need Your Location</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Please give us access to your<br />GPS Location
            </p>
          </div>
          
          {/* Error Message */}
          {locationError && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl w-full">
              <p className="text-xs text-amber-800 leading-relaxed text-center">{locationError}</p>
            </div>
          )}
          
          {/* Buttons */}
          <div className="w-full space-y-4">
            <button
              onClick={requestLocation}
              className="w-full bg-[#c94a4a] hover:bg-[#b43d3d] text-white font-semibold py-4 px-6 rounded-full transition-all transform hover:scale-[1.02] shadow-lg text-sm tracking-wide"
            >
              Turn on Location Services
            </button>
            
            <button
              onClick={skipLocation}
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-3 px-6 transition-all text-sm"
            >
              No, other Time
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-hidden">
      {/* Back button - floating on map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 left-4 z-50"
      >
        <Link href="/">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow-lg hover:shadow-xl transition-all group cursor-pointer border border-gray-200">
            <ArrowLeft className="w-4 h-4 text-gray-700 group-hover:-translate-x-1 transition-transform" />
          </button>
        </Link>
      </motion.div>

      {/* Building Selector Dropdown - Top Center */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 sm:px-4"
      >
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Dropdown Header */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                  {selectedDestination ? selectedDestination.name : 'Select Destination'}
                </p>
                {selectedDestination && (
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    {selectedDestination.floor} • {selectedDestination.section}
                  </p>
                )}
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform shrink-0 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown List */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-200 overflow-hidden"
              >
                <div className="max-h-96 overflow-y-auto">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setSelectedDestination(location);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedDestination?.id === location.id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{location.name}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                            {location.floor} • {location.section}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0 ${
                            location.category === 'Emergency'
                              ? 'bg-red-100 text-red-700'
                              : location.category === 'Department'
                              ? 'bg-blue-100 text-blue-700'
                              : location.category === 'Service'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {location.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start Navigation Button */}
          {selectedDestination && !isNavigating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-2 sm:p-3 border-t border-gray-200"
            >
              <button
                onClick={startNavigation}
                className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Navigation className="w-4 h-4" />
                Start Navigation
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Full-screen Map */}
      <div className="absolute inset-0">
        <InteractiveMapLeaflet 
          isDarkMode={false} 
          fullScreen 
          selectedLocationId={isNavigating ? selectedDestination?.id : undefined}
          onDistanceUpdate={setDistance}
        />
      </div>

      {/* Swipeable Bottom Panel - Only show when navigating */}
      {isNavigating && selectedDestination && (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isPanelOpen ? '0%' : 'calc(100% - 120px)' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y < -100) {
            setIsPanelOpen(true);
          } else if (info.offset.y > 100) {
            setIsPanelOpen(false);
          }
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl"
        style={{ height: '70vh' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Panel Header */}
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{selectedDestination.name}</h2>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {selectedDestination.floor} • {selectedDestination.section}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <ChevronUp
                className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform ${
                  isPanelOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 140px)' }}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Route Information</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-blue-50 rounded-xl p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-blue-600 mb-0.5 sm:mb-1">Distance</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">
                    {distance !== null ? `${distance.toFixed(1)}m` : 'Calculating...'}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-green-600 mb-0.5 sm:mb-1">ETA</p>
                  <p className="text-sm sm:text-lg font-bold text-green-900">
                    {distance !== null ? `~${Math.ceil(distance / 1.4)}s` : '~2 min'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Directions</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 rounded-xl border-l-4 border-purple-500">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                    <Navigation className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Follow the purple path on the map</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Your live location is being tracked</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] sm:text-xs font-bold">1</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Navigate to {selectedDestination.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">Located at {selectedDestination.floor}, {selectedDestination.section}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stop Navigation Button */}
            <button
              onClick={() => {
                setIsNavigating(false);
                setSelectedDestination(null);
                setIsPanelOpen(false);
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all text-sm sm:text-base"
            >
              Stop Navigation
            </button>
          </div>
        </div>
      </motion.div>
      )}
    </div>
  );
}

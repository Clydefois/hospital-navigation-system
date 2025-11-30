'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, ChevronDown, Navigation, CornerUpRight, Compass, LocateFixed, XCircle, ChevronLeft, ChevronRight, User, Mail, Phone } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import Loader from '@/components/Loader';

// Dynamic import to avoid SSR issues with Leaflet
const InteractiveMapLeaflet = dynamic(
  () => import('@/components/InteractiveMapLeaflet'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Loader text="Loading map..." />
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

// Department ID mapping from DepartmentDirectory to InteractiveMapLeaflet
const departmentIdMapping: Record<string, string> = {
  'emergency': '14',
  'doctors-clinic': '18',
  'radiology': '12',
  'orthopedic': '11',
  'cafeteria': '8',
  'comfort-room': '7',
  'cardio-pulmonary': '15',
  'diagnostic-lab': '16',
  'neurology': '6',
  'pediatrics': '10',
  'surgery': '9',
  'nephrology': '2',
  'dermatology': '17',
  'ophthalmology': '5',
  'church': '13',
  'parking': 'parking',
};

// Doctor/Staff data for each department
const departmentStaff: Record<string, { name: string; role: string; email?: string; phone?: string }[]> = {
  '2': [ // Nephrology
    { name: 'Dr. Maria Santos', role: 'Head Nephrologist', email: 'msantos@cmz.edu.ph', phone: '+63 912 345 6789' },
    { name: 'Dr. Jose Reyes', role: 'Nephrologist', email: 'jreyes@cmz.edu.ph' },
  ],
  '5': [ // Ophthalmology
    { name: 'Dr. Anna Cruz', role: 'Head Ophthalmologist', email: 'acruz@cmz.edu.ph', phone: '+63 912 345 6790' },
    { name: 'Dr. Miguel Torres', role: 'Eye Surgeon', email: 'mtorres@cmz.edu.ph' },
  ],
  '6': [ // Neurology
    { name: 'Dr. Carlos Mendoza', role: 'Head Neurologist', email: 'cmendoza@cmz.edu.ph', phone: '+63 912 345 6791' },
    { name: 'Dr. Elena Garcia', role: 'Neurologist', email: 'egarcia@cmz.edu.ph' },
  ],
  '9': [ // Surgery
    { name: 'Dr. Roberto Aquino', role: 'Chief Surgeon', email: 'raquino@cmz.edu.ph', phone: '+63 912 345 6792' },
    { name: 'Dr. Patricia Lim', role: 'General Surgeon', email: 'plim@cmz.edu.ph' },
    { name: 'Dr. Antonio Bautista', role: 'Surgical Resident', email: 'abautista@cmz.edu.ph' },
  ],
  '10': [ // Pediatrics
    { name: 'Dr. Sofia Villanueva', role: 'Head Pediatrician', email: 'svillanueva@cmz.edu.ph', phone: '+63 912 345 6793' },
    { name: 'Dr. Marco dela Cruz', role: 'Pediatrician', email: 'mdelacruz@cmz.edu.ph' },
  ],
  '11': [ // Orthopedic
    { name: 'Dr. Fernando Ramos', role: 'Head Orthopedist', email: 'framos@cmz.edu.ph', phone: '+63 912 345 6794' },
    { name: 'Dr. Isabella Navarro', role: 'Orthopedic Surgeon', email: 'inavarro@cmz.edu.ph' },
  ],
  '12': [ // Radiology
    { name: 'Dr. Ricardo Tan', role: 'Head Radiologist', email: 'rtan@cmz.edu.ph', phone: '+63 912 345 6795' },
    { name: 'Tech. Angela Morales', role: 'Radiology Technician', email: 'amorales@cmz.edu.ph' },
  ],
  '14': [ // Emergency
    { name: 'Dr. Luis Fernandez', role: 'ER Director', email: 'lfernandez@cmz.edu.ph', phone: '+63 912 345 6796' },
    { name: 'Dr. Carmen Diaz', role: 'Emergency Physician', email: 'cdiaz@cmz.edu.ph' },
    { name: 'Nurse Joy Santos', role: 'Head ER Nurse', email: 'jsantos@cmz.edu.ph' },
  ],
  '15': [ // Cardio-Pulmonary
    { name: 'Dr. Eduardo Lopez', role: 'Head Cardiologist', email: 'elopez@cmz.edu.ph', phone: '+63 912 345 6797' },
    { name: 'Dr. Rosa Martinez', role: 'Pulmonologist', email: 'rmartinez@cmz.edu.ph' },
  ],
  '16': [ // Diagnostic/Laboratory
    { name: 'Dr. Vincent Sy', role: 'Lab Director', email: 'vsy@cmz.edu.ph', phone: '+63 912 345 6798' },
    { name: 'Tech. Maria Gonzales', role: 'Senior Lab Technician', email: 'mgonzales@cmz.edu.ph' },
  ],
  '17': [ // Dermatology
    { name: 'Dr. Bianca Ocampo', role: 'Head Dermatologist', email: 'bocampo@cmz.edu.ph', phone: '+63 912 345 6799' },
    { name: 'Dr. Rafael Santos', role: 'Dermatologist', email: 'rsantos@cmz.edu.ph' },
  ],
  '18': [ // Doctors' Clinic
    { name: 'Dr. Manuel Cruz', role: 'General Practitioner', email: 'mcruz@cmz.edu.ph', phone: '+63 912 345 6800' },
    { name: 'Dr. Teresa Reyes', role: 'Family Medicine', email: 'treyes@cmz.edu.ph' },
  ],
  '13': [ // Church
    { name: 'Fr. Joseph Dela Rosa', role: 'Chaplain', email: 'jdelarosa@cmz.edu.ph' },
  ],
  '7': [], // Comfort Room - no staff
  '8': [ // Cafeteria
    { name: 'Mrs. Linda Castillo', role: 'Cafeteria Manager', email: 'lcastillo@cmz.edu.ph' },
  ],
};

// Inner component that uses useSearchParams
function NavigationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<typeof locations[0] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [followMode, setFollowMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const initialLocateRef = useRef<string | null>(null);

  // Handle locate query parameter from DepartmentDirectory
  useEffect(() => {
    const locateId = searchParams.get('locate');
    if (locateId) {
      initialLocateRef.current = locateId;
    }
  }, [searchParams]);

  // Set destination when location is granted and we have an initial locate
  useEffect(() => {
    if (locationGranted && initialLocateRef.current) {
      const locateId = initialLocateRef.current;
      initialLocateRef.current = null; // Clear so it doesn't trigger again
      
      // Map the department ID to the room ID
      const roomId = departmentIdMapping[locateId] || locateId;
      const location = locations.find(l => l.id === roomId);
      if (location) {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setSelectedDestination(location);
          setFocusTrigger(prev => prev + 1);
        }, 100);
      }
    }
  }, [locationGranted]);

  const navigateWithLoader = (path: string, text: string) => {
    setLoadingText(text);
    setIsLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 2000);
  };

  const handleRecenter = useCallback(() => {
    setRecenterTrigger(prev => prev + 1);
    setFollowMode(true);
  }, []);

  // Handle destination selection - auto focus on building
  const handleSelectDestination = useCallback((location: typeof locations[0]) => {
    setSelectedDestination(location);
    setIsDropdownOpen(false);
    // Trigger focus on the building
    setFocusTrigger(prev => prev + 1);
  }, []);

  const requestLocation = async () => {
    setIsRequestingLocation(true);
    setLocationError(null);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported. Proceeding to map...');
      setTimeout(() => setLocationGranted(true), 1000);
      return;
    }

    // Use a promise wrapper for better control
    const getPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, // Start with low accuracy for faster response
          timeout: 5000, // 5 second timeout
          maximumAge: 300000 // Accept cached position up to 5 minutes old
        });
      });
    };

    try {
      const position = await getPosition();
      console.log('Location obtained:', position.coords.latitude, position.coords.longitude);
      setIsRequestingLocation(false);
      setLocationGranted(true);
    } catch (error) {
      console.log('Geolocation error, proceeding anyway:', error);
      setIsRequestingLocation(false);
      // Don't show error, just proceed - the map will handle GPS
      setLocationGranted(true);
    }
  };

  const skipLocation = () => {
    setLocationGranted(true);
    setLocationError(null);
  };

  const startNavigation = () => {
    if (selectedDestination) {
      setIsNavigating(true);
      setIsDropdownOpen(false);
      setFollowMode(true);
    }
  };

  if (!locationGranted) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6">
        {/* Full Screen Loader */}
        {isLoading && <Loader text={loadingText} />}
        
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-4"
        >
          <button 
            onClick={() => navigateWithLoader('/', 'Going back...')}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
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
              disabled={isRequestingLocation}
              className={`w-full bg-[#c94a4a] hover:bg-[#b43d3d] text-white font-semibold py-4 px-6 rounded-full transition-all transform hover:scale-[1.02] shadow-lg text-sm tracking-wide flex items-center justify-center gap-2 ${isRequestingLocation ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isRequestingLocation ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Getting Location...
                </>
              ) : (
                'Turn on Location Services'
              )}
            </button>
            
            <button
              onClick={skipLocation}
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-3 px-6 transition-all text-sm"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-hidden">
      {/* Back button - floating on map */}
      {/* Full Screen Loader */}
      {isLoading && <Loader text={loadingText} />}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 left-4 z-50"
      >
        <button 
          onClick={() => navigateWithLoader('/', 'Going back...')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-gray-50 active:scale-90 active:bg-gray-100 transition-all duration-150 group cursor-pointer border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium text-gray-700">Home</span>
        </button>
      </motion.div>

      {/* Building Selector Dropdown - Top Center - Hide when navigating */}
      <AnimatePresence>
      {!isNavigating && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 sm:px-4"
      >
        <div 
          className="rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/30"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Dropdown Header */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                }}
              >
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {selectedDestination ? selectedDestination.name : 'Select Destination'}
                </p>
                {selectedDestination ? (
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {selectedDestination.floor} • {selectedDestination.section}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-400">Tap to choose where to go</p>
                )}
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform shrink-0 ${
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
                className="border-t border-gray-200/50 overflow-hidden"
              >
                <div className="max-h-80 overflow-y-auto">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleSelectDestination(location)}
                      className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 text-left hover:bg-white/60 transition-colors border-b border-gray-100/50 last:border-b-0 ${
                        selectedDestination?.id === location.id ? 'bg-green-50/80' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{location.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {location.floor} • {location.section}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shrink-0 font-medium ${
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
              className="p-3 sm:p-4 border-t border-gray-200/50"
            >
              <button
                onClick={startNavigation}
                className="w-full text-white font-semibold py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl hover:opacity-90 active:scale-[0.98] active:opacity-100 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                }}
              >
                <Navigation className="w-5 h-5" />
                Start Navigation
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
      )}
      </AnimatePresence>

      {/* Full-screen Map */}
      <div className="absolute inset-0">
        <InteractiveMapLeaflet 
          isDarkMode={false} 
          fullScreen 
          selectedLocationId={isNavigating ? selectedDestination?.id : selectedDestination?.id}
          onDistanceUpdate={setDistance}
          recenterTrigger={recenterTrigger}
          followMode={followMode}
          onMapInteraction={() => setFollowMode(false)}
          focusTrigger={focusTrigger}
        />
      </div>

      {/* Collapsible Staff Panel - Left side */}
      <AnimatePresence>
        {selectedDestination && !isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 flex items-center"
          >
            {/* Panel Container */}
            <motion.div
              initial={false}
              animate={{ x: isPanelOpen ? 0 : -288 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="flex items-center"
            >
              {/* Panel Content */}
              <div 
                className="w-72 sm:w-72 max-h-[60vh] rounded-r-2xl shadow-2xl border border-white/30 border-l-0 overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                {/* Panel Header */}
                <div className="px-4 py-3 border-b border-gray-200/50">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{selectedDestination.name}</h3>
                  <p className="text-xs text-gray-500">Staff & Contact</p>
                </div>

                {/* Staff List */}
                <div className="max-h-[calc(60vh-60px)] overflow-y-auto">
                  {departmentStaff[selectedDestination.id]?.length > 0 ? (
                    <div className="p-3 space-y-2">
                      {departmentStaff[selectedDestination.id].map((staff, index) => (
                        <div 
                          key={index}
                          className="p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                              style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              }}
                            >
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{staff.name}</p>
                              <p className="text-xs text-gray-500">{staff.role}</p>
                              {staff.email && (
                                <a 
                                  href={`mailto:${staff.email}`}
                                  className="flex items-center gap-1.5 mt-1.5 text-xs text-green-600 hover:text-green-700 transition-colors"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{staff.email}</span>
                                </a>
                              )}
                              {staff.phone && (
                                <a 
                                  href={`tel:${staff.phone}`}
                                  className="flex items-center gap-1.5 mt-1 text-xs text-green-600 hover:text-green-700 transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{staff.phone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No staff information available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Toggle Button - Attached to panel */}
              <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="h-16 w-7 flex items-center justify-center rounded-r-lg shadow-lg cursor-pointer hover:w-8 transition-all -ml-px"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                }}
              >
                {isPanelOpen ? (
                  <ChevronLeft className="w-4 h-4 text-white" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white" />
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphism Direction Card - Bottom center when navigating */}
      <AnimatePresence>
        {isNavigating && selectedDestination && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-6 left-4 right-4 z-40 flex flex-col items-center gap-3"
          >
            {/* Main Direction Card with Glassmorphism */}
            <div 
              className="w-full max-w-sm rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/30"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-4">
                {/* Turn Arrow Icon - Green theme */}
                <div className="shrink-0">
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    }}
                  >
                    <CornerUpRight className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Distance and Destination */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                      {distance !== null ? Math.round(distance) : '...'}
                    </span>
                    <span className="text-xl sm:text-2xl font-semibold text-gray-700">m</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 font-medium truncate mt-0.5">
                    {selectedDestination.name}
                  </p>
                </div>
              </div>

              {/* ETA Row */}
              <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs sm:text-sm text-gray-500">
                    ETA: ~{distance !== null ? Math.ceil(distance / 1.4) : '...'} sec walking
                  </span>
                </div>
                <span className="text-xs text-gray-400">Live tracking</span>
              </div>

              {/* Stop Navigation Button - Emphasized */}
              <button
                onClick={() => {
                  setIsNavigating(false);
                  setSelectedDestination(null);
                  setFollowMode(false);
                }}
                className="mt-4 w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all duration-150 hover:opacity-90 hover:shadow-xl active:scale-[0.96] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                }}
              >
                <XCircle className="w-5 h-5" />
                Stop Navigating
              </button>
            </div>

            {/* Recenter Button - Green theme */}
            <motion.button
              onClick={handleRecenter}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all duration-150 cursor-pointer ${
                followMode 
                  ? 'text-white hover:shadow-xl' 
                  : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-xl'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                ...(followMode && { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }),
              }}
            >
              <LocateFixed className={`w-5 h-5 ${followMode ? 'text-white' : 'text-green-500'}`} />
              <span className="text-sm font-medium">
                {followMode ? 'Following' : 'Re-center'}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass/North Button - Top Right when navigating */}
      <AnimatePresence>
        {isNavigating && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleRecenter}
            className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-150 cursor-pointer"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <Compass className="w-6 h-6 text-gray-700" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrap in Suspense because of useSearchParams
export default function NavigationPage() {
  return (
    <Suspense fallback={<Loader text="Loading navigation..." />}>
      <NavigationPageContent />
    </Suspense>
  );
}

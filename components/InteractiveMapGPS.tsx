'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { Stage, Layer, Image as KonvaImage, Circle } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';

interface Location {
  id: string;
  name: string;
  category: string;
  color: string;
  x: number;
  y: number;
}

interface InteractiveMapGPSProps {
  isDarkMode?: boolean;
  fullScreen?: boolean;
  selectedLocationId?: string;
}

// Real GPS coordinates from Google Maps: 6.910139503770937, 122.07512615988898
const GPS_BOUNDARIES = {
  topLeft: { lat: 6.910364, lng: 122.074901 },
  bottomRight: { lat: 6.909915, lng: 122.075351 },
};

const FLOOR_PLAN_WIDTH = 1056;
const FLOOR_PLAN_HEIGHT = 768;

const locations: Location[] = [
  { id: '1', name: 'Emergency Room', category: 'Emergency', color: '#ef4444', x: 603, y: 635 },
  { id: '2', name: 'Surgery Department', category: 'Department', color: '#8b5cf6', x: 287, y: 422 },
  { id: '3', name: 'Cardio-Pulmonary', category: 'Department', color: '#3b82f6', x: 822, y: 182 },
  { id: '4', name: 'Neurology Department', category: 'Department', color: '#06b6d4', x: 561, y: 310 },
  { id: '5', name: 'Pediatric Department', category: 'Department', color: '#ec4899', x: 563, y: 430 },
  { id: '6', name: 'Cafeteria', category: 'Amenity', color: '#f59e0b', x: 850, y: 310 },
  { id: '7', name: 'Doctors Clinic', category: 'Service', color: '#10b981', x: 848, y: 626 },
  { id: '8', name: 'Orthopedic Department', category: 'Department', color: '#6366f1', x: 781, y: 431 },
  { id: '9', name: 'Dermatology Department', category: 'Department', color: '#8b5cf6', x: 318, y: 92 },
  { id: '10', name: 'Nephrology Department', category: 'Department', color: '#06b6d4', x: 205, y: 236 },
  { id: '11', name: 'Ophthalmology Department', category: 'Department', color: '#6366f1', x: 354, y: 237 },
  { id: '12', name: 'Radiology Department', category: 'Service', color: '#10b981', x: 870, y: 448 },
  { id: '13', name: 'Diagnostic/Laboratory', category: 'Service', color: '#10b981', x: 797, y: 52 },
  { id: '14', name: 'Restrooms', category: 'Amenity', color: '#f59e0b', x: 744, y: 310 },
];

function gpsToPixel(lat: number, lng: number): { x: number; y: number } | null {
  const { topLeft, bottomRight } = GPS_BOUNDARIES;
  
  if (lat > topLeft.lat || lat < bottomRight.lat || lng < topLeft.lng || lng > bottomRight.lng) {
    return null;
  }
  
  const relX = (lng - topLeft.lng) / (bottomRight.lng - topLeft.lng);
  const relY = (lat - topLeft.lat) / (bottomRight.lat - topLeft.lat);
  
  return {
    x: relX * FLOOR_PLAN_WIDTH,
    y: Math.abs(relY) * FLOOR_PLAN_HEIGHT,
  };
}

function FloorPlanImage({ src }: { src: string }) {
  const [image] = useImage(src);
  return <KonvaImage image={image} width={FLOOR_PLAN_WIDTH} height={FLOOR_PLAN_HEIGHT} />;
}

export default function InteractiveMapGPS({ isDarkMode = false, fullScreen = false, selectedLocationId }: InteractiveMapGPSProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [zoom, setZoom] = useState(fullScreen ? 2 : 1);
  const [userPosition, setUserPosition] = useState<{ x: number; y: number } | null>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [containerWidth, setContainerWidth] = useState(FLOOR_PLAN_WIDTH);
  const watchIdRef = useRef<number | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastDistRef = useRef(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(Math.min(width, FLOOR_PLAN_WIDTH));
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setGpsError(null);

    // First get current position immediately
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Current GPS Position:', latitude, longitude);
        const pixelPos = gpsToPixel(latitude, longitude);

        if (pixelPos) {
          setUserPosition(pixelPos);
          console.log('Mapped to pixel:', pixelPos);
          setGpsError(null);
        } else {
          console.log('Position outside mapped area');
          setGpsError(`Outside mapped area. Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        }
      },
      (error) => {
        console.error('GPS Error:', error);
        setGpsError(`GPS Error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Then watch for position updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('GPS Update:', latitude, longitude);
        const pixelPos = gpsToPixel(latitude, longitude);

        if (pixelPos) {
          setUserPosition(pixelPos);
          console.log('Updated position:', pixelPos);
          setGpsError(null);
        } else {
          console.log('Position outside mapped area');
          setGpsError(`Outside mapped area. Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        }
      },
      (error) => {
        console.error('GPS Watch Error:', error);
        setGpsError(`GPS Error: ${error.message}`);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    watchIdRef.current = watchId;
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setUserPosition(null);
  };

  // Auto-select location and start tracking when selectedLocationId changes
  useEffect(() => {
    if (selectedLocationId) {
      const location = locations.find(l => l.id === selectedLocationId);
      if (location) {
        setTimeout(() => {
          setSelectedLocation(location);
          if (!isTracking) {
            startTracking();
          }
        }, 0);
      }
    }
  }, [selectedLocationId, isTracking]);

  // Zoom to location when user position changes
  useEffect(() => {
    if (fullScreen && userPosition && stageRef.current) {
      const stage = stageRef.current;
      const newZoom = 2.5;
      const centerX = (stage.width() / 2) - (userPosition.x * newZoom);
      const centerY = (stage.height() / 2) - (userPosition.y * newZoom);
      
      setTimeout(() => {
        setZoom(newZoom);
        setStagePos({ x: centerX, y: centerY });
      }, 0);
    }
  }, [userPosition, fullScreen]);

  // Zoom to selected location
  useEffect(() => {
    if (fullScreen && selectedLocation && stageRef.current) {
      const stage = stageRef.current;
      const newZoom = 2.5;
      const centerX = (stage.width() / 2) - (selectedLocation.x * newZoom);
      const centerY = (stage.height() / 2) - (selectedLocation.y * newZoom);
      
      setTimeout(() => {
        setZoom(newZoom);
        setStagePos({ x: centerX, y: centerY });
      }, 0);
    }
  }, [selectedLocation, fullScreen]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Touch handlers for pinch-to-zoom
  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    if (!fullScreen) return;
    
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    const stage = stageRef.current;

    if (!stage) return;

    if (touch1 && touch2) {
      // Multi-touch: pinch to zoom
      e.evt.preventDefault();

      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };

      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const center = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      if (!lastCenterRef.current) {
        lastCenterRef.current = center;
        lastDistRef.current = dist;
        return;
      }

      const pointTo = {
        x: (center.x - stage.x()) / zoom,
        y: (center.y - stage.y()) / zoom,
      };

      const scale = dist / lastDistRef.current;
      const newZoom = Math.max(0.5, Math.min(3, zoom * scale));

      const newPos = {
        x: center.x - pointTo.x * newZoom,
        y: center.y - pointTo.y * newZoom,
      };

      setZoom(newZoom);
      setStagePos(newPos);

      lastDistRef.current = dist;
      lastCenterRef.current = center;
    }
  };

  const handleTouchEnd = () => {
    lastCenterRef.current = null;
    lastDistRef.current = 0;
  };

  // Wheel zoom handler for desktop
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = zoom;
    
    // Get pointer position
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 
      ? Math.min(oldScale * scaleBy, 3) 
      : Math.max(oldScale / scaleBy, 0.5);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setZoom(newScale);
    setStagePos(newPos);
  };

  return (
    <div className={fullScreen ? "w-full h-full relative" : "w-full relative px-3 md:px-6 pb-6 md:pb-8"}>
      {/* Minimalist Container */}
      <div className={fullScreen ? "w-full h-full" : "max-w-6xl mx-auto space-y-4 md:space-y-6"}>
        
        {/* Floor Plan - Top */}
        <div className="relative h-full" ref={containerRef}>
          {/* Zoom Controls - Top Right for both modes */}
          <div className={`absolute ${fullScreen ? 'top-16 right-4' : 'top-2 right-2 md:top-4 md:right-4'} flex gap-1.5 md:gap-2 z-20`}>
            <button 
              onClick={() => {
                const newZoom = Math.min(zoom + 0.3, 3);
                setZoom(newZoom);
              }}
              className={fullScreen 
                ? "p-3 bg-white/90 hover:bg-white rounded-full transition-all shadow-xl group"
                : "p-2 md:p-2.5 bg-[#002a54]/90 hover:bg-[#003366] rounded-lg transition-all border border-blue-800/50 shadow-lg group"
              }
              title="Zoom In"
            >
              <ZoomIn className={fullScreen 
                ? "w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors"
                : "w-3.5 h-3.5 md:w-4 md:h-4 text-blue-200 group-hover:text-cyan-400 transition-colors"
              } />
            </button>
            <button 
              onClick={() => {
                const newZoom = Math.max(zoom - 0.3, 0.5);
                setZoom(newZoom);
                if (newZoom <= 1) {
                  setStagePos({ x: 0, y: 0 });
                }
              }}
              className={fullScreen 
                ? "p-3 bg-white/90 hover:bg-white rounded-full transition-all shadow-xl group"
                : "p-2 md:p-2.5 bg-[#002a54]/90 hover:bg-[#003366] rounded-lg transition-all border border-blue-800/50 shadow-lg group"
              }
              title="Zoom Out"
            >
              <ZoomOut className={fullScreen 
                ? "w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors"
                : "w-3.5 h-3.5 md:w-4 md:h-4 text-blue-200 group-hover:text-cyan-400 transition-colors"
              } />
            </button>
            {!fullScreen && (
            <button 
              onClick={() => setZoom(1)}
              className="px-2 py-2 md:px-3 md:py-2.5 bg-[#002a54]/90 hover:bg-[#003366] rounded-lg transition-all border border-blue-800/50 shadow-lg text-xs font-semibold text-blue-200 hover:text-cyan-400"
              title="Reset"
            >
              Reset
            </button>
            )}
          </div>

          {/* Map Canvas */}
          <div className={fullScreen 
            ? "w-full h-full bg-gray-200 flex items-center justify-center" 
            : "rounded-lg md:rounded-xl overflow-hidden shadow-2xl border border-blue-800/30 bg-[#002a54]/30 w-full flex items-center justify-center"
          }>
            <div className="w-full h-full" style={!fullScreen ? { maxWidth: `${FLOOR_PLAN_WIDTH}px` } : {}}>
              <div className={fullScreen ? "w-full h-full flex items-center justify-center" : "relative w-full"} style={!fullScreen ? { paddingBottom: `${(FLOOR_PLAN_HEIGHT / FLOOR_PLAN_WIDTH) * 100}%` } : {}}>
                <div className={fullScreen ? "w-full h-full flex items-center justify-center" : "absolute inset-0 flex items-center justify-center"}>
                  <Stage
                    ref={stageRef}
                    width={fullScreen ? window.innerWidth : Math.min(containerWidth, FLOOR_PLAN_WIDTH) * zoom}
                    height={fullScreen ? window.innerHeight : Math.min(containerWidth, FLOOR_PLAN_WIDTH) * (FLOOR_PLAN_HEIGHT / FLOOR_PLAN_WIDTH) * zoom}
                    scaleX={fullScreen ? zoom : Math.min(containerWidth / FLOOR_PLAN_WIDTH, 1) * zoom}
                    scaleY={fullScreen ? zoom : Math.min(containerWidth / FLOOR_PLAN_WIDTH, 1) * zoom}
                    draggable={zoom > 1}
                    x={stagePos.x}
                    y={stagePos.y}
                    onDragEnd={(e) => {
                      setStagePos({
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    }}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onWheel={handleWheel}
                  >
                    <Layer>
                      <FloorPlanImage src="/HospitalFloorPlan.png" />
                      
                      {/* User position marker */}
                      {userPosition && (
                        <>
                          <Circle
                            x={userPosition.x}
                            y={userPosition.y}
                            radius={25}
                            fill="#22c55e"
                            opacity={0.2}
                          />
                          <Circle
                            x={userPosition.x}
                            y={userPosition.y}
                            radius={12}
                            fill="#22c55e"
                            stroke="#ffffff"
                            strokeWidth={4}
                            shadowBlur={15}
                            shadowColor="#22c55e"
                            shadowOpacity={0.6}
                          />
                        </>
                      )}
                    </Layer>
                  </Stage>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel - Below Map - Hide in fullscreen */}
        {!fullScreen && (
        <div className={`backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-sm transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/50 border border-gray-700/50' 
            : 'bg-white/80 border border-gray-200/50'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* GPS Tracking */}
            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={`p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                isTracking
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900 shadow-sm'
              }`}
            >
              <MapPin className={`w-4 h-4 ${isTracking ? 'animate-pulse' : ''}`} />
              <span className="text-sm">{isTracking ? 'Stop GPS' : 'Start GPS'}</span>
            </button>

            {/* Search Locations */}
            <div className="relative sm:col-span-1 lg:col-span-2">
              <select
                value={selectedLocation?.id || ''}
                onChange={(e) => {
                  const loc = locations.find(l => l.id === e.target.value);
                  setSelectedLocation(loc || null);
                }}
                className={`w-full p-3 rounded-lg text-sm font-medium focus:ring-1 transition-all appearance-none cursor-pointer ${
                  isDarkMode
                    ? 'bg-gray-700/50 border border-gray-600/50 text-white focus:border-blue-500 focus:ring-blue-500/50'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/50'
                }`}
              >
                <option value="">Select a location...</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.category}
                  </option>
                ))}
              </select>
              <MapPin className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>

            {/* Status Indicator */}
            <div className={`p-3 rounded-lg flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'bg-gray-700/50 border border-gray-600/50'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              {gpsError ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500 font-medium">GPS Error</span>
                </>
              ) : userPosition ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Active</span>
                </>
              ) : (
                <>
                  <span className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Inactive</span>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {gpsError && (
            <div className={`mt-3 p-3 rounded-lg ${
              isDarkMode
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-xs ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}>{gpsError}</p>
            </div>
          )}

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className={`mt-3 p-3 rounded-lg ${
              isDarkMode
                ? 'bg-blue-500/10 border border-blue-500/30'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold mb-1 text-sm truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedLocation.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block font-medium ${
                    isDarkMode
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {selectedLocation.category}
                  </span>
                </div>
                <div 
                  className="w-3 h-3 rounded-full ring-2 shadow-sm shrink-0"
                  style={{ 
                    backgroundColor: selectedLocation.color
                  }}
                />
              </div>
            </div>
          )}
        </div>
        )}

        {/* Legend - Mobile Responsive - Hide in fullscreen */}
        {!fullScreen && (
        <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
            <span>Emergency</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full"></div>
            <span>Departments</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
            <span>Services</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-orange-500 rounded-full"></div>
            <span>Amenities</span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

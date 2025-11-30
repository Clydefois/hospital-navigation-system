'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { Stage, Layer, Image as KonvaImage, Circle, Line, Arrow, Rect } from 'react-konva';
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
  onDistanceUpdate?: (distance: number) => void;
}

// ============================================================
// 🔧 CALIBRATION SETTINGS - YOUR SCHOOL'S FLOOR PLAN
// ============================================================
// 
// FLOOR PLAN IS ROTATED 45° from standard map orientation
// The building sits diagonally on the real map
//
// Corner coordinates from Google Maps:
// Top-Left (image):     6.910682215525977, 122.07494812282795
// Top-Right (image):    6.911694254662391, 122.07671516345582
// Bottom-Left (image):  6.908425735280729, 122.07565795966138
// Bottom-Right (image): 6.9090104720590775, 122.07742500028922
//
const GPS_CORNERS = {
  topLeft:     { lat: 6.910682215525977, lng: 122.07494812282795 },
  topRight:    { lat: 6.911694254662391, lng: 122.07671516345582 },
  bottomLeft:  { lat: 6.908425735280729, lng: 122.07565795966138 },
  bottomRight: { lat: 6.9090104720590775, lng: 122.07742500028922 },
};

// For compatibility, also define boundaries as bounding box
const GPS_BOUNDARIES = {
  topLeft: { lat: Math.max(GPS_CORNERS.topLeft.lat, GPS_CORNERS.topRight.lat), 
             lng: Math.max(GPS_CORNERS.topRight.lng, GPS_CORNERS.bottomRight.lng) },
  bottomRight: { lat: Math.min(GPS_CORNERS.bottomLeft.lat, GPS_CORNERS.bottomRight.lat), 
                 lng: Math.min(GPS_CORNERS.topLeft.lng, GPS_CORNERS.bottomLeft.lng) },
};

// Building rotation angle (degrees) - the floor plan image needs to be rotated
// to match the real-world diagonal orientation
const BUILDING_ROTATION = -45; // Rotate 45° counterclockwise (left)

// Real-world dimensions for pixel-to-meter conversion
// Campus is approximately 280m diagonal based on coordinates
const REAL_WIDTH_METERS = 280;
const REAL_HEIGHT_METERS = 200;

// Your floor plan image dimensions (check your image file properties)
// Run: sips -g pixelWidth -g pixelHeight /path/to/your/image.png
const FLOOR_PLAN_WIDTH = 2000;
const FLOOR_PLAN_HEIGHT = 1455;

// Extended canvas size for showing position outside the building
// This creates a large "infinite" white area around the floor plan
const CANVAS_PADDING = 5000; // 5000 pixels of white space on each side
const CANVAS_WIDTH = FLOOR_PLAN_WIDTH + (CANVAS_PADDING * 2);
const CANVAS_HEIGHT = FLOOR_PLAN_HEIGHT + (CANVAS_PADDING * 2);

// The floor plan image file (place in /public folder)
const FLOOR_PLAN_IMAGE = "/HospitalFloorPlan.png";

// ============================================================

// Extended boundaries for showing position even when slightly outside
const EXTENDED_MARGIN = 0.0005; // ~50 meters buffer around the building
const GPS_BOUNDARIES_EXTENDED = {
  topLeft: { lat: GPS_BOUNDARIES.topLeft.lat + EXTENDED_MARGIN, lng: GPS_BOUNDARIES.topLeft.lng - EXTENDED_MARGIN },
  bottomRight: { lat: GPS_BOUNDARIES.bottomRight.lat - EXTENDED_MARGIN, lng: GPS_BOUNDARIES.bottomRight.lng + EXTENDED_MARGIN },
};

// Use extended boundaries for debug info display
void GPS_BOUNDARIES_EXTENDED;

// Location markers on the floor plan (x, y are pixel coordinates on your image)
// To find coordinates: open the image in any image editor and hover over locations
// The scale factor from old (1056x768) to new (2000x1455) is approximately 1.89
const locations: Location[] = [
  { id: '1', name: 'Emergency Room', category: 'Emergency', color: '#ef4444', x: 1142, y: 1202 },
  { id: '2', name: 'Surgery Department', category: 'Department', color: '#8b5cf6', x: 543, y: 799 },
  { id: '3', name: 'Cardio-Pulmonary', category: 'Department', color: '#3b82f6', x: 1556, y: 345 },
  { id: '4', name: 'Neurology Department', category: 'Department', color: '#06b6d4', x: 1062, y: 587 },
  { id: '5', name: 'Pediatric Department', category: 'Department', color: '#ec4899', x: 1066, y: 814 },
  { id: '6', name: 'Cafeteria', category: 'Amenity', color: '#f59e0b', x: 1609, y: 587 },
  { id: '7', name: 'Doctors Clinic', category: 'Service', color: '#10b981', x: 1605, y: 1185 },
  { id: '8', name: 'Orthopedic Department', category: 'Department', color: '#6366f1', x: 1478, y: 816 },
  { id: '9', name: 'Dermatology Department', category: 'Department', color: '#8b5cf6', x: 602, y: 174 },
  { id: '10', name: 'Nephrology Department', category: 'Department', color: '#06b6d4', x: 388, y: 447 },
  { id: '11', name: 'Ophthalmology Department', category: 'Department', color: '#6366f1', x: 670, y: 449 },
  { id: '12', name: 'Radiology Department', category: 'Service', color: '#10b981', x: 1647, y: 848 },
  { id: '13', name: 'Diagnostic/Laboratory', category: 'Service', color: '#10b981', x: 1509, y: 98 },
  { id: '14', name: 'Restrooms', category: 'Amenity', color: '#f59e0b', x: 1409, y: 587 },
];

function gpsToPixel(lat: number, lng: number): { x: number; y: number; isOutside: boolean } {
  // Use bilinear interpolation with 4 corners for diagonal/rotated building
  // This maps GPS coordinates to pixel positions accounting for the 45° rotation
  
  const { topLeft, topRight, bottomLeft } = GPS_CORNERS;
  
  // Create vectors for the quadrilateral edges
  // Top edge: topLeft to topRight
  // Left edge: topLeft to bottomLeft
  
  // We'll use a parametric approach:
  // Point P = (1-u)(1-v)*TL + u*(1-v)*TR + (1-u)*v*BL + u*v*BR
  // where u is horizontal parameter (0=left, 1=right)
  // and v is vertical parameter (0=top, 1=bottom)
  
  // Solve for u and v given lat/lng (approximate using inverse mapping)
  // For a roughly parallelogram shape, we can use a simpler approach:
  
  // Calculate the "horizontal" direction (top-left to top-right)
  const hDirLat = topRight.lat - topLeft.lat;
  const hDirLng = topRight.lng - topLeft.lng;
  
  // Calculate the "vertical" direction (top-left to bottom-left)
  const vDirLat = bottomLeft.lat - topLeft.lat;
  const vDirLng = bottomLeft.lng - topLeft.lng;
  
  // Vector from topLeft to the point
  const pLat = lat - topLeft.lat;
  const pLng = lng - topLeft.lng;
  
  // Solve the 2x2 linear system to find u and v:
  // pLat = u * hDirLat + v * vDirLat
  // pLng = u * hDirLng + v * vDirLng
  
  const det = hDirLat * vDirLng - hDirLng * vDirLat;
  
  if (Math.abs(det) < 1e-10) {
    // Degenerate case - fall back to simple bounding box
    const { topLeft: tl, bottomRight: br } = GPS_BOUNDARIES;
    const relX = (lat - br.lat) / (tl.lat - br.lat);
    const relY = (lng - br.lng) / (tl.lng - br.lng);
    return {
      x: CANVAS_PADDING + ((1 - relX) * FLOOR_PLAN_WIDTH),
      y: CANVAS_PADDING + ((1 - relY) * FLOOR_PLAN_HEIGHT),
      isOutside: relX < 0 || relX > 1 || relY < 0 || relY > 1,
    };
  }
  
  // Cramer's rule to solve for u and v
  const u = (pLat * vDirLng - pLng * vDirLat) / det;
  const v = (hDirLat * pLng - hDirLng * pLat) / det;
  
  // u=0 means left edge of image, u=1 means right edge
  // v=0 means top edge of image, v=1 means bottom edge
  
  // Check if user is within the building boundaries
  const isOutside = u < 0 || u > 1 || v < 0 || v > 1;
  
  // Map to pixel coordinates in floor plan space
  const floorPlanX = CANVAS_PADDING + (u * FLOOR_PLAN_WIDTH);
  const floorPlanY = CANVAS_PADDING + (v * FLOOR_PLAN_HEIGHT);
  
  // Transform to rotated canvas space to match the rotated floor plan image
  const rotated = transformToRotatedSpace(floorPlanX, floorPlanY);
  
  return {
    x: rotated.x,
    y: rotated.y,
    isOutside,
  };
}

// Transform pixel coordinates from floor plan space to rotated canvas space
// This accounts for the 45° rotation of the floor plan image
function transformToRotatedSpace(x: number, y: number): { x: number; y: number } {
  const centerX = CANVAS_PADDING + FLOOR_PLAN_WIDTH / 2;
  const centerY = CANVAS_PADDING + FLOOR_PLAN_HEIGHT / 2;
  
  // Translate to center
  const dx = x - centerX;
  const dy = y - centerY;
  
  // Rotate by BUILDING_ROTATION degrees
  const angleRad = (BUILDING_ROTATION * Math.PI) / 180;
  const rotatedX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
  const rotatedY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);
  
  // Translate back
  return {
    x: centerX + rotatedX,
    y: centerY + rotatedY,
  };
}

function FloorPlanImage({ src }: { src: string }) {
  const [image] = useImage(src);
  
  // Calculate center point for rotation
  const centerX = CANVAS_PADDING + FLOOR_PLAN_WIDTH / 2;
  const centerY = CANVAS_PADDING + FLOOR_PLAN_HEIGHT / 2;
  
  return (
    <>
      {/* Infinite white/light gray background extending beyond the floor plan */}
      <Rect
        x={0}
        y={0}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        fill="#f5f5f5"
      />
      {/* Grid pattern to help visualize distance outside building */}
      {Array.from({ length: Math.ceil(CANVAS_WIDTH / 200) }).map((_, i) => (
        <Line
          key={`vgrid-${i}`}
          points={[i * 200, 0, i * 200, CANVAS_HEIGHT]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: Math.ceil(CANVAS_HEIGHT / 200) }).map((_, i) => (
        <Line
          key={`hgrid-${i}`}
          points={[0, i * 200, CANVAS_WIDTH, i * 200]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      ))}
      {/* Building outline/border - rotated to match real-world orientation */}
      <Rect
        x={CANVAS_PADDING}
        y={CANVAS_PADDING}
        width={FLOOR_PLAN_WIDTH}
        height={FLOOR_PLAN_HEIGHT}
        stroke="#3b82f6"
        strokeWidth={4}
        dash={[10, 5]}
        rotation={BUILDING_ROTATION}
        offsetX={-FLOOR_PLAN_WIDTH / 2}
        offsetY={-FLOOR_PLAN_HEIGHT / 2}
      />
      {/* The actual floor plan image - rotated 45° to match the diagonal building */}
      <KonvaImage 
        image={image} 
        x={centerX}
        y={centerY}
        width={FLOOR_PLAN_WIDTH} 
        height={FLOOR_PLAN_HEIGHT}
        rotation={BUILDING_ROTATION}
        offsetX={FLOOR_PLAN_WIDTH / 2}
        offsetY={FLOOR_PLAN_HEIGHT / 2}
      />
    </>
  );
}

export default function InteractiveMapGPS({ isDarkMode = false, fullScreen = false, selectedLocationId, onDistanceUpdate }: InteractiveMapGPSProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [zoom, setZoom] = useState(1);
  // Default position set for simulation mode testing (with CANVAS_PADDING offset)
  const [userPosition, setUserPosition] = useState<{ x: number; y: number } | null>({ x: CANVAS_PADDING + 600, y: CANVAS_PADDING + 900 });
  const [isUserOutside, setIsUserOutside] = useState(false);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [containerWidth, setContainerWidth] = useState(FLOOR_PLAN_WIDTH);
  const [isPinching, setIsPinching] = useState(false);
  const [simulationMode, setSimulationMode] = useState(true); // Default ON for testing anywhere
  const [rawGpsCoords, setRawGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [compassEnabled, setCompassEnabled] = useState(false);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastDistRef = useRef(0);
  const isPinchingRef = useRef(false);

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

  // Track device orientation for compass heading (direction user is facing)
  useEffect(() => {
    let permissionGranted = false;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // For iOS Safari - webkitCompassHeading gives true north heading
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iosHeading = (event as any).webkitCompassHeading;
      
      if (iosHeading !== undefined && iosHeading !== null) {
        // iOS: webkitCompassHeading is degrees from north (0-360)
        // 0 = North, 90 = East, 180 = South, 270 = West
        setUserHeading(iosHeading);
        setCompassEnabled(true);
      } else if (event.alpha !== null) {
        // Android/Desktop: alpha is the compass direction
        // For absolute orientation (true north), we need to check event.absolute
        // alpha: 0-360 degrees, but direction depends on device
        if (event.absolute) {
          // Absolute orientation - alpha is relative to true north
          // Convert: alpha=0 means north, we want arrow pointing north when alpha=0
          setUserHeading(360 - event.alpha);
        } else {
          // Relative orientation - less accurate but still usable
          setUserHeading(360 - event.alpha);
        }
        setCompassEnabled(true);
      }
    };

    const requestPermission = async () => {
      // iOS 13+ requires permission request for DeviceOrientation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            permissionGranted = true;
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        } catch (error) {
          console.error('DeviceOrientation permission error:', error);
        }
      } else {
        // Non-iOS or older iOS - no permission needed
        permissionGranted = true;
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    };

    if (window.DeviceOrientationEvent) {
      requestPermission();
    }

    return () => {
      if (permissionGranted) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
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
        const { latitude, longitude, accuracy } = position.coords;
        console.log('Current GPS Position:', latitude, longitude, 'Accuracy:', accuracy, 'm');
        setRawGpsCoords({ lat: latitude, lng: longitude });
        const pixelPos = gpsToPixel(latitude, longitude);

        // Always set position - the function now clamps to visible area
        setUserPosition({ x: pixelPos.x, y: pixelPos.y });
        setIsUserOutside(pixelPos.isOutside);
        console.log('Mapped to pixel:', pixelPos, pixelPos.isOutside ? '(outside building)' : '(inside building)');
        
        if (pixelPos.isOutside) {
          setGpsError(`Outside hospital area. Accuracy: ${accuracy.toFixed(0)}m`);
        } else {
          setGpsError(null);
        }
      },
      (error) => {
        console.error('GPS Error:', error);
        setGpsError(`GPS Error: ${error.message}`);
        // Enable simulation mode when GPS fails
        setSimulationMode(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    // Watch for REAL-TIME position updates as user moves
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading } = position.coords;
        console.log('🔄 LIVE GPS Update:', latitude.toFixed(6), longitude.toFixed(6), 'Accuracy:', accuracy.toFixed(0), 'm');
        
        setRawGpsCoords({ lat: latitude, lng: longitude });
        const pixelPos = gpsToPixel(latitude, longitude);

        // Update position in real-time as user moves
        setUserPosition({ x: pixelPos.x, y: pixelPos.y });
        setIsUserOutside(pixelPos.isOutside);
        
        // Update heading if available (for compass arrow direction)
        if (heading !== null && !isNaN(heading)) {
          setUserHeading(heading);
        }
        
        if (pixelPos.isOutside) {
          setGpsError(`Outside hospital • GPS accuracy: ${accuracy.toFixed(0)}m`);
        } else {
          setGpsError(null);
        }
      },
      (error) => {
        console.error('GPS Watch Error:', error);
        setGpsError(`GPS Error: ${error.message}`);
        setIsTracking(false);
        // Enable simulation mode when GPS fails
        setSimulationMode(true);
      },
      {
        // CRITICAL: These settings enable real-time tracking
        enableHighAccuracy: true,  // Use GPS instead of WiFi/Cell
        timeout: 5000,             // Faster timeout for quicker updates
        maximumAge: 0,             // Always get fresh position, never use cached
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

  // Zoom to location when user position changes (only on first position)
  const hasInitialZoomRef = useRef(false);
  useEffect(() => {
    if (fullScreen && userPosition && stageRef.current && !hasInitialZoomRef.current) {
      const stage = stageRef.current;
      // Use lower zoom if outside building
      const newZoom = isUserOutside ? 0.5 : 2.5;
      const centerX = (stage.width() / 2) - (userPosition.x * newZoom);
      const centerY = (stage.height() / 2) - (userPosition.y * newZoom);
      
      setTimeout(() => {
        setZoom(newZoom);
        setStagePos({ x: centerX, y: centerY });
        hasInitialZoomRef.current = true;
      }, 0);
    }
  }, [userPosition, fullScreen, isUserOutside]);

  // Zoom to selected location
  useEffect(() => {
    if (fullScreen && selectedLocation && stageRef.current) {
      const stage = stageRef.current;
      const newZoom = 2.5;
      // Transform location to rotated space
      const destPos = transformToRotatedSpace(
        CANVAS_PADDING + selectedLocation.x,
        CANVAS_PADDING + selectedLocation.y
      );
      const centerX = (stage.width() / 2) - (destPos.x * newZoom);
      const centerY = (stage.height() / 2) - (destPos.y * newZoom);
      
      setTimeout(() => {
        setZoom(newZoom);
        setStagePos({ x: centerX, y: centerY });
      }, 0);
    }
  }, [selectedLocation, fullScreen]);

  // Calculate and update distance when user position or selected location changes
  useEffect(() => {
    if (userPosition && selectedLocation && onDistanceUpdate) {
      // Transform destination to rotated space for accurate distance
      const destPos = transformToRotatedSpace(
        CANVAS_PADDING + selectedLocation.x,
        CANVAS_PADDING + selectedLocation.y
      );
      const dx = destPos.x - userPosition.x;
      const dy = destPos.y - userPosition.y;
      const pixelDistance = Math.sqrt(dx * dx + dy * dy);
      
      // Convert pixels to meters using real-world campus dimensions
      const metersPerPixelX = REAL_HEIGHT_METERS / FLOOR_PLAN_WIDTH;
      const metersPerPixelY = REAL_WIDTH_METERS / FLOOR_PLAN_HEIGHT;
      const avgMetersPerPixel = (metersPerPixelX + metersPerPixelY) / 2;
      const metersDistance = pixelDistance * avgMetersPerPixel;
      onDistanceUpdate(metersDistance);
    }
  }, [userPosition, selectedLocation, onDistanceUpdate]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Touch handlers for pinch-to-zoom and drag
  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    const stage = stageRef.current;

    if (!stage) return;

    if (touch1 && touch2) {
      // Multi-touch: pinch to zoom
      e.evt.preventDefault();
      isPinchingRef.current = true;
      setIsPinching(true);

      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };

      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const center = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      if (!lastCenterRef.current || lastDistRef.current === 0) {
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
    // Single touch is handled by Konva's draggable
  };

  const handleTouchEnd = () => {
    lastCenterRef.current = null;
    lastDistRef.current = 0;
    isPinchingRef.current = false;
    setIsPinching(false);
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

  // Handle tap/click for simulation mode - allows users to tap on map to set their position
  const handleStageClick = () => {
    if (!simulationMode) return;
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    // Convert screen position to map coordinates
    const mapX = (pointer.x - stagePos.x) / zoom;
    const mapY = (pointer.y - stagePos.y) / zoom;
    
    // Allow clicking anywhere on the extended canvas
    // Check if inside building (accounting for padding offset)
    const insideBuilding = 
      mapX >= CANVAS_PADDING && 
      mapX <= CANVAS_PADDING + FLOOR_PLAN_WIDTH && 
      mapY >= CANVAS_PADDING && 
      mapY <= CANVAS_PADDING + FLOOR_PLAN_HEIGHT;
    
    setUserPosition({ x: mapX, y: mapY });
    setIsUserOutside(!insideBuilding);
    setGpsError(insideBuilding ? null : 'Outside building area');
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

          {/* Simulation Mode Toggle & GPS Info - Bottom Left in fullscreen */}
          {fullScreen && (
            <div className="absolute bottom-28 left-4 z-20 flex flex-col gap-2">
              {/* Re-center on user button */}
              {userPosition && (
                <button
                  onClick={() => {
                    if (stageRef.current && userPosition) {
                      const stage = stageRef.current;
                      // Use lower zoom if outside building to see more context
                      const newZoom = isUserOutside ? 0.8 : 2.5;
                      const centerX = (stage.width() / 2) - (userPosition.x * newZoom);
                      const centerY = (stage.height() / 2) - (userPosition.y * newZoom);
                      setZoom(newZoom);
                      setStagePos({ x: centerX, y: centerY });
                    }
                  }}
                  className="px-3 py-2 rounded-full shadow-xl text-xs font-semibold transition-all flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
                >
                  <MapPin className="w-4 h-4" />
                  Re-center
                </button>
              )}

              {/* Simulation Mode Toggle */}
              <button
                onClick={() => {
                  const newSimMode = !simulationMode;
                  setSimulationMode(newSimMode);
                  if (newSimMode) {
                    // When enabling simulation, set a default position if none exists
                    if (!userPosition) {
                      setUserPosition({ x: CANVAS_PADDING + 600, y: CANVAS_PADDING + 900 });
                      setIsUserOutside(false);
                    }
                    setGpsError(null);
                  } else {
                    // When disabling simulation, try to get real GPS
                    startTracking();
                  }
                }}
                className={`px-3 py-2 rounded-full shadow-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  simulationMode 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {simulationMode ? '📍 Tap Map to Move' : 'Use Real GPS'}
              </button>

              {/* Go to Building button - helps find the building when far away */}
              <button
                onClick={() => {
                  if (stageRef.current) {
                    const stage = stageRef.current;
                    const newZoom = 1;
                    // Center on the building (which starts at CANVAS_PADDING)
                    const centerX = (stage.width() / 2) - ((CANVAS_PADDING + FLOOR_PLAN_WIDTH / 2) * newZoom);
                    const centerY = (stage.height() / 2) - ((CANVAS_PADDING + FLOOR_PLAN_HEIGHT / 2) * newZoom);
                    setZoom(newZoom);
                    setStagePos({ x: centerX, y: centerY });
                  }
                }}
                className="px-3 py-2 rounded-full shadow-xl text-xs font-semibold transition-all flex items-center gap-2 bg-green-500 text-white hover:bg-green-600"
              >
                🏥 Go to Building
              </button>

              {/* Simulation Mode Instructions */}
              {simulationMode && (
                <div className="bg-orange-500/90 text-white px-3 py-2 rounded-lg text-xs max-w-[180px]">
                  <div className="font-bold">🧪 Test Mode</div>
                  <div className="text-[10px] opacity-90">Tap anywhere on the map to set your location</div>
                </div>
              )}

              {/* Live GPS Status */}
              {isTracking && (
                <div className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="font-medium">Live Tracking</span>
                </div>
              )}

              {/* Compass Status / Enable Button */}
              {!compassEnabled ? (
                <button
                  onClick={async () => {
                    // Request compass permission on iOS
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                      try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const permission = await (DeviceOrientationEvent as any).requestPermission();
                        if (permission === 'granted') {
                          setCompassEnabled(true);
                        }
                      } catch (error) {
                        console.error('Compass permission error:', error);
                      }
                    }
                  }}
                  className="px-3 py-2 rounded-full shadow-xl text-xs font-semibold transition-all flex items-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
                >
                  <span>🧭</span>
                  Enable Compass
                </button>
              ) : (
                <div className="bg-purple-500/90 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <span>🧭</span>
                  <span className="font-medium">{Math.round(userHeading)}°</span>
                </div>
              )}

              {/* GPS Coordinates Display - Enhanced for calibration */}
              {rawGpsCoords && (
                <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`w-2 h-2 rounded-full ${isUserOutside ? 'bg-orange-500' : 'bg-green-500'}`} />
                    <span className="font-medium">{isUserOutside ? 'Outside Building' : 'Inside Building'}</span>
                  </div>
                  <div className="font-mono text-[10px] opacity-90 space-y-0.5">
                    <div>Lat: {rawGpsCoords.lat.toFixed(6)}</div>
                    <div>Lng: {rawGpsCoords.lng.toFixed(6)}</div>
                  </div>
                  {userPosition && (
                    <div className="mt-1 pt-1 border-t border-white/20 font-mono text-[10px] opacity-70">
                      <div>Pixel: ({Math.round(userPosition.x)}, {Math.round(userPosition.y)})</div>
                    </div>
                  )}
                </div>
              )}

              {/* Calibration Mode Toggle */}
              <button
                onClick={() => setCalibrationMode(!calibrationMode)}
                className={`px-3 py-2 rounded-full shadow-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  calibrationMode 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎯 {calibrationMode ? 'Calibrating...' : 'Calibrate'}
              </button>

              {/* Calibration Instructions */}
              {calibrationMode && (
                <div className="bg-yellow-500 text-black px-3 py-2 rounded-lg text-xs max-w-[200px]">
                  <div className="font-bold mb-1">📍 Calibration Mode</div>
                  <div className="text-[10px] leading-tight">
                    1. Stand at a known location on your floor plan<br/>
                    2. Note the GPS coordinates shown above<br/>
                    3. Update GPS_BOUNDARIES in the code to match corners
                  </div>
                </div>
              )}

              {/* User position indicator */}
              {userPosition && (
                <div className="bg-white/90 px-3 py-2 rounded-lg shadow-lg text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isUserOutside ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    <span className="font-medium text-gray-700">
                      {isUserOutside ? 'Approximate Location' : 'Your Location'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

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
                    width={fullScreen ? window.innerWidth : Math.min(containerWidth, FLOOR_PLAN_WIDTH)}
                    height={fullScreen ? window.innerHeight : Math.min(containerWidth, FLOOR_PLAN_WIDTH) * (FLOOR_PLAN_HEIGHT / FLOOR_PLAN_WIDTH)}
                    scaleX={zoom}
                    scaleY={zoom}
                    draggable={!isPinching}
                    x={stagePos.x}
                    y={stagePos.y}
                    onDragEnd={(e) => {
                      if (!isPinchingRef.current) {
                        setStagePos({
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }
                    }}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onWheel={handleWheel}
                    onClick={handleStageClick}
                    onTap={handleStageClick}
                  >
                    <Layer>
                      <FloorPlanImage src={FLOOR_PLAN_IMAGE} />
                      
                      {/* Navigation path - draw line from user to destination */}
                      {userPosition && selectedLocation && (() => {
                        // Transform destination location to rotated space
                        const destPos = transformToRotatedSpace(
                          CANVAS_PADDING + selectedLocation.x,
                          CANVAS_PADDING + selectedLocation.y
                        );
                        return (
                          <>
                            <Line
                              points={[
                                userPosition.x, 
                                userPosition.y, 
                                destPos.x,
                                destPos.y
                              ]}
                              stroke="#a855f7"
                              strokeWidth={6}
                              lineCap="round"
                              lineJoin="round"
                              dash={[20, 10]}
                              shadowBlur={10}
                              shadowColor="#a855f7"
                              shadowOpacity={0.5}
                            />
                            <Arrow
                              points={[
                                userPosition.x, 
                                userPosition.y, 
                                destPos.x,
                                destPos.y
                              ]}
                              stroke="#8b5cf6"
                              fill="#8b5cf6"
                              strokeWidth={4}
                              pointerLength={20}
                              pointerWidth={20}
                            />
                          </>
                        );
                      })()}
                      
                      {/* Destination marker */}
                      {selectedLocation && (() => {
                        const destPos = transformToRotatedSpace(
                          CANVAS_PADDING + selectedLocation.x,
                          CANVAS_PADDING + selectedLocation.y
                        );
                        return (
                          <>
                            <Circle
                              x={destPos.x}
                              y={destPos.y}
                              radius={30}
                              fill={selectedLocation.color}
                              opacity={0.2}
                            />
                            <Circle
                              x={destPos.x}
                              y={destPos.y}
                              radius={15}
                              fill={selectedLocation.color}
                              stroke="#ffffff"
                              strokeWidth={4}
                              shadowBlur={15}
                              shadowColor={selectedLocation.color}
                              shadowOpacity={0.6}
                            />
                          </>
                        );
                      })()}
                      
                      {/* User position marker with compass */}
                      {userPosition && (
                        <>
                          {/* Accuracy/range circle - shows GPS accuracy zone */}
                          <Circle
                            x={userPosition.x}
                            y={userPosition.y}
                            radius={isUserOutside ? 30 : 22}
                            fill={isUserOutside ? "#f59e0b" : "#3b82f6"}
                            opacity={0.1}
                          />
                          
                          {/* Direction cone/fan showing where user is facing */}
                          {compassEnabled && (
                            <Line
                              points={[
                                userPosition.x,
                                userPosition.y,
                                userPosition.x + Math.sin(((userHeading - 25) * Math.PI) / 180) * 45,
                                userPosition.y - Math.cos(((userHeading - 25) * Math.PI) / 180) * 45,
                                userPosition.x + Math.sin((userHeading * Math.PI) / 180) * 55,
                                userPosition.y - Math.cos((userHeading * Math.PI) / 180) * 55,
                                userPosition.x + Math.sin(((userHeading + 25) * Math.PI) / 180) * 45,
                                userPosition.y - Math.cos(((userHeading + 25) * Math.PI) / 180) * 45,
                                userPosition.x,
                                userPosition.y,
                              ]}
                              fill={isUserOutside ? "#f59e0b" : "#3b82f6"}
                              opacity={0.25}
                              closed={true}
                            />
                          )}
                          
                          {/* Pulsing ring for better visibility */}
                          <Circle
                            x={userPosition.x}
                            y={userPosition.y}
                            radius={isUserOutside ? 20 : 14}
                            stroke={isUserOutside ? "#f59e0b" : "#3b82f6"}
                            strokeWidth={2}
                            opacity={0.4}
                          />
                          
                          {/* Main blue/orange dot */}
                          <Circle
                            x={userPosition.x}
                            y={userPosition.y}
                            radius={10}
                            fill={isUserOutside ? "#f59e0b" : "#3b82f6"}
                            stroke="#ffffff"
                            strokeWidth={3}
                            shadowBlur={12}
                            shadowColor={isUserOutside ? "#f59e0b" : "#3b82f6"}
                            shadowOpacity={0.8}
                          />
                          
                          {/* Inner white dot for Google Maps style */}
                          <Circle
                            x={userPosition.x}
                            y={userPosition.y}
                            radius={4}
                            fill="#ffffff"
                          />
                          
                          {/* Compass direction arrow - shows which way device is facing */}
                          {compassEnabled && (
                            <Arrow
                              points={[
                                userPosition.x,
                                userPosition.y,
                                userPosition.x + Math.sin((userHeading * Math.PI) / 180) * 35,
                                userPosition.y - Math.cos((userHeading * Math.PI) / 180) * 35,
                              ]}
                              stroke={isUserOutside ? "#f59e0b" : "#3b82f6"}
                              fill={isUserOutside ? "#f59e0b" : "#3b82f6"}
                              strokeWidth={4}
                              pointerLength={12}
                              pointerWidth={12}
                              shadowBlur={8}
                              shadowColor={isUserOutside ? "#f59e0b" : "#3b82f6"}
                              shadowOpacity={0.6}
                            />
                          )}
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

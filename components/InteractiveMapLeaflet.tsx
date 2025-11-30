'use client';

import { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Layers, Navigation, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ============================================================
// 🔧 FLOOR PLAN GPS CALIBRATION - YOUR SCHOOL
// ============================================================
const GPS_CORNERS = {
  topLeft:     { lat: 6.910682215525977, lng: 122.07494812282795 },
  topRight:    { lat: 6.911694254662391, lng: 122.07671516345582 },
  bottomLeft:  { lat: 6.908425735280729, lng: 122.07565795966138 },
  bottomRight: { lat: 6.9090104720590775, lng: 122.07742500028922 },
};

const CENTER_LAT = (GPS_CORNERS.topLeft.lat + GPS_CORNERS.bottomRight.lat) / 2;
const CENTER_LNG = (GPS_CORNERS.topLeft.lng + GPS_CORNERS.bottomRight.lng) / 2;

// Colors matching the floor plan image
const COLORS = {
  roomDark: '#1e5a7a',      // Dark teal/blue for main rooms
  roomLight: '#7fadbd',     // Light blue for amenities (Church, Comfort Room)
  background: '#d4e4ec',    // Light blue-grey background
  pathway: '#9fb5be',       // Grey pathways/corridors
  text: '#1a4a5e',          // Dark text color
  border: '#1e5a7a',        // Border color
};

// Room/Location data with actual positions and sizes from floor plan
interface Room {
  id: string;
  name: string;
  category: 'Department' | 'Service' | 'Amenity' | 'Emergency';
  isDark: boolean; // true = dark blue, false = light blue
  // Position and size as relative coordinates (0-1)
  x: number;
  y: number;
  width: number;
  height: number;
  rotateText?: boolean; // for vertical text (rotated left, facing left)
  rotateRight?: boolean; // for vertical text rotated right (facing right)
  isLShaped?: boolean; // for L-shaped rooms like Surgery Dept
  isUShaped?: boolean; // for U-shaped rooms like Emergency Room
}

// Rooms positioned to match the floor plan image exactly
// The GPS bounds cover the Ateneo de Zamboanga campus - rooms placed on actual structures
// Coordinates are relative to building bounds (0,0 = top-left corner, 1,1 = bottom-right corner)
const rooms: Room[] = [
  // === TOP ROW ===
  // Nephrology Department (top right)
  { id: '2', name: 'Nephrology\nDepartment', category: 'Department', isDark: true, x: 0.71, y: 0.10, width: 0.12, height: 0.10 },
  // Ophthalmology Department (below Nephrology)
  { id: '5', name: 'Ophthalmology\nDepartment', category: 'Department', isDark: true, x: 0.71, y: 0.27, width: 0.12, height: 0.08 },
  // Diagnostic/Laboratory (tall narrow building on the right side)
  { id: '16', name: 'Diagnostic/\nLaboratory', category: 'Service', isDark: true, x: 0.95, y: 0.80, width: 0.06, height: 0.20 },
  
  // === CHURCH - Large, just above the first road (y: 0.34), not touching it ===
  { id: '13', name: 'Church', category: 'Amenity', isDark: false, x: 0.18, y: 0.24, width: 0.28, height: 0.16 },
  
  // === SURGERY DEPARTMENT - Big building between Gate 3 (x:0.37) and Gate 6 (x:0.62) ===
  { id: '9', name: 'Surgery\nDepartment', category: 'Department', isDark: true, x: 0.50, y: 0.18, width: 0.20, height: 0.28 },
  
  // === MIDDLE SECTION ===
  // Neurology Department
  { id: '6', name: 'Neurology\nDepartment', category: 'Department', isDark: true, x: 0.63, y: 0.52, width: 0.09, height: 0.30 },
  // Pediatric Department (center)
  { id: '10', name: 'Pediatric\nDepartment', category: 'Department', isDark: true, x: 0.48, y: 0.52, width: 0.17, height: 0.28 },
  
  // === DERMATOLOGY DEPARTMENT - At Gate 5 inside the road box ===
  { id: '17', name: 'Dermatology\nDepartment', category: 'Department', isDark: true, x: 0.885, y: 0.23 , width: 0.15, height: 0.16 },
  
  // === BOTTOM ROW ===
  // Comfort Room (light blue)
  { id: '7', name: 'Comfort\nRoom', category: 'Amenity', isDark: false, x: 0.63, y: 0.77, width: 0.08, height: 0.12 },
  // Cafeteria
  { id: '8', name: 'Cafeteria', category: 'Amenity', isDark: true, x: 0.63, y: 0.89, width: 0.08, height: 0.10 },
  // Orthopedic Department (bigger)
  { id: '11', name: 'Orthopedic\nDepartment', category: 'Department', isDark: true, x: 0.48, y: 0.80, width: 0.18, height: 0.16 },
  // Radiology Department
  { id: '12', name: 'Radiology\nDepartment', category: 'Department', isDark: true, x: 0.42, y: 0.93, width: 0.24, height: 0.09 },
  // Doctors Clinic (left of Radiology)
  { id: '18', name: "Doctors'\nClinic", category: 'Service', isDark: true, x: 0.15, y: 0.86, width: 0.25, height: 0.16 },
  // Emergency Room (U-shaped facing left, between Gate 1 and Gate 2)
  { id: '14', name: 'Emergency\nRoom', category: 'Emergency', isDark: true, x: 0.22, y: 0.54, width: 0.18, height: 0.30, isUShaped: true },
  // Cardio-Pulmonary Department (bottom right)
  { id: '15', name: "Cardio-Pulmonary\nDepartment", category: 'Department', isDark: true, x: 0.80, y: 0.81, width: 0.20, height: 0.12 },
];

// Gates positioned at campus entry points
type Gate = { name: string } & ({ lat: number; lng: number } | { x: number; y: number });
const gates: Gate[] = [
  { name: 'Gate 1', lat: 6.909120646803907, lng: 122.07543169554698 },   // Bottom (actual GPS)
  { name: 'Gate 2', x: 0.0, y: 0.35 },   // Left side, near the first horizontal road
  { name: 'Gate 3', x: 0.37, y: 0.01 },   // Top, above middle vertical road
  { name: 'Gate 4', x: 0.62, y: 0.01 },   // Top right
  { name: 'Gate 5', x: 0.885, y: 0.01 },  // Above Dermatology (top right area)
  { name: 'Gate 6', x: 1.0, y: 0.80 },    // Right side, next to Diagnostic/Laboratory
];

// Roads (thin pathways) connecting buildings with labels
interface Pathway {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  labelX?: number;
  labelY?: number;
}

const pathways: Pathway[] = [
  // Road A - Upper horizontal road (below top row)
  { x: 0.0, y: 0.34, width: 0.63, height: 0.02, label: 'Road A', labelX: 0.15, labelY: 0.33 },
  // Road B - Middle vertical road (separating Surgery from Pediatric area)
  { x: 0.36, y: 0, width: 0.02, height: .74, label: 'Road B', labelX: 0.34, labelY: 0.50 },
  // Road C - Horizontal road at the end of middle vertical road
  { x: 0.36, y: 0.68, width: 0.34, height: 0.02, label: 'Road C', labelX: 0.50, labelY: 0.67 },
  // Road D - Short vertical road at the end of the horizontal road
  { x: 0.68, y: 0.68, width: 0.02, height: 0.05, label: 'Road D', labelX: 0.70, labelY: 0.70 },
  // Road E - Horizontal road at the end of the short vertical road
  { x: 0.68, y: 0.72, width: 0.22, height: 0.02, label: 'Road E', labelX: 0.78, labelY: 0.71 },
  // Road F - Lower horizontal road (above bottom row)
  { x: 0.0, y: 0.72, width: .38, height: 0.02, label: 'Road F', labelX: 0.15, labelY: 0.71 },
  // Road G - Right vertical road (from middle to almostcenter)
  { x: 0.62, y: 0, width: 0.02, height: 0.36, label: 'Road G', labelX: 0.64, labelY: 0.18 },
  // Road H - Horizontal road from Gate 5 going left
  { x: 0.63, y: 0.32, width: 0.34, height: 0.02, label: 'Road H', labelX: 0.80, labelY: 0.31 },
  // Road I - Vertical road going up from middle of Gate 5 road
  { x: 0.78, y: 0.05, width: 0.02, height: 0.28, label: 'Road I', labelX: 0.76, labelY: 0.22 },
  // Road J - Horizontal road at top turning right
  { x: 0.78, y: 0.05, width: 0.21, height: 0.02, label: 'Road J', labelX: 0.88, labelY: 0.11 },
  // Road K - Vertical road going down from end of top horizontal road
  { x: 0.97, y: 0.05, width: 0.02, height: 0.60, label: 'Road K', labelX: 0.95, labelY: 0.40 },
  // Wall above Dermatology (no label, same color as roads)
  { x: 0.82, y: 0.08, width: 0.14, height: 0.06 },
  // Wall between Nephrology and Ophthalmology (no label)
  { x: 0.65, y: 0.17, width: 0.12, height: 0.05 },
  // Wall above Church (no label)
  { x: 0.04, y: 0.08, width: 0.28, height: 0.06 },
];

// Convert relative position to GPS coordinates using bilinear interpolation
function relToGps(relX: number, relY: number): { lat: number; lng: number } {
  const { topLeft, topRight, bottomLeft, bottomRight } = GPS_CORNERS;
  
  const lat = (1 - relX) * (1 - relY) * topLeft.lat +
              relX * (1 - relY) * topRight.lat +
              (1 - relX) * relY * bottomLeft.lat +
              relX * relY * bottomRight.lat;
              
  const lng = (1 - relX) * (1 - relY) * topLeft.lng +
              relX * (1 - relY) * topRight.lng +
              (1 - relX) * relY * bottomLeft.lng +
              relX * relY * bottomRight.lng;
  
  return { lat, lng };
}

// Convert GPS coordinates back to relative position (inverse of relToGps)
// Using iterative Newton-Raphson method for bilinear interpolation inversion
function gpsToRel(lat: number, lng: number): { x: number; y: number } {
  const { topLeft, topRight, bottomLeft, bottomRight } = GPS_CORNERS;
  
  // Initial guess at center
  let x = 0.5;
  let y = 0.5;
  
  // Newton-Raphson iterations
  for (let iter = 0; iter < 10; iter++) {
    // Current estimate
    const estLat = (1 - x) * (1 - y) * topLeft.lat +
                   x * (1 - y) * topRight.lat +
                   (1 - x) * y * bottomLeft.lat +
                   x * y * bottomRight.lat;
    const estLng = (1 - x) * (1 - y) * topLeft.lng +
                   x * (1 - y) * topRight.lng +
                   (1 - x) * y * bottomLeft.lng +
                   x * y * bottomRight.lng;
    
    // Error
    const errLat = lat - estLat;
    const errLng = lng - estLng;
    
    if (Math.abs(errLat) < 1e-10 && Math.abs(errLng) < 1e-10) break;
    
    // Jacobian partial derivatives
    const dLatDx = -(1 - y) * topLeft.lat + (1 - y) * topRight.lat - y * bottomLeft.lat + y * bottomRight.lat;
    const dLatDy = -(1 - x) * topLeft.lat - x * topRight.lat + (1 - x) * bottomLeft.lat + x * bottomRight.lat;
    const dLngDx = -(1 - y) * topLeft.lng + (1 - y) * topRight.lng - y * bottomLeft.lng + y * bottomRight.lng;
    const dLngDy = -(1 - x) * topLeft.lng - x * topRight.lng + (1 - x) * bottomLeft.lng + x * bottomRight.lng;
    
    // Solve 2x2 system
    const det = dLatDx * dLngDy - dLatDy * dLngDx;
    if (Math.abs(det) < 1e-15) break;
    
    x += (errLat * dLngDy - errLng * dLatDy) / det;
    y += (errLng * dLatDx - errLat * dLngDx) / det;
    
    // Clamp to valid range
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
  }
  
  return { x, y };
}

// A* Pathfinding types
interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to end
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

// Check if a line segment intersects with a room
function lineIntersectsRoom(x1: number, y1: number, x2: number, y2: number, room: Room, margin: number = 0.01): boolean {
  // Room coordinates are center-based, so calculate boundaries
  const rx1 = room.x - room.width / 2 - margin;
  const rx2 = room.x + room.width / 2 + margin;
  const ry1 = room.y - room.height / 2 - margin;
  const ry2 = room.y + room.height / 2 + margin;
  
  // Check if either endpoint is inside the room
  if ((x1 >= rx1 && x1 <= rx2 && y1 >= ry1 && y1 <= ry2) ||
      (x2 >= rx1 && x2 <= rx2 && y2 >= ry1 && y2 <= ry2)) {
    return true;
  }
  
  // Check line-rectangle intersection using separating axis theorem
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  // Check intersection with rectangle edges
  const rectEdges = [
    [[rx1, ry1], [rx2, ry1]], // Top
    [[rx2, ry1], [rx2, ry2]], // Right
    [[rx2, ry2], [rx1, ry2]], // Bottom
    [[rx1, ry2], [rx1, ry1]]  // Left
  ];
  
  for (const edge of rectEdges) {
    const [[ex1, ey1], [ex2, ey2]] = edge;
    const edx = ex2 - ex1;
    const edy = ey2 - ey1;
    
    const denom = dx * edy - dy * edx;
    if (Math.abs(denom) < 1e-10) continue;
    
    const t = ((ex1 - x1) * edy - (ey1 - y1) * edx) / denom;
    const u = ((ex1 - x1) * dy - (ey1 - y1) * dx) / denom;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return true;
    }
  }
  
  return false;
}

// Check if a path segment is valid (doesn't go through buildings)
function isPathClear(x1: number, y1: number, x2: number, y2: number, obstacles: Room[]): boolean {
  for (const room of obstacles) {
    if (lineIntersectsRoom(x1, y1, x2, y2, room)) {
      return false;
    }
  }
  return true;
}

// A* pathfinding algorithm to find path avoiding buildings
function findPathAStar(
  start: { x: number; y: number },
  end: { x: number; y: number },
  obstacles: Room[],
  roads: Pathway[]
): { x: number; y: number }[] {
  console.log('Starting pathfinding from', start, 'to', end);
  
  // Always use waypoints-based pathfinding to ensure we follow roads
  console.log('Using A* pathfinding with road waypoints');
  
  // Generate comprehensive waypoints from roads
  const waypoints: { x: number; y: number }[] = [start];
  
  // Add all road corners AND centers as waypoints for better coverage
  for (const road of roads) {
    // Skip walls (pathways without labels)
    if (!road.label) continue;
    
    // Add all 4 corners
    waypoints.push({ x: road.x, y: road.y });
    waypoints.push({ x: road.x + road.width, y: road.y });
    waypoints.push({ x: road.x, y: road.y + road.height });
    waypoints.push({ x: road.x + road.width, y: road.y + road.height });
    
    // Add center point for better connectivity
    waypoints.push({ x: road.x + road.width / 2, y: road.y + road.height / 2 });
    
    // Add midpoints of edges for more routing options
    waypoints.push({ x: road.x + road.width / 2, y: road.y }); // top middle
    waypoints.push({ x: road.x + road.width / 2, y: road.y + road.height }); // bottom middle
    waypoints.push({ x: road.x, y: road.y + road.height / 2 }); // left middle
    waypoints.push({ x: road.x + road.width, y: road.y + road.height / 2 }); // right middle
  }
  
  // Add destination
  waypoints.push(end);
  
  const numWaypoints = waypoints.length;
  console.log(`Generated ${numWaypoints} waypoints`);
  
  // Build adjacency graph of valid connections
  const graph: Map<number, { idx: number; dist: number }[]> = new Map();
  
  for (let i = 0; i < numWaypoints; i++) {
    const connections: { idx: number; dist: number }[] = [];
    for (let j = 0; j < numWaypoints; j++) {
      if (i === j) continue;
      
      const p1 = waypoints[i];
      const p2 = waypoints[j];
      
      const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      
      // Only connect nearby waypoints that have clear paths
      // Reduced distance threshold for more controlled routing
      if (dist < 0.4 && isPathClear(p1.x, p1.y, p2.x, p2.y, obstacles)) {
        connections.push({ idx: j, dist });
      }
    }
    graph.set(i, connections);
    
    // Log if a waypoint has no connections (isolated)
    if (connections.length === 0 && i > 0 && i < numWaypoints - 1) {
      console.log(`Warning: Waypoint ${i} at (${waypoints[i].x.toFixed(2)}, ${waypoints[i].y.toFixed(2)}) has no connections`);
    }
  }
  
  // A* search from start (index 0) to end (last index)
  const startIdx = 0;
  const endIdx = numWaypoints - 1;
  
  // Check if start or end are disconnected
  const startConnections = graph.get(startIdx)?.length || 0;
  const endConnections = graph.get(endIdx)?.length || 0;
  
  console.log(`Start waypoint has ${startConnections} connections`);
  console.log(`End waypoint has ${endConnections} connections`);
  
  if (startConnections === 0 || endConnections === 0) {
    console.log('Start or end is disconnected, trying to find nearest road waypoints');
    
    // Try connecting to nearest waypoints with more lenient distance
    for (let i = 0; i < numWaypoints; i++) {
      if (i === startIdx || i === endIdx) continue;
      
      const p = waypoints[i];
      
      // Try to connect start
      if (startConnections === 0) {
        const distToStart = Math.sqrt((p.x - start.x) ** 2 + (p.y - start.y) ** 2);
        if (distToStart < 0.6 && isPathClear(start.x, start.y, p.x, p.y, obstacles)) {
          const startConns = graph.get(startIdx) || [];
          startConns.push({ idx: i, dist: distToStart });
          graph.set(startIdx, startConns);
        }
      }
      
      // Try to connect end
      if (endConnections === 0) {
        const distToEnd = Math.sqrt((p.x - end.x) ** 2 + (p.y - end.y) ** 2);
        if (distToEnd < 0.6 && isPathClear(p.x, p.y, end.x, end.y, obstacles)) {
          const endConns = graph.get(i) || [];
          endConns.push({ idx: endIdx, dist: distToEnd });
          graph.set(i, endConns);
        }
      }
    }
  }
  
  console.log(`Searching path from waypoint ${startIdx} to ${endIdx}`);
  
  // Priority queue (open set)
  const openSet: Map<number, PathNode> = new Map();
  const closedSet: Set<number> = new Set();
  
  // Initialize start node
  openSet.set(startIdx, {
    x: start.x,
    y: start.y,
    g: 0,
    h: Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2),
    f: Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2),
    parent: null,
  });
  
  let iterations = 0;
  const maxIterations = 1000;
  
  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node in open set with lowest f score
    let currentIdx = -1;
    let lowestF = Infinity;
    
    openSet.forEach((node, idx) => {
      if (node.f < lowestF) {
        lowestF = node.f;
        currentIdx = idx;
      }
    });
    
    if (currentIdx === -1) break;
    
    const current = openSet.get(currentIdx)!;
    
    // Found the destination!
    if (currentIdx === endIdx) {
      console.log(`Path found in ${iterations} iterations`);
      // Reconstruct path
      const path: { x: number; y: number }[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }
    
    // Move current from open to closed
    openSet.delete(currentIdx);
    closedSet.add(currentIdx);
    
    // Check all neighbors
    const neighbors = graph.get(currentIdx) || [];
    
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor.idx)) continue;
      
      const neighborPoint = waypoints[neighbor.idx];
      const tentativeG = current.g + neighbor.dist;
      
      const existingNode = openSet.get(neighbor.idx);
      
      if (!existingNode || tentativeG < existingNode.g) {
        const h = Math.sqrt((end.x - neighborPoint.x) ** 2 + (end.y - neighborPoint.y) ** 2);
        
        const neighborNode: PathNode = {
          x: neighborPoint.x,
          y: neighborPoint.y,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current,
        };
        
        openSet.set(neighbor.idx, neighborNode);
      }
    }
  }
  
  console.log(`No path found after ${iterations} iterations, using direct line`);
  // No path found, return direct line as fallback
  return [start, end];
}

// Get polygon corners for a rectangular room
function getRoomPolygon(room: Room): L.LatLngExpression[] {
  const x1 = room.x - room.width / 2;
  const x2 = room.x + room.width / 2;
  const y1 = room.y - room.height / 2;
  const y2 = room.y + room.height / 2;
  
  // U-shaped polygon facing left (open side on left)
  if (room.isUShaped) {
    const innerWidth = (x2 - x1) * 0.5; // Inner cutout width
    const innerX2 = x1 + innerWidth;
    const innerY1 = y1 + (y2 - y1) * 0.25; // Inner cutout top
    const innerY2 = y2 - (y2 - y1) * 0.25; // Inner cutout bottom
    
    return [
      // Outer shape clockwise
      [relToGps(x1, y1).lat, relToGps(x1, y1).lng],       // Top-left outer
      [relToGps(x2, y1).lat, relToGps(x2, y1).lng],       // Top-right outer
      [relToGps(x2, y2).lat, relToGps(x2, y2).lng],       // Bottom-right outer
      [relToGps(x1, y2).lat, relToGps(x1, y2).lng],       // Bottom-left outer
      [relToGps(x1, innerY2).lat, relToGps(x1, innerY2).lng], // Bottom of U opening
      [relToGps(innerX2, innerY2).lat, relToGps(innerX2, innerY2).lng], // Inner bottom-right
      [relToGps(innerX2, innerY1).lat, relToGps(innerX2, innerY1).lng], // Inner top-right
      [relToGps(x1, innerY1).lat, relToGps(x1, innerY1).lng], // Top of U opening
    ];
  }
  
  // L-shaped polygon for Surgery Department (inverted L shape)
  if (room.isLShaped) {
    // Create an inverted-L shape matching the building footprint
    // Top part extends full width, bottom part is narrower on the left
    const midX = x1 + (x2 - x1) * 0.45; // Where the L cuts in
    const midY = y1 + (y2 - y1) * 0.55; // Where the L cuts in vertically
    
    return [
      // Start top-left, go clockwise
      [relToGps(x1, y1).lat, relToGps(x1, y1).lng],       // Top-left
      [relToGps(x2, y1).lat, relToGps(x2, y1).lng],       // Top-right
      [relToGps(x2, y2).lat, relToGps(x2, y2).lng],       // Bottom-right
      [relToGps(midX, y2).lat, relToGps(midX, y2).lng],   // Bottom inner corner
      [relToGps(midX, midY).lat, relToGps(midX, midY).lng], // Inner corner
      [relToGps(x1, midY).lat, relToGps(x1, midY).lng],   // Left inner point
    ];
  }
  
  return [
    [relToGps(x1, y1).lat, relToGps(x1, y1).lng],
    [relToGps(x2, y1).lat, relToGps(x2, y1).lng],
    [relToGps(x2, y2).lat, relToGps(x2, y2).lng],
    [relToGps(x1, y2).lat, relToGps(x1, y2).lng],
  ];
}

// Get polygon for pathway
function getPathwayPolygon(path: { x: number; y: number; width: number; height: number }): L.LatLngExpression[] {
  const x1 = path.x;
  const x2 = path.x + path.width;
  const y1 = path.y;
  const y2 = path.y + path.height;
  
  return [
    [relToGps(x1, y1).lat, relToGps(x1, y1).lng],
    [relToGps(x2, y1).lat, relToGps(x2, y1).lng],
    [relToGps(x2, y2).lat, relToGps(x2, y2).lng],
    [relToGps(x1, y2).lat, relToGps(x1, y2).lng],
  ];
}

interface InteractiveMapLeafletProps {
  isDarkMode?: boolean;
  fullScreen?: boolean;
  selectedLocationId?: string;
  onDistanceUpdate?: (distance: number) => void;
}

// The actual map component - must be loaded client-side only
function MapComponent({ 
  fullScreen, 
  selectedLocationId, 
  onDistanceUpdate 
}: InteractiveMapLeafletProps) {
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  const mapRef = useRef<L.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  
  // Import Leaflet dynamically
  const [L, setL] = useState<typeof import('leaflet') | null>(null);
  
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || mapReady) return;
    
    const container = document.getElementById('leaflet-map');
    if (!container) return;
    
    // Create map
    const map = L.map(container, {
      center: [CENTER_LAT, CENTER_LNG],
      zoom: 17,
      maxZoom: 22,
      minZoom: 14,
    });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 22,
      maxNativeZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
    
    // Create mask - a huge polygon with a hole for the building
    const worldBounds: L.LatLngExpression[] = [
      [90, -180],
      [90, 180],
      [-90, 180],
      [-90, -180],
    ];
    
    const buildingHole: L.LatLngExpression[] = [
      [GPS_CORNERS.topLeft.lat, GPS_CORNERS.topLeft.lng],
      [GPS_CORNERS.topRight.lat, GPS_CORNERS.topRight.lng],
      [GPS_CORNERS.bottomRight.lat, GPS_CORNERS.bottomRight.lng],
      [GPS_CORNERS.bottomLeft.lat, GPS_CORNERS.bottomLeft.lng],
    ];
    
    // Add mask polygon (dark area outside building)
    L.polygon([worldBounds, buildingHole], {
      color: 'transparent',
      fillColor: '#0f172a',
      fillOpacity: 0.85,
      interactive: false,
    }).addTo(map);
    
    // Add building floor (light blue-grey background like the image)
    L.polygon(buildingHole, {
      color: COLORS.border,
      weight: 2,
      fillColor: COLORS.background,
      fillOpacity: 1,
      interactive: false,
    }).addTo(map);
    
    // Add grey pathways/corridors
    pathways.forEach((path) => {
      const pathCorners = getPathwayPolygon(path);
      L.polygon(pathCorners, {
        color: 'transparent',
        fillColor: COLORS.pathway,
        fillOpacity: 1,
        interactive: false,
      }).addTo(map);
      
      // Add road label if present
      if (path.label && path.labelX !== undefined && path.labelY !== undefined) {
        const labelGps = relToGps(path.labelX, path.labelY);
        const roadLabelIcon = L.divIcon({
          className: 'road-label',
          html: `<span style="
            font-size: 10px;
            font-weight: 600;
            color: #475569;
            background: rgba(255,255,255,0.8);
            padding: 1px 4px;
            border-radius: 2px;
            white-space: nowrap;
          ">${path.label}</span>`,
          iconSize: [50, 16],
          iconAnchor: [25, 8],
        });
        
        L.marker([labelGps.lat, labelGps.lng], { 
          icon: roadLabelIcon,
          interactive: false,
        }).addTo(map);
      }
    });
    
    // Add room boxes for each room
    rooms.forEach((room) => {
      const roomCorners = getRoomPolygon(room);
      const centerGps = relToGps(room.x, room.y);
      const roomColor = room.isDark ? COLORS.roomDark : COLORS.roomLight;
      
      // Room polygon (styled box)
      const roomPoly = L.polygon(roomCorners, {
        color: roomColor,
        weight: 2,
        fillColor: roomColor,
        fillOpacity: 1,
        className: `room-${room.id}`,
      }).addTo(map);
      
      // Room label - white text on dark rooms, dark text on light rooms
      const textColor = room.isDark ? '#ffffff' : COLORS.text;
      const fontSize = room.name.length > 20 ? '9px' : '11px';
      const displayName = room.name.replace(/\n/g, '<br/>');
      
      const labelIcon = L.divIcon({
        className: 'room-label',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            pointer-events: none;
            ${room.rotateText ? 'writing-mode: vertical-rl; transform: rotate(180deg);' : room.rotateRight ? 'writing-mode: vertical-rl;' : ''}
          ">
            <span style="
              font-size: ${fontSize};
              font-weight: 600;
              color: ${textColor};
              line-height: 1.2;
              text-shadow: ${room.isDark ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'};
            ">${displayName}</span>
          </div>
        `,
        iconSize: (room.rotateText || room.rotateRight) ? [30, 80] : [100, 50],
        iconAnchor: (room.rotateText || room.rotateRight) ? [15, 40] : [50, 25],
      });
      
      L.marker([centerGps.lat, centerGps.lng], { 
        icon: labelIcon,
        interactive: false,
      }).addTo(map);
      
      // Add popup on room click
      roomPoly.bindPopup(`
        <div style="text-align: center; min-width: 140px;">
          <div style="
            font-size: 14px;
            font-weight: 600;
            color: ${COLORS.text};
            margin-bottom: 4px;
          ">${room.name.replace(/\n/g, ' ')}</div>
          <div style="
            font-size: 11px;
            color: #64748b;
            padding: 4px 10px;
            background: ${COLORS.background};
            border-radius: 4px;
            display: inline-block;
          ">${room.category}</div>
        </div>
      `);
    });
    
    // Add gate labels
    gates.forEach((gate) => {
      // Support both direct GPS coords (lat/lng) and relative coords (x/y)
      let gps: { lat: number; lng: number };
      if ('lat' in gate && 'lng' in gate) {
        gps = { lat: gate.lat, lng: gate.lng };
      } else {
        gps = relToGps(gate.x, gate.y);
      }
      
      const gateIcon = L.divIcon({
        className: 'gate-label',
        html: `<span style="
          font-size: 12px;
          font-weight: 600;
          color: ${COLORS.text};
          background: ${COLORS.background};
          padding: 2px 6px;
          border-radius: 3px;
          white-space: nowrap;
        ">${gate.name}</span>`,
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });
      
      L.marker([gps.lat, gps.lng], { 
        icon: gateIcon,
        interactive: false,
      }).addTo(map);
    });
    
    // Add "Parking" label - big text in the parking area
    const parkingGps = relToGps(0.85, 0.54);
    const parkingIcon = L.divIcon({
      className: 'parking-label',
      html: `<span style="
        font-size: 24px;
        font-weight: 700;
        color: ${COLORS.text};
        letter-spacing: 2px;
      ">PARKING</span>`,
      iconSize: [150, 40],
      iconAnchor: [75, 20],
    });
    L.marker([parkingGps.lat, parkingGps.lng], { 
      icon: parkingIcon,
      interactive: false,
    }).addTo(map);
    
    mapRef.current = map;
    setMapReady(true);
    
    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);
  
  // Handle selected room from props
  useEffect(() => {
    if (selectedLocationId) {
      const room = rooms.find(r => r.id === selectedLocationId);
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [selectedLocationId]);
  
  // User position marker
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);
  const headingMarkerRef = useRef<L.Polyline | null>(null);
  
  useEffect(() => {
    if (!L || !mapRef.current || !userPosition) return;
    
    const map = mapRef.current;
    
    // Remove old markers
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    if (userAccuracyRef.current) {
      map.removeLayer(userAccuracyRef.current);
    }
    if (headingMarkerRef.current) {
      map.removeLayer(headingMarkerRef.current);
    }
    
    // Add accuracy circle
    userAccuracyRef.current = L.circle([userPosition.lat, userPosition.lng], {
      radius: 10,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      weight: 1,
    }).addTo(map);
    
    // Add user marker
    userMarkerRef.current = L.circleMarker([userPosition.lat, userPosition.lng], {
      radius: 10,
      color: '#ffffff',
      fillColor: '#3b82f6',
      fillOpacity: 1,
      weight: 3,
    }).addTo(map);
    
    // Add heading arrow
    const headingLength = 0.0003; // Approximate length in degrees
    const headingRad = (userHeading * Math.PI) / 180;
    const endLat = userPosition.lat + Math.cos(headingRad) * headingLength;
    const endLng = userPosition.lng + Math.sin(headingRad) * headingLength;
    
    headingMarkerRef.current = L.polyline(
      [[userPosition.lat, userPosition.lng], [endLat, endLng]],
      { color: '#3b82f6', weight: 4 }
    ).addTo(map);
    
  }, [L, userPosition, userHeading, mapReady]);
  
  // Selected room highlight
  const destMarkerRef = useRef<L.Polygon | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const pulseMarkerRef = useRef<L.CircleMarker | null>(null);
  
  useEffect(() => {
    if (!L || !mapRef.current) return;
    
    const map = mapRef.current;
    
    // Remove old markers
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
    }
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }
    if (pulseMarkerRef.current) {
      map.removeLayer(pulseMarkerRef.current);
    }
    
    if (selectedRoom) {
      const gps = relToGps(selectedRoom.x, selectedRoom.y);
      const roomCorners = getRoomPolygon(selectedRoom);
      const highlightColor = '#ef4444'; // Red highlight for selected
      
      // Highlight the selected room with a glowing border
      destMarkerRef.current = L.polygon(roomCorners, {
        color: highlightColor,
        weight: 5,
        fillColor: highlightColor,
        fillOpacity: 0.3,
        className: 'selected-room-highlight',
      }).addTo(map);
      
      // Add static center marker (destination indicator)
      pulseMarkerRef.current = L.circleMarker([gps.lat, gps.lng], {
        radius: 8,
        color: '#ffffff',
        fillColor: highlightColor,
        fillOpacity: 1,
        weight: 3,
      }).addTo(map);
      
      // Add route line with A* pathfinding to avoid buildings
      if (userPosition) {
        // Convert GPS to relative coordinates for pathfinding
        const startRel = gpsToRel(userPosition.lat, userPosition.lng);
        const endRel = { x: selectedRoom.x, y: selectedRoom.y };
        
        // Find path using A* algorithm
        const pathRel = findPathAStar(startRel, endRel, rooms, pathways);
        
        // Convert path back to GPS coordinates
        const pathGps: [number, number][] = pathRel.map(p => {
          const gpsPoint = relToGps(p.x, p.y);
          return [gpsPoint.lat, gpsPoint.lng];
        });
        
        routeLineRef.current = L.polyline(
          pathGps,
          { 
            color: '#8b5cf6', 
            weight: 4, 
            dashArray: '10, 10',
            opacity: 0.8 
          }
        ).addTo(map);
        
        // Calculate total distance along the path
        if (onDistanceUpdate) {
          let totalDistance = 0;
          for (let i = 0; i < pathGps.length - 1; i++) {
            totalDistance += map.distance(pathGps[i], pathGps[i + 1]);
          }
          onDistanceUpdate(totalDistance);
        }
      }
      
      // Pan to location
      map.panTo([gps.lat, gps.lng]);
    }
  }, [L, selectedRoom, userPosition, mapReady, onDistanceUpdate]);
  
  // GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported');
      return;
    }
    
    setIsTracking(true);
    setGpsError(null);
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading } = position.coords;
        setUserPosition({ lat: latitude, lng: longitude });
        
        if (heading !== null && !isNaN(heading)) {
          setUserHeading(heading);
        }
        
        // Center map on first position
        if (mapRef.current && !userPosition) {
          mapRef.current.panTo([latitude, longitude]);
        }
      },
      (error) => {
        setGpsError(error.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
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
  };
  
  const centerOnUser = () => {
    if (mapRef.current && userPosition) {
      mapRef.current.panTo([userPosition.lat, userPosition.lng]);
    }
  };
  
  const centerOnBuilding = () => {
    if (mapRef.current) {
      mapRef.current.setView([CENTER_LAT, CENTER_LNG], 18);
    }
  };
  
  return (
    <div className={`relative ${fullScreen ? 'w-full h-full' : 'w-full aspect-4/3'}`}>
      {/* Leaflet & Custom CSS */}
      <style jsx global>{`
        #leaflet-map {
          width: 100%;
          height: 100%;
          z-index: 1;
          background: #1e293b;
        }
        
        .room-label {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .leaflet-popup-content {
          margin: 12px 16px;
        }
        
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .selected-room-highlight {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
      
      {/* Map Container */}
      <div id="leaflet-map" className="w-full h-full rounded-xl overflow-hidden" />
      
      {/* Controls Overlay - Mobile Responsive */}
      <div className="absolute top-4 right-2 sm:right-4 z-50 flex flex-col gap-1.5 sm:gap-2">
        {/* Zoom Controls */}
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
        
        {/* Layer Toggle */}
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`p-2 sm:p-3 rounded-full shadow-lg active:scale-95 transition-transform ${showLabels ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      
      {/* Bottom Left Controls - Mobile Responsive */}
      <div className="absolute bottom-20 sm:bottom-24 left-2 sm:left-4 z-50 flex flex-col gap-1.5 sm:gap-2">
        {/* GPS Toggle */}
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 active:scale-95 transition-transform ${
            isTracking ? 'bg-green-500 text-white' : 'bg-white text-gray-700'
          }`}
        >
          <Navigation className={`w-3 h-3 sm:w-4 sm:h-4 ${isTracking ? 'animate-pulse' : ''}`} />
          <span className="hidden xs:inline">{isTracking ? 'GPS Active' : 'Start GPS'}</span>
          <span className="xs:hidden">{isTracking ? 'GPS' : 'GPS'}</span>
        </button>
        
        {/* Center on User */}
        {userPosition && (
          <button
            onClick={centerOnUser}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 bg-blue-500 text-white active:scale-95 transition-transform"
          >
            <Crosshair className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">My Location</span>
            <span className="xs:hidden">Me</span>
          </button>
        )}
        
        {/* Center on Building */}
        <button
          onClick={centerOnBuilding}
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 bg-white text-gray-700 active:scale-95 transition-transform"
        >
          <span className="text-sm sm:text-base">🏥</span>
          <span className="hidden xs:inline">Building</span>
        </button>
        
        {/* GPS Coordinates Display - Hidden on very small screens */}
        {userPosition && (
          <div className="hidden sm:block bg-black/80 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs">
            <div className="font-mono">
              <div>Lat: {userPosition.lat.toFixed(6)}</div>
              <div>Lng: {userPosition.lng.toFixed(6)}</div>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {gpsError && (
          <div className="bg-red-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs max-w-[200px] sm:max-w-none">
            {gpsError}
          </div>
        )}
      </div>
      
      {/* Room Selector */}
      {!fullScreen && (
        <div className="absolute bottom-4 left-4 right-4 z-50">
          <select
            value={selectedRoom?.id || ''}
            onChange={(e) => {
              const room = rooms.find(r => r.id === e.target.value);
              setSelectedRoom(room || null);
            }}
            className="w-full p-3 rounded-lg bg-white shadow-lg text-sm font-medium"
          >
            <option value="">Select destination...</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name.replace(/\n/g, ' ')} - {room.category}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Selected Room Info */}
      {selectedRoom && (
        <div className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-3 max-w-52">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedRoom.isDark ? COLORS.roomDark : COLORS.roomLight }}
            />
            <span className="font-medium text-sm">{selectedRoom.name.replace(/\n/g, ' ')}</span>
          </div>
          <span className="text-xs text-gray-500">{selectedRoom.category}</span>
        </div>
      )}
    </div>
  );
}

// Export with dynamic import to prevent SSR issues
export default function InteractiveMapLeaflet(props: InteractiveMapLeafletProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState in effect
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  
  if (!mounted) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${props.fullScreen ? 'w-full h-full' : 'w-full aspect-4/3'}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }
  
  return <MapComponent {...props} />;
}

'use client';

import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Loader from './Loader';

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

// Building descriptions with emails
const buildingDescriptions: Record<string, { description: string; email?: string }> = {
  '17': {
    description: 'Comprehensive care for skin, hair, and nail concerns, offering medical, surgical, and cosmetic dermatology services.',
    email: 'dermatologycmz@gmail.com'
  },
  '2': {
    description: 'Specialized diagnosis and treatment for kidney diseases, including acute and chronic kidney disease.',
    email: 'nephrologycmz@gmail.com'
  },
  '5': {
    description: 'Eye care services for vision problems, eye injuries, and diseases.',
    email: 'ophthalmologycmz@gmail.com'
  },
  '16': {
    description: 'Provides a wide range of testing and diagnostic services to support medical care and treatment.',
    email: 'laboratorycmz@gmail.com'
  },
  '15': {
    description: 'Offers advanced heart and lung care with diagnostics and personalized treatment plans.',
    email: 'cardiopulmonarycmz@gmail.com'
  },
  '6': {
    description: 'Diagnosis and treatment of the nervous system disorders, including the brain, nerves, spinal cord, and muscles.',
    email: 'neurologycmz@gmail.com'
  },
  '10': {
    description: 'Provides comprehensive medical care for infants and children, including routine checkups, vaccinations, and treatment for illnesses.',
    email: 'pediatricscmz@gmail.com'
  },
  '9': {
    description: 'Provides a full spectrum of surgical procedures with pre-operative and post-operative care.',
    email: 'surgerycmz@gmail.com'
  },
  '11': {
    description: 'Expert treatment for musculoskeletal system including bone, joint, and muscle conditions.',
    email: 'orthopediccmz@gmail.com'
  },
  '12': {
    description: 'Diagnostic imaging services including X-ray, ultrasound, CT, and MRI scans.',
    email: 'radiologycmz@gmail.com'
  },
  '18': {
    description: 'Consultation offices for various medical specialists providing scheduled appointments.',
    email: 'doctorscliniccmz@gmail.com'
  },
  '14': {
    description: '24/7 emergency medical services for urgent and life-threatening conditions.',
    email: 'emergencycmz@gmail.com'
  },
  '13': {
    description: 'A quiet, reflective space for spiritual support, prayer, and family gatherings.'
  },
  '7': {
    description: 'Clean and well-maintained restroom facility for patients and visitors, equipped for personal hygiene and sanitation needs.'
  },
  '8': {
    description: 'Dining area offering meals, snacks, and refreshments for patients, visitors, and staff.'
  },
  'parking': {
    description: 'Designated parking area for hospital visitors and staff. Please follow parking guidelines and display your parking pass.'
  }
};

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

//  rElative position to GPS coordinates using INTERPOLATION OKAY!
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
    
    // Error hanadling 
    const errLat = lat - estLat;
    const errLng = lng - estLng;
    
    if (Math.abs(errLat) < 1e-10 && Math.abs(errLng) < 1e-10) break;
    
    // Formula from derivates ni google haha
    const dLatDx = -(1 - y) * topLeft.lat + (1 - y) * topRight.lat - y * bottomLeft.lat + y * bottomRight.lat;
    const dLatDy = -(1 - x) * topLeft.lat - x * topRight.lat + (1 - x) * bottomLeft.lat + x * bottomRight.lat;
    const dLngDx = -(1 - y) * topLeft.lng + (1 - y) * topRight.lng - y * bottomLeft.lng + y * bottomRight.lng;
    const dLngDy = -(1 - x) * topLeft.lng - x * topRight.lng + (1 - x) * bottomLeft.lng + x * bottomRight.lng;
    
    // Solve 2x2 problemmmmm nb
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

// ============================================================================
// ROAD-BASED PATHFINDING SYSTEM
// Path MUST follow roads - never cut through buildings
// ============================================================================

// Road network node - represents a point on the road network
interface RoadNode {
  id: string;
  x: number;
  y: number;
  roadId: string;  // Which road this node belongs to
}

// Road network edge - connection between two nodes ON THE SAME ROAD or at intersections
interface RoadEdge {
  from: string;
  to: string;
  distance: number;
}

// Build the road network graph
function buildRoadNetwork(roads: Pathway[]): { nodes: RoadNode[], edges: RoadEdge[] } {
  const nodes: RoadNode[] = [];
  const edges: RoadEdge[] = [];
  const nodeMap = new Map<string, RoadNode>();
  
  // Helper to create unique node ID
  const makeNodeId = (x: number, y: number) => `${x.toFixed(3)}_${y.toFixed(3)}`;
  
  // Helper to add node if not exists, return the id
  const addNode = (x: number, y: number, roadId: string): string => {
    const id = makeNodeId(x, y);
    if (!nodeMap.has(id)) {
      const node: RoadNode = { id, x, y, roadId };
      nodes.push(node);
      nodeMap.set(id, node);
    }
    return id;
  };
  
  // Helper to add edge (bidirectional)
  const addEdge = (id1: string, id2: string) => {
    const n1 = nodeMap.get(id1);
    const n2 = nodeMap.get(id2);
    if (n1 && n2 && id1 !== id2) {
      const dist = Math.sqrt((n2.x - n1.x) ** 2 + (n2.y - n1.y) ** 2);
      // Avoid duplicate edges
      const existsForward = edges.some(e => e.from === id1 && e.to === id2);
      const existsBackward = edges.some(e => e.from === id2 && e.to === id1);
      if (!existsForward) edges.push({ from: id1, to: id2, distance: dist });
      if (!existsBackward) edges.push({ from: id2, to: id1, distance: dist });
    }
  };
  
  // Get only actual roads (not walls)
  const actualRoads = roads.filter(r => r.label);
  
  // For each road, create nodes along the centerline
  const roadNodes: Map<string, string[]> = new Map(); // roadLabel -> array of node IDs
  
  for (const road of actualRoads) {
    const roadId = road.label!;
    const isHorizontal = road.width > road.height;
    const nodesForRoad: string[] = [];
    
    if (isHorizontal) {
      // Horizontal road - nodes along horizontal center
      const centerY = road.y + road.height / 2;
      
      // Create nodes every 0.03 units for fine-grained path
      for (let x = road.x; x <= road.x + road.width + 0.001; x += 0.03) {
        const clampedX = Math.min(x, road.x + road.width);
        const nodeId = addNode(clampedX, centerY, roadId);
        nodesForRoad.push(nodeId);
      }
      // Ensure end point is included
      const endId = addNode(road.x + road.width, centerY, roadId);
      if (!nodesForRoad.includes(endId)) nodesForRoad.push(endId);
      
    } else {
      // Vertical road - nodes along vertical center
      const centerX = road.x + road.width / 2;
      
      for (let y = road.y; y <= road.y + road.height + 0.001; y += 0.03) {
        const clampedY = Math.min(y, road.y + road.height);
        const nodeId = addNode(centerX, clampedY, roadId);
        nodesForRoad.push(nodeId);
      }
      // Ensure end point is included
      const endId = addNode(centerX, road.y + road.height, roadId);
      if (!nodesForRoad.includes(endId)) nodesForRoad.push(endId);
    }
    
    // Connect consecutive nodes along this road
    for (let i = 0; i < nodesForRoad.length - 1; i++) {
      addEdge(nodesForRoad[i], nodesForRoad[i + 1]);
    }
    
    roadNodes.set(roadId, nodesForRoad);
  }
  
  // Connect roads at intersections by finding nearby nodes from different roads
  const CONNECTION_THRESHOLD = 0.04; // Maximum distance to connect nodes from different roads
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];
      
      // Only connect nodes from DIFFERENT roads
      if (n1.roadId === n2.roadId) continue;
      
      const dist = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
      
      // Connect if within threshold
      if (dist < CONNECTION_THRESHOLD) {
        addEdge(n1.id, n2.id);
      }
    }
  }
  
  console.log(`Built road network: ${nodes.length} nodes, ${edges.length} edges`);
  
  return { nodes, edges };
}

// Find path through road network using Dijkstra's algorithm
function findPathOnRoads(
  start: { x: number; y: number },
  end: { x: number; y: number },
  roads: Pathway[]
): { x: number; y: number }[] {
  console.log('=== ROAD-BASED PATHFINDING ===');
  console.log('Start:', start, 'End:', end);
  
  // Build road network
  const { nodes, edges } = buildRoadNetwork(roads);
  console.log(`Road network: ${nodes.length} nodes, ${edges.length} edges`);
  
  // Find nearest road node to start
  let nearestStartNode: RoadNode | null = null;
  let nearestStartDist = Infinity;
  
  for (const node of nodes) {
    const dist = Math.sqrt((node.x - start.x) ** 2 + (node.y - start.y) ** 2);
    if (dist < nearestStartDist) {
      nearestStartDist = dist;
      nearestStartNode = node;
    }
  }
  
  // Find nearest road node to end
  let nearestEndNode: RoadNode | null = null;
  let nearestEndDist = Infinity;
  
  for (const node of nodes) {
    const dist = Math.sqrt((node.x - end.x) ** 2 + (node.y - end.y) ** 2);
    if (dist < nearestEndDist) {
      nearestEndDist = dist;
      nearestEndNode = node;
    }
  }
  
  if (!nearestStartNode || !nearestEndNode) {
    console.log('Could not find road nodes near start/end');
    return [start, end];
  }
  
  console.log(`Nearest start node: ${nearestStartNode.id} (dist: ${nearestStartDist.toFixed(3)})`);
  console.log(`Nearest end node: ${nearestEndNode.id} (dist: ${nearestEndDist.toFixed(3)})`);
  
  // Build adjacency list from edges
  const adjacency = new Map<string, { nodeId: string; dist: number }[]>();
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of edges) {
    adjacency.get(edge.from)?.push({ nodeId: edge.to, dist: edge.distance });
  }
  
  // Dijkstra's algorithm
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  
  for (const node of nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  }
  distances.set(nearestStartNode.id, 0);
  
  // Priority queue (simple implementation)
  const queue = [nearestStartNode.id];
  
  while (queue.length > 0) {
    // Find node with minimum distance
    let minDist = Infinity;
    let minIdx = 0;
    for (let i = 0; i < queue.length; i++) {
      const d = distances.get(queue[i])!;
      if (d < minDist) {
        minDist = d;
        minIdx = i;
      }
    }
    
    const current = queue.splice(minIdx, 1)[0];
    
    if (visited.has(current)) continue;
    visited.add(current);
    
    if (current === nearestEndNode.id) break; // Found destination
    
    const neighbors = adjacency.get(current) || [];
    for (const { nodeId, dist } of neighbors) {
      if (visited.has(nodeId)) continue;
      
      const newDist = distances.get(current)! + dist;
      if (newDist < distances.get(nodeId)!) {
        distances.set(nodeId, newDist);
        previous.set(nodeId, current);
        if (!queue.includes(nodeId)) {
          queue.push(nodeId);
        }
      }
    }
  }
  
  // Reconstruct path
  const path: { x: number; y: number }[] = [];
  let current: string | null = nearestEndNode.id;
  
  // Check if path was found
  if (distances.get(nearestEndNode.id) === Infinity) {
    console.log('No path found through road network');
    return [start, end];
  }
  
  while (current) {
    const node = nodes.find(n => n.id === current);
    if (node) {
      path.unshift({ x: node.x, y: node.y });
    }
    current = previous.get(current) || null;
  }
  
  // Add start point (user location) at beginning
  if (path.length > 0) {
    const firstRoadPoint = path[0];
    // Only add start if it's different from first road point
    if (Math.abs(start.x - firstRoadPoint.x) > 0.01 || Math.abs(start.y - firstRoadPoint.y) > 0.01) {
      path.unshift(start);
    }
  } else {
    path.unshift(start);
  }
  
  // Add end point (destination) at end
  if (path.length > 0) {
    const lastRoadPoint = path[path.length - 1];
    // Only add end if it's different from last road point
    if (Math.abs(end.x - lastRoadPoint.x) > 0.01 || Math.abs(end.y - lastRoadPoint.y) > 0.01) {
      path.push(end);
    }
  } else {
    path.push(end);
  }
  
  console.log(`Path found with ${path.length} points`);
  return path;
}

// Legacy function kept for compatibility but now uses road-based pathfinding
function findPathAStar(
  start: { x: number; y: number },
  end: { x: number; y: number },
  _obstacles: Room[],
  roads: Pathway[]
): { x: number; y: number }[] {
  return findPathOnRoads(start, end, roads);
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
  recenterTrigger?: number;
  followMode?: boolean;
  onMapInteraction?: () => void;
  focusTrigger?: number;
}

// The actual map component - must be loaded client-side only
function MapComponent({ 
  fullScreen, 
  selectedLocationId, 
  onDistanceUpdate,
  recenterTrigger,
  followMode,
  onMapInteraction,
  focusTrigger
}: InteractiveMapLeafletProps) {
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isOutsideCampus, setIsOutsideCampus] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(false);

  // Check if user is outside campus bounds
  const checkIfOutsideCampus = (lat: number, lng: number): boolean => {
    const margin = 0.0005; // Small margin for accuracy
    const isOutside = 
      lat < GPS_CORNERS.bottomLeft.lat - margin ||
      lat > GPS_CORNERS.topLeft.lat + margin ||
      lng < GPS_CORNERS.topLeft.lng - margin ||
      lng > GPS_CORNERS.bottomRight.lng + margin;
    return isOutside;
  };
  
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
    
    // Define campus bounds for restriction
    const campusBounds = L.latLngBounds(
      [GPS_CORNERS.bottomLeft.lat - 0.001, GPS_CORNERS.topLeft.lng - 0.001], // Southwest
      [GPS_CORNERS.topRight.lat + 0.001, GPS_CORNERS.bottomRight.lng + 0.001]  // Northeast
    );
    
    // Create map - always centered on campus
    const map = L.map(container, {
      center: [CENTER_LAT, CENTER_LNG],
      zoom: 18, // Start more zoomed in
      maxZoom: 22,
      minZoom: 16, // Don't allow zooming out too much
      maxBounds: campusBounds, // Restrict panning to campus area
      maxBoundsViscosity: 1.0, // Solid boundary - can't pan outside
    });
    
    // Use a simple grey tile layer instead of OpenStreetMap to hide external buildings
    // This creates a clean background without showing surrounding streets/buildings
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 22,
      maxNativeZoom: 19,
      attribution: ''
    }).addTo(map);
    
    // Wait for tiles to load before showing the map
    tileLayer.on('load', () => {
      setTilesLoaded(true);
    });
    
    // Fallback: show map after 2 seconds even if tiles haven't fully loaded
    const fallbackTimer = setTimeout(() => {
      setTilesLoaded(true);
    }, 2000);
    
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
    
    // Add mask polygon (dark area outside building) - increased opacity to fully hide external areas
    L.polygon([worldBounds, buildingHole], {
      color: 'transparent',
      fillColor: '#1e293b',
      fillOpacity: 0.95, // Almost fully opaque to hide external buildings
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
      
      // Create popup content for the room
      const info = buildingDescriptions[room.id];
      const roomDisplayName = room.name.replace(/\\n/g, ' ');
      const categoryColor = room.category === 'Emergency' 
        ? '#ef4444' 
        : room.category === 'Department' 
        ? '#3b82f6' 
        : room.category === 'Service' 
        ? '#22c55e' 
        : '#f97316';
      
      const popupContent = `
        <div style="min-width: 200px; max-width: 280px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="
              width: 10px; 
              height: 10px; 
              border-radius: 50%; 
              background: ${categoryColor};
              flex-shrink: 0;
            "></div>
            <div style="font-size: 15px; font-weight: 700; color: #1f2937; line-height: 1.2;">
              ${roomDisplayName}
            </div>
          </div>
          <div style="
            font-size: 11px; 
            color: white; 
            background: ${categoryColor}; 
            padding: 3px 8px; 
            border-radius: 12px; 
            display: inline-block;
            margin-bottom: 10px;
            font-weight: 500;
          ">${room.category}</div>
          <p style="font-size: 13px; color: #4b5563; line-height: 1.5; margin: 0 0 8px 0;">
            ${info?.description || 'No description available.'}
          </p>
          ${info?.email ? `
            <div style="
              display: flex; 
              align-items: center; 
              gap: 6px; 
              padding: 8px 10px; 
              background: #f3f4f6; 
              border-radius: 8px;
              margin-top: 8px;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <a href="mailto:${info.email}" style="font-size: 12px; color: #2563eb; text-decoration: none;">
                ${info.email}
              </a>
            </div>
          ` : ''}
        </div>
      `;
      
      // Bind popup to room polygon
      roomPoly.bindPopup(popupContent, {
        className: 'custom-popup',
        maxWidth: 300,
        closeButton: true,
        autoPan: true,
        autoPanPadding: [50, 50],
      });
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
    
    // Create clickable parking area polygon
    const parkingArea: L.LatLngExpression[] = [
      [relToGps(0.72, 0.40).lat, relToGps(0.72, 0.40).lng],
      [relToGps(0.97, 0.40).lat, relToGps(0.97, 0.40).lng],
      [relToGps(0.97, 0.68).lat, relToGps(0.97, 0.68).lng],
      [relToGps(0.72, 0.68).lat, relToGps(0.72, 0.68).lng],
    ];
    
    const parkingPoly = L.polygon(parkingArea, {
      color: 'transparent',
      fillColor: 'transparent',
      fillOpacity: 0,
      interactive: true,
    }).addTo(map);
    
    // Parking popup content
    const parkingInfo = buildingDescriptions['parking'];
    const parkingPopupContent = `
      <div style="min-width: 200px; max-width: 280px; padding: 4px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="font-size: 20px;">🅿️</div>
          <div style="font-size: 15px; font-weight: 700; color: #1f2937; line-height: 1.2;">
            Parking Area
          </div>
        </div>
        <div style="
          font-size: 11px; 
          color: white; 
          background: #6b7280; 
          padding: 3px 8px; 
          border-radius: 12px; 
          display: inline-block;
          margin-bottom: 10px;
          font-weight: 500;
        ">Facility</div>
        <p style="font-size: 13px; color: #4b5563; line-height: 1.5; margin: 0;">
          ${parkingInfo?.description || 'Visitor and staff parking area.'}
        </p>
      </div>
    `;
    
    parkingPoly.bindPopup(parkingPopupContent, {
      className: 'custom-popup',
      maxWidth: 300,
      closeButton: true,
      autoPan: true,
      autoPanPadding: [50, 50],
    });
    
    mapRef.current = map;
    setMapReady(true);
    
    return () => {
      clearTimeout(fallbackTimer);
      map.remove();
      mapRef.current = null;
      setMapReady(false);
      setTilesLoaded(false);
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

  // Auto-focus on selected building when focusTrigger changes
  useEffect(() => {
    if (!mapRef.current || !selectedRoom || !focusTrigger) return;
    
    const map = mapRef.current;
    const gps = relToGps(selectedRoom.x, selectedRoom.y);
    
    // Pan to the selected building with animation
    map.flyTo([gps.lat, gps.lng], 19, {
      duration: 0.8,
      easeLinearity: 0.25
    });
  }, [focusTrigger, selectedRoom]);
  
  // User position marker
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);
  const headingMarkerRef = useRef<L.Polyline | null>(null);
  const userLabelRef = useRef<L.Marker | null>(null);
  
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
    if (userLabelRef.current) {
      map.removeLayer(userLabelRef.current);
    }
    
    // Add accuracy circle with green glow
    userAccuracyRef.current = L.circle([userPosition.lat, userPosition.lng], {
      radius: 15,
      color: '#22c55e',
      fillColor: '#22c55e',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);
    
    // Add user marker (green dot for live location)
    userMarkerRef.current = L.circleMarker([userPosition.lat, userPosition.lng], {
      radius: 12,
      color: '#ffffff',
      fillColor: '#22c55e',
      fillOpacity: 1,
      weight: 3,
    }).addTo(map);
    
    // Add "You" label above the user marker
    const youLabelIcon = L.divIcon({
      className: 'you-label',
      html: `<div style="
        background: white;
        padding: 4px 10px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
      ">You</div>`,
      iconSize: [40, 28],
      iconAnchor: [20, 45], // Position above the marker
    });
    
    userLabelRef.current = L.marker([userPosition.lat, userPosition.lng], {
      icon: youLabelIcon,
      interactive: false,
    }).addTo(map);
    
    // Add heading arrow
    const headingLength = 0.0003; // Approximate length in degrees
    const headingRad = (userHeading * Math.PI) / 180;
    const endLat = userPosition.lat + Math.cos(headingRad) * headingLength;
    const endLng = userPosition.lng + Math.sin(headingRad) * headingLength;
    
    headingMarkerRef.current = L.polyline(
      [[userPosition.lat, userPosition.lng], [endLat, endLng]],
      { color: '#22c55e', weight: 4 }
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
        
        // Route line with shadow/outline effect
        // First add a darker outline/shadow
        L.polyline(
          pathGps,
          { 
            color: '#166534', // Dark green shadow
            weight: 8, 
            opacity: 0.4,
            lineCap: 'round',
            lineJoin: 'round',
          }
        ).addTo(map);
        
        // Then add the main green route line on top
        routeLineRef.current = L.polyline(
          pathGps,
          { 
            color: '#22c55e', // Green route line
            weight: 5, 
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
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
  
  // Recenter map when trigger changes
  useEffect(() => {
    if (!mapRef.current || !userPosition || recenterTrigger === undefined || recenterTrigger === 0) return;
    
    mapRef.current.panTo([userPosition.lat, userPosition.lng], { animate: true });
  }, [recenterTrigger, userPosition]);
  
  // Follow mode - keep user centered
  useEffect(() => {
    if (!mapRef.current || !userPosition || !followMode) return;
    
    mapRef.current.panTo([userPosition.lat, userPosition.lng], { animate: true });
  }, [userPosition, followMode]);
  
  // Add map interaction listener to disable follow mode
  useEffect(() => {
    if (!mapRef.current || !onMapInteraction) return;
    
    const map = mapRef.current;
    
    const handleInteraction = () => {
      onMapInteraction();
    };
    
    // Listen for user interactions that should disable follow mode
    map.on('dragstart', handleInteraction);
    map.on('zoomstart', handleInteraction);
    
    return () => {
      map.off('dragstart', handleInteraction);
      map.off('zoomstart', handleInteraction);
    };
  }, [mapReady, onMapInteraction]);
  
  // GPS tracking - auto start when map is ready
  useEffect(() => {
    if (!mapReady || isTracking) return;
    
    if (!navigator.geolocation) {
      // Don't show error, just silently skip GPS
      console.log('Geolocation not supported');
      return;
    }
    
    // Auto-start GPS tracking
    setIsTracking(true);
    setGpsError(null);
    
    // First try to get a single position to test permissions
    navigator.geolocation.getCurrentPosition(
      () => {
        // Permission granted, now start watching
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, heading } = position.coords;
            setUserPosition({ lat: latitude, lng: longitude });
            setGpsError(null); // Clear any previous error
            
            // Check if user is outside campus
            setIsOutsideCampus(checkIfOutsideCampus(latitude, longitude));
            
            if (heading !== null && !isNaN(heading)) {
              setUserHeading(heading);
            }
            
            // DON'T auto-pan to user position - keep map centered on campus
            // User can tap "Re-center" or the recenter button to follow their location
          },
          (error) => {
            console.log('GPS watch error:', error.code);
            // Only show error for permission denied, not for temporary issues
            if (error.code === error.PERMISSION_DENIED) {
              setGpsError('GPS access denied');
              setIsTracking(false);
            }
            // For timeout or position unavailable, keep trying silently
          },
          {
            enableHighAccuracy: false, // Start with low accuracy for faster initial fix
            timeout: 15000,
            maximumAge: 30000, // Accept positions up to 30 seconds old
          }
        );
        
        watchIdRef.current = watchId;
      },
      (error) => {
        console.log('Initial GPS error:', error.code);
        // Permission denied or not available
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('GPS access denied');
        }
        setIsTracking(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);
  
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
        
        /* Custom popup styling with arrow */
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          padding: 0;
          overflow: hidden;
          background: white;
        }
        
        .leaflet-popup-content {
          margin: 12px 14px;
          line-height: 1.4;
        }
        
        .leaflet-popup-tip-container {
          width: 30px;
          height: 15px;
        }
        
        .leaflet-popup-tip {
          background: white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          width: 15px;
          height: 15px;
        }
        
        .leaflet-popup-close-button {
          top: 8px !important;
          right: 8px !important;
          width: 24px !important;
          height: 24px !important;
          font-size: 18px !important;
          line-height: 24px !important;
          color: #9ca3af !important;
          background: #f3f4f6 !important;
          border-radius: 50% !important;
          text-align: center;
          transition: all 0.15s ease;
        }
        
        .leaflet-popup-close-button:hover {
          color: #4b5563 !important;
          background: #e5e7eb !important;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          animation: popupFadeIn 0.2s ease-out;
        }
        
        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .selected-room-highlight {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
      
      {/* Loading Overlay - Shows until tiles are loaded */}
      {!tilesLoaded && (
        <div className="absolute inset-0 z-100 flex items-center justify-center rounded-xl" style={{ background: '#1e293b' }}>
          <Loader text="Loading map..." />
        </div>
      )}
      
      {/* Map Container */}
      <div id="leaflet-map" className="w-full h-full rounded-xl overflow-hidden" />

      {/* Outside Campus Indicator */}
      {isOutsideCampus && userPosition && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <div 
            className="px-4 py-2.5 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 animate-pulse"
            style={{
              background: 'rgba(245, 158, 11, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: 'white',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>You are outside the campus</span>
          </div>
        </div>
      )}
      
      {/* Bottom Left Controls - Simplified */}
      <div className="absolute bottom-20 sm:bottom-24 left-2 sm:left-4 z-50 flex flex-col gap-1.5 sm:gap-2">
        {/* GPS Status Indicator */}
        {isTracking && userPosition && !isOutsideCampus && (
          <div 
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-700">Live</span>
          </div>
        )}
        
        {/* Center on Building */}
        <button
          onClick={centerOnBuilding}
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 active:scale-90 hover:shadow-xl transition-all duration-150 cursor-pointer group"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <span className="text-sm sm:text-base group-hover:scale-110 transition-transform">🏥</span>
          <span className="hidden xs:inline text-gray-700 group-hover:text-gray-900">Building</span>
        </button>
        
        {/* GPS Error Display - glassmorphism style */}
        {gpsError && (
          <div 
            className="px-3 py-2 rounded-xl text-xs sm:text-sm max-w-[220px] sm:max-w-none font-medium"
            style={{
              background: 'rgba(239, 68, 68, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: 'white',
            }}
          >
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

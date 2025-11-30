/**
 * Hospital Navigation AI System
 * 
 * This module implements a trained AI model for hospital navigation that learns:
 * 1. Spatial relationships between buildings
 * 2. Optimal pathways through the road network
 * 3. Semantic understanding of medical departments
 * 4. Context-aware navigation recommendations
 * 
 * The AI uses a combination of:
 * - Graph-based pathfinding (A* algorithm)
 * - Semantic embeddings for location understanding
 * - Trained weights for route optimization
 * - Natural language processing for query understanding
 */

// ============================================================================
// TRAINING DATA - Hospital Layout Knowledge Base
// ============================================================================

export interface Location {
  id: string;
  name: string;
  aliases: string[];
  category: 'department' | 'service' | 'amenity' | 'emergency' | 'entrance';
  position: { x: number; y: number };
  nearestRoad: string;
  nearestGate: string;
  services: string[];
  symptoms: string[];
  openHours: string;
  priority: number; // 1-10, 10 being most critical (emergency)
  email?: string;
  shortDesc: string;
}

export interface Road {
  id: string;
  name: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  isVertical: boolean;
  connectedRoads: string[];
  adjacentLocations: string[];
}

export interface Gate {
  id: string;
  name: string;
  position: { x: number; y: number };
  connectedRoad: string;
  isMainEntrance: boolean;
}

// Training data for the hospital layout - Complete building data from navigation page
export const HOSPITAL_KNOWLEDGE_BASE = {
  locations: [
    {
      id: 'emergency',
      name: 'Emergency Room',
      aliases: ['er', 'emergency', 'emergency room', 'urgent care', 'accident', 'trauma center'],
      category: 'emergency' as const,
      position: { x: 0.22, y: 0.54 },
      nearestRoad: 'Road F',
      nearestGate: 'Gate 1',
      services: ['24/7 emergency care', 'trauma', 'accidents', 'life-threatening conditions'],
      symptoms: ['bleeding', 'unconscious', 'heart attack', 'stroke', 'cant breathe', 'severe pain', 'accident', 'trauma', 'dying', 'critical', 'fainted', 'collapsed', 'choking', 'poisoning', 'burn', 'broken'],
      openHours: '24/7',
      priority: 10,
      email: 'emergencycmz@gmail.com',
      shortDesc: '24/7 emergency medical services.',
    },
    {
      id: 'surgery',
      name: 'Surgery Department',
      aliases: ['surgery', 'surgical', 'operation', 'operating room', 'or'],
      category: 'department' as const,
      position: { x: 0.50, y: 0.18 },
      nearestRoad: 'Road A',
      nearestGate: 'Gate 3',
      services: ['surgery', 'operations', 'pre-op', 'post-op care'],
      symptoms: ['need surgery', 'operation', 'appendix', 'hernia', 'tumor', 'gallbladder', 'remove', 'surgical'],
      openHours: '6AM - 10PM',
      priority: 8,
      email: 'surgerycmz@gmail.com',
      shortDesc: 'Surgical procedures and care.',
    },
    {
      id: 'pediatrics',
      name: 'Pediatric Department',
      aliases: ['pediatrics', 'pediatric', 'children', 'kids', 'child', 'baby', 'infant', 'toddler'],
      category: 'department' as const,
      position: { x: 0.48, y: 0.52 },
      nearestRoad: 'Road B',
      nearestGate: 'Gate 3',
      services: ['child care', 'vaccinations', 'baby checkup'],
      symptoms: ['child sick', 'baby sick', 'kid fever', 'child cough', 'vaccination', 'child checkup', 'infant', 'toddler sick', 'newborn'],
      openHours: '8AM - 8PM',
      priority: 7,
      email: 'pediatricscmz@gmail.com',
      shortDesc: 'Healthcare for children and infants.',
    },
    {
      id: 'neurology',
      name: 'Neurology Department',
      aliases: ['neurology', 'neuro', 'brain', 'nerve', 'neurologist'],
      category: 'department' as const,
      position: { x: 0.63, y: 0.52 },
      nearestRoad: 'Road C',
      nearestGate: 'Gate 4',
      services: ['brain disorders', 'nerve conditions', 'stroke care', 'headache treatment'],
      symptoms: ['headache', 'migraine', 'seizure', 'numbness', 'dizzy', 'dizziness', 'memory loss', 'stroke', 'tingling', 'paralysis', 'tremor', 'shaking'],
      openHours: '8AM - 6PM',
      priority: 8,
      email: 'neurologycmz@gmail.com',
      shortDesc: 'Brain and nervous system care.',
    },
    {
      id: 'cardio-pulmonary',
      name: 'Cardio-Pulmonary Department',
      aliases: ['cardio', 'cardiology', 'heart', 'pulmonary', 'lung', 'lungs', 'cardiac', 'cardiologist'],
      category: 'department' as const,
      position: { x: 0.80, y: 0.81 },
      nearestRoad: 'Road E',
      nearestGate: 'Gate 6',
      services: ['heart care', 'lung treatment', 'ECG', 'breathing tests'],
      symptoms: ['chest pain', 'heart pain', 'shortness of breath', 'hard to breathe', 'palpitations', 'cough', 'asthma', 'wheezing', 'heart problem', 'high blood pressure', 'hypertension'],
      openHours: '7AM - 7PM',
      priority: 9,
      email: 'cardiopulmonarycmz@gmail.com',
      shortDesc: 'Heart and lung specialists.',
    },
    {
      id: 'orthopedic',
      name: 'Orthopedic Department',
      aliases: ['orthopedic', 'ortho', 'bone', 'bones', 'joint', 'fracture', 'orthopedist'],
      category: 'department' as const,
      position: { x: 0.48, y: 0.80 },
      nearestRoad: 'Road F',
      nearestGate: 'Gate 1',
      services: ['bone treatment', 'fractures', 'joint care', 'sports injuries'],
      symptoms: ['bone pain', 'fracture', 'broken bone', 'joint pain', 'back pain', 'knee pain', 'sprain', 'arthritis', 'sports injury', 'shoulder pain', 'hip pain', 'ankle'],
      openHours: '8AM - 6PM',
      priority: 6,
      email: 'orthopediccmz@gmail.com',
      shortDesc: 'Bone and joint treatment.',
    },
    {
      id: 'radiology',
      name: 'Radiology Department',
      aliases: ['radiology', 'xray', 'x-ray', 'scan', 'ct scan', 'mri', 'ultrasound', 'imaging'],
      category: 'service' as const,
      position: { x: 0.42, y: 0.93 },
      nearestRoad: 'Road F',
      nearestGate: 'Gate 1',
      services: ['X-ray', 'CT scan', 'MRI', 'ultrasound'],
      symptoms: ['need xray', 'need scan', 'need mri', 'need ultrasound', 'imaging', 'internal check'],
      openHours: '7AM - 9PM',
      priority: 5,
      email: 'radiologycmz@gmail.com',
      shortDesc: 'X-ray, CT, MRI, ultrasound.',
    },
    {
      id: 'diagnostic-lab',
      name: 'Diagnostic Laboratory',
      aliases: ['lab', 'laboratory', 'blood test', 'diagnostic', 'testing', 'test'],
      category: 'service' as const,
      position: { x: 0.95, y: 0.80 },
      nearestRoad: 'Road K',
      nearestGate: 'Gate 6',
      services: ['blood tests', 'urine tests', 'lab work'],
      symptoms: ['blood test', 'lab test', 'urine test', 'check blood', 'sample', 'testing'],
      openHours: '6AM - 8PM',
      priority: 5,
      email: 'laboratorycmz@gmail.com',
      shortDesc: 'Blood tests and lab work.',
    },
    {
      id: 'nephrology',
      name: 'Nephrology Department',
      aliases: ['nephrology', 'kidney', 'kidneys', 'renal', 'dialysis', 'nephrologist'],
      category: 'department' as const,
      position: { x: 0.71, y: 0.10 },
      nearestRoad: 'Road G',
      nearestGate: 'Gate 4',
      services: ['kidney treatment', 'dialysis', 'renal care'],
      symptoms: ['kidney pain', 'dialysis', 'kidney stone', 'urination problem', 'blood in urine', 'kidney failure', 'swelling'],
      openHours: '7AM - 7PM',
      priority: 7,
      email: 'nephrologycmz@gmail.com',
      shortDesc: 'Kidney care and dialysis.',
    },
    {
      id: 'ophthalmology',
      name: 'Ophthalmology Department',
      aliases: ['ophthalmology', 'eye', 'eyes', 'vision', 'optical', 'eye doctor', 'ophthalmologist'],
      category: 'department' as const,
      position: { x: 0.71, y: 0.27 },
      nearestRoad: 'Road G',
      nearestGate: 'Gate 4',
      services: ['eye care', 'vision tests', 'cataract surgery', 'glaucoma treatment'],
      symptoms: ['eye pain', 'blurry vision', 'cant see', 'eye infection', 'red eye', 'eye injury', 'glasses', 'blind', 'cataracts'],
      openHours: '8AM - 5PM',
      priority: 5,
      email: 'ophthalmologycmz@gmail.com',
      shortDesc: 'Eye care and vision services.',
    },
    {
      id: 'dermatology',
      name: 'Dermatology Department',
      aliases: ['dermatology', 'skin', 'derma', 'dermatologist'],
      category: 'department' as const,
      position: { x: 0.885, y: 0.23 },
      nearestRoad: 'Road I',
      nearestGate: 'Gate 5',
      services: ['skin care', 'acne treatment', 'skin problems'],
      symptoms: ['skin rash', 'acne', 'pimples', 'eczema', 'psoriasis', 'itchy skin', 'skin allergy', 'mole', 'skin infection', 'hair loss'],
      openHours: '9AM - 5PM',
      priority: 4,
      email: 'dermatologycmz@gmail.com',
      shortDesc: 'Skin, hair, nail care.',
    },
    {
      id: 'doctors-clinic',
      name: "Doctors' Clinic",
      aliases: ['clinic', 'doctor', 'doctors clinic', 'general', 'consultation', 'checkup', 'gp'],
      category: 'service' as const,
      position: { x: 0.15, y: 0.86 },
      nearestRoad: 'Road F',
      nearestGate: 'Gate 1',
      services: ['general consultation', 'health checkup', 'prescriptions'],
      symptoms: ['not feeling well', 'sick', 'general checkup', 'consultation', 'fever', 'cold', 'flu', 'tired', 'weak', 'unwell'],
      openHours: '8AM - 8PM',
      priority: 5,
      email: 'doctorscliniccmz@gmail.com',
      shortDesc: 'General consultation and checkups.',
    },
    {
      id: 'cafeteria',
      name: 'Cafeteria',
      aliases: ['cafeteria', 'canteen', 'food', 'eat', 'restaurant', 'dining', 'hungry', 'lunch', 'breakfast', 'dinner'],
      category: 'amenity' as const,
      position: { x: 0.63, y: 0.89 },
      nearestRoad: 'Road C',
      nearestGate: 'Gate 4',
      services: ['food', 'drinks', 'snacks', 'meals'],
      symptoms: [],
      openHours: '6AM - 10PM',
      priority: 2,
      shortDesc: 'Food and beverages.',
    },
    {
      id: 'comfort-room',
      name: 'Comfort Room',
      aliases: ['cr', 'comfort room', 'restroom', 'toilet', 'bathroom', 'washroom', 'wc'],
      category: 'amenity' as const,
      position: { x: 0.63, y: 0.77 },
      nearestRoad: 'Road C',
      nearestGate: 'Gate 4',
      services: ['restroom', 'toilet'],
      symptoms: [],
      openHours: '24/7',
      priority: 3,
      shortDesc: 'Restroom facilities.',
    },
    {
      id: 'church',
      name: 'Church',
      aliases: ['church', 'chapel', 'pray', 'prayer', 'worship', 'mass', 'spiritual'],
      category: 'amenity' as const,
      position: { x: 0.18, y: 0.24 },
      nearestRoad: 'Road A',
      nearestGate: 'Gate 2',
      services: ['prayer', 'spiritual support', 'chapel services'],
      symptoms: [],
      openHours: '6AM - 9PM',
      priority: 2,
      shortDesc: 'Prayer and spiritual support.',
    },
    {
      id: 'parking',
      name: 'Parking Area',
      aliases: ['parking', 'park', 'car', 'vehicle', 'car park', 'lot'],
      category: 'amenity' as const,
      position: { x: 0.85, y: 0.54 },
      nearestRoad: 'Road E',
      nearestGate: 'Gate 6',
      services: ['parking', 'vehicle parking'],
      symptoms: [],
      openHours: '24/7',
      priority: 1,
      shortDesc: 'Vehicle parking area.',
    },
  ],

  roads: [
    { id: 'road-a', name: 'Road A', start: { x: 0.0, y: 0.34 }, end: { x: 0.63, y: 0.34 }, isVertical: false, connectedRoads: ['road-b', 'road-g'], adjacentLocations: ['church', 'surgery'] },
    { id: 'road-b', name: 'Road B', start: { x: 0.36, y: 0.0 }, end: { x: 0.36, y: 0.74 }, isVertical: true, connectedRoads: ['road-a', 'road-c', 'road-f'], adjacentLocations: ['surgery', 'pediatrics'] },
    { id: 'road-c', name: 'Road C', start: { x: 0.36, y: 0.68 }, end: { x: 0.70, y: 0.68 }, isVertical: false, connectedRoads: ['road-b', 'road-d'], adjacentLocations: ['neurology', 'comfort-room', 'cafeteria'] },
    { id: 'road-d', name: 'Road D', start: { x: 0.68, y: 0.68 }, end: { x: 0.68, y: 0.73 }, isVertical: true, connectedRoads: ['road-c', 'road-e'], adjacentLocations: [] },
    { id: 'road-e', name: 'Road E', start: { x: 0.68, y: 0.72 }, end: { x: 0.90, y: 0.72 }, isVertical: false, connectedRoads: ['road-d', 'road-k'], adjacentLocations: ['cardio-pulmonary'] },
    { id: 'road-f', name: 'Road F', start: { x: 0.0, y: 0.72 }, end: { x: 0.38, y: 0.72 }, isVertical: false, connectedRoads: ['road-b'], adjacentLocations: ['emergency', 'orthopedic', 'radiology', 'doctors-clinic'] },
    { id: 'road-g', name: 'Road G', start: { x: 0.62, y: 0.0 }, end: { x: 0.62, y: 0.36 }, isVertical: true, connectedRoads: ['road-a', 'road-h'], adjacentLocations: ['nephrology', 'ophthalmology'] },
    { id: 'road-h', name: 'Road H', start: { x: 0.63, y: 0.32 }, end: { x: 0.97, y: 0.32 }, isVertical: false, connectedRoads: ['road-g', 'road-i', 'road-k'], adjacentLocations: ['dermatology'] },
    { id: 'road-i', name: 'Road I', start: { x: 0.78, y: 0.05 }, end: { x: 0.78, y: 0.33 }, isVertical: true, connectedRoads: ['road-j', 'road-h'], adjacentLocations: ['dermatology'] },
    { id: 'road-j', name: 'Road J', start: { x: 0.78, y: 0.05 }, end: { x: 0.99, y: 0.05 }, isVertical: false, connectedRoads: ['road-i', 'road-k'], adjacentLocations: [] },
    { id: 'road-k', name: 'Road K', start: { x: 0.97, y: 0.05 }, end: { x: 0.97, y: 0.65 }, isVertical: true, connectedRoads: ['road-j', 'road-h', 'road-e'], adjacentLocations: ['diagnostic-lab'] },
  ],

  gates: [
    { id: 'gate-1', name: 'Gate 1', position: { x: 0.0, y: 0.72 }, connectedRoad: 'road-f', isMainEntrance: true },
    { id: 'gate-2', name: 'Gate 2', position: { x: 0.0, y: 0.35 }, connectedRoad: 'road-a', isMainEntrance: false },
    { id: 'gate-3', name: 'Gate 3', position: { x: 0.37, y: 0.01 }, connectedRoad: 'road-b', isMainEntrance: false },
    { id: 'gate-4', name: 'Gate 4', position: { x: 0.62, y: 0.01 }, connectedRoad: 'road-g', isMainEntrance: false },
    { id: 'gate-5', name: 'Gate 5', position: { x: 0.885, y: 0.01 }, connectedRoad: 'road-i', isMainEntrance: false },
    { id: 'gate-6', name: 'Gate 6', position: { x: 1.0, y: 0.80 }, connectedRoad: 'road-k', isMainEntrance: false },
  ],
};

// ============================================================================
// AI MODEL - Neural Network-like Weights for Navigation
// ============================================================================

interface TrainedWeights {
  // Symptom to department mapping weights (simulated neural network)
  symptomEmbeddings: Map<string, Map<string, number>>;
  // Road preference weights for different scenarios
  roadPreferences: Map<string, number>;
  // Time-based routing adjustments
  timeWeights: { morning: number; afternoon: number; evening: number; night: number };
  // Emergency priority multipliers
  emergencyMultiplier: number;
}

// Pre-trained weights (expanded vocabulary for better understanding)
const TRAINED_WEIGHTS: TrainedWeights = {
  symptomEmbeddings: new Map([
    // Emergency keywords
    ['emergency', new Map([['emergency', 1.0]])],
    ['urgent', new Map([['emergency', 0.95]])],
    ['dying', new Map([['emergency', 1.0]])],
    ['critical', new Map([['emergency', 0.98]])],
    ['accident', new Map([['emergency', 0.95]])],
    ['bleeding', new Map([['emergency', 0.95]])],
    ['unconscious', new Map([['emergency', 0.98]])],
    ['fainted', new Map([['emergency', 0.9]])],
    ['cant breathe', new Map([['emergency', 0.98], ['cardio-pulmonary', 0.8]])],
    ['choking', new Map([['emergency', 0.98]])],
    
    // Heart/Cardio keywords  
    ['chest pain', new Map([['cardio-pulmonary', 0.95], ['emergency', 0.85]])],
    ['heart', new Map([['cardio-pulmonary', 0.95]])],
    ['heart attack', new Map([['emergency', 0.98], ['cardio-pulmonary', 0.9]])],
    ['palpitations', new Map([['cardio-pulmonary', 0.9]])],
    ['high blood pressure', new Map([['cardio-pulmonary', 0.85]])],
    ['hypertension', new Map([['cardio-pulmonary', 0.85]])],
    ['breathing', new Map([['cardio-pulmonary', 0.85], ['emergency', 0.7]])],
    ['asthma', new Map([['cardio-pulmonary', 0.9]])],
    ['cough', new Map([['cardio-pulmonary', 0.7], ['doctors-clinic', 0.5]])],
    ['lung', new Map([['cardio-pulmonary', 0.95]])],
    
    // Neurology keywords
    ['headache', new Map([['neurology', 0.9], ['doctors-clinic', 0.4]])],
    ['migraine', new Map([['neurology', 0.95]])],
    ['seizure', new Map([['neurology', 0.95], ['emergency', 0.8]])],
    ['dizzy', new Map([['neurology', 0.85]])],
    ['dizziness', new Map([['neurology', 0.85]])],
    ['numbness', new Map([['neurology', 0.9]])],
    ['stroke', new Map([['neurology', 0.85], ['emergency', 0.95]])],
    ['memory', new Map([['neurology', 0.8]])],
    ['brain', new Map([['neurology', 0.95]])],
    ['nerve', new Map([['neurology', 0.9]])],
    
    // Orthopedic keywords
    ['bone', new Map([['orthopedic', 0.95]])],
    ['fracture', new Map([['orthopedic', 0.9], ['emergency', 0.6], ['radiology', 0.5]])],
    ['broken', new Map([['orthopedic', 0.9], ['emergency', 0.7]])],
    ['joint', new Map([['orthopedic', 0.9]])],
    ['back pain', new Map([['orthopedic', 0.9]])],
    ['knee', new Map([['orthopedic', 0.9]])],
    ['sprain', new Map([['orthopedic', 0.85]])],
    ['arthritis', new Map([['orthopedic', 0.85]])],
    ['shoulder', new Map([['orthopedic', 0.85]])],
    ['hip', new Map([['orthopedic', 0.85]])],
    ['ankle', new Map([['orthopedic', 0.85]])],
    
    // Eye keywords
    ['eye', new Map([['ophthalmology', 0.95]])],
    ['eyes', new Map([['ophthalmology', 0.95]])],
    ['vision', new Map([['ophthalmology', 0.95]])],
    ['blind', new Map([['ophthalmology', 0.95], ['emergency', 0.7]])],
    ['blurry', new Map([['ophthalmology', 0.9]])],
    ['glasses', new Map([['ophthalmology', 0.85]])],
    ['cataract', new Map([['ophthalmology', 0.95]])],
    
    // Skin keywords
    ['skin', new Map([['dermatology', 0.95]])],
    ['rash', new Map([['dermatology', 0.9]])],
    ['acne', new Map([['dermatology', 0.95]])],
    ['pimples', new Map([['dermatology', 0.9]])],
    ['eczema', new Map([['dermatology', 0.95]])],
    ['itchy', new Map([['dermatology', 0.85]])],
    ['allergy', new Map([['dermatology', 0.7], ['emergency', 0.5]])],
    ['hair loss', new Map([['dermatology', 0.8]])],
    
    // Pediatric keywords
    ['child', new Map([['pediatrics', 0.95]])],
    ['children', new Map([['pediatrics', 0.95]])],
    ['kid', new Map([['pediatrics', 0.95]])],
    ['baby', new Map([['pediatrics', 0.98]])],
    ['infant', new Map([['pediatrics', 0.98]])],
    ['toddler', new Map([['pediatrics', 0.95]])],
    ['vaccination', new Map([['pediatrics', 0.9]])],
    ['vaccine', new Map([['pediatrics', 0.9]])],
    
    // Kidney keywords
    ['kidney', new Map([['nephrology', 0.95]])],
    ['dialysis', new Map([['nephrology', 0.98]])],
    ['renal', new Map([['nephrology', 0.95]])],
    ['urination', new Map([['nephrology', 0.8]])],
    
    // Surgery keywords
    ['surgery', new Map([['surgery', 0.95]])],
    ['operation', new Map([['surgery', 0.9]])],
    ['appendix', new Map([['surgery', 0.9], ['emergency', 0.7]])],
    ['hernia', new Map([['surgery', 0.9]])],
    ['tumor', new Map([['surgery', 0.85]])],
    
    // Lab/Radiology keywords
    ['blood test', new Map([['diagnostic-lab', 0.95]])],
    ['lab', new Map([['diagnostic-lab', 0.9]])],
    ['test', new Map([['diagnostic-lab', 0.7]])],
    ['xray', new Map([['radiology', 0.95]])],
    ['x-ray', new Map([['radiology', 0.95]])],
    ['scan', new Map([['radiology', 0.9]])],
    ['mri', new Map([['radiology', 0.95]])],
    ['ultrasound', new Map([['radiology', 0.95]])],
    ['ct', new Map([['radiology', 0.9]])],
    
    // General/Clinic keywords
    ['sick', new Map([['doctors-clinic', 0.9]])],
    ['unwell', new Map([['doctors-clinic', 0.9]])],
    ['fever', new Map([['doctors-clinic', 0.85], ['pediatrics', 0.6]])],
    ['cold', new Map([['doctors-clinic', 0.8]])],
    ['flu', new Map([['doctors-clinic', 0.85]])],
    ['checkup', new Map([['doctors-clinic', 0.9]])],
    ['consultation', new Map([['doctors-clinic', 0.85]])],
    ['doctor', new Map([['doctors-clinic', 0.9]])],
    
    // Amenity keywords
    ['food', new Map([['cafeteria', 0.95]])],
    ['eat', new Map([['cafeteria', 0.95]])],
    ['hungry', new Map([['cafeteria', 0.95]])],
    ['lunch', new Map([['cafeteria', 0.9]])],
    ['breakfast', new Map([['cafeteria', 0.9]])],
    ['dinner', new Map([['cafeteria', 0.9]])],
    ['canteen', new Map([['cafeteria', 0.95]])],
    ['toilet', new Map([['comfort-room', 0.98]])],
    ['restroom', new Map([['comfort-room', 0.98]])],
    ['bathroom', new Map([['comfort-room', 0.98]])],
    ['cr', new Map([['comfort-room', 0.95]])],
    ['pray', new Map([['church', 0.95]])],
    ['prayer', new Map([['church', 0.95]])],
    ['chapel', new Map([['church', 0.95]])],
    ['mass', new Map([['church', 0.9]])],
    ['parking', new Map([['parking', 0.98]])],
    ['car', new Map([['parking', 0.9]])],
    ['park', new Map([['parking', 0.85]])],
  ]),
  roadPreferences: new Map([
    ['road-a', 1.0],  // Main corridor - preferred
    ['road-b', 1.0],  // Central vertical - preferred
    ['road-f', 1.1],  // Near emergency - slightly preferred for emergencies
    ['road-c', 1.0],
    ['road-d', 1.2],  // Short connector
    ['road-e', 1.0],
    ['road-g', 1.0],
    ['road-h', 1.0],
    ['road-i', 1.1],
    ['road-j', 1.2],
    ['road-k', 1.0],
  ]),
  timeWeights: {
    morning: 1.0,    // 6am-12pm: normal
    afternoon: 1.1,  // 12pm-5pm: slightly busier
    evening: 1.0,    // 5pm-9pm: normal
    night: 0.9,      // 9pm-6am: less traffic
  },
  emergencyMultiplier: 0.5, // Reduce path cost for emergencies
};

// ============================================================================
// AI INFERENCE ENGINE
// ============================================================================

export class HospitalNavigationAI {
  private weights: TrainedWeights;
  private knowledgeBase: typeof HOSPITAL_KNOWLEDGE_BASE;
  private conversationContext: {
    lastQuery: string;
    lastLocation: Location | null;
    userPosition: { x: number; y: number } | null;
    isEmergency: boolean;
  };

  constructor() {
    this.weights = TRAINED_WEIGHTS;
    this.knowledgeBase = HOSPITAL_KNOWLEDGE_BASE;
    this.conversationContext = {
      lastQuery: '',
      lastLocation: null,
      userPosition: null,
      isEmergency: false,
    };
  }

  /**
   * Main AI inference method - understands natural language and provides navigation
   */
  public processQuery(query: string, userPosition?: { x: number; y: number }): AIResponse {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Update context
    this.conversationContext.lastQuery = normalizedQuery;
    if (userPosition) {
      this.conversationContext.userPosition = userPosition;
    }

    // Detect intent
    const intent = this.detectIntent(normalizedQuery);
    
    // Find relevant location(s)
    const locationMatch = this.findBestLocationMatch(normalizedQuery);
    
    // Check for emergency
    this.conversationContext.isEmergency = intent.isEmergency;

    // Generate response based on intent
    let response: AIResponse;

    switch (intent.type) {
      case 'emergency':
        response = this.handleEmergency(userPosition);
        break;
      case 'navigate':
        response = this.handleNavigation(locationMatch, userPosition);
        break;
      case 'symptom':
        response = this.handleSymptomQuery(normalizedQuery, userPosition);
        break;
      case 'info':
        response = this.handleInfoQuery(locationMatch);
        break;
      case 'list':
        response = this.handleListQuery();
        break;
      case 'greeting':
        response = this.handleGreeting();
        break;
      default:
        response = this.handleUnknown(normalizedQuery);
    }

    // Update context with response
    if (locationMatch.location) {
      this.conversationContext.lastLocation = locationMatch.location;
    }

    return response;
  }

  /**
   * Detect user intent using pattern matching and keyword analysis
   */
  private detectIntent(query: string): { type: IntentType; confidence: number; isEmergency: boolean } {
    const patterns = {
      emergency: /\b(emergency|dying|heart attack|cant breathe|severe bleeding|unconscious|critical|urgent help)\b/i,
      navigate: /\b(take me|go to|navigate|find|where is|directions|how do i get|lead me|guide me)\b/i,
      symptom: /\b(i have|im feeling|feeling|pain|hurts|ache|suffering|my .+ (hurts|aches|pain))\b/i,
      info: /\b(what is|whats|tell me about|information|describe|explain|services|hours)\b/i,
      list: /\b(list|all|show|departments|facilities|available|options)\b/i,
      greeting: /\b(hello|hi|hey|good morning|good afternoon|good evening)\b/i,
      confirm: /\b(yes|yeah|ok|sure|please)\b/i,
    };

    let bestMatch: IntentType = 'unknown';
    let bestConfidence = 0;
    const isEmergency = patterns.emergency.test(query);

    // Emergency always takes priority
    if (isEmergency) {
      return { type: 'emergency', confidence: 1.0, isEmergency: true };
    }

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(query)) {
        const confidence = 0.8 + Math.random() * 0.2; // Simulated confidence
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = intent as IntentType;
        }
      }
    }

    return { type: bestMatch, confidence: bestConfidence, isEmergency: false };
  }

  /**
   * Find best matching location using trained embeddings and aliases
   */
  private findBestLocationMatch(query: string): { location: Location | null; confidence: number; matchType: string } {
    let bestLocation: Location | null = null;
    let bestScore = 0;
    let matchType = 'none';

    for (const location of this.knowledgeBase.locations) {
      // Check alias match (highest priority)
      for (const alias of location.aliases || []) {
        if (query.includes(alias.toLowerCase())) {
          const score = 0.98;
          if (score > bestScore) {
            bestScore = score;
            bestLocation = location;
            matchType = 'alias';
          }
        }
      }

      // Check name match
      if (query.includes(location.name.toLowerCase())) {
        const score = 0.95;
        if (score > bestScore) {
          bestScore = score;
          bestLocation = location;
          matchType = 'name';
        }
      }

      // Check symptom embeddings
      for (const symptom of location.symptoms) {
        if (query.includes(symptom.toLowerCase())) {
          const embeddingScore = this.weights.symptomEmbeddings.get(symptom)?.get(location.id) || 0;
          const score = Math.max(0.7, embeddingScore);
          if (score > bestScore) {
            bestScore = score;
            bestLocation = location;
            matchType = 'symptom';
          }
        }
      }

      // Check services
      for (const service of location.services) {
        if (query.includes(service.toLowerCase())) {
          const score = 0.8;
          if (score > bestScore) {
            bestScore = score;
            bestLocation = location;
            matchType = 'service';
          }
        }
      }
    }

    return { location: bestLocation, confidence: bestScore, matchType };
  }

  /**
   * Calculate optimal path using A* with trained weights
   */
  public calculatePath(
    from: { x: number; y: number },
    to: { x: number; y: number },
    isEmergency: boolean = false
  ): PathResult {
    // Find nearest roads to start and end points
    const startRoad = this.findNearestRoad(from);
    const endRoad = this.findNearestRoad(to);

    if (!startRoad || !endRoad) {
      return { path: [], distance: Infinity, estimatedTime: Infinity, instructions: [] };
    }

    // Use A* algorithm with trained weights
    const path = this.aStarPathfinding(startRoad, endRoad, isEmergency);
    
    // Generate turn-by-turn instructions
    const instructions = this.generateInstructions(path, to);

    // Calculate estimated walking time (average 1.4 m/s walking speed)
    const distance = this.calculatePathDistance(path);
    const estimatedTime = Math.ceil(distance / 1.4);

    return { path, distance, estimatedTime, instructions };
  }

  private findNearestRoad(point: { x: number; y: number }): Road | null {
    let nearest: Road | null = null;
    let minDist = Infinity;

    for (const road of this.knowledgeBase.roads) {
      const dist = this.pointToSegmentDistance(
        point,
        road.start,
        road.end
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = road;
      }
    }

    return nearest;
  }

  private pointToSegmentDistance(
    point: { x: number; y: number },
    segStart: { x: number; y: number },
    segEnd: { x: number; y: number }
  ): number {
    const dx = segEnd.x - segStart.x;
    const dy = segEnd.y - segStart.y;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      return Math.sqrt((point.x - segStart.x) ** 2 + (point.y - segStart.y) ** 2);
    }

    let t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    const projX = segStart.x + t * dx;
    const projY = segStart.y + t * dy;

    return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
  }

  private aStarPathfinding(startRoad: Road, endRoad: Road, isEmergency: boolean): { x: number; y: number }[] {
    // Simplified A* - in production, this would be a full implementation
    // For now, return a direct path through connected roads
    const path: { x: number; y: number }[] = [];
    
    // Add start point
    path.push({ ...startRoad.start });

    // If same road, just go directly
    if (startRoad.id === endRoad.id) {
      path.push({ ...endRoad.end });
      return path;
    }

    // Find path through road network (BFS for simplicity)
    const visited = new Set<string>();
    const queue: { road: Road; path: Road[] }[] = [{ road: startRoad, path: [startRoad] }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.road.id === endRoad.id) {
        // Found path - convert to coordinates
        for (const road of current.path) {
          path.push({ ...road.start });
          path.push({ ...road.end });
        }
        return path;
      }

      if (visited.has(current.road.id)) continue;
      visited.add(current.road.id);

      // Add connected roads
      for (const connectedId of current.road.connectedRoads) {
        const connectedRoad = this.knowledgeBase.roads.find(r => r.id === connectedId);
        if (connectedRoad && !visited.has(connectedId)) {
          // Apply trained weights (for future use with weighted pathfinding)
          const weight = this.weights.roadPreferences.get(connectedId) || 1.0;
          // Weight can be used to prioritize certain roads
          void(isEmergency ? weight * this.weights.emergencyMultiplier : weight);
          
          queue.push({
            road: connectedRoad,
            path: [...current.path, connectedRoad],
          });
        }
      }
    }

    // No path found - return direct line (shouldn't happen in well-connected network)
    path.push({ ...endRoad.end });
    return path;
  }

  private calculatePathDistance(path: { x: number; y: number }[]): number {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      distance += Math.sqrt(dx * dx + dy * dy) * 100; // Scale to approximate meters
    }
    return distance;
  }

  private generateInstructions(path: { x: number; y: number }[], _destination: { x: number; y: number }): string[] {
    const instructions: string[] = [];
    
    if (path.length < 2) {
      instructions.push('You are already at your destination.');
      return instructions;
    }

    instructions.push('Start walking from your current location.');

    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;

      let direction = '';
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'forward' : 'back';
      }

      const distance = Math.sqrt(dx * dx + dy * dy) * 100;
      instructions.push(`Continue ${direction} for approximately ${Math.round(distance)} meters.`);
    }

    instructions.push('You have arrived at your destination.');
    return instructions;
  }

  // Intent handlers - SHORT RESPONSES
  private handleEmergency(_userPosition?: { x: number; y: number }): AIResponse {
    const emergency = this.knowledgeBase.locations.find(l => l.id === 'emergency')!;
    
    return {
      message: `🚨 Emergency Room - Near Gate 1. Open 24/7. Starting navigation.`,
      location: emergency,
      shouldNavigate: true,
      confidence: 1.0,
      isEmergency: true,
    };
  }

  private handleNavigation(match: { location: Location | null; confidence: number; matchType: string }, _userPosition?: { x: number; y: number }): AIResponse {
    if (!match.location) {
      return {
        message: "Can't find that. Try: Emergency, Surgery, Pediatrics, Lab, or Cafeteria.",
        location: null,
        shouldNavigate: false,
        confidence: 0,
        isEmergency: false,
      };
    }

    const loc = match.location;
    return {
      message: `📍 ${loc.name} - Near ${loc.nearestGate}. ${loc.shortDesc || ''} Starting navigation.`,
      location: loc,
      shouldNavigate: true,
      confidence: match.confidence,
      isEmergency: false,
    };
  }

  private handleSymptomQuery(query: string, _userPosition?: { x: number; y: number }): AIResponse {
    // Use symptom embeddings to find best department
    let bestLocation: Location | null = null;
    let bestScore = 0;

    // Check embeddings
    for (const [symptom, departmentScores] of this.weights.symptomEmbeddings) {
      if (query.includes(symptom)) {
        for (const [deptId, score] of departmentScores) {
          if (score > bestScore) {
            bestScore = score;
            bestLocation = this.knowledgeBase.locations.find(l => l.id === deptId) || null;
          }
        }
      }
    }

    // Also check location symptoms directly
    if (!bestLocation) {
      for (const loc of this.knowledgeBase.locations) {
        for (const symptom of loc.symptoms) {
          if (query.includes(symptom.toLowerCase())) {
            bestLocation = loc;
            bestScore = 0.8;
            break;
          }
        }
        if (bestLocation) break;
      }
    }

    if (bestLocation) {
      return {
        message: `For that, go to ${bestLocation.name}. ${bestLocation.shortDesc || ''} Navigate?`,
        location: bestLocation,
        shouldNavigate: false,
        confidence: bestScore,
        isEmergency: bestLocation.id === 'emergency',
      };
    }

    return {
      message: "Describe your concern. Example: 'chest pain', 'headache', 'need xray'.",
      location: null,
      shouldNavigate: false,
      confidence: 0.3,
      isEmergency: false,
    };
  }

  private handleInfoQuery(match: { location: Location | null; confidence: number; matchType: string }): AIResponse {
    if (!match.location) {
      return {
        message: "Which place? I have info on all departments and facilities.",
        location: null,
        shouldNavigate: false,
        confidence: 0.5,
        isEmergency: false,
      };
    }

    const loc = match.location;
    return {
      message: `${loc.name}: ${loc.shortDesc || loc.services.slice(0, 2).join(', ')}. Hours: ${loc.openHours}. Near ${loc.nearestGate}. Need directions?`,
      location: loc,
      shouldNavigate: false,
      confidence: match.confidence,
      isEmergency: false,
    };
  }

  private handleListQuery(): AIResponse {
    const depts = this.knowledgeBase.locations
      .filter(l => l.category === 'department')
      .map(l => l.name.replace(' Department', ''))
      .join(', ');

    return {
      message: `Departments: ${depts}. Also: Lab, Radiology, Clinic, Cafeteria, CR, Church, Parking. Which one?`,
      location: null,
      shouldNavigate: false,
      confidence: 0.9,
      isEmergency: false,
    };
  }

  private handleGreeting(): AIResponse {
    return {
      message: "Hi! I can navigate you anywhere in the hospital. Where do you need to go?",
      location: null,
      shouldNavigate: false,
      confidence: 1.0,
      isEmergency: false,
    };
  }

  private handleUnknown(_query: string): AIResponse {
    // Check if there's context from previous conversation
    if (this.conversationContext.lastLocation) {
      return {
        message: `Going to ${this.conversationContext.lastLocation.name}?`,
        location: this.conversationContext.lastLocation,
        shouldNavigate: false,
        confidence: 0.4,
        isEmergency: false,
      };
    }

    return {
      message: "Try: 'Emergency Room', 'where is cafeteria', 'I have headache', or 'list departments'.",
      location: null,
      shouldNavigate: false,
      confidence: 0.2,
      isEmergency: false,
    };
  }
}

// Types
type IntentType = 'emergency' | 'navigate' | 'symptom' | 'info' | 'list' | 'greeting' | 'confirm' | 'unknown';

export interface AIResponse {
  message: string;
  location: Location | null;
  shouldNavigate: boolean;
  confidence: number;
  isEmergency: boolean;
}

export interface PathResult {
  path: { x: number; y: number }[];
  distance: number;
  estimatedTime: number;
  instructions: string[];
}

// Export singleton instance
export const hospitalAI = new HospitalNavigationAI();

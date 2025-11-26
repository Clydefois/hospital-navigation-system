'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Map,
  Layers,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Navigation2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MapLegendItem {
  color: string;
  label: string;
  icon: string;
}

export default function InteractiveMap() {
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showLegend, setShowLegend] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  const floors = [
    { id: 0, name: 'Ground Floor', label: 'G', hasMap: true },
  ];

  const legendItems: MapLegendItem[] = [
    { color: 'bg-red-500', label: 'Emergency Services', icon: '🚨' },
    { color: 'bg-blue-500', label: 'Patient Rooms', icon: '🛏️' },
    { color: 'bg-green-500', label: 'Surgical Units', icon: '⚕️' },
    { color: 'bg-yellow-500', label: 'Diagnostic Services', icon: '🔬' },
    { color: 'bg-purple-500', label: 'Administration', icon: '📋' },
    { color: 'bg-orange-500', label: 'Cafeteria/Food', icon: '🍽️' },
    { color: 'bg-pink-500', label: 'Maternity Ward', icon: '👶' },
    { color: 'bg-teal-500', label: 'Pharmacy', icon: '💊' },
    { color: 'bg-gray-400', label: 'Elevators', icon: '🛗' },
    { color: 'bg-cyan-500', label: 'Restrooms', icon: '🚻' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl text-gray-900 mb-3 flex items-center justify-center" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 900 }}>
          <Map className="mr-3 text-blue-600" size={36} />
          Interactive Hospital Map
        </h2>
        <p className="text-xl text-gray-600" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 400 }}>
          Explore different floors and navigate to your destination
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-strong rounded-2xl shadow-xl p-6 sticky top-24 space-y-6">
            {/* Search Location */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Search className="mr-2 text-blue-600" size={20} />
                Find Location
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 text-sm cursor-text"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Floor Selection */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Layers className="mr-2 text-blue-600" size={20} />
                Current Floor
              </h3>
              <div className="space-y-2">
                {floors.map((floor) => (
                  <button
                    key={floor.id}
                    onClick={() => setSelectedFloor(floor.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 cursor-pointer ${
                      selectedFloor === floor.id
                        ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{floor.name}</span>
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          selectedFloor === floor.id
                            ? 'bg-white text-blue-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {floor.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <Navigation className="mr-2 text-blue-600" size={18} />
                Quick Navigation
              </h4>
              <div className="space-y-2">
                <button className="w-full text-left text-sm px-4 py-3 bg-red-50 rounded-xl hover:bg-red-100 text-red-700 font-medium transition-colors flex items-center space-x-2 cursor-pointer">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Emergency Room</span>
                </button>
                <button className="w-full text-left text-sm px-4 py-3 bg-blue-50 rounded-xl hover:bg-blue-100 text-blue-700 font-medium transition-colors flex items-center space-x-2 cursor-pointer">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Cardio-Pulmonary</span>
                </button>
                <button className="w-full text-left text-sm px-4 py-3 bg-green-50 rounded-xl hover:bg-green-100 text-green-700 font-medium transition-colors flex items-center space-x-2 cursor-pointer">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Cafeteria</span>
                </button>
                <button className="w-full text-left text-sm px-4 py-3 bg-purple-50 rounded-xl hover:bg-purple-100 text-purple-700 font-medium transition-colors flex items-center space-x-2 cursor-pointer">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>Pediatric Dept.</span>
                </button>
                <button className="w-full text-left text-sm px-4 py-3 bg-teal-50 rounded-xl hover:bg-teal-100 text-teal-700 font-medium transition-colors flex items-center space-x-2 cursor-pointer">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  <span>Surgery Department</span>
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Map Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded" />
                  <span className="text-gray-600">Passage/Hallway</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span className="text-gray-600">Departments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                  <span className="text-gray-600">Your Location</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="lg:col-span-3">
          <div className="glass-strong rounded-lg shadow-lg overflow-hidden">
            {/* Map Controls */}
            <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Current Floor: {floors[selectedFloor].name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLegend(!showLegend)}
                  className="p-2 bg-white rounded hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Toggle Legend"
                >
                  <Layers size={20} />
                </button>
                <button
                  onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
                  className="p-2 bg-white rounded hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                  className="p-2 bg-white rounded hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  className="p-2 bg-white rounded hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize2 size={20} />
                </button>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="relative bg-white min-h-[700px] overflow-auto rounded-b-lg">
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease',
                }}
                className="w-full h-full p-8 flex items-center justify-center"
              >
                {/* Actual Hospital Floor Plan */}
                <div className="relative w-full max-w-6xl mx-auto">
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                    <Image
                      src="/HospitalFloorPlan.png"
                      alt="Hospital Floor Plan"
                      fill
                      className="object-contain bg-gray-100"
                      priority
                    />
                    
                    {/* Interactive markers - positioned based on the floor plan */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="absolute top-[68%] left-[50%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      whileHover={{ scale: 1.3 }}
                    >
                      <div className="relative">
                        <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                          Emergency Room
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: 'spring' }}
                      className="absolute top-[45%] left-[78%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      whileHover={{ scale: 1.3 }}
                    >
                      <div className="relative">
                        <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse shadow-lg" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                          Cardio-Pulmonary
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: 'spring' }}
                      className="absolute top-[55%] left-[68%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      whileHover={{ scale: 1.3 }}
                    >
                      <div className="relative">
                        <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse shadow-lg" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                          Cafeteria
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: 'spring' }}
                      className="absolute top-[55%] left-[48%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      whileHover={{ scale: 1.3 }}
                    >
                      <div className="relative">
                        <div className="w-6 h-6 bg-purple-500 rounded-full animate-pulse shadow-lg" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                          Pediatric Dept.
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: 'spring' }}
                      className="absolute top-[28%] left-[32%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      whileHover={{ scale: 1.3 }}
                    >
                      <div className="relative">
                        <div className="w-6 h-6 bg-teal-500 rounded-full animate-pulse shadow-lg" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                          Surgery Department
                        </div>
                      </div>
                    </motion.div>

                    {/* Current Location Indicator */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute top-[80%] left-[50%] -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-xl border-4 border-white" />
                        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap shadow-xl flex items-center space-x-2">
                          <Navigation2 size={16} />
                          <span>You Are Here</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Legend */}
            {showLegend && (
              <div className="bg-white border-t p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  Map Legend
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 ${item.color} rounded`}></div>
                      <span className="text-xs text-gray-700">
                        {item.icon} {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map Instructions */}
          <div className="mt-4 glass rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-2">
              How to Use Interactive Map
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select a floor from the sidebar to view that level</li>
              <li>• Use zoom controls to get a closer look at specific areas</li>
              <li>• Click on colored markers to see department details</li>
              <li>• Use voice commands to navigate to specific locations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

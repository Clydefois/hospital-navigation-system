'use client';

import React, { useState } from 'react';
import {
  Map,
  Layers,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MapPin,
} from 'lucide-react';

interface MapLegendItem {
  color: string;
  label: string;
  icon: string;
}

export default function InteractiveMap() {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [showLegend, setShowLegend] = useState(true);

  const floors = [
    { id: 0, name: 'Ground Floor', label: 'G' },
    { id: 1, name: '1st Floor', label: '1' },
    { id: 2, name: '2nd Floor', label: '2' },
    { id: 3, name: '3rd Floor', label: '3' },
    { id: 4, name: '4th Floor', label: '4' },
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
        {/* Floor Selection Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Layers className="mr-2 text-blue-600" size={20} />
              Floor Selection
            </h3>
            <div className="space-y-2">
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setSelectedFloor(floor.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedFloor === floor.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{floor.name}</span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        selectedFloor === floor.id
                          ? 'bg-white text-blue-600'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      {floor.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Navigation */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <Navigation className="mr-2 text-blue-600" size={16} />
                Quick Navigation
              </h4>
              <div className="space-y-2">
                <button className="w-full text-left text-sm px-3 py-2 bg-gray-100 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  Emergency Room
                </button>
                <button className="w-full text-left text-sm px-3 py-2 bg-gray-100 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  Main Entrance
                </button>
                <button className="w-full text-left text-sm px-3 py-2 bg-gray-100 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  Parking
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                  className="p-2 bg-white rounded hover:bg-gray-200 transition-colors"
                  title="Toggle Legend"
                >
                  <Layers size={20} />
                </button>
                <button
                  onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
                  className="p-2 bg-white rounded hover:bg-gray-200 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                  className="p-2 bg-white rounded hover:bg-gray-200 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  className="p-2 bg-white rounded hover:bg-gray-200 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 size={20} />
                </button>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="relative bg-gray-50 min-h-[600px] overflow-auto">
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.3s ease',
                }}
                className="w-full h-full p-8"
              >
                {/* Placeholder Map - Replace with actual floor plan */}
                <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-dashed border-blue-300 rounded-lg min-h-[500px] flex items-center justify-center relative">
                  <div className="text-center z-10">
                    <MapPin size={64} className="mx-auto text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      {floors[selectedFloor].name} Plan
                    </h3>
                    <p className="text-gray-500">
                      Upload your {floors[selectedFloor].name} PNG map here
                    </p>
                    <p className="text-gray-400 text-sm mt-4">
                      Interactive features will be added after map upload
                    </p>
                  </div>

                  {/* Sample Interactive Points (to be customized) */}
                  <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full animate-pulse cursor-pointer hover:scale-150 transition-transform"></div>
                  <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-blue-500 rounded-full animate-pulse cursor-pointer hover:scale-150 transition-transform"></div>
                  <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-green-500 rounded-full animate-pulse cursor-pointer hover:scale-150 transition-transform"></div>
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
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
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

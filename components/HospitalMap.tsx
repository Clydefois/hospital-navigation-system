'use client';

import React, { useState } from 'react';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';

export default function HospitalMap() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <MapPin className="mr-2 text-blue-600" size={28} />
          Hospital Floor Plan
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 relative">
        <div className="flex items-center justify-center min-h-[400px] p-8 overflow-auto">
          <div
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.3s ease',
            }}
            className="w-full max-w-4xl"
          >
            {/* Placeholder for the hospital map image */}
            <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={64} className="mx-auto text-blue-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                  Hospital Floor Plan
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Upload your PNG floor plan here
                </p>
                <p className="text-gray-400 text-xs mt-4">
                  This will be replaced with your actual hospital map
                </p>
              </div>
              {/* When you add your PNG, replace the div above with:
              <Image
                src="/floor-plan.png"
                alt="Hospital Floor Plan"
                fill
                className="object-contain"
              />
              */}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
          Use voice commands or click on the map to navigate
        </p>
      </div>
    </div>
  );
}

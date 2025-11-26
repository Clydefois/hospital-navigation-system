'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Navigation2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HospitalMap() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="glass-strong rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 flex justify-between items-center">
        <h3 className="text-2xl font-bold flex items-center" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 900 }}>
          <MapPin className="mr-3" size={28} strokeWidth={2.5} />
          Hospital Floor Plan
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
            className="p-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all shadow-lg cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
            className="p-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all shadow-lg cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={20} strokeWidth={2.5} />
          </button>
          <button
            className="p-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all shadow-lg cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="bg-white p-8 relative">
        <div className="flex items-center justify-center overflow-auto rounded-xl bg-gray-50">
          <div
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.3s ease',
            }}
            className="w-full max-w-6xl p-8"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/HospitalFloorPlan.png"
                alt="Hospital Floor Plan"
                fill
                className="object-contain bg-gray-100"
                priority
              />
              
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
                  <div className="w-10 h-10 bg-yellow-400 rounded-full shadow-2xl border-4 border-white" />
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap shadow-2xl flex items-center space-x-2">
                    <Navigation2 size={16} />
                    <span>You Are Here</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-gray-300 rounded mr-2"></span>
            <span className="text-gray-700 font-medium">Passage/Hallway</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-blue-500 rounded mr-2"></span>
            <span className="text-gray-700 font-medium">Departments</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-yellow-400 rounded-full mr-2"></span>
            <span className="text-gray-700 font-medium">Your Location</span>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-lg cursor-pointer">
          View Interactive Map
        </button>
      </div>
    </div>
  );
}

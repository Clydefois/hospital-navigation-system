'use client';

import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Dynamic import to prevent SSR issues with Leaflet
const InteractiveMapLeaflet = dynamic(
  () => import('@/components/InteractiveMapLeaflet'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

export default function MapTestPage() {
  return (
    <div className="fixed inset-0 bg-gray-100">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Floor Plan Map Test</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>
      
      {/* Full Screen Map */}
      <div className="w-full h-full pt-16">
        <InteractiveMapLeaflet fullScreen />
      </div>
    </div>
  );
}

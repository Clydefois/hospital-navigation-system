'use client';

import React, { useState } from 'react';
import { Car, Clock, DollarSign, MapPin, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function ParkingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  const navigateWithLoader = (path: string, text: string) => {
    setLoadingText(text);
    setIsLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Full Screen Loader */}
      {isLoading && <Loader text={loadingText} />}
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigateWithLoader('/', 'Going back...')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Parking Information</h1>
          <p className="text-lg text-gray-600">Multi-level parking facility for patients and visitors</p>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={24} className="text-purple-600" />
            Parking Location
          </h2>
          <p className="text-gray-700 mb-4">
            <strong>Location:</strong> Central Pavilion - Outdoor
          </p>
          <p className="text-gray-700">
            <strong>Zone:</strong> Outdoor (Main Entrance)
          </p>
          <div className="mt-6">
            <button 
              onClick={() => navigateWithLoader('/navigation', 'Opening navigation...')}
              className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md cursor-pointer"
            >
              Get Directions to Parking
            </button>
          </div>
        </div>

        {/* Parking Rates */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={24} className="text-green-600" />
            Parking Rates
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">First Hour</span>
              <span className="text-green-600 font-bold">₱50</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Additional Hours</span>
              <span className="text-green-600 font-bold">₱30 / hour</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Daily Maximum</span>
              <span className="text-green-600 font-bold">₱300</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <span className="font-semibold text-gray-900">Monthly Pass</span>
              <span className="text-green-600 font-bold">₱3,500</span>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={24} className="text-blue-600" />
            Operating Hours
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Weekdays</span>
              <span className="text-gray-700 font-medium">24/7 Access</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Weekends</span>
              <span className="text-gray-700 font-medium">24/7 Access</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Holidays</span>
              <span className="text-gray-700 font-medium">24/7 Access</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Car size={24} className="text-indigo-600" />
            Parking Amenities
          </h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-green-500 text-2xl">✓</span>
              <span className="text-gray-700">Multi-level covered parking</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-green-500 text-2xl">✓</span>
              <span className="text-gray-700">24/7 security surveillance</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-green-500 text-2xl">✓</span>
              <span className="text-gray-700">Wheelchair accessible parking spaces</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-green-500 text-2xl">✓</span>
              <span className="text-gray-700">Direct access to hospital entrance</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-green-500 text-2xl">✓</span>
              <span className="text-gray-700">Emergency vehicle priority lanes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

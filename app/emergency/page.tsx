'use client';

import React from 'react';
import { AlertTriangle, Phone, Navigation, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <button className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold mb-4">
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <AlertTriangle size={48} className="text-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">Emergency Services</h1>
          </div>
          <p className="text-lg text-gray-700">24/7 immediate medical care for urgent conditions</p>
        </div>

        {/* Emergency Hotline - Prominent */}
        <div className="bg-red-600 text-white rounded-lg shadow-xl p-8 mb-6 border-4 border-red-700">
          <div className="text-center">
            <Phone size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">EMERGENCY HOTLINE</h2>
            <a href="tel:0917-555-1001" className="text-5xl font-black hover:underline block mb-4">
              0917-555-1001
            </a>
            <p className="text-red-100 text-lg">Available 24 hours a day, 7 days a week</p>
          </div>
        </div>

        {/* Location & Directions */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Navigation size={24} className="text-red-600" />
            Emergency Room Location
          </h2>
          <p className="text-gray-700 mb-2">
            <strong>Location:</strong> South Complex, Ground Floor
          </p>
          <p className="text-gray-700 mb-6">
            <strong>Zone:</strong> Zone S2
          </p>
          <Link href="/navigation">
            <button className="w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg shadow-md">
              Get Directions to Emergency Room
            </button>
          </Link>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={24} className="text-red-600" />
            Operating Hours
          </h2>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
            <p className="text-3xl font-black text-green-700">OPEN 24/7</p>
            <p className="text-gray-700 mt-2">Emergency services available every day, all day</p>
          </div>
        </div>

        {/* Medical Staff */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Medical Team</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-600">
              <p className="font-bold text-gray-900 text-lg">Dr. Samuel Reyes</p>
              <p className="text-red-600 font-semibold">Emergency Medicine Specialist</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-600">
              <p className="font-bold text-gray-900 text-lg">Dr. Nicole Santos</p>
              <p className="text-red-600 font-semibold">Trauma Specialist</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-600">
              <p className="font-bold text-gray-900 text-lg">Dr. Harold Villanueva</p>
              <p className="text-red-600 font-semibold">Acute Care Medicine</p>
            </div>
          </div>
        </div>

        {/* When to Visit ER */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">When to Visit the Emergency Room</h2>
          <p className="text-gray-700 mb-4">Seek immediate emergency care if you experience:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-red-600 text-xl shrink-0">•</span>
              <span>Chest pain or pressure</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-red-600 text-xl shrink-0">•</span>
              <span>Difficulty breathing or shortness of breath</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-red-600 text-xl shrink-0">•</span>
              <span>Severe bleeding or injuries</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-red-600 text-xl shrink-0">•</span>
              <span>Sudden severe headache or vision changes</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-red-600 text-xl shrink-0">•</span>
              <span>Loss of consciousness or confusion</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-red-600 text-xl shrink-0">•</span>
              <span>Severe allergic reactions</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-red-600 text-xl shrink-0">•</span>
              <span>Suspected stroke or heart attack</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-red-600 text-xl shrink-0">•</span>
              <span>Severe burns or poisoning</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

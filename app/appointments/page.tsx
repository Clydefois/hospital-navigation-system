'use client';

import React from 'react';
import { Calendar, User, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4">
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Appointment</h1>
          <p className="text-lg text-gray-600">Schedule a consultation with our medical specialists</p>
        </div>

        {/* Appointment Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6">
            {/* Patient Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={24} className="text-blue-600" />
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Juan Dela Cruz"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0917-555-1234"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="juan@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={24} className="text-blue-600" />
                Appointment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
                    <option>Select Department</option>
                    <option>Emergency Room (ER)</option>
                    <option>Doctors&apos; Clinic</option>
                    <option>Radiology Department</option>
                    <option>Orthopedic Department</option>
                    <option>Cardio-Pulmonary Department</option>
                    <option>Diagnostic / Laboratory</option>
                    <option>Neurology Department</option>
                    <option>Pediatric Department</option>
                    <option>Surgery Department</option>
                    <option>Nephrology Department</option>
                    <option>Dermatology Department</option>
                    <option>Ophthalmology Department</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Doctor</label>
                  <input
                    type="text"
                    placeholder="Dr. Name (Optional)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit</label>
              <textarea
                rows={4}
                placeholder="Please describe your symptoms or reason for appointment..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md"
            >
              Submit Appointment Request
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border-2 border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Phone size={20} className="text-blue-600" />
            Need Help?
          </h3>
          <p className="text-gray-700">
            Call our appointment hotline at <a href="tel:0917-555-1000" className="text-blue-600 font-semibold hover:underline">0917-555-1000</a> for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

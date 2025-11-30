'use client';

import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function ContactPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-lg text-gray-600">Get in touch with Zamboanga Medical Center</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Phone size={24} className="text-blue-600" />
                Phone Numbers
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Main Line</p>
                  <a href="tel:0917-555-1000" className="text-blue-600 hover:underline font-semibold text-lg">
                    0917-555-1000
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Emergency Hotline</p>
                  <a href="tel:0917-555-1001" className="text-red-600 hover:underline font-semibold text-lg">
                    0917-555-1001
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Appointments</p>
                  <a href="tel:0917-555-1002" className="text-blue-600 hover:underline font-semibold text-lg">
                    0917-555-1002
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail size={24} className="text-green-600" />
                Email
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">General Inquiries</p>
                  <a href="mailto:info@zmchospital.ph" className="text-green-600 hover:underline font-semibold">
                    info@zmchospital.ph
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Appointments</p>
                  <a href="mailto:appointments@zmchospital.ph" className="text-green-600 hover:underline font-semibold">
                    appointments@zmchospital.ph
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={24} className="text-purple-600" />
                Address
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Zamboanga Medical Center<br />
                Dr. Evangelista St, Barangay Zone IV<br />
                Zamboanga City, Zamboanga del Sur 7000<br />
                Philippines
              </p>
              <div className="mt-4">
                <button 
                  onClick={() => navigateWithLoader('/navigation', 'Opening navigation...')}
                  className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm cursor-pointer"
                >
                  Get Directions
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={24} className="text-indigo-600" />
                Operating Hours
              </h2>
              <div className="space-y-2">
                <p className="text-gray-700"><strong>Emergency Room:</strong> 24/7</p>
                <p className="text-gray-700"><strong>Outpatient Services:</strong> Mon-Sat, 8:00 AM - 5:00 PM</p>
                <p className="text-gray-700"><strong>Pharmacy:</strong> Mon-Sun, 7:00 AM - 9:00 PM</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageCircle size={24} className="text-blue-600" />
              Send Us a Message
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Juan Dela Cruz"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="0917-555-1234"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  rows={5}
                  placeholder="Your message..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

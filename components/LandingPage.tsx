'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceAssistantModal from './VoiceAssistantModal';
import QuickAccessServices from './QuickAccessServices';
import DepartmentDirectory from './DepartmentDirectory';
import FloatingChat from './FloatingChat';
import Loader from './Loader';
import { Mic, MapPin, Sparkles, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
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
    <div className="min-h-screen">
      {/* Full Screen Loader */}
      {isLoading && <Loader text={loadingText} />}

      {/* Section 1: Landing Page / Hero */}
      <section id="home" className="relative min-h-screen flex flex-col overflow-hidden bg-slate-100">
        {/* Hero Section with Background Image */}
        <div className="relative flex-1 flex items-center justify-center">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/hospital-background.jpeg)',
            }}
          >
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-slate-900/80"></div>
          </div>

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center px-4 py-12 max-w-5xl mx-auto"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl leading-tight px-2"
              style={{ fontFamily: 'LemonJelly, cursive' }}
            >
              Zamboanga Medical Center
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="space-y-3 mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-white drop-shadow-lg" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 900 }}>
                Navigation System
              </h2>
              <p className="text-base sm:text-xl md:text-2xl text-white/90 flex items-center justify-center gap-2 px-4" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 400 }}>
                <HeartPulse className="text-red-400 shrink-0" size={24} />
                <span>Because we care - Find your way with ease</span>
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
            >
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="group relative flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl cursor-pointer"
                style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 700 }}
              >
                <div className="relative flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Mic size={22} className="group-hover:animate-pulse sm:w-6 sm:h-6" />
                  Start Voice Navigation
                </div>
              </button>
              
              <button
                onClick={() => navigateWithLoader('/navigation', 'Opening map...')}
                className="group relative flex-1 bg-white/10 backdrop-blur-sm text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl border-2 border-white/40 hover:border-white/60 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 600 }}
              >
                <div className="relative flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <MapPin size={22} className="group-hover:animate-bounce sm:w-6 sm:h-6" />
                  View Hospital Map
                </div>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
      />

      {/* Description Section */}
      <section id="about" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className="inline-block bg-green-100 text-green-700 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4">
              Welcome to ZMC
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Smart Hospital Navigation
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience seamless navigation within Zamboanga Medical Center. Our AI-powered system helps you find your way to any department, doctor, or facility with real-time GPS tracking and voice assistance.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-green-100"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                <MapPin size={24} className="text-white sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">GPS Navigation</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Turn-by-turn directions powered by real-time GPS tracking. Navigate through corridors and find the shortest path to your destination.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-blue-100"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                <Mic size={24} className="text-white sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Voice Assistant</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Just speak your destination or ask questions about the hospital. Our AI understands natural language and guides you instantly.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-purple-100 sm:col-span-2 md:col-span-1"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                <Sparkles size={24} className="text-white sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Features</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                View department info, doctor profiles, and contact details. Access emergency services and find amenities like cafeteria and parking.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Quick Access Services */}
      <section id="quick-access" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuickAccessServices onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />
        </div>
      </section>

      {/* Section 3: Department Directory */}
      <section id="departments" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DepartmentDirectory />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Zamboanga Medical Center</h3>
            <p className="text-gray-400 mb-3">
              © 2025 Zamboanga Medical Center. All rights reserved.
            </p>
            <p className="text-gray-500 flex items-center justify-center gap-2 text-sm">
              <Sparkles size={14} className="text-yellow-400" />
              Powered by AI Voice Recognition & Interactive Mapping
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Chat - Always visible */}
      <FloatingChat />
    </div>
  );
}

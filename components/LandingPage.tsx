'use client';

import React from 'react';
import VoiceAssistant from './VoiceAssistant';
import QuickAccessServices from './QuickAccessServices';
import InteractiveMap from './InteractiveMap';
import DepartmentDirectory from './DepartmentDirectory';
import FloatingChat from './FloatingChat';
import { Mic, MapPin, Sparkles, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* Section 1: Landing Page / Hero */}
      <section id="home" className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Hero Section with Background Image */}
        <div className="relative flex-1 flex items-center justify-center">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/hospital-background.jpeg)',
            }}
          >
            {/* Gradient overlay - Health colors: Blue and Red */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-blue-800/65 to-red-900/70"></div>
          </div>

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-4 py-12 max-w-5xl mx-auto"
          >


            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl leading-tight"
              style={{ fontFamily: 'LemonJelly, cursive' }}
            >
              Zamboanga<br/>Medical Center
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="space-y-3 mb-12"
            >
              <h2 className="text-3xl md:text-4xl text-white drop-shadow-lg" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 900 }}>
                Advanced Healthcare Navigation System
              </h2>
              <p className="text-xl md:text-2xl text-white/90 flex items-center justify-center gap-2" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 400 }}>
                <HeartPulse className="text-red-400" size={28} />
                Because we care - Find your way with ease
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
            >
              <button
                onClick={() => scrollToSection('voice-assistant')}
                className="group relative flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl glow"
                style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 700 }}
              >
                <div className="relative flex items-center justify-center gap-3 text-lg">
                  <Mic size={26} className="group-hover:animate-pulse" />
                  Start Voice Navigation
                </div>
              </button>
              
              <button
                onClick={() => scrollToSection('interactive-map')}
                className="group relative flex-1 glass text-white font-bold py-5 px-8 rounded-2xl border-2 border-white/40 hover:border-white/60 hover:scale-105 transition-all duration-300"
                style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 600 }}
              >
                <div className="relative flex items-center justify-center gap-3 text-lg">
                  <MapPin size={26} className="group-hover:animate-bounce" />
                  View Hospital Map
                </div>
              </button>
            </motion.div>
          </motion.div>

        
        </div>
      </section>

      {/* Section 2: Voice Assistant */}
      <section id="voice-assistant" className="min-h-screen py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VoiceAssistant />
        </div>
      </section>

      {/* Section 3: Quick Access Services */}
      <section id="quick-access" className="min-h-screen py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuickAccessServices />
        </div>
      </section>

      {/* Section 4: Interactive Hospital Map */}
      <section id="interactive-map" className="min-h-screen py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-slate-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InteractiveMap />
        </div>
      </section>

      {/* Section 5: Department Directory */}
      <section id="departments" className="min-h-screen py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DepartmentDirectory />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-red-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-white mb-4">Zamboanga Medical Center</h3>
              <p className="text-gray-300 mb-4 text-lg">
                © 2025 Zamboanga Medical Center. All rights reserved.
              </p>
              <p className="text-gray-400 flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                Powered by AI Voice Recognition & Interactive Mapping
              </p>
            </motion.div>
          </div>
        </div>
      </footer>

      {/* Floating Chat - Always visible */}
      <FloatingChat />
    </div>
  );
}

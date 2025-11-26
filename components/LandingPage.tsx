'use client';

import React, { useEffect, useState } from 'react';
import VoiceAssistantModal from './VoiceAssistantModal';
import QuickAccessServices from './QuickAccessServices';
import DepartmentDirectory from './DepartmentDirectory';
import FloatingChat from './FloatingChat';
import { Mic, MapPin, Sparkles, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Pinning scroll effect for hero section
    const heroSection = document.getElementById('home');
    if (heroSection) {
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: '+=500',
        pin: true,
        pinSpacing: false,
        scrub: 1,
      });
    }

    // Smooth fade-in animations for each section
    const sections = gsap.utils.toArray<HTMLElement>('section');
    
    sections.forEach((section, index) => {
      if (index > 0) { // Skip hero section
        gsap.fromTo(section, 
          { 
            opacity: 0,
            y: 50 
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 1,
            }
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Section 1: Landing Page / Hero */}
      <section id="home" data-bg-color="#f1f5f9" className="relative min-h-screen flex flex-col overflow-hidden transition-all duration-1000 bg-slate-100 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.08)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,rgba(147,197,253,0.06)_0%,transparent_50%)]">
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
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-4 py-12 max-w-5xl mx-auto"
          >


            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="lg:text-8xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl leading-tight"
              style={{ fontFamily: 'LemonJelly, cursive' }}
            >
              Zamboanga Medical Center
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="space-y-3 mb-12"
            >
              <h2 className="text-3xl md:text-4xl text-white drop-shadow-lg" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 900 }}>
                Navigation System
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
                onClick={() => setIsVoiceModalOpen(true)}
                className="group relative flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-8 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl backdrop-blur-xl cursor-pointer"
                style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 700 }}
              >
                <div className="relative flex items-center justify-center gap-3 text-lg">
                  <Mic size={26} className="group-hover:animate-pulse" />
                  Start Voice Navigation
                </div>
              </button>
              
              <button
                onClick={() => scrollToSection('interactive-map')}
                className="group relative flex-1 glass text-white font-bold py-5 px-8 rounded-2xl border-2 border-white/40 hover:border-white/60 hover:scale-105 transition-all duration-300 cursor-pointer"
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

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
      />

      {/* Section 2: Quick Access Services */}
      <section id="quick-access" className="min-h-screen py-20 relative overflow-hidden bg-linear-to-b from-white to-blue-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuickAccessServices onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />
        </div>
      </section>

      {/* Section 3: Department Directory */}
      <section id="departments" className="min-h-screen py-20 relative overflow-hidden bg-linear-to-b from-blue-50 to-white">
        <div className="absolute inset-0" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(59, 130, 246, 0.02) 35px, rgba(59, 130, 246, 0.02) 70px)'}}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DepartmentDirectory />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 overflow-hidden transition-all duration-1000 bg-slate-900">
        <div className="absolute inset-0"></div>
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

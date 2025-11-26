'use client';

import React, { useEffect, useRef } from 'react';
import { Navigation, Phone, Calendar, Car, MessageCircle, Accessibility, Pill, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Service {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  priority: 'emergency' | 'primary' | 'standard';
}

interface QuickAccessServicesProps {
  onOpenVoiceModal?: () => void;
}

export default function QuickAccessServices({ onOpenVoiceModal }: QuickAccessServicesProps) {
  const router = useRouter();
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.service-card');
      
      gsap.fromTo(cards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          }
        }
      );
    }
  }, []);

  const services: Service[] = [
    {
      id: 'voice-assistant',
      icon: <Mic size={28} />,
      title: 'Voice Assistant',
      description: 'Ask me anything about the hospital',
      action: () => onOpenVoiceModal?.(),
      priority: 'primary',
    },
    {
      id: 'gps-navigation',
      icon: <Navigation size={28} />,
      title: 'Live GPS Navigation',
      description: 'Real-time indoor navigation to any department',
      action: () => router.push('/navigation'),
      priority: 'primary',
    },
    {
      id: 'emergency',
      icon: <Phone size={28} />,
      title: 'Emergency Hotline',
      description: 'Immediate assistance for urgent medical needs',
      action: () => router.push('/emergency'),
      priority: 'emergency',
    },
    {
      id: 'appointments',
      icon: <Calendar size={28} />,
      title: 'Book Appointment',
      description: 'Schedule consultations with our specialists',
      action: () => router.push('/appointments'),
      priority: 'primary',
    },
    {
      id: 'parking',
      icon: <Car size={28} />,
      title: 'Parking Info',
      description: 'Find available parking spaces and rates',
      action: () => router.push('/parking'),
      priority: 'standard',
    },
    {
      id: 'contact',
      icon: <MessageCircle size={28} />,
      title: 'Contact Us',
      description: 'Get in touch with hospital staff',
      action: () => router.push('/contact'),
      priority: 'standard',
    },
    {
      id: 'accessibility',
      icon: <Accessibility size={28} />,
      title: 'Accessibility',
      description: 'Special services for patients with disabilities',
      action: () => alert('Accessibility services information'),
      priority: 'standard',
    },
    {
      id: 'pharmacy',
      icon: <Pill size={28} />,
      title: 'Pharmacy Services',
      description: 'Prescription refills and medication information',
      action: () => alert('Pharmacy services information'),
      priority: 'primary',
    },
  ];

  const getServiceStyle = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:border-red-300';
      case 'primary':
        return 'bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300';
      default:
        return 'bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300';
    }
  };

  const getIconStyle = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-600 text-white';
      case 'primary':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl text-gray-900 mb-4 font-bold">
          Quick Access Services
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Fast access to essential hospital services and information
        </p>
      </div>

      {/* Service Cards Grid */}
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className={`service-card ${getServiceStyle(service.priority)} rounded-xl transition-all duration-300 cursor-pointer group overflow-hidden shadow-lg hover:shadow-2xl`}
            onClick={service.action}
          >
            <div className="p-6">
              {/* Icon */}
              <div className={`w-14 h-14 ${getIconStyle(service.priority)} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                {service.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Footer Accent */}
            <div className="h-1 bg-linear-to-r from-blue-500 via-blue-600 to-blue-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

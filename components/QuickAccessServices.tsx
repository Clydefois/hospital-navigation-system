'use client';

import React, { useState } from 'react';
import { Navigation, Phone, Car, MessageCircle, Accessibility, Pill, Mic, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loader from './Loader';

interface Service {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  color: string;
}

interface QuickAccessServicesProps {
  onOpenVoiceModal?: () => void;
}

export default function QuickAccessServices({ onOpenVoiceModal }: QuickAccessServicesProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  // Navigate with loader
  const navigateWithLoader = (path: string, text: string) => {
    setLoadingText(text);
    setIsLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 2000);
  };

  const services: Service[] = [
    {
      id: 'voice-assistant',
      icon: <Mic size={24} />,
      title: 'Voice Assistant',
      description: 'Ask me anything about the hospital',
      action: () => onOpenVoiceModal?.(),
      color: 'bg-blue-500',
    },
    {
      id: 'gps-navigation',
      icon: <Navigation size={24} />,
      title: 'GPS Navigation',
      description: 'Real-time indoor navigation',
      action: () => navigateWithLoader('/navigation', 'Opening navigation...'),
      color: 'bg-teal-500',
    },
    {
      id: 'emergency',
      icon: <Phone size={24} />,
      title: 'Emergency',
      description: 'Immediate medical assistance',
      action: () => navigateWithLoader('/emergency', 'Opening emergency...'),
      color: 'bg-red-500',
    },
    {
      id: 'parking',
      icon: <Car size={24} />,
      title: 'Parking',
      description: 'Find parking spaces',
      action: () => navigateWithLoader('/parking', 'Loading parking...'),
      color: 'bg-slate-500',
    },
    {
      id: 'contact',
      icon: <MessageCircle size={24} />,
      title: 'Contact Us',
      description: 'Get in touch with staff',
      action: () => navigateWithLoader('/contact', 'Opening contact...'),
      color: 'bg-emerald-500',
    },
    {
      id: 'accessibility',
      icon: <Accessibility size={24} />,
      title: 'Accessibility',
      description: 'Services for disabilities',
      action: () => alert('Accessibility services information'),
      color: 'bg-violet-500',
    },
    {
      id: 'pharmacy',
      icon: <Pill size={24} />,
      title: 'Pharmacy',
      description: 'Medication information',
      action: () => alert('Pharmacy services information'),
      color: 'bg-cyan-500',
    },
    {
      id: 'about',
      icon: <Info size={24} />,
      title: 'About',
      description: 'Learn about our hospital',
      action: () => alert('About Zamboanga Medical Center'),
      color: 'bg-gray-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Full Screen Loader */}
      {isLoading && <Loader text={loadingText} />}
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Quick Access
        </h2>
        <p className="text-gray-500">
          Fast access to essential hospital services
        </p>
      </div>

      {/* Service Cards Grid - Minimalist Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={service.action}
            className="group bg-white rounded-2xl p-5 cursor-pointer border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
          >
            {/* Icon */}
            <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-105 transition-transform duration-200`}>
              {service.icon}
            </div>

            {/* Content */}
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {service.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

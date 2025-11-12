'use client';

import React from 'react';
import {
  Ambulance,
  Calendar,
  Car,
  Phone,
  Accessibility,
  Pill,
  MapPin,
  Clock,
  Mail,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  contact?: string;
  hours?: string;
  email?: string;
  location?: string;
}

export default function QuickAccessServices() {
  const services: ServiceCard[] = [
    {
      id: 'emergency',
      title: 'Emergency Services',
      icon: <Ambulance size={40} />,
      description: 'Immediate medical attention for critical conditions. Available 24/7 with specialized trauma care.',
      contact: '911 or (555) 123-4567',
      hours: '24/7',
      location: 'Ground Floor, Section A',
    },
    {
      id: 'appointments',
      title: 'Appointments',
      icon: <Calendar size={40} />,
      description: 'Schedule or manage your medical appointments with our healthcare providers.',
      contact: '(555) 123-4568',
      hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
      email: 'appointments@hospital.com',
    },
    {
      id: 'parking',
      title: 'Parking Information',
      icon: <Car size={40} />,
      description: 'Multi-level parking facility with handicap accessible spaces and valet services.',
      contact: '(555) 123-4569',
      location: 'Building P - Connected via Sky Bridge',
      hours: '24/7 Access',
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <Phone size={40} />,
      description: 'General inquiries, patient information, and hospital directory services.',
      contact: '(555) 123-4567',
      email: 'info@hospital.com',
      hours: '24/7 Phone Support',
    },
    {
      id: 'accessibility',
      title: 'Accessibility Services',
      icon: <Accessibility size={40} />,
      description: 'Wheelchair access, sign language interpreters, and assistance for patients with special needs.',
      contact: '(555) 123-4570',
      location: 'Information Desk - Main Entrance',
      hours: 'Available 24/7',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      icon: <Pill size={40} />,
      description: 'Full-service pharmacy for prescription medications, over-the-counter drugs, and medical supplies.',
      contact: '(555) 123-4571',
      hours: 'Mon-Fri: 7AM-9PM, Sat-Sun: 9AM-6PM',
      location: 'Ground Floor, Section C',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
                <h2 className="text-3xl text-gray-900 mb-3" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 900 }}>
          Quick Access Services
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 400 }}>
          Access key hospital services instantly
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass-strong rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20"
          >
            {/* Card Header */}
            <div className="relative bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-red-600/90 text-white p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-red-400/20 animate-pulse" />
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 glass-strong rounded-full mx-auto mb-4 shadow-lg">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-center drop-shadow-lg">{service.title}</h3>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                {service.description}
              </p>

              {/* Contact Information */}
              <div className="space-y-3 border-t border-white/20 pt-4">
                {service.contact && (
                  <div className="flex items-start">
                    <Phone size={18} className="text-blue-600 mr-2 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone</p>
                      <a
                        href={`tel:${service.contact}`}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        {service.contact}
                      </a>
                    </div>
                  </div>
                )}

                {service.email && (
                  <div className="flex items-start">
                    <Mail size={18} className="text-blue-600 mr-2 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <a
                        href={`mailto:${service.email}`}
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {service.email}
                      </a>
                    </div>
                  </div>
                )}

                {service.hours && (
                  <div className="flex items-start">
                    <Clock size={18} className="text-blue-600 mr-2 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Hours</p>
                      <p className="text-sm text-gray-700">{service.hours}</p>
                    </div>
                  </div>
                )}

                {service.location && (
                  <div className="flex items-start">
                    <MapPin size={18} className="text-blue-600 mr-2 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Location</p>
                      <p className="text-sm text-gray-700">{service.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-red-600 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-red-700 transition-all font-medium text-sm shadow-lg glow-hover"
              >
                Get Directions
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-strong border-l-4 border-red-600 rounded-2xl p-6 mt-8 shadow-xl"
      >
        <div className="flex items-start">
          <Ambulance size={32} className="text-red-600 mr-4 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-2">
              Medical Emergency?
            </h3>
            <p className="text-red-800 mb-3">
              If you are experiencing a life-threatening emergency, call 911 immediately or proceed to the Emergency Room at Ground Floor, Section A.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-lg glow"
            >
              Navigate to Emergency Room
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Phone,
  MapPin,
  User,
  Activity,
  Stethoscope,
  Eye,
  Baby,
  Bone,
  Utensils,
  Car,
  Church,
  Sparkles,
  Beaker,
  Droplet,
  Paintbrush,
  Heart,
  Brain,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

interface Doctor {
  name: string;
  specialty: string;
}

interface Department {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  phone?: string;
  location: string;
  zone: string;
  doctors?: Doctor[];
  category: string;
}

export default function DepartmentDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.department-card');
      
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
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
  }, [searchTerm]);

  const departments: Department[] = [
    {
      id: 'emergency',
      name: 'Emergency Room (ER)',
      icon: <Activity size={28} />,
      description: 'Immediate care for urgent medical conditions. Our ER is staffed 24/7 with board-certified emergency physicians.',
      phone: '0917-555-1001',
      location: 'South Complex, GF',
      zone: 'Zone S2',
      category: 'Emergency',
      doctors: [
        { name: 'Dr. Samuel Reyes', specialty: 'Emergency Medicine' },
        { name: 'Dr. Nicole Santos', specialty: 'Trauma Specialist' },
        { name: 'Dr. Harold Villanueva', specialty: 'Acute Care Medicine' },
      ],
    },
    {
      id: 'doctors-clinic',
      name: "Doctors' Clinic",
      icon: <Stethoscope size={28} />,
      description: 'Primary care and general medical consultation services.',
      phone: '0917-555-1002',
      location: 'SE Wing, GF',
      zone: 'Zone E1',
      category: 'Medical',
      doctors: [
        { name: 'Dr. Liana Cruz', specialty: 'General Medicine' },
        { name: 'Dr. Ana Tolentino', specialty: 'Internal Medicine' },
        { name: 'Dr. Cedric Mallari', specialty: 'Family Medicine' },
      ],
    },
    {
      id: 'radiology',
      name: 'Radiology Department',
      icon: <Sparkles size={28} />,
      description: 'Advanced imaging services including X-ray, CT, MRI, and ultrasound.',
      phone: '0917-555-1003',
      location: 'SE Wing, GF',
      zone: 'Zone E2',
      category: 'Diagnostic',
      doctors: [
        { name: 'Dr. Adrian Monteverde', specialty: 'Radiologist' },
        { name: 'Dr. Faith Navarro', specialty: 'Ultrasound Specialist' },
        { name: 'Dr. Paolo de Guzman', specialty: 'Interventional Radiology' },
      ],
    },
    {
      id: 'orthopedic',
      name: 'Orthopedic Department',
      icon: <Bone size={28} />,
      description: 'Treatment of musculoskeletal system including bones, joints, and ligaments.',
      phone: '0917-555-1004',
      location: 'SE Wing, GF',
      zone: 'Zone E3',
      category: 'Medical',
      doctors: [
        { name: 'Dr. Victor Alano', specialty: 'Orthopedic Surgeon' },
        { name: 'Dr. Melissa Torres', specialty: 'Sports Medicine' },
        { name: 'Dr. Ramon Ibanez', specialty: 'Spine Specialist' },
      ],
    },
    {
      id: 'cafeteria',
      name: 'Cafeteria',
      icon: <Utensils size={28} />,
      description: 'Hospital dining services offering nutritious meals and refreshments.',
      location: 'East Concourse, GF',
      zone: 'Zone C1',
      category: 'Amenity',
    },
    {
      id: 'comfort-room',
      name: 'Comfort Room',
      icon: <Droplet size={28} />,
      description: 'Public restroom facilities available throughout the hospital.',
      location: 'East Concourse, GF',
      zone: 'Zone C2',
      category: 'Amenity',
    },
    {
      id: 'cardio-pulmonary',
      name: 'Cardio-Pulmonary Department',
      icon: <Heart size={28} />,
      description: 'Comprehensive heart and lung care including diagnosis and treatment.',
      phone: '0917-555-1007',
      location: 'NE Wing, GF',
      zone: 'Zone N3',
      category: 'Medical',
      doctors: [
        { name: 'Dr. Felicity Ong', specialty: 'Cardiologist' },
        { name: 'Dr. Jerome Lao', specialty: 'Pulmonologist' },
        { name: 'Dr. Althea Zamora', specialty: 'Respiratory Specialist' },
      ],
    },
    {
      id: 'diagnostic-lab',
      name: 'Diagnostic / Laboratory',
      icon: <Beaker size={28} />,
      description: 'Complete laboratory testing and pathology services.',
      phone: '0917-555-1008',
      location: 'North Complex, GF',
      zone: 'Zone N1',
      category: 'Diagnostic',
      doctors: [
        { name: 'Dr. Marianne Lim', specialty: 'Pathologist' },
        { name: 'Dr. Glenn Paredes', specialty: 'Clinical Chemist' },
        { name: 'Dr. Shaira del Mundo', specialty: 'Microbiologist' },
      ],
    },
    {
      id: 'neurology',
      name: 'Neurology Department',
      icon: <Brain size={28} />,
      description: 'Expert care for disorders of the brain, spinal cord, and nervous system.',
      phone: '0917-555-1009',
      location: 'Central Pavilion, GF',
      zone: 'Zone CP2',
      category: 'Medical',
      doctors: [
        { name: 'Dr. Ricardo Soriano', specialty: 'Neurologist' },
        { name: 'Dr. Bianca Yuson', specialty: 'Neurophysiologist' },
        { name: 'Dr. Marco Tan', specialty: 'Stroke Specialist' },
      ],
    },
    {
      id: 'pediatrics',
      name: 'Pediatric Department',
      icon: <Baby size={28} />,
      description: 'Specialized medical care for infants, children, and adolescents.',
      phone: '0917-555-1010',
      location: 'Central Pavilion, GF',
      zone: 'Zone CP3',
      category: 'Medical',
      doctors: [
        { name: 'Dr. Hannah Bautista', specialty: 'Pediatrician' },
        { name: 'Dr. Joshua Lim', specialty: 'Pediatric Infectious Diseases' },
        { name: 'Dr. Rhea Manalili', specialty: 'Developmental Pediatrics' },
      ],
    },
    {
      id: 'surgery',
      name: 'Surgery Department',
      icon: <Activity size={28} />,
      description: 'Advanced surgical services with state-of-the-art operating facilities.',
      phone: '0917-555-1011',
      location: 'SW Wing, GF',
      zone: 'Zone W2',
      category: 'Medical',
      doctors: [
        { name: 'Dr. Miguel Herrera', specialty: 'General Surgeon' },
        { name: 'Dr. Carlos Buenaventura', specialty: 'General Surgeon' },
        { name: 'Dr. Joanne Mercado', specialty: 'Trauma Surgeon' },
      ],
    },
    {
      id: 'nephrology',
      name: 'Nephrology Department',
      icon: <Droplet size={28} />,
      description: 'Kidney care and dialysis services for renal disorders.',
      phone: '0917-555-1012',
      location: 'NW Wing, GF',
      zone: 'Zone N5',
      category: 'Medical',
      doctors: [
        { name: 'Dr. Teresa Valerio', specialty: 'Nephrologist' },
        { name: 'Dr. Joel Ong', specialty: 'Dialysis Specialist' },
        { name: 'Dr. Mica Alonzo', specialty: 'Renal Transplant Specialist' },
      ],
    },
    {
      id: 'dermatology',
      name: 'Dermatology Department',
      icon: <Paintbrush size={28} />,
      description: 'Complete skin care including medical and cosmetic dermatology.',
      phone: '0917-555-1013',
      location: 'NW Wing, GF',
      zone: 'Zone N6',
      category: 'Medical',
      doctors: [
        { name: 'Dr. Erika Dizon', specialty: 'Dermatologist' },
        { name: 'Dr. Camille Pascual', specialty: 'Dermatologist' },
        { name: 'Dr. Aldrin Cortez', specialty: 'Cosmetic Dermatology' },
      ],
    },
    {
      id: 'ophthalmology',
      name: 'Ophthalmology Department',
      icon: <Eye size={28} />,
      description: 'Complete eye care including vision testing and surgical procedures.',
      phone: '0917-555-1014',
      location: 'NW Wing, GF',
      zone: 'Zone N4',
      category: 'Medical',
      doctors: [
        { name: 'Dr. Jonathan Ponce', specialty: 'Ophthalmologist' },
        { name: 'Dr. Mariel Uy', specialty: 'Ophthalmologist' },
        { name: 'Dr. Kelvin Olivarez', specialty: 'Ophthalmologist' },
      ],
    },
    {
      id: 'church',
      name: 'Church',
      icon: <Church size={28} />,
      description: 'Quiet space for prayer and spiritual reflection.',
      location: 'South Complex, GF',
      zone: 'Zone S1',
      category: 'Amenity',
    },
    {
      id: 'parking',
      name: 'Parking Lot',
      icon: <Car size={28} />,
      description: 'Multi-level parking facility for patients and visitors.',
      location: 'Central Pavilion',
      zone: 'Outdoor',
      category: 'Amenity',
    },
  ];

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.doctors?.some(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Emergency': return 'border-red-600 bg-red-50';
      case 'Medical': return 'border-blue-600 bg-blue-50';
      case 'Diagnostic': return 'border-purple-600 bg-purple-50';
      case 'Amenity': return 'border-gray-600 bg-gray-50';
      default: return 'border-gray-600 bg-gray-50';
    }
  };

  const getCategoryIconColor = (category: string) => {
    switch (category) {
      case 'Emergency': return 'bg-red-600 text-white';
      case 'Medical': return 'bg-blue-600 text-white';
      case 'Diagnostic': return 'bg-purple-600 text-white';
      case 'Amenity': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl text-gray-900 mb-4 font-bold">
          Department Directory
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Find specialists, departments, and medical services
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search departments, doctors, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900 bg-white shadow-sm cursor-text"
          />
        </div>
      </div>

      {/* Department Grid Cards */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className={`department-card bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${getCategoryColor(dept.category)} cursor-pointer`}
            onClick={() => setSelectedDepartment(dept.id)}
          >
            {/* Department Header */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-lg ${getCategoryIconColor(dept.category)} flex items-center justify-center shrink-0 shadow-md`}>
                  {dept.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                    {dept.name}
                  </h3>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {dept.category}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {dept.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-2">
                {dept.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span className="text-gray-700 font-medium">{dept.phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {dept.location} <span className="text-gray-500">— {dept.zone}</span>
                  </span>
                </div>
                {dept.doctors && (
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-100">
                    <User size={14} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">{dept.doctors.length} Specialists</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <span className="text-xs text-blue-600 font-semibold hover:text-blue-700">
                View Details →
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            No departments found matching your search.
          </p>
        </div>
      )}

      {/* Department Details Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDepartment(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const dept = departments.find(d => d.id === selectedDepartment);
              if (!dept) return null;
              
              return (
                <>
                  {/* Modal Header */}
                  <div className={`${getCategoryIconColor(dept.category)} p-8 relative`}>
                    <button
                      onClick={() => setSelectedDepartment(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="text-2xl text-white">×</span>
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        {dept.icon}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold mb-1 text-white">{dept.name}</h3>
                        <p className="text-white/90">{dept.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8">
                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                      <h4 className="text-gray-900 mb-4 text-lg font-bold">Contact Information</h4>
                      <div className="space-y-3">
                        {dept.phone && (
                          <div className="flex items-center gap-3">
                            <Phone size={18} className="text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                              <a href={`tel:${dept.phone}`} className="text-blue-600 hover:underline font-medium cursor-pointer">
                                {dept.phone}
                              </a>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <MapPin size={18} className="text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Location</p>
                            <p className="text-gray-700 font-medium">{dept.location} — {dept.zone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Medical Staff */}
                    {dept.doctors && dept.doctors.length > 0 && (
                      <div>
                        <h4 className="text-gray-900 mb-4 text-lg flex items-center font-bold">
                          <User size={20} className="mr-2 text-blue-600" />
                          Medical Staff
                        </h4>
                        <div className="space-y-3">
                          {dept.doctors.map((doctor, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
                                  {doctor.name.split(' ')[1]?.[0] || 'D'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900">
                                    {doctor.name}
                                  </p>
                                  <p className="text-sm text-blue-600 font-medium">
                                    {doctor.specialty}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <Link href="/navigation">
                        <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md cursor-pointer">
                          Get Directions
                        </button>
                      </Link>
                      <button className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold cursor-pointer">
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

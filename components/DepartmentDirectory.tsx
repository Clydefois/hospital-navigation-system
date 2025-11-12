'use client';

import React, { useState } from 'react';
import {
  Search,
  Phone,
  MapPin,
  Clock,
  User,
  Heart,
  Activity,
  Brain,
  Stethoscope,
  Eye,
  Baby,
  Bone,
  Pill,
} from 'lucide-react';
import Image from 'next/image';

interface Doctor {
  name: string;
  title: string;
  specialization?: string;
}

interface Department {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  phone: string;
  location: string;
  hours: string;
  imageUrl: string;
  doctors: Doctor[];
}

export default function DepartmentDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const departments: Department[] = [
    {
      id: 'emergency',
      name: 'Emergency Medicine',
      icon: <Activity size={32} />,
      description: 'Immediate care for urgent medical conditions. Our ER is staffed 24/7 with board-certified emergency physicians.',
      phone: '(555) 123-4567',
      location: 'Ground Floor, Section A',
      hours: '24/7',
      imageUrl: '/placeholder-emergency.jpg',
      doctors: [
        { name: 'Dr. Sarah Johnson', title: 'MD, FACEP', specialization: 'Emergency Medicine' },
        { name: 'Dr. Michael Chen', title: 'MD', specialization: 'Trauma Surgery' },
        { name: 'Dr. Emily Rodriguez', title: 'DO', specialization: 'Emergency Medicine' },
      ],
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      icon: <Heart size={32} />,
      description: 'Comprehensive heart care including diagnosis, treatment, and prevention of cardiovascular diseases.',
      phone: '(555) 123-4580',
      location: '3rd Floor, East Wing',
      hours: 'Mon-Fri: 8AM-6PM',
      imageUrl: '/placeholder-cardiology.jpg',
      doctors: [
        { name: 'Dr. Robert Williams', title: 'MD, FACC', specialization: 'Interventional Cardiology' },
        { name: 'Dr. Lisa Anderson', title: 'MD', specialization: 'Heart Failure' },
        { name: 'Dr. James Park', title: 'MD, PhD', specialization: 'Electrophysiology' },
      ],
    },
    {
      id: 'neurology',
      name: 'Neurology',
      icon: <Brain size={32} />,
      description: 'Expert care for disorders of the brain, spinal cord, and nervous system.',
      phone: '(555) 123-4581',
      location: '4th Floor, West Wing',
      hours: 'Mon-Fri: 9AM-5PM',
      imageUrl: '/placeholder-neurology.jpg',
      doctors: [
        { name: 'Dr. Amanda Thompson', title: 'MD, FAAN', specialization: 'Neurology' },
        { name: 'Dr. David Martinez', title: 'MD, PhD', specialization: 'Neurosurgery' },
        { name: 'Dr. Jennifer Lee', title: 'DO', specialization: 'Movement Disorders' },
      ],
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      icon: <Baby size={32} />,
      description: 'Specialized medical care for infants, children, and adolescents.',
      phone: '(555) 123-4582',
      location: '2nd Floor, South Wing',
      hours: 'Mon-Sat: 8AM-8PM',
      imageUrl: '/placeholder-pediatrics.jpg',
      doctors: [
        { name: 'Dr. Maria Garcia', title: 'MD, FAAP', specialization: 'Pediatrics' },
        { name: 'Dr. Kevin Brown', title: 'MD', specialization: 'Pediatric Cardiology' },
        { name: 'Dr. Rachel Kim', title: 'DO', specialization: 'Neonatology' },
      ],
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      icon: <Bone size={32} />,
      description: 'Treatment of musculoskeletal system including bones, joints, ligaments, and tendons.',
      phone: '(555) 123-4583',
      location: '3rd Floor, West Wing',
      hours: 'Mon-Fri: 7AM-6PM',
      imageUrl: '/placeholder-orthopedics.jpg',
      doctors: [
        { name: 'Dr. Thomas Wilson', title: 'MD, FAAOS', specialization: 'Sports Medicine' },
        { name: 'Dr. Patricia Davis', title: 'MD', specialization: 'Joint Replacement' },
        { name: 'Dr. Christopher Taylor', title: 'DO', specialization: 'Spine Surgery' },
      ],
    },
    {
      id: 'ophthalmology',
      name: 'Ophthalmology',
      icon: <Eye size={32} />,
      description: 'Complete eye care including vision testing, eye disease treatment, and surgical procedures.',
      phone: '(555) 123-4584',
      location: '2nd Floor, East Wing',
      hours: 'Mon-Fri: 8AM-5PM',
      imageUrl: '/placeholder-ophthalmology.jpg',
      doctors: [
        { name: 'Dr. Susan Miller', title: 'MD, FACS', specialization: 'Retinal Surgery' },
        { name: 'Dr. Richard Moore', title: 'MD', specialization: 'Cataract Surgery' },
        { name: 'Dr. Angela White', title: 'OD', specialization: 'Optometry' },
      ],
    },
    {
      id: 'internal-medicine',
      name: 'Internal Medicine',
      icon: <Stethoscope size={32} />,
      description: 'Primary care and treatment of adult diseases with focus on prevention and wellness.',
      phone: '(555) 123-4585',
      location: '1st Floor, Central Wing',
      hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
      imageUrl: '/placeholder-internal.jpg',
      doctors: [
        { name: 'Dr. George Harris', title: 'MD, FACP', specialization: 'Internal Medicine' },
        { name: 'Dr. Nancy Clark', title: 'MD', specialization: 'Geriatrics' },
        { name: 'Dr. Paul Lewis', title: 'DO', specialization: 'Preventive Medicine' },
      ],
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy Services',
      icon: <Pill size={32} />,
      description: 'Full-service pharmacy with prescription medications, consultations, and medication management.',
      phone: '(555) 123-4571',
      location: 'Ground Floor, Section C',
      hours: 'Mon-Fri: 7AM-9PM, Sat-Sun: 9AM-6PM',
      imageUrl: '/placeholder-pharmacy.jpg',
      doctors: [
        { name: 'Dr. Linda Walker', title: 'PharmD', specialization: 'Clinical Pharmacy' },
        { name: 'Dr. Mark Robinson', title: 'RPh', specialization: 'Pharmaceutical Care' },
        { name: 'Dr. Sandra Young', title: 'PharmD', specialization: 'Medication Therapy' },
      ],
    },
  ];

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.doctors.some(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl text-gray-900 mb-4" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 900 }}>
          Department Directory
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 400 }}>
          Find specialists, departments, and medical services
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search departments or doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
          />
        </div>
      </div>

      {/* Department Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
          >
            {/* Department Header */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  {dept.icon}
                </div>
              </div>
              <h3 className="text-xl" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 800 }}>{dept.name}</h3>
            </div>

            {/* Department Body */}
            <div className="p-5 flex-1 flex flex-col">
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 400 }}>
                {dept.description}
              </p>

              {/* Compact Contact Info */}
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex items-center text-gray-700">
                  <Phone size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                  <a href={`tel:${dept.phone}`} className="text-blue-600 hover:underline truncate">
                    {dept.phone}
                  </a>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                  <span className="truncate">{dept.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                  <span className="truncate">{dept.hours}</span>
                </div>
              </div>

              {/* Doctors Count */}
              <div className="flex items-center justify-between mb-4 pb-4 border-t pt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User size={16} className="mr-2 text-blue-600" />
                  <span className="font-medium">{dept.doctors.length} Doctors</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => setSelectedDepartment(dept.id)}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Search size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            No departments found matching your search.
          </p>
        </div>
      )}

      {/* Department Details Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDepartment(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const dept = departments.find(d => d.id === selectedDepartment);
              if (!dept) return null;
              
              return (
                <>
                  {/* Modal Header */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 relative">
                    <button
                      onClick={() => setSelectedDepartment(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        {dept.icon}
                      </div>
                      <div>
                        <h3 className="text-3xl mb-2" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 900 }}>{dept.name}</h3>
                        <p className="text-blue-100" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 400 }}>{dept.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8">
                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h4 className="text-gray-900 mb-4 text-lg" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 700 }}>Contact Information</h4>
                      <div className="space-y-3" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                        <div className="flex items-center">
                          <Phone size={18} className="text-blue-600 mr-3" />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <a href={`tel:${dept.phone}`} className="text-blue-600 hover:underline font-medium">
                              {dept.phone}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={18} className="text-blue-600 mr-3" />
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-gray-700 font-medium">{dept.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock size={18} className="text-blue-600 mr-3" />
                          <div>
                            <p className="text-xs text-gray-500">Hours</p>
                            <p className="text-gray-700 font-medium">{dept.hours}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Medical Staff */}
                    <div>
                      <h4 className="text-gray-900 mb-4 text-lg flex items-center" style={{ fontFamily: 'Stack Sans, sans-serif', fontWeight: 700 }}>
                        <User size={20} className="mr-2 text-blue-600" />
                        Medical Staff
                      </h4>
                      <div className="space-y-3" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                        {dept.doctors.map((doctor, index) => (
                          <div
                            key={index}
                            className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                {doctor.name.split(' ')[1]?.[0] || 'D'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">
                                  {doctor.name}
                                </p>
                                <p className="text-sm text-gray-600">{doctor.title}</p>
                                {doctor.specialization && (
                                  <p className="text-sm text-blue-600 mt-1">
                                    {doctor.specialization}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Get Directions
                      </button>
                      <button className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium">
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

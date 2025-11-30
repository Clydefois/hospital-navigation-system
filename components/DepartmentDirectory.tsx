'use client';

import React, { useState } from 'react';
import { Search, Phone, MapPin, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Loader from './Loader';

interface Doctor {
  name: string;
  specialty: string;
}

interface Department {
  id: string;
  name: string;
  image: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const departments: Department[] = [
    {
      id: 'emergency',
      name: 'Emergency Room',
      image: '/departments/emergency.jpg',
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
      image: '/departments/doctors.jpg',
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
      name: 'Radiology',
      image: '/departments/radiology.jpg',
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
      name: 'Orthopedic',
      image: '/departments/orthopedic.jpg',
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
      image: '/departments/cafeteria.jpg',
      description: 'Hospital dining services offering nutritious meals and refreshments.',
      location: 'East Concourse, GF',
      zone: 'Zone C1',
      category: 'Amenity',
    },
    {
      id: 'comfort-room',
      name: 'Comfort Room',
      image: '/departments/restroom.jpg',
      description: 'Public restroom facilities available throughout the hospital.',
      location: 'East Concourse, GF',
      zone: 'Zone C2',
      category: 'Amenity',
    },
    {
      id: 'cardio-pulmonary',
      name: 'Cardio-Pulmonary',
      image: '/departments/cardio.jpg',
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
      name: 'Laboratory',
      image: '/departments/laboratory.jpg',
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
      name: 'Neurology',
      image: '/departments/neurology.jpg',
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
      name: 'Pediatrics',
      image: '/departments/pediatrics.jpg',
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
      name: 'Surgery',
      image: '/departments/surgery.jpg',
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
      name: 'Nephrology',
      image: '/departments/nephrology.jpg',
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
      name: 'Dermatology',
      image: '/departments/dermatology.jpg',
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
      name: 'Ophthalmology',
      image: '/departments/ophthalmology.jpg',
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
      name: 'Chapel',
      image: '/departments/church.jpg',
      description: 'Quiet space for prayer and spiritual reflection.',
      location: 'South Complex, GF',
      zone: 'Zone S1',
      category: 'Amenity',
    },
    {
      id: 'parking',
      name: 'Parking Area',
      image: '/departments/parking.jpg',
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

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Emergency': return 'bg-red-500';
      case 'Medical': return 'bg-green-500';
      case 'Diagnostic': return 'bg-purple-500';
      case 'Amenity': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleLocate = (deptId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(`/navigation?locate=${deptId}`);
    }, 2000);
  };

  return (
    <>
      {isLoading && <Loader text="Loading Navigation..." />}
      
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
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-gray-900 bg-white shadow-sm cursor-text transition-colors"
            />
          </div>
        </div>

        {/* Department Grid Cards with Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDepartments.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={() => setSelectedDepartment(dept.id)}
            >
              {/* Department Image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={dept.image}
                  alt={dept.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className={`absolute top-3 left-3 ${getCategoryBadgeColor(dept.category)} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                  {dept.category}
                </span>
              </div>

              {/* Department Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {dept.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="text-green-500" />
                  <span>{dept.zone}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              No departments found matching your search.
            </p>
          </div>
        )}

        {/* Department Details Modal */}
        <AnimatePresence>
          {selectedDepartment && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedDepartment(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const dept = departments.find(d => d.id === selectedDepartment);
                  if (!dept) return null;
                  
                  return (
                    <>
                      {/* Modal Header with Image */}
                      <div className="relative h-56">
                        <Image
                          src={dept.image}
                          alt={dept.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        
                        <button
                          onClick={() => setSelectedDepartment(null)}
                          className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <X size={20} className="text-white" />
                        </button>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className={`${getCategoryBadgeColor(dept.category)} text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block`}>
                            {dept.category}
                          </span>
                          <h3 className="text-3xl font-bold text-white">{dept.name}</h3>
                        </div>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6">
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {dept.description}
                        </p>
                        
                        {/* Contact Information */}
                        <div className="bg-gray-50 rounded-xl p-5 mb-6">
                          <h4 className="text-gray-900 mb-4 font-bold">Contact & Location</h4>
                          <div className="space-y-3">
                            {dept.phone && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Phone size={18} className="text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                                  <a href={`tel:${dept.phone}`} className="text-green-600 hover:underline font-semibold cursor-pointer">
                                    {dept.phone}
                                  </a>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <MapPin size={18} className="text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Location</p>
                                <p className="text-gray-900 font-semibold">{dept.location} — {dept.zone}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Medical Staff */}
                        {dept.doctors && dept.doctors.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-gray-900 mb-4 font-bold flex items-center gap-2">
                              <User size={18} className="text-green-600" />
                              Medical Staff
                            </h4>
                            <div className="space-y-3">
                              {dept.doctors.map((doctor, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                      {doctor.name.split(' ')[1]?.[0] || 'D'}
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900">
                                        {doctor.name}
                                      </p>
                                      <p className="text-sm text-green-600">
                                        {doctor.specialty}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <button 
                          onClick={() => handleLocate(dept.id)}
                          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-4 px-6 rounded-xl hover:bg-green-600 transition-colors font-semibold shadow-md cursor-pointer"
                        >
                          <MapPin size={20} />
                          Locate on Map
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

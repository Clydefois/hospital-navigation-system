'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Loader2, MessageSquare, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceCommand {
  command: string;
  timestamp: Date;
  response: string;
}

// TypeScript interfaces for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Speak response function using useCallback
  const speakResponse = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, [selectedVoice]);

  // Process voice command function using useCallback
  const processVoiceCommand = useCallback((command: string) => {
    setIsProcessing(true);
    const lowerCommand = command.toLowerCase();

    let response = '';

    // Floor plan navigation commands
    if (lowerCommand.includes('emergency') || lowerCommand.includes('er')) {
      response = 'Sure! The Emergency Room is located on the Ground Floor in Section A. When you enter through the main entrance, just turn left and you will see the emergency department signs. You can also call them at 555-123-4567 if you need immediate assistance.';
    } else if (lowerCommand.includes('cardiology') || lowerCommand.includes('heart')) {
      response = 'The Cardiology Department is on the third floor in the East Wing. You can take Elevator B to get there. Once you exit the elevator, follow the signs with the heart symbol. The department is open Monday through Friday from 8 AM to 6 PM.';
    } else if (lowerCommand.includes('pharmacy')) {
      response = 'Our Pharmacy is conveniently located on the Ground Floor in Section C, very close to the main entrance. You can pick up your prescriptions there. They are open Monday to Friday from 7 AM to 9 PM, and on weekends from 9 AM to 6 PM. Their phone number is 555-123-4571.';
    } else if (lowerCommand.includes('radiology') || lowerCommand.includes('x-ray') || lowerCommand.includes('mri')) {
      response = 'The Radiology Department is on the first floor in the West Wing. When you enter the hospital, follow the blue line on the floor and it will take you directly there. They handle all imaging services including X-rays, CT scans, and MRIs.';
    } else if (lowerCommand.includes('cafeteria') || lowerCommand.includes('food') || lowerCommand.includes('restaurant')) {
      response = 'Our Cafeteria is located on the second floor in the Central Area. The good news is it is open 24 hours a day, 7 days a week! We also have a coffee shop on the Ground Floor if you just need a quick drink or snack.';
    } else if (lowerCommand.includes('restroom') || lowerCommand.includes('bathroom') || lowerCommand.includes('toilet')) {
      response = 'Restrooms are available on every floor of the hospital. You will find them near the elevator banks and also in each department waiting area. Look for the restroom signs with the universal symbols.';
    } else if (lowerCommand.includes('parking')) {
      response = 'Our main parking facility is in Building P, which is connected to the hospital via a sky bridge on the second floor. If you prefer, we also offer valet parking service at the main entrance. The first hour of parking is free, and there are plenty of handicap accessible spaces available.';
    } else if (lowerCommand.includes('reception') || lowerCommand.includes('information') || lowerCommand.includes('front desk')) {
      response = 'The Reception and Information Desk is right at the main entrance on the Ground Floor. Our friendly staff are there to help you 24 hours a day. They can answer questions, give directions, and help you find what you need.';
    } else if (lowerCommand.includes('appointment') || lowerCommand.includes('schedule')) {
      response = 'To make an appointment, you can visit our Scheduling Office on the Ground Floor, or you can call us at 555-123-4568. We are available Monday through Friday from 8 AM to 6 PM, and on Saturdays from 9 AM to 2 PM. You can also book appointments through our online patient portal.';
    } else if (lowerCommand.includes('pediatrics') || lowerCommand.includes('children') || lowerCommand.includes('kids')) {
      response = 'Our Pediatrics Department is on the second floor in the South Wing. It has a child-friendly environment with colorful decorations and play areas to make children feel comfortable. You can reach them at 555-123-4582.';
    } else if (lowerCommand.includes('neurology') || lowerCommand.includes('brain') || lowerCommand.includes('neurologist')) {
      response = 'The Neurology Department is on the fourth floor in the West Wing. They specialize in disorders of the brain, spinal cord, and nervous system. The department is open Monday through Friday from 9 AM to 5 PM. Call 555-123-4581 for appointments.';
    } else if (lowerCommand.includes('orthopedics') || lowerCommand.includes('bone') || lowerCommand.includes('fracture')) {
      response = 'Orthopedics is located on the third floor in the West Wing. They handle all bone, joint, and musculoskeletal issues including sports injuries. The department operates Monday to Friday from 7 AM to 6 PM. Phone number is 555-123-4583.';
    } else if (lowerCommand.includes('ophthalmology') || lowerCommand.includes('eye') || lowerCommand.includes('vision')) {
      response = 'The Ophthalmology Department for eye care is on the second floor in the East Wing. They provide comprehensive eye exams, surgeries, and treatment for all vision problems. Open Monday through Friday, 8 AM to 5 PM. Contact them at 555-123-4584.';
    } else if (lowerCommand.includes('internal medicine') || lowerCommand.includes('general medicine')) {
      response = 'Internal Medicine is on the first floor in the Central Wing. They provide primary care and preventive medicine for adults. The clinic is open Monday through Friday from 8 AM to 6 PM, and Saturdays from 9 AM to 2 PM. Phone: 555-123-4585.';
    } else if (lowerCommand.includes('help') || lowerCommand.includes('lost') || lowerCommand.includes('confused')) {
      response = "No problem! I'm here to help you navigate the hospital. You can ask me about any department like Emergency, Cardiology, Pharmacy, or Pediatrics. You can also ask about facilities like parking, restrooms, or the cafeteria. Just say something like, where is the emergency room, or how do I get to cardiology, and I'll guide you there!";
    } else if (lowerCommand.includes('thank')) {
      response = "You're very welcome! If you need any more help finding your way around Zamboanga Medical Center, just ask me anytime. Have a great day and take care!";
    } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('hey')) {
      response = 'Hello! Welcome to Zamboanga Medical Center. How can I help you navigate the hospital today? You can ask me about departments, services, or any facility locations.';
    } else {
      response = `I heard you say "${command}". I can help you find departments like Emergency, Cardiology, Pharmacy, Radiology, Pediatrics, and many more. I can also direct you to the parking, cafeteria, restrooms, or help you schedule appointments. What would you like to know?`;
    }

    setTimeout(() => {
      const newCommand: VoiceCommand = {
        command,
        timestamp: new Date(),
        response,
      };
      setCommands((prev) => [newCommand, ...prev]);
      setTranscript('');
      setIsProcessing(false);
      speakResponse(response);
    }, 500);
  }, [speakResponse]);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = 
        window.SpeechRecognition || 
        window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);

          if (event.results[current].isFinal) {
            processVoiceCommand(transcriptText);
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } else {
        setBrowserSupported(false);
      }

      // Load available voices and set a female voice as default
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Try to find common female voices with natural accent
        const femaleVoice = voices.find(v => 
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('victoria') ||
          v.name.toLowerCase().includes('google us english female') ||
          v.name.toLowerCase().includes('microsoft zira') ||
          (v.name.toLowerCase().includes('female') && v.lang.startsWith('en'))
        );
        const englishVoice = voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('male'));
        const defaultVoice = femaleVoice || englishVoice || voices[0];
        setSelectedVoice(defaultVoice);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [processVoiceCommand]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  if (!browserSupported) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl shadow-2xl p-6 border border-white/20"
      >
        <div className="text-center py-12">
          <MicOff size={64} className="mx-auto text-gray-400 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Voice Recognition Not Supported
          </h3>
          <p className="text-gray-600">
            Your browser doesn&apos;t support the Web Speech API. Please use Chrome, Edge, or Safari for voice navigation.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Title - Outside the box */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-4xl text-gray-900 mb-3 font-bold">
          Voice Navigation Assistant
        </h2>
        <p className="text-xl text-gray-600">
          Ask me anything about the hospital floor plan and I&apos;ll guide you
        </p>
      </motion.div>

      {/* Voice Control Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-linear-to-br from-blue-50 to-indigo-50 relative rounded-2xl shadow-2xl p-8 overflow-hidden border-2 border-blue-200"
      >
        <div className="relative z-10 text-center">
          {/* Stop Speaking Button */}
          {isSpeaking && (
            <div className="mb-6 flex justify-center">
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={stopSpeaking}
                className="flex items-center gap-2 bg-red-600/80 backdrop-blur-sm hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg border border-red-500/50 font-semibold cursor-pointer"
              >
                <StopCircle size={18} />
                Stop Speaking
              </motion.button>
            </div>
          )}

          {/* Microphone Button */}
          <div className="flex flex-col items-center">
            <motion.button
              onClick={toggleListening}
              disabled={isProcessing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-32 h-32 rounded-full transition-all shadow-2xl border-4 ${
                isListening
                  ? 'bg-red-600 border-red-700 ring-4 ring-red-300'
                  : 'bg-blue-600 border-blue-700'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Pulse Rings for Listening State */}
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                  <span className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" style={{ animationDelay: '0.15s' }} />
                </>
              )}
              
              {isProcessing ? (
                <Loader2 className="w-16 h-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white animate-spin" />
              ) : isListening ? (
                <Mic className="w-16 h-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg" />
              ) : (
                <Mic className="w-16 h-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
              )}
            </motion.button>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-lg font-medium text-gray-900"
            >
              {isProcessing
                ? 'Processing...'
                : isListening
                ? '🎤 Listening... Speak now'
                : 'Tap to speak'}
            </motion.p>
          </div>

          {/* Live Transcript and Last Response - Below the button */}
          <div className="mt-8 space-y-4">
            {/* Live Transcript */}
            <AnimatePresence>
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-blue-100 rounded-xl p-4 border-2 border-blue-300 shadow-lg"
                >
                  <p className="text-sm text-blue-700 font-semibold mb-1">You said:</p>
                  <p className="text-lg font-medium text-gray-900">{transcript}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Last Response */}
            {commands.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 border-2 border-gray-300 shadow-lg"
              >
                <p className="text-sm text-gray-700 font-semibold mb-1 flex items-center">
                  <Volume2 className="inline mr-2" size={16} />
                  Reply:
                </p>
                <p className="text-base text-gray-900 leading-relaxed">{commands[0].response}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Example Commands */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200"
      >
        <h3 className="text-xl text-gray-900 mb-4 flex items-center font-bold">
          <MessageSquare className="mr-2 text-blue-600" size={24} />
          Example Voice Commands
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Where is the Emergency Room?',
            'Take me to Cardiology',
            'Where is the pharmacy?',
            'Find the nearest restroom',
            'Where can I park?',
            'Show me the cafeteria',
            'Where is Pediatrics?',
            'How do I make an appointment?',
            'Where is Neurology?',
            'I need help',
          ].map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="bg-blue-50 hover:bg-blue-100 rounded-xl p-3 text-sm text-gray-900 transition-all cursor-pointer border-2 border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg"
              onClick={() => {
                processVoiceCommand(example);
              }}
            >
              <span className="text-blue-600 mr-2">💬</span>
              &quot;{example}&quot;
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Command History */}
      {commands.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200"
        >
          <h3 className="text-xl text-gray-900 mb-4 font-bold">
            Navigation History
          </h3>
          <div className="space-y-4">
            {commands.map((cmd, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-600 shadow-md hover:shadow-lg transition-all hover:scale-[1.01]"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-gray-900 flex items-center">
                    <Mic className="inline mr-2 text-blue-600" size={16} />
                    {cmd.command}
                  </p>
                  <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                    {cmd.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 mt-2 border-2 border-gray-200">
                  <p className="text-sm text-gray-700 flex items-start">
                    <Volume2 className="inline mr-2 mt-0.5 shrink-0 text-blue-600" size={14} />
                    <span>{cmd.response}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

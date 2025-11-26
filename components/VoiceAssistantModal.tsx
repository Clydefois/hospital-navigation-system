'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Volume2, Mic, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceAssistantModal({ isOpen, onClose }: VoiceAssistantModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

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

  const processVoiceCommand = useCallback((command: string) => {
    setIsProcessing(true);
    const lowerCommand = command.toLowerCase();

    let response = '';

    if (lowerCommand.includes('emergency') || lowerCommand.includes('er')) {
      response = 'The Emergency Room is located on the Ground Floor in Section A. Turn left at the main entrance.';
    } else if (lowerCommand.includes('cardiology') || lowerCommand.includes('heart')) {
      response = 'The Cardiology Department is on the third floor in the East Wing. Take Elevator B.';
    } else if (lowerCommand.includes('pharmacy')) {
      response = 'Our Pharmacy is on the Ground Floor in Section C, near the main entrance.';
    } else if (lowerCommand.includes('radiology') || lowerCommand.includes('x-ray') || lowerCommand.includes('mri')) {
      response = 'The Radiology Department is on the first floor in the West Wing. Follow the blue line on the floor.';
    } else if (lowerCommand.includes('cafeteria') || lowerCommand.includes('food')) {
      response = 'Our Cafeteria is on the second floor in the Central Area. Open 24/7.';
    } else if (lowerCommand.includes('restroom') || lowerCommand.includes('bathroom')) {
      response = 'Restrooms are available on every floor near the elevator banks.';
    } else if (lowerCommand.includes('parking')) {
      response = 'Our main parking facility is in Building P, connected via sky bridge on the second floor.';
    } else if (lowerCommand.includes('pediatrics') || lowerCommand.includes('children')) {
      response = 'Our Pediatrics Department is on the second floor in the South Wing.';
    } else if (lowerCommand.includes('help') || lowerCommand.includes('lost')) {
      response = "I can help you navigate the hospital. Ask me about departments like Emergency, Cardiology, Pharmacy, or facilities like parking and restrooms.";
    } else {
      response = `I heard "${command}". I can help you find departments, services, or facilities. What would you like to know?`;
    }

    setTimeout(() => {
      setCurrentResponse(response);
      setTranscript('');
      setIsProcessing(false);
      speakResponse(response);
    }, 500);
  }, [speakResponse]);

  useEffect(() => {
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

        recognitionInstance.onerror = () => {
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        // Use a callback to avoid the setState warning
        setTimeout(() => setRecognition(recognitionInstance), 0);
      }

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
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

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setCurrentResponse('');
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  };

  const stopAssistant = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setTranscript('');
  };

  const handleClose = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');
    setTextInput('');
    setCurrentResponse('');
    onClose();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processVoiceCommand(textInput.trim());
      setTextInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center bg-[#0A0B1A]"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
        >
          <X size={24} />
        </button>

        {/* Main Content Container */}
        <div className="w-full h-full flex flex-col items-center justify-between py-12 px-6">
          
          {/* Top Section - Title */}
          <div className="text-center mt-8">
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-purple-400 to-blue-400 mb-4">
              Talk to your
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-blue-300">
              AI assistant now
            </h2>
          </div>

          {/* Middle Section - Waveform Animation */}
          <div className="flex-1 flex items-center justify-center w-full max-w-2xl gap-6">
            <motion.button
              onClick={toggleListening}
              className="relative cursor-pointer focus:outline-none"
            >
              {/* Waveform Container */}
              <div className="flex items-center gap-1 h-24">
                {/* Animated Wave Bars */}
                {[...Array(20)].map((_, i) => {
                  const baseHeight = 20 + (i % 5) * 10;
                  const delay = i * 0.05;
                  
                  return (
                    <motion.div
                      key={i}
                      className={`w-2 rounded-full ${
                        isListening || isSpeaking
                          ? i === 9 || i === 10
                            ? 'bg-blue-400'
                            : 'bg-blue-500/50'
                          : 'bg-blue-900/30'
                      }`}
                      initial={{ height: 20 }}
                      animate={
                        isListening || isSpeaking
                          ? {
                              height: [baseHeight, baseHeight * 1.5, baseHeight * 0.8, baseHeight],
                              opacity: [0.7, 1, 0.6, 0.7],
                            }
                          : { height: 20, opacity: 0.3 }
                      }
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay,
                        ease: 'easeInOut',
                      }}
                    />
                  );
                })}
              </div>

              {/* Center Glow Effect */}
              {(isListening || isSpeaking) && (
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.button>

            {/* Stop Button */}
            {(isListening || isSpeaking) && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={stopAssistant}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-full transition-all"
                title="Stop"
              >
                <div className="w-4 h-4 bg-red-500 rounded-sm" />
              </motion.button>
            )}
          </div>

          {/* Live Transcript or Response */}
          <AnimatePresence mode="wait">
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md px-6"
              >
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-sm text-blue-300 mb-1">You said:</p>
                  <p className="text-lg text-white font-medium">{transcript}</p>
                </div>
              </motion.div>
            )}

            {currentResponse && !transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md px-6"
              >
                <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-300 mb-2">Assistant:</p>
                      <p className="text-white/90 leading-relaxed">{currentResponse}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-[20%] left-1/2 -translate-x-1/2"
              >
                <div className="flex items-center gap-2 text-blue-300">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-3 border-blue-300 border-t-transparent rounded-full"
                  />
                  <span>Processing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Section - Text Input */}
          <div className="w-full max-w-2xl mb-8">
            <form onSubmit={handleTextSubmit} className="relative">
              {/* Plus Button */}
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <Plus size={20} />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Write your prompt here..."
                className="w-full py-4 pl-14 pr-14 bg-[#1A1B2E] text-white placeholder-gray-500 rounded-full border border-gray-700/50 focus:border-blue-500/50 focus:outline-none transition-colors"
              />

              {/* Send Button */}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!textInput.trim()}
              >
                <Mic size={20} />
              </button>
            </form>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

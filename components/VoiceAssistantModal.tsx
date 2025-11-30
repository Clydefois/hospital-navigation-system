'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mic, Plus, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HospitalNavigationAI, Location } from '@/lib/hospitalAI';

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

// Conversation context for smarter responses
interface ConversationMessage {
  role: 'user' | 'assistant';
  message: string;
  location?: Location | null;
  confidence?: number;
  isEmergency?: boolean;
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceAssistantModal({ isOpen, onClose }: VoiceAssistantModalProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  // Store conversation history for context-aware responses
  const [, setConversationHistory] = useState<ConversationMessage[]>([]);

  // Initialize the trained AI model
  const hospitalAI = useMemo(() => new HospitalNavigationAI(), []);

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

  // Navigate to map with location
  const navigateToLocation = useCallback((locationId: string) => {
    onClose();
    router.push(`/navigation?locate=${locationId}`);
  }, [router, onClose]);

  // Smart AI processor using trained model
  const processVoiceCommand = useCallback((command: string) => {
    setIsProcessing(true);
    
    // Add to conversation history
    setConversationHistory(prev => [...prev, { role: 'user', message: command }]);
    
    // Use the trained AI model to process the query
    const aiResponse = hospitalAI.processQuery(command);
    
    // Update confidence display
    setAiConfidence(aiResponse.confidence);

    // Add response to history
    setConversationHistory(prev => [...prev, { 
      role: 'assistant', 
      message: aiResponse.message, 
      location: aiResponse.location,
      confidence: aiResponse.confidence,
      isEmergency: aiResponse.isEmergency
    }]);

    setTimeout(() => {
      setCurrentResponse(aiResponse.message);
      setTranscript('');
      setIsProcessing(false);
      speakResponse(aiResponse.message);
      
      // Navigate after a short delay if the AI decides navigation is needed
      if (aiResponse.shouldNavigate && aiResponse.location) {
        setTimeout(() => {
          navigateToLocation(aiResponse.location!.id);
        }, aiResponse.isEmergency ? 1000 : 2000); // Faster for emergencies
      }
    }, 300);
  }, [speakResponse, navigateToLocation, hospitalAI]);

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
        className="fixed inset-0 z-100 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2847 25%, #0c1f3d 50%, #061224 75%, #020a14 100%)' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 active:scale-95"
        >
          <X size={22} className="md:w-6 md:h-6" />
        </button>

        {/* AI Badge */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 bg-linear-to-r from-blue-500/20 to-cyan-500/20 rounded-full">
          <Brain className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
          <span className="text-[10px] md:text-xs font-medium text-blue-300">Trained AI</span>
          <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-cyan-400" />
        </div>

        {/* Main Content Container */}
        <div className="w-full h-full flex flex-col items-center justify-between py-8 md:py-12 px-4 md:px-6">
          
          {/* Top Section - Title */}
          <div className="text-center mt-10 md:mt-8">
            <div className="flex items-center justify-center gap-2 mb-2 md:mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Brain className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </motion.div>
              <h1 className="text-2xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400">
                Smart Hospital AI
              </h1>
            </div>
            <p className="text-sm md:text-lg text-blue-300/80 px-4">
              Trained on hospital layout & pathways
            </p>
          </div>

          {/* Middle Section - Voice Control */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl gap-4 md:gap-6">

            {/* Waveform Button - Large Touch Target for Mobile */}
            <motion.button
              onClick={toggleListening}
              whileTap={{ scale: 0.95 }}
              className={`relative cursor-pointer focus:outline-none p-6 md:p-8 rounded-3xl transition-all duration-300 ${
                isListening 
                  ? 'bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                  : isSpeaking
                    ? 'bg-blue-500/10'
                    : 'bg-white/5 hover:bg-blue-500/5'
              }`}
            >
              {/* Waveform Container */}
              <div className="flex items-center justify-center gap-1 md:gap-1.5 h-20 md:h-28 px-4">
                {/* Animated Wave Bars */}
                {[...Array(15)].map((_, i) => {
                  const centerIndex = 7;
                  const distanceFromCenter = Math.abs(i - centerIndex);
                  const baseHeight = 24 + (7 - distanceFromCenter) * 8;
                  const delay = i * 0.05;
                  
                  return (
                    <motion.div
                      key={i}
                      className={`w-2 md:w-3 rounded-full ${
                        isListening
                          ? 'bg-cyan-400'
                          : isSpeaking
                            ? 'bg-blue-400'
                            : 'bg-blue-500/40'
                      }`}
                      initial={{ height: 16 }}
                      animate={
                        isListening
                          ? {
                              height: [baseHeight * 0.5, baseHeight * 1.2, baseHeight * 0.6, baseHeight],
                              opacity: [0.8, 1, 0.7, 0.9],
                            }
                          : isSpeaking
                            ? {
                                height: [baseHeight * 0.6, baseHeight, baseHeight * 0.7, baseHeight * 0.9],
                                opacity: [0.7, 1, 0.6, 0.8],
                              }
                            : { height: 16 + distanceFromCenter * 2, opacity: 0.4 }
                      }
                      transition={{
                        duration: isListening ? 0.5 : 0.8,
                        repeat: Infinity,
                        delay,
                        ease: 'easeInOut',
                      }}
                    />
                  );
                })}
              </div>

              {/* Pulsing Ring for Listening State */}
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0.2, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)' }}
                />
              )}

              {/* Center Glow Effect */}
              {(isListening || isSpeaking) && (
                <motion.div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-48 md:h-48 rounded-full blur-3xl pointer-events-none ${
                    isListening ? 'bg-cyan-500/20' : 'bg-blue-500/20'
                  }`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.button>

            {/* Stop Button - Only when listening or speaking */}
            <AnimatePresence>
              {(isListening || isSpeaking) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  onClick={stopAssistant}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-full transition-all active:scale-95"
                >
                  <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                  <span className="text-blue-400 font-medium text-sm md:text-base">
                    {isListening ? 'Stop Listening' : 'Stop Speaking'}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Live Transcript or Response */}
          <AnimatePresence mode="wait">
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-[15%] md:top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md px-4 md:px-6"
              >
                <div className="p-3 md:p-4 bg-blue-500/5 backdrop-blur-md rounded-2xl">
                  <p className="text-xs md:text-sm text-blue-300 mb-1">You said:</p>
                  <p className="text-base md:text-lg text-white font-medium">{transcript}</p>
                </div>
              </motion.div>
            )}

            {currentResponse && !transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-[15%] md:top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg px-4 md:px-6"
              >
                <div className="p-4 md:p-5 bg-linear-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-2xl">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-blue-500/20 rounded-lg shrink-0">
                      <Brain className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 md:mb-2 flex-wrap">
                        <p className="text-xs md:text-sm font-semibold text-blue-300">AI Response</p>
                        {aiConfidence > 0 && (
                          <span className="text-[10px] md:text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                            {Math.round(aiConfidence * 100)}% confident
                          </span>
                        )}
                      </div>
                      <p className="text-sm md:text-base text-white/90 leading-relaxed">{currentResponse}</p>
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
                className="absolute top-[15%] md:top-[20%] left-1/2 -translate-x-1/2 px-4"
              >
                <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-blue-500/10 rounded-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Brain className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  </motion.div>
                  <span className="text-sm md:text-base text-blue-300">AI is thinking...</span>
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Section - Text Input */}
          <div className="w-full max-w-2xl mb-4 md:mb-8 px-2">
            <form onSubmit={handleTextSubmit} className="relative">
              {/* Plus Button */}
              <button
                type="button"
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 p-1.5 md:p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <Plus size={18} className="md:w-5 md:h-5" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full py-3 md:py-4 pl-12 md:pl-14 pr-12 md:pr-14 bg-[#0d1a2d] text-white text-sm md:text-base placeholder-gray-500 rounded-full border-0 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-colors"
              />

              {/* Send Button */}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 md:p-3 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                disabled={!textInput.trim()}
              >
                <Mic size={18} className="md:w-5 md:h-5" />
              </button>
            </form>
            
            {/* Quick suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mt-3 md:mt-4">
              <span className="text-[10px] md:text-xs text-gray-500">Try:</span>
              {['Chest pain', 'Where is ER?', 'Departments'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setTextInput(suggestion);
                    processVoiceCommand(suggestion);
                  }}
                  className="text-[10px] md:text-xs px-2.5 md:px-3 py-1 md:py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white rounded-full transition-all active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

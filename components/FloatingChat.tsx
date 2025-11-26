'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MapPin } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your hospital navigation assistant. How can I help you find your way today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    'Emergency Room location',
    'Cardiology Department',
    'Pharmacy',
    'Parking Information',
    'Appointment Scheduling',
    'Cafeteria',
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Generate unique ID using counter
    messageIdCounter.current += 1;

    // Add user message
    const userMessage: Message = {
      id: `user-${messageIdCounter.current}`,
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      messageIdCounter.current += 1;
      const botResponse = getBotResponse(text);
      const botMessage: Message = {
        id: `bot-${messageIdCounter.current}`,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes('emergency') || lowerText.includes('er')) {
      return '🚨 Emergency Room is located on the Ground Floor, Section A. Turn left from the main entrance. For immediate assistance, call 911 or (555) 123-4567.';
    } else if (lowerText.includes('cardiology') || lowerText.includes('heart')) {
      return '❤️ Cardiology Department is on the 3rd Floor, East Wing. Take Elevator B. You can also call (555) 123-4580 for appointments.';
    } else if (lowerText.includes('pharmacy')) {
      return '💊 Pharmacy is on the Ground Floor, Section C, near the main entrance. Hours: Mon-Fri 7AM-9PM, Sat-Sun 9AM-6PM. Phone: (555) 123-4571';
    } else if (lowerText.includes('parking')) {
      return '🚗 Main parking is in Building P, connected via sky bridge on Floor 2. Valet service available at main entrance. First hour free!';
    } else if (lowerText.includes('appointment')) {
      return '📅 For appointments, visit the Scheduling Office on Ground Floor or call (555) 123-4568. You can also book online through our patient portal.';
    } else if (lowerText.includes('cafeteria') || lowerText.includes('food')) {
      return '🍽️ Cafeteria is on the 2nd Floor, Central Area. Open 24/7. We also have a coffee shop on Ground Floor.';
    } else if (lowerText.includes('restroom') || lowerText.includes('bathroom')) {
      return '🚻 Restrooms are available on every floor near the elevators and in each department waiting area.';
    } else if (lowerText.includes('radiology') || lowerText.includes('x-ray') || lowerText.includes('mri')) {
      return '🔬 Radiology Department is on the 1st Floor, West Wing. Follow the blue line markers. Phone: (555) 123-4575';
    } else if (lowerText.includes('pediatrics') || lowerText.includes('children')) {
      return '👶 Pediatrics is on the 2nd Floor, South Wing. Child-friendly environment with play areas. Phone: (555) 123-4582';
    } else if (lowerText.includes('help') || lowerText.includes('lost')) {
      return "I can help you navigate the hospital! Ask me about specific departments, services, or facilities. You can also use voice commands by saying 'Where is...' followed by your destination.";
    } else {
      return `I can help you find: Emergency Room, Cardiology, Pharmacy, Parking, Appointments, Cafeteria, Radiology, Pediatrics, and more. What would you like to know?`;
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Floating Chat Button with Text */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition-all transform hover:scale-105 backdrop-blur-xl group ${
          isOpen ? 'rotate-0' : ''
        }`}
        aria-label="Talk with us"
      >
        {isOpen ? (
          <div className="px-6 py-4 flex items-center gap-3">
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold text-base">Close</span>
          </div>
        ) : (
          <div className="px-6 py-4 flex items-center gap-3 relative">
            <Mic size={24} className="group-hover:scale-110 transition-transform animate-pulse" />
            <span className="font-semibold text-base">Talk with Us</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] glass-strong rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Chat Header */}
          <div className="bg-blue-600 backdrop-blur-lg text-white p-5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass rounded-full flex items-center justify-center ring-2 ring-white/30">
                <MapPin size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Navigation Assistant</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-white/90">Online • Ready to help</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2.5 rounded-full transition-all hover:rotate-90 duration-300"
            >
              <X size={22} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/90 backdrop-blur-sm">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 transition-all duration-300 hover:scale-[1.02] ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm shadow-lg'
                      : 'glass text-gray-800 rounded-bl-sm shadow-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="glass text-gray-800 rounded-2xl rounded-bl-sm shadow-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 glass-dark border-t border-white/10">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Quick Questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.slice(0, 3).map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs glass hover:glass-strong hover:scale-105 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full transition-all duration-300 border border-blue-200/30 shadow-sm backdrop-blur-xl"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 glass-strong border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(inputText);
                  }
                }}
                placeholder="Ask about locations..."
                className="flex-1 px-4 py-2 glass rounded-full focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-sm text-gray-800 placeholder:text-gray-500 transition-all duration-300"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-xl"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask me about departments, services, or directions
            </p>
          </div>
        </div>
      )}
    </>
  );
}

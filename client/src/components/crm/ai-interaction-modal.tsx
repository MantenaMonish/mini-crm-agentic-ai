import { useState } from "react";
import type { Lead } from "@shared/schema";

interface Message {
  type: 'user' | 'ai';
  content: string;
}

interface AIInteractionModalProps {
  lead: Lead;
  onClose: () => void;
}

export const AIInteractionModal: React.FC<AIInteractionModalProps> = ({ lead, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'ai', content: `Hello! I'm here to help you with ${lead.name}. Ask me about follow-up actions or details.` }
  ]);
  const [inputValue, setInputValue] = useState('');

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('follow-up')) {
      return `Email ${lead.name} at ${lead.email}.`;
    } else if (lowerInput.includes('details')) {
      return `Name: ${lead.name}, Email: ${lead.email}, Status: ${lead.status}.`;
    } else {
      return 'Ask about follow-up or details.';
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = { type: 'user', content: inputValue };
    const aiResponse: Message = { type: 'ai', content: generateAIResponse(inputValue) };
    
    setMessages(prev => [...prev, userMessage, aiResponse]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-3xl shadow-2xl max-w-lg w-full max-h-[500px] flex flex-col animate-[slideUp_0.5s_ease-out] border border-white/30">
        <div className="px-8 py-6 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 animate-pulse-slow">
              <i className="fas fa-robot text-white"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                AI Agent Chat
              </h3>
              <p className="text-sm text-slate-600">Talking about {lead.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <i className="fas fa-times text-slate-600"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-[slideUp_0.3s_ease-out]`}>
              <div className={`max-w-sm px-6 py-3 rounded-2xl shadow-lg ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-white/90 text-slate-800 border border-slate-200'
              }`}>
                {message.type === 'ai' && (
                  <div className="flex items-center mb-1">
                    <i className="fas fa-robot text-violet-500 text-xs mr-2"></i>
                    <span className="text-xs text-slate-500 font-medium">AI Assistant</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-6 py-4 border-t border-white/20">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about follow-up or details..."
              className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80"
            />
            <button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

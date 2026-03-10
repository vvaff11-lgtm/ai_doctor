import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Brain, Info, Send, PlusCircle, Bed, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import { Message, Doctor } from '../types';
import { api } from '../services/api';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

export const ChatPage: React.FC = () => {
  const { id } = useParams(); // doctor_id
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return;
      try {
        // 先获取医生信息
        const docData = await api.get(`/doctors/${id}`);
        setDoctor(docData);
        
        // 获取历史聊天记录
        const msgs = await api.get(`/chat/sessions/${id}`);
        if (msgs && msgs.length > 0) {
          setMessages(msgs);
        } else {
          // 如果没有历史记录，添加一条欢迎语 (仅前端显示)
          setMessages([
            {
              id: 'init-msg',
              role: 'assistant',
              content: `您好，我是${docData.name}。请问有什么可以帮您的？`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        }
      } catch (err) {
        console.error('Initial data load failed:', err);
      }
    };
    fetchInitialData();
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading || !doctor) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resp = await api.post('/chat/send', {
        doctor_id: doctor.id,
        content: text
      });
      
      const assistantMsg: Message = {
        id: resp.id,
        role: 'assistant',
        content: resp.content,
        timestamp: new Date(resp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: resp.suggestions,
        riskWarning: resp.risk_warning,
        recommendations: resp.recommendations
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!doctor) return <div className="p-4 text-center text-slate-500">Loading doctor info...</div>;

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative overflow-hidden">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shrink-0">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={doctor.avatar} alt={doctor.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight flex items-center gap-1">
                  {doctor.name}
                  <span className="text-blue-600 text-[14px]">✓</span>
                </h2>
                <p className="text-slate-500 text-[12px] font-medium">{doctor.department}</p>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <MoreVertical size={24} />
          </button>
        </div>
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 text-[12px]">
          <div className="flex items-center gap-2 text-slate-600">
            <Brain size={14} />
            严谨风格
          </div>
          <button onClick={() => navigate(`/doctor/${doctor.id}`)} className="text-blue-600 font-medium hover:underline">查看资料</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex justify-center">
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">今天 09:41</span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <img 
                src={msg.role === 'assistant' ? doctor.avatar : "https://lh3.googleusercontent.com/aida-public/AB6AXuBDuPEl8w_WbZ5_dHusaSqvr2EKg22bo4OTU3djezqxRRCYj91eLJHoePUbFCSqAXBzDtnbWbQZHBxrIZ9MaoSKQaLmIg7g-ErllXF5GmGerIVM5_SIiOP2MTPFfNgE6cSTegUgY2sTXejkrfOd5ej4dXg7y0rUnpl3KngSU2ZXsZG-g50R8qSJ7E2ppmAP7XvyuM8LpOc7AeddVc3R8nJhVEFclcWizxvJ15q3rI0a0R7eNWMyamNidyEUx0ObU6-fOGk4LUzbRBaP"} 
                alt={msg.role === 'assistant' ? doctor.name : "User"} 
                className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 border border-slate-200" 
              />
              <div className={cn(
                "flex flex-col gap-1 max-w-[85%]",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "text-base leading-relaxed rounded-2xl px-4 py-3 shadow-sm",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-sm" 
                    : "bg-slate-100 text-slate-900 rounded-tl-sm border border-slate-200"
                )}>
                  <p>{msg.content}</p>
                  
                  {msg.recommendations && (
                    <ul className="mt-3 space-y-2">
                      {msg.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <RecommendationIcon name={rec.icon} />
                          <span className="text-sm"><strong>{rec.title}：</strong>{rec.content}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {msg.riskWarning && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 text-[12px] text-orange-800 flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 text-orange-500" />
                      <p><strong>风险提示：</strong>{msg.riskWarning}</p>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="flex gap-1">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
            </div>
            医生正在输入...
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white border-t border-slate-200 shrink-0">
        <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar items-center">
          {(messages[messages.length - 1]?.suggestions || []).map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 hover:bg-slate-50 transition-colors text-blue-600 text-[13px] font-medium whitespace-nowrap"
            >
              {s}
            </button>
          )) || (
            <>
              <button 
                onClick={() => handleSend('非处方药推荐？')}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 hover:bg-slate-50 transition-colors text-blue-600 text-[13px] font-medium whitespace-nowrap"
              >
                非处方药推荐？
              </button>
              <button 
                onClick={() => handleSend('我需要去医院吗？')}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 hover:bg-slate-50 transition-colors text-slate-700 text-[13px] font-medium whitespace-nowrap"
              >
                我需要去医院吗？
              </button>
            </>
          )}
        </div>
        <div className="p-3 pt-0">
          <div className="flex items-end gap-2 bg-slate-100 rounded-2xl p-2 border border-slate-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
            <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors shrink-0">
              <PlusCircle size={24} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              className="w-full bg-transparent border-none focus:ring-0 resize-none p-2 text-sm max-h-[100px] placeholder:text-slate-500"
              placeholder="描述您的症状..."
              rows={1}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shrink-0 flex items-center justify-center h-10 w-10 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const RecommendationIcon: React.FC<{ name: string }> = ({ name }) => {
  switch (name.toLowerCase()) {
    case 'bed': return <Bed size={18} className="text-blue-600 mt-0.5" />;
    case 'water_drop':
    case 'droplets': return <Droplets size={18} className="text-blue-600 mt-0.5" />;
    case 'thermostat':
    case 'thermometer': return <Thermometer size={18} className="text-blue-600 mt-0.5" />;
    default: return <Info size={18} className="text-blue-600 mt-0.5" />;
  }
};

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Trash2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type SessionItem = {
  id: string;
  doctor_id: string;
  last_message: string | null;
  timestamp: string;
  department: string | null;
};

type DoctorItem = {
  id: string;
  name: string;
  avatar: string;
  department: string;
};

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [doctors, setDoctors] = useState<Record<string, DoctorItem>>({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sessionData, doctorData] = await Promise.all([
          api.get('/chat/sessions'),
          api.get('/doctors/'),
        ]);

        const doctorMap: Record<string, DoctorItem> = {};
        (Array.isArray(doctorData) ? doctorData : []).forEach((doc: DoctorItem) => {
          doctorMap[doc.id] = doc;
        });

        setDoctors(doctorMap);
        setSessions(Array.isArray(sessionData) ? sessionData : []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;

    return sessions.filter((item) => {
      const doctor = doctors[item.doctor_id];
      const doctorName = doctor?.name?.toLowerCase() || '';
      const dept = (item.department || doctor?.department || '').toLowerCase();
      const last = (item.last_message || '').toLowerCase();
      return doctorName.includes(q) || dept.includes(q) || last.includes(q);
    });
  }, [sessions, doctors, query]);

  const handleClearAll = async () => {
    if (clearing || sessions.length === 0) return;
    setClearing(true);
    try {
      await api.delete('/chat/sessions');
      setSessions([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="flex items-center bg-white p-4 sticky top-0 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">咨询历史</h2>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索医生、科室或提问内容"
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            disabled={clearing || sessions.length === 0}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors disabled:opacity-40"
          >
            <Trash2 size={18} />
            {clearing ? '清除中...' : '全部清除'}
          </button>
        </div>

        {loading && <p className="text-center text-slate-500 py-6">加载中...</p>}

        {!loading && filteredSessions.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center text-slate-500">
            暂无历史记录
          </div>
        )}

        <div className="space-y-3">
          {filteredSessions.map((item) => {
            const doctor = doctors[item.doctor_id];
            const title = doctor?.name || 'AI 医生';
            const department = item.department || doctor?.department || '未知科室';
            const date = new Date(item.timestamp).toLocaleString();

            return (
              <button
                key={item.id}
                onClick={() => navigate(`/chat/${item.doctor_id}`)}
                className="w-full text-left bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-start gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    {doctor?.avatar ? (
                      <img src={doctor.avatar} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <MessageSquare size={18} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5 gap-3">
                      <h3 className="font-bold truncate">{title}</h3>
                      <span className="text-slate-400 text-xs shrink-0">{date}</span>
                    </div>
                    <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">{department}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm line-clamp-1 pl-16">
                  {item.last_message || '暂无提问内容'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

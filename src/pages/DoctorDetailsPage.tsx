import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Doctor } from '../types';

export const DoctorDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await api.get(`/doctors/${id}`);
        setDoctor(data);
      } catch (err) {
        console.error('Failed to fetch doctor details:', err);
      }
    };
    if (id) fetchDoctor();
  }, [id]);

  if (!doctor) return <div className="p-4 text-center text-slate-500">医生信息加载中...</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col">
      <header className="flex items-center bg-white p-4 sticky top-0 z-50 border-b border-slate-100 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">医生详情</h2>
        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Share2 size={24} />
        </button>
      </header>

      <div className="flex flex-col items-center bg-white p-6 rounded-b-3xl shadow-sm mb-4">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-50">
            <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white" />
        </div>
        <h1 className="text-2xl font-bold mb-1">{doctor.name}</h1>
        <p className="text-blue-600 font-medium text-sm bg-blue-50 px-3 py-0.5 rounded-full mb-6">{doctor.title}</p>
        <button
          onClick={() => navigate(`/chat/${doctor.id}`)}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          开始咨询
        </button>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Stethoscope size={20} />
              <p className="text-slate-500 text-sm font-medium">科室方向</p>
            </div>
            <p className="text-lg font-bold">{doctor.department}</p>
          </div>
          <div className="h-px bg-slate-100 w-full mb-4" />
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <ShieldCheck size={20} />
              <p className="text-slate-500 text-sm font-medium">专业背景</p>
            </div>
            <p className="text-slate-700 leading-relaxed">{doctor.background}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-blue-600" size={20} />
            能力特色
          </h3>
          <div className="flex flex-wrap gap-2">
            {(doctor.features || []).map((feature) => (
              <span key={feature} className="bg-blue-50 text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl border border-blue-100">
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ClipboardList className="text-blue-600" size={20} />
            擅长方向
          </h3>
          <ul className="space-y-3">
            {(doctor.specialties || []).map((spec) => (
              <li key={spec} className="flex items-start gap-3">
                <CheckCircle className="text-blue-600 mt-1" size={16} />
                <span className="text-slate-700">{spec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50">
        <button
          onClick={() => navigate(`/chat/${doctor.id}`)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-[0.98]"
        >
          <MessageCircle size={20} />
          向该医生提问
        </button>
      </div>
    </div>
  );
};

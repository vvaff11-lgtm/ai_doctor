import React, { useEffect, useState } from 'react';
import { Search, Star, ChevronRight } from 'lucide-react';
import { DEPARTMENTS } from '../constants';
import { Link } from 'react-router-dom';
import { cn } from '../utils';
import { api } from '../services/api';
import { Doctor } from '../types';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBDuPEl8w_WbZ5_dHusaSqvr2EKg22bo4OTU3djezqxRRCYj91eLJHoePUbFCSqAXBzDtnbWbQZHBxrIZ9MaoSKQaLmIg7g-ErllXF5GmGerIVM5_SIiOP2MTPFfNgE6cSTegUgY2sTXejkrfOd5ej4dXg7y0rUnpl3KngSU2ZXsZG-g50R8qSJ7E2ppmAP7XvyuM8LpOc7AeddVc3R8nJhVEFclcWizxvJ15q3rI0a0R7eNWMyamNidyEUx0ObU6-fOGk4LUzbRBaP';

export const HomePage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_AVATAR);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorData, meData] = await Promise.all([api.get('/doctors/'), api.get('/auth/me')]);
        setDoctors(Array.isArray(doctorData) ? doctorData : doctorData.items || []);
        setUserAvatar(meData?.avatar || DEFAULT_AVATAR);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">首页</h1>
        <Link
          to="/profile"
          aria-label="Go to profile"
          className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200 block"
        >
          <img src={userAvatar || DEFAULT_AVATAR} alt="Profile" className="w-full h-full object-cover" />
        </Link>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="搜索医生或科室"
          className="w-full bg-slate-100 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {DEPARTMENTS.map((dept, i) => (
          <button
            key={dept}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-bold mb-4">推荐医生</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {doctors.filter((d) => d.rating).map((doctor) => (
            <Link
              key={doctor.id}
              to={`/doctor/${doctor.id}`}
              className="flex-none w-48 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
              <div className="flex justify-between items-start mb-3">
                <img src={doctor.avatar} alt={doctor.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  <Star size={12} fill="currentColor" />
                  {doctor.rating}
                </div>
              </div>
              <h3 className="font-bold">{doctor.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{doctor.department}</p>
              <button className="w-full py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                立即对话
              </button>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">所有 AI 医生</h2>
          <button className="text-sm text-blue-600 font-medium flex items-center gap-1">
            筛选 <ChevronRight size={16} />
          </button>
        </div>
        {doctors.map((doctor) => (
          <Link
            key={doctor.id}
            to={`/doctor/${doctor.id}`}
            className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4 mb-3">
              <img src={doctor.avatar} alt={doctor.name} className="w-20 h-20 rounded-xl object-cover shadow-inner" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold">{doctor.name}</h3>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      doctor.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {doctor.status === 'online' ? '在线' : '忙碌'}
                  </span>
                </div>
                <p className="text-blue-600 text-sm font-medium mb-2">{doctor.department}</p>
                <div className="flex gap-2">
                  {(doctor.tags || []).map((tag) => (
                    <span key={tag} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-sm line-clamp-2 mb-4">{doctor.background}</p>
            <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20">
              立即咨询
            </button>
          </Link>
        ))}
      </section>
    </div>
  );
};

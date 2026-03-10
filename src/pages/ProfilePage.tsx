import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Award, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type Me = {
  id: string;
  username: string;
  name?: string;
  age?: number;
  gender?: string;
  allergies?: string;
  chronic_diseases?: string;
  avatar?: string;
};

type SessionItem = {
  id: string;
  doctor_id: string;
  department?: string;
};

type DoctorItem = {
  id: string;
  name: string;
  department: string;
  avatar: string;
};

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBDuPEl8w_WbZ5_dHusaSqvr2EKg22bo4OTU3djezqxRRCYj91eLJHoePUbFCSqAXBzDtnbWbQZHBxrIZ9MaoSKQaLmIg7g-ErllXF5GmGerIVM5_SIiOP2MTPFfNgE6cSTegUgY2sTXejkrfOd5ej4dXg7y0rUnpl3KngSU2ZXsZG-g50R8qSJ7E2ppmAP7XvyuM8LpOc7AeddVc3R8nJhVEFclcWizxvJ15q3rI0a0R7eNWMyamNidyEUx0ObU6-fOGk4LUzbRBaP';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [doctorMap, setDoctorMap] = useState<Record<string, DoctorItem>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [meData, sessionData, doctorsData] = await Promise.all([
          api.get('/auth/me'),
          api.get('/chat/sessions'),
          api.get('/doctors/'),
        ]);

        setMe(meData);
        setSessions(Array.isArray(sessionData) ? sessionData : []);

        const map: Record<string, DoctorItem> = {};
        (Array.isArray(doctorsData) ? doctorsData : []).forEach((d: DoctorItem) => {
          map[d.id] = d;
        });
        setDoctorMap(map);
      } catch (err) {
        console.error('Failed to load profile page:', err);
      }
    };

    load();
  }, []);

  const recentDoctors = useMemo(() => {
    return sessions
      .map((s) => doctorMap[s.doctor_id])
      .filter((d): d is DoctorItem => Boolean(d))
      .slice(0, 6);
  }, [sessions, doctorMap]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative bg-gradient-to-b from-blue-100 to-transparent px-4 pt-12 pb-6 flex flex-col items-center">
        <button
          data-testid="profile-edit-btn"
          onClick={() => navigate('/profile/edit')}
          className="absolute top-4 right-4 text-blue-600 p-2 hover:bg-white/50 rounded-full transition-colors"
          aria-label="编辑个人资料"
        >
          <Edit2 size={24} />
        </button>

        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden">
            <img data-testid="profile-avatar" src={me?.avatar || DEFAULT_AVATAR} alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 bg-yellow-400 text-white rounded-full p-1 border-2 border-white shadow-sm">
            <Award size={16} />
          </div>
        </div>

        <h1 data-testid="profile-name" className="text-2xl font-bold mb-1">
          {me?.name || me?.username || '未命名用户'}
        </h1>
        <p className="text-sm text-slate-500">ID: {me?.username || '-'}</p>
      </div>

      <div className="px-4 space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-3">个人资料</h2>
          <div className="grid grid-cols-2 gap-3">
            <ProfileCard value={me?.age ? String(me.age) : '-'} label="年龄" />
            <ProfileCard value={me?.gender || '-'} label="性别" />
            <ProfileCard value={me?.allergies || '-'} label="过敏史" />
            <ProfileCard value={me?.chronic_diseases || '-'} label="慢性病" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">最近咨询</h2>
          {recentDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 text-sm text-slate-500">暂无咨询记录</div>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {recentDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => navigate(`/chat/${doctor.id}`)}
                  className="flex flex-col items-center min-w-[72px]"
                >
                  <img src={doctor.avatar} alt={doctor.name} className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-blue-100" />
                  <p className="text-xs font-medium truncate w-full text-center">{doctor.name}</p>
                  <p className="text-[10px] text-slate-500">{doctor.department}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={handleLogout}
          className="w-full bg-white text-red-500 font-bold py-4 rounded-2xl shadow-sm border border-red-50 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors active:scale-95"
        >
          <LogOut size={20} />
          退出登录
        </button>
      </div>
    </div>
  );
};

const ProfileCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
    <p className="text-2xl font-bold text-blue-600 mb-1 truncate w-full">{value}</p>
    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</p>
  </div>
);

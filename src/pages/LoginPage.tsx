import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('isAuthenticated', 'true');
      const userData = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600 to-blue-400 -skew-y-6 -translate-y-24 z-0" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 ring-4 ring-blue-50">
            <Shield className="text-blue-600" size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI 医疗助手</h1>
          <p className="text-slate-500 font-medium mt-2">你的私人智能健康管家</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User size={20} />
            </div>
            <input
              type="text"
              placeholder="手机号"
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              placeholder="密码"
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm flex items-center gap-2 mb-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '登录中...' : '立即登录'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm font-medium">
            还没有账号？ <span onClick={() => navigate('/register')} className="text-blue-600 cursor-pointer hover:underline">立即注册</span>
          </p>
        </div>
      </motion.div>

      <div className="mt-auto pt-12 text-center text-[10px] text-slate-300 uppercase tracking-widest font-bold">
        Secure Health Data Protection
      </div>
    </div>
  );
};

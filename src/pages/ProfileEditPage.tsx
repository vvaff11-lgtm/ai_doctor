import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type ProfileForm = {
  name: string;
  age: string;
  gender: string;
  allergies: string;
  chronic_diseases: string;
  avatar: string;
};

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBDuPEl8w_WbZ5_dHusaSqvr2EKg22bo4OTU3djezqxRRCYj91eLJHoePUbFCSqAXBzDtnbWbQZHBxrIZ9MaoSKQaLmIg7g-ErllXF5GmGerIVM5_SIiOP2MTPFfNgE6cSTegUgY2sTXejkrfOd5ej4dXg7y0rUnpl3KngSU2ZXsZG-g50R8qSJ7E2ppmAP7XvyuM8LpOc7AeddVc3R8nJhVEFclcWizxvJ15q3rI0a0R7eNWMyamNidyEUx0ObU6-fOGk4LUzbRBaP';

export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    age: '',
    gender: '',
    allergies: '',
    chronic_diseases: '',
    avatar: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const me = await api.get('/auth/me');
        setForm({
          name: me.name || '',
          age: me.age ? String(me.age) : '',
          gender: me.gender || '',
          allergies: me.allergies || '',
          chronic_diseases: me.chronic_diseases || '',
          avatar: me.avatar || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoaded(true);
      }
    };

    loadMe();
  }, []);

  const updateField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/auth/avatar', fd);
      if (res?.avatar) {
        updateField('avatar', res.avatar);
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!loaded || uploading) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name || null,
        age: form.age ? Number(form.age) : null,
        gender: form.gender || null,
        allergies: form.allergies || '',
        chronic_diseases: form.chronic_diseases || '',
        avatar: form.avatar || '',
      };

      const updated = await api.put('/auth/me', payload);
      localStorage.setItem('user', JSON.stringify(updated));
      navigate('/profile');
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen max-w-md mx-auto">
      <header className="flex items-center bg-white p-4 sticky top-0 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">编辑个人资料</h2>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-3">头像预览</p>
          <div className="flex items-center gap-4">
            <img src={form.avatar || DEFAULT_AVATAR} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-slate-200" />
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors">
              <Upload size={16} />
              {uploading ? '上传中...' : '本地上传'}
              <input
                data-testid="profile-avatar-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarFile}
                disabled={!loaded || uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <FormField label="姓名" value={form.name} onChange={(v) => updateField('name', v)} placeholder="请输入姓名" testId="profile-name-input" disabled={!loaded} />
        <FormField label="年龄" value={form.age} onChange={(v) => updateField('age', v)} placeholder="请输入年龄" type="number" testId="profile-age-input" disabled={!loaded} />

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold mb-2">性别</p>
          <select
            data-testid="profile-gender-select"
            value={form.gender}
            onChange={(e) => updateField('gender', e.target.value)}
            disabled={!loaded}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 disabled:opacity-60"
          >
            <option value="">请选择</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>

        <FormField label="过敏史" value={form.allergies} onChange={(v) => updateField('allergies', v)} placeholder="例如：花粉、青霉素" testId="profile-allergies-input" disabled={!loaded} />
        <FormField label="慢性病" value={form.chronic_diseases} onChange={(v) => updateField('chronic_diseases', v)} placeholder="例如：高血压、糖尿病" testId="profile-chronic-input" disabled={!loaded} />

        <button
          data-testid="profile-save-btn"
          onClick={handleSave}
          disabled={saving || !loaded || uploading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? '保存中...' : '保存资料'}
        </button>
      </div>
    </div>
  );
};

const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  testId: string;
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', testId, disabled = false }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
    <p className="text-sm font-semibold mb-2">{label}</p>
    <input
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 disabled:opacity-60"
    />
  </div>
);

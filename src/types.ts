export interface Doctor {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  rating?: number;
  status: 'online' | 'busy' | 'offline';
  specialties: string[];
  background: string;
  features: string[];
  tags: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  riskWarning?: string;
  recommendations?: {
    title: string;
    content: string;
    icon: string;
  }[];
}

export interface ChatSession {
  id: string;
  doctorId: string;
  lastMessage: string;
  timestamp: string;
  department: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: '男' | '女';
  allergies: string;
  chronicDiseases: string;
  avatar: string;
}

import { Doctor } from './types';

export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: '张医生',
    title: 'AI 辅助执业医师',
    department: '内科',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGSTbqDG9cpuW_c8daOp6cbS5Gl8YaqibdNBkKpmB5JIr2oFLEcr2KzgpLTHqeFuMsRYycDAJXv9wG5nNi0eN-6HpXxvi6QLNlFzzxONpejz_0kSwhxHTvldD0GsswRd7-qudMV-VkqlrdJQsZgcSRsLd-YopjPI6DxiYiJPp6GcablPld264gdK2u-QjK1toTJ_Jqo_Wgt9SbN90aFo_c7shMFhj7ctamy5U6Ey5eMdY69VZVOdvb7jMO8mf-jfbJ8PSR7eHrxu0M',
    rating: 4.9,
    status: 'online',
    specialties: ['高血压健康管理', '心脏瓣膜病咨询', '术后康复指导'],
    background: '拥有15年临床经验，深耕心内科领域，擅长高血压、冠心病及各类心脏疾病的综合管理与AI辅助诊断建议。',
    features: ['风险优先', '机制解释', '证据导向', '共情沟通'],
    tags: ['严谨', '专业']
  },
  {
    id: '2',
    name: '艾米丽医生',
    title: '全科医生',
    department: '全科',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIEZJp2MLSKwOuyALj86I738h8e50roe6cRH_l4-AcpRXZYqTb6dkZ_6ZbDI8IGPXlK3QEwnhU6MdHuyBebNXgmzIuxMUcI-h2qw9FLMkV9F5BIrxNWHPUJltWScrqwcGpPrM2qwYR0xzJN053dsoDFrr6WCW5NPEC2J-mAZ6yiuVIsj73Ly_Rdgrj18_1QaDyvzdCzgs1yqBPKvvfvflIBl29Alzn5ccujeR3ZAf61iiQgbi-OUQ8AtS7YtxojeyP4UreTzm9AZKD',
    status: 'online',
    specialties: ['常见病综合诊断', '预防性健康指导'],
    background: '擅长常见疾病的综合诊断与关怀，以及预防性健康指导。',
    features: ['亲和', '严谨'],
    tags: ['亲和', '耐心'],
    rating: 4.8
  },
  {
    id: '3',
    name: '王医生',
    title: '神经内科专家',
    department: '神经内科',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_S-E3zM6UiSI_S20QgJTc3tEBlQ4i-9fGi8twIo2bPKZoXNmeT3p8Myp-mfthQGqin9dnScgMZ_6PFRLyEE5Y1YRFNnzB1dS-rvRW8fRxgQeCJJniebFbPhOArH4ZPenhoMyxzZpWmkzYplLYDJtK_-ojcsoGQTws3OFeThS_-L0yGBMp-OWhfq_fl3EPIXnMzGaoUWNtHFKBQXqj60LNyzk1cJNMr91r9i5UxTHJvzqjCPzCLVKC1I8IzPCCsSmCjWip0LiA7VDC',
    status: 'busy',
    specialties: ['神经系统疾病诊断', '精准医疗见解'],
    background: '擅长神经系统疾病的诊断和治疗，提供精准、基于数据的见解。',
    features: ['分析型', '直接'],
    tags: ['严谨', '高效'],
    rating: 4.7
  }
];

export const DEPARTMENTS = ['内科', '外科', '儿科', '皮肤科', '心理科'];

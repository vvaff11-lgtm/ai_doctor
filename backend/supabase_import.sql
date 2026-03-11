-- Generated from local MySQL for Supabase(PostgreSQL) import
BEGIN;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text,
  age integer,
  gender text,
  allergies text,
  chronic_diseases text,
  avatar text
);

CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  title text,
  department text,
  avatar text,
  rating double precision,
  status text,
  specialties jsonb,
  background text,
  features jsonb,
  tags jsonb
);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE,
  last_message text,
  timestamp timestamptz,
  department text
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role text,
  content text,
  timestamp timestamptz,
  suggestions jsonb,
  risk_warning text,
  recommendations jsonb
);

TRUNCATE TABLE public.messages, public.chat_sessions, public.doctors, public.users RESTART IDENTITY CASCADE;

INSERT INTO public.users (id, username, password_hash, name, age, gender, allergies, chronic_diseases, avatar) VALUES ('23df89da-1c50-4650-9511-bd4f9bc47712', 'newuser2', '$2b$12$CFu6VXQOtlKHsy5vw1j/tefhZ8EIrBGju6rncRb4gKb5be7bUxDx.', 'newuser2', NULL, NULL, '', '', '');
INSERT INTO public.users (id, username, password_hash, name, age, gender, allergies, chronic_diseases, avatar) VALUES ('4c1274a9-26b6-45ce-a75b-163baa058628', 'admin', '$2b$12$nlC79pRypD5er/aaCv90cuq5K2YAM8z5fSSYY8hbHESAUIYQwAc/W', '系统管理员', NULL, NULL, '', '', '');
INSERT INTO public.users (id, username, password_hash, name, age, gender, allergies, chronic_diseases, avatar) VALUES ('65eb65ae-dd3a-40e7-b833-607d6d6fba01', 'wwj', '$2b$12$E/BwLuwaIJiczsv6Du92ye6gUQSZXV1HXkk.4uedPSEDK38V/8nwS', 'wwj', NULL, NULL, '', '', '');
INSERT INTO public.users (id, username, password_hash, name, age, gender, allergies, chronic_diseases, avatar) VALUES ('b24f7204-83e6-46b2-9f1d-4d3e2a5db9ea', 'demouser', '$2b$12$bb26nJ55IR5GytiuISIqXehYuU80bSyKXnVaSjkWMBa5S1yN/STMu', '肚大米', 22, '男', '肚子大', '爱吃米饭', '/api/auth/avatar/b24f7204-83e6-46b2-9f1d-4d3e2a5db9ea_cc91c36f0c624c4fa8af3d0f8f9f4a48.jpg');
INSERT INTO public.users (id, username, password_hash, name, age, gender, allergies, chronic_diseases, avatar) VALUES ('c430e137-61b0-43a7-8e4f-d9b4a5d8d01b', 'testuser2', '$2b$12$/Ihf5LsokfeJ3s7XIKwZ0e/8PD77dPIaEZPrAWQyYoQb8cK48qk3y', 'Test User', NULL, NULL, '', '', '');
INSERT INTO public.users (id, username, password_hash, name, age, gender, allergies, chronic_diseases, avatar) VALUES ('cc20f96b-9ff5-40be-852f-e6e0575b602a', 'testuser', '$2b$12$9ZKec3XWzQBewbheGkOp5O8Ya/h6tu3LEZ/zWYqiq6/hAsN1AUq8u', NULL, NULL, NULL, '', '', '');

INSERT INTO public.doctors (id, name, title, department, avatar, rating, status, specialties, background, features, tags) VALUES ('a94fae16-2591-5ce4-94c2-606d2d5aac2a', '张医生', 'AI 辅助执业医师', '内科', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGSTbqDG9cpuW_c8daOp6cbS5Gl8YaqibdNBkKpmB5JIr2oFLEcr2KzgpLTHqeFuMsRYycDAJXv9wG5nNi0eN-6HpXxvi6QLNlFzzxONpejz_0kSwhxHTvldD0GsswRd7-qudMV-VkqlrdJQsZgcSRsLd-YopjPI6DxiYiJPp6GcablPld264gdK2u-QjK1toTJ_Jqo_Wgt9SbN90aFo_c7shMFhj7ctamy5U6Ey5eMdY69VZVOdvb7jMO8mf-jfbJ8PSR7eHrxu0M', 4.9, 'online', '["高血压健康管理", "心脏瓣膜病咨询", "术后康复指导"]', '拥有15年临床经验，深耕心内科领域，擅长高血压、冠心病及各类心脏疾病的综合管理与AI辅助诊断建议。', '["风险优先", "机制解释", "证据导向", "共情沟通"]', '["严谨", "专业"]');
INSERT INTO public.doctors (id, name, title, department, avatar, rating, status, specialties, background, features, tags) VALUES ('1f844221-5570-5b6d-875f-9b84c046f2b9', '艾米丽医生', '全科医生', '全科', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIEZJp2MLSKwOuyALj86I738h8e50roe6cRH_l4-AcpRXZYqTb6dkZ_6ZbDI8IGPXlK3QEwnhU6MdHuyBebNXgmzIuxMUcI-h2qw9FLMkV9F5BIrxNWHPUJltWScrqwcGpPrM2qwYR0xzJN053dsoDFrr6WCW5NPEC2J-mAZ6yiuVIsj73Ly_Rdgrj18_1QaDyvzdCzgs1yqBPKvvfvflIBl29Alzn5ccujeR3ZAf61iiQgbi-OUQ8AtS7YtxojeyP4UreTzm9AZKD', 4.8, 'online', '["常见病综合诊断", "预防性健康指导"]', '擅长常见疾病的综合诊断与关怀，以及预防性健康指导。', '["亲和", "严谨"]', '["亲和", "耐心"]');
INSERT INTO public.doctors (id, name, title, department, avatar, rating, status, specialties, background, features, tags) VALUES ('a082b981-ed36-515d-9b41-e6dffe6e7ff8', '王医生', '神经内科专家', '神经内科', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_S-E3zM6UiSI_S20QgJTc3tEBlQ4i-9fGi8twIo2bPKZoXNmeT3p8Myp-mfthQGqin9dnScgMZ_6PFRLyEE5Y1YRFNnzB1dS-rvRW8fRxgQeCJJniebFbPhOArH4ZPenhoMyxzZpWmkzYplLYDJtK_-ojcsoGQTws3OFeThS_-L0yGBMp-OWhfq_fl3EPIXnMzGaoUWNtHFKBQXqj60LNyzk1cJNMr91r9i5UxTHJvzqjCPzCLVKC1I8IzPCCsSmCjWip0LiA7VDC', 4.7, 'busy', '["神经系统疾病诊断", "精准医疗见解"]', '擅长神经系统疾病的诊断和治疗，提供精准、基于数据的见解。', '["分析型", "直接"]', '["严谨", "高效"]');

INSERT INTO public.chat_sessions (id, user_id, doctor_id, last_message, timestamp, department) VALUES ('02590c74-d5e3-46c6-908f-171e70155f3c', 'b24f7204-83e6-46b2-9f1d-4d3e2a5db9ea', '1f844221-5570-5b6d-875f-9b84c046f2b9', '111', '2026-03-09 08:41:23'::timestamptz, '全科');
INSERT INTO public.chat_sessions (id, user_id, doctor_id, last_message, timestamp, department) VALUES ('5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'b24f7204-83e6-46b2-9f1d-4d3e2a5db9ea', 'a94fae16-2591-5ce4-94c2-606d2d5aac2a', '??Dify??', '2026-03-09 09:45:42'::timestamptz, '内科');
INSERT INTO public.chat_sessions (id, user_id, doctor_id, last_message, timestamp, department) VALUES ('ebf2655e-e69a-41a3-b9f7-7f530da95f0e', '23df89da-1c50-4650-9511-bd4f9bc47712', 'a94fae16-2591-5ce4-94c2-606d2d5aac2a', '我好困', '2026-03-08 22:23:05'::timestamptz, '内科');

INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('045295ff-d513-4aa4-926a-12dd81541f7c', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：profile-flow-1773046823582。请配好环境里的 GEMINI_API_KEY', '2026-03-09 09:00:26'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('08d50212-f76f-45d3-9111-0d4a6668427a', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：profile-flow-1773046608635。请配好环境里的 GEMINI_API_KEY', '2026-03-09 08:56:51'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('0ba073e9-ff35-45c7-bb09-2e814e7d399d', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', 'profile-flow-1773047757243', '2026-03-09 09:16:01'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('17b8d72d-c49c-4bc7-8a9a-fea77f58c20f', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：profile-flow-1773046494054。请配好环境里的 GEMINI_API_KEY', '2026-03-09 08:54:56'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('192c34b1-bd40-46fc-93c1-0b589a6d4a93', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：profile-flow-1773048233459。请配好环境里的 GEMINI_API_KEY', '2026-03-09 09:23:55'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('2702c1e2-5271-435d-b9f1-d2fb1d66a113', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', '??Dify??', '2026-03-09 09:45:42'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('27036a3b-a7aa-42d5-a881-68800f778d56', '02590c74-d5e3-46c6-908f-171e70155f3c', 'user', '111', '2026-03-09 08:41:23'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('36a0d7c1-430a-4aef-bd54-39b575da9c82', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：profile-flow-1773047788421。请配好环境里的 GEMINI_API_KEY', '2026-03-09 09:16:31'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('37f4a172-092e-4ca5-a562-bc1ba2a5363a', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', 'profile-flow-1773048233459', '2026-03-09 09:23:55'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('4bc3659e-544e-4fe1-be0a-9a88a2d71e1d', 'ebf2655e-e69a-41a3-b9f7-7f530da95f0e', 'user', '我好困', '2026-03-08 22:23:05'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('52dc50d6-9f15-494d-af57-cc53ed5b71c9', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', 'profile-flow-1773047527977', '2026-03-09 09:12:10'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('55fa6945-4f0e-46e1-9751-8fc9dbffac45', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：我今天头疼。请配好环境里的 GEMINI_API_KEY', '2026-03-09 09:33:54'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('63078d96-5fe6-470c-a549-08627d7ff731', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '调用 Dify 失败：httpx=EOF occurred in violation of protocol (_ssl.c:1124); curl=Command ''[''curl.exe'', ''--silent'', ''--show-error'', ''--fail'', ''--location'', ''-X'', ''POST'', ''https://api.dify.ai/v1/chat-messages'', ''-H'', ''Authorization: Bearer app-N3T95hufDfXGdNPVl8RcgbeO'', ''-H'', ''Content-Type: application/json'', ''-d'', ''{"inputs": {"doctor_name": "张医生", "history": "医生: (模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：???????????。请配好环境里的 GEMINI_API_KEY\\n用户: ???????????\\n用户: ???????????\\n医生: 调用 Dify 失败：EOF occurred in violation of protocol (_ssl.c:1124)\\n用户: ???????????\\n医生: 调用 Dify 失败：httpx=EOF occurred in violation of protocol (_ssl.c:1124); curl=Command \''[\''curl.exe\'', \''--silent\'', \''--show-error\'', \''--fail\'', \''--location\'', \''-X\'', \''POST\'', \''https://api.dify.ai/v1/chat-messages\'', \''-H\'', \''Authorization: Bearer app-N3T95hufDfXGdNPVl8RcgbeO\'', \''-H\'', \''Content-Type: application/json\'', \''-d\'', \''{\\"inputs\\": {\\"doctor_name\\": \\"张医生\\", \\"history\\": \\"用户: 我今天头疼\\\\\\\\n医生: (模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：我今天头疼。请配好环境里的 GEMINI_API_KEY\\\\\\\\n医生: (模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：???????????。请配好环境里的 GEMINI_API_KEY\\\\\\\\n用户: ???????????\\\\\\\\n用户: ???????????\\\\\\\\n医生: 调用 Dify 失败：EOF occurred in violation of protocol (_ssl.c:1124)\\", \\"system_hint\\": \\"你是张医生，请以专业、简洁、友好的中文回答。若有风险请明确提醒及时就医。\\"}, \\"query\\": \\"???????????\\", \\"response_mode\\": \\"blocking\\", \\"user\\": \\"ai-medical-assistant\\"}\'']\'' returned non-zero exit status 55.", "system_hint": "你是张医生，请以专业、简洁、友好的中文回答。若有风险请明确提醒及时就医。"}, "query": "??Dify??", "response_mode": "blocking", "user": "ai-medical-assistant"}'']'' returned non-zero exit status 22.', '2026-03-09 09:45:43'::timestamptz, '[]', '系统调用异常，请稍后重试或联系管理员。', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('6b5fbe1c-1d54-4c58-ae33-570cdfdb2282', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', '最近总是头晕怎么办-1773045300344', '2026-03-09 08:35:02'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('6fc3aa58-86cc-4f59-b220-f439ef29e6bf', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', 'profile-flow-1773047100539', '2026-03-09 09:05:02'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('7a1a2e96-af6a-4991-a761-76f6de8a7690', '02590c74-d5e3-46c6-908f-171e70155f3c', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：111。请配好环境里的 GEMINI_API_KEY', '2026-03-09 08:41:23'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('7b176f88-9503-439a-b842-8f55639bff41', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', 'profile-flow-1773046608635', '2026-03-09 08:56:51'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('93671ace-f22a-4e7a-b24e-5476c5be5c67', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', '个人资料测试问题-1773045629694', '2026-03-09 08:40:32'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('95c75650-394a-41b3-ae78-1713afe076f3', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：个人资料测试问题-1773045629694。请配好环境里的 GEMINI_API_KEY', '2026-03-09 08:40:32'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('95ebb20e-5957-479c-be0e-1fe319118e7b', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', '???????????', '2026-03-09 09:44:47'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('9a6a74e1-836d-4f6d-ab1a-f50be5157c8b', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：profile-flow-1773047100539。请配好环境里的 GEMINI_API_KEY', '2026-03-09 09:05:02'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('9f51c93d-1c77-4923-9df4-6959f5fea14e', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', 'profile-flow-1773046494054', '2026-03-09 08:54:56'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('a2d3b327-7c8e-49e3-81e5-0195a5d9dea8', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', '???????????', '2026-03-09 09:34:41'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('b1d2a78c-766a-4956-941c-ab047fefabaa', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', 'profile-flow-1773046823582', '2026-03-09 09:00:26'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('b395d85d-014b-4248-a117-2c47da669eeb', 'ebf2655e-e69a-41a3-b9f7-7f530da95f0e', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：我好困。请配好环境里的 GEMINI_API_KEY', '2026-03-08 22:23:05'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('bfd8793a-5472-4146-96e3-d1edd87b217c', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：profile-flow-1773047757243。请配好环境里的 GEMINI_API_KEY', '2026-03-09 09:16:01'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('ca2645db-7fad-46c5-bb43-d7ae06b20509', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '调用 Dify 失败：EOF occurred in violation of protocol (_ssl.c:1124)', '2026-03-09 09:40:09'::timestamptz, '[]', '系统调用异常，请稍后重试或联系管理员。', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('cf90f1bb-b460-4f25-afd5-8e99a3c7e8db', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：最近总是头晕怎么办-1773045300344。请配好环境里的 GEMINI_API_KEY', '2026-03-09 08:35:02'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('d9c72fa4-ae03-4c57-85e2-dc5a418669c6', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', 'profile-flow-1773047788421', '2026-03-09 09:16:31'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('e3860c18-ac4a-4ab0-9791-f529641d1c20', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：个人资料测试问题-1773045679689。请配好环境里的 GEMINI_API_KEY', '2026-03-09 08:41:21'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('eb9779b1-a124-4e09-893a-c6e6e640f151', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：profile-flow-1773047527977。请配好环境里的 GEMINI_API_KEY', '2026-03-09 09:12:10'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('ec4d44b1-25ea-4b66-ae23-23d0d2a4bbab', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', '我今天头疼', '2026-03-09 09:33:54'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('eda42b2d-dc8e-4552-9924-50f36b77aae9', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', '???????????', '2026-03-09 09:40:09'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('f19d5d56-f662-4207-95bf-e3328e6d1b4d', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'user', '个人资料测试问题-1773045679689', '2026-03-09 08:41:21'::timestamptz, NULL, NULL, NULL);
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('f952d186-1c22-44f5-898f-4c8de6241626', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '调用 Dify 失败：httpx=EOF occurred in violation of protocol (_ssl.c:1124); curl=Command ''[''curl.exe'', ''--silent'', ''--show-error'', ''--fail'', ''--location'', ''-X'', ''POST'', ''https://api.dify.ai/v1/chat-messages'', ''-H'', ''Authorization: Bearer app-N3T95hufDfXGdNPVl8RcgbeO'', ''-H'', ''Content-Type: application/json'', ''-d'', ''{"inputs": {"doctor_name": "张医生", "history": "用户: 我今天头疼\\n医生: (模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：我今天头疼。请配好环境里的 GEMINI_API_KEY\\n医生: (模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：???????????。请配好环境里的 GEMINI_API_KEY\\n用户: ???????????\\n用户: ???????????\\n医生: 调用 Dify 失败：EOF occurred in violation of protocol (_ssl.c:1124)", "system_hint": "你是张医生，请以专业、简洁、友好的中文回答。若有风险请明确提醒及时就医。"}, "query": "???????????", "response_mode": "blocking", "user": "ai-medical-assistant"}'']'' returned non-zero exit status 55.', '2026-03-09 09:45:17'::timestamptz, '[]', '系统调用异常，请稍后重试或联系管理员。', '[]');
INSERT INTO public.messages (id, session_id, role, content, timestamp, suggestions, risk_warning, recommendations) VALUES ('fdfd8e51-1bc7-4472-bfad-f87de712b5e0', '5c7494f3-fe47-48a3-bf60-441ea6ab3c17', 'assistant', '(模拟回复) 感谢您的咨询，因为我在后端，我收到了你的消息：???????????。请配好环境里的 GEMINI_API_KEY', '2026-03-09 09:34:41'::timestamptz, '["好", "谢谢"]', '系统未配置 GEMINI_API_KEY', '[]');

COMMIT;
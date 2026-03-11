import json
import uuid
from datetime import datetime
from pathlib import Path

import pymysql

MYSQL = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'ai_doctor_db',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
}

OUT_FILE = Path(__file__).resolve().parents[1] / 'supabase_import.sql'

TABLES_IN_ORDER = ['users', 'doctors', 'chat_sessions', 'messages']

UUID_COLS = {
    'users': ['id'],
    'doctors': ['id'],
    'chat_sessions': ['id', 'user_id', 'doctor_id'],
    'messages': ['id', 'session_id'],
}

CREATE_SQL = {
    'users': '''
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
''',
    'doctors': '''
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
''',
    'chat_sessions': '''
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE,
  last_message text,
  timestamp timestamptz,
  department text
);
''',
    'messages': '''
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
''',
}


def q(value):
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (dict, list)):
        s = json.dumps(value, ensure_ascii=False)
        return "'" + s.replace("'", "''") + "'::jsonb"
    if isinstance(value, datetime):
        return "'" + value.isoformat(sep=' ') + "'::timestamptz"
    s = str(value)
    return "'" + s.replace("'", "''") + "'"


def is_uuid_like(value):
    if value is None:
        return False
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def stable_uuid(namespace_key, raw_value):
    # Deterministic UUID to keep FK references consistent across exports.
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f'ai-doctor:{namespace_key}:{raw_value}'))


def main():
    conn = pymysql.connect(**MYSQL)
    try:
        with conn.cursor() as cur:
            rows_by_table = {}
            for t in TABLES_IN_ORDER:
                cur.execute(f'SELECT * FROM {t}')
                rows_by_table[t] = cur.fetchall()

            users_id_map = {}
            doctors_id_map = {}
            sessions_id_map = {}

            for row in rows_by_table['users']:
                raw = row.get('id')
                if raw is not None and not is_uuid_like(raw):
                    users_id_map[str(raw)] = stable_uuid('users.id', raw)

            for row in rows_by_table['doctors']:
                raw = row.get('id')
                if raw is not None and not is_uuid_like(raw):
                    doctors_id_map[str(raw)] = stable_uuid('doctors.id', raw)

            for row in rows_by_table['chat_sessions']:
                raw = row.get('id')
                if raw is not None and not is_uuid_like(raw):
                    sessions_id_map[str(raw)] = stable_uuid('chat_sessions.id', raw)

            def normalize_uuid_value(table, col, raw):
                if raw is None:
                    return None
                if is_uuid_like(raw):
                    return str(raw)

                key = str(raw)
                if table == 'users' and col == 'id':
                    return users_id_map.setdefault(key, stable_uuid('users.id', raw))
                if table == 'doctors' and col == 'id':
                    return doctors_id_map.setdefault(key, stable_uuid('doctors.id', raw))
                if table == 'chat_sessions' and col == 'id':
                    return sessions_id_map.setdefault(key, stable_uuid('chat_sessions.id', raw))
                if table == 'chat_sessions' and col == 'user_id':
                    return users_id_map.setdefault(key, stable_uuid('users.id', raw))
                if table == 'chat_sessions' and col == 'doctor_id':
                    return doctors_id_map.setdefault(key, stable_uuid('doctors.id', raw))
                if table == 'messages' and col == 'session_id':
                    return sessions_id_map.setdefault(key, stable_uuid('chat_sessions.id', raw))
                return stable_uuid(f'{table}.{col}', raw)

            lines = []
            lines.append('-- Generated from local MySQL for Supabase(PostgreSQL) import')
            lines.append('BEGIN;\n')

            for t in TABLES_IN_ORDER:
                lines.append(CREATE_SQL[t].strip() + '\n')

            lines.append('TRUNCATE TABLE public.messages, public.chat_sessions, public.doctors, public.users RESTART IDENTITY CASCADE;\n')

            for t in TABLES_IN_ORDER:
                rows = rows_by_table[t]
                if not rows:
                    continue

                cols = list(rows[0].keys())
                col_sql = ', '.join(cols)
                for row in rows:
                    normalized = {}
                    for c in cols:
                        val = row[c]
                        if c in UUID_COLS.get(t, []):
                            val = normalize_uuid_value(t, c, val)
                        normalized[c] = val
                    vals = ', '.join(q(normalized[c]) for c in cols)
                    lines.append(f'INSERT INTO public.{t} ({col_sql}) VALUES ({vals});')
                lines.append('')

            lines.append('COMMIT;')
            OUT_FILE.write_text('\n'.join(lines), encoding='utf-8')
            print(str(OUT_FILE))
    finally:
        conn.close()


if __name__ == '__main__':
    main()

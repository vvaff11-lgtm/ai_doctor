import json
import subprocess
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode
from uuid import uuid4

import httpx
from fastapi import HTTPException

from backend.core.config import settings


def _ensure_configured() -> None:
    if not settings.SUPABASE_URL or not settings.SUPABASE_PUBLISHABLE_KEY:
        raise HTTPException(status_code=500, detail='Supabase REST 模式缺少 URL 或 anon key')


def _headers(prefer_representation: bool = False) -> Dict[str, str]:
    headers = {
        'apikey': settings.SUPABASE_PUBLISHABLE_KEY,
        'Authorization': f'Bearer {settings.SUPABASE_PUBLISHABLE_KEY}',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'public',
        'Content-Profile': 'public',
    }
    if prefer_representation:
        headers['Prefer'] = 'return=representation'
    return headers


def _error_detail(response: httpx.Response) -> str:
    try:
        data = response.json()
    except ValueError:
        return response.text.strip() or f'HTTP {response.status_code}'
    if isinstance(data, dict):
        return data.get('message') or data.get('error_description') or data.get('hint') or str(data)
    return str(data)


def _build_url(table: str, params: Optional[Dict[str, str]] = None) -> str:
    base = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/{table.lstrip('/')}"
    if not params:
        return base
    return f'{base}?{urlencode(params)}'


def _request_via_httpx(
    method: str,
    table: str,
    *,
    params: Optional[Dict[str, str]] = None,
    json_body: Optional[Any] = None,
    prefer_representation: bool = False,
) -> Any:
    # Avoid inheriting system proxy variables (127.0.0.1:7890) because
    # they can break TLS to Supabase in local environments.
    with httpx.Client(timeout=30.0, trust_env=False) as client:
        response = client.request(
            method,
            _build_url(table),
            headers=_headers(prefer_representation=prefer_representation),
            params=params,
            json=json_body,
        )
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f'Supabase API 错误: {_error_detail(response)}')
    if not response.content:
        return None
    return response.json()


def _request_via_curl(
    method: str,
    table: str,
    *,
    params: Optional[Dict[str, str]] = None,
    json_body: Optional[Any] = None,
    prefer_representation: bool = False,
) -> Any:
    cmd = ['curl.exe', '--silent', '--show-error', '--fail', '--location', _build_url(table, params)]
    for key, value in _headers(prefer_representation=prefer_representation).items():
        cmd.extend(['-H', f'{key}: {value}'])
    if method.upper() != 'GET':
        cmd.extend(['-X', method.upper()])
    if json_body is not None:
        cmd.extend(['-d', json.dumps(json_body, ensure_ascii=False)])

    out = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', check=True)
    if not out.stdout.strip():
        return None
    return json.loads(out.stdout)


def _request(
    method: str,
    table: str,
    *,
    params: Optional[Dict[str, str]] = None,
    json_body: Optional[Any] = None,
    prefer_representation: bool = False,
) -> Any:
    _ensure_configured()
    try:
        return _request_via_httpx(
            method,
            table,
            params=params,
            json_body=json_body,
            prefer_representation=prefer_representation,
        )
    except HTTPException:
        raise
    except Exception as http_error:
        try:
            return _request_via_curl(
                method,
                table,
                params=params,
                json_body=json_body,
                prefer_representation=prefer_representation,
            )
        except Exception as curl_error:
            raise HTTPException(status_code=502, detail=f'Supabase 请求失败: httpx={http_error}; curl={curl_error}') from curl_error


def _as_object(value: Any) -> Any:
    if isinstance(value, list):
        return [_as_object(item) for item in value]
    if isinstance(value, dict):
        return SimpleNamespace(**{key: _as_object(item) for key, item in value.items()})
    return value


def _first(rows: Optional[List[Dict[str, Any]]]):
    if not rows:
        return None
    return _as_object(rows[0])


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_user_by_username(username: str):
    rows = _request('GET', 'users', params={'select': '*', 'username': f'eq.{username}', 'limit': '1'})
    return _first(rows)


def get_user_by_id(user_id: str):
    rows = _request('GET', 'users', params={'select': '*', 'id': f'eq.{user_id}', 'limit': '1'})
    return _first(rows)


def create_user(user_data: Dict[str, Any]):
    payload = dict(user_data)
    payload.setdefault('id', str(uuid4()))
    rows = _request('POST', 'users', json_body=payload, prefer_representation=True)
    return _first(rows)


def update_user(user_id: str, updates: Dict[str, Any]):
    rows = _request(
        'PATCH',
        'users',
        params={'id': f'eq.{user_id}'},
        json_body=updates,
        prefer_representation=True,
    )
    return _first(rows)


def list_doctors():
    rows = _request('GET', 'doctors', params={'select': '*', 'order': 'name.asc'})
    return _as_object(rows or [])


def get_doctor(doctor_id: str):
    rows = _request('GET', 'doctors', params={'select': '*', 'id': f'eq.{doctor_id}', 'limit': '1'})
    return _first(rows)


def list_sessions_for_user(user_id: str):
    rows = _request(
        'GET',
        'chat_sessions',
        params={'select': '*', 'user_id': f'eq.{user_id}', 'order': 'timestamp.desc'},
    )
    return _as_object(rows or [])


def clear_sessions_for_user(user_id: str) -> int:
    sessions = _request('GET', 'chat_sessions', params={'select': 'id', 'user_id': f'eq.{user_id}'}) or []
    if not sessions:
        return 0
    deleted = _request(
        'DELETE',
        'chat_sessions',
        params={'user_id': f'eq.{user_id}'},
        prefer_representation=True,
    )
    return len(deleted or sessions)


def get_session(user_id: str, doctor_id: str):
    rows = _request(
        'GET',
        'chat_sessions',
        params={
            'select': '*',
            'user_id': f'eq.{user_id}',
            'doctor_id': f'eq.{doctor_id}',
            'limit': '1',
        },
    )
    return _first(rows)


def create_session(session_data: Dict[str, Any]):
    payload = dict(session_data)
    payload.setdefault('id', str(uuid4()))
    payload.setdefault('timestamp', now_iso())
    rows = _request('POST', 'chat_sessions', json_body=payload, prefer_representation=True)
    return _first(rows)


def update_session(session_id: str, updates: Dict[str, Any]):
    payload = dict(updates)
    payload.setdefault('timestamp', now_iso())
    rows = _request(
        'PATCH',
        'chat_sessions',
        params={'id': f'eq.{session_id}'},
        json_body=payload,
        prefer_representation=True,
    )
    return _first(rows)


def list_messages(session_id: str, *, ascending: bool = True, limit: Optional[int] = None):
    params = {
        'select': '*',
        'session_id': f'eq.{session_id}',
        'order': f"timestamp.{('asc' if ascending else 'desc')}",
    }
    if limit is not None:
        params['limit'] = str(limit)
    rows = _request('GET', 'messages', params=params)
    return _as_object(rows or [])


def create_message(message_data: Dict[str, Any]):
    payload = dict(message_data)
    payload.setdefault('id', str(uuid4()))
    payload.setdefault('timestamp', now_iso())
    rows = _request('POST', 'messages', json_body=payload, prefer_representation=True)
    return _first(rows)

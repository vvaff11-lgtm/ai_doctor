import json
import subprocess
from typing import Any, Dict, List

import httpx

from backend.core.config import settings


def _build_history_text(history: List[Any]) -> str:
    if not history:
        return ''

    chunks: List[str] = []
    for msg in history[-6:]:
        role = '用户' if getattr(msg, 'role', '') == 'user' else '医生'
        content = getattr(msg, 'content', '')
        if content:
            chunks.append(f'{role}: {content}')

    return '\n'.join(chunks)


def _build_payload(doctor_name: str, history_text: str, prompt: str) -> Dict[str, Any]:
    system_hint = f'你是{doctor_name}，请以专业、简洁、友好的中文回答。若有风险请明确提醒及时就医。'
    return {
        'inputs': {
            'doctor_name': doctor_name,
            'history': history_text,
            'system_hint': system_hint,
        },
        'query': prompt,
        'response_mode': 'blocking',
        'user': 'ai-medical-assistant',
    }


def _call_dify_httpx(url: str, api_key: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    with httpx.Client(timeout=40.0) as client:
        resp = client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        return resp.json()


def _call_dify_curl(url: str, api_key: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    cmd = [
        'curl.exe',
        '--silent',
        '--show-error',
        '--fail',
        '--location',
        '-X',
        'POST',
        url,
        '-H',
        f'Authorization: Bearer {api_key}',
        '-H',
        'Content-Type: application/json',
        '-d',
        json.dumps(payload, ensure_ascii=False),
    ]
    out = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(out.stdout)


def get_doctor_response(doctor_name: str, history: list, prompt: str) -> dict:
    if not settings.DIFY_API_KEY:
        return {
            'text': '(模拟回复) Dify 未配置，收到你的问题：' + prompt,
            'riskWarning': '系统未配置 DIFY_API_KEY',
            'suggestions': ['我该注意什么？', '是否需要就医？', '谢谢'],
            'recommendations': [],
        }

    history_text = _build_history_text(history)
    payload = _build_payload(doctor_name, history_text, prompt)
    url = f"{settings.DIFY_API_BASE_URL.rstrip('/')}/chat-messages"

    try:
        data = _call_dify_httpx(url, settings.DIFY_API_KEY, payload)
    except Exception as e1:
        try:
            data = _call_dify_curl(url, settings.DIFY_API_KEY, payload)
        except Exception as e2:
            return {
                'text': f'调用 Dify 失败：httpx={e1}; curl={e2}',
                'riskWarning': '系统调用异常，请稍后重试或联系管理员。',
                'suggestions': [],
                'recommendations': [],
            }

    answer = (data.get('answer') or '').strip()
    if not answer:
        answer = '我已收到你的问题，请补充更多症状细节，便于更准确判断。'

    return {
        'text': answer,
        'riskWarning': 'AI 建议仅供参考，如症状加重请及时线下就医。',
        'suggestions': ['我该注意什么？', '是否需要做检查？', '谢谢'],
        'recommendations': [],
    }

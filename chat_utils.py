import os
import requests
import logging
from typing import Dict, Any

PERPLEXITY_API_KEY = os.environ.get('PERPLEXITY_API_KEY')
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

def get_chat_response(user_message: str) -> Dict[str, Any]:
    system_message = """You are the California Voting Guide, a friendly and helpful assistant that provides 
    neutral information about voting in California. Use simple language (8th grade reading level) and keep 
    responses under 3 sentences. Always cite official sources."""

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "llama-3.1-sonar-small-128k-online",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.2,
        "max_tokens": 150,
        "top_p": 0.9,
        "stream": False
    }

    try:
        if not PERPLEXITY_API_KEY:
            raise ValueError("Perplexity API key not found")

        response = requests.post(PERPLEXITY_API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()

        return {
            'message': result['choices'][0]['message']['content'],
            'citations': result.get('citations', []),
            'success': True
        }
    except Exception as e:
        logging.error(f"Error getting chat response: {str(e)}")
        return {
            'message': "Bear with me! Let's try another question.",
            'citations': [],
            'success': False
        }
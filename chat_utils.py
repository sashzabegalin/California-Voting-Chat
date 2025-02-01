import os
import requests
import logging
from typing import Dict, Any

PERPLEXITY_API_KEY = os.environ.get('PERPLEXITY_API_KEY')
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

def get_chat_response(user_message: str) -> Dict[str, Any]:
    system_message = """You are Cal Bear, a friendly and approachable California Voting Guide assistant. 
    Your personality traits:
    - Warm and encouraging, like a helpful friend
    - Use simple, everyday language (8th grade reading level)
    - Always maintain a positive, supportive tone

    Content Rules:
    1. Keep responses under 3 sentences
    2. For lists, use bullet points (maximum 5 items)
    3. For propositions:
       - Start with a neutral summary
       - Include "A YES vote means..." 
       - Include "A NO vote means..."

    Banned words: "Liberal," "Conservative," "Woke," "Extremist"
    Always start responses with official sources when providing information."""

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
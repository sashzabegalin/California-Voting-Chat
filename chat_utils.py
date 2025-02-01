import os
import requests
import logging
from typing import Dict, Any

PERPLEXITY_API_KEY = os.environ.get('PERPLEXITY_API_KEY')
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

def get_chat_response(user_message: str) -> Dict[str, Any]:
    system_message = """You are Bear Bot 🐻, a California Voting Guide assistant focusing ONLY on California voting information.

    Response Guidelines:
    - Focus exclusively on California voting information
    - Do not reference voting practices from other states
    - Double-check all information against California Secretary of State guidelines
    - If unsure about California-specific details, mention that information is unavailable

    Content Rules:
    1. Keep responses under 3 sentences for each point
    2. For lists:
        - Each item should start with a relevant emoji
        - Maximum 5 items
        - One line per item
        - No bullet points or numbers
    3. For propositions:
        - Start with a neutral California-specific summary
        - Use "✅ A YES vote means..."
        - Use "❌ A NO vote means..."

    Formatting:
    - Never use markdown formatting (no **, -, #, etc.)
    - Begin each list item with an emoji
    - Remove "Hi there!" or similar greetings from responses

    Banned words: "Liberal," "Conservative," "Woke," "Extremist"
    Always cite official California sources when providing information."""

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
            'message': "Bear with me! 🐻 Let's try another question.",
            'citations': [],
            'success': False
        }
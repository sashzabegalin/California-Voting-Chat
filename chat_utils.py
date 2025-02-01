import os
import requests
import logging
from typing import Dict, Any

PERPLEXITY_API_KEY = os.environ.get('PERPLEXITY_API_KEY')
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

def get_chat_response(user_message: str) -> Dict[str, Any]:
    system_message = """You are Bear Bot 🐻, a fun and friendly California voting guide! Your job is to make voting information engaging and easy to understand.

    Your Personality:
    🌟 Be enthusiastic but professional
    🎯 Keep things simple and clear
    🎨 Use emojis creatively to make points stand out
    🗣️ Talk like a friendly park ranger - knowledgeable but approachable

    Content Style:
    1. Start responses with an engaging opener (e.g., "Great question!" or "I'd love to help with that!")
    2. For lists:
        🎯 Each point starts with a relevant emoji 
        🎯 One point per line
        🎯 Maximum 5 points
        🎯 No numbers or bullet points
    3. For propositions:
        🎯 Start with a clear California summary
        ✅ Use "A YES vote means..."
        ❌ Use "A NO vote means..."

    Interactive Flow:
    1. Always end your response with 2-3 relevant follow-up questions
    2. Each follow-up question should:
        🔍 Be closely related to the current topic
        📚 Help users dive deeper into California voting info
        🎯 Start with an emoji

    Example Response Format:
    "I'd love to help with that! 🐻

    Here's how to vote in California:
    🗳️ Register online at RegisterToVote.ca.gov
    📅 Registration deadline is 15 days before election day
    📍 Find your polling place through the CA Secretary of State website

    Would you like to know more about:
    🔍 What ID you need to register?
    📅 When the next election is?
    📬 How to vote by mail?"

    Information Rules:
    🎯 ONLY provide California-specific voting information
    🎯 If unsure about California details, say "I can only share verified California voting information"
    🎯 Always cite official California sources
    🎯 No markdown formatting

    Banned words: Liberal, Conservative, Woke, Extremist
    """

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
        "temperature": 0.7,
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
            'message': "Whoops! 🐻 Even bears have their off moments. Let's try another question!",
            'citations': [],
            'success': False
        }
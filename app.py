import os
from flask import Flask, render_template, jsonify, request
from chat_utils import get_chat_response
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "california_voting_guide_secret")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        language = request.json.get('language', 'en')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        response = get_chat_response(user_message, language)
        return jsonify(response)
    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/get_election_countdown', methods=['GET'])
def get_election_countdown():
    # Hardcoded next election date for demonstration
    return jsonify({
        'days': 125,  # This would be calculated dynamically in production
        'registration_open': True
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
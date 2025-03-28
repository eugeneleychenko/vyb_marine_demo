import os
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Explicitly get the Anthropic API key from environment variables
anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")
if not anthropic_api_key:
    raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

# Remove any accidental whitespace
anthropic_api_key = anthropic_api_key.strip()

# Initialize Anthropic client
client = Anthropic(api_key=anthropic_api_key)

# Simple hello world example
def hello_world():
    try:
        response = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=1000,
            temperature=0,
            system="You are a helpful assistant.",
            messages=[{"role": "user", "content": "Say hello world!"}]
        )
        # Just return the message text rather than printing the full response
        return response.content[0].text
    except Exception as e:
        return f"Error calling Anthropic API: {e}"

# Run the hello world example
if __name__ == "__main__":
    message = hello_world()
    print(message)

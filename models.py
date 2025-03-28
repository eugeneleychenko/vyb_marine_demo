import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic()

client.models.list(limit=20)
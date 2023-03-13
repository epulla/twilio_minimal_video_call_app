import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass
class Config:
    TWILIO_ACCOUNT_SID: str
    TWILIO_API_KEY_SID: str
    TWILIO_API_KEY_SECRET: str


def get_config():
    load_dotenv()
    return Config(
        TWILIO_ACCOUNT_SID=os.getenv('TWILIO_ACCOUNT_SID'),
        TWILIO_API_KEY_SID=os.getenv('TWILIO_API_KEY_SID'),
        TWILIO_API_KEY_SECRET=os.getenv('TWILIO_API_KEY_SECRET')
    )

import uuid

from config import get_config
from constants import VideoCallType, StringSeparator

from flask import Flask, render_template, request
import twilio.jwt.access_token
import twilio.jwt.access_token.grants
import twilio.rest

app = Flask(__name__)
config = get_config()
twilio_client = twilio.rest.Client(
    config.TWILIO_API_KEY_SID,
    config.TWILIO_API_KEY_SECRET,
    config.TWILIO_ACCOUNT_SID
)
# Helps as a separator between participants' real name and uuid
identity_separator = StringSeparator.COMMA.value


def find_or_create_room(room_name: str):
    """
    Try to fetch an existing room with 'name'. If not, create a new P2P one
    """
    try:
        twilio_client.video.rooms(room_name).fetch()
    except twilio.base.exceptions.TwilioRestException:
        twilio_client.video.rooms.create(unique_name=room_name, type=VideoCallType.P2P.value)


def get_access_token(room_name: str, participant_name: str):
    """
    Create and return an access token
    """
    access_token = twilio.jwt.access_token.AccessToken(
        config.TWILIO_ACCOUNT_SID,
        config.TWILIO_API_KEY_SID,
        config.TWILIO_API_KEY_SECRET,
        identity=f"{participant_name}{identity_separator}{uuid.uuid4().int}"
    )
    video_grant = twilio.jwt.access_token.grants.VideoGrant(room=room_name)
    access_token.add_grant(video_grant)
    return access_token


@app.route("/")
def serve_homepage():
    return render_template("index.html", identity_separator=identity_separator)


@app.route("/join-room", methods=["POST"])
def join_room():
    # Extract room_name and participant_name from POST call
    room_name = request.json.get("room_name")
    participant_name = request.json.get("participant_name")
    
    # Get an access token from a created/found Twilio room
    find_or_create_room(room_name)
    access_token = get_access_token(room_name, participant_name)

    return {"token": access_token.to_jwt()}


# Start the server when this file runs
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)

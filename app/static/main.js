const form = document.getElementById("room-name-form");
const roomNameInput = document.getElementById("room-name-input");
const participantNameInput = document.getElementById("participant-name-input");
const container = document.getElementById("video-container");

const startRoom = async (event) => {
  event.preventDefault();
  // Remove #initial-placeholder from page
  document.getElementById('initial-placeholder').style.display = "none";

  // Get roomName and participantName from <form>
  const roomName = roomNameInput.value;
  const participantName = participantNameInput.value;

  // Set roomName header
  document.getElementById("room-name-header").innerHTML = roomName;

  // Fetch an Access Token from the /join-room route
  const response = await fetch("/join-room", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room_name: roomName,
      participant_name: participantName,
    }),
  });
  const { token } = await response.json();

  // Join the video room with the token
  const room = await joinVideoRoom(roomName, token);

  handleConnectedParticipant(room.localParticipant);
  room.participants.forEach(handleConnectedParticipant);
  room.on("participantConnected", handleConnectedParticipant);

  // Handle cleanup when a participant disconnects
  room.on("participantDisconnected", handleDisconnectedParticipant);
  window.addEventListener("beforeunload", () => room.disconnect());
  window.addEventListener("pagehide", () => room.disconnect());
};

const handleConnectedParticipant = (participant) => {
  // Create a div for this participant's tracks
  const participantDiv = document.createElement("div");
  const participantNameNode = document.createElement("h2");
  // Var 'identity_separator' is located at index.html
  participantNameNode.innerHTML =
    participant.identity.split(identity_separator)[0];
  participantDiv.appendChild(participantNameNode);
  participantDiv.setAttribute("id", participant.identity);
  container.appendChild(participantDiv);

  // Iterate through the participant's published tracks and call `handleTrackPublication` on them
  participant.tracks.forEach((trackPublication) => {
    handleTrackPublication(trackPublication, participant);
  });

  // Listen for any new track publications
  participant.on("trackPublished", handleTrackPublication);
};

const handleTrackPublication = (trackPublication, participant) => {
  function displayTrack(track) {
    // Append this track to the participant's div and render it on the page
    const participantDiv = document.getElementById(participant.identity);
    // Note: track.attach creates an HTMLVideoElement or HTMLAudioElement
    // (depending on the type of track) and adds the video or audio stream
    participantDiv.append(track.attach());
  }

  // Check if the trackPublication contains a `track` attribute.
  // If it does, we are subscribed to this track. If not, we are not subscribed.
  if (trackPublication.track) {
    displayTrack(trackPublication.track);
  }

  // listen for any new subscriptions to this track publication
  trackPublication.on("subscribed", displayTrack);
};

const handleDisconnectedParticipant = (participant) => {
  // Stop listening for this participant and remove it from document
  participant.removeAllListeners();
  const participantDiv = document.getElementById(participant.identity);
  participantDiv.remove();
};

const joinVideoRoom = async (roomName, token) => {
  // Join the video room with the Access Token and the given room name
  const room = await Twilio.Video.connect(token, {
    room: roomName,
  });
  return room;
};

form.addEventListener("submit", startRoom);

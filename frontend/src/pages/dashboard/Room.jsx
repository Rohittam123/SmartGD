import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth.js";
import { useRoom } from "../../hooks/useRooms.js";
import { useMediaStream } from "../../hooks/useMediaStream.js";
import { useWebRTC } from "../../hooks/useWebRTC.js";

import {
  joinRoom,
  leaveRoom,
  startRoom,
  endRoom,
  raiseHand,
  lowerHand,
  setActiveSpeaker,
  sendMessage,
  listenToMessages
} from "../../services/roomService.js";

import Card from "../../components/common/Card.jsx";
import ChatPanel from "../../components/room/ChatPanel.jsx";
import ParticipantList from "../../components/room/ParticipantList.jsx";
import ModeratorControls from "../../components/room/ModeratorControls.jsx";
import RemoteStream from "../../components/room/RemoteStream.jsx";
import SpeechPanel from "../../components/room/SpeechPanel.jsx";
import Timer from "../../components/room/Timer.jsx";
import VideoStream from "../../components/room/VideoStream.jsx";

export default function Room() {

  const { roomId } = useParams();

  const { room, loading } = useRoom(roomId);

  const { firebaseUser, profile } = useAuth();

  const navigate = useNavigate();

  const [chatMessages, setChatMessages] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [mediaAutoStartAttempted, setMediaAutoStartAttempted] = useState(false);

  const isParticipant = room?.participants?.includes(firebaseUser?.uid);
  const isHost = room?.createdBy === firebaseUser?.uid;
  const canJoin = Boolean(firebaseUser && room && !isParticipant);

  const {
    localStream,
    localVideoRef,
    audioEnabled,
    videoEnabled,
    error: mediaError,
    isInitialized,
    startMediaStream,
    stopMediaStream,
    toggleAudio,
    toggleVideo
  } = useMediaStream();

  const { remoteStreams } = useWebRTC({
    roomId,
    localStream,
    userId: firebaseUser?.uid,
    participants: room?.participants || []
  });

  useEffect(() => {
    if (isParticipant && !isInitialized && !localStream && !mediaAutoStartAttempted) {
      setMediaAutoStartAttempted(true);
      startMediaStream().catch(() => {
        // If media cannot start, errors are handled inside the hook.
      });
    }
  }, [isParticipant, isInitialized, localStream, startMediaStream, mediaAutoStartAttempted]);
  // 🔥 REALTIME MESSAGE LISTENER
  useEffect(() => {
    if (!roomId || !firebaseUser) {
      return;
    }

    const unsubscribe = listenToMessages(roomId, (messages) => {
      const formattedMessages = messages.map((message) => ({
        id: message.id,
        sender: message.senderName || "Anonymous",
        text: message.text,
        timestamp:
          message.createdAt && message.createdAt.toDate
            ? message.createdAt.toDate().toLocaleTimeString()
            : message.createdAt || "Now"
      }));

      setChatMessages(formattedMessages);
    });

    return () => unsubscribe();
  }, [roomId, firebaseUser]);

  async function handleJoin() {

    setActionLoading(true);

    try {

      await joinRoom(roomId, firebaseUser.uid);

      setMediaAutoStartAttempted(true);
      const stream = await startMediaStream();

      if (stream) {
        toast.success("You joined the room.");
      } else {
        toast.error("You joined the room, but your camera and microphone could not start. Check the message below and retry.");
      }

    } catch (error) {

      toast.error(error.message || "Unable to join room.");

    } finally {

      setActionLoading(false);
    }
  }

  async function handleLeave() {

    setActionLoading(true);

    try {

      await stopMediaStream();
      setMediaAutoStartAttempted(false);

      await leaveRoom(roomId, firebaseUser.uid);

      toast.success("You left the room.");

      navigate("/rooms/join");

    } catch (error) {

      toast.error(error.message || "Unable to leave room.");

    } finally {

      setActionLoading(false);
    }
  }

  async function handleAction(action) {

    setActionLoading(true);

    try {

      if (action === "start") {

        await startRoom(roomId);

        toast.success("Room started.");
      }

      if (action === "end") {

        await endRoom(roomId);

        toast.success("Room ended.");
      }

      if (action === "raise") {

        await raiseHand(roomId, firebaseUser.uid);

        toast.success("Hand raised.");
      }

      if (action === "lower") {

        await lowerHand(roomId, firebaseUser.uid);

        toast.success("Raised hands cleared.");
      }

      if (action === "speaker") {

        await setActiveSpeaker(roomId, firebaseUser.uid);

        toast.success("You are now the active speaker.");
      }

    } catch (error) {

      toast.error(error.message || "Action failed.");

    } finally {

      setActionLoading(false);
    }
  }

  // 🔥 REALTIME MESSAGE SEND
  async function handleMessageSubmit(message) {
    const optimisticMessage = {
      id: `local-${Date.now()}`,
      sender: profile?.name || "Anonymous",
      text: message,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages((current) => [...current, optimisticMessage]);

    try {
      await sendMessage(roomId, {
        senderId: firebaseUser.uid,
        senderName: profile?.name || "Anonymous",
        text: message
      });
    } catch (error) {
      toast.error("Unable to send message.");
    }
  }

  if (loading) {

    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-slate-400">Loading room details...</p>
      </div>
    );
  }

  if (!room) {

    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300">
        <p>
          Room not found. Please return to{" "}
          <span
            className="cursor-pointer text-neon-blue"
            onClick={() => navigate("/rooms/join")}
          >
            Join Room
          </span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ROOM HEADER */}
      <Card className="space-y-5 p-8">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">
              Room code
            </p>

            <h1 className="mt-3 text-3xl font-semibold text-white">
              {room.code}
            </h1>

            <p className="mt-2 text-slate-400">
              {room.topic}
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            {isParticipant ? (

              <button
                type="button"
                onClick={handleLeave}
                disabled={actionLoading}
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                Leave room
              </button>

            ) : (

              <button
                type="button"
                onClick={handleJoin}
                disabled={!canJoin || actionLoading}
                className="rounded-3xl border border-white/10 bg-neon-blue px-4 py-3 text-sm text-white transition hover:bg-neon-blue/90 disabled:opacity-60"
              >
                Join room
              </button>

            )}

            <span className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {room.status}
            </span>

          </div>
        </div>
      </Card>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">

        {/* LEFT SIDE */}
        <div className="space-y-6">

          {isParticipant && (
            <>
              <VideoStream
                localVideoRef={localVideoRef}
                audioEnabled={audioEnabled}
                videoEnabled={videoEnabled}
                error={mediaError}
                isInitialized={isInitialized}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onLeave={handleLeave}
                onRetry={startMediaStream}
                userName={profile?.name}
              />

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Live discussion</h2>
                    <p className="text-sm text-slate-400">Audio/video from participants in the room</p>
                  </div>
                </div>
                {remoteStreams.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {remoteStreams.map(({ peerId, stream }) => (
                      <RemoteStream key={peerId} peerId={peerId} stream={stream} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Waiting for other participants to join the discussion...</p>
                )}
              </div>
            </>
          )}

          {/* CHAT */}
          <ChatPanel
            messages={chatMessages}
            onSend={handleMessageSubmit}
            loading={actionLoading}
          />

          {/* MOD CONTROLS */}
          <ModeratorControls
            isHost={isHost}
            room={room}
            onStart={() => handleAction("start")}
            onEnd={() => handleAction("end")}
            onRaiseHand={() => handleAction("raise")}
            onLowerHand={() => handleAction("lower")}
            onSetSpeaker={() => handleAction("speaker")}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          <ParticipantList
            participants={room.participants || []}
          />

          <SpeechPanel activeSpeaker={room.activeSpeaker} />

          <Timer
            minutes={room.timerMinutes}
            status={room.status}
          />
        </div>
      </div>
    </div>
  );
}
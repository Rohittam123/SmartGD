import { useEffect, useRef, useState } from "react";
import { listenToSignals, sendSignal } from "../services/roomService.js";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" }
];

function createPeerConnection({ roomId, userId, peerId, localStream, onRemoteStream, peerConnections }) {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  pc.pendingIceCandidates = [];

  const flushPendingIce = async () => {
    if (!pc.pendingIceCandidates.length || !pc.remoteDescription || !pc.remoteDescription.type) {
      return;
    }

    const pending = [...pc.pendingIceCandidates];
    pc.pendingIceCandidates = [];

    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (error) {
        console.warn("Failed to add queued ICE candidate:", error);
      }
    }
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal(roomId, {
        type: "ice",
        from: userId,
        to: peerId,
        payload: event.candidate
      }).catch(() => {
        // ignore
      });
    }
  };

  pc.onnegotiationneeded = async () => {
    if (pc.signalingState !== "stable") {
      return;
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal(roomId, {
        type: "offer",
        from: userId,
        to: peerId,
        payload: pc.localDescription
      });
    } catch (error) {
      console.warn("WebRTC negotiation failed:", error);
    }
  };

  if (localStream) {
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  }

  const remoteStream = new MediaStream();

  pc.ontrack = (event) => {
    const stream = event.streams[0] || remoteStream;

    if (!event.streams[0]) {
      stream.addTrack(event.track);
    }

    onRemoteStream(peerId, stream);
  };

  pc.flushPendingIce = flushPendingIce;

  pc.onconnectionstatechange = () => {
    const state = pc.connectionState;

    if (state === "failed" || state === "disconnected" || state === "closed") {
      pc.close();
      peerConnections.current.delete(peerId);
    }
  };

  peerConnections.current.set(peerId, pc);
  return pc;
}

function closePeerConnection(peerId, peerConnections, onRemoveStream) {
  const pc = peerConnections.current.get(peerId);

  if (pc) {
    pc.close();
    peerConnections.current.delete(peerId);
    onRemoveStream(peerId);
  }
}

export function useWebRTC({ roomId, localStream, userId, participants = [] }) {
  const peerConnections = useRef(new Map());
  const handledSignalIds = useRef(new Set());
  const pendingSignals = useRef([]);
  const [remoteStreams, setRemoteStreams] = useState([]);

  const addOrUpdateRemoteStream = (peerId, stream) => {
    setRemoteStreams((current) => {
      const existing = current.find((item) => item.peerId === peerId);
      if (existing) {
        return current.map((item) => (item.peerId === peerId ? { peerId, stream } : item));
      }
      return [...current, { peerId, stream }];
    });
  };

  const removeRemoteStream = (peerId) => {
    setRemoteStreams((current) => current.filter((item) => item.peerId !== peerId));
  };

  const handleSignal = async (signal) => {
    const { from, type, payload } = signal;

    if (from === userId) {
      return;
    }

    let pc = peerConnections.current.get(from);

    if (!pc) {
      pc = createPeerConnection({
        roomId,
        userId,
        peerId: from,
        localStream,
        onRemoteStream: addOrUpdateRemoteStream,
        peerConnections
      });
    }

    try {
      if (type === "offer") {
        await pc.setRemoteDescription(payload);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await pc.flushPendingIce();
        await sendSignal(roomId, {
          type: "answer",
          from: userId,
          to: from,
          payload: pc.localDescription
        });
      }

      if (type === "answer") {
        await pc.setRemoteDescription(payload);
        await pc.flushPendingIce();
      }

      if (type === "ice") {
        if (!pc.remoteDescription || !pc.remoteDescription.type) {
          pc.pendingIceCandidates.push(payload);
        } else {
          await pc.addIceCandidate(payload);
        }
      }
    } catch (error) {
      console.warn("WebRTC signal handling failed:", error);
      closePeerConnection(from, peerConnections, removeRemoteStream);
    }
  };

  useEffect(() => {
    if (!roomId || !userId) {
      return undefined;
    }

    const createOfferForPeer = async (peerId) => {
      if (peerConnections.current.has(peerId)) {
        return;
      }

      createPeerConnection({
        roomId,
        userId,
        peerId,
        localStream,
        onRemoteStream: addOrUpdateRemoteStream,
        peerConnections
      });
    };

    const remotePeers = participants.filter((participantId) => participantId !== userId);

    remotePeers.forEach((peerId) => {
      if (!peerConnections.current.has(peerId) && userId < peerId) {
        createOfferForPeer(peerId);
      }
    });
  }, [roomId, userId, localStream, participants]);

  useEffect(() => {
    if (!roomId || !userId) {
      return undefined;
    }

    let isInitialSnapshot = true;

    const unsubscribe = listenToSignals(roomId, userId, async (signals) => {
      if (isInitialSnapshot) {
        signals.forEach((signal) => {
          if (signal.id) {
            handledSignalIds.current.add(signal.id);
          }
        });
        isInitialSnapshot = false;
        return;
      }

      for (const signal of signals) {
        if (!signal.id || handledSignalIds.current.has(signal.id)) {
          continue;
        }

        if (!localStream) {
          pendingSignals.current.push(signal);
          continue;
        }

        handledSignalIds.current.add(signal.id);
        await handleSignal(signal);
      }
    });

    return () => unsubscribe();
  }, [roomId, userId, localStream]);

  useEffect(() => {
    if (!localStream || !pendingSignals.current.length) {
      return undefined;
    }

    const processPending = async () => {
      const queuedSignals = [...pendingSignals.current];
      pendingSignals.current = [];

      for (const signal of queuedSignals) {
        if (!signal.id || handledSignalIds.current.has(signal.id)) {
          continue;
        }

        handledSignalIds.current.add(signal.id);
        await handleSignal(signal);
      }
    };

    processPending().catch((error) => {
      console.warn("Failed to process queued WebRTC signals:", error);
    });
  }, [localStream]);

  useEffect(() => {
    if (!localStream) {
      return undefined;
    }

    peerConnections.current.forEach((pc) => {
      if (!pc || pc.connectionState === "closed" || pc.signalingState === "closed") {
        return;
      }

      const existingKinds = pc.getSenders()
        .map((sender) => sender.track?.kind)
        .filter(Boolean);

      localStream.getTracks().forEach((track) => {
        if (!existingKinds.includes(track.kind)) {
          try {
            pc.addTrack(track, localStream);
          } catch (error) {
            console.warn("Failed to add local track to peer connection:", error);
          }
        }
      });
    });
  }, [localStream]);

  useEffect(() => {
    if (!roomId || !userId) {
      return undefined;
    }

    const currentPeerIds = participants.filter((peerId) => peerId !== userId);

    Array.from(peerConnections.current.keys()).forEach((peerId) => {
      if (!currentPeerIds.includes(peerId)) {
        closePeerConnection(peerId, peerConnections, removeRemoteStream);
      }
    });
  }, [participants, roomId, userId]);

  useEffect(() => {
    return () => {
      Array.from(peerConnections.current.keys()).forEach((peerId) => {
        closePeerConnection(peerId, peerConnections, removeRemoteStream);
      });
    };
  }, [roomId]);

  return {
    remoteStreams
  };
}

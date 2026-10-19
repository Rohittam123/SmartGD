import { useEffect, useState } from "react";
import {
  listenToRoomMessages,
  listenToTranscripts
} from "../services/messageService.js";

export function useRealtimeMessages(roomId) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }

    const unsubscribe = listenToRoomMessages(roomId, setMessages);

    return () => unsubscribe();
  }, [roomId]);

  return messages;
}

export function useRealtimeTranscripts(roomId) {
  const [transcripts, setTranscripts] = useState([]);

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }

    const unsubscribe = listenToTranscripts(roomId, setTranscripts);

    return () => unsubscribe();
  }, [roomId]);

  return transcripts;
}

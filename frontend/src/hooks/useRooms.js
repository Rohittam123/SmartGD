import { useEffect, useState } from "react";
import { listenToPublicRooms, listenToRoom } from "../services/roomService.js";

export function usePublicRooms(enabled = true) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));

  useEffect(() => {
    if (!enabled) {
      setRooms([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = listenToPublicRooms((items) => {
      setRooms(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [enabled]);

  return {
    rooms,
    loading
  };
}

export function useRoom(roomId, enabled = true) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(Boolean(roomId && enabled));

  useEffect(() => {
    if (!roomId || !enabled) {
      setRoom(null);
      setLoading(Boolean(roomId && enabled));
      return undefined;
    }

    setLoading(true);
    const unsubscribe = listenToRoom(roomId, (item) => {
      setRoom(item);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, enabled]);

  return {
    room,
    loading
  };
}

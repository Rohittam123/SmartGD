import { useCallback, useEffect, useRef, useState } from "react";

export function useMediaStream() {
  const [localStream, setLocalStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const startPromiseRef = useRef(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;

      localVideoRef.current.play().catch((playError) => {
        console.warn("Unable to start local video playback:", playError);
      });
    }

    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [localStream]);

  const startMediaStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    if (startPromiseRef.current) {
      return startPromiseRef.current;
    }

    const startPromise = (async () => {
      try {
        setError(null);
        setIsInitialized(false);

        if (typeof window !== "undefined" && !window.isSecureContext) {
          throw new Error(
            "Camera and microphone access requires a secure connection. Open this site using HTTPS or localhost."
          );
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "This browser does not support camera and microphone access. Use an up-to-date version of Chrome, Firefox, Safari, or Edge."
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true
        });

        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        if (videoTracks.length === 0 || audioTracks.length === 0) {
          stream.getTracks().forEach((track) => track.stop());
          throw new Error("A camera and microphone are both required to join this discussion.");
        }

        videoTracks.forEach((track) => {
          track.enabled = true;
        });

        audioTracks.forEach((track) => {
          track.enabled = true;
        });

        localStreamRef.current = stream;
        setAudioEnabled(true);
        setVideoEnabled(true);
        setLocalStream(stream);
        setIsInitialized(true);
        return stream;
      } catch (err) {
        console.error("Unable to access camera or microphone:", err);

        let errorMessage;
        switch (err?.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
          case "SecurityError":
            errorMessage = `Camera or microphone permission is blocked for ${window.location.origin}. Allow both devices in your browser's site settings, then retry.`;
            break;
          case "NotFoundError":
          case "DevicesNotFoundError":
            errorMessage = "No camera or microphone was found. Connect both devices and retry.";
            break;
          case "NotReadableError":
          case "TrackStartError":
          case "AbortError":
            errorMessage =
              "The camera or microphone could not be started. Close other apps using them, check your device connections, and retry.";
            break;
          case "OverconstrainedError":
            errorMessage =
              "The camera does not support the requested settings. Check that it is connected and retry.";
            break;
          default:
            errorMessage =
              err?.message ||
              "Failed to access the camera and microphone. Check your device connections and permissions, then retry.";
        }

        setError(errorMessage);
        setIsInitialized(false);
        return null;
      }
    })();

    startPromiseRef.current = startPromise;
    try {
      return await startPromise;
    } finally {
      startPromiseRef.current = null;
    }
  }, []);

  const stopMediaStream = useCallback(async () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setIsInitialized(false);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  function toggleAudio(enable) {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = enable;
      });
      setAudioEnabled(enable);
    }
  }

  function toggleVideo(enable) {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = enable;
      });
      setVideoEnabled(enable);
    }
  }

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    };
  }, []);

  return {
    localStream,
    localVideoRef,
    audioEnabled,
    videoEnabled,
    error,
    isInitialized,
    startMediaStream,
    stopMediaStream,
    toggleAudio,
    toggleVideo
  };
}

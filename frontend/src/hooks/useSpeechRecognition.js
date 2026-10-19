import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechRecognition({ continuous = true, interimResults = true } = {}) {
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    setSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const chunk = event.results[index][0].transcript;

        if (event.results[index].isFinal) {
          finalText += chunk;
        } else {
          interimText += chunk;
        }
      }

      if (finalText) {
        setTranscript((previous) => `${previous} ${finalText}`.trim());
      }

      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      setError(event.error || "Speech recognition error.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [continuous, interimResults]);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) {
      return;
    }

    setError("");
    recognitionRef.current.start();
    setListening(true);
  }, [listening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current || !listening) {
      return;
    }

    recognitionRef.current.stop();
    setListening(false);
  }, [listening]);

  const reset = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError("");
  }, []);

  return {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset
  };
}

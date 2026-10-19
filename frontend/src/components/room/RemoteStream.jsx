import { useEffect, useRef } from "react";

export default function RemoteStream({ peerId, stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const element = videoRef.current;

    if (element && stream) {
      element.srcObject = stream;
      element.volume = 1;
      element.onloadedmetadata = () => {
        const playPromise = element.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {
            // Ignore autoplay errors after user interaction.
          });
        }
      };
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/80">
      <div className="relative h-44 bg-slate-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="border-t border-white/10 px-4 py-3 text-sm text-slate-200">
        <p className="font-medium">Participant</p>
        <p className="text-slate-400 truncate">{peerId}</p>
      </div>
    </div>
  );
}

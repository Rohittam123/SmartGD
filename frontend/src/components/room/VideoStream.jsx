import { Mic, MicOff, Video, VideoOff, Phone, RefreshCw } from "lucide-react";

export default function VideoStream({ 
  localVideoRef, 
  audioEnabled, 
  videoEnabled, 
  error,
  isInitialized,
  onToggleAudio, 
  onToggleVideo,
  onLeave,
  onRetry,
  userName 
}) {
  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-500/50 bg-red-900/10 p-6 text-center space-y-4">
        <p className="text-red-400 font-semibold">⚠️ Camera/Microphone Error</p>
        <p className="text-slate-400 text-sm">{error}</p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 rounded-full bg-neon-blue hover:bg-neon-blue/90 text-white px-4 py-2 text-sm transition"
          >
            <RefreshCw size={16} />
            Retry
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 text-sm transition"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-[2rem] border border-white/10 bg-black shadow-glow overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {isInitialized ? (
          <>
            <video
              ref={localVideoRef}
              autoPlay={true}
              playsInline={true}
              muted={true}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
              className="bg-black"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <p className="text-white text-sm font-medium">{userName || "You"}</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black">
            <div className="h-12 w-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-300">Loading camera...</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button
          type="button"
          onClick={() => onToggleAudio(!audioEnabled)}
          disabled={!isInitialized}
          className={`flex items-center gap-2 rounded-full px-4 py-2 transition text-sm font-medium ${
            audioEnabled
              ? "bg-neon-blue text-white hover:bg-neon-blue/90"
              : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
          {audioEnabled ? "Mic On" : "Mic Off"}
        </button>

        <button
          type="button"
          onClick={() => onToggleVideo(!videoEnabled)}
          disabled={!isInitialized}
          className={`flex items-center gap-2 rounded-full px-4 py-2 transition text-sm font-medium ${
            videoEnabled
              ? "bg-neon-blue text-white hover:bg-neon-blue/90"
              : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {videoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
          {videoEnabled ? "Camera On" : "Camera Off"}
        </button>

        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-red-400 hover:bg-red-500/30 border border-red-500/50 transition text-sm font-medium"
        >
          <Phone size={16} />
          Leave
        </button>
      </div>
    </div>
  );
}

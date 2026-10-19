import { useState } from "react";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";

export default function ChatPanel({ messages = [], onSend, loading }) {
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    onSend?.(message.trim());
    setMessage("");
  }

  return (
    <section className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Live chat</h2>
        <p className="text-sm text-slate-400">Room interaction</p>
      </div>
      <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/80 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">No messages yet. Share your thoughts to get started.</p>
        ) : (
          messages.map((item, index) => (
            <div key={index} className="rounded-3xl bg-white/5 p-4 text-sm leading-6 text-slate-200">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
                <span>{item.name || item.sender}</span>
                <span>{item.timestamp || "Now"}</span>
              </div>
              <p>{item.text}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <Input textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message to the group..." />
        <Button type="submit" loading={loading} className="self-end">Send message</Button>
      </form>
    </section>
  );
}



import { useState } from "react";
import { Send } from "lucide-react";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import Card from "../common/Card.jsx";

export default function MentorChat({ messages = [], onSend, loading }) {
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
    <Card className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Mentor Chat</h2>
        <p className="mt-2 text-sm text-slate-400">
          Ask the mentor for feedback, tips, and speaking prompts.
        </p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Start the conversation with your first question.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((entry, index) => (
              <div key={`${entry.role}-${index}`} className={`rounded-3xl border p-4 ${entry.role === "assistant" ? "border-neon-blue/20 bg-slate-950/40" : "border-white/10 bg-white/5"}`}>
                <div className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  {entry.role === "assistant" ? "Mentor" : "You"}
                </div>
                <p className="whitespace-pre-line text-sm text-slate-200">{entry.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <Input
          textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your question for the mentor..."
          className="resize-none"
        />
        <Button type="submit" loading={loading} className="self-end">
          Send question <Send size={16} />
        </Button>
      </form>
    </Card>
  );
}



import { useState } from "react";
import { askMentor } from "../../services/aiService.js";
import MentorChat from "../../components/ai/MentorChat.jsx";
import Card from "../../components/common/Card.jsx";

export default function Mentor() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(text) {
    if (!text) {
      return;
    }

    const nextMessages = [...messages, { role: "user", text, sender: "You" }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await askMentor({ message: text, history: nextMessages });
      setMessages((current) => [
        ...current,
        { role: "assistant", text: response?.message || "I am ready to help.", sender: "Mentor" }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: "Failed to fetch mentor response.", sender: "Mentor" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Mentor assistant</h1>
        <p className="mt-3 text-slate-400">Chat with the mentor to refine your ideas and delivery.</p>
      </div>
      <MentorChat messages={messages} onSend={handleSend} loading={loading} />
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">Mentor tips</h2>
        <p className="mt-2 text-slate-400">Ask for topic structure, follow-up questions, and summarized feedback after your practice session.</p>
      </Card>
    </div>
  );
}


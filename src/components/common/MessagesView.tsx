import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { MessageSquare, Send, User, Check, Sparkles, ShieldCheck } from 'lucide-react';

export const MessagesView: React.FC = () => {
  const { messages, sendMessage, activeRole, currentUser } = useApp();
  const [recipientRole, setRecipientRole] = useState<Role>(
    activeRole === 'patient' || activeRole === 'caregiver' ? 'doctor' : 'patient'
  );
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If activeRole changes to recipientRole, pick a different recipient
  useEffect(() => {
    if (recipientRole === activeRole) {
      const fallback: Role = activeRole === 'patient' ? 'doctor' : 'patient';
      setRecipientRole(fallback);
    }
  }, [activeRole]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, recipientRole]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(recipientRole, text);
    setText('');
  };

  const visibleMessages = messages.filter(
    (m) =>
      (m.senderRole === activeRole && m.receiverRole === recipientRole) ||
      (m.senderRole === recipientRole && m.receiverRole === activeRole)
  );

  const availableRecipients: { role: Role; label: string }[] = [
    { role: 'doctor' as Role, label: 'Dr. Maya Rao, MD (Cardiologist)' },
    { role: 'pharmacy' as Role, label: 'PharmD Marcus Chen (MediCare Pharmacy)' },
    { role: 'caregiver' as Role, label: 'Daniel Vance (Son & Caregiver)' },
    { role: 'patient' as Role, label: 'Eleanor Vance (Patient)' },
  ].filter((r) => r.role !== activeRole);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
              Encrypted Channel
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Care Team Secure Messaging
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Direct clinical and caregiver communication channel.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700 text-xs">
          <span className="text-slate-400 pl-1">Chatting with:</span>
          <select
            value={recipientRole}
            onChange={(e) => setRecipientRole(e.target.value as Role)}
            className="bg-slate-900 text-white font-bold p-1.5 rounded-xl border border-slate-700 outline-none"
          >
            {availableRecipients.map((rec) => (
              <option key={rec.role} value={rec.role}>
                {rec.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Chat History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {visibleMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mb-2 text-slate-300" />
              <span>No messages yet in this channel. Send the first message below.</span>
            </div>
          ) : (
            visibleMessages.map((msg) => {
              const isMine = msg.senderRole === activeRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                    <span className="font-bold text-slate-700">{msg.senderName}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                      isMine
                        ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${recipientRole}...`}
            className="flex-1 p-3 rounded-2xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

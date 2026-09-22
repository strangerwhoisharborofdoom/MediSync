import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Mic, MicOff, X, Volume2, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';

interface MediVoiceModalProps {
  onNavigateTab: (tab: string) => void;
}

export const MediVoiceModal: React.FC<MediVoiceModalProps> = ({ onNavigateTab }) => {
  const {
    activeRole,
    patient,
    todaySchedule,
    markDoseTaken,
    createRefillOrder,
    generateAiSummary,
    addToast,
    t,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [audioWaves, setAudioWaves] = useState<number[]>([40, 65, 30, 80, 50, 90, 45, 70]);

  // Waveform animation during listening
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setAudioWaves([
          Math.floor(20 + Math.random() * 80),
          Math.floor(30 + Math.random() * 70),
          Math.floor(15 + Math.random() * 85),
          Math.floor(40 + Math.random() * 60),
          Math.floor(25 + Math.random() * 75),
          Math.floor(50 + Math.random() * 50),
          Math.floor(35 + Math.random() * 65),
          Math.floor(20 + Math.random() * 80),
        ]);
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Setup Web Speech API if supported
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('Listening for command...');
        };

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          processVoiceCommand(text);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setTranscript('Voice recognition paused. Click any prompt below.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn('Speech recognition not available', e);
      }
    }

    // Fallback simulation
    setIsListening(true);
    setTranscript('Simulated microphone listening... Tap a command below.');
    setTimeout(() => {
      setIsListening(false);
    }, 3000);
  };

  const processVoiceCommand = (command: string) => {
    const lower = command.toLowerCase();

    // PATIENT COMMANDS
    if (lower.includes('log') || lower.includes('morning pill') || lower.includes('taken') || lower.includes('amlodipine')) {
      const morningDose = todaySchedule.find((d) => d.id === 'dose-1') || todaySchedule[0];
      markDoseTaken(morningDose.id);
      setAssistantReply(`✓ Logged your morning ${morningDose.medicationName} ${morningDose.dosage} as taken! Adherence streak updated.`);
      return;
    }

    if (lower.includes('show my medicines') || lower.includes('medications') || lower.includes('show medicines')) {
      onNavigateTab('medications');
      setAssistantReply('Navigating to your Medications dashboard.');
      return;
    }

    if (lower.includes('when is my next dose') || lower.includes('next dose') || lower.includes('next pill')) {
      const nextDue = todaySchedule.find((d) => d.status !== 'taken');
      if (nextDue) {
        setAssistantReply(`Your next dose is ${nextDue.medicationName} ${nextDue.dosage} scheduled for ${nextDue.scheduledTime} (${nextDue.foodRule.replace('_', ' ')}).`);
      } else {
        setAssistantReply('All scheduled doses for today have been completed!');
      }
      return;
    }

    if (lower.includes('order a refill') || lower.includes('refill') || lower.includes('supply')) {
      createRefillOrder('med-1', 'routine', 'home_delivery');
      onNavigateTab('refills');
      setAssistantReply('Initiated a 30-day Smart Refill for Amlodipine 5mg. Request transmitted to MediCare Central Pharmacy.');
      return;
    }

    // CAREGIVER COMMANDS
    if (lower.includes('check mom') || lower.includes('status') || lower.includes('eleanor')) {
      setAssistantReply(`Eleanor Vance: 92% adherence, 14-day streak. Blood pressure is steady at 124/79 mmHg. Morning dose was recorded.`);
      return;
    }

    if (lower.includes('missed') || lower.includes('alerts')) {
      onNavigateTab('alerts');
      setAssistantReply('Opening alerts feed. Showing recent adherence and dose monitoring events.');
      return;
    }

    if (lower.includes("today's medications") || lower.includes('today schedule')) {
      onNavigateTab('dashboard');
      setAssistantReply("Displaying Eleanor's medication timeline: Amlodipine 5mg (8 AM), Metformin 500mg (1 PM), Atorvastatin 20mg (8 PM).");
      return;
    }

    // DOCTOR COMMANDS
    if (lower.includes('summarize') || lower.includes('summary') || lower.includes('ai summary')) {
      const summary = generateAiSummary();
      onNavigateTab('reports');
      setAssistantReply(`Generated AI clinical progress summary for ${patient.name}: 30-day adherence ${patient.adherenceRate}%, BP stabilized, readmission risk ${patient.readmissionRiskPercent}%.`);
      return;
    }

    if (lower.includes('high-risk') || lower.includes('attention') || lower.includes('patients')) {
      onNavigateTab('dashboard');
      setAssistantReply('Filtering clinical dashboard to patients needing high attention (Harold Smith, 68% risk).');
      return;
    }

    if (lower.includes('patient history') || lower.includes('history')) {
      onNavigateTab('reports');
      setAssistantReply("Opening Eleanor Vance's full clinical longitudinal history.");
      return;
    }

    // PHARMACY COMMANDS
    if (lower.includes('amoxicillin') || lower.includes('stock') || lower.includes('inventory')) {
      onNavigateTab('inventory');
      setAssistantReply('Amoxicillin 500mg stock query: 45 bottles remaining (2.2 days supply). CRITICAL LOW STOCK WARNING.');
      return;
    }

    if (lower.includes('queue') || lower.includes('refill queue')) {
      onNavigateTab('refills');
      setAssistantReply('Displaying real-time pharmacy refill order queue.');
      return;
    }

    if (lower.includes('deliveries') || lower.includes('tracking') || lower.includes('delivery')) {
      onNavigateTab('refills');
      setAssistantReply('Showing active courier deliveries with live simulated GPS ETA.');
      return;
    }

    // Generic fallback
    setAssistantReply(`Understood: "${command}". Updated relevant care records across the network.`);
    addToast(`MediVoice processed: "${command}"`, 'info');
  };

  // Role specific preset voice prompts
  const rolePrompts: Record<string, string[]> = {
    patient: [
      'Log morning pill',
      'When is my next dose?',
      'Show my medicines',
      'Order a refill',
    ],
    caregiver: [
      "Check Mom's status",
      'Show missed doses',
      "Show today's medications",
    ],
    doctor: [
      'Summarize patient adherence',
      'Show high-risk patients',
      'Open patient history',
    ],
    pharmacy: [
      'Query Amoxicillin stock',
      'Show refill queue',
      "Show today's deliveries",
    ],
  };

  const currentPrompts = rolePrompts[activeRole] || rolePrompts.patient;

  return (
    <>
      {/* Floating Persistent Mic Button (Bottom-right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="medivoice-floating-trigger"
          onClick={() => {
            setIsOpen(true);
            startSpeechRecognition();
          }}
          className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 text-white shadow-xl shadow-teal-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
          title="Open MediVoice Assistant"
          aria-label="MediVoice Assistant"
        >
          {/* Animated pulse rings */}
          <span className="absolute -inset-1 rounded-full bg-teal-400/30 animate-ping pointer-events-none" />
          <span className="absolute -inset-2 rounded-full bg-teal-500/10 pointer-events-none" />

          <Mic className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" />

          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-teal-300 text-[10px] font-bold border border-teal-500/40">
            AI
          </span>
        </button>
      </div>

      {/* Voice Assistant Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            id="medivoice-panel"
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-white">MediVoice Assistant</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500 text-slate-900">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Voice-Activated Care Actions ({activeRole.toUpperCase()})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsListening(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visualizer & Question */}
            <div className="p-6 text-center bg-slate-50 border-b border-slate-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-3 border border-teal-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.howCanIHelp}</span>
              </div>

              {/* Animated Waveform Bars */}
              <div className="h-16 flex items-center justify-center gap-2 my-3">
                {audioWaves.map((height, idx) => (
                  <div
                    key={idx}
                    className="w-2.5 rounded-full bg-gradient-to-t from-teal-600 to-cyan-400 transition-all duration-100 shadow-xs"
                    style={{ height: `${isListening ? height : 12}px` }}
                  />
                ))}
              </div>

              <p className="text-xs font-mono text-slate-500 min-h-5">
                {isListening ? t.listening : transcript || t.speakCommand}
              </p>

              {/* Toggle speech button */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={isListening ? () => setIsListening(false) : startSpeechRecognition}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-sm ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Stop Listening' : 'Tap to Speak'}</span>
                </button>
              </div>
            </div>

            {/* Assistant Response Box */}
            {assistantReply && (
              <div className="p-5 bg-teal-50/70 border-b border-teal-100 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0 mt-0.5">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {assistantReply}
                </div>
              </div>
            )}

            {/* Role-Specific Quick Commands */}
            <div className="p-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Quick {activeRole.toUpperCase()} Voice Commands:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setTranscript(prompt);
                      processVoiceCommand(prompt);
                    }}
                    className="text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/40 text-xs font-medium text-slate-700 transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <CornerDownLeft className="w-3.5 h-3.5 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                      <span>"{prompt}"</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

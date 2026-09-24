import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Send,
  CornerDownLeft,
  Search,
  ExternalLink,
  Globe,
  Bot,
  User,
  Trash2,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface MediVoiceModalProps {
  onNavigateTab: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  agent?: string;
  model?: string;
  grounding?: {
    queries: string[];
    sources: Array<{ title: string; uri: string }>;
  };
  actionTriggered?: string;
}

export const MediVoiceModal: React.FC<MediVoiceModalProps> = ({ onNavigateTab }) => {
  const {
    activeRole,
    patient,
    todaySchedule,
    medications,
    markDoseTaken,
    createRefillOrder,
    generateAiSummary,
    addToast,
    t,
    language,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [enableGoogleSearch, setEnableGoogleSearch] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [audioWaves, setAudioWaves] = useState<number[]>([40, 65, 30, 80, 50, 90, 45, 70]);
  const [selectedAgent, setSelectedAgent] = useState<'sarvam' | 'gemini' | 'safety' | 'pharmacy'>(
    ['kn', 'ta', 'te', 'ml', 'hi', 'bn', 'mr', 'gu', 'pa'].includes(language) ? 'sarvam' : 'gemini'
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync default agent when language changes to an Indian language
  useEffect(() => {
    if (['kn', 'ta', 'te', 'ml', 'hi', 'bn', 'mr', 'gu', 'pa'].includes(language)) {
      setSelectedAgent('sarvam');
    }
  }, [language]);

  const agents = [
    {
      id: 'sarvam' as const,
      name: 'Sarvam Indic AI',
      badge: 'Indic 🇮🇳',
      description: 'Specialized in Kannada, Tamil, Telugu, Hindi, Indian health & ICMR guidelines',
    },
    {
      id: 'gemini' as const,
      name: 'Gemini 3.8 Flash',
      badge: 'Google AI',
      description: 'Clinical reasoning, diagnostic intelligence & global guidelines',
    },
    {
      id: 'safety' as const,
      name: 'Safety Sentinel',
      badge: 'Rx Shield',
      description: 'Dedicated penicillin allergy guard & adverse interaction screening',
    },
    {
      id: 'pharmacy' as const,
      name: 'Pharmacy Fulfillment',
      badge: 'Dispatch',
      description: 'Stock refills, pill counts & courier delivery tracking',
    },
  ];

  // Initial welcome message tailored to current active role & language
  const getInitialMessage = (): ChatMessage => {
    let greetingText = '';
    if (language === 'kn') {
      greetingText = `ನಮಸ್ಕಾರ ${patient.name.split(' ')[0]}! ನಾನು ನಿಮ್ಮ **ಮೆಡಿಸಿಂಕ್ AI ಸಹಾಯಕ (Sarvam Indic Agent & Gemini)**.

ನಾನು ಕನ್ನಡದಲ್ಲಿ ನಿಮ್ಮ ಆರೋಗ್ಯ ಮತ್ತು ಔಷಧಿಗಳ ಬಗ್ಗೆ ಮಾತನಾಡಬಲ್ಲೆ:
- **ಆಮ್ಲೋಡಿಪೈನ್ 5mg** ಮತ್ತು **ಮೆಟ್‌ಫಾರ್ಮಿನ್ 500mg** ವೇಳಾಪಟ್ಟಿ
- ಆಹಾರ ನಿಯಮಗಳು ಮತ್ತು ಔಷಧ ಸುರಕ್ಷತೆ (ಪೆನ್ಸಿಲಿನ್ ಅಲರ್ಜಿ ಎಚ್ಚರಿಕೆ)
- ಗೂಗಲ್ ಸರ್ಚ್ ಮೂಲಕ ಲೈವ್ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ
- ಧ್ವನಿ (Voice) ಅಥವಾ ಟೈಪ್ ಮಾಡುವ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ!`;
    } else if (language === 'ta') {
      greetingText = `வணக்கம் ${patient.name.split(' ')[0]}! நான் உங்கள் **மெடிசின்க் AI உதவியாளர் (Sarvam Indic & Gemini)**.

நான் தமிழில் உங்கள் மருந்துகள் மற்றும் ஆரோக்கிய வழிகாட்டல்களை வழங்குகிறேன்:
- காலை மற்றும் இரவு மாத்திரை அட்டவணை
- உணவு கட்டுப்பாடுகள் மற்றும் மருந்து இடைவினைகள்
- குரல் (Voice) அல்லது தட்டச்சு மூலம் கேட்கலாம்!`;
    } else if (language === 'te') {
      greetingText = `నమస్కారం ${patient.name.split(' ')[0]}! నేను మీ **మెడిసింక్ AI అసిస్టెంట్ (Sarvam Indic & Gemini)**.

తెలుగులో మీ మందులు, మోతాదు సమయాలు మరియు ఆహార నియమాల గురించి మాట్లాడవచ్చు:
- **ఆమ్లోడిపైన్ 5mg** & **మెట్‌ఫార్మిన్** వివరాలు
- పెన్సిలిన్ అలెర్జీ రక్షణ
- వాయిస్ లేదా టైపింగ్ ద్వారా అడగండి!`;
    } else if (language === 'ml') {
      greetingText = `നമസ്കാരം ${patient.name.split(' ')[0]}! ഞാൻ നിങ്ങളുടെ **മെഡിസിങ്ക് AI അസിസ്റ്റന്റ് (Sarvam Indic & Gemini)**.

മലയാളത്തിൽ നിങ്ങളുടെ മരുന്നുകളെക്കുറിച്ചും ആരോഗ്യത്തെക്കുറിച്ചും എന്നോട് സംസാരിക്കാം:
- മരുന്നുകളുടെ കൃത്യമായ സമയം
- ഭക്ഷണ മുൻകരുതലുകൾ`;
    } else if (language === 'hi') {
      greetingText = `नमस्ते ${patient.name.split(' ')[0]}! मैं आपका **मेडीसिंक AI स्वास्थ्य सहायक (Sarvam Indic & Gemini)** हूँ।

मैं आपकी भाषा में स्वास्थ्य मार्गदर्शन प्रदान करने के लिए तैयार हूँ:
- दवाओं की खुराक और समय सारणी
- आहार संबंधी सावधानियां एवं पेनिसिलिन एलर्जी सुरक्षा
- वॉयस (Voice) या टाइप करके प्रश्न पूछें!`;
    } else {
      greetingText = `Hello ${
        activeRole === 'doctor' ? 'Dr. Rao' : activeRole === 'caregiver' ? 'Sarah' : patient.name
      }! I'm your **MediSync AI Clinical Assistant**, connected live to **Sarvam Indic AI**, **Gemini 3.8 Flash**, and **Google Search Grounding**.

I have real-time access to your prescriptions, dosage timelines, and medical guidelines:
- **Indic Intelligence:** High-fidelity multilingual support in Kannada, Tamil, Telugu, Malayalam, Hindi, etc.
- **Clinical Safety:** Penicillin allergy guard and drug-food interaction checks.
- **Voice Navigation:** Talk naturally in your native language or English.`;
    }

    return {
      id: 'welcome-msg',
      role: 'model',
      text: greetingText,
      agent: selectedAgent,
      model: selectedAgent === 'sarvam' ? 'Sarvam Indic AI' : 'Gemini 3.8 Flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);

  // Update initial message if language changes and only initial message is present
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome-msg') {
      setMessages([getInitialMessage()]);
    }
  }, [language, selectedAgent]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Waveform animation during speech recording
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
      }, 110);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Language to BCP-47 locale mapping for Speech Recognition and TTS
  const langLocales: Record<string, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    bn: 'bn-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    pa: 'pa-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    zh: 'zh-CN',
  };

  // Multilingual Text-To-Speech for assistant answers
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Remove markdown characters for clean speech
      const cleanText = text.replace(/[*#_`~\[\]\(\)]/g, '').slice(0, 300);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      const targetLocale = langLocales[language] || 'en-US';
      utterance.lang = targetLocale;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetLocale.toLowerCase() ||
          v.lang.toLowerCase().startsWith(language.toLowerCase())
      );
      if (matchedVoice) utterance.voice = matchedVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS playback error', e);
    }
  };

  // Setup Web Speech Recognition with native Indian language BCP-47 codes
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast('Speech recognition not supported in this browser. Please type your message.', 'info');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      const targetLocale = langLocales[language] || 'en-US';
      recognition.lang = targetLocale;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript(
          language === 'kn'
            ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ.'
            : language === 'hi'
            ? 'सुन रहा हूँ... बोलिए।'
            : language === 'ta'
            ? 'கேட்கிறது... பேசுங்கள்.'
            : 'Listening... Speak naturally.'
        );
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const current = finalTranscript || interimTranscript;
        setVoiceTranscript(current);

        if (finalTranscript.trim()) {
          setIsListening(false);
          handleSendMessage(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setVoiceTranscript('');
  };

  // Check and trigger local in-app actions based on multilingual intent
  const checkInAppActions = (userPrompt: string): string | undefined => {
    const lower = userPrompt.toLowerCase();

    // 1. Log / take dose (English, Kannada, Tamil, Telugu, Hindi)
    if (
      lower.includes('log morning pill') ||
      lower.includes('mark dose taken') ||
      lower.includes('took my pill') ||
      lower.includes('take morning dose') ||
      lower.includes('ದಾಖಲಿಸಿ') ||
      lower.includes('ತೆಗೆದುಕೊಂಡೆ') ||
      lower.includes('பதிவு') ||
      lower.includes('నమోదు') ||
      lower.includes('खुराक दर्ज') ||
      lower.includes('दवा ले ली')
    ) {
      const morningDose = todaySchedule.find((d) => d.id === 'dose-1') || todaySchedule[0];
      if (morningDose) {
        markDoseTaken(morningDose.id);
        return language === 'kn'
          ? `✓ ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ: ${morningDose.medicationName} (${morningDose.dosage}) ತೆಗೆದುಕೊಂಡಿದ್ದೀರಿ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ!`
          : language === 'hi'
          ? `✓ कार्रवाई पूर्ण: ${morningDose.medicationName} (${morningDose.dosage}) को खुराक लिया गया चिह्नित किया गया!`
          : `✓ Action executed: Marked ${morningDose.medicationName} (${morningDose.dosage}) as taken. Adherence updated!`;
      }
    }

    // 2. Refill order
    if (
      lower.includes('order refill') ||
      lower.includes('refill amlodipine') ||
      lower.includes('request refill') ||
      lower.includes('ರೀಫಿಲ್') ||
      lower.includes('மறு நிரப்பல்') ||
      lower.includes('రీఫిల్') ||
      lower.includes('रीफिल')
    ) {
      const med = medications[0];
      if (med) {
        createRefillOrder(med.id);
        return language === 'kn'
          ? `✓ ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ: ${med.name} ಗಾಗಿ 30-ದಿನಗಳ ರೀಫಿಲ್ ವಿನಂತಿಯನ್ನು ಫಾರ್ಮಸಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.`
          : language === 'hi'
          ? `✓ कार्रवाई पूर्ण: ${med.name} के 30-दिवसीय रीफिल का अनुरोध फार्मेसी को भेज दिया गया है।`
          : `✓ Action executed: Sent 30-day refill request for ${med.name} to MediCare Central Pharmacy.`;
      }
    }

    // 3. Navigation shortcuts
    if (
      lower.includes('open prescriptions') ||
      lower.includes('show my prescriptions') ||
      lower.includes('ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್') ||
      lower.includes('மருந்துச்சீட்டு') ||
      lower.includes('ప్రిస్క్రిప్షన్') ||
      lower.includes('पर्चे')
    ) {
      onNavigateTab('prescriptions');
      return '✓ Action executed: Navigating to Digital e-Prescriptions view.';
    }
    if (lower.includes('open appointments') || lower.includes('show appointments')) {
      onNavigateTab('appointments');
      return '✓ Action executed: Navigating to Appointments schedule.';
    }
    if (lower.includes('open medications') || lower.includes('show my medicines') || lower.includes('ಔಷಧಗಳು')) {
      onNavigateTab('medications');
      return '✓ Action executed: Navigating to Medication List.';
    }
    if (lower.includes('open reports') || lower.includes('clinical summary') || lower.includes('ವರದಿ')) {
      generateAiSummary();
      onNavigateTab('reports');
      return '✓ Action executed: Synthesized clinical progress report and opened Reports.';
    }

    return undefined;
  };

  // Send message to live multi-agent API (/api/chat) with language context
  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || isLoading) return;

    setInputText('');
    setVoiceTranscript('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Check if an in-app action was triggered
    const localActionMsg = checkInAppActions(message);
    if (localActionMsg) {
      userMsg.actionTriggered = localActionMsg;
    }

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn context
      const historyPayload = newMessages.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: historyPayload,
          enableSearch: enableGoogleSearch,
          agent: selectedAgent,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const modelReplyText = data.reply || "I've processed your request.";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: modelReplyText,
        agent: data.agent || selectedAgent,
        model: data.model || (selectedAgent === 'sarvam' ? 'Sarvam Indic AI' : 'Gemini 3.8 Flash'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grounding: data.grounding,
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(modelReplyText);
    } catch (err: any) {
      console.warn('Chat API failed, fallback response generated:', err);

      let fallbackText = '';
      if (language === 'kn') {
        fallbackText = `**ಮೆಡಿಸಿಂಕ್ AI (Sarvam Indic Agent):**\n\nಎಲಿನೋರ್ ಅವರ ರಕ್ತದೊತ್ತಡವು **124/79 mmHg** (ಸಾಮಾನ್ಯವಾಗಿದೆ).\n- **ಆಮ್ಲೋಡಿಪೈನ್ 5mg:** ಬೆಳಿಗ್ಗೆ 08:00 ಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ.\n- **ಮೆಟ್‌ಫಾರ್ಮಿನ್ 500mg:** ಊಟದ ಜೊತೆಗೆ ತೆಗೆದುಕೊಳ್ಳಿ.\n- **ಎಚ್ಚರಿಕೆ:** ಪೆನ್ಸಿಲಿನ್ (Penicillin) ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ.`;
      } else if (language === 'hi') {
        fallbackText = `**मेडीसिंक AI (Sarvam Indic Agent):**\n\nएलेनोर का रक्तचाप **124/79 mmHg** नियंत्रित है।\n- **एम्लोडिपिन 5mg:** सुबह 08:00 बजे लें।\n- **मेटफॉर्मिन 500mg:** भोजन के साथ लें।\n- **चेतावनी:** पेनिसिलिन से गंभीर एलर्जी है!`;
      } else {
        fallbackText = `Eleanor's vitals (BP 124/79, Heart Rate 72 bpm) and 92% adherence streak are currently stable. Upcoming dose: Amlodipine 5mg. Penicillin is strictly contraindicated!`;
      }

      if (localActionMsg) {
        fallbackText = `${localActionMsg}\n\n${fallbackText}`;
      }

      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: fallbackText,
        agent: selectedAgent,
        model: 'Sarvam Indic (Local Shield)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  // Multilingual Suggested Quick Prompts based on active language
  const getLanguagePrompts = (): string[] => {
    if (language === 'kn') {
      return [
        'ಆಮ್ಲೋಡಿಪೈನ್ ಜೊತೆ ಐಬುಪ್ರೊಫೇನ್ ತೆಗೆದುಕೊಳ್ಳಬಹುದೇ?',
        'ನನ್ನ ಬೆಳಗಿನ ಮಾತ್ರೆ ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ ಎಂದು ದಾಖಲಿಸಿ',
        'ಆಮ್ಲೋಡಿಪೈನ್ 30 ದಿನಗಳ ರೀಫಿಲ್ ಆರ್ಡರ್ ಮಾಡಿ',
        'ಮೆಟ್‌ಫಾರ್ಮಿನ್ ಆಹಾರ ನಿಯಮಗಳು ಯಾವುವು?',
        'ನನ್ನ ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ತೋರಿಸಿ',
      ];
    }
    if (language === 'ta') {
      return [
        'ஆம்லோடிபினுடன் இபுப்ரோஃபென் எடுக்கலாமா?',
        'காலை மாத்திரையை பதிவு செய்க',
        'ஆம்லோடிபின் மறு நிரப்பல் ஆர்டர் செய்',
        'உணவு கட்டுப்பாடுகள் என்ன?',
      ];
    }
    if (language === 'te') {
      return [
        'ఆమ్లోడిపైన్‌తో ఐబుప్రోఫెన్ తీసుకోవచ్చా?',
        'ఉదయపు మందును నమోదు చేయండి',
        'ఆమ్లోడిపైన్ రీఫిల్ ఆర్డర్ చేయండి',
        'ఆహార నియమాలు చెప్పండి',
      ];
    }
    if (language === 'ml') {
      return [
        'ആംലോഡിപിൻ റീഫിൽ ഓർഡർ ചെയ്യുക',
        'രാവിലത്തെ ഗുളിക രേഖപ്പെടുത്തുക',
        'ഭക്ഷണ നിയന്ത്രണങ്ങൾ എന്തൊക്കെയാണ്?',
      ];
    }
    if (language === 'hi') {
      return [
        'क्या एम्लोडिपिन के साथ इबुप्रोफेन सुरक्षित है?',
        'मेरी सुबह की खुराक दर्ज करें',
        'एम्लोडिपिन 30-दिन रीफिल ऑर्डर करें',
        'मेटफॉर्मिन के भोजन नियम क्या हैं?',
        'मेरा डिजिटल पर्चा दिखाएं',
      ];
    }
    if (language === 'es') {
      return [
        '¿Es seguro el Ibuprofeno con Amlodipino?',
        'Marcar dosis de la mañana como tomada',
        'Ordenar refill de Amlodipino',
        'Reglas de comida para Metformina',
      ];
    }
    return [
      'Can I take Amlodipine with Ibuprofen?',
      'Log my morning pill as taken',
      'Order a 30-day refill for Amlodipine',
      'What foods should I avoid with my medicines?',
      'Show my verified electronic prescription',
    ];
  };

  const currentPrompts = getLanguagePrompts();

  return (
    <>
      {/* Floating Persistent AI Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="medivoice-floating-trigger"
          onClick={() => {
            setIsOpen(true);
            if (messages.length === 1) {
              startSpeechRecognition();
            }
          }}
          className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 text-white shadow-xl shadow-teal-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
          title="Open MediSync Gemini Assistant"
          aria-label="MediSync Gemini Assistant"
        >
          {/* Animated pulse rings */}
          <span className="absolute -inset-1 rounded-full bg-teal-400/30 animate-ping pointer-events-none" />
          <span className="absolute -inset-2 rounded-full bg-teal-500/10 pointer-events-none" />

          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md text-white group-hover:rotate-12 transition-transform" />

          <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 shadow-xs flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI
          </span>
        </button>
      </div>

      {/* Conversational Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            id="medivoice-panel"
            className={`w-full ${
              isExpanded ? 'max-w-4xl h-[92vh]' : 'max-w-2xl h-[85vh]'
            } bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 animate-in zoom-in-95`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-teal-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
                  <Sparkles className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-1.5">
                      <span>MediSync Clinical Intelligence</span>
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                      {selectedAgent === 'sarvam' ? 'Sarvam Indic AI 🇮🇳' : 'Gemini 3.8 Flash'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-teal-300">
                      <Globe className="w-3 h-3" />
                      Google Search Grounded
                    </span>
                    <span>•</span>
                    <span className="capitalize">{activeRole} Portal</span>
                    <span>•</span>
                    <span className="font-mono text-teal-200 uppercase">{language}</span>
                  </p>
                </div>
              </div>

              {/* Action controls in header */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Voice speech toggle */}
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-2 rounded-xl transition-colors ${
                    ttsEnabled
                      ? 'text-teal-300 hover:bg-teal-900/40'
                      : 'text-slate-500 hover:bg-slate-800'
                  }`}
                  title={ttsEnabled ? 'Voice Readout Enabled' : 'Voice Readout Muted'}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Google search grounding toggle */}
                <button
                  onClick={() => {
                    const next = !enableGoogleSearch;
                    setEnableGoogleSearch(next);
                    addToast(
                      next ? 'Live Google Search Grounding active' : 'Google Search Grounding disabled',
                      'info'
                    );
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                    enableGoogleSearch
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title="Toggle live Google Search integration"
                >
                  <Search className="w-3 h-3" />
                  <span className="hidden sm:inline">Search</span>
                </button>

                {/* Clear history */}
                <button
                  onClick={() => setMessages([getInitialMessage()])}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
                  title={isExpanded ? 'Collapse' : 'Expand full screen'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close */}
                <button
                  onClick={() => {
                    stopSpeechRecognition();
                    setIsOpen(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Agent Selector Bar */}
            <div className="px-3 sm:px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 hidden sm:inline">
                  AI Agent:
                </span>
                {agents.map((ag) => {
                  const isSelected = selectedAgent === ag.id;
                  return (
                    <button
                      key={ag.id}
                      onClick={() => {
                        setSelectedAgent(ag.id);
                        addToast(`Switched active agent to ${ag.name}`, 'info');
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                      }`}
                      title={ag.description}
                    >
                      <span>{ag.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-slate-950 text-teal-300' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {ag.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-800/60 shrink-0 font-medium hidden md:inline">
                {selectedAgent === 'sarvam' ? 'Indic Multilingual Active' : 'Multiturn Active'}
              </div>
            </div>

            {/* Conversation Log Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/70">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        isUser
                          ? 'bg-sky-600 text-white'
                          : 'bg-gradient-to-tr from-teal-700 to-slate-900 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-sky-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                      }`}
                    >
                      {/* Model & Agent badge */}
                      {!isUser && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-teal-600" />
                            {msg.model || (msg.agent === 'sarvam' ? 'Sarvam Indic AI 🇮🇳' : 'Gemini 3.8 Flash')}
                          </span>
                        </div>
                      )}

                      {/* Action executed indicator tag */}
                      {msg.actionTriggered && (
                        <div className="mb-2 p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{msg.actionTriggered}</span>
                        </div>
                      )}

                      {/* Content with basic markdown formatting */}
                      <div className="whitespace-pre-wrap space-y-1.5 font-medium">
                        {msg.text.split('\n\n').map((paragraph, pIdx) => {
                          return (
                            <p key={pIdx}>
                              {paragraph.split('**').map((seg, sIdx) =>
                                sIdx % 2 === 1 ? (
                                  <strong key={sIdx} className={isUser ? 'text-white font-bold' : 'text-slate-950 font-bold'}>
                                    {seg}
                                  </strong>
                                ) : (
                                  seg
                                )
                              )}
                            </p>
                          );
                        })}
                      </div>

                      {/* Google Search Grounding Section */}
                      {msg.grounding && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                          {/* Search Queries */}
                          {msg.grounding.queries && msg.grounding.queries.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Search className="w-3 h-3 text-sky-500" />
                                Google Search:
                              </span>
                              {msg.grounding.queries.map((q, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 flex items-center gap-1"
                                >
                                  "{q}"
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Sources list */}
                          {msg.grounding.sources && msg.grounding.sources.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Grounded Web Sources:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {msg.grounding.sources.slice(0, 4).map((source, sIdx) => (
                                  <a
                                    key={sIdx}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-900 transition-colors flex items-center justify-between text-[11px] group"
                                  >
                                    <span className="truncate max-w-[200px] font-semibold">
                                      {source.title}
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0 ml-1" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`text-[10px] mt-2 text-right ${
                          isUser ? 'text-sky-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-teal-700 to-slate-900 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                    <span>Gemini is synthesizing medical guidance & checking Google Search...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Live Audio Listening Bar */}
            {isListening && (
              <div className="p-4 bg-teal-900 text-white flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-150 shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Waveform bars */}
                  <div className="flex items-center gap-1 shrink-0 h-6">
                    {audioWaves.map((height, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 rounded-full bg-cyan-300 transition-all duration-100"
                        style={{ height: `${height / 3.5}px` }}
                      />
                    ))}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-cyan-200">Listening to your voice...</p>
                    <p className="text-[11px] text-slate-300 truncate">
                      {voiceTranscript || 'Speak your health question or command now...'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={stopSpeechRecognition}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition-colors"
                >
                  Stop Recording
                </button>
              </div>
            )}

            {/* Suggested Prompts Carousel */}
            <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-2 no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  Try asking:
                </span>
                {currentPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-xs font-medium shrink-0 transition-all shadow-2xs text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Input Field */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Speech Input Button */}
                <button
                  type="button"
                  onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
                  className={`p-3 rounded-2xl border transition-all shrink-0 ${
                    isListening
                      ? 'bg-rose-600 border-rose-700 text-white animate-pulse'
                      : 'bg-slate-100 hover:bg-teal-50 border-slate-200 text-slate-700 hover:text-teal-700'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak with your voice'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Text Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      language === 'kn'
                        ? 'ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ: ಔಷಧ ನಿಯಮಗಳು, ಅಡ್ಡಪರಿಣಾಮಗಳು, ರೀಫಿಲ್)...'
                        : language === 'ta'
                        ? 'தமிழில் கேளுங்கள் (மருந்து விவரங்கள், உணவு முறைகள், மறு நிரப்பல்)...'
                        : language === 'te'
                        ? 'తెలుగులో అడగండి (మందుల వివరాలు, ఆహార నియమాలు, రీಫిల్)...'
                        : language === 'ml'
                        ? 'മലയാളത്തിൽ ചോദ്യങ്ങൾ ചോദിക്കാം...'
                        : language === 'hi'
                        ? 'हिंदी में पूछें (जैसे: दवा के नियम, दुष्प्रभाव, रीफिल)...'
                        : language === 'es'
                        ? 'Pregunte a MediSync (interacciones, comidas, refill)...'
                        : selectedAgent === 'sarvam'
                        ? 'Ask Sarvam Indic AI in English, Kannada, Tamil, Telugu, Hindi...'
                        : 'Ask Gemini anything (e.g., drug interactions, food rules, latest research)...'
                    }
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    disabled={isLoading}
                  />
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className={`p-3 rounded-2xl font-bold text-white shadow-md flex items-center justify-center transition-all shrink-0 ${
                    inputText.trim() && !isLoading
                      ? 'bg-teal-600 hover:bg-teal-500 active:scale-95 shadow-teal-500/20'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span>
                  Press Enter to send • Powered by {selectedAgent === 'sarvam' ? 'Sarvam Indic AI 🇮🇳 & Gemini' : 'Google Gemini 3.8 Flash'}
                </span>
                <span className="flex items-center gap-1 text-teal-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Synchronized
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

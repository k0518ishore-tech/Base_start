import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Building2,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const SUGGESTED_QUERIES = [
  'What schemes are available for small farmers in Maharashtra?',
  'Who is eligible for Ayushman Bharat PM-JAY healthcare?',
  'How do I apply for the PMAY-U housing subsidy?',
  'What documents are required for PM SVANidhi loans?',
  'What are the benefits of PM Vishwakarma for artisans?',
];

// Helper to format assistant markdown-like bold text, bullets, and linebreaks
const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        // Parse bold segments **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-gov-primary">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        // Bullet line
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-gov-secondary font-bold shrink-0 mt-0.5">•</span>
              <div>{formattedLine}</div>
            </div>
          );
        }

        return <p key={idx}>{formattedLine}</p>;
      })}
    </div>
  );
};

const SchemeAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Namaste! Welcome to the National Scheme Assistant powered by **Qwen AI**.\n\nI can help you discover Central & State welfare initiatives, verify your eligibility criteria, review required documents, and guide you on application procedures.\n\nHow may I assist you today? You can choose one of the suggested topics below or ask any question in your own words.',
      timestamp: new Date(),
      provider: 'Qwen 2.5 Model Engine',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsThinking(true);

    try {
      // Send conversation payload to backend Qwen service
      const payloadMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post('/assistant/chat', { messages: payloadMessages });

      if (res.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: res.data.message,
          provider: res.data.provider || 'Qwen 2.5 AI Model',
          matchedSchemes: res.data.matchedSchemes || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = {
        role: 'assistant',
        content:
          'I encountered a temporary connection issue communicating with the Qwen service. You can explore verified initiatives directly in the **Explore Schemes** catalog or retry in a moment.',
        provider: 'System Notification',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Chat session reset. What government welfare scheme or eligibility criteria would you like to explore?',
        timestamp: new Date(),
        provider: 'Qwen 2.5 Model Engine',
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="warning" size="xs" className="gap-1 bg-amber-100 text-amber-900 border border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-700" />
              Powered by Qwen AI
            </Badge>
            <span className="text-xs text-gov-muted font-medium">Grounded in Verified Scheme Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
            Scheme Assistant
          </h1>
          <p className="text-xs sm:text-sm text-gov-muted mt-1">
            Ask any question about welfare programs, eligibility requirements, application steps, and subsidies.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClearChat}
          className="gap-1.5 text-xs self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </Button>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white/40 backdrop-blur-2xs rounded-2xl border border-gov-border/80 shadow-subtle flex flex-col h-[580px] overflow-hidden">
        {/* Chat Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-transparent">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-2xl ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-gov-secondary text-white'
                      : 'bg-gov-primary text-amber-300'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs transition-all ${
                    isUser
                      ? 'bg-gov-primary text-white rounded-tr-none shadow-xs'
                      : 'bg-white border border-gov-border text-slate-800 rounded-tl-none shadow-subtle'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                      <span className="font-bold text-gov-primary text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        National Scheme Assistant
                      </span>
                      {msg.provider && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {msg.provider}
                        </span>
                      )}
                    </div>
                  )}

                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    renderFormattedText(msg.content)
                  )}

                  {/* Matched Scheme Direct Links */}
                  {!isUser && msg.matchedSchemes && msg.matchedSchemes.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Related Scheme Portals:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.matchedSchemes.map((s) => (
                          <Link
                            key={s._id}
                            to={`/schemes/${s._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-gov-secondary hover:bg-blue-100 transition-colors text-[11px] font-semibold"
                          >
                            <span>{s.schemeName}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking State Indicator */}
          {isThinking && (
            <div className="flex items-start gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-full bg-gov-primary text-amber-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white border border-gov-border rounded-2xl rounded-tl-none p-3.5 shadow-subtle flex items-center gap-2.5 text-xs text-slate-600">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gov-secondary animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-gov-secondary animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-gov-secondary animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Qwen is evaluating verified government scheme rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Chips (Quick Click) */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Suggested:
            </span>
            {SUGGESTED_QUERIES.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sq)}
                disabled={isThinking}
                className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:border-gov-secondary hover:bg-blue-50/50 hover:text-gov-secondary text-[11px] text-slate-700 whitespace-nowrap shrink-0 transition-colors disabled:opacity-50"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 border-t border-gov-border bg-white flex items-center gap-2 sm:gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking}
            placeholder="Ask about schemes, eligibility, required documents, or application procedures..."
            className="flex-1 text-xs sm:text-sm rounded-xl border border-gov-border px-4 py-2.5 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-secondary focus:bg-white transition-all disabled:opacity-60"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputText.trim() || isThinking}
            className="gap-1.5 shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SchemeAssistantPage;

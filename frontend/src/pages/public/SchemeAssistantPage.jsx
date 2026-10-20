import React, { useState } from 'react';
import { Bot, Send, Sparkles, AlertCircle, HelpCircle, MessageSquare } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const SUGGESTED_QUERIES = [
  'What schemes are available for small farmers in Maharashtra?',
  'What are the income criteria for Ayushman Bharat PM-JAY?',
  'How do I apply for the PMAY-U housing subsidy?',
  'What documents are mandatory for PM SVANidhi street vendor loans?',
];

const SchemeAssistantPage = () => {
  const [inputText, setInputText] = useState('');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" size="xs">
              Preview Interface
            </Badge>
            <span className="text-xs text-gov-muted font-medium">Phase 2 Planned Deployment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
            Scheme Assistant
          </h1>
          <p className="text-xs sm:text-sm text-gov-muted mt-1">
            Interactive conversational guidance for government scheme discovery and criteria queries.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/80 flex items-start gap-3">
        <Bot className="w-5 h-5 text-gov-secondary shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-blue-950">
          <span className="font-bold">Module Under Staged Integration: </span>
          The natural language Scheme Assistant is currently scheduled for an upcoming release. In compliance with strict architectural isolation standards, this interface represents the front-end layout only. For current criteria evaluations, please use the live deterministic{' '}
          <a href="/eligibility" className="text-gov-secondary font-bold underline">
            Eligibility Checker
          </a>
          .
        </div>
      </div>

      {/* Professional Chat Container */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-subtle flex flex-col h-[520px] overflow-hidden">
        {/* Chat Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          {/* Welcome Message from Assistant */}
          <div className="flex items-start gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-full bg-gov-primary text-white flex items-center justify-center shrink-0 font-bold text-xs">
              <Bot className="w-4 h-4 text-amber-300" />
            </div>
            <div className="bg-white border border-gov-border rounded-2xl rounded-tl-none p-4 shadow-subtle">
              <p className="text-xs font-semibold text-gov-primary mb-1">National Scheme Assistant</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                Namaste! Welcome to the Government Scheme Eligibility Engine. When activated, I will guide you through verified central and state welfare programs, explain eligibility constraints, and assist with application documentation requirements.
              </p>
            </div>
          </div>

          {/* Suggested Prompts Box */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-white/70 max-w-xl ml-11">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Planned Conversational Capabilities
            </p>
            <div className="space-y-1.5">
              {SUGGESTED_QUERIES.map((q, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2 cursor-not-allowed opacity-80"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gov-secondary shrink-0" />
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gov-border bg-white flex items-center gap-3">
          <input
            type="text"
            disabled
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Conversational assistant will be enabled in the upcoming release..."
            className="flex-1 text-xs rounded-xl border border-gov-border px-4 py-2.5 bg-slate-100 text-slate-400 cursor-not-allowed focus:outline-none"
          />
          <Button variant="primary" size="md" disabled className="gap-1.5 opacity-60">
            <Send className="w-4 h-4" />
            <span>Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SchemeAssistantPage;

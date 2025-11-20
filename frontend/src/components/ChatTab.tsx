'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { api } from '@/lib/api';
import { Send, Mic, Volume2, StopCircle, Loader2 } from 'lucide-react';

interface Message {
  user_message?: string;
  bot_response?: string;
  depression_score?: number;
  timestamp: string;
}

interface ChatTabProps {
  onStatusUpdate: () => void;
}

// Web Speech API 타입 선언
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export default function ChatTab({ onStatusUpdate }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadChatHistory();

    // Web Speech API 초기화
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.error('음성 인식 오류:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 150;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const loadChatHistory = async () => {
    try {
      const data = await api.getChatHistory();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([{
          bot_response: '안녕하세요! 저는 당신의 멘탈케어를 도와드리는 AI 챗봇입니다. 오늘 기분은 어떠신가요? 무엇이든 편하게 말씀해주세요.',
          timestamp: new Date().toISOString(),
        }]);
      }
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('채팅 기록 로드 오류:', error);
      setMessages([{
        bot_response: '안녕하세요! 저는 당신의 멘탈케어를 도와드리는 AI 챗봇입니다. 오늘 기분은 어떠신가요? 무엇이든 편하게 말씀해주세요.',
        timestamp: new Date().toISOString(),
      }]);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    const userMsg: Message = {
      user_message: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await api.chat(userMessage);
      const botMsg: Message = {
        bot_response: response.response,
        depression_score: response.depression_score,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, botMsg]);
      onStatusUpdate();
    } catch (error: any) {
      console.error('채팅 오류:', error);
      const errorMsg: Message = {
        bot_response: '죄송합니다. 응답을 생성하는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    let date = new Date(timestamp);
    if (isNaN(date.getTime())) return '시간 정보 없음';
    if (timestamp.endsWith('Z') || (!timestamp.includes('+') && !timestamp.includes('-', 10))) {
      date = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    }

    const now = new Date();
    const nowKST = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const diff = nowKST.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    const todayKST = new Date(nowKST);
    const isToday = date.getDate() === todayKST.getDate() &&
      date.getMonth() === todayKST.getMonth() &&
      date.getFullYear() === todayKST.getFullYear();

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24 && isToday) {
      const h = date.getHours();
      const m = date.getMinutes();
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${year}. ${month}. ${day}. ${h}:${m}`;
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const playSpeech = async (text: string) => {
    try {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const response = await api.synthesizeSpeech(text);

      if (response.audio_data) {
        const audio = new Audio(`data:audio/mpeg;base64,${response.audio_data}`);
        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlaying(false);
          audioRef.current = null;
          alert('음성 재생 중 오류가 발생했습니다.');
        };
        audioRef.current = audio;
        await audio.play();
      } else {
        setIsPlaying(false);
        alert('음성 데이터를 받아오는데 실패했습니다.');
      }
    } catch (error: any) {
      console.error('음성 합성 오류:', error);
      setIsPlaying(false);
      alert(error.message || '음성 합성에 실패했습니다.');
    }
  };

  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-[650px] sm:h-[600px] lg:h-[700px] relative">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 rounded-2xl min-h-0 hide-scrollbar" style={{ paddingBottom: '140px' }}>
        {messages.map((msg, index) => (
          <div key={index} className="space-y-3 animate-fade-in">
            {msg.user_message && (
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-gradient-to-r from-warm-teal-500 to-warm-teal-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md">
                  <p className="text-lg leading-relaxed font-medium break-words">{msg.user_message}</p>
                </div>
              </div>
            )}
            {msg.bot_response && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-md border border-slate-100">
                    <p className="text-lg text-slate-800 whitespace-pre-wrap leading-relaxed break-words">
                      {msg.bot_response}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2 px-2">
                    <p className="text-sm text-slate-500 font-medium">
                      {formatTime(msg.timestamp)}
                    </p>
                    <button
                      onClick={() => playSpeech(msg.bot_response || '')}
                      className="text-slate-500 hover:text-warm-teal-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                      title="음성으로 듣기"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-warm-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-warm-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-warm-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-3 sm:p-4 z-10 border-t border-slate-200 rounded-b-2xl">
        <div className="flex gap-2 sm:gap-3 items-end">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={loading}
            className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 shadow-md ${isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex-shrink-0`}
            title={isRecording ? '음성 녹음 중지' : '음성 입력 시작'}
          >
            {isRecording ? <StopCircle size={20} className="sm:w-6 sm:h-6" /> : <Mic size={20} className="sm:w-6 sm:h-6" />}
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder={isRecording ? '음성을 말씀해주세요...' : '메시지를 입력하세요...'}
            maxLength={500}
            rows={1}
            className="flex-1 input-friendly min-h-[50px] sm:min-h-[56px] max-h-[120px] sm:max-h-[150px] resize-none text-base sm:text-lg py-3 px-4"
            disabled={loading || isRecording}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || isRecording}
            className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-warm-teal-500 to-warm-teal-600 text-white font-bold rounded-2xl hover:from-warm-teal-600 hover:to-warm-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0"
          >
            <span className="hidden sm:inline">전송</span>
            <Send size={20} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        {isRecording && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2 font-semibold animate-fade-in">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span>음성 인식 중...</span>
          </div>
        )}
        {isPlaying && (
          <div className="mt-3 p-3 bg-warm-teal-50 border border-warm-teal-200 rounded-xl text-warm-teal-700 flex items-center gap-3 font-semibold animate-fade-in">
            <button
              onClick={stopSpeech}
              className="px-3 py-1 bg-warm-teal-500 text-white rounded-lg hover:bg-warm-teal-600 text-sm font-bold"
            >
              정지
            </button>
            <span className="flex items-center gap-2">
              <Volume2 size={18} className="animate-pulse" />
              음성 재생 중...
            </span>
          </div>
        )}
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { api } from '@/lib/api';

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
  new (): SpeechRecognition;
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadChatHistory();
    
    // Web Speech API 초기화 (브라우저 지원 확인)
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

  const loadChatHistory = async () => {
    try {
      const data = await api.getChatHistory();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        // 초기 환영 메시지
        setMessages([{
          bot_response: '안녕하세요! 저는 당신의 멘탈케어를 도와드리는 AI 챗봇입니다. 오늘 기분은 어떠신가요? 무엇이든 편하게 말씀해주세요.',
          timestamp: new Date().toISOString(),
        }]);
      }
      // DOM 업데이트 후 스크롤을 맨 아래로 이동
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('채팅 기록 로드 오류:', error);
      setMessages([{
        bot_response: '안녕하세요! 저는 당신의 멘탈케어를 도와드리는 AI 챗봇입니다. 오늘 기분은 어떠신가요? 무엇이든 편하게 말씀해주세요.',
        timestamp: new Date().toISOString(),
      }]);
      // DOM 업데이트 후 스크롤을 맨 아래로 이동
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
    setLoading(true);

    // 사용자 메시지 추가
    const userMsg: Message = {
      user_message: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

      try {
      const response = await api.chat(userMessage);
      
      // 봇 응답 추가
      const botMsg: Message = {
        bot_response: response.response,
        depression_score: response.depression_score,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, botMsg]);
      
      // 상태 업데이트
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
    
    // 유효하지 않은 날짜인 경우 처리
    if (isNaN(date.getTime())) {
      return '시간 정보 없음';
    }
    
    // UTC 시간인 경우 KST로 변환 (9시간 추가)
    // timestamp가 'Z'로 끝나거나 timezone 정보가 없으면 UTC로 간주
    if (timestamp.endsWith('Z') || (!timestamp.includes('+') && !timestamp.includes('-', 10))) {
      date = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    }
    
    const now = new Date();
    const nowKST = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const diff = nowKST.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    // 오늘인지 확인 (KST 기준)
    const todayKST = new Date(nowKST);
    const isToday = date.getDate() === todayKST.getDate() &&
                    date.getMonth() === todayKST.getMonth() &&
                    date.getFullYear() === todayKST.getFullYear();
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24 && isToday) {
      // 오늘인 경우 시간만 표시 (KST)
      const h = date.getHours();
      const m = date.getMinutes();
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    
    // 날짜와 시간 모두 표시 (KST)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${year}. ${month}. ${day}. ${h}:${m}`;
  };

  // 음성 입력 시작/중지
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      audioChunksRef.current = [];
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // 음성 출력 (Supertone API 사용)
  const playSpeech = async (text: string) => {
    try {
      setIsPlaying(true);
      
      // 기존 재생 중지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Supertone API를 통해 음성 합성
      const response = await api.synthesizeSpeech(text);
      
      if (response.audio_data) {
        // base64 오디오 데이터를 Audio 객체로 변환
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

  // 음성 출력 중지
  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-[400px] sm:h-[550px] lg:h-[650px]">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className="space-y-2">
            {msg.user_message && (
              <div className="flex justify-end">
                <div className="max-w-[80%] sm:max-w-[70%] bg-teal-600 text-white p-4 rounded-xl rounded-tr-none shadow-md">
                  <p className="text-base sm:text-lg">{msg.user_message}</p>
                </div>
              </div>
            )}
            {msg.bot_response && (
              <div className="flex justify-start">
                <div className="max-w-[80%] sm:max-w-[70%]">
                  <div className="bg-white border-2 border-gray-300 p-4 rounded-xl rounded-tl-none shadow-md">
                    <p className="text-base sm:text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {msg.bot_response}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1 px-1">
                    <p className="text-sm text-gray-500">
                      {formatTime(msg.timestamp)}
                    </p>
                    <button
                      onClick={() => playSpeech(msg.bot_response || '')}
                      className="text-[8px] hover:opacity-70 hover:scale-125 transition-all leading-none p-0"
                      title="음성으로 듣기"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="mt-4 sm:mt-6">
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={loading}
            className={`px-3 py-3 sm:px-5 sm:py-4 rounded-xl transition-colors text-xl sm:text-2xl min-w-[48px] min-h-[48px] sm:min-w-[64px] sm:min-h-[64px] shrink-0 ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse shadow-lg'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-md'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? '음성 녹음 중지' : '음성 입력 시작'}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? '음성을 말씀해주세요...' : '메시지를 입력하세요...'}
            maxLength={500}
            className="flex-1 min-w-0 px-3 py-3 sm:px-6 sm:py-4 text-base sm:text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-teal-600 outline-none text-gray-900 bg-white placeholder:text-gray-500"
            disabled={loading || isRecording}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || isRecording}
            className="px-4 py-3 sm:px-8 sm:py-4 bg-teal-600 text-white text-base sm:text-lg font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-h-[48px] sm:min-h-[64px] shrink-0 whitespace-nowrap"
          >
            전송
          </button>
        </div>
        {isRecording && (
          <div className="mt-3 text-lg text-red-700 flex items-center gap-3 font-semibold">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
            음성 인식 중...
          </div>
        )}
        {isPlaying && (
          <div className="mt-3 text-lg text-teal-700 flex items-center gap-3 font-semibold">
            <button
              onClick={stopSpeech}
              className="px-4 py-2 bg-teal-100 rounded-lg hover:bg-teal-200 border-2 border-teal-300 font-bold"
            >
              정지
            </button>
            <span>음성 재생 중...</span>
          </div>
        )}
      </form>
    </div>
  );
}


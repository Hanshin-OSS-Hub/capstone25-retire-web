// API 유틸리티 함수들

// Next.js rewrites를 사용하여 상대 경로로 API 호출
// 이렇게 하면 서버 사이드에서 백엔드로 프록시되므로 Mixed Content 문제 없음
const getApiUrl = () => {
  // 브라우저 환경에서는 상대 경로 사용 (Next.js rewrites 활용)
  if (typeof window !== 'undefined') {
    // ngrok을 통해 접속한 경우에도 상대 경로 사용
    // Next.js rewrites가 서버 사이드에서 백엔드로 프록시함
    return '';
  }
  
  // 서버 사이드 렌더링 시 환경 변수 또는 기본값 사용
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const API_URL = getApiUrl();

// 디버깅: API URL 확인 (개발 환경에서만)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API] API URL:', API_URL || '(상대 경로 - Next.js rewrites 사용)');
}

// 토큰 관리
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API 호출 함수들
export const api = {
  // 인증
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        let errorMessage = '로그인에 실패했습니다.';
        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지 사용
          errorMessage = `서버 오류 (${response.status}): ${response.statusText}`;
        }
        console.error('[API] 로그인 실패:', errorMessage, 'Status:', response.status);
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      // 네트워크 오류 등
      console.error('[API] 로그인 요청 실패:', error);
      throw new Error('네트워크 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
    }
  },

  signup: async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '회원가입에 실패했습니다.');
    }
    
    return response.json();
  },

  getUser: async () => {
    const response = await fetch(`${API_URL}/api/user`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('사용자 정보를 가져오는데 실패했습니다.');
    }
    
    return response.json();
  },

  logout: async () => {
    await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    removeToken();
  },

  // 챗봇
  chat: async (message: string) => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '챗봇 응답을 가져오는데 실패했습니다.');
    }
    
    return response.json();
  },

  getChatHistory: async () => {
    const response = await fetch(`${API_URL}/api/chat/history`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('채팅 기록을 가져오는데 실패했습니다.');
    }
    
    return response.json();
  },

  // 우울 수치
  getDepressionStatus: async () => {
    const response = await fetch(`${API_URL}/api/depression/status`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('우울 수치를 가져오는데 실패했습니다.');
    }
    
    return response.json();
  },

  // 커리어 컨설팅
  createCareerConsultation: async (resumeData: any) => {
    const response = await fetch(`${API_URL}/api/career/consultation/natural`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resumeData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '커리어 컨설팅 생성에 실패했습니다.');
    }
    
    return response.json();
  },

  getCareerHistory: async () => {
    const response = await fetch(`${API_URL}/api/career/history`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('커리어 히스토리를 가져오는데 실패했습니다.');
    }
    
    return response.json();
  },

  // 음성 관련
  transcribeAudio: async (audioFile: File) => {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    
    const token = getToken();
    const response = await fetch(`${API_URL}/api/audio/transcribe`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '음성 변환에 실패했습니다.');
    }
    
    return response.json();
  },

  synthesizeSpeech: async (text: string) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/audio/synthesize?text=${encodeURIComponent(text)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || '음성 합성에 실패했습니다.');
    }
    
    return response.json();
  },

  // PHQ-9 설문
  submitPhq9: async (scores: number[]) => {
    const response = await fetch(`${API_URL}/api/phq9`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ scores }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'PHQ-9 결과 제출에 실패했습니다.');
    }

    return response.json();
  },

  getPhqLatest: async () => {
    const response = await fetch(`${API_URL}/api/phq9/latest`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('PHQ-9 결과를 가져오는데 실패했습니다.');
    }

    return response.json();
  },

  getPhqHistory: async () => {
    const response = await fetch(`${API_URL}/api/phq9/history`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('PHQ-9 히스토리를 가져오는데 실패했습니다.');
    }

    return response.json();
  },
};


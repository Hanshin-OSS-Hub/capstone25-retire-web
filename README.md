# 🌟 RetireWeb

은퇴 후 AI 챗봇과 커리어 컨설팅을 통한 종합적인 멘탈케어 플랫폼입니다.

> **현재 상태**: 
- ✅ 로그인 구현 완료 (bcrypt 호환성 문제 해결)
- ✅ 챗봇 기능 구현 완료 (K-LIWC 기반 우울 수치 분석, 가중 평균 로직 적용)
- ✅ 음성 대화 기능 완료 (Web Speech API STT, Supertone API TTS)
- ✅ AI 컨설팅 구현 완료
- ✅ 우울 수치 그래프 시각화 완료 (recharts)
- ✅ PHQ-9 우울 자가검사 설문조사 구현 완료
- ✅ 커리어 컨설팅 히스토리 조회 기능 완료
- ✅ 노인 친화적 디자인 리뉴얼 완료 (따뜻한 색상, 자연 배경, 글래스모피즘)
- ✅ 프론트엔드 Next.js 전환 완료 (반응형 UI, 노인 친화적 디자인)
## 📋 최근 업데이트

### 🎨 노인 친화적 디자인 리뉴얼 (Senior-Friendly Design)
- **따뜻한 색상 팔레트**: Warm Teal(#2dd4bf), Soft Orange(#fb923c), Creamy White(#fdfbf7) 적용
- **가독성 강화**: 기본 폰트 크기 확대(20px), Noto Sans KR 폰트 적용
- **직관적인 UI**: 글래스모피즘(Glassmorphism) 카드 디자인, 큰 아이콘 및 버튼
- **자연 친화적 배경**: 눈이 편안한 자연(숲/나뭇잎) 배경 이미지 적용
- **반응형 최적화**: 모바일/태블릿/데스크톱 완벽 대응

### 💬 챗봇 및 입력창 개선
- **입력 편의성**: 'Enter' 키로 전송, 'Shift + Enter'로 줄바꿈 기능 추가
- **모바일 최적화**: 모바일 환경에서 입력창 레이아웃 및 버튼 크기 최적화
- **시야 확보**: 모바일에서 채팅 영역 높이 확장 (500px -> 650px)
- **텍스트 오버플로우 수정**: 긴 메시지 자동 줄바꿈 처리

### 📊 우울 수치 분석 고도화
- **K-LIWC 기반 분석**: 한국어 언어심리분석 사전(K-LIWC)을 활용한 정교한 우울 수치 측정
- **색상 로직 개선**: 우울 점수에 따른 직관적인 색상 변화
  - 0~3점: **파란색 (안정)**
  - 4~7점: **연두색 (주의)**
  - 8~10점: **빨간색 (위험)**
- **가중 평균 계산**: 최근 3개 대화 30%, 전체 평균 30%, 새 수치 40% 가중치 적용
- **대화 기록 개선**: 긴 텍스트 자동 줄바꿈 처리, UI 오버플로우 해결
- **상태 박스 최적화**: '현재 마음 상태' 박스 높이 축소로 공간 효율성 증대

## ✨ 주요 기능

### 🤖 AI 챗봇
- **K-LIWC 기반 우울 수치 분석**: 한국어 언어심리분석 사전을 활용한 과학적 감정 분석
- 일상 대화를 통한 우울 수치 모니터링 (0-10점)
- **Web Speech API** 기반 음성 인식 및 텍스트 변환 (STT)
- **Supertone API** 기반 자연스러운 음성 합성 (TTS)
- 실시간 감정 분석 및 적절한 응답 제공
- 가중 평균 기반 우울 수치 계산 (급격한 변동 완화)

### 💼 AI 커리어 컨설팅
- **자연어 이력서 작성** - 복잡한 JSON 형식 없이 자유롭게 작성
- 개인 맞춤형 커리어 조언 제공
- **5단계 상세 분석**: 강점 분석, 개선 제안, 추천 직무, 경력 발전 방향, 액션 플랜
- 실시간 AI 분석 및 즉시 결과 확인
- **컨설팅 히스토리 조회**: 과거 컨설팅 결과를 다시 확인 가능

### 📊 우울 수치 모니터링
- **K-LIWC 기반** 실시간 우울 수치 측정 및 기록
- **가중 평균 기반** 우울 수치 계산
- 현재 우울 수치 표시 (직관적인 색상 그라데이션)
- **recharts**를 활용한 시각적 데이터 표현
- 최근 대화 기록 및 우울 수치 추이 그래프
- 평균 우울 수치 추이 표시
- 8점 이상 시 관련 기관 안내
- **PHQ-9 우울 자가검사**: 표준화된 우울 검사 도구로 정확한 평가
- 최신 PHQ-9 결과를 대시보드에 표시

## 🛠 기술 스택

### 백엔드
- **FastAPI** - 고성능 웹 프레임워크
- **MongoDB** - NoSQL 데이터베이스
- **Uvicorn** - ASGI 서버
- **Pydantic** - 데이터 검증 및 설정 관리
- **JWT** - 인증 토큰 관리
- **bcrypt** - 비밀번호 해싱 (직접 사용)

### AI 서비스
- **OpenAI API** - ChatGPT (챗봇, 커리어 컨설팅)
- **Web Speech API** - 브라우저 네이티브 음성 인식 (STT)
- **Supertone API** - 음성 합성 (TTS)
- **직접 HTTP 요청** - OpenAI 라이브러리 대신 requests 사용으로 안정성 향상

### 프론트엔드
- **Next.js 16** - React 프레임워크
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Tailwind CSS v3** - 유틸리티 우선 CSS 프레임워크
- **recharts** - 데이터 시각화 (그래프)
- **Web Speech API** - 브라우저 네이티브 음성 인식

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/Hanshin-OSS-Hub/capstone25-retire-web.git
cd capstone25-retire-web
```

### 2. 백엔드 설정

#### 가상환경 생성 및 활성화
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 의존성 설치
```bash
pip install -r requirements.txt
```

#### 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=mentalcare_app

# JWT 설정
SECRET_KEY=your-secret-key-change-this-in-production

# OpenAI API 설정
OPENAI_API_KEY=your-openai-api-key-here

# Supertone API 설정
SUPERTONE_API_KEY=your_supertone_api_key_here
SUPERTONE_VOICE_ID=195e1922033a6168f0c90f
```

**⚠️ 보안 주의사항**: 
- `.env` 파일은 절대 Git에 커밋하지 마세요
- 실제 API 키는 `.env` 파일에만 저장하세요

#### MongoDB 실행
```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**⚠️ 중요**: MongoDB가 실행되지 않으면 로그인이 작동하지 않습니다!

#### 백엔드 서버 실행
```bash
python main.py
```

백엔드는 [http://localhost:8000](http://localhost:8000)에서 실행됩니다.

### 3. 프론트엔드 설정

#### 프론트엔드 디렉토리로 이동
```bash
cd frontend
```

#### 의존성 설치
```bash
npm install
```

#### 환경 변수 설정
`frontend/.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# ngrok 사용 시 (매 세션마다 URL이 변경되면 업데이트 필요)
NEXT_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

**ngrok 사용 시 (무료 플랜 - 한 세션만 사용 가능):**

무료 ngrok은 한 번에 하나의 터널만 사용할 수 있으므로, **프론트엔드만 ngrok으로 노출**하고 백엔드는 로컬 IP로 접근해야 합니다.

1. **PC의 로컬 IP 확인**:
   ```bash
   # Windows
   ipconfig
   # IPv4 주소 확인 (예: 192.168.0.100 또는 210.100.148.132)
   ```

2. **프론트엔드 ngrok 시작**:
   ```bash
   ngrok http 3000
   ```

3. **환경 변수 설정** (`frontend/.env.local`):
   ```env
   # 백엔드는 PC의 로컬 IP로 접근 (같은 네트워크에서만 가능)
   NEXT_PUBLIC_API_URL=http://210.100.148.132:8000
   # 프론트엔드 ngrok URL (매 세션마다 변경되면 업데이트)
   NEXT_PUBLIC_NGROK_URL=https://your-frontend-ngrok-url.ngrok-free.app
   ```

4. **프론트엔드 서버 재시작**:
   ```bash
   cd frontend
   npm run dev
   ```

**중요**: 
- `NEXT_PUBLIC_API_URL`은 **반드시 PC의 로컬 IP**로 설정해야 합니다 (localhost 불가)

- ngrok URL이 변경되면 `NEXT_PUBLIC_NGROK_URL`만 업데이트하면 됩니다

#### 프론트엔드 개발 서버 실행
```bash
npm run dev
```

프론트엔드는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 4. 다른 기기/네트워크에서 접속하기

1. **환경 변수 설정**
   - 백엔드 `.env` 파일에서 `ALLOWED_ORIGINS`를 실제 프론트엔드 주소로 설정합니다.
     ```env
     ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
     ```
   - 프론트엔드 `frontend/.env.local`에서 `NEXT_PUBLIC_API_URL`을 외부에서 접근 가능한 백엔드 URL로 설정합니다.
     ```env
     NEXT_PUBLIC_API_URL=https://api.example.com
     ```

2. **서버 바인딩**
   - FastAPI는 `uvicorn.run(..., host="0.0.0.0")`로 실행되므로 외부 접속이 가능합니다.
   - 방화벽/보안 그룹에서 8000(백엔드), 3000(프론트) 포트를 허용해야 합니다.

3. **로컬 네트워크 접속**
   - 모바일 등 같은 네트워크의 다른 기기에서 접속하려면 PC의 로컬 IP를 사용합니다.
     - 백엔드: `http://<PC_IP>:8000`
     - 프론트엔드: `http://<PC_IP>:3000`
   - FastAPI CORS 설정은 192/10/172 대역 IP와 ngrok 도메인을 자동으로 허용합니다.

4. **공인 도메인/HTTPS**
   - 배포 환경에서는 프록시(예: Nginx)에서 SSL을 종료하고, 백엔드로 프록시합니다.
   - 프론트엔드와 백엔드 모두 동일한 도메인(또는 `ALLOWED_ORIGINS`/`NEXT_PUBLIC_API_URL`로 명시된 도메인)을 사용해야 합니다.

## 📁 프로젝트 구조

```
retireweb/
├── main.py                 # FastAPI 애플리케이션 메인 파일
├── requirements.txt         # Python 의존성
├── .env                    # 환경 변수 (생성 필요)
├── .gitignore              # Git 무시 파일
├── README.md               # 프로젝트 문서
└── frontend/               # Next.js 프론트엔드
    ├── src/
    │   ├── app/            # Next.js App Router
    │   │   ├── page.tsx    # 메인 페이지
    │   │   ├── login/      # 로그인 페이지
    │   │   ├── signup/     # 회원가입 페이지
    │   │   └── dashboard/ # 대시보드 페이지
    │   ├── components/     # React 컴포넌트
    │   │   ├── DashboardHeader.tsx
    │   │   ├── DepressionStatus.tsx
    │   │   ├── TabNavigation.tsx
    │   │   ├── ChatTab.tsx
    │   │   ├── CareerTab.tsx
    │   │   ├── HistoryTab.tsx
    │   │   └── PhqTab.tsx
    │   └── lib/            # 유틸리티 함수
    │       └── api.ts      # API 통신 함수
    ├── package.json
    ├── tailwind.config.js
    └── .env.local          # 프론트엔드 환경 변수
```

## 🎯 핵심 특징

- **완전 작동하는 프로덕션 버전** - 모든 기능이 테스트되고 검증됨
- **자연어 이력서** - 사용자 친화적인 인터페이스
- **실시간 AI 분석** - 즉시 결과 확인 가능
- **안정적인 API 통신** - 직접 HTTP 요청으로 안정성 확보
- **반응형 디자인** - 모든 디바이스에서 최적화된 경험
- **노인 친화적 UI** - 큰 폰트, 넓은 버튼, 명확한 색상 대비
- **음성 대화 지원** - Web Speech API 기반 STT, Supertone API 기반 TTS
- **우울 수치 시각화** - recharts를 활용한 그래프 표시
- **PHQ-9 우울 자가검사** - 표준화된 우울 검사 도구로 정확한 평가
- **모던 UI/UX** - 글래스모피즘, 그라데이션, 부드러운 애니메이션
- **최적화된 타이포그래피** - Noto Sans KR 폰트, 최적화된 줄 간격
- **카카오톡 스타일 입력창** - 자동 높이 조절, 하단 고정 레이아웃

## 🔧 API 엔드포인트

### 인증
- `POST /api/signup` - 회원가입
- `POST /api/login` - 로그인
- `GET /api/user` - 사용자 정보 조회

### 챗봇
- `POST /api/chat` - 챗봇 대화
- `GET /api/chat/history` - 대화 기록 조회
- `GET /api/depression/status` - 우울 수치 상태 조회

### PHQ-9 설문조사
- `POST /api/phq9` - PHQ-9 설문 결과 제출
- `GET /api/phq9/latest` - 최신 PHQ-9 결과 조회

### 커리어 컨설팅
- `POST /api/career/consultation/natural` - 자연어 이력서 커리어 컨설팅
- `GET /api/career/history` - 커리어 컨설팅 기록 조회

### 음성 처리
- `POST /api/audio/transcribe` - 음성 인식 (현재 미사용, Web Speech API 사용)
- `POST /api/audio/synthesize` - 음성 합성 (Supertone API)

## 🎯 사용 방법

1. **회원가입/로그인**: 계정을 생성하고 로그인합니다.
2. **AI 챗봇**: 일상 대화를 나누며 우울 수치를 모니터링합니다.
   - 음성 입력 버튼을 눌러 음성으로 대화할 수 있습니다.
   - AI 응답의 🔊 버튼을 눌러 음성으로 들을 수 있습니다.
   - 카카오톡 스타일 입력창으로 긴 메시지도 편리하게 입력 가능합니다.
3. **PHQ-9 우울 자가검사**: 표준화된 설문조사를 통해 우울 수준을 정확히 평가합니다.
   - 설문 결과는 자동으로 저장되며 챗봇 응답에 반영됩니다.
4. **커리어 컨설팅**: 자연어로 이력서를 작성하고 AI 분석을 받습니다.
   - 과거 컨설팅 결과를 히스토리에서 다시 확인할 수 있습니다.
5. **대화 기록**: 우울 수치 변화를 차트로 확인합니다.

## ⚠️ 주의사항

- OpenAI API 키가 필요합니다.
- MongoDB가 실행 중이어야 합니다.
- 음성 기능을 사용하려면 Supertone API 키가 필요합니다.
- Web Speech API는 Chrome, Edge 등 최신 브라우저에서만 지원됩니다.
- 프로덕션 환경에서는 보안 설정을 강화하세요.

## 🔧 문제 해결

### 로그인이 안 될 때
1. **MongoDB 상태 확인**:
   ```bash
   netstat -ano | findstr :27017
   ```

2. **MongoDB 재시작**:
   ```bash
   net stop MongoDB
   net start MongoDB
   ```

3. **서버 재시작**:
   ```bash
   # Ctrl+C로 서버 중지 후
   python main.py
   ```

### 프론트엔드가 실행되지 않을 때
1. **의존성 재설치**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **포트 확인**:
   - 백엔드: 8000번 포트
   - 프론트엔드: 3000번 포트

### OpenAI API 오류
- API 키가 올바른지 확인
- 인터넷 연결 상태 확인
- API 사용량 한도 확인

### 음성 인식이 작동하지 않을 때
- Chrome, Edge 등 최신 브라우저 사용
- 마이크 권한 확인
- HTTPS 또는 localhost에서만 작동

# 🌟 RetireWeb

은퇴 후 AI 챗봇과 커리어 컨설팅을 통한 종합적인 멘탈케어 플랫폼입니다.

> **현재 상태**: 
- ✅ 로그인 구현 완료 (bcrypt 호환성 문제 해결)
- ✅ 챗봇 기능 구현 완료 (우울 수치 가중 평균 로직 적용)
- ✅ 음성 대화 기능 완료 (Web Speech API STT, Supertone API TTS)
- ✅ AI 컨설팅 구현 완료
- ✅ 프론트엔드 Next.js 전환 완료 (반응형 UI, 노인 친화적 디자인)
- ✅ 우울 수치 그래프 시각화 완료 (recharts)

## 📋 최근 업데이트 (2024)

### 🔐 인증 및 보안 개선
- **bcrypt 호환성 오류 해결**: `passlib`와 `bcrypt` 버전 호환성 문제 해결
- 직접 `bcrypt` 사용으로 우선 처리, `passlib`는 fallback으로 사용

### 🎨 프론트엔드 아키텍처 변경
- **Node.js/Next.js 도입**: 기존 정적 HTML/JS → Next.js 16 + React 19 + TypeScript로 전환
- App Router 구조 적용
- 구버전 정적 파일 제거 및 코드 정리

### 📱 반응형 UI 및 모바일 호환성
- **반응형 디자인 구현**: Tailwind CSS v3로 전환
- 모바일/태블릿/데스크톱 완전 대응
- 모바일 접속 시 API URL 자동 감지 및 설정
- **노인 친화적 UI 개선**:
  - 기본 폰트 크기 18px
  - 버튼 최소 크기 56x56px 이상
  - 색상 대비 강화, 간격 확대
  - 터치 타겟 크기 확대

### 🎤 음성 기능 개선
- **STT (Speech-to-Text)**: Whisper API → Web Speech API로 전환
  - 브라우저 네이티브 음성 인식 사용 (인식률 향상)
  - 한국어(`ko-KR`) 지원
- **TTS (Text-to-Speech)**: Web Speech API → Supertone API로 전환
  - 수동 재생 버튼 추가 (자동 재생 비활성화)
  - 재생 버튼 UI 개선

### 📊 우울 수치 분석 개선
- **로직 개선**: 가중 평균 적용으로 급격한 변동 완화
  - 최근 3개 대화 평균 30%, 전체 평균 30%, 새 수치 40% 가중치
- **표시 개선**:
  - 평균 우울 수치 → 현재 우울 수치로 변경
  - 수치에 따른 배경색 그라데이션 (0: 하늘색, 5: 초록색, 10: 붉은색)
  - 상태 텍스트 기준 조정 (7 이상: 높음, 3-6: 보통, 3 미만: 양호)

### 🎨 UI/UX 디자인 개선
- **색상 테마 변경**: 보라색 → 청록색(teal) 계열로 변경
- 배경 그라데이션: 부드러운 파스텔 톤
- 컴포넌트 개선 (대시보드 헤더, 탭 네비게이션, 그래프 반응형)

### 📝 대화 기록 기능 개선
- **시간 표시**: 대화 시간 표시 추가 (상대 시간, 한국 시간 기준)
- **정렬 및 표시**: 최근 대화를 위로 정렬, 사용자 닉네임 표시
- 우울 수치 그래프 추가 (recharts 사용)
- 평균선 표시 개선

## ✨ 주요 기능

### 🤖 AI 챗봇
- 일상 대화를 통한 우울 수치 모니터링 (0-10점)
- **Web Speech API** 기반 음성 인식 및 텍스트 변환 (STT)
- **Supertone API** 기반 음성 합성 (TTS)
- 실시간 감정 분석 및 적절한 응답 제공
- 가중 평균 기반 우울 수치 계산 (급격한 변동 완화)

### 💼 AI 커리어 컨설팅
- **자연어 이력서 작성** - 복잡한 JSON 형식 없이 자유롭게 작성
- 개인 맞춤형 커리어 조언 제공
- **5단계 상세 분석**: 강점 분석, 개선 제안, 추천 직무, 경력 발전 방향, 액션 플랜
- 실시간 AI 분석 및 즉시 결과 확인

### 📊 우울 수치 모니터링
- 실시간 우울 수치 측정 및 기록
- **가중 평균 기반** 우울 수치 계산
- 현재 우울 수치 표시 (배경색 그라데이션)
- **recharts**를 활용한 시각적 데이터 표현
- 최근 대화 기록 및 우울 수치 추이 그래프
- 평균 우울 수치 추이 표시
- 7점 이상 시 관련 기관 안내

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
```

#### 프론트엔드 개발 서버 실행
```bash
npm run dev
```

프론트엔드는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

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
    │   │   └── HistoryTab.tsx
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

## 🔧 API 엔드포인트

### 인증
- `POST /api/signup` - 회원가입
- `POST /api/login` - 로그인
- `GET /api/user` - 사용자 정보 조회

### 챗봇
- `POST /api/chat` - 챗봇 대화
- `GET /api/chat/history` - 대화 기록 조회
- `GET /api/depression/status` - 우울 수치 상태 조회

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
3. **커리어 컨설팅**: 자연어로 이력서를 작성하고 AI 분석을 받습니다.
4. **대화 기록**: 우울 수치 변화를 차트로 확인합니다.

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

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

## 🙏 감사의 말

- OpenAI - AI 서비스 제공
- FastAPI - 웹 프레임워크
- MongoDB - 데이터베이스
- Next.js - React 프레임워크
- recharts - 데이터 시각화
- Supertone - 음성 합성 API

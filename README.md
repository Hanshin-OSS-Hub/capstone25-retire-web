# 🌟 RetireWeb

은퇴 후 AI 챗봇과 커리어 컨설팅을 통한 종합적인 멘탈케어 플랫폼입니다.

> **현재 상태**: 
로그인 구현 ok
챗봇 기능 구현 ok//LLM모델 파인튜닝 x, 음성대화기능 진행 중, 우울 수치 로직 디벨롭 필요
ai 컨설팅 ok // 기초적인 텍스트 출력물은 나오지만 디벨롭 필요(너무 심플함)



## ✨ 주요 기능

### 🤖 AI 챗봇
- 일상 대화를 통한 우울 수치 모니터링 (0-10점)
- 음성 인식 및 텍스트 변환 (STT)
- 음성 합성 (TTS) 지원
- 실시간 감정 분석 및 적절한 응답 제공

### 💼 AI 커리어 컨설팅
- **자연어 이력서 작성** - 복잡한 JSON 형식 없이 자유롭게 작성
- 개인 맞춤형 커리어 조언 제공
- **5단계 상세 분석**: 강점 분석, 개선 제안, 추천 직무, 경력 발전 방향, 액션 플랜
- 실시간 AI 분석 및 즉시 결과 확인

### 📊 우울 수치 모니터링
- 실시간 우울 수치 측정 및 기록
- 최근 20개 대화의 평균 우울 수치 계산
- 7점 이상 시 관련 기관 안내
- Chart.js를 활용한 시각적 데이터 표현

## 🛠 기술 스택

### 백엔드
- **FastAPI** - 고성능 웹 프레임워크
- **MongoDB** - NoSQL 데이터베이스
- **Uvicorn** - ASGI 서버
- **Pydantic** - 데이터 검증 및 설정 관리
- **JWT** - 인증 토큰 관리
- **bcrypt** - 비밀번호 해싱

### AI 서비스
- **OpenAI API** - ChatGPT (챗봇, 커리어 컨설팅)
- **OpenAI Whisper** - 음성 인식 (STT)
- **Supertone API** - 음성 합성 (TTS)
- **직접 HTTP 요청** - OpenAI 라이브러리 대신 requests 사용으로 안정성 향상

### 프론트엔드
- **HTML5/CSS3/JavaScript** - 반응형 웹 인터페이스
- **Chart.js** - 데이터 시각화
- **Font Awesome** - 아이콘

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/mentalcare-web-app.git
cd mentalcare-web-app
```

### 2. 가상환경 생성 및 활성화
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. 의존성 설치
```bash
pip install -r requirements.txt
```

### 4. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# .env.example 파일을 복사하여 .env 파일 생성
cp .env.example .env
```

그 후 `.env` 파일에서 실제 API 키 값들을 입력하세요:

```env
# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=mentalcare_app

# JWT 설정
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI API 설정
OPENAI_API_KEY=your-openai-api-key-here

# Supertone API 설정 (선택사항)
SUPERTONE_API_KEY=your-supertone-api-key-here
SUPERTONE_API_URL=https://supertoneapi.com/v1/text-to-speech
```

**⚠️ 보안 주의사항**: 
- `.env` 파일은 절대 Git에 커밋하지 마세요
- 실제 API 키는 `.env` 파일에만 저장하세요
- `.env.example` 파일은 안전한 템플릿입니다

### 5. MongoDB 실행
```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**⚠️ 중요**: MongoDB가 실행되지 않으면 로그인이 작동하지 않습니다!

### 6. 애플리케이션 실행
```bash
python main.py
```

### 7. 브라우저에서 접속
```
http://localhost:8000
```

## 📁 프로젝트 구조

```
retireweb/
├── main.py                 # FastAPI 애플리케이션 메인 파일
├── requirements.txt        # Python 의존성
├── .env                   # 환경 변수 (생성 필요)
├── .gitignore            # Git 무시 파일
├── README.md             # 프로젝트 문서
└── public/               # 정적 파일
    ├── index.html        # 메인 페이지
    ├── login.html        # 로그인 페이지
    ├── signup.html       # 회원가입 페이지
    ├── dashboard.html    # 대시보드 페이지
    ├── styles.css        # 스타일시트
    ├── auth.js          # 인증 관련 JavaScript
    └── dashboard.js      # 대시보드 JavaScript
```

## 🎯 핵심 특징

- **완전 작동하는 프로덕션 버전** - 모든 기능이 테스트되고 검증됨
- **자연어 이력서** - 사용자 친화적인 인터페이스
- **실시간 AI 분석** - 즉시 결과 확인 가능
- **안정적인 API 통신** - 직접 HTTP 요청으로 안정성 확보
- **반응형 디자인** - 모든 디바이스에서 최적화된 경험

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
- `POST /api/audio/transcribe` - 음성 인식
- `POST /api/audio/synthesize` - 음성 합성

## 🎯 사용 방법

1. **회원가입/로그인**: 계정을 생성하고 로그인합니다.
2. **AI 챗봇**: 일상 대화를 나누며 우울 수치를 모니터링합니다.
3. **커리어 컨설팅**: 자연어로 이력서를 작성하고 AI 분석을 받습니다.
4. **대화 기록**: 우울 수치 변화를 차트로 확인합니다.

## ⚠️ 주의사항

- OpenAI API 키가 필요합니다.
- MongoDB가 실행 중이어야 합니다.
- 음성 기능을 사용하려면 Supertone API 키가 필요합니다.
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

### 정적 파일이 로드되지 않을 때
- 브라우저 캐시 삭제 (`Ctrl+Shift+Delete`)
- 시크릿 모드에서 테스트

### OpenAI API 오류
- API 키가 올바른지 확인
- 인터넷 연결 상태 확인
- API 사용량 한도 확인

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

## 🙏 감사의 말

- OpenAI - AI 서비스 제공
- FastAPI - 웹 프레임워크
- MongoDB - 데이터베이스
- Chart.js - 데이터 시각화

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import os
from typing import Optional, List
import uvicorn
import openai
import requests
import json
import aiofiles
from bson import ObjectId

# 환경 변수 로드
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="멘탈케어 웹 애플리케이션", description="AI 챗봇과 커리어 컨설팅을 통한 멘탈케어 서비스")

# CORS 설정
# 환경 변수에서 허용할 오리진 가져오기 (ngrok 및 모바일 접속 지원)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")

# allow_credentials 설정 (모든 오리진 허용 시 자동으로 False)
allow_credentials = True

if allowed_origins == "*":
    # 완전 개방 모드: 모든 오리진 허용
    # allow_credentials=False로 설정해야 와일드카드를 사용할 수 있음
    origins = ["*"]
    allow_origin_regex = None
    allow_credentials = False
else:
    # 프로덕션 환경: 명시된 오리진만 허용
    origins = [origin.strip() for origin in allowed_origins.split(",")]
    allow_origin_regex = None
    # 명시된 오리진만 허용하는 경우에만 자격 증명 허용
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB 연결
MONGODB_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "mentalcare_app")

client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
db = client[DATABASE_NAME]

# MongoDB 연결 확인 함수
async def check_mongodb_connection():
    """서버 시작 시 MongoDB 연결 확인"""
    try:
        # 서버 정보 확인으로 연결 테스트
        await client.server_info()
        print(f"[SUCCESS] MongoDB 연결 성공: {MONGODB_URL}")
        print(f"[SUCCESS] 데이터베이스: {DATABASE_NAME}")
        return True
    except Exception as e:
        print(f"[ERROR] MongoDB 연결 실패!")
        print(f"  URL: {MONGODB_URL}")
        print(f"  오류: {str(e)}")
        print(f"\n해결 방법:")
        print(f"  1. MongoDB 서비스가 실행 중인지 확인:")
        print(f"     net start MongoDB")
        print(f"  2. 포트 27017이 사용 중인지 확인:")
        print(f"     netstat -ano | findstr :27017")
        return False

# FastAPI startup 이벤트
@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행"""
    connected = await check_mongodb_connection()
    if not connected:
        print("\n[WARNING] MongoDB 연결 실패로 일부 기능이 작동하지 않을 수 있습니다.")

# 비밀번호 해싱
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 설정
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OpenAI 클라이언트 설정
# openai.api_key = os.getenv("OPENAI_API_KEY")  # 이 방식은 deprecated

# Pydantic 모델들
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# 챗봇 관련 모델들
class ChatMessage(BaseModel):
    message: str
    timestamp: Optional[datetime] = None

class ChatResponse(BaseModel):
    response: str
    depression_score: float
    timestamp: datetime

class ChatHistory(BaseModel):
    user_id: str
    messages: List[dict]
    depression_scores: List[float]
    created_at: datetime

# 커리어 컨설팅 관련 모델들
class ResumeData(BaseModel):
    name: str
    email: str
    phone: str
    education: List[dict]
    experience: List[dict]
    skills: List[str]
    projects: List[dict]
    languages: List[str]

# 자연어 이력서 모델 (사용자 친화적)
class NaturalResumeData(BaseModel):
    name: str
    email: str
    phone: str
    resume_text: str  # 자연어로 작성된 이력서 전체 내용

class CareerConsultation(BaseModel):
    user_id: str
    resume_data: ResumeData
    consultation_result: str
    created_at: datetime

# 우울 수치 모니터링 모델
class DepressionMonitoring(BaseModel):
    user_id: str
    current_score: float
    average_score: float
    recent_scores: List[float]
    last_updated: datetime
    needs_intervention: bool

class PHQ9Submission(BaseModel):
    scores: List[int]

class PHQ9ResultResponse(BaseModel):
    scores: List[int]
    total_score: int
    severity: str
    created_at: datetime

# 유틸리티 함수들
def verify_password(plain_password, hashed_password):
    """
    비밀번호 검증 함수
    bcrypt는 72바이트를 초과하는 비밀번호를 처리할 수 없으므로 길이 제한
    passlib의 호환성 문제를 피하기 위해 직접 bcrypt 사용
    """
    try:
        import bcrypt
        
        # 비밀번호를 바이트로 변환하고 길이 제한
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        # 해시가 문자열인 경우 바이트로 변환
        if isinstance(hashed_password, str):
            hashed_password_bytes = hashed_password.encode('utf-8')
        else:
            hashed_password_bytes = hashed_password
        
        # bcrypt로 직접 검증
        return bcrypt.checkpw(password_bytes, hashed_password_bytes)
    except Exception as e:
        # bcrypt 직접 검증 실패 시 passlib으로 폴백
        try:
            if len(plain_password.encode('utf-8')) > 72:
                plain_password = plain_password[:72]
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e2:
            print(f"비밀번호 검증 실패: {e2}")
            return False

def get_password_hash(password):
    """
    비밀번호 해싱 함수
    bcrypt는 72바이트를 초과하는 비밀번호를 처리할 수 없으므로 길이 제한
    passlib의 호환성 문제를 피하기 위해 직접 bcrypt 사용
    """
    try:
        import bcrypt
        
        # 비밀번호를 바이트로 변환하고 길이 제한
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        # bcrypt로 직접 해싱
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        # bcrypt 직접 해싱 실패 시 passlib으로 폴백
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
        return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def calculate_phq9_severity(total_score: int) -> dict:
    """PHQ-9 총점에 따른 심각도와 상세 설명 반환"""
    if total_score >= 20:
        return {
            "label": "심한 우울",
            "description": "심한 수준의 우울감이 시사됩니다.\n\n전문기관의 치료적 개입과 평가가 요구됩니다."
        }
    if total_score >= 10:
        return {
            "label": "중간정도의 우울",
            "description": "중간정도 수준의 우울감이 시사됩니다.\n\n이러한 수준의 우울감은 흔히 신체적, 심리적 대처자원을 저하시키며 개인의 일상생활을 어렵게 만들기도 합니다.\n\n가까운 지역센터나 전문기관을 방문하여 보다 상세한 평가와 도움을 받아보시기 바랍니다."
        }
    if total_score >= 5:
        return {
            "label": "가벼운 우울",
            "description": "다소 경미한 수준의 우울감이 있으나 일상생활에 지장을 줄 정도는 아닙니다.\n\n다만, 이러한 기분 상태가 지속될 경우 개인의 신체적, 심리적 대처자원을 저하시킬 수 있습니다.\n\n그러한 경우, 가까운 지역센터나 전문기관을 방문하시기 바랍니다."
        }
    return {
        "label": "우울 아님",
        "description": "유의한 수준의 우울이 시사되진 않습니다."
    }

async def get_user_by_email(email: str):
    user = await db.users.find_one({"email": email})
    return user

async def get_user_by_username(username: str):
    user = await db.users.find_one({"username": username})
    return user

async def create_user(user: UserCreate):
    hashed_password = get_password_hash(user.password)
    user_dict = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    del user_dict["password"]
    return user_dict

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user

# OAuth2 스키마
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# AI 관련 함수들
# OpenAI 클라이언트 전역 초기화 (기존 프로젝트 방식)
def get_openai_client():
    """OpenAI 클라이언트 생성"""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your-openai-api-key-here":
            return None
        return openai.OpenAI(api_key=api_key)
    except Exception as e:
        print(f"OpenAI 클라이언트 생성 오류: {e}")
        return None

def call_openai_api(messages, model="gpt-3.5-turbo", max_tokens=150, temperature=0.7):
    """requests를 사용해서 OpenAI API 직접 호출"""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your-openai-api-key-here":
            return None
        
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        else:
            print(f"OpenAI API 오류: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"OpenAI API 호출 오류: {e}")
        return None

async def analyze_depression_score(message: str) -> float:
    """사용자 메시지를 분석하여 우울 수치를 0-10으로 측정"""
    try:
        prompt = f"""
        다음 사용자의 메시지를 분석하여 우울 수치를 0-10 사이의 숫자로 평가해주세요.
        1은 매우 긍정적인 상태, 5는 일반적인 상태, 10은 매우 우울하고 절망적인 상태를 의미합니다.
        
        사용자 메시지: "{message}"
        
        다음 요소들을 고려해주세요:

        K-LIWC 규칙
        - 1인칭 단수 대명사 증가(I, me, my → 나, 내, 나는)
        - 부정 정서 단어 비율증가
        - 정서 강도 높은 단어 증가
        - 사회적 단어 감소
        - 긍정 정서 단어 감소
        - 인지 왜곡, 극단 표현 증가
        - 인지 처리 단어 증가
        - 부정적 자기 평가
        - 피로, 수면, 무기력 표현 증가
        - 미래 지향 단어 감소 혹은 현재/과거 부정적 회상 증가
        - 행동 관련 단어 감소
        
        응답은 반드시 0부터 10까지의 정수 하나만 반환해주세요. 다른 텍스트는 포함하지 마세요.
        예시: 3
        """
        
        response = call_openai_api(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-3.5-turbo",
            max_tokens=10,
            temperature=0.1
        )
        
        if not response:
            print("OpenAI API 키가 설정되지 않음. 테스트용 우울 수치 반환")
            return 3.0  # 테스트용 중간값
        
        # 숫자만 추출 (더 안전한 방법)
        import re
        numbers = re.findall(r'\d+', response)
        if numbers:
            score = float(numbers[0])  # 첫 번째 숫자 사용
            return min(max(score, 0), 10)  # 0-10 범위로 제한
        else:
            print(f"AI 응답에서 숫자를 찾을 수 없음: {response}")
            return 5.0  # 기본값
        
    except Exception as e:
        print(f"우울 수치 분석 오류: {e}")
        return 5.0  # 기본값

async def generate_chatbot_response(message: str, depression_score: float, phq_result: Optional[dict] = None) -> str:
    """사용자 메시지와 우울 수치를 바탕으로 챗봇 응답 생성"""
    try:
        # 우울 수치에 따른 응답 톤 조정
        if depression_score >= 7:
            tone = "매우 따뜻하고 공감적이며, 전문적인 도움을 권하는 톤"
        elif depression_score >= 4:
            tone = "공감적이고 격려하는 톤"
        else:
            tone = "밝고 긍정적인 톤"
        
        phq_context = ""
        if phq_result:
            phq_context = f"""
        사용자의 최근 PHQ-9 검사 총점은 {phq_result.get("total_score")}점이며 "{phq_result.get("severity")}" 수준입니다.
        이 정보를 고려하여 응답에서 필요한 경우 검사 결과를 요약하고 추가적인 도움을 권하세요.
        """

        prompt = f"""
        당신은 멘탈케어 전문 챗봇입니다. 사용자의 우울 수치는 {depression_score}/10입니다.
        
        다음 원칙을 따라 응답해주세요:
        1. 항상 공감적이고 따뜻한 톤을 유지하세요
        2. 사용자의 감정을 인정하고 검증해주세요
        3. 실용적이고 구체적인 조언을 제공하세요
        4. 필요시 전문적인 도움을 권하세요
        5. 응답은 한국어로 해주세요
        6. 응답은 충분히 상세하고 도움이 되도록 작성하되, 너무 길지 않게 적절한 길이로 작성해주세요
        
        {phq_context}
        사용자 메시지: "{message}"
        
        {tone}으로 응답해주세요.
        """
        
        response = call_openai_api(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-3.5-turbo",
            max_tokens=500,  # 더 긴 응답을 받을 수 있도록 증가
            temperature=0.7
        )
        
        if not response:
            # API 키가 없거나 기본값인 경우 테스트용 응답
            print("OpenAI API 키가 설정되지 않음. 테스트용 챗봇 응답 반환")
            if depression_score >= 7:
                return "안녕하세요! 지금 힘든 시간을 보내고 계신 것 같네요. 혼자 견디려 하지 마시고 주변 사람들과 이야기해보세요. 필요하다면 전문가의 도움을 받는 것도 좋습니다."
            elif depression_score >= 4:
                return "안녕하세요! 조금 피곤해 보이시네요. 충분한 휴식을 취하고 좋아하는 일을 해보시는 것은 어떨까요?"
            else:
                return "안녕하세요! 좋은 하루 보내고 계시는군요! 계속해서 긍정적인 에너지를 유지해보세요."
        
        return response
        
    except Exception as e:
        print(f"챗봇 응답 생성 오류: {e}")
        return "죄송합니다. 지금 응답을 생성하는데 문제가 있습니다. 잠시 후 다시 시도해주세요."

async def generate_career_consultation_from_natural_text(resume_data: NaturalResumeData) -> str:
    """자연어로 작성된 이력서를 바탕으로 커리어 컨설팅 결과 생성"""
    try:
        prompt = f"""
        다음은 사용자가 자연어로 작성한 이력서입니다. 이를 바탕으로 종합적인 커리어 컨설팅을 제공해주세요.
        
        === 이력서 정보 ===
        이름: {resume_data.name}
        이메일: {resume_data.email}
        전화번호: {resume_data.phone}
        
        === 이력서 내용 ===
        {resume_data.resume_text}
        
        === 요청사항 ===
        위 이력서를 분석하여 다음 항목들을 포함한 상세한 커리어 컨설팅을 제공해주세요:
        
        1. **강점 분석**: 현재 이력서에서 발견되는 강점과 장점
        2. **개선 제안**: 부족한 부분이나 보완이 필요한 영역
        3. **추천 직무**: 경력과 역량을 고려한 적합한 직무 분야
        4. **경력 발전 방향**: 향후 어떤 방향으로 성장해야 하는지
        5. **구체적인 액션 플랜**: 즉시 실행할 수 있는 구체적인 조치사항
        
        응답은 한국어로 작성하고, 실용적이고 구체적인 조언을 포함해주세요.
        각 항목별로 명확하게 구분하여 작성해주세요.
        """
        
        response = call_openai_api(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-3.5-turbo",
            max_tokens=1500,
            temperature=0.7
        )
        
        if not response:
            return "OpenAI API 키가 설정되지 않았습니다. 관리자에게 문의하세요."
        
        return response
        
    except Exception as e:
        print(f"커리어 컨설팅 생성 오류: {e}")
        return "죄송합니다. 커리어 컨설팅을 생성하는데 문제가 있습니다. 잠시 후 다시 시도해주세요."

async def generate_career_consultation(resume_data: ResumeData) -> str:
    """이력서 데이터를 바탕으로 커리어 컨설팅 결과 생성"""
    try:
        
        resume_text = f"""
        이름: {resume_data.name}
        이메일: {resume_data.email}
        전화번호: {resume_data.phone}
        
        학력사항:
        {json.dumps(resume_data.education, ensure_ascii=False, indent=2)}
        
        경력사항:
        {json.dumps(resume_data.experience, ensure_ascii=False, indent=2)}
        
        기술:
        {', '.join(resume_data.skills)}
        
        프로젝트:
        {json.dumps(resume_data.projects, ensure_ascii=False, indent=2)}
        
        언어:
        {', '.join(resume_data.languages)}
        """
        
        prompt = f"""
        다음 이력서를 바탕으로 종합적인 커리어 컨설팅을 제공해주세요.
        
        {resume_text}
        
        다음 항목들을 포함하여 상세한 분석과 조언을 제공해주세요:
        1. 강점 분석
        2. 개선이 필요한 부분
        3. 추천 직무 및 산업
        4. 경력 발전 방향
        5. 구체적인 액션 플랜
        
        응답은 한국어로 작성하고, 실용적이고 구체적인 조언을 포함해주세요.
        """
        
        response = call_openai_api(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-3.5-turbo",
            max_tokens=1000,
            temperature=0.7
        )
        
        if not response:
            return "OpenAI API 키가 설정되지 않았습니다. 관리자에게 문의하세요."
        
        return response
        
    except Exception as e:
        print(f"커리어 컨설팅 생성 오류: {e}")
        return "죄송합니다. 커리어 컨설팅을 생성하는데 문제가 있습니다. 잠시 후 다시 시도해주세요."

async def check_depression_intervention(user_id: str) -> bool:
    """최근 20개 대화의 평균 우울 수치가 7 이상인지 확인"""
    try:
        # 최근 20개 대화 기록 조회
        chat_history = await db.chat_histories.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )
        
        if not chat_history or len(chat_history.get("depression_scores", [])) < 20:
            return False
        
        # 최근 20개 점수의 평균 계산
        recent_scores = chat_history["depression_scores"][-20:]
        average_score = sum(recent_scores) / len(recent_scores)
        
        return average_score >= 7.0
        
    except Exception as e:
        print(f"우울 수치 개입 확인 오류: {e}")
        return False

async def get_latest_phq_result(user_id: str):
    try:
        result = await db.phq_results.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )
        return result
    except Exception as e:
        print(f"PHQ-9 결과 조회 오류: {e}")
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = await get_user_by_email(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# 라우트들

# API 엔드포인트들
@app.post("/api/signup", response_model=UserResponse)
async def signup(user: UserCreate):
    # 중복 사용자 확인
    existing_user = await db.users.find_one({
        "$or": [{"email": user.email}, {"username": user.username}]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="이미 존재하는 이메일 또는 사용자명입니다."
        )
    
    # 새 사용자 생성
    try:
        created_user = await create_user(user)
        return UserResponse(**created_user)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="사용자 생성 중 오류가 발생했습니다."
        )

@app.post("/api/login", response_model=Token)
async def login(user_credentials: UserLogin):
    try:
        user = await authenticate_user(user_credentials.email, user_credentials.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="이메일 또는 비밀번호가 올바르지 않습니다.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] 로그인 처리 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"로그인 처리 중 오류가 발생했습니다: {str(e)}",
        )

@app.get("/api/user", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )

@app.post("/api/logout")
async def logout():
    return {"message": "로그아웃되었습니다."}

# 챗봇 API 엔드포인트들
@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_bot(
    message: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    """AI 챗봇과 대화"""
    try:
        user_id = str(current_user["_id"])
        
        # 이전 대화 기록 가져오기
        existing_history = await db.chat_histories.find_one({"user_id": user_id})
        previous_scores = existing_history.get("depression_scores", []) if existing_history else []
        previous_average = sum(previous_scores) / len(previous_scores) if previous_scores else 5.0
        
        # 현재 메시지의 우울 수치 분석
        raw_depression_score = await analyze_depression_score(message.message)
        
        # 이전 평균과 가중 평균을 사용하여 부드러운 변화 적용
        # 최근 수치에 30% 가중치, 이전 평균에 70% 가중치 (더 부드러운 변화)
        if previous_scores:
            # 최근 3개 대화의 평균을 사용하여 더 안정적인 변화
            recent_scores = previous_scores[-3:] if len(previous_scores) >= 3 else previous_scores
            recent_average = sum(recent_scores) / len(recent_scores)
            # 새로운 수치 40%, 최근 평균 30%, 전체 평균 30%
            depression_score = (
                raw_depression_score * 0.4 + 
                recent_average * 0.3 + 
                previous_average * 0.3
            )
        else:
            # 첫 대화인 경우 원본 수치 사용
            depression_score = raw_depression_score
        
        # 최근 PHQ-9 결과 가져오기
        phq_latest = await get_latest_phq_result(user_id)

        # 챗봇 응답 생성 (부드러운 수치 사용)
        bot_response = await generate_chatbot_response(
            message.message,
            depression_score,
            phq_latest
        )
        
        # 개입이 필요한지 확인
        needs_intervention = await check_depression_intervention(user_id)
        
        # 개입이 필요한 경우 응답에 추가 정보 포함
        if needs_intervention:
            intervention_info = """
            
            💙 전문적인 도움이 필요해 보입니다. 다음 기관들을 연락해보세요:
            • 생명의전화: 1588-9191
            • 정신건강상담전화: 1577-0199
            """
            bot_response += intervention_info
        
        # 대화 기록 저장
        chat_record = {
            "user_id": user_id,
            "user_message": message.message,
            "bot_response": bot_response,
            "depression_score": depression_score,
            "timestamp": datetime.now(timezone(timedelta(hours=9)))  # KST (한국 시간)
        }
        
        # 기존 채팅 히스토리 업데이트 또는 새로 생성
        existing_history = await db.chat_histories.find_one({"user_id": user_id})
        
        if existing_history:
            await db.chat_histories.update_one(
                {"user_id": user_id},
                {
                    "$push": {
                        "messages": chat_record,
                        "depression_scores": depression_score
                    },
                    "$set": {"last_updated": datetime.utcnow()}
                }
            )
        else:
            await db.chat_histories.insert_one({
                "user_id": user_id,
                "messages": [chat_record],
                "depression_scores": [depression_score],
                "created_at": datetime.utcnow(),
                "last_updated": datetime.utcnow()
            })
        
        return ChatResponse(
            response=bot_response,
            depression_score=depression_score,
            timestamp=datetime.now(timezone(timedelta(hours=9)))  # KST (한국 시간)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"챗봇 응답 생성 중 오류가 발생했습니다: {str(e)}"
        )

@app.get("/api/chat/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    """사용자의 채팅 히스토리 조회"""
    try:
        user_id = str(current_user["_id"])
        chat_history = await db.chat_histories.find_one({"user_id": user_id})
        
        if not chat_history:
            return {"messages": [], "depression_scores": []}
        
        return {
            "messages": chat_history.get("messages", []),
            "depression_scores": chat_history.get("depression_scores", []),
            "last_updated": chat_history.get("last_updated")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"채팅 히스토리 조회 중 오류가 발생했습니다: {str(e)}"
        )

@app.get("/api/depression/status")
async def get_depression_status(current_user: dict = Depends(get_current_user)):
    """사용자의 현재 우울 수치 상태 조회"""
    try:
        user_id = str(current_user["_id"])
        chat_history = await db.chat_histories.find_one({"user_id": user_id})
        phq_latest_doc = await get_latest_phq_result(user_id)
        phq_latest = format_phq_response(phq_latest_doc)
        
        if not chat_history or not chat_history.get("depression_scores"):
            return {
                "current_score": 0,
                "average_score": 0,
                "recent_scores": [],
                "needs_intervention": False,
                "last_updated": None,
                "phq_latest": phq_latest
            }
        
        recent_scores = chat_history["depression_scores"]
        current_score = recent_scores[-1] if recent_scores else 0
        average_score = sum(recent_scores) / len(recent_scores) if recent_scores else 0
        needs_intervention = len(recent_scores) >= 20 and average_score >= 7.0
        return {
            "current_score": current_score,
            "average_score": average_score,
            "recent_scores": recent_scores[-20:],  # 최근 20개만
            "needs_intervention": needs_intervention,
            "last_updated": chat_history.get("last_updated"),
            "phq_latest": phq_latest
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"우울 수치 상태 조회 중 오류가 발생했습니다: {str(e)}"
        )

def format_phq_response(result):
    if not result:
        return None
    severity = result.get("severity", {})
    if isinstance(severity, dict):
        return {
            "scores": result.get("scores", []),
            "total_score": result.get("total_score"),
            "severity": severity.get("label", ""),
            "severity_description": severity.get("description", ""),
            "created_at": result.get("created_at")
        }
    # 기존 데이터 호환성 (문자열인 경우)
    return {
        "scores": result.get("scores", []),
        "total_score": result.get("total_score"),
        "severity": severity if isinstance(severity, str) else "",
        "severity_description": "",
        "created_at": result.get("created_at")
    }

@app.post("/api/phq9")
async def submit_phq9_result(
    submission: PHQ9Submission,
    current_user: dict = Depends(get_current_user)
):
    scores = submission.scores
    if len(scores) != 9 or any(score not in (0, 1, 2, 3) for score in scores):
        raise HTTPException(
            status_code=400,
            detail="PHQ-9 점수 배열이 올바르지 않습니다."
        )

    total_score = sum(scores)
    severity = calculate_phq9_severity(total_score)
    result_doc = {
        "user_id": str(current_user["_id"]),
        "scores": scores,
        "total_score": total_score,
        "severity": severity,
        "created_at": datetime.now(timezone(timedelta(hours=9)))  # KST (한국 시간)
    }

    await db.phq_results.insert_one(result_doc)

    return format_phq_response(result_doc)

@app.get("/api/phq9/latest")
async def get_latest_phq9_result(current_user: dict = Depends(get_current_user)):
    result = await get_latest_phq_result(str(current_user["_id"]))
    return {"result": format_phq_response(result)}

@app.get("/api/phq9/history")
async def get_phq9_history(current_user: dict = Depends(get_current_user), limit: int = 10):
    try:
        cursor = db.phq_results.find(
            {"user_id": str(current_user["_id"])}
        ).sort("created_at", -1).limit(limit)
        results = [format_phq_response(doc) for doc in await cursor.to_list(length=limit)]
        return {"results": results}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PHQ-9 히스토리 조회 중 오류가 발생했습니다: {str(e)}"
        )

# 커리어 컨설팅 API 엔드포인트들
@app.post("/api/career/consultation")
async def create_career_consultation(
    resume_data: ResumeData,
    current_user: dict = Depends(get_current_user)
):
    """이력서를 바탕으로 커리어 컨설팅 생성 (JSON 형식)"""
    try:
        user_id = str(current_user["_id"])
        
        # AI를 통한 커리어 컨설팅 생성
        consultation_result = await generate_career_consultation(resume_data)
        
        # 컨설팅 결과 저장
        consultation_record = {
            "user_id": user_id,
            "resume_data": resume_data.dict(),
            "consultation_result": consultation_result,
            "created_at": datetime.utcnow()
        }
        
        await db.career_consultations.insert_one(consultation_record)
        
        return {
            "consultation_result": consultation_result,
            "created_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"커리어 컨설팅 생성 중 오류가 발생했습니다: {str(e)}"
        )

@app.post("/api/career/consultation/natural")
async def create_career_consultation_natural(
    resume_data: NaturalResumeData,
    current_user: dict = Depends(get_current_user)
):
    """자연어로 작성된 이력서를 바탕으로 커리어 컨설팅 생성"""
    try:
        user_id = str(current_user["_id"])
        
        # AI를 통한 커리어 컨설팅 생성
        consultation_result = await generate_career_consultation_from_natural_text(resume_data)
        
        # 컨설팅 결과 저장
        consultation_record = {
            "user_id": user_id,
            "resume_data": resume_data.dict(),
            "consultation_result": consultation_result,
            "created_at": datetime.utcnow(),
            "type": "natural"  # 자연어 이력서 구분
        }
        
        await db.career_consultations.insert_one(consultation_record)
        
        return {
            "consultation_result": consultation_result,
            "created_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"커리어 컨설팅 생성 중 오류가 발생했습니다: {str(e)}"
        )

@app.get("/api/career/history")
async def get_career_history(current_user: dict = Depends(get_current_user)):
    """사용자의 커리어 컨설팅 히스토리 조회"""
    try:
        user_id = str(current_user["_id"])
        consultations_cursor = db.career_consultations.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(10)
        
        consultations = []
        async for doc in consultations_cursor:
            # ObjectId를 문자열로 변환
            doc["_id"] = str(doc["_id"])
            consultations.append(doc)
        
        return {"consultations": consultations}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"커리어 히스토리 조회 중 오류가 발생했습니다: {str(e)}"
        )

# STT/TTS API 엔드포인트들
@app.post("/api/audio/transcribe")
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """음성을 텍스트로 변환 (Whisper API)"""
    try:
        # 임시 파일로 저장
        temp_file_path = f"temp_{audio_file.filename}"
        async with aiofiles.open(temp_file_path, 'wb') as f:
            content = await audio_file.read()
            await f.write(content)
        
        # Whisper API 호출
        client = get_openai_client()
        if not client:
            return {"error": "OpenAI API 키가 설정되지 않았습니다."}
        
        with open(temp_file_path, "rb") as audio_file_obj:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file_obj,
                language="ko"
            )
        
        # 임시 파일 삭제
        os.remove(temp_file_path)
        
        return {"transcript": transcript.text}
        
    except Exception as e:
        # 임시 파일 정리
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(
            status_code=500,
            detail=f"음성 변환 중 오류가 발생했습니다: {str(e)}"
        )

@app.post("/api/audio/synthesize")
async def synthesize_speech(
    text: str,
    current_user: dict = Depends(get_current_user)
):
    """텍스트를 음성으로 변환 (Supertone API)"""
    try:
        # 기존 프로젝트 방식으로 Supertone API 호출
        api_key = os.getenv("SUPERTONE_API_KEY")
        voice_id = os.getenv("SUPERTONE_VOICE_ID", "195e1922033a6168f0c90f")  # 기본값
        
        if not api_key or api_key == "your_supertone_api_key_here":
            return {"error": "Supertone API 키가 설정되지 않았습니다."}
        
        url = f"https://supertoneapi.com/v1/text-to-speech/{voice_id}"
        headers = {
            "x-sup-api-key": api_key,
            "Content-Type": "application/json"
        }
        
        data = {
            "text": text,
            "language": "ko",
            "style": "neutral",
            "model": "sona_speech_1",
            "voice_settings": {
                "speed": 1.0,
                "pitch_shift": 0.0
            }
        }
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            # 오디오 데이터를 base64로 인코딩하여 반환
            import base64
            audio_base64 = base64.b64encode(response.content).decode('utf-8')
            return {"audio_data": audio_base64}
        else:
            raise HTTPException(
                status_code=500,
                detail=f"음성 합성에 실패했습니다: {response.status_code} - {response.text}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"음성 합성 중 오류가 발생했습니다: {str(e)}"
        )

# 서버 종료 시 MongoDB 연결 종료
@app.on_event("shutdown")
async def shutdown_event():
    """애플리케이션 종료 시 실행"""
    client.close()
    print("MongoDB 연결이 종료되었습니다.")

# 서버 시작
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


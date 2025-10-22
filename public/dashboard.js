// 전역 변수
let depressionChart = null;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// 대시보드 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
    // 사용자 정보 로드
    await loadUserInfo();
    
    // 우울 수치 상태 로드
    await loadDepressionStatus();
    
    // 탭 네비게이션 설정
    setupTabNavigation();
    
    // 챗봇 기능 설정
    setupChatbot();
    
    // 커리어 컨설팅 기능 설정
    setupCareerConsultation();
    
    // 로그아웃 버튼 이벤트
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
        });
    }
});

// 사용자 정보 로드
async function loadUserInfo() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // 사용자명 표시
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = result.username;
            }
            
            // 이메일 표시
            const emailElement = document.getElementById('userEmail');
            if (emailElement) {
                emailElement.textContent = result.email;
            }
            
            // 가입일 표시
            const joinDateElement = document.getElementById('joinDate');
            if (joinDateElement && result.created_at) {
                const joinDate = new Date(result.created_at);
                joinDateElement.textContent = joinDate.toLocaleDateString('ko-KR');
            }
        } else {
            // 토큰이 유효하지 않은 경우 로그인 페이지로 리다이렉트
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        }
    } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        // 오류 발생 시 로그인 페이지로 리다이렉트
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    }
}

// 로그아웃 함수
async function logout() {
    try {
        // 토큰 제거
        localStorage.removeItem('access_token');
        
        // 로그아웃 API 호출 (선택사항)
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        // 메인 페이지로 이동
        window.location.href = '/';
    } catch (error) {
        console.error('로그아웃 오류:', error);
        // 오류 발생 시에도 메인 페이지로 이동
        window.location.href = '/';
    }
}

// 우울 수치 상태 로드
async function loadDepressionStatus() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch('/api/depression/status', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateDepressionDisplay(data);
        }
    } catch (error) {
        console.error('우울 수치 상태 로드 오류:', error);
    }
}

// 우울 수치 표시 업데이트
function updateDepressionDisplay(data) {
    const currentScoreElement = document.getElementById('currentScore');
    const statusElement = document.getElementById('depressionStatus');
    
    if (currentScoreElement) {
        currentScoreElement.textContent = data.current_score.toFixed(1);
    }
    
    if (statusElement) {
        const statusText = statusElement.querySelector('.status-text');
        if (statusText) {
            if (data.current_score >= 7) {
                statusText.textContent = '높은 우울 수치 - 전문가 상담 권장';
                statusElement.style.color = '#ff4757';
            } else if (data.current_score >= 4) {
                statusText.textContent = '보통 우울 수치 - 관심 필요';
                statusElement.style.color = '#ffa502';
            } else {
                statusText.textContent = '양호한 상태 - 계속 유지하세요';
                statusElement.style.color = '#2ed573';
            }
        }
    }
}

// 탭 네비게이션 설정
function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // 모든 버튼과 탭에서 active 클래스 제거
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // 선택된 버튼과 탭에 active 클래스 추가
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // 히스토리 탭이 선택된 경우 차트 업데이트
            if (targetTab === 'history') {
                loadChatHistory();
            }
        });
    });
}

// 챗봇 기능 설정
function setupChatbot() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const playBtn = document.getElementById('playBtn');

    // 메시지 전송
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // 엔터키로 메시지 전송
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // 음성 입력
    if (voiceBtn) {
        voiceBtn.addEventListener('click', toggleVoiceRecording);
    }

    // 음성 재생
    if (playBtn) {
        playBtn.addEventListener('click', playLastResponse);
    }
}

// 메시지 전송
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;

    // 사용자 메시지 표시
    addMessageToChat(message, 'user');
    messageInput.value = '';

    // 로딩 표시
    const loadingMessage = addMessageToChat('응답을 생성하고 있습니다...', 'bot', true);

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: message })
        });

        if (response.ok) {
            const data = await response.json();
            
            // 로딩 메시지 제거
            loadingMessage.remove();
            
            // 봇 응답 표시
            addMessageToChat(data.response, 'bot');
            
            // 우울 수치 업데이트
            updateDepressionDisplay({
                current_score: data.depression_score,
                average_score: data.depression_score
            });
            
            // 우울 수치 상태 다시 로드
            await loadDepressionStatus();
        } else {
            loadingMessage.remove();
            addMessageToChat('죄송합니다. 응답을 생성하는데 문제가 발생했습니다.', 'bot');
        }
    } catch (error) {
        console.error('메시지 전송 오류:', error);
        loadingMessage.remove();
        addMessageToChat('네트워크 오류가 발생했습니다. 다시 시도해주세요.', 'bot');
    }
}

// 채팅에 메시지 추가
function addMessageToChat(message, sender, isLoading = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    
    if (isLoading) {
        contentDiv.style.fontStyle = 'italic';
        contentDiv.style.opacity = '0.7';
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// 음성 녹음 토글
async function toggleVoiceRecording() {
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            isRecording = true;
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            voiceBtn.style.background = '#dc3545';
        } catch (error) {
            console.error('음성 녹음 오류:', error);
            alert('음성 녹음에 실패했습니다. 마이크 권한을 확인해주세요.');
        }
    } else {
        mediaRecorder.stop();
        isRecording = false;
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.style.background = '#ff6b6b';
    }
}

// 음성을 텍스트로 변환
async function transcribeAudio(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'recording.wav');
        
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/audio/transcribe', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('messageInput').value = data.transcript;
        } else {
            console.error('음성 변환 실패');
        }
    } catch (error) {
        console.error('음성 변환 오류:', error);
    }
}

// 마지막 응답 음성 재생
async function playLastResponse() {
    const chatMessages = document.getElementById('chatMessages');
    const lastBotMessage = chatMessages.querySelector('.bot-message:last-child');
    
    if (!lastBotMessage) return;
    
    const messageContent = lastBotMessage.querySelector('.message-content').textContent;
    
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/audio/synthesize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: messageContent })
        });
        
        if (response.ok) {
            const data = await response.json();
            const audio = new Audio(data.audio_url);
            audio.play();
        }
    } catch (error) {
        console.error('음성 합성 오류:', error);
    }
}

// 커리어 컨설팅 기능 설정
function setupCareerConsultation() {
    const careerForm = document.getElementById('careerForm');
    
    if (careerForm) {
        careerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitResume();
        });
    }
}

// 이력서 제출
async function submitResume() {
    const formData = {
        name: document.getElementById('resumeName').value,
        email: document.getElementById('resumeEmail').value,
        phone: document.getElementById('resumePhone').value,
        resume_text: document.getElementById('resumeText').value
    };
    
    const submitBtn = document.querySelector('#careerForm button[type="submit"]');
    if (!submitBtn) {
        console.error('제출 버튼을 찾을 수 없습니다');
        return;
    }
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...';
    submitBtn.disabled = true;
    
    try {
        const token = localStorage.getItem('access_token');
        
        const response = await fetch('/api/career/consultation/natural', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const data = await response.json();
            displayConsultationResult(data.consultation_result);
        } else {
            const errorText = await response.text();
            console.error('API 오류:', response.status, errorText);
            throw new Error(`커리어 컨설팅 생성 실패: ${response.status}`);
        }
    } catch (error) {
        console.error('커리어 컨설팅 오류:', error);
        alert('커리어 컨설팅 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// 컨설팅 결과 표시
function displayConsultationResult(result) {
    const resultDiv = document.getElementById('consultationResult');
    const contentDiv = document.getElementById('resultContent');
    
    contentDiv.innerHTML = result.replace(/\n/g, '<br>');
    resultDiv.style.display = 'block';
    
    // 결과 영역으로 스크롤
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 채팅 히스토리 로드
async function loadChatHistory() {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/chat/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateHistoryDisplay(data);
            updateDepressionChart(data.depression_scores);
        }
    } catch (error) {
        console.error('채팅 히스토리 로드 오류:', error);
    }
}

// 히스토리 표시 업데이트
function updateHistoryDisplay(data) {
    const currentScoreElement = document.getElementById('currentDepressionScore');
    const averageScoreElement = document.getElementById('averageDepressionScore');
    const totalChatsElement = document.getElementById('totalChats');
    const chatListElement = document.getElementById('chatList');
    
    if (currentScoreElement && data.depression_scores.length > 0) {
        currentScoreElement.textContent = data.depression_scores[data.depression_scores.length - 1].toFixed(1);
    }
    
    if (averageScoreElement && data.depression_scores.length > 0) {
        const average = data.depression_scores.reduce((a, b) => a + b, 0) / data.depression_scores.length;
        averageScoreElement.textContent = average.toFixed(1);
    }
    
    if (totalChatsElement) {
        totalChatsElement.textContent = data.messages.length;
    }
    
    if (chatListElement) {
        chatListElement.innerHTML = '';
        data.messages.slice(-10).reverse().forEach(message => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            
            const preview = document.createElement('div');
            preview.className = 'chat-preview';
            preview.textContent = message.user_message.substring(0, 50) + '...';
            
            const time = document.createElement('div');
            time.className = 'chat-time';
            time.textContent = new Date(message.timestamp).toLocaleDateString('ko-KR');
            
            const indicator = document.createElement('div');
            indicator.className = 'depression-indicator';
            if (message.depression_score >= 7) {
                indicator.classList.add('high');
            } else if (message.depression_score >= 4) {
                indicator.classList.add('medium');
            } else {
                indicator.classList.add('low');
            }
            
            chatItem.appendChild(preview);
            chatItem.appendChild(time);
            chatItem.appendChild(indicator);
            chatListElement.appendChild(chatItem);
        });
    }
}

// 우울 수치 차트 업데이트
function updateDepressionChart(scores) {
    const ctx = document.getElementById('depressionChart');
    if (!ctx || scores.length === 0) return;
    
    if (depressionChart) {
        depressionChart.destroy();
    }
    
    const labels = scores.map((_, index) => `대화 ${index + 1}`);
    
    depressionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '우울 수치',
                data: scores,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}


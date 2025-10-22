// 공통 함수들
function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // 3초 후 메시지 숨기기
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span> 처리 중...';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || '제출';
    }
}

// 토큰 관리 함수들
function setToken(token) {
    localStorage.setItem('access_token', token);
}

function getToken() {
    return localStorage.getItem('access_token');
}

function removeToken() {
    localStorage.removeItem('access_token');
}

function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// 로그인 폼 처리
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.setAttribute('data-original-text', submitBtn.textContent);
        setLoading(submitBtn, true);
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                setToken(result.access_token);
                showMessage('로그인 성공! 대시보드로 이동합니다.', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                const error = await response.json();
                showMessage(error.detail || '로그인에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            showMessage('로그인 중 오류가 발생했습니다.', 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// 회원가입 폼 처리
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.setAttribute('data-original-text', submitBtn.textContent);
        setLoading(submitBtn, true);
        
        const formData = new FormData(e.target);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // 비밀번호 확인
        if (password !== confirmPassword) {
            showMessage('비밀번호가 일치하지 않습니다.', 'error');
            setLoading(submitBtn, false);
            return;
        }
        
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: password
        };
        
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showMessage('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                const error = await response.json();
                showMessage(error.detail || '회원가입에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            showMessage('회원가입 중 오류가 발생했습니다.', 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}


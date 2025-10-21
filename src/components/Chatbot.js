import React from 'react';

function Chatbot() {
  return (
    <div>
      <h1>AI 챗봇</h1>
      <p>
        AI 대화형 챗봇을 통해 사용자의 감정 상태를 인식, 분석하고 대화를 제공합니다.
        STT(음성인식) 및 TTS(음성합성) 기능을 탑재하여 고연령층에 친화적인 서비스를 제공하는 것이 목표입니다.
      </p>
      <div className="mock-form">
        <textarea rows="10" placeholder="AI 챗봇에게 메시지를 입력하세요..."></textarea>
        <button>전송</button>
      </div>
    </div>
  );
}

export default Chatbot;
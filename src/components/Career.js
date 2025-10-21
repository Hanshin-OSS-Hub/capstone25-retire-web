import React from 'react';

function Career() {
  return (
    <div>
      <h1>AI 커리어 컨설팅</h1>
      <p>
        사용자의 가상 이력서를 통해 경력과 강점을 AI로 분석하고 새로운 직무 방향성을 제시합니다.
        주요 경력 키워드를 기반으로 재취업, 창업, 멘토링 기회를 추천합니다.
      </p>
      <form className="mock-form">
        <label>가상 이력서 작성</label>
        <input type="text" placeholder="주요 경력 (예: 10년차 재무팀장)" />
        <textarea rows="5" placeholder="주요 강점 및 기술을 입력하세요..."></textarea>
        <button type="submit">AI 컨설팅 받기</button>
      </form>
    </div>
  );
}

export default Career;
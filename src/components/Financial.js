import React from 'react';

function Financial() {
  return (
    <div>
      <h1>AI 재무 시뮬레이터</h1>
      <p>
        연금, 퇴직금, 월 당 희망 생활비 등을 입력하면 AI가 현금흐름 그래프와 보완 방안을 제공합니다.
        복잡한 재무 지식 없이도 간편하게 노후 자금 상황을 확인할 수 있습니다.
      </p>
      <form className="mock-form">
        <label>예상 연금 (월)</label>
        <input type="number" placeholder="1500000" />
        <label>예상 퇴직금 (총)</label>
        <input type="number" placeholder="200000000" />
        <label>희망 생활비 (월)</label>
        <input type="number" placeholder="3000000" />
        <button type="submit">시뮬레이션 시작</button>
      </form>
    </div>
  );
}

export default Financial;
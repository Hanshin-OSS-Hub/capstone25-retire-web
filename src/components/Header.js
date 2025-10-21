import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <nav className="header-nav">
      <ul>
        <li>
          <Link to="/" className="logo">Retire Web</Link>
        </li>
        <li>
          <Link to="/chatbot" className="nav-link">AI 챗봇</Link>
        </li>
        <li>
          <Link to="/career" className="nav-link">AI 커리어 컨설팅</Link>
        </li>
        <li>
          <Link to="/financial" className="nav-link">AI 재무 시뮬레이터</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Header;
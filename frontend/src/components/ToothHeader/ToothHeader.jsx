import React from 'react';
import './ToothHeader.css';

export default function ToothHeader({ number, title }) {
  return (
    <div className="tooth-header-wrapper">
      <div className="tooth-icon-container">
        <i className="fas fa-tooth"></i>
        <span className="tooth-number">{number}</span>
      </div>
      <h2>{title}</h2>
    </div>
  );
}

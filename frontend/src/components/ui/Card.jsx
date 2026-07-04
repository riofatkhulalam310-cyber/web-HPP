import React from 'react';

const Card = ({ children, title, action, className = '', glass = false }) => {
  return (
    <div className={`card ${glass ? 'card-glass' : ''} ${className}`}>
      {(title || action) && (
        <div className="card-header">
          {title && <h3>{title}</h3>}
          {action && <div className="card-actions">{action}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;

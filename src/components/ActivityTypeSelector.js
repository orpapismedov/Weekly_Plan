import React from 'react';

function ActivityTypeSelector({ onSelect, onClose }) {
  const activityTypes = [
    { id: 'flight', label: 'פעילות קו טיסה', color: '#667eea' },
    { id: 'mant', label: 'פעילות מנ"ט', color: '#f59e0b' },
    { id: 'abroad', label: 'פעילות חו"ל', color: '#10b981' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', color: '#667eea', marginBottom: '30px' }}>
          סוג פעילות?
        </h2>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          {activityTypes.map(type => (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              style={{
                padding: '20px',
                background: 'white',
                border: `3px solid ${type.color}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                color: type.color,
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'all 0.3s',
                textAlign: 'right'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = type.color;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = type.color;
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ביטול
        </button>
      </div>
    </div>
  );
}

export default ActivityTypeSelector;

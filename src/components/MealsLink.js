import React, { useState } from 'react';

function MealsLink({ isManager, onClose, mealsLink, setMealsLink }) {
  const [inputLink, setInputLink] = useState(mealsLink);

  const handleSave = () => {
    setMealsLink(inputLink);
    alert('הקישור נשמר בהצלחה');
  };

  const handleOpenLink = () => {
    if (mealsLink) {
      window.open(mealsLink, '_blank');
    } else {
      alert('אין קישור זמין');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <h2 style={{ color: '#667eea', marginBottom: '20px' }}>קישור לקובץ ארוחות</h2>

        {isManager ? (
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>הדבק קישור:</label>
            <input
              type="url"
              value={inputLink}
              onChange={(e) => setInputLink(e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                marginBottom: '15px'
              }}
            />
            <button
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              שמור קישור
            </button>
          </div>
        ) : null}

        <div style={{ textAlign: 'center', padding: '20px' }}>
          <button
            onClick={handleOpenLink}
            disabled={!mealsLink}
            style={{
              padding: '15px 30px',
              background: mealsLink ? '#667eea' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: mealsLink ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            פתח קובץ ארוחות
          </button>
          {!mealsLink && (
            <p style={{ marginTop: '10px', color: '#999', fontSize: '14px' }}>
              אין קישור זמין
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          סגור
        </button>
      </div>
    </div>
  );
}

export default MealsLink;

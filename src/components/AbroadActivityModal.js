import React, { useState } from 'react';

function AbroadActivityModal({ activity, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: activity?.id || Date.now(),
    activityType: 'abroad',
    projectName: activity?.projectName || '',
    landingManager: activity?.landingManager || '',
    pilotInside: activity?.pilotInside || '',
    pilotOutside: activity?.pilotOutside || '',
    technician: activity?.technician || '',
    projectManager: activity?.projectManager || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      alert('נא למלא שם פרויקט');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: '#10b981', marginBottom: '20px' }}>
          {activity ? 'עדכן' : 'הוסף'} פעילות חו"ל
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>שם פרויקט: *</label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder='לדוגמה: פרויקט אירופה 2026'
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>אחראי מנחת:</label>
            <input
              type="text"
              value={formData.landingManager}
              onChange={(e) => setFormData({ ...formData, landingManager: e.target.value })}
              placeholder='שם אחראי מנחת'
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>מטיס פנים:</label>
            <input
              type="text"
              value={formData.pilotInside}
              onChange={(e) => setFormData({ ...formData, pilotInside: e.target.value })}
              placeholder='שם מטיס פנים'
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>מטיס חוץ:</label>
            <input
              type="text"
              value={formData.pilotOutside}
              onChange={(e) => setFormData({ ...formData, pilotOutside: e.target.value })}
              placeholder='שם מטיס חוץ'
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>טכנאי:</label>
            <input
              type="text"
              value={formData.technician}
              onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
              placeholder='שם טכנאי'
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>מנהל פרויקט:</label>
            <input
              type="text"
              value={formData.projectManager}
              onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
              placeholder='שם מנהל הפרויקט'
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
            <button type="submit" className="submit-btn" style={{ background: '#10b981' }}>
              {activity ? 'עדכן' : 'הוסף'} פעילות
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
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
        </form>
      </div>
    </div>
  );
}

export default AbroadActivityModal;

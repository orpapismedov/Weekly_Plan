import React, { useState } from 'react';

function AbroadActivityModal({ activity, onClose, onSave, selectedDay }) {
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

  // Track selected days (only for new activities)
  const [selectedDays, setSelectedDays] = useState(activity ? [] : [selectedDay]);
  
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      alert('נא למלא שם פרויקט');
      return;
    }
    if (!activity && selectedDays.length === 0) {
      alert('נא לבחור לפחות יום אחד');
      return;
    }
    onSave(formData, selectedDays);
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

          {!activity && (
            <div className="form-group" style={{ 
              marginTop: '20px', 
              padding: '18px', 
              background: '#fafafa', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#374151', 
                  fontSize: '14px'
                }}>
                  בחר ימים לפעילות
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedDays([...days])}
                  style={{
                    padding: '6px 12px',
                    background: selectedDays.length === days.length ? '#10b981' : 'white',
                    color: selectedDays.length === days.length ? 'white' : '#10b981',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDays.length !== days.length) {
                      e.currentTarget.style.background = '#f0fdf4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDays.length !== days.length) {
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  ✓ בחר הכל
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '14px' }}>
                המערכת תיצור פעילות בכל יום שנבחר
              </p>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {days.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  
                  return (
                    <div
                      key={day}
                      onClick={() => toggleDay(day)}
                      style={{ 
                        padding: '8px 16px',
                        background: isSelected ? '#10b981' : 'white',
                        color: isSelected ? 'white' : '#4b5563',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid #059669' : '1px solid #d1d5db',
                        transition: 'all 0.2s ease',
                        fontSize: '13px',
                        fontWeight: isSelected ? '600' : '500',
                        userSelect: 'none',
                        minWidth: '80px',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.background = '#f0fdf4';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              
              {selectedDays.length > 0 && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px 12px', 
                  background: '#ecfdf5', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#059669',
                  fontWeight: '500'
                }}>
                  {selectedDays.length} ימים נבחרו
                </div>
              )}
            </div>
          )}

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

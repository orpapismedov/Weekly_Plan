import React, { useState, useEffect } from 'react';

function UserSearch({ weekData, onDayClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    days.forEach(day => {
      const dayActivities = weekData.activities[day];
      dayActivities.forEach(activity => {
        // Search in all crew role fields (works for all activity types)
        const searchInFields = [
          activity.manager,
          activity.projectManager,
          activity.pilotInside,
          activity.pilotOutside,
          activity.landingManager,
          activity.technician,
          activity.additional,
          activity.poc,
          activity.pocMant,
          activity.taskName,
          activity.projectName
        ].filter(field => field) // Remove undefined/null values
         .join(' ')
         .toLowerCase();

        if (searchInFields.includes(searchTerm.toLowerCase())) {
          results.push({
            day,
            activity
          });
        }
      });
    });

    setSearchResults(results);
  }, [searchTerm, weekData]);

  return (
    <div className="user-search">
      <div className="search-bar" style={{ position: 'relative' }}>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#999',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
              zIndex: 1
            }}
            onMouseEnter={(e) => e.target.style.color = '#667eea'}
            onMouseLeave={(e) => e.target.style.color = '#999'}
            title="נקה חיפוש"
          >
            ✕
          </button>
        )}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="הזן שם לחיפוש פעילויות..."
          style={{ paddingLeft: searchTerm ? '40px' : '12px' }}
        />
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>נמצאו {searchResults.length} פעילויות עבור "{searchTerm}"</h3>
          <div className="days-grid">
            {searchResults.map((result, index) => {
              const activity = result.activity;
              const isFlightActivity = activity.activityType === 'flight' || (!activity.activityType && activity.platform);
              const isMantActivity = activity.activityType === 'mant';
              const isAbroadActivity = activity.activityType === 'abroad';

              return (
                <div 
                  key={index} 
                  className="activity-card"
                  onClick={() => onDayClick(result.day)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Day indicator at the top */}
                  <div style={{ 
                    background: isMantActivity ? '#f59e0b' : isAbroadActivity ? '#10b981' : 'linear-gradient(135deg, #667eea, #764ba2)', 
                    color: 'white', 
                    padding: '8px 12px', 
                    borderRadius: '8px',
                    fontSize: '0.95em',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    textAlign: 'center'
                  }}>
                    {result.day}
                  </div>

                  {/* Flight Activity */}
                  {isFlightActivity ? (
                    <>
                      <div className="activity-header">
                        <span style={{ fontWeight: 'bold', color: '#667eea' }}>קו טיסה</span>
                      </div>
                      <div className="activity-info">
                        <div style={{ 
                          textAlign: window.innerWidth >= 768 ? 'right' : 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: window.innerWidth >= 768 ? 'flex-start' : 'center',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <strong>פלטפורמה:</strong>
                          <span style={{ 
                            background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            {activity.platform}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <strong>משימה:</strong>
                          <span className="platform-badge" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>{activity.taskName}</span>
                        </div>
                        {activity.projectNumber && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <strong>פרויקט:</strong>
                            <span>{activity.projectNumber}</span>
                          </div>
                        )}
                        {activity.workSite && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <strong>אתר עבודה:</strong>
                            <span>{activity.workSite}</span>
                          </div>
                        )}
                        <div><strong>סוג פעילות:</strong> {activity.type}</div>
                        <div><strong>שעות:</strong> <span style={{ direction: 'ltr', display: 'inline-block' }}>{activity.startTime} - {activity.endTime}</span></div>
                        <div><strong>מנהל:</strong> {activity.manager}</div>
                        {activity.pilotInside && (
                          <div><strong>מטיס פנים:</strong> {activity.pilotInside}</div>
                        )}
                        {activity.pilotOutside && (
                          <div><strong>מטיס חוץ:</strong> {activity.pilotOutside}</div>
                        )}
                        {activity.landingManager && (
                          <div><strong>אחראי מנחת:</strong> {activity.landingManager}</div>
                        )}
                        {activity.technician && (
                          <div><strong>טכנאי:</strong> {activity.technician}</div>
                        )}
                        {activity.additional && (
                          <div><strong>נוסף:</strong> {activity.additional}</div>
                        )}
                      </div>
                    </>
                  ) : isMantActivity ? (
                    <>
                      <div className="activity-header">
                        <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>מנ"ט</span>
                      </div>
                      <div className="activity-info">
                        {activity.taskName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <strong>משימה:</strong>
                            <span className="platform-badge" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>{activity.taskName}</span>
                          </div>
                        )}
                        {activity.projectNumber && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <strong>פרויקט:</strong>
                            <span>{activity.projectNumber}</span>
                          </div>
                        )}
                        {activity.workSite && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <strong>אתר עבודה:</strong>
                            <span>{activity.workSite}</span>
                          </div>
                        )}
                        {activity.pilotInside && (
                          <div><strong>מטיס פנים:</strong> {activity.pilotInside}</div>
                        )}
                        {activity.pilotOutside && (
                          <div><strong>מטיס חוץ:</strong> {activity.pilotOutside}</div>
                        )}
                        {activity.landingManager && (
                          <div><strong>אחראי מנחת:</strong> {activity.landingManager}</div>
                        )}
                        {activity.technician && (
                          <div><strong>טכנאי:</strong> {activity.technician}</div>
                        )}
                        {activity.pocMant && (
                          <div><strong>POC:</strong> {activity.pocMant}</div>
                        )}
                      </div>
                    </>
                  ) : isAbroadActivity ? (
                    <>
                      <div className="activity-header">
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>חו"ל</span>
                      </div>
                      <div className="activity-info">
                        {activity.taskName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <strong>משימה:</strong>
                            <span className="platform-badge" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>{activity.taskName}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <strong>פרויקט:</strong>
                          <span>{activity.projectNumber}</span>
                        </div>
                        {activity.workSite && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <strong>אתר עבודה:</strong>
                            <span>{activity.workSite}</span>
                          </div>
                        )}
                        {activity.pilotInside && (
                          <div><strong>מטיס פנים:</strong> {activity.pilotInside}</div>
                        )}
                        {activity.pilotOutside && (
                          <div><strong>מטיס חוץ:</strong> {activity.pilotOutside}</div>
                        )}
                        {activity.landingManager && (
                          <div><strong>אחראי מנחת:</strong> {activity.landingManager}</div>
                        )}
                        {activity.technician && (
                          <div><strong>טכנאי:</strong> {activity.technician}</div>
                        )}
                        {activity.projectManager && (
                          <div><strong>מנהל:</strong> {activity.projectManager}</div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {searchResults.length === 0 && searchTerm && (
        <div className="no-results">
          לא נמצאו פעילויות עבור "{searchTerm}"
        </div>
      )}
    </div>
  );
}

export default UserSearch;

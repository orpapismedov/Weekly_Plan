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
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="הזן שם לחיפוש פעילויות..."
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
                  <div className="activity-header">
                    <span style={{ 
                      background: isMantActivity ? '#f59e0b' : isAbroadActivity ? '#10b981' : '#28a745', 
                      color: 'white', 
                      padding: '5px 12px', 
                      borderRadius: '20px',
                      fontSize: '0.9em',
                      fontWeight: 'bold'
                    }}>
                      {result.day}
                    </span>
                    {activity.platform && (
                      <span className="platform-badge">{activity.platform}</span>
                    )}
                  </div>
                  
                  {/* Activity Type Label */}
                  {isFlightActivity && (
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: '#667eea' }}>קו טיסה</span>
                    </div>
                  )}
                  {isMantActivity && (
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>מנ"ט</span>
                    </div>
                  )}
                  {isAbroadActivity && (
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>חו"ל</span>
                    </div>
                  )}
                  
                  <div className="activity-info">
                    {/* Task/Project Name - all types */}
                    {activity.taskName && (
                      <div><strong>משימה:</strong> {activity.taskName}</div>
                    )}
                    {activity.projectName && (
                      <div><strong>פרויקט:</strong> {activity.projectName}</div>
                    )}
                    
                    {/* Time - flight activities only */}
                    {isFlightActivity && activity.startTime && activity.endTime && (
                      <div><strong>שעות:</strong> {activity.startTime} - {activity.endTime}</div>
                    )}
                    
                    {/* Manager fields */}
                    {activity.manager && (
                      <div><strong>מנהל:</strong> {activity.manager}</div>
                    )}
                    {activity.projectManager && (
                      <div><strong>מנהל פרויקט:</strong> {activity.projectManager}</div>
                    )}
                    
                    {/* Landing Manager - all types */}
                    {activity.landingManager && (
                      <div><strong>אחראי מנחת:</strong> {activity.landingManager}</div>
                    )}
                    
                    {/* Pilots - all types */}
                    {activity.pilotInside && (
                      <div><strong>מטיס פנים:</strong> {activity.pilotInside}</div>
                    )}
                    {activity.pilotOutside && (
                      <div><strong>מטיס חוץ:</strong> {activity.pilotOutside}</div>
                    )}
                    
                    {/* Technician - all types */}
                    {activity.technician && (
                      <div><strong>טכנאי:</strong> {activity.technician}</div>
                    )}
                    
                    {/* POC fields - type specific */}
                    {activity.poc && (
                      <div><strong>איש קשר:</strong> {activity.poc}</div>
                    )}
                    {activity.pocMant && (
                      <div><strong>POC במנ"ט:</strong> {activity.pocMant}</div>
                    )}
                    
                    {/* Additional field - flight activities */}
                    {activity.additional && (
                      <div><strong>נוסף:</strong> {activity.additional}</div>
                    )}
                    
                    {/* Notes - all types */}
                    {activity.notes && (
                      <div><strong>הערות:</strong> {activity.notes}</div>
                    )}
                  </div>
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

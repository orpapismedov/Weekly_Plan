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
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className="activity-card"
                onClick={() => onDayClick(result.day)}
                style={{ cursor: 'pointer' }}
              >
                <div className="activity-header">
                  <span style={{ 
                    background: '#28a745', 
                    color: 'white', 
                    padding: '5px 12px', 
                    borderRadius: '20px',
                    fontSize: '0.9em',
                    fontWeight: 'bold'
                  }}>
                    {result.day}
                  </span>
                  <span className="platform-badge">{result.activity.platform}</span>
                </div>
                <div className="activity-info">
                  <div><strong>משימה:</strong> {result.activity.taskName || result.activity.projectName}</div>
                  <div><strong>שעות:</strong> {result.activity.startTime} - {result.activity.endTime}</div>
                  <div><strong>מנהל:</strong> {result.activity.manager || result.activity.projectManager}</div>
                  
                  {/* Show crew fields for flight activities */}
                  {result.activity.pilotInside && (
                    <div><strong>מטיס פנים:</strong> {result.activity.pilotInside}</div>
                  )}
                  {result.activity.pilotOutside && (
                    <div><strong>מטיס חוץ:</strong> {result.activity.pilotOutside}</div>
                  )}
                  {result.activity.landingManager && (
                    <div><strong>אחראי מנחת:</strong> {result.activity.landingManager}</div>
                  )}
                  {result.activity.technician && (
                    <div><strong>טכנאי:</strong> {result.activity.technician}</div>
                  )}
                  
                  {result.activity.notes && (
                    <div><strong>הערות:</strong> {result.activity.notes}</div>
                  )}
                </div>
              </div>
            ))}
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

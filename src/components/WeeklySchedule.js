import React, { useState } from 'react';
import ActivityModal from './ActivityModal';
import ActivityTypeSelector from './ActivityTypeSelector';
import MantActivityModal from './MantActivityModal';
import AbroadActivityModal from './AbroadActivityModal';

function WeeklySchedule({ weekNumber, activities, isManager, onAddActivity, onUpdateActivity, onDeleteActivity, onDayClick, currentWeekNumber }) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityTypeFilter, setActivityTypeFilter] = useState('all'); // 'all', 'אווירי', 'קרקעי'
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all'); // 'all', 'flight', 'mant', 'abroad'
  const [platformFilter, setPlatformFilter] = useState('all'); // 'all' or specific platform
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];

  // Get all unique platforms from activities
  const getAllPlatforms = () => {
    const platforms = new Set();
    days.forEach(day => {
      activities[day].forEach(activity => {
        if (activity.platform && activity.activityType !== 'mant' && activity.activityType !== 'abroad') {
          platforms.add(activity.platform);
        }
      });
    });
    return Array.from(platforms).sort();
  };

  // Function to get date for each day of the week based on weekNumber
  const getDateForDay = (dayName) => {
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayIndex = dayNames.indexOf(dayName);
    
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the offset in weeks from current week
    const weekOffset = weekNumber - currentWeekNumber;
    
    // Calculate days until target day in the target week
    const daysUntilTarget = (dayIndex - currentDayOfWeek + 7) % 7 + (weekOffset * 7);
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  // Helper function to determine if crew field should be highlighted red
  const shouldHighlightRed = (activity, fieldName) => {
    // Only apply to flight activities that are אווירי
    if (!activity || activity.activityType === 'mant' || activity.activityType === 'abroad' || activity.type !== 'אווירי') {
      return false;
    }

    const pilotInside = activity.pilotInside?.trim() || '';
    const pilotOutside = activity.pilotOutside?.trim() || '';
    const landingManager = activity.landingManager?.trim() || '';
    const technician = activity.technician?.trim() || '';

    // If אירוסטאר platform: all 4 fields must be filled
    if (activity.platform === 'אירוסטאר') {
      if (fieldName === 'pilotInside' && !pilotInside) return true;
      if (fieldName === 'pilotOutside' && !pilotOutside) return true;
      if (fieldName === 'landingManager' && !landingManager) return true;
      if (fieldName === 'technician' && !technician) return true;
    }

    // For אווירי in general: מטיס פנים and טכנאי are required
    if (fieldName === 'pilotInside' && !pilotInside) return true;
    if (fieldName === 'technician' && !technician) return true;

    return false;
  };

  const handleAddClick = (day) => {
    setSelectedDay(day);
    setEditingActivity(null);
    setShowTypeSelector(true);
  };

  const handleTypeSelect = (type) => {
    setSelectedActivityType(type);
    setShowTypeSelector(false);
  };

  const handleEditClick = (day, activity, e) => {
    e.stopPropagation();
    setSelectedDay(day);
    setEditingActivity(activity);
    setSelectedActivityType(activity.activityType || 'flight');
  };

  const handleDeleteClick = (day, activityId, e) => {
    e.stopPropagation();
    if (window.confirm('האם אתה בטוח שברצונך למחוק פעילות זו?')) {
      onDeleteActivity(day, activityId);
    }
  };

  const handleSave = (activity) => {
    if (editingActivity) {
      onUpdateActivity(selectedDay, editingActivity.id, activity);
    } else {
      onAddActivity(selectedDay, activity);
    }
    setSelectedActivityType(null);
    setEditingActivity(null);
  };

  const handleCloseModal = () => {
    setShowTypeSelector(false);
    setSelectedActivityType(null);
    setEditingActivity(null);
  };

  return (
    <div className="weekly-schedule">
      <div className="week-header" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>תכנית שבועית</h2>
            <div className="week-number">שבוע {weekNumber}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            🔍 סינון
          </button>
          
          {showFilterPanel && (
            <div style={{
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              border: '2px solid #667eea',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              zIndex: 1000,
              minWidth: '400px',
              maxWidth: '90vw'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#667eea', textAlign: 'center' }}>אפשרויות סינון</h3>
              
              {/* סוג פעילות */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>סוג פעילות:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActivityTypeFilter('all')}
                    style={{
                      padding: '8px 16px',
                      background: activityTypeFilter === 'all' ? '#667eea' : '#e0e0e0',
                      color: activityTypeFilter === 'all' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    הכל
                  </button>
                  <button
                    onClick={() => setActivityTypeFilter('אווירי')}
                    style={{
                      padding: '8px 16px',
                      background: activityTypeFilter === 'אווירי' ? '#667eea' : '#e0e0e0',
                      color: activityTypeFilter === 'אווירי' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    אווירי
                  </button>
                  <button
                    onClick={() => setActivityTypeFilter('קרקעי')}
                    style={{
                      padding: '8px 16px',
                      background: activityTypeFilter === 'קרקעי' ? '#667eea' : '#e0e0e0',
                      color: activityTypeFilter === 'קרקעי' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    קרקעי
                  </button>
                </div>
              </div>
              
              {/* פעילות */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>פעילות:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActivityCategoryFilter('all')}
                    style={{
                      padding: '8px 16px',
                      background: activityCategoryFilter === 'all' ? '#667eea' : '#e0e0e0',
                      color: activityCategoryFilter === 'all' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    הכל
                  </button>
                  <button
                    onClick={() => setActivityCategoryFilter('flight')}
                    style={{
                      padding: '8px 16px',
                      background: activityCategoryFilter === 'flight' ? '#667eea' : '#e0e0e0',
                      color: activityCategoryFilter === 'flight' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    קו טיסה
                  </button>
                  <button
                    onClick={() => setActivityCategoryFilter('mant')}
                    style={{
                      padding: '8px 16px',
                      background: activityCategoryFilter === 'mant' ? '#667eea' : '#e0e0e0',
                      color: activityCategoryFilter === 'mant' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    מנ"ט
                  </button>
                  <button
                    onClick={() => setActivityCategoryFilter('abroad')}
                    style={{
                      padding: '8px 16px',
                      background: activityCategoryFilter === 'abroad' ? '#667eea' : '#e0e0e0',
                      color: activityCategoryFilter === 'abroad' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    חו"ל
                  </button>
                </div>
              </div>
              
              {/* פלטפורמה */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>פלטפורמה:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPlatformFilter('all')}
                    style={{
                      padding: '8px 16px',
                      background: platformFilter === 'all' ? '#667eea' : '#e0e0e0',
                      color: platformFilter === 'all' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    הכל
                  </button>
                  {getAllPlatforms().map(platform => (
                    <button
                      key={platform}
                      onClick={() => setPlatformFilter(platform)}
                      style={{
                        padding: '8px 16px',
                        background: platformFilter === platform ? '#667eea' : '#e0e0e0',
                        color: platformFilter === platform ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="days-grid">
        {days.map(day => (
          <div 
            key={day} 
            className="day-column"
            onClick={() => onDayClick(day)}
          >
            <div className="day-header">
              <div>{day}</div>
              <div style={{ fontSize: '0.85em', marginTop: '4px' }}>
                {getDateForDay(day)}
              </div>
            </div>
            <div className="activities-list">
              {activities[day].filter(activity => {
                // Filter by סוג פעילות (type)
                // מנ"ט and חו"ל are considered both אווירי and קרקעי
                let typeMatch = true;
                if (activityTypeFilter === 'אווירי') {
                  typeMatch = activity.type === 'אווירי' || activity.activityType === 'mant' || activity.activityType === 'abroad';
                } else if (activityTypeFilter === 'קרקעי') {
                  typeMatch = activity.type === 'קרקעי' || activity.activityType === 'mant' || activity.activityType === 'abroad';
                }
                
                // Filter by פעילות (category)
                let categoryMatch = true;
                if (activityCategoryFilter === 'flight') {
                  categoryMatch = !activity.activityType || activity.activityType === 'flight';
                } else if (activityCategoryFilter === 'mant') {
                  categoryMatch = activity.activityType === 'mant';
                } else if (activityCategoryFilter === 'abroad') {
                  categoryMatch = activity.activityType === 'abroad';
                }
                
                // Filter by פלטפורמה (platform)
                let platformMatch = true;
                if (platformFilter !== 'all') {
                  platformMatch = activity.platform === platformFilter;
                }
                
                return typeMatch && categoryMatch && platformMatch;
              }).map(activity => (
                <div 
                  key={activity.id} 
                  className="activity-card"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    borderLeft: activity.activityType === 'mant' ? '4px solid #f59e0b' : 
                               activity.activityType === 'abroad' ? '4px solid #10b981' : 
                               '4px solid #667eea'
                  }}
                >
                  {activity.activityType === 'flight' || !activity.activityType ? (
                    <>
                      <div className="activity-info">
                        <div><strong>משימה:</strong> <span className="platform-badge" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', marginLeft: '5px' }}>{activity.taskName}</span></div>
                        <div><strong>פלטפורמה:</strong> {activity.platform}</div>
                        <div><strong>סוג פעילות:</strong> {activity.type}</div>
                        <div><strong>שעות:</strong> <span style={{ direction: 'ltr', display: 'inline-block' }}>{activity.startTime} - {activity.endTime}</span></div>
                        <div><strong>מנהל:</strong> {activity.manager}</div>
                        {activity.pilotInside && (
                          <div style={{ 
                            background: shouldHighlightRed(activity, 'pilotInside') ? '#ffcccc' : 'transparent',
                            padding: shouldHighlightRed(activity, 'pilotInside') ? '2px 4px' : '0',
                            borderRadius: '4px'
                          }}>
                            <strong>מטיס פנים:</strong> {activity.pilotInside}
                          </div>
                        )}
                        {activity.pilotOutside && (
                          <div style={{ 
                            background: shouldHighlightRed(activity, 'pilotOutside') ? '#ffcccc' : 'transparent',
                            padding: shouldHighlightRed(activity, 'pilotOutside') ? '2px 4px' : '0',
                            borderRadius: '4px'
                          }}>
                            <strong>מטיס חוץ:</strong> {activity.pilotOutside}
                          </div>
                        )}
                        {activity.landingManager && (
                          <div style={{ 
                            background: shouldHighlightRed(activity, 'landingManager') ? '#ffcccc' : 'transparent',
                            padding: shouldHighlightRed(activity, 'landingManager') ? '2px 4px' : '0',
                            borderRadius: '4px'
                          }}>
                            <strong>אחראי מנחת:</strong> {activity.landingManager}
                          </div>
                        )}
                        {activity.technician && (
                          <div style={{ 
                            background: shouldHighlightRed(activity, 'technician') ? '#ffcccc' : 'transparent',
                            padding: shouldHighlightRed(activity, 'technician') ? '2px 4px' : '0',
                            borderRadius: '4px'
                          }}>
                            <strong>טכנאי:</strong> {activity.technician}
                          </div>
                        )}
                        {/* Show red warning if fields are missing */}
                        {activity.type === 'אווירי' && (
                          shouldHighlightRed(activity, 'pilotInside') || 
                          shouldHighlightRed(activity, 'pilotOutside') || 
                          shouldHighlightRed(activity, 'landingManager') || 
                          shouldHighlightRed(activity, 'technician')
                        ) && (
                          <div style={{ 
                            background: '#ffcccc', 
                            padding: '4px', 
                            borderRadius: '4px',
                            fontSize: '0.85em',
                            marginTop: '4px',
                            color: '#cc0000',
                            fontWeight: 'bold'
                          }}>
                            ⚠️ חסרים פרטי צוות
                          </div>
                        )}
                      </div>
                    </>
                  ) : activity.activityType === 'mant' ? (
                    <>
                      <div className="activity-header">
                        <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>מנ"ט</span>
                      </div>
                      <div className="activity-info">
                        <div><strong>משימה:</strong> <span className="platform-badge" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', marginLeft: '5px' }}>{activity.taskName}</span></div>
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
                  ) : activity.activityType === 'abroad' ? (
                    <>
                      <div className="activity-header">
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>חו"ל</span>
                      </div>
                      <div className="activity-info">
                        <div><strong>פרויקט:</strong> <span className="platform-badge" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', marginLeft: '5px' }}>{activity.projectName}</span></div>
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
                  {isManager && (
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        className="edit-btn"
                        onClick={(e) => handleEditClick(day, activity, e)}
                      >
                        ערוך
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={(e) => handleDeleteClick(day, activity.id, e)}
                      >
                        מחק
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {activities[day].length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  אין פעילויות
                </p>
              )}
            </div>
            {isManager && (
              <button 
                className="add-activity-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddClick(day);
                }}
              >
                + הוסף פעילות
              </button>
            )}
          </div>
        ))}
      </div>

      {showTypeSelector && (
        <ActivityTypeSelector
          onSelect={handleTypeSelect}
          onClose={handleCloseModal}
        />
      )}

      {selectedActivityType === 'flight' && (
        <ActivityModal
          day={selectedDay}
          activity={editingActivity}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}

      {selectedActivityType === 'mant' && (
        <MantActivityModal
          activity={editingActivity}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}

      {selectedActivityType === 'abroad' && (
        <AbroadActivityModal
          activity={editingActivity}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default WeeklySchedule;

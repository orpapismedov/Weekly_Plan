import React, { useState } from 'react';
import ActivityModal from './ActivityModal';
import ActivityTypeSelector from './ActivityTypeSelector';
import MantActivityModal from './MantActivityModal';
import AbroadActivityModal from './AbroadActivityModal';

function WeeklySchedule({ weekNumber, weekDateRange, activities, isManager, onAddActivity, onAddActivityToWeek, onUpdateActivity, onDeleteActivity, onDayClick, currentWeekNumber }) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityTypeFilter, setActivityTypeFilter] = useState('all'); // 'all', 'אווירי', 'קרקעי'
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all'); // 'all', 'flight', 'mant', 'abroad'
  const [platformFilter, setPlatformFilter] = useState('all'); // 'all' or specific platform
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [copiedActivity, setCopiedActivity] = useState(null); // Store copied activity
  const [showPastePopup, setShowPastePopup] = useState(false);
  const [selectedPasteDays, setSelectedPasteDays] = useState([]);
  const [selectedPasteWeek, setSelectedPasteWeek] = useState('current'); // 'current', 'next', 'afterNext'

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
    
    // Calculate the start of the current week (Sunday)
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - currentDayOfWeek);
    
    // Calculate the start of the target week
    const startOfTargetWeek = new Date(startOfCurrentWeek);
    startOfTargetWeek.setDate(startOfCurrentWeek.getDate() + (weekOffset * 7));
    
    // Calculate the target date by adding the day index
    const targetDate = new Date(startOfTargetWeek);
    targetDate.setDate(startOfTargetWeek.getDate() + dayIndex);
    
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

  const handleCopyClick = (activity, e) => {
    e.stopPropagation();
    // Store a copy of the activity (without the ID so it creates a new one when pasted)
    const { id, ...activityWithoutId } = activity;
    setCopiedActivity(activityWithoutId);
    setShowPastePopup(true);
    setSelectedPasteDays([]);
    setSelectedPasteWeek('current');
  };

  const handlePasteFromPopup = async () => {
    if (!copiedActivity || selectedPasteDays.length === 0) {
      alert('יש לבחור לפחות יום אחד');
      return;
    }

    // Determine which week to paste to based on selection
    let targetWeekNumber = weekNumber;
    if (selectedPasteWeek === 'next') {
      targetWeekNumber = weekNumber + 1;
    } else if (selectedPasteWeek === 'afterNext') {
      targetWeekNumber = weekNumber + 2;
    }

    try {
      // Paste to all selected days
      for (const day of selectedPasteDays) {
        await onAddActivityToWeek(targetWeekNumber, day, copiedActivity);
      }
      
      alert(`הפעילות הודבקה בהצלחה בשבוע ${targetWeekNumber} ב-${selectedPasteDays.length} ימים!`);
      
      // Clear copied activity and close popup
      setCopiedActivity(null);
      setShowPastePopup(false);
      setSelectedPasteDays([]);
    } catch (error) {
      console.error('Error pasting activity:', error);
      alert('שגיאה בהדבקת הפעילות. אנא נסה שוב.');
    }
  };

  const handleSave = (activity, selectedDays = null) => {
    if (editingActivity) {
      onUpdateActivity(selectedDay, editingActivity.id, activity);
    } else {
      // If selectedDays is provided (abroad activity with multiple days)
      if (selectedDays && selectedDays.length > 0) {
        selectedDays.forEach(day => {
          const activityForDay = {
            ...activity,
            id: Date.now() + Math.random() // Unique ID for each day
          };
          onAddActivity(day, activityForDay);
        });
      } else {
        onAddActivity(selectedDay, activity);
      }
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
      <div className="week-header week-header-container">
        <div className="week-header-content">
          <div style={{ fontSize: '1.5em', fontWeight: '700', color: '#333' }}>
            תכנית שבועית - שבוע {weekNumber} : {weekDateRange}
          </div>
        </div>
        <div className="filter-button-row" style={{ position: 'relative' }}>
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
            <>
              {/* Overlay to close on click outside */}
              <div 
                onClick={() => setShowFilterPanel(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999
                }}
              />
              
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                background: 'white',
                border: '2px solid #667eea',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                zIndex: 1000,
                minWidth: '350px',
                maxWidth: '90vw'
              }}>
                {/* Close button */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <h3 style={{ margin: 0, color: '#667eea' }}>אפשרויות סינון</h3>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#999',
                      padding: 0,
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#667eea'}
                    onMouseLeave={(e) => e.target.style.color = '#999'}
                    title="סגור"
                  >
                    ✕
                  </button>
                </div>
              
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
            </>
          )}
        </div>
      </div>

      <div className="days-grid">
        {days.map(day => (
          <div 
            key={day} 
            className="day-column"
            onClick={() => onDayClick(day)}
            style={{ position: 'relative' }}
          >
            <div className="day-header" style={{ position: 'relative', cursor: 'pointer' }}>
              <div>{day}</div>
              <div style={{ fontSize: '0.85em', marginTop: '4px' }}>
                {getDateForDay(day)}
              </div>
              <div style={{
                marginTop: '8px',
                padding: '4px 10px',
                background: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '6px',
                fontSize: '0.7em',
                fontWeight: '500',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                letterSpacing: '0.3px'
              }}>
                לחץ לפירוט
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
              })
              .sort((a, b) => {
                // Define priority: flight=0, mant=1, abroad=2
                const getPriority = (activity) => {
                  if (!activity.activityType || activity.activityType === 'flight') return 0;
                  if (activity.activityType === 'mant') return 1;
                  if (activity.activityType === 'abroad') return 2;
                  return 3; // fallback for any other type
                };
                return getPriority(a) - getPriority(b);
              })
              .map(activity => (
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
                      <div className="activity-header">
                        <span style={{ fontWeight: 'bold', color: '#667eea' }}>קו טיסה</span>
                      </div>
                      <div className="activity-info">
                        <div style={{ 
                          marginBottom: '8px', 
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
                        {/* Show red warning if vehicle is missing for אווירי activities */}
                        {activity.type === 'אווירי' && (!activity.vehiclesList || activity.vehiclesList.length === 0) && (
                          <div style={{ 
                            background: '#ffcccc', 
                            padding: '4px', 
                            borderRadius: '4px',
                            fontSize: '0.85em',
                            marginTop: '4px',
                            color: '#cc0000',
                            fontWeight: 'bold'
                          }}>
                            ⚠️ לא נבחר רכב
                          </div>
                        )}
                        {/* Show red warning if serial number is missing for אווירי activities */}
                        {activity.type === 'אווירי' && !activity.serialNumber && (
                          <div style={{ 
                            background: '#ffcccc', 
                            padding: '4px', 
                            borderRadius: '4px',
                            fontSize: '0.85em',
                            marginTop: '4px',
                            color: '#cc0000',
                            fontWeight: 'bold'
                          }}>
                            ⚠️ לא הוכנס מספר סחרן
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
                  {isManager && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
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
                      <button 
                        className="copy-btn"
                        onClick={(e) => handleCopyClick(activity, e)}
                        style={{
                          padding: '8px 12px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#059669'}
                        onMouseLeave={(e) => e.target.style.background = '#10b981'}
                      >
                        העתק
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
          selectedDay={selectedDay}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}

      {/* Paste Popup */}
      {showPastePopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0, color: '#667eea', textAlign: 'center' }}>הדבקת פעילות</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
                בחר שבוע:
              </label>
              <select
                value={selectedPasteWeek}
                onChange={(e) => setSelectedPasteWeek(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #667eea',
                  fontSize: '16px'
                }}
              >
                <option value="current">שבוע נוכחי ({weekNumber})</option>
                <option value="next">שבוע הבא ({weekNumber + 1})</option>
                <option value="afterNext">שבועיים קדימה ({weekNumber + 2})</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
                בחר ימים (ניתן לבחור מספר ימים):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {days.map(day => (
                  <label key={day} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px',
                    background: selectedPasteDays.includes(day) ? '#e7f3ff' : '#f9f9f9',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: selectedPasteDays.includes(day) ? '2px solid #667eea' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedPasteDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPasteDays([...selectedPasteDays, day]);
                        } else {
                          setSelectedPasteDays(selectedPasteDays.filter(d => d !== day));
                        }
                      }}
                      style={{ 
                        marginLeft: '10px',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handlePasteFromPopup}
                style={{
                  padding: '12px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                onMouseLeave={(e) => e.target.style.background = '#667eea'}
              >
                הדבק
              </button>
              <button
                onClick={() => {
                  setShowPastePopup(false);
                  setCopiedActivity(null);
                  setSelectedPasteDays([]);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#d0d0d0'}
                onMouseLeave={(e) => e.target.style.background = '#e0e0e0'}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklySchedule;

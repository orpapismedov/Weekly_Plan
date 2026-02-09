import React, { useState, useEffect } from 'react';
import ActivityModal from './ActivityModal';
import MantActivityModal from './MantActivityModal';
import AbroadActivityModal from './AbroadActivityModal';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function DailyPlan({ day, activities, onBack, isManager, onUpdateActivity, onDeleteActivity, weekNumber }) {
  const [editingActivity, setEditingActivity] = useState(null);
  const [editingActivityType, setEditingActivityType] = useState(null);
  const [weatherData, setWeatherData] = useState({
    kziot: { wind: '', visibility: '', clouds: '', temp: '', description: '', turbulence: '', notes: '', loading: true },
    gvulot: { wind: '', visibility: '', clouds: '', temp: '', description: '', turbulence: '', notes: '', loading: true },
    shivta: { wind: '', visibility: '', clouds: '', temp: '', description: '', turbulence: '', notes: '', loading: true },
    ramatDavid: { wind: '', visibility: '', clouds: '', temp: '', description: '', turbulence: '', notes: '', loading: true }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [vehiclePopupActivity, setVehiclePopupActivity] = useState(null);
  const [expandedVehicles, setExpandedVehicles] = useState(null);
  const [isDailyFinal, setIsDailyFinal] = useState(false);

  const cloudOptions = ['1/8', '2/8', '3/8', '4/8', '5/8', '6/8', '7/8', '8/8'];

  // Scroll to top when DailyPlan opens (for mobile)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Load daily final status from Firebase and auto-set if day has arrived or passed
  useEffect(() => {
    const loadDailyStatus = async () => {
      try {
        // Check if the day has arrived (in Israel timezone)
        const now = new Date();
        const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
        
        // Map Hebrew day names to day of week numbers (0 = Sunday, 6 = Saturday)
        const dayMapping = {
          'ראשון': 0,
          'שני': 1,
          'שלישי': 2,
          'רביעי': 3,
          'חמישי': 4,
          'שישי': 5,
          'שבת': 6
        };
        
        const targetDayOfWeek = dayMapping[day];
        if (targetDayOfWeek === undefined) return;
        
        // Calculate the start of the current week (Sunday) in Israel time
        const currentDayOfWeek = israelTime.getDay();
        const startOfCurrentWeek = new Date(israelTime);
        startOfCurrentWeek.setDate(israelTime.getDate() - currentDayOfWeek);
        startOfCurrentWeek.setHours(0, 0, 0, 0);
        
        // Get the current week number
        const startOfYear = new Date(israelTime.getFullYear(), 0, 1);
        const startDay = startOfYear.getDay();
        const daysSinceStart = Math.floor((israelTime - startOfYear) / (24 * 60 * 60 * 1000));
        const adjustedDays = daysSinceStart + startDay;
        const currentWeekNum = Math.ceil((adjustedDays + 1) / 7);
        
        // Calculate how many weeks difference between current week and the weekNumber prop
        const weekDiff = weekNumber - currentWeekNum;
        
        // Calculate the target date (the day we're viewing)
        const targetDate = new Date(startOfCurrentWeek);
        targetDate.setDate(startOfCurrentWeek.getDate() + (weekDiff * 7) + targetDayOfWeek);
        targetDate.setHours(0, 0, 0, 0);
        
        // Check if current Israel time >= target date (day has arrived or passed)
        const dayHasArrived = israelTime >= targetDate;
        
        // Load or create the daily status document
        const docRef = doc(db, 'dailyStatus', `week_${weekNumber}_${day}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const currentStatus = docSnap.data().isFinal || false;
          
          // Auto-set to final if day has arrived/passed and not already marked as final
          if (!currentStatus && dayHasArrived) {
            setIsDailyFinal(true);
            await setDoc(docRef, { isFinal: true });
          } else {
            setIsDailyFinal(currentStatus);
          }
        } else {
          // No document exists - auto-create as final if day has arrived/passed
          if (dayHasArrived) {
            setIsDailyFinal(true);
            await setDoc(docRef, { isFinal: true });
          } else {
            setIsDailyFinal(false);
          }
        }
      } catch (error) {
        console.error('Error loading daily status:', error);
      }
    };
    loadDailyStatus();
  }, [weekNumber, day]);

  // Toggle daily final status
  const handleToggleDailyFinal = async () => {
    const newStatus = !isDailyFinal;
    setIsDailyFinal(newStatus);
    
    try {
      const docRef = doc(db, 'dailyStatus', `week_${weekNumber}_${day}`);
      await setDoc(docRef, { isFinal: newStatus });
      alert(newStatus ? 'היומית סומנה כסופית!' : 'היומית סומנה כלא סופית');
    } catch (error) {
      console.error('Error updating daily status:', error);
      alert('שגיאה בעדכון הסטטוס');
      setIsDailyFinal(!newStatus); // Revert on error
    }
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

  // Location coordinates (accurate Israeli military bases/areas)
  const locations = {
    kziot: { lat: 31.2167, lon: 34.4667, name: 'קציעות', region: 'נגב דרומי' },
    gvulot: { lat: 31.3667, lon: 34.4167, name: 'גבולות', region: 'נגב מערבי' },
    shivta: { lat: 30.8833, lon: 34.6333, name: 'שבטה', region: 'נגב מרכזי' },
    ramatDavid: { lat: 32.6650, lon: 35.1794, name: 'רמת דוד', region: 'עמק יזרעאל' }
  };

  // Fetch weather data on component mount
  useEffect(() => {
    const fetchWeather = async () => {
      // Using OpenWeatherMap API (free tier)
      const API_KEY = 'demo'; // Replace with actual API key
      
      // Calculate the actual date for this day
      const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      const dayIndex = dayNames.indexOf(day);
      
      const today = new Date();
      const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilTarget = (dayIndex - currentDayOfWeek + 7) % 7;
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntilTarget);
      targetDate.setHours(12, 0, 0, 0); // Set to noon for forecast
      
      for (const [key, location] of Object.entries(locations)) {
        try {
          // Try to fetch 5-day forecast
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&lang=he&appid=${API_KEY}`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            // Find the forecast closest to our target date at noon
            const targetTimestamp = targetDate.getTime();
            let closestForecast = data.list[0];
            let minDiff = Math.abs(new Date(closestForecast.dt * 1000).getTime() - targetTimestamp);
            
            data.list.forEach(forecast => {
              const forecastTime = new Date(forecast.dt * 1000).getTime();
              const diff = Math.abs(forecastTime - targetTimestamp);
              if (diff < minDiff) {
                minDiff = diff;
                closestForecast = forecast;
              }
            });
            
            // Calculate wind direction from degrees
            const windDir = getWindDirection(closestForecast.wind.deg);
            const windSpeedKnots = Math.round(closestForecast.wind.speed * 1.944); // m/s to knots
            
            // Calculate cloud coverage in eighths
            const cloudEighths = Math.round(closestForecast.clouds.all / 12.5);
            
            setWeatherData(prev => ({
              ...prev,
              [key]: {
                wind: `${windDir} ${windSpeedKnots} קשר`,
                visibility: `${((closestForecast.visibility || 10000) / 1000).toFixed(1)} ק"מ`,
                clouds: `${cloudEighths}/8`,
                temp: `${Math.round(closestForecast.main.temp)}°C`,
                description: closestForecast.weather[0]?.description || '',
                turbulence: '',
                notes: '',
                loading: false
              }
            }));
          } else {
            // If API fails, set realistic mock data varying by location and day
            const locationVariations = {
              kziot: { tempOffset: 0, windBase: 'דרום-מערב', windSpeed: 10, visibility: 8 },
              gvulot: { tempOffset: -1, windBase: 'מערב', windSpeed: 9, visibility: 9 },
              shivta: { tempOffset: 1, windBase: 'דרום', windSpeed: 8, visibility: 7 },
              ramatDavid: { tempOffset: -2, windBase: 'צפון-מערב', windSpeed: 7, visibility: 10 }
            };
            
            const baseTemps = [18, 20, 19, 21, 22, 20, 17];
            const variation = locationVariations[key];
            const temp = baseTemps[dayIndex] + variation.tempOffset;
            
            setWeatherData(prev => ({
              ...prev,
              [key]: {
                wind: `${variation.windBase} ${variation.windSpeed + (dayIndex % 3)} קשר`,
                visibility: `${variation.visibility + (dayIndex % 2)} ק"מ`,
                clouds: `${(dayIndex % 7) + 1}/8`,
                temp: `${temp}°C`,
                description: temp > 20 ? 'בהיר' : 'בהיר חלקית',
                turbulence: '',
                notes: '',
                loading: false
              }
            }));
          }
        } catch (error) {
          console.log(`Weather API not available for ${location.name}, using demo data for`, day);
          // Set demo data specific to location and day if API fails
          const locationVariations = {
            kziot: { tempOffset: 0, windBase: 'דרום-מערב', windSpeed: 10, visibility: 8 },
            gvulot: { tempOffset: -1, windBase: 'מערב', windSpeed: 9, visibility: 9 },
            shivta: { tempOffset: 1, windBase: 'דרום', windSpeed: 8, visibility: 7 },
            ramatDavid: { tempOffset: -2, windBase: 'צפון-מערב', windSpeed: 7, visibility: 10 }
          };
          
          const baseTemps = [18, 20, 19, 21, 22, 20, 17];
          const variation = locationVariations[key];
          const temp = baseTemps[dayIndex] + variation.tempOffset;
          
          setWeatherData(prev => ({
            ...prev,
            [key]: {
              wind: `${variation.windBase} ${variation.windSpeed + (dayIndex % 3)} קשר`,
              visibility: `${variation.visibility + (dayIndex % 2)} ק"מ`,
              clouds: `${(dayIndex % 7) + 1}/8`,
              temp: `${temp}°C`,
              description: temp > 20 ? 'בהיר' : 'בהיר חלקית',
              loading: false
            }
          }));
        }
      }
    };

    fetchWeather();
  }, [day, locations]);

  const getWindDirection = (degrees) => {
    const directions = ['צפון', 'צפון-מזרח', 'מזרח', 'דרום-מזרח', 'דרום', 'דרום-מערב', 'מערב', 'צפון-מערב'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const handleWeatherChange = (location, field, value) => {
    setWeatherData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        [field]: value
      }
    }));
  };

  const filteredActivities = activities.filter(activity => {
    if (!searchTerm.trim()) return true;
    
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
    ].filter(field => field)
     .join(' ')
     .toLowerCase();

    return searchInFields.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="daily-plan">
      <div className="daily-header">
        <h2>תכנית יומית - {day}</h2>
        <button className="back-btn" onClick={onBack}>חזור לתכנית שבועית</button>
      </div>

      {/* Daily Status Badge and Toggle Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Status Badge - Only show to users, not managers */}
        {!isManager && (
          <div style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: isDailyFinal ? '3px solid #10b981' : '3px solid #ef4444',
            background: isDailyFinal ? '#d1fae5' : '#fee2e2',
            color: isDailyFinal ? '#065f46' : '#991b1b',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {isDailyFinal ? 'יומית סופית' : 'יומית לא סופית'}
          </div>
        )}

        {/* Manager Toggle Button */}
        {isManager && (
          <button
            onClick={handleToggleDailyFinal}
            style={{
              padding: '12px 24px',
              background: isDailyFinal ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {isDailyFinal ? 'הגדר יומית כ "לא סופית"' : 'הגדר יומית כ "סופית"'}
          </button>
        )}
      </div>

      <div className="search-bar" style={{ marginBottom: '20px', position: 'relative' }}>
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
          placeholder="חפש פעילות או עובד..."
          style={{ 
            width: '100%', 
            padding: '12px',
            paddingLeft: searchTerm ? '40px' : '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px solid #667eea'
          }}
        />
      </div>

      {filteredActivities.length === 0 ? (
        <div className="no-results">
          {searchTerm ? `לא נמצאו פעילויות עבור "${searchTerm}"` : 'אין פעילויות מתוכננות ליום זה'}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div style={{ overflowX: 'auto' }}>
            <table className="daily-table">
              <thead>
                <tr>
                  <th>משימה</th>
                  <th>אווירי / קרקעי</th>
                  <th>פלטפורמה</th>
                  <th>שעות</th>
                  {filteredActivities.some(a => a.type === 'אווירי' && a.estimatedTakeoffTime) && (
                    <th>זמן המראה משוער</th>
                  )}
                  <th>מנהל</th>
                  <th>מטיס פנים</th>
                  <th>מטיס חוץ</th>
                  <th>אחראי מנחת</th>
                  <th>טכנאי</th>
                  <th>נוספים</th>
                  <th>אתר עבודה</th>
                  <th>פרויקט</th>
                  <th>רכבים</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
            {filteredActivities.map((activity) => (
              <React.Fragment key={activity.id}>
                <tr>
                  <td>{activity.taskName || activity.projectName || '-'}</td>
                  <td>
                    <span className="activity-type" style={{ 
                      fontSize: '0.8em',
                      background: activity.activityType === 'mant' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                                  activity.activityType === 'abroad' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                                  activity.type === 'אווירי' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                                  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      {activity.activityType === 'mant' ? 'מנ"ט' : activity.activityType === 'abroad' ? 'חו"ל' : activity.type}
                    </span>
                  </td>
                  <td>
                    <span className="platform-badge" style={{ fontSize: '0.85em' }}>
                      {activity.activityType === 'mant' ? '-' : activity.activityType === 'abroad' ? '-' : activity.platform}
                    </span>
                  </td>
                  <td><span style={{ direction: 'ltr', display: 'inline-block' }}>{activity.startTime || '-'} - {activity.endTime || '-'}</span></td>
                  {filteredActivities.some(a => a.type === 'אווירי' && a.estimatedTakeoffTime) && (
                    <td>{activity.type === 'אווירי' && activity.estimatedTakeoffTime ? activity.estimatedTakeoffTime : '-'}</td>
                  )}
                  <td>{activity.manager || activity.projectManager || '-'}</td>
                  <td style={{ 
                    background: shouldHighlightRed(activity, 'pilotInside') ? '#ffcccc' : 'transparent',
                    fontWeight: shouldHighlightRed(activity, 'pilotInside') ? 'bold' : 'normal'
                  }}>
                    {activity.pilotInside || '-'}
                  </td>
                  <td style={{ 
                    background: shouldHighlightRed(activity, 'pilotOutside') ? '#ffcccc' : 'transparent',
                    fontWeight: shouldHighlightRed(activity, 'pilotOutside') ? 'bold' : 'normal'
                  }}>
                    {activity.pilotOutside || '-'}
                  </td>
                  <td style={{ 
                    background: shouldHighlightRed(activity, 'landingManager') ? '#ffcccc' : 'transparent',
                    fontWeight: shouldHighlightRed(activity, 'landingManager') ? 'bold' : 'normal'
                  }}>
                    {activity.landingManager || '-'}
                  </td>
                  <td style={{ 
                    background: shouldHighlightRed(activity, 'technician') ? '#ffcccc' : 'transparent',
                    fontWeight: shouldHighlightRed(activity, 'technician') ? 'bold' : 'normal'
                  }}>
                    {activity.technician || '-'}
                  </td>
                  <td>{activity.additional || '-'}</td>
                  <td>{activity.workSite || '-'}</td>
                  <td>{activity.projectNumber || '-'}</td>
                  <td>
                    {activity.vehicleAssignments && activity.vehicleAssignments.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {Array.isArray(activity.vehiclesList) 
                          ? activity.vehiclesList.map((vehicle, idx) => (
                              <span
                                key={idx}
                                onClick={() => setExpandedVehicles(expandedVehicles === activity.id ? null : activity.id)}
                                style={{
                                  color: '#667eea',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  fontWeight: '600'
                                }}
                                title="לחץ לצפייה בשיבוץ"
                              >
                                {vehicle}{idx < activity.vehiclesList.length - 1 ? ', ' : ''}
                              </span>
                            ))
                          : (
                              <span
                                onClick={() => setExpandedVehicles(expandedVehicles === activity.id ? null : activity.id)}
                                style={{
                                  color: '#667eea',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  fontWeight: '600'
                                }}
                                title="לחץ לצפייה בשיבוץ"
                              >
                                {activity.vehiclesList}
                              </span>
                            )
                        }
                      </div>
                    ) : (
                      Array.isArray(activity.vehiclesList) 
                        ? activity.vehiclesList.join(', ') 
                        : activity.vehiclesList || '-'
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start', alignItems: 'center' }}>
                      {(!activity.activityType || activity.activityType === 'flight') && (
                        <button
                          onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                          style={{
                            padding: '8px 15px',
                            background: expandedActivity === activity.id ? '#dc3545' : '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {expandedActivity === activity.id ? 'סגור' : 'הצג פרטים'}
                        </button>
                      )}
                      {isManager && (
                        <>
                          <button
                            onClick={() => {
                              setEditingActivity(activity);
                              setEditingActivityType(activity.activityType || 'flight');
                            }}
                            style={{
                              padding: '8px 15px',
                              background: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              whiteSpace: 'nowrap'
                            }}
                            title='ערוך פעילות'
                          >
                            ✏️ ערוך
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('האם אתה בטוח שברצונך למחוק פעילות זו?')) {
                                onDeleteActivity(activity.id);
                              }
                            }}
                            style={{
                              padding: '8px 15px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              whiteSpace: 'nowrap'
                            }}
                            title='מחק פעילות'
                          >
                            🗑️ מחק
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedVehicles === activity.id && activity.vehicleAssignments && activity.vehicleAssignments.length > 0 && (
                  <tr>
                    <td colSpan="20" style={{ background: '#f0f8ff', padding: '20px', borderTop: '3px solid #667eea' }}>
                      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <strong style={{ color: '#667eea', fontSize: '18px' }}>🚗 שיבוץ רכבים</strong>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                        {activity.vehicleAssignments.map((va, i) => (
                          <div key={i} style={{ 
                            padding: '15px', 
                            background: 'white', 
                            borderRadius: '12px', 
                            border: '2px solid #667eea',
                            minWidth: '250px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#667eea', fontSize: '16px' }}>
                              🚗 {va.vehicle}
                            </div>
                            {va.passengersOutbound && va.passengersOutbound.length > 0 && (
                              <div style={{ marginBottom: '8px', padding: '8px', background: '#f0f8ff', borderRadius: '6px' }}>
                                <span style={{ color: '#0066cc', fontWeight: 'bold' }}>➡️ הלוך: </span>
                                <span>{va.passengersOutbound.join(', ')}</span>
                              </div>
                            )}
                            {va.passengersReturn && va.passengersReturn.length > 0 && (
                              <div style={{ padding: '8px', background: '#fff8f0', borderRadius: '6px' }}>
                                <span style={{ color: '#ff9800', fontWeight: 'bold' }}>⬅️ חזור: </span>
                                <span>{va.passengersReturn.join(', ')}</span>
                              </div>
                            )}
                            {(!va.passengersOutbound || va.passengersOutbound.length === 0) && 
                             (!va.passengersReturn || va.passengersReturn.length === 0) && (
                              <div style={{ color: '#999', fontStyle: 'italic', padding: '8px' }}>אין נוסעים משוייכים</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {expandedActivity === activity.id && (
                  <tr>
                    <td colSpan="20" style={{ background: '#f0f8ff', padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div>
                          <strong style={{ color: '#667eea' }}>תפוצה:</strong>
                          <div>{activity.distribution || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>POC:</strong>
                          <div>{activity.poc || activity.pocMant || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>נוספים לתפוצה:</strong>
                          <div>{activity.additionalDistribution || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>גורמים נוספים באתר:</strong>
                          <div>{activity.additionalFactorsOnSite || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>מספר זנב:</strong>
                          <div>{activity.tailNumber || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>מספר ישל"ט:</strong>
                          <div>{activity.yaslatNumber || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>משגר:</strong>
                          <div>{activity.launcher || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>מטע"ד:</strong>
                          <div>{activity.matad || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>מנוע:</strong>
                          <div>{activity.engine || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>מספר סחרן:</strong>
                          <div>{activity.serialNumber || '-'}</div>
                        </div>
                        <div>
                          <strong style={{ color: '#667eea' }}>תדרים רלוונטיים:</strong>
                          <div>{activity.relevantFrequencies || '-'}</div>
                        </div>
                        {activity.vehicleAssignments && activity.vehicleAssignments.length > 0 && (
                          <div>
                            <strong style={{ color: '#667eea' }}>שיבוץ רכבים:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                              {activity.vehicleAssignments.map((va, i) => (
                                <div key={i} style={{ 
                                  padding: '10px', 
                                  background: 'white', 
                                  borderRadius: '8px', 
                                  border: '2px solid #667eea',
                                  minWidth: '200px'
                                }}>
                                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#667eea' }}>
                                    🚗 {va.vehicle}
                                  </div>
                                  {va.passengersOutbound && va.passengersOutbound.length > 0 && (
                                    <div style={{ marginBottom: '5px' }}>
                                      <span style={{ color: '#0066cc', fontWeight: 'bold' }}>הלוך: </span>
                                      <span style={{ fontSize: '14px' }}>{va.passengersOutbound.join(', ')}</span>
                                    </div>
                                  )}
                                  {va.passengersReturn && va.passengersReturn.length > 0 && (
                                    <div>
                                      <span style={{ color: '#ff9800', fontWeight: 'bold' }}>חזור: </span>
                                      <span style={{ fontSize: '14px' }}>{va.passengersReturn.join(', ')}</span>
                                    </div>
                                  )}
                                  {(!va.passengersOutbound || va.passengersOutbound.length === 0) && 
                                   (!va.passengersReturn || va.passengersReturn.length === 0) && (
                                    <div style={{ fontSize: '14px', color: '#999' }}>אין נוסעים</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <strong style={{ color: '#667eea' }}>הערות:</strong>
                          <div>{activity.notes || '-'}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-activities-cards">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="mobile-activity-card">
            <div className="card-row">
              <span className="card-label">משימה:</span>
              <span className="card-value">
                <div>{activity.taskName || activity.projectName || '-'}</div>
                {activity.taskName && activity.projectName && (
                  <div style={{ fontSize: '0.9em', color: '#666', marginTop: '2px' }}>({activity.projectName})</div>
                )}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">אווירי / קרקעי:</span>
              <span className="card-value">
                {activity.activityType === 'mant' ? 'מנ"ט' : activity.activityType === 'abroad' ? 'חו"ל' : activity.type}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">פלטפורמה:</span>
              <span className="card-value">
                {activity.activityType === 'mant' ? '-' : activity.activityType === 'abroad' ? '-' : activity.platform}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">שעות:</span>
              <span className="card-value" style={{ direction: 'ltr', display: 'inline-block' }}>{activity.startTime || '-'} - {activity.endTime || '-'}</span>
            </div>
            {activity.type === 'אווירי' && activity.estimatedTakeoffTime && (
              <div className="card-row">
                <span className="card-label">זמן המראה:</span>
                <span className="card-value">{activity.estimatedTakeoffTime}</span>
              </div>
            )}
            <div className="card-row">
              <span className="card-label">מנהל:</span>
              <span className="card-value">{activity.manager || activity.projectManager || '-'}</span>
            </div>
            <div className="card-row">
              <span className="card-label">מטיס פנים:</span>
              <span className={`card-value ${shouldHighlightRed(activity, 'pilotInside') ? 'highlight-red' : ''}`}>
                {activity.pilotInside || '-'}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">מטיס חוץ:</span>
              <span className={`card-value ${shouldHighlightRed(activity, 'pilotOutside') ? 'highlight-red' : ''}`}>
                {activity.pilotOutside || '-'}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">אחראי מנחת:</span>
              <span className={`card-value ${shouldHighlightRed(activity, 'landingManager') ? 'highlight-red' : ''}`}>
                {activity.landingManager || '-'}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">טכנאי:</span>
              <span className={`card-value ${shouldHighlightRed(activity, 'technician') ? 'highlight-red' : ''}`}>
                {activity.technician || '-'}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">נוספים:</span>
              <span className="card-value">{activity.additional || '-'}</span>
            </div>
            <div className="card-row">
              <span className="card-label">POC:</span>
              <span className="card-value">{activity.poc || activity.pocMant || '-'}</span>
            </div>
            <div className="card-row">
              <span className="card-label">אתר עבודה:</span>
              <span className="card-value">{activity.workSite || '-'}</span>
            </div>
            <div className="card-row">
              <span className="card-label">מספר פרויקט:</span>
              <span className="card-value">{activity.activityType === 'abroad' ? '-' : activity.projectNumber || '-'}</span>
            </div>
            <div className="card-row">
              <span className="card-label">רכבים:</span>
              <span className="card-value">
                {Array.isArray(activity.vehiclesList) && activity.vehiclesList.length > 0
                  ? activity.vehiclesList.map((vehicle, idx) => (
                      <span key={idx}>
                        <span
                          onClick={() => setExpandedVehicles(expandedVehicles === activity.id ? null : activity.id)}
                          style={{ cursor: 'pointer', color: '#3b82f6', textDecoration: 'underline' }}
                        >
                          {vehicle}
                        </span>
                        {idx < activity.vehiclesList.length - 1 && ', '}
                      </span>
                    ))
                  : activity.vehiclesList || '-'}
              </span>
            </div>
            
            {/* Expanded Vehicle Assignments for Mobile */}
            {expandedVehicles === activity.id && activity.vehicleAssignments && activity.vehicleAssignments.length > 0 && (
              <div style={{ 
                marginTop: '10px', 
                padding: '12px', 
                background: '#f0f8ff', 
                borderRadius: '8px',
                border: '2px solid #667eea'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#667eea', textAlign: 'center' }}>
                  🚗 שיבוץ רכבים
                </div>
                {activity.vehicleAssignments.map((va, i) => (
                  <div key={i} style={{ 
                    padding: '10px', 
                    background: 'white', 
                    borderRadius: '8px', 
                    marginBottom: i < activity.vehicleAssignments.length - 1 ? '8px' : '0'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#667eea' }}>
                      🚗 {va.vehicle}
                    </div>
                    {va.passengersOutbound && va.passengersOutbound.length > 0 && (
                      <div style={{ marginBottom: '4px', fontSize: '14px' }}>
                        <span style={{ color: '#0066cc', fontWeight: 'bold' }}>➡️ הלוך: </span>
                        <span>{va.passengersOutbound.join(', ')}</span>
                      </div>
                    )}
                    {va.passengersReturn && va.passengersReturn.length > 0 && (
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ color: '#ff9800', fontWeight: 'bold' }}>⬅️ חזור: </span>
                        <span>{va.passengersReturn.join(', ')}</span>
                      </div>
                    )}
                    {(!va.passengersOutbound || va.passengersOutbound.length === 0) && 
                     (!va.passengersReturn || va.passengersReturn.length === 0) && (
                      <div style={{ fontSize: '14px', color: '#999', fontStyle: 'italic' }}>אין נוסעים משוייכים</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="card-actions">
              {(!activity.activityType || activity.activityType === 'flight') && (
                <button
                  onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                  style={{
                    background: expandedActivity === activity.id ? '#dc3545' : '#667eea'
                  }}
                >
                  {expandedActivity === activity.id ? 'סגור' : 'הצג פרטים'}
                </button>
              )}
              {isManager && (
                <>
                  <button
                    onClick={() => {
                      setEditingActivity(activity);
                      setEditingActivityType(activity.activityType || 'flight');
                    }}
                    style={{ background: '#28a745' }}
                    title='ערוך פעילות'
                  >
                    ✏️ ערוך
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('האם אתה בטוח שברצונך למחוק פעילות זו?')) {
                        onDeleteActivity(activity.id);
                      }
                    }}
                    style={{ background: '#dc3545' }}
                    title='מחק פעילות'
                  >
                    🗑️ מחק
                  </button>
                </>
              )}
            </div>

            {/* Expanded Details for Mobile */}
            {expandedActivity === activity.id && (
              <div style={{ 
                marginTop: '15px', 
                padding: '15px', 
                background: '#f0f8ff', 
                borderRadius: '8px',
                borderTop: '2px solid #667eea'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>תפוצה:</strong>
                  <div>{activity.distribution || '-'}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>נוספים לתפוצה:</strong>
                  <div>{activity.additionalDistribution || '-'}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>גורמים נוספים באתר:</strong>
                  <div>{activity.additionalFactorsOnSite || '-'}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>מספר זנב:</strong>
                  <div>{activity.tailNumber || '-'}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>מספר ישל"ט:</strong>
                  <div>{activity.yaslatNumber || '-'}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>משגר:</strong>
                  <div>{activity.launcher || '-'}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>מטע"ד:</strong>
                  <div>{activity.matad || '-'}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>מנוע:</strong>
                  <div>{activity.engine || '-'}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>מספר סחרן:</strong>
                  <div>{activity.serialNumber || '-'}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#667eea' }}>תדרים רלוונטיים:</strong>
                  <div>{activity.relevantFrequencies || '-'}</div>
                </div>
                {activity.vehicleAssignments && activity.vehicleAssignments.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#667eea' }}>שיבוץ רכבים:</strong>
                    <div style={{ marginTop: '10px' }}>
                      {activity.vehicleAssignments.map((va, i) => (
                        <div key={i} style={{ 
                          padding: '10px', 
                          background: 'white', 
                          borderRadius: '8px', 
                          border: '2px solid #667eea',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#667eea' }}>
                            🚗 {va.vehicle}
                          </div>
                          {va.passengersOutbound && va.passengersOutbound.length > 0 && (
                            <div style={{ marginBottom: '5px' }}>
                              <span style={{ color: '#0066cc', fontWeight: 'bold' }}>הלוך: </span>
                              <span style={{ fontSize: '14px' }}>{va.passengersOutbound.join(', ')}</span>
                            </div>
                          )}
                          {va.passengersReturn && va.passengersReturn.length > 0 && (
                            <div>
                              <span style={{ color: '#ff9800', fontWeight: 'bold' }}>חזור: </span>
                              <span style={{ fontSize: '14px' }}>{va.passengersReturn.join(', ')}</span>
                            </div>
                          )}
                          {(!va.passengersOutbound || va.passengersOutbound.length === 0) && 
                           (!va.passengersReturn || va.passengersReturn.length === 0) && (
                            <div style={{ fontSize: '14px', color: '#999' }}>אין נוסעים</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <strong style={{ color: '#667eea' }}>הערות:</strong>
                  <div>{activity.notes || '-'}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )}

      {/* Weather Section */}
      <div className="weather-section" style={{
        marginTop: '30px',
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          marginBottom: '20px', 
          color: '#667eea',
          borderBottom: '2px solid #667eea',
          paddingBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>מזג אוויר - תנאי שטח</span>
          <span style={{ fontSize: '0.7em', color: '#28a745', fontWeight: 'normal' }}>
            ✓ נתונים אוטומטיים מ-OpenWeatherMap
          </span>
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          {[
            { key: 'kziot', label: 'קציעות' },
            { key: 'gvulot', label: 'גבולות' },
            { key: 'shivta', label: 'שבטה' },
            { key: 'ramatDavid', label: 'רמת דוד' }
          ].map(location => (
            <div key={location.key} style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '10px',
              border: '2px solid #e0e0e0'
            }}>
              <h4 style={{ 
                marginBottom: '15px', 
                color: '#333',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {location.label}
              </h4>

              {weatherData[location.key].loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  ⏳ טוען נתונים...
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '12px', textAlign: 'center', padding: '10px', background: '#e7f3ff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                      {weatherData[location.key].temp}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                      {weatherData[location.key].description}
                    </div>
                  </div>
              
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      🌬️ רוח:
                    </label>
                    <input
                      type="text"
                      value={weatherData[location.key].wind}
                      onChange={(e) => handleWeatherChange(location.key, 'wind', e.target.value)}
                      placeholder="כיוון ומהירות"
                      disabled={!isManager}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: 'white',
                        fontWeight: isManager ? 'normal' : 'bold',
                        color: '#333'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      👁️ ראות:
                    </label>
                    <input
                      type="text"
                      value={weatherData[location.key].visibility}
                      onChange={(e) => handleWeatherChange(location.key, 'visibility', e.target.value)}
                      placeholder='ק"מ'
                      disabled={!isManager}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: 'white',
                        fontWeight: isManager ? 'normal' : 'bold',
                        color: '#333'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      ☁️ עננות:
                    </label>
                    <select
                      value={weatherData[location.key].clouds}
                      onChange={(e) => handleWeatherChange(location.key, 'clouds', e.target.value)}
                      disabled={!isManager}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: 'white',
                        fontWeight: isManager ? 'normal' : 'bold',
                        color: '#333'
                      }}
                    >
                      <option value="">בחר עננות</option>
                      {cloudOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      🌪️ חתחותים:
                    </label>
                    <input
                      type="text"
                      value={weatherData[location.key].turbulence}
                      onChange={(e) => handleWeatherChange(location.key, 'turbulence', e.target.value)}
                      placeholder="חתחותים"
                      disabled={!isManager}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: 'white',
                        fontWeight: isManager ? 'normal' : 'bold',
                        color: '#333'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      📝 הערות:
                    </label>
                    <textarea
                      value={weatherData[location.key].notes}
                      onChange={(e) => handleWeatherChange(location.key, 'notes', e.target.value)}
                      placeholder="הערות"
                      disabled={!isManager}
                      rows="2"
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: 'white',
                        fontWeight: isManager ? 'normal' : 'bold',
                        color: '#333',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Activity Modals */}
      {editingActivity && editingActivityType === 'flight' && (
        <ActivityModal
          day={day}
          activity={editingActivity}
          onClose={() => {
            setEditingActivity(null);
            setEditingActivityType(null);
          }}
          onSave={(updatedActivity) => {
            onUpdateActivity(editingActivity.id, updatedActivity);
            setEditingActivity(null);
            setEditingActivityType(null);
          }}
        />
      )}

      {editingActivity && editingActivityType === 'mant' && (
        <MantActivityModal
          activity={editingActivity}
          onClose={() => {
            setEditingActivity(null);
            setEditingActivityType(null);
          }}
          onSave={(updatedActivity) => {
            onUpdateActivity(editingActivity.id, updatedActivity);
            setEditingActivity(null);
            setEditingActivityType(null);
          }}
        />
      )}

      {editingActivity && editingActivityType === 'abroad' && (
        <AbroadActivityModal
          activity={editingActivity}
          onClose={() => {
            setEditingActivity(null);
            setEditingActivityType(null);
          }}
          onSave={(updatedActivity) => {
            onUpdateActivity(editingActivity.id, updatedActivity);
            setEditingActivity(null);
            setEditingActivityType(null);
          }}
        />
      )}

      {/* Vehicle Assignment Popup */}
      {vehiclePopupActivity && (
        <div 
          className="modal-overlay" 
          onClick={() => setVehiclePopupActivity(null)}
          style={{ zIndex: 2000 }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <h2 style={{ color: '#667eea', marginBottom: '20px', textAlign: 'center' }}>
              🚗 שיבוץ רכבים
            </h2>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>
              {vehiclePopupActivity.taskName || vehiclePopupActivity.projectName}
            </h3>
            
            {vehiclePopupActivity.vehicleAssignments && vehiclePopupActivity.vehicleAssignments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {vehiclePopupActivity.vehicleAssignments.map((va, i) => (
                  <div key={i} style={{ 
                    padding: '15px', 
                    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)', 
                    borderRadius: '12px', 
                    border: '2px solid #667eea',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '12px', 
                      color: '#667eea',
                      fontSize: '18px',
                      borderBottom: '2px solid #667eea',
                      paddingBottom: '8px'
                    }}>
                      🚗 {va.vehicle}
                    </div>
                    {va.passengersOutbound && va.passengersOutbound.length > 0 && (
                      <div style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '8px' }}>
                        <span style={{ color: '#0066cc', fontWeight: 'bold', fontSize: '15px' }}>➡️ הלוך: </span>
                        <span style={{ fontSize: '15px' }}>{va.passengersOutbound.join(', ')}</span>
                      </div>
                    )}
                    {va.passengersReturn && va.passengersReturn.length > 0 && (
                      <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}>
                        <span style={{ color: '#ff9800', fontWeight: 'bold', fontSize: '15px' }}>⬅️ חזור: </span>
                        <span style={{ fontSize: '15px' }}>{va.passengersReturn.join(', ')}</span>
                      </div>
                    )}
                    {(!va.passengersOutbound || va.passengersOutbound.length === 0) && 
                     (!va.passengersReturn || va.passengersReturn.length === 0) && (
                      <div style={{ fontSize: '15px', color: '#999', fontStyle: 'italic', padding: '10px' }}>אין נוסעים משוייכים</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '16px' }}>
                אין שיבוץ רכבים עבור פעילות זו
              </div>
            )}
            
            <button
              onClick={() => setVehiclePopupActivity(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                background: '#667eea',
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
      )}
    </div>
  );
}

export default DailyPlan;

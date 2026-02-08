import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import WeeklySchedule from './WeeklySchedule';
import DailyPlan from './DailyPlan';

function PreviousWeeks({ onClose, isManager }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState('');
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 5; year--) {
    years.push(year);
  }

  // Calculate current week number
  const getCurrentWeekNumber = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startDay = startOfYear.getDay();
    const daysSinceStart = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const adjustedDays = daysSinceStart + startDay;
    return Math.ceil((adjustedDays + 1) / 7);
  };

  const currentWeekNumber = getCurrentWeekNumber();

  // Get the date range (Sunday to Thursday) for a given week number
  const getWeekDateRange = (weekNumber) => {
    const currentWeekNum = getCurrentWeekNumber();
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    
    // Calculate the offset in weeks
    const weekOffset = weekNumber - currentWeekNum;
    
    // Calculate the start of the current week (Sunday)
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - currentDayOfWeek);
    
    // Calculate the start of the target week (Sunday)
    const sunday = new Date(startOfCurrentWeek);
    sunday.setDate(startOfCurrentWeek.getDate() + (weekOffset * 7));
    
    // Calculate Thursday (4 days after Sunday)
    const thursday = new Date(sunday);
    thursday.setDate(sunday.getDate() + 4);
    
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    };
    
    return `${formatDate(sunday)} - ${formatDate(thursday)}`;
  };

  // Generate weeks list, excluding current week (only past weeks)
  const weeks = [];
  const maxWeek = selectedYear === currentYear ? currentWeekNumber - 1 : 52;
  for (let i = 1; i <= maxWeek; i++) {
    weeks.push(i);
  }

  const handleLoadWeek = async () => {
    if (!selectedWeek) {
      setError('נא לבחור מספר שבוע');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Calculate week number based on year and week
      const startOfYear = new Date(selectedYear, 0, 1);
      const startDay = startOfYear.getDay();
      const daysToAdd = (parseInt(selectedWeek) - 1) * 7;
      const targetDate = new Date(selectedYear, 0, 1 + daysToAdd - startDay);
      
      const daysSinceYearStart = Math.floor((targetDate - startOfYear) / (24 * 60 * 60 * 1000));
      const adjustedDays = daysSinceYearStart + startDay;
      const weekNumber = Math.ceil((adjustedDays + 1) / 7);

      const docRef = doc(db, 'weekData', `week_${weekNumber}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setWeekData(docSnap.data());
        setError('');
      } else {
        setError('לא נמצאו נתונים לשבוע זה');
        setWeekData(null);
      }
    } catch (err) {
      console.error('Error loading week:', err);
      setError('שגיאה בטעינת הנתונים');
      setWeekData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '95vw', 
          maxHeight: '95vh', 
          overflow: 'auto',
          width: window.innerWidth <= 768 ? '98vw' : 'auto',
          height: window.innerWidth <= 768 ? '98vh' : 'auto',
          padding: window.innerWidth <= 768 ? '15px' : '20px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h2 style={{ 
            color: '#667eea', 
            margin: 0,
            fontSize: window.innerWidth <= 768 ? '18px' : '24px'
          }}>
            שבועות קודמים
          </h2>
          <button 
            onClick={onClose}
            style={{
              padding: window.innerWidth <= 768 ? '10px 20px' : '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: window.innerWidth <= 768 ? '16px' : '14px',
              fontWeight: 'bold'
            }}
          >
            סגור
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '20px', 
          padding: window.innerWidth <= 768 ? '15px 10px' : '20px',
          background: '#f8f9fa', 
          borderRadius: '8px',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              שנה:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                const newYear = parseInt(e.target.value);
                setSelectedYear(newYear);
                // Clear selected week if it's now invalid
                if (newYear === currentYear && parseInt(selectedWeek) >= currentWeekNumber) {
                  setSelectedWeek('');
                  setWeekData(null);
                }
              }}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '2px solid #667eea'
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              מספר שבוע:
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '2px solid #667eea'
              }}
            >
              <option value="">בחר שבוע</option>
              {weeks.map(week => {
                // Calculate the actual week number for this year and week
                const startOfYear = new Date(selectedYear, 0, 1);
                const startDay = startOfYear.getDay();
                const daysToAdd = (week - 1) * 7;
                const targetDate = new Date(selectedYear, 0, 1 + daysToAdd - startDay);
                
                const daysSinceYearStart = Math.floor((targetDate - startOfYear) / (24 * 60 * 60 * 1000));
                const adjustedDays = daysSinceYearStart + startDay;
                const weekNumber = Math.ceil((adjustedDays + 1) / 7);
                
                const dateRange = getWeekDateRange(weekNumber);
                
                return (
                  <option key={week} value={week}>
                    שבוע {week} ({dateRange})
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
            <button
              onClick={handleLoadWeek}
              disabled={loading || !selectedWeek}
              style={{
                padding: window.innerWidth <= 768 ? '12px' : '10px 30px',
                background: loading || !selectedWeek ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || !selectedWeek ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                width: window.innerWidth <= 768 ? '100%' : 'auto'
              }}
            >
              {loading ? 'טוען...' : 'הצג שבוע'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '15px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            marginBottom: '20px',
            color: '#856404'
          }}>
            {error}
          </div>
        )}

        {weekData && (
          <div style={{ marginTop: '20px' }}>
            {!selectedDay ? (
              <>
                <div style={{ 
                  padding: '10px 20px', 
                  background: '#e7f3ff', 
                  borderRadius: '6px', 
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  <strong style={{ 
                    color: '#667eea', 
                    fontSize: window.innerWidth <= 768 ? '16px' : '18px'
                  }}>
                    שנה {selectedYear} - שבוע {selectedWeek} (שבוע מס' {weekData.weekNumber})
                  </strong>
                </div>
                <WeeklySchedule
                  weekNumber={weekData.weekNumber}
                  weekDateRange={getWeekDateRange(weekData.weekNumber)}
                  activities={weekData.activities}
                  isManager={false}
                  onAddActivity={() => {}}
                  onUpdateActivity={() => {}}
                  onDeleteActivity={() => {}}
                  onDayClick={(day) => setSelectedDay(day)}
                  currentWeekNumber={currentWeekNumber}
                />
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  background: '#fff3cd', 
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: '#856404'
                }}>
                  ⚠️ זוהי תצוגה לקריאה בלבד - לא ניתן לערוך שבועות קודמים
                </div>
              </>
            ) : (
              <>
                <div style={{ 
                  padding: '10px 20px', 
                  background: '#e7f3ff', 
                  borderRadius: '6px', 
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => setSelectedDay(null)}
                    style={{
                      padding: window.innerWidth <= 768 ? '10px 15px' : '8px 16px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: window.innerWidth <= 768 ? '16px' : '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    ← חזור לתצוגה שבועית
                  </button>
                  <strong style={{ 
                    color: '#667eea', 
                    fontSize: window.innerWidth <= 768 ? '16px' : '18px',
                    width: window.innerWidth <= 768 ? '100%' : 'auto',
                    textAlign: window.innerWidth <= 768 ? 'center' : 'right'
                  }}>
                    {selectedDay} - שבוע {selectedWeek} ({weekData.weekNumber})
                  </strong>
                </div>
                <DailyPlan
                  day={selectedDay}
                  activities={weekData.activities[selectedDay] || []}
                  weekNumber={weekData.weekNumber}
                  onBack={() => setSelectedDay(null)}
                  isManager={false}
                  onUpdateActivity={() => {}}
                  onDeleteActivity={() => {}}
                />
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  background: '#fff3cd', 
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: '#856404'
                }}>
                  ⚠️ זוהי תצוגה לקריאה בלבד - לא ניתן לערוך שבועות קודמים
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviousWeeks;

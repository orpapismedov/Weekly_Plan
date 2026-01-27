import React, { useState, useEffect } from 'react';
import './App.css';
import WeeklySchedule from './components/WeeklySchedule';
import DailyPlan from './components/DailyPlan';
import UserSearch from './components/UserSearch';
import Suppliers from './components/Suppliers';
import MealsLink from './components/MealsLink';
import AdditionalInfo from './components/AdditionalInfo';
import FrequencyTable from './components/FrequencyTable';
import PreviousWeeks from './components/PreviousWeeks';
import { motion } from 'framer-motion';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function getCurrentWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startDay = startOfYear.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate days since start of year
  const daysSinceStart = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  
  // Adjust for the first partial week
  // If Jan 1 is not Sunday, count it as week 1
  const adjustedDays = daysSinceStart + startDay;
  
  return Math.ceil((adjustedDays + 1) / 7);
}

// Check if it's past Friday 10:00 AM Israel time
function isPastFridayRollover() {
  const now = new Date();
  // Convert to Israel time (UTC+2 or UTC+3 depending on DST)
  const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  
  const day = israelTime.getDay(); // 0 = Sunday, 5 = Friday
  const hours = israelTime.getHours();
  const minutes = israelTime.getMinutes();
  
  // If it's Friday (5) and past 10:00 AM, or if it's Saturday (6), return true
  if (day === 5 && (hours > 10 || (hours === 10 && minutes >= 0))) {
    return true;
  }
  if (day === 6) {
    return true;
  }
  
  return false;
}

// Get the effective week offset considering Friday rollover
function getEffectiveWeekOffset(offset) {
  return isPastFridayRollover() ? offset + 1 : offset;
}

function initializeWeekActivities() {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const activities = {};
  days.forEach(day => {
    activities[day] = [];
  });
  return activities;
}

function App() {
  const [viewMode, setViewMode] = useState('user'); // 'manager' or 'user'
  const [selectedDay, setSelectedDay] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [showMealsLink, setShowMealsLink] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showFrequencyTable, setShowFrequencyTable] = useState(false);
  const [showPreviousWeeks, setShowPreviousWeeks] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, 1 = next week, 2 = week after
  const [loading, setLoading] = useState(true);
  
  // Load week data from Firebase or initialize
  const loadWeekData = async (offset) => {
    const currentWeekNum = getCurrentWeekNumber();
    const effectiveOffset = getEffectiveWeekOffset(offset);
    const weekNum = currentWeekNum + effectiveOffset;
    
    try {
      const docRef = doc(db, 'weekData', `week_${weekNum}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (error) {
      console.error('Error loading week data:', error);
    }
    
    return {
      weekNumber: weekNum,
      activities: initializeWeekActivities()
    };
  };
  
  const [weekData, setWeekData] = useState({
    weekNumber: getCurrentWeekNumber(),
    activities: initializeWeekActivities()
  });

  // Load initial data from Firebase
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const data = await loadWeekData(0);
      setWeekData(data);
      setLoading(false);
    };
    initializeData();
  }, []);

  // Save to Firebase whenever weekData changes
  useEffect(() => {
    const saveWeekData = async () => {
      if (!loading && weekData.weekNumber) {
        try {
          const docRef = doc(db, 'weekData', `week_${weekData.weekNumber}`);
          await setDoc(docRef, weekData);
        } catch (error) {
          console.error('Error saving week data:', error);
        }
      }
    };
    saveWeekData();
  }, [weekData, loading]);

  // Ensure users always see current week
  useEffect(() => {
    const resetUserView = async () => {
      if (viewMode === 'user' && currentWeekOffset !== 0) {
        setCurrentWeekOffset(0);
        const data = await loadWeekData(0);
        setWeekData(data);
        setSelectedDay(null);
      }
    };
    resetUserView();
  }, [viewMode]);

  // Persistent state for utility components - Load from Firebase
  const [suppliers, setSuppliers] = useState([]);
  const [mealsLink, setMealsLink] = useState('');
  const [additionalInfoData, setAdditionalInfoData] = useState({
    platforms: [],
    workSites: [],
    phoneNumbers: []
  });

  // Load suppliers from Firebase
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const docRef = doc(db, 'settings', 'suppliers');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSuppliers(docSnap.data().list || []);
        }
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }
    };
    loadSuppliers();
  }, []);

  // Save suppliers to Firebase
  useEffect(() => {
    const saveSuppliers = async () => {
      if (!loading) {
        try {
          await setDoc(doc(db, 'settings', 'suppliers'), { list: suppliers });
        } catch (error) {
          console.error('Error saving suppliers:', error);
        }
      }
    };
    saveSuppliers();
  }, [suppliers, loading]);

  // Load meals link from Firebase
  useEffect(() => {
    const loadMealsLink = async () => {
      try {
        const docRef = doc(db, 'settings', 'mealsLink');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMealsLink(docSnap.data().url || '');
        }
      } catch (error) {
        console.error('Error loading meals link:', error);
      }
    };
    loadMealsLink();
  }, []);

  // Save meals link to Firebase
  useEffect(() => {
    const saveMealsLink = async () => {
      if (!loading) {
        try {
          await setDoc(doc(db, 'settings', 'mealsLink'), { url: mealsLink });
        } catch (error) {
          console.error('Error saving meals link:', error);
        }
      }
    };
    saveMealsLink();
  }, [mealsLink, loading]);

  // Load additional info from Firebase
  useEffect(() => {
    const loadAdditionalInfo = async () => {
      try {
        const docRef = doc(db, 'settings', 'additionalInfo');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdditionalInfoData(docSnap.data());
        }
      } catch (error) {
        console.error('Error loading additional info:', error);
      }
    };
    loadAdditionalInfo();
  }, []);

  // Save additional info to Firebase
  useEffect(() => {
    const saveAdditionalInfo = async () => {
      if (!loading) {
        try {
          await setDoc(doc(db, 'settings', 'additionalInfo'), additionalInfoData);
        } catch (error) {
          console.error('Error saving additional info:', error);
        }
      }
    };
    saveAdditionalInfo();
  }, [additionalInfoData, loading]);

  const handleAddActivity = (day, activity) => {
    setWeekData(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [day]: [...prev.activities[day], { ...activity, id: Date.now() }]
      }
    }));
  };

  const handleUpdateActivity = (day, activityId, updatedActivity) => {
    setWeekData(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [day]: prev.activities[day].map(act => 
          act.id === activityId ? { ...act, ...updatedActivity } : act
        )
      }
    }));
  };

  const handleDeleteActivity = (day, activityId) => {
    setWeekData(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [day]: prev.activities[day].filter(act => act.id !== activityId)
      }
    }));
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const handleManagerModeClick = async () => {
    if (viewMode === 'user') {
      setShowPasswordPrompt(true);
    } else {
      // When switching back to user mode, always reset to current week
      setViewMode('user');
      setCurrentWeekOffset(0);
      setLoading(true);
      const data = await loadWeekData(0);
      setWeekData(data);
      setSelectedDay(null);
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (password) => {
    if (password === 'weekly') {
      setViewMode('manager');
      setShowPasswordPrompt(false);
    } else {
      alert('סיסמה שגויה!');
    }
  };

  const handleWeekChange = async (offset) => {
    setLoading(true);
    setCurrentWeekOffset(offset);
    const data = await loadWeekData(offset);
    setWeekData(data);
    setSelectedDay(null);
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        zIndex: 0
      }}>
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <radialGradient id="beam1">
              <stop offset="0%" stopColor="#444444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#333333" stopOpacity="0" />
            </radialGradient>
            
            <radialGradient id="beam2">
              <stop offset="0%" stopColor="#3a3a3a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2a2a2a" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          <motion.circle
            cx="20%"
            cy="20%"
            r="100"
            fill="url(#beam1)"
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <motion.circle
            cx="80%"
            cy="30%"
            r="120"
            fill="url(#beam2)"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          
          <motion.circle
            cx="50%"
            cy="70%"
            r="100"
            fill="url(#beam1)"
            animate={{ scale: [0.9, 1.12, 0.9] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </svg>
      </div>

      <div className="App" style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        <header className="app-header">
          <div className="logo-section">
            <h1>🛩️ AERONAUTICS</h1>
            <p>תכנון פעילות יומית - מבצעי אוויר</p>
          </div>
        <div className="mode-toggle">
          <button 
            onClick={() => setShowPreviousWeeks(true)}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '180px'
            }}
          >
            שבועות קודמים
          </button>
          <button 
            onClick={() => setShowFrequencyTable(true)}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '180px'
            }}
          >
            טבלת תדרים
          </button>
          <button 
            onClick={() => setShowSuppliers(true)}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '180px'
            }}
          >
            ספקים
          </button>
          <button 
            onClick={() => setShowMealsLink(true)}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              background: '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '180px'
            }}
          >
            קישור לקובץ ארוחות
          </button>
          <button 
            onClick={() => setShowAdditionalInfo(true)}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              background: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '180px'
            }}
          >
            מידע נוסף
          </button>
          <button 
            className={viewMode === 'manager' ? 'active' : ''}
            onClick={handleManagerModeClick}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '180px'
            }}
          >
            {viewMode === 'manager' ? 'חזור למשתמש' : 'מנהל'}
          </button>
        </div>
      </header>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: 'white',
          fontSize: '18px'
        }}>
          <div style={{ marginBottom: '20px' }}>⏳ טוען נתונים...</div>
        </div>
      )}

      {showPasswordPrompt && (
        <div className="modal-overlay" onClick={() => setShowPasswordPrompt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>הזן סיסמה למצב מנהל</h3>
              <button 
                onClick={() => setShowPasswordPrompt(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="סגור"
              >
                ✕
              </button>
            </div>
            <input
              type="password"
              placeholder="סיסמה"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit(e.target.value);
                }
              }}
              autoFocus
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
            />
            <button 
              onClick={(e) => {
                const input = e.target.previousSibling;
                handlePasswordSubmit(input.value);
              }}
              className="submit-btn"
              style={{ marginTop: '15px', width: '100%' }}
            >
              אישור
            </button>
          </div>
        </div>
      )}

      {viewMode === 'user' && (
        <UserSearch weekData={weekData} onDayClick={handleDayClick} />
      )}

      {viewMode === 'manager' && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginBottom: '20px',
          padding: '20px'
        }}>
          <button
            onClick={() => handleWeekChange(0)}
            style={{
              padding: '12px 24px',
              background: currentWeekOffset === 0 ? '#667eea' : '#e0e0e0',
              color: currentWeekOffset === 0 ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: currentWeekOffset === 0 ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
            }}
          >
            שבוע נוכחי ({getCurrentWeekNumber()})
          </button>
          <button
            onClick={() => handleWeekChange(1)}
            style={{
              padding: '12px 24px',
              background: currentWeekOffset === 1 ? '#667eea' : '#e0e0e0',
              color: currentWeekOffset === 1 ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: currentWeekOffset === 1 ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
            }}
          >
            שבוע הבא ({getCurrentWeekNumber() + 1})
          </button>
          <button
            onClick={() => handleWeekChange(2)}
            style={{
              padding: '12px 24px',
              background: currentWeekOffset === 2 ? '#667eea' : '#e0e0e0',
              color: currentWeekOffset === 2 ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: currentWeekOffset === 2 ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
            }}
          >
            שבועיים הבאים ({getCurrentWeekNumber() + 2})
          </button>
        </div>
      )}

      {selectedDay ? (
        <DailyPlan 
          day={selectedDay}
          activities={weekData.activities[selectedDay]}
          onBack={() => setSelectedDay(null)}
          isManager={viewMode === 'manager'}
          onUpdateActivity={(activityId, updatedActivity) => 
            handleUpdateActivity(selectedDay, activityId, updatedActivity)
          }
          onDeleteActivity={(activityId) => 
            handleDeleteActivity(selectedDay, activityId)
          }
        />
      ) : (
        <WeeklySchedule 
          weekNumber={weekData.weekNumber}
          currentWeekNumber={getCurrentWeekNumber()}
          activities={weekData.activities}
          isManager={viewMode === 'manager'}
          onAddActivity={handleAddActivity}
          onUpdateActivity={handleUpdateActivity}
          onDeleteActivity={handleDeleteActivity}
          onDayClick={handleDayClick}
        />
      )}

      {showSuppliers && (
        <Suppliers 
          isManager={viewMode === 'manager'} 
          onClose={() => setShowSuppliers(false)}
          suppliers={suppliers}
          setSuppliers={setSuppliers}
        />
      )}

      {showMealsLink && (
        <MealsLink 
          isManager={viewMode === 'manager'} 
          onClose={() => setShowMealsLink(false)}
          mealsLink={mealsLink}
          setMealsLink={setMealsLink}
        />
      )}

      {showAdditionalInfo && (
        <AdditionalInfo 
          isManager={viewMode === 'manager'} 
          onClose={() => setShowAdditionalInfo(false)}
          data={additionalInfoData}
          setData={setAdditionalInfoData}
        />
      )}

      {showFrequencyTable && (
        <FrequencyTable 
          isManager={viewMode === 'manager'} 
          onClose={() => setShowFrequencyTable(false)}
        />
      )}

      {showPreviousWeeks && (
        <PreviousWeeks 
          isManager={viewMode === 'manager'} 
          onClose={() => setShowPreviousWeeks(false)}
        />
      )}
      </div>
    </div>
  );
}

export default App;

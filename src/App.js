import React, { useState, useEffect } from 'react';
import './App.css';
import WeeklySchedule from './components/WeeklySchedule';
import DailyPlan from './components/DailyPlan';
import UserSearch from './components/UserSearch';
import Suppliers from './components/Suppliers';
import DealerNumbers from './components/DealerNumbers';
import MealsLink from './components/MealsLink';
import AdditionalInfo from './components/AdditionalInfo';
import FrequencyTable from './components/FrequencyTable';
import PreviousWeeks from './components/PreviousWeeks';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

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

// Get the date range (Sunday to Thursday) for a given week number
function getWeekDateRange(weekNumber) {
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
  
  return `${formatDate(thursday)} - ${formatDate(sunday)}`;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // NEW: Site-wide authentication
  const [viewMode, setViewMode] = useState('user'); // 'manager' or 'user'
  const [selectedDay, setSelectedDay] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [showDealerNumbers, setShowDealerNumbers] = useState(false);
  const [showMealsLink, setShowMealsLink] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showFrequencyTable, setShowFrequencyTable] = useState(false);
  const [showPreviousWeeks, setShowPreviousWeeks] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, 1 = next week, 2 = week after
  const [loading, setLoading] = useState(true);
  const [publishedWeekOffset, setPublishedWeekOffset] = useState(0); // 0 = current week, 1 = next week (for users)
  const [rememberMe, setRememberMe] = useState(false); // NEW: Remember me checkbox state
  const [showPassword, setShowPassword] = useState(false); // NEW: Show/hide password toggle
  const [showManagerPassword, setShowManagerPassword] = useState(false); // NEW: Show/hide manager password toggle
  
  // Load week data from Firebase or initialize
  const loadWeekData = async (offset) => {
    const currentWeekNum = getCurrentWeekNumber();
    const weekNum = currentWeekNum + offset;
    
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

  // Prevent body scroll when password screen is showing
  useEffect(() => {
    if (!isAuthenticated) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isAuthenticated]);

  // Load initial data from Firebase
  useEffect(() => {
    const initializeData = async () => {
      // Check if user is already authenticated (from localStorage)
      const savedAuth = localStorage.getItem('weeklyplan_auth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          setIsAuthenticated(true);
          setViewMode(authData.role || 'user');
        } catch (error) {
          localStorage.removeItem('weeklyplan_auth');
        }
      }
      
      setLoading(true);
      
      // Load published week offset
      try {
        const settingsRef = doc(db, 'settings', 'weekPublication');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          setPublishedWeekOffset(settingsSnap.data().publishedWeekOffset || 0);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
      
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

  // Ensure users see the published week
  useEffect(() => {
    const resetUserView = async () => {
      if (viewMode === 'user' && currentWeekOffset !== publishedWeekOffset) {
        setCurrentWeekOffset(publishedWeekOffset);
        const data = await loadWeekData(publishedWeekOffset);
        setWeekData(data);
        setSelectedDay(null);
      }
    };
    resetUserView();
  }, [viewMode, publishedWeekOffset, currentWeekOffset]);

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

  const handleAddActivityToWeek = async (targetWeekNumber, day, activity) => {
    try {
      const docRef = doc(db, 'weekData', `week_${targetWeekNumber}`);
      const docSnap = await getDoc(docRef);
      
      let weekDataToUpdate;
      if (docSnap.exists()) {
        weekDataToUpdate = docSnap.data();
      } else {
        // Initialize new week if it doesn't exist
        weekDataToUpdate = {
          weekNumber: targetWeekNumber,
          activities: {
            'ראשון': [],
            'שני': [],
            'שלישי': [],
            'רביעי': [],
            'חמישי': []
          }
        };
      }

      // Add the activity to the specified day
      weekDataToUpdate.activities[day] = [
        ...weekDataToUpdate.activities[day],
        { ...activity, id: Date.now() + Math.random() }
      ];

      // Save to Firebase
      await setDoc(docRef, weekDataToUpdate);

      // If the target week is the currently viewed week, update local state
      if (targetWeekNumber === weekData.weekNumber) {
        setWeekData(weekDataToUpdate);
      }

      return true;
    } catch (error) {
      console.error('Error adding activity to week:', error);
      return false;
    }
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

  const handlePasswordSubmit = async (password, isInitialAuth = false) => {
    try {
      // TEMPORARY: For localhost testing, use hardcoded password
      // After setting up Netlify, replace 'YOUR-SITE-NAME' with your actual Netlify site name
      const NETLIFY_FUNCTION_URL = 'https://weeklyplan1.netlify.app/.netlify/functions/validate-password';
      
      // Temporary localhost fallback
      if (NETLIFY_FUNCTION_URL.includes('YOUR-SITE-NAME')) {
        if (password === 'weekly') {
          if (isInitialAuth) {
            setIsAuthenticated(true);
            if (rememberMe) {
              localStorage.setItem('weeklyplan_auth', JSON.stringify({ role: 'manager' }));
            }
          }
          setViewMode('manager');
          setShowPasswordPrompt(false);
          return true;
        } else if (password === 'user123' && isInitialAuth) {
          setIsAuthenticated(true);
          setViewMode('user');
          if (rememberMe) {
            localStorage.setItem('weeklyplan_auth', JSON.stringify({ role: 'user' }));
          }
          return true;
        } else {
          alert('סיסמה שגויה!');
          return false;
        }
      }
      
      const response = await fetch(NETLIFY_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        if (isInitialAuth) {
          setIsAuthenticated(true);
          if (rememberMe) {
            localStorage.setItem('weeklyplan_auth', JSON.stringify({ role: data.role }));
          }
        }
        setViewMode(data.role || 'manager');
        setShowPasswordPrompt(false);
        return true;
      } else {
        alert('סיסמה שגויה!');
        return false;
      }
    } catch (error) {
      console.error('Error validating password:', error);
      alert('שגיאה בבדיקת הסיסמה');
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('weeklyplan_auth');
    setIsAuthenticated(false);
    setViewMode('user');
  };

  const exportToExcel = () => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];
    const data = [];

    // Add header row
    data.push(['יום', 'סוג פעילות', 'פלטפורמה', 'משימה/פרויקט', 'סוג', 'שעות', 'מנהל/מנהל פרויקט', 'מטיס פנים', 'מטיס חוץ', 'אחראי מנחת', 'טכנאי', 'איש קשר', 'הערות']);

    // Add data rows
    days.forEach(day => {
      const dayActivities = weekData.activities[day];
      if (dayActivities.length === 0) {
        data.push([day, '', '', '', '', '', '', '', '', '', '', '', '']);
      } else {
        dayActivities.forEach((activity, index) => {
          const activityType = activity.activityType === 'mant' ? 'מנ"ט' : 
                              activity.activityType === 'abroad' ? 'חו"ל' : 'קו טיסה';
          
          const taskProject = activity.taskName || activity.projectName || '';
          const manager = activity.manager || activity.projectManager || '';
          const hours = activity.startTime && activity.endTime ? `${activity.startTime} - ${activity.endTime}` : '';
          const poc = activity.poc || activity.pocMant || '';

          data.push([
            index === 0 ? day : '', // Show day only for first activity
            activityType,
            activity.platform || '',
            taskProject,
            activity.type || '',
            hours,
            manager,
            activity.pilotInside || '',
            activity.pilotOutside || '',
            activity.landingManager || '',
            activity.technician || '',
            poc,
            activity.notes || ''
          ]);
        });
      }
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, // יום
      { wch: 12 }, // סוג פעילות
      { wch: 15 }, // פלטפורמה
      { wch: 25 }, // משימה/פרויקט
      { wch: 10 }, // סוג
      { wch: 15 }, // שעות
      { wch: 15 }, // מנהל
      { wch: 15 }, // מטיס פנים
      { wch: 15 }, // מטיס חוץ
      { wch: 15 }, // אחראי מנחת
      { wch: 15 }, // טכנאי
      { wch: 15 }, // איש קשר
      { wch: 30 }  // הערות
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `שבוע ${weekData.weekNumber}`);

    // Save file
    XLSX.writeFile(wb, `תכנית_שבועית_שבוע_${weekData.weekNumber}.xlsx`);
  };

  const handleWeekChange = async (offset) => {
    setLoading(true);
    setCurrentWeekOffset(offset);
    const data = await loadWeekData(offset);
    setWeekData(data);
    setSelectedDay(null);
    setLoading(false);
  };

  const handleTogglePublishedWeek = async () => {
    const newOffset = publishedWeekOffset === 0 ? 1 : 0;
    setPublishedWeekOffset(newOffset);
    
    // Save to Firebase
    try {
      const settingsRef = doc(db, 'settings', 'weekPublication');
      await setDoc(settingsRef, { publishedWeekOffset: newOffset });
      alert(newOffset === 1 ? 'שבוע הבא פורסם למשתמשים!' : 'חזרה להצגת השבוע הנוכחי');
    } catch (error) {
      console.error('Error updating published week:', error);
      alert('שגיאה בעדכון ההגדרות');
    }
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
        background: 'linear-gradient(135deg, #ff6347 0%, #dc2626 25%, #1a1a1a 75%, #000000 100%)',
        zIndex: 0
      }}></div>

      {/* Initial Password Screen */}
      {!isAuthenticated && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ff6347 0%, #dc2626 25%, #1a1a1a 75%, #000000 100%)',
          zIndex: 9999,
          overflow: 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '15px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <img 
              src={`${process.env.PUBLIC_URL}/aeronautics-logo-login.png`}
              alt="Aeronautics Logo" 
              style={{
                height: '94px',
                width: 'auto',
                marginBottom: '20px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 style={{ 
              marginBottom: '25px',
              color: '#333',
              fontSize: window.innerWidth >= 768 ? '26px' : '18px',
              fontWeight: 'bold'
            }}>
              תכנון פעילות שבועית<br/>קו טיסה
            </h1>
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="הכנס סיסמה"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  textAlign: 'center',
                  direction: 'rtl'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit(e.target.value, true);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '0 5px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              gap: '8px'
            }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="rememberMe" 
                style={{ 
                  color: '#666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                זכור אותי
              </label>
            </div>
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling.previousElementSibling.querySelector('input');
                handlePasswordSubmit(input.value, true);
              }}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ff6347 0%, #dc2626 25%, #1a1a1a 75%, #000000 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              כניסה
            </button>
            <p style={{
              marginTop: '20px',
              color: '#999',
              fontSize: '12px'
            }}>
              הזן סיסמת עובד לצורך צפייה או סיסמת מנהל לצורך עריכה
            </p>
          </div>
        </div>
      )}

      <div className="App" style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        <header className="app-header">
          <div className="logo-section">
            <img 
              src={`${process.env.PUBLIC_URL}/aeronautics-logo.svg`}
              alt="Aeronautics Logo" 
              style={{
                height: window.innerWidth >= 768 ? '70px' : '50px',
                width: 'auto'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <h1 style={{ display: 'none' }}>🛩️ AERONAUTICS</h1>
            <p>תכנון פעילות שבועית - מבצעי אוויר</p>
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
            onClick={() => setShowDealerNumbers(true)}
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
            טבלת מספרי סחרן
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
              minWidth: '180px',
              gridColumn: '4',
              gridRow: '1'
            }}
          >
            {viewMode === 'manager' ? 'חזור למשתמש' : 'מנהל'}
          </button>
          {viewMode === 'manager' && (
            <button 
              onClick={exportToExcel}
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
                minWidth: '180px',
                gridColumn: '4',
                gridRow: '2'
              }}
            >
              ייצוא לאקסל
            </button>
          )}
          {viewMode !== 'manager' && (
            <button 
              onClick={handleLogout}
              style={{
                marginLeft: '10px',
                padding: '10px 20px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: '100px',
                gridColumn: '4',
                gridRow: '2'
              }}
            >
              התנתק
            </button>
          )}
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
            <div style={{ position: 'relative' }}>
              <input
                type={showManagerPassword ? "text" : "password"}
                placeholder="סיסמה"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit(e.target.value);
                  }
                }}
                autoFocus
                style={{ width: '100%', padding: '12px 45px 12px 12px', fontSize: '16px' }}
              />
              <button
                type="button"
                onClick={() => setShowManagerPassword(!showManagerPassword)}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '0 5px'
                }}
              >
                {showManagerPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button 
              onClick={(e) => {
                const input = e.target.previousSibling.querySelector('input');
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
        <>
          <UserSearch weekData={weekData} onDayClick={handleDayClick} />
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
              boxShadow: currentWeekOffset === 0 ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>שבוע נוכחי ({getCurrentWeekNumber()})</span>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>{getWeekDateRange(getCurrentWeekNumber())}</span>
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
              boxShadow: currentWeekOffset === 1 ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>שבוע הבא ({getCurrentWeekNumber() + 1})</span>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>{getWeekDateRange(getCurrentWeekNumber() + 1)}</span>
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
              boxShadow: currentWeekOffset === 2 ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>שבועיים הבאים ({getCurrentWeekNumber() + 2})</span>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>{getWeekDateRange(getCurrentWeekNumber() + 2)}</span>
          </button>
        </div>
        
        {/* Publish Week Button for Managers - Only show in weekly view, not in daily plan */}
        {!selectedDay && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '15px',
            marginBottom: '20px'
          }}>
            <button
              onClick={handleTogglePublishedWeek}
              style={{
                padding: '14px 28px',
                background: publishedWeekOffset === 1 ? '#f59e0b' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              {publishedWeekOffset === 1 ? 'בטל פרסום שבועית' : 'פרסם את שבוע הבא'}
            </button>
          </div>
        )}
        </>
      )}

      {selectedDay ? (
        <DailyPlan 
          day={selectedDay}
          activities={weekData.activities[selectedDay]}
          weekNumber={weekData.weekNumber}
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
          weekDateRange={getWeekDateRange(weekData.weekNumber)}
          currentWeekNumber={getCurrentWeekNumber()}
          activities={weekData.activities}
          isManager={viewMode === 'manager'}
          onAddActivity={handleAddActivity}
          onAddActivityToWeek={handleAddActivityToWeek}
          onUpdateActivity={handleUpdateActivity}
          onDeleteActivity={handleDeleteActivity}
          onDayClick={handleDayClick}
        />
      )}}

      {showSuppliers && (
        <Suppliers 
          isManager={viewMode === 'manager'} 
          onClose={() => setShowSuppliers(false)}
          suppliers={suppliers}
          setSuppliers={setSuppliers}
        />
      )}

      {showDealerNumbers && (
        <DealerNumbers 
          isManager={viewMode === 'manager'} 
          onClose={() => setShowDealerNumbers(false)}
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

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function AbroadActivityModal({ activity, onClose, onSave, selectedDay }) {
  const defaultProjectNumbers = ['832', '17', '441', '1'];
  
  const [projectNumbers, setProjectNumbers] = useState(defaultProjectNumbers);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState('');
  const [editingList, setEditingList] = useState(null);
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [editingProjectValue, setEditingProjectValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState({
    projectNumber: false
  });
  
  const [formData, setFormData] = useState({
    id: activity?.id || Date.now(),
    activityType: 'abroad',
    taskName: activity?.taskName || '',
    projectNumber: activity?.projectNumber || '',
    landingManager: activity?.landingManager || '',
    pilotInside: activity?.pilotInside || '',
    pilotOutside: activity?.pilotOutside || '',
    technician: activity?.technician || '',
    projectManager: activity?.projectManager || ''
  });

  // Track selected days (only for new activities)
  const [selectedDays, setSelectedDays] = useState(activity ? [] : [selectedDay]);
  
  // Load field lists from Firebase on component mount
  useEffect(() => {
    const loadFieldLists = async () => {
      try {
        const docRef = doc(db, 'settings', 'activityFieldLists');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.projectNumbers) setProjectNumbers(data.projectNumbers);
        }
      } catch (error) {
        console.error('Error loading field lists:', error);
      }
    };
    loadFieldLists();
  }, []);

  // Save field lists to Firebase whenever they change
  useEffect(() => {
    const saveFieldLists = async () => {
      try {
        const docRef = doc(db, 'settings', 'activityFieldLists');
        const docSnap = await getDoc(docRef);
        const existingData = docSnap.exists() ? docSnap.data() : {};
        await setDoc(docRef, {
          ...existingData,
          projectNumbers
        });
      } catch (error) {
        console.error('Error saving field lists:', error);
      }
    };
    const timer = setTimeout(() => {
      saveFieldLists();
    }, 500);
    return () => clearTimeout(timer);
  }, [projectNumbers]);
  
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-open suggestions when typing in autocomplete fields
    if (name === 'projectNumber') {
      setShowSuggestions({ projectNumber: true });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const getFilteredSuggestions = (list) => {
    const value = formData.projectNumber || '';
    if (!value) return list;
    return list.filter(item => item.toLowerCase().includes(value.toLowerCase()));
  };
  
  const handleSuggestionClick = (value) => {
    setFormData(prev => ({ ...prev, projectNumber: value }));
    setShowSuggestions({ projectNumber: false });
  };
  
  const toggleSuggestions = () => {
    setShowSuggestions(prev => ({ projectNumber: !prev.projectNumber }));
  };
  
  const handleAddProject = () => {
    if (newProject.trim() && !projectNumbers.includes(newProject.trim())) {
      setProjectNumbers([...projectNumbers, newProject.trim()]);
      setFormData(prev => ({ ...prev, projectNumber: newProject.trim() }));
      setNewProject('');
      setShowAddProject(false);
    }
  };
  
  const handleDeleteFromList = (item) => {
    setProjectNumbers(projectNumbers.filter(p => p !== item));
  };

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.taskName.trim()) {
      alert('נא למלא משימה');
      return;
    }
    if (!formData.projectNumber.trim()) {
      alert('נא למלא פרויקט');
      return;
    }
    if (!activity && selectedDays.length === 0) {
      alert('נא לבחור לפחות יום אחד');
      return;
    }
    onSave(formData, selectedDays);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ color: '#10b981', marginBottom: '20px' }}>
          {activity ? 'עדכן' : 'הוסף'} פעילות חו"ל
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>משימה: *</label>
            <input
              type="text"
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              placeholder="הזן משימה"
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '2px solid #10b981'
              }}
            />
          </div>

          <div className="form-group">
            <label>פרויקט: *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="text"
                    name="projectNumber"
                    value={formData.projectNumber}
                    onChange={handleChange}
                    placeholder="הקלד או בחר פרויקט"
                    required
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: '2px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={toggleSuggestions}
                    style={{
                      padding: '10px 15px',
                      background: showSuggestions.projectNumber ? '#dc3545' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {showSuggestions.projectNumber ? '✕' : '▼'}
                  </button>
                </div>
                {showSuggestions.projectNumber && getFilteredSuggestions(projectNumbers).length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    marginTop: '5px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {getFilteredSuggestions(projectNumbers).map(p => (
                      <div
                        key={p}
                        onClick={() => handleSuggestionClick(p)}
                        style={{
                          padding: '10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowAddProject(!showAddProject)}
                style={{
                  padding: '10px 15px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setEditingList(editingList === 'projectNumbers' ? null : 'projectNumbers')}
                style={{
                  padding: '10px 15px',
                  background: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ערוך
              </button>
            </div>
            {showAddProject && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="פרויקט חדש"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  style={{
                    padding: '10px 15px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  הוסף
                </button>
              </div>
            )}
            {editingList === 'projectNumbers' && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px' }}>ערוך פרויקט</h4>
                {projectNumbers.map((proj, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', gap: '10px' }}>
                    {editingProjectIndex === index ? (
                      <input
                        type="text"
                        value={editingProjectValue}
                        onChange={(e) => setEditingProjectValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '5px'
                        }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ flex: 1 }}>{proj}</span>
                    )}
                    {editingProjectIndex === index ? (
                      <button
                        type="button"
                        onClick={() => {
                          const newProjects = [...projectNumbers];
                          newProjects[index] = editingProjectValue;
                          setProjectNumbers(newProjects);
                          setEditingProjectIndex(null);
                          setEditingProjectValue('');
                        }}
                        style={{
                          padding: '5px 10px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        שמור
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProjectIndex(index);
                          setEditingProjectValue(proj);
                        }}
                        style={{
                          padding: '5px 10px',
                          background: '#ffc107',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        ערוך
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteFromList(proj)}
                      style={{
                        padding: '5px 10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      מחק
                    </button>
                  </div>
                ))}
              </div>
            )}
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

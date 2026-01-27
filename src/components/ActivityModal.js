import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function ActivityModal({ day, activity, onSave, onClose }) {
  const defaultPlatforms = ['אירוסטאר', 'אורביטר 3', 'אורביטר 4', 'אורביטר 5', 'עננס'];
  const defaultDistributions = [
    'DIS-AEROSTAR-Daily Report',
    'DIS-Orbiter 4-Daily Report',
    'DIS-Orbiter 3-Daily Report',
    'DIS-Orbiter 5-Daily Report'
  ];
  const defaultProjectNumbers = ['832', '17', '441', '1'];
  const defaultWorkSites = ['יבנה', 'גבולות', 'קציעות', 'רמת דוד', 'כוכב', 'שבטה'];
  const defaultVehicles = ['דימקס', 'יאריס'];

  const [platforms, setPlatforms] = useState(defaultPlatforms);
  const [distributions, setDistributions] = useState(defaultDistributions);
  const [projectNumbers, setProjectNumbers] = useState(defaultProjectNumbers);
  const [workSites, setWorkSites] = useState(defaultWorkSites);
  const [vehicles, setVehicles] = useState(defaultVehicles);
  
  // Load field lists from Firebase on component mount
  useEffect(() => {
    const loadFieldLists = async () => {
      try {
        const docRef = doc(db, 'settings', 'activityFieldLists');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.platforms) setPlatforms(data.platforms);
          if (data.distributions) setDistributions(data.distributions);
          if (data.projectNumbers) setProjectNumbers(data.projectNumbers);
          if (data.workSites) setWorkSites(data.workSites);
          if (data.vehicles) setVehicles(data.vehicles);
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
        await setDoc(doc(db, 'settings', 'activityFieldLists'), {
          platforms,
          distributions,
          projectNumbers,
          workSites,
          vehicles
        });
      } catch (error) {
        console.error('Error saving field lists:', error);
      }
    };
    // Only save if lists have been loaded (avoid saving defaults immediately)
    const timer = setTimeout(() => {
      saveFieldLists();
    }, 500);
    return () => clearTimeout(timer);
  }, [platforms, distributions, projectNumbers, workSites, vehicles]);

  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [showAddDistribution, setShowAddDistribution] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddWorkSite, setShowAddWorkSite] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  
  const [newPlatform, setNewPlatform] = useState('');
  const [newDistribution, setNewDistribution] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newWorkSite, setNewWorkSite] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  
  const [editingList, setEditingList] = useState(null); // 'platforms', 'distributions', etc.
  const [vehicleAssignments, setVehicleAssignments] = useState([]);

  const [formData, setFormData] = useState({
    platform: '',
    type: 'אווירי',
    taskName: '',
    projectName: '',
    startTime: '09:00',
    endTime: '18:00',
    manager: '',
    // Replaced teamMembers with 4 crew role fields
    pilotInside: '', // מטיס פנים
    pilotOutside: '', // מטיס חוץ
    landingManager: '', // אחראי מנחת
    technician: '', // טכנאי
    additional: '',
    poc: '',
    workSite: '',
    projectNumber: '',
    vehiclesList: [], // Changed to array for multiple vehicles
    distribution: '',
    additionalFactorsOnSite: '', // NEW: גורמים נוספים באתר
    notes: '',
    heilan: 'שטח', // NEW: חילן field - default שטח
    // Daily plan extra fields - NEW STRUCTURE
    estimatedTakeoffTime: '',
    additionalDistribution: '',
    tailNumber: '',
    yaslatNumber: '',
    launcher: '',
    matad: '',
    engine: '', // NEW: מנוע
    serialNumber: '', // NEW: מספר סחרן
    relevantFrequencies: '',
    vehicleAssignments: []
  });

  useEffect(() => {
    if (activity) {
      // Convert vehiclesList to array if needed and handle backward compatibility
      const updatedActivity = {
        ...activity,
        vehiclesList: Array.isArray(activity.vehiclesList)
          ? activity.vehiclesList
          : activity.vehiclesList ? activity.vehiclesList.split(',').map(v => v.trim()).filter(v => v) : [],
        vehicleAssignments: activity.vehicleAssignments || [],
        // Ensure new fields exist with defaults
        pilotInside: activity.pilotInside || '',
        pilotOutside: activity.pilotOutside || '',
        landingManager: activity.landingManager || '',
        technician: activity.technician || '',
        additionalFactorsOnSite: activity.additionalFactorsOnSite || '',
        engine: activity.engine || '',
        serialNumber: activity.serialNumber || '',
        projectName: activity.projectName || ''
      };
      setFormData(updatedActivity);
      setVehicleAssignments(activity.vehicleAssignments || []);
    }
  }, [activity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updates = { [name]: value };
    
    // Auto-select heilan based on type
    if (name === 'type') {
      if (value === 'אווירי') {
        updates.heilan = 'שטח';
      } else if (value === 'קרקעי') {
        updates.heilan = 'משרד';
      }
    }
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleAddPlatform = () => {
    if (newPlatform.trim() && !platforms.includes(newPlatform.trim())) {
      setPlatforms([...platforms, newPlatform.trim()]);
      setFormData(prev => ({ ...prev, platform: newPlatform.trim() }));
      setNewPlatform('');
      setShowAddPlatform(false);
    }
  };

  const handleAddDistribution = () => {
    if (newDistribution.trim() && !distributions.includes(newDistribution.trim())) {
      setDistributions([...distributions, newDistribution.trim()]);
      setFormData(prev => ({ ...prev, distribution: newDistribution.trim() }));
      setNewDistribution('');
      setShowAddDistribution(false);
    }
  };

  const handleAddProject = () => {
    if (newProject.trim() && !projectNumbers.includes(newProject.trim())) {
      setProjectNumbers([...projectNumbers, newProject.trim()]);
      setFormData(prev => ({ ...prev, projectNumber: newProject.trim() }));
      setNewProject('');
      setShowAddProject(false);
    }
  };

  const handleAddWorkSite = () => {
    if (newWorkSite.trim() && !workSites.includes(newWorkSite.trim())) {
      setWorkSites([...workSites, newWorkSite.trim()]);
      setFormData(prev => ({ ...prev, workSite: newWorkSite.trim() }));
      setNewWorkSite('');
      setShowAddWorkSite(false);
    }
  };

  const handleAddVehicle = () => {
    if (newVehicle.trim() && !vehicles.includes(newVehicle.trim())) {
      setVehicles([...vehicles, newVehicle.trim()]);
      setNewVehicle('');
      setShowAddVehicle(false);
    }
  };

  const handleDeleteFromList = (listName, item) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק "${item}"?`)) {
      switch(listName) {
        case 'platforms':
          setPlatforms(platforms.filter(p => p !== item));
          break;
        case 'distributions':
          setDistributions(distributions.filter(d => d !== item));
          break;
        case 'projectNumbers':
          setProjectNumbers(projectNumbers.filter(p => p !== item));
          break;
        case 'workSites':
          setWorkSites(workSites.filter(w => w !== item));
          break;
        case 'vehicles':
          setVehicles(vehicles.filter(v => v !== item));
          break;
        default:
          break;
      }
    }
  };

  const handleAddVehicleAssignment = () => {
    setVehicleAssignments([...vehicleAssignments, {
      vehicle: '',
      passengersOutbound: [],  // הלוך
      passengersReturn: []      // חזור
    }]);
  };

  const handleRemoveVehicleAssignment = (index) => {
    setVehicleAssignments(vehicleAssignments.filter((_, i) => i !== index));
  };

  const handleVehicleAssignmentChange = (index, field, value) => {
    const updated = [...vehicleAssignments];
    updated[index][field] = value;
    setVehicleAssignments(updated);
  };

  const handlePassengerToggle = (assignmentIndex, direction, passenger) => {
    const updated = [...vehicleAssignments];
    const passengersKey = direction === 'outbound' ? 'passengersOutbound' : 'passengersReturn';
    const passengers = updated[assignmentIndex][passengersKey];
    
    if (passengers.includes(passenger)) {
      updated[assignmentIndex][passengersKey] = passengers.filter(p => p !== passenger);
    } else {
      if (passengers.length < 5) {
        updated[assignmentIndex][passengersKey] = [...passengers, passenger];
      } else {
        alert('ניתן לשבץ עד 5 נוסעים ברכב');
      }
    }
    setVehicleAssignments(updated);
  };

  const handleCopyOutboundToReturn = (assignmentIndex) => {
    const updated = [...vehicleAssignments];
    updated[assignmentIndex].passengersReturn = [...updated[assignmentIndex].passengersOutbound];
    setVehicleAssignments(updated);
  };

  const handleVehicleToggle = (vehicle) => {
    const currentVehicles = formData.vehiclesList;
    if (currentVehicles.includes(vehicle)) {
      // Remove vehicle and its assignments
      setFormData(prev => ({
        ...prev,
        vehiclesList: currentVehicles.filter(v => v !== vehicle)
      }));
      // Remove any vehicle assignments for this vehicle
      setVehicleAssignments(vehicleAssignments.filter(va => va.vehicle !== vehicle));
    } else {
      setFormData(prev => ({
        ...prev,
        vehiclesList: [...currentVehicles, vehicle]
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.platform || !formData.taskName || !formData.manager || !formData.workSite || !formData.projectNumber) {
      alert('אנא מלא את כל השדות הנדרשים');
      return;
    }
    onSave({ ...formData, vehicleAssignments });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{activity ? 'ערוך פעילות' : 'הוסף פעילות חדשה'} - {day}</h3>
          <button className="close-btn" onClick={onClose}>סגור</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>פלטפורמה *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
              >
                <option value="">בחר פלטפורמה</option>
                {platforms.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddPlatform(!showAddPlatform)}
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
                onClick={() => setEditingList(editingList === 'platforms' ? null : 'platforms')}
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
            {showAddPlatform && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  placeholder="שם פלטפורמה חדשה"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddPlatform}
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
            {editingList === 'platforms' && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px' }}>ערוך פלטפורמות</h4>
                {platforms.map(platform => (
                  <div key={platform} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                    <span>{platform}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFromList('platforms', platform)}
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

          <div className="form-group">
            <label>סוג *</label>
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="אווירי">אווירי</option>
              <option value="קרקעי">קרקעי</option>
            </select>
          </div>

          <div className="form-group">
            <label>חילן *</label>
            <select name="heilan" value={formData.heilan} onChange={handleChange} required>
              <option value="">בחר חילן</option>
              <option value="משרד">משרד</option>
              <option value="שטח">שטח</option>
            </select>
          </div>

          <div className="form-group">
            <label>שם המשימה *</label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              required
              placeholder="הזן שם משימה"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>שעת התחלה</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                step="60"
              />
            </div>

            <div className="form-group">
              <label>שעת סיום</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                step="60"
              />
            </div>
          </div>

          <div className="form-group">
            <label>מנהל *</label>
            <input
              type="text"
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              required
              placeholder="שם המנהל"
            />
          </div>

          <div className="form-group">
            <label>מטיס פנים</label>
            <input
              type="text"
              name="pilotInside"
              value={formData.pilotInside}
              onChange={handleChange}
              placeholder="הזן שמות מטיסי פנים (אם יש יותר מאחד, הפרד בפסיק)"
            />
          </div>

          <div className="form-group">
            <label>מטיס חוץ</label>
            <input
              type="text"
              name="pilotOutside"
              value={formData.pilotOutside}
              onChange={handleChange}
              placeholder="הזן שמות מטיסי חוץ (אם יש יותר מאחד, הפרד בפסיק)"
            />
          </div>

          <div className="form-group">
            <label>אחראי מנחת</label>
            <input
              type="text"
              name="landingManager"
              value={formData.landingManager}
              onChange={handleChange}
              placeholder="הזן שמות אחראי מנחת (אם יש יותר מאחד, הפרד בפסיק)"
            />
          </div>

          <div className="form-group">
            <label>טכנאי</label>
            <input
              type="text"
              name="technician"
              value={formData.technician}
              onChange={handleChange}
              placeholder="הזן שמות טכנאים (אם יש יותר מאחד, הפרד בפסיק)"
            />
          </div>

          <div className="form-group">
            <label>נוספים</label>
            <input
              type="text"
              name="additional"
              value={formData.additional}
              onChange={handleChange}
              placeholder="אנשים נוספים"
            />
          </div>

          <div className="form-group">
            <label>POC</label>
            <input
              type="text"
              name="poc"
              value={formData.poc}
              onChange={handleChange}
              placeholder="איש קשר"
            />
          </div>

          <div className="form-group">
            <label>אתר עבודה</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                name="workSite"
                value={formData.workSite}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                <option value="">בחר אתר עבודה</option>
                {workSites.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddWorkSite(!showAddWorkSite)}
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
                onClick={() => setEditingList(editingList === 'workSites' ? null : 'workSites')}
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
            {showAddWorkSite && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  value={newWorkSite}
                  onChange={(e) => setNewWorkSite(e.target.value)}
                  placeholder="אתר עבודה חדש"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddWorkSite}
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
            {editingList === 'workSites' && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px' }}>ערוך אתרי עבודה</h4>
                {workSites.map(site => (
                  <div key={site} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                    <span>{site}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFromList('workSites', site)}
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

          <div className="form-group">
            <label>מס' פרויקט</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                name="projectNumber"
                value={formData.projectNumber}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                <option value="">בחר מספר פרויקט</option>
                {projectNumbers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
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
                  placeholder="מספר פרויקט חדש"
                  style={{ flex: 1 }}
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
                <h4 style={{ marginBottom: '10px' }}>ערוך מספרי פרויקט</h4>
                {projectNumbers.map(proj => (
                  <div key={proj} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                    <span>{proj}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFromList('projectNumbers', proj)}
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

          <div className="form-group">
            <label>שם פרויקט</label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="שם הפרויקט"
            />
          </div>

          <div className="form-group">
            <label>רכבים (בחר אחד או יותר)</label>
            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowAddVehicle(!showAddVehicle)}
                style={{
                  padding: '10px 15px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                + הוסף רכב חדש
              </button>
              <button
                type="button"
                onClick={() => setEditingList(editingList === 'vehicles' ? null : 'vehicles')}
                style={{
                  padding: '10px 15px',
                  background: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ערוך רשימת רכבים
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {vehicles.map(vehicle => (
                <button
                  key={vehicle}
                  type="button"
                  onClick={() => handleVehicleToggle(vehicle)}
                  style={{
                    padding: '8px 16px',
                    background: formData.vehiclesList.includes(vehicle) ? '#667eea' : '#e0e0e0',
                    color: formData.vehiclesList.includes(vehicle) ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}
                >
                  {vehicle} {formData.vehiclesList.includes(vehicle) ? '✓' : ''}
                </button>
              ))}
            </div>
            {formData.vehiclesList.length > 0 && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#e7f3ff', borderRadius: '8px' }}>
                <strong>רכבים נבחרים:</strong> {formData.vehiclesList.join(', ')}
              </div>
            )}
            {showAddVehicle && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  value={newVehicle}
                  onChange={(e) => setNewVehicle(e.target.value)}
                  placeholder="רכב חדש"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddVehicle}
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
            {editingList === 'vehicles' && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px' }}>ערוך רכבים</h4>
                {vehicles.map(vehicle => (
                  <div key={vehicle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                    <span>{vehicle}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFromList('vehicles', vehicle)}
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

          <div className="form-group">
            <label>תפוצה</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                name="distribution"
                value={formData.distribution}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                <option value="">בחר רשימת תפוצה</option>
                {distributions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddDistribution(!showAddDistribution)}
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
                onClick={() => setEditingList(editingList === 'distributions' ? null : 'distributions')}
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
            {showAddDistribution && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  value={newDistribution}
                  onChange={(e) => setNewDistribution(e.target.value)}
                  placeholder="רשימת תפוצה חדשה"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddDistribution}
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
            {editingList === 'distributions' && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px' }}>ערוך רשימות תפוצה</h4>
                {distributions.map(dist => (
                  <div key={dist} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                    <span>{dist}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFromList('distributions', dist)}
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

          <div className="form-group">
            <label>גורמים נוספים באתר</label>
            <textarea
              name="additionalFactorsOnSite"
              value={formData.additionalFactorsOnSite}
              onChange={handleChange}
              placeholder="גורמים נוספים באתר"
            />
          </div>

          <div className="form-group">
            <label>הערות</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="הערות נוספות"
            />
          </div>

          {/* NEW Extra fields for daily plan */}
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            background: '#f0f8ff', 
            borderRadius: '8px',
            border: '2px solid #667eea'
          }}>
            <h4 style={{ marginBottom: '15px', color: '#667eea' }}>פרטים נוספים (תכנית יומית)</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {formData.type === 'אווירי' && (
                <div className="form-group">
                  <label>זמן המראה משוער</label>
                  <input
                    type="time"
                    name="estimatedTakeoffTime"
                    value={formData.estimatedTakeoffTime}
                    onChange={handleChange}
                    placeholder="זמן המראה"
                    step="60"
                  />
                </div>
              )}

              <div className="form-group">
                <label>נוספים לתפוצה</label>
                <input
                  type="text"
                  name="additionalDistribution"
                  value={formData.additionalDistribution}
                  onChange={handleChange}
                  placeholder="נוספים לתפוצה"
                />
              </div>

              <div className="form-group">
                <label>מספר זנב</label>
                <input
                  type="text"
                  name="tailNumber"
                  value={formData.tailNumber}
                  onChange={handleChange}
                  placeholder="מספר זנב"
                />
              </div>

              <div className="form-group">
                <label>מספר ישל"ט</label>
                <input
                  type="text"
                  name="yaslatNumber"
                  value={formData.yaslatNumber}
                  onChange={handleChange}
                  placeholder='מספר ישל"ט'
                />
              </div>

              <div className="form-group">
                <label>משגר</label>
                <input
                  type="text"
                  name="launcher"
                  value={formData.launcher}
                  onChange={handleChange}
                  placeholder="משגר"
                />
              </div>

              <div className="form-group">
                <label>מטע"ד</label>
                <input
                  type="text"
                  name="matad"
                  value={formData.matad}
                  onChange={handleChange}
                  placeholder='מטע"ד'
                />
              </div>

              <div className="form-group">
                <label>מנוע</label>
                <input
                  type="text"
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                  placeholder="מנוע"
                />
              </div>

              <div className="form-group">
                <label>מספר סחרן / קבע</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="4X-XXX"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>תדרים רלוונטיים</label>
                <input
                  type="text"
                  name="relevantFrequencies"
                  value={formData.relevantFrequencies}
                  onChange={handleChange}
                  placeholder="תדרים רלוונטיים"
                />
              </div>
            </div>

            {/* Vehicle Assignments Section */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#667eea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                שיבוץ רכבים
                <button
                  type="button"
                  onClick={handleAddVehicleAssignment}
                  disabled={formData.vehiclesList.length === 0}
                  style={{
                    padding: '8px 15px',
                    background: formData.vehiclesList.length === 0 ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: formData.vehiclesList.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                  title={formData.vehiclesList.length === 0 ? 'בחר רכבים קודם' : ''}
                >
                  + הוסף רכב
                </button>
              </h4>

              {formData.vehiclesList.length === 0 && (
                <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '8px', marginBottom: '15px', color: '#856404' }}>
                  ⚠️ בחר רכבים מהרשימה למעלה לפני שיבוץ נוסעים
                </div>
              )}

              {vehicleAssignments.map((assignment, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '15px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  border: '2px solid #667eea'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h5 style={{ color: '#667eea' }}>שיבוץ רכב {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => handleRemoveVehicleAssignment(index)}
                      style={{
                        padding: '5px 10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      הסר
                    </button>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>בחר רכב:</label>
                    <select
                      value={assignment.vehicle}
                      onChange={(e) => handleVehicleAssignmentChange(index, 'vehicle', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                    >
                      <option value="">בחר רכב</option>
                      {formData.vehiclesList.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {assignment.vehicle && (
                    <>
                      {/* Outbound Passengers */}
                      <div style={{ marginBottom: '15px', padding: '12px', background: '#e7f3ff', borderRadius: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#0066cc' }}>
                          🚗 הלוך (עד 5 נוסעים):
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {/* Collect all crew members from the 4 role fields */}
                          {[
                            ...(formData.pilotInside ? formData.pilotInside.split(',').map(m => m.trim()).filter(m => m) : []),
                            ...(formData.pilotOutside ? formData.pilotOutside.split(',').map(m => m.trim()).filter(m => m) : []),
                            ...(formData.landingManager ? formData.landingManager.split(',').map(m => m.trim()).filter(m => m) : []),
                            ...(formData.technician ? formData.technician.split(',').map(m => m.trim()).filter(m => m) : [])
                          ].map((member, memberIndex) => (
                            <button
                              key={memberIndex}
                              type="button"
                              onClick={() => handlePassengerToggle(index, 'outbound', member)}
                              style={{
                                padding: '8px 14px',
                                background: assignment.passengersOutbound.includes(member) ? '#0066cc' : '#fff',
                                color: assignment.passengersOutbound.includes(member) ? 'white' : '#333',
                                border: '2px solid #0066cc',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                transition: 'all 0.3s',
                                fontWeight: assignment.passengersOutbound.includes(member) ? 'bold' : 'normal'
                              }}
                            >
                              {member} {assignment.passengersOutbound.includes(member) ? '✓' : ''}
                            </button>
                          ))}
                        </div>
                        <small style={{ display: 'block', marginTop: '8px', color: '#0066cc', fontWeight: 'bold' }}>
                          נבחרו: {assignment.passengersOutbound.length}/5
                        </small>
                      </div>

                      {/* Return Passengers */}
                      <div style={{ marginBottom: '10px', padding: '12px', background: '#fff3e0', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff9800' }}>
                            🔄 חזור (עד 5 נוסעים):
                          </label>
                          <button
                            type="button"
                            onClick={() => handleCopyOutboundToReturn(index)}
                            style={{
                              padding: '5px 12px',
                              background: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            📋 העתק מהלוך
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {/* Collect all crew members from the 4 role fields */}
                          {[
                            ...(formData.pilotInside ? formData.pilotInside.split(',').map(m => m.trim()).filter(m => m) : []),
                            ...(formData.pilotOutside ? formData.pilotOutside.split(',').map(m => m.trim()).filter(m => m) : []),
                            ...(formData.landingManager ? formData.landingManager.split(',').map(m => m.trim()).filter(m => m) : []),
                            ...(formData.technician ? formData.technician.split(',').map(m => m.trim()).filter(m => m) : [])
                          ].map((member, memberIndex) => (
                            <button
                              key={memberIndex}
                              type="button"
                              onClick={() => handlePassengerToggle(index, 'return', member)}
                              style={{
                                padding: '8px 14px',
                                background: assignment.passengersReturn.includes(member) ? '#ff9800' : '#fff',
                                color: assignment.passengersReturn.includes(member) ? 'white' : '#333',
                                border: '2px solid #ff9800',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                transition: 'all 0.3s',
                                fontWeight: assignment.passengersReturn.includes(member) ? 'bold' : 'normal'
                              }}
                            >
                              {member} {assignment.passengersReturn.includes(member) ? '✓' : ''}
                            </button>
                          ))}
                        </div>
                        <small style={{ display: 'block', marginTop: '8px', color: '#ff9800', fontWeight: 'bold' }}>
                          נבחרו: {assignment.passengersReturn.length}/5
                        </small>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {vehicleAssignments.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  לא נוספו רכבים. לחץ על "הוסף רכב" כדי להתחיל
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {activity ? 'עדכן' : 'הוסף'} פעילות
          </button>
        </form>
      </div>
    </div>
  );
}

export default ActivityModal;

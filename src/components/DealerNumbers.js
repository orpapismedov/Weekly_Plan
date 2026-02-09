import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function DealerNumbers({ onClose, isManager }) {
  const [dealerNumbers, setDealerNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ dealerNumber: '', tailNumber: '', platform: '' });

  useEffect(() => {
    fetchDealerNumbers();
  }, []);

  const fetchDealerNumbers = async () => {
    try {
      const docRef = doc(db, 'settings', 'dealerNumbers');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setDealerNumbers(docSnap.data().items || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dealer numbers:', error);
      setLoading(false);
    }
  };

  const saveDealerNumbers = async (newData) => {
    try {
      await setDoc(doc(db, 'settings', 'dealerNumbers'), {
        items: newData,
        updatedAt: new Date().toISOString()
      });
      setDealerNumbers(newData);
    } catch (error) {
      console.error('Error saving dealer numbers:', error);
      alert('שגיאה בשמירת הנתונים');
    }
  };

  const handleAdd = () => {
    if (editData.dealerNumber.trim() && editData.tailNumber.trim() && editData.platform.trim()) {
      const newItem = {
        ...editData,
        id: Date.now()
      };
      saveDealerNumbers([...dealerNumbers, newItem]);
      setEditData({ dealerNumber: '', tailNumber: '', platform: '' });
    } else {
      alert('נא למלא את כל השדות');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditData({
      dealerNumber: item.dealerNumber,
      tailNumber: item.tailNumber,
      platform: item.platform
    });
  };

  const handleSaveEdit = () => {
    if (editData.dealerNumber.trim() && editData.tailNumber.trim() && editData.platform.trim()) {
      const updated = dealerNumbers.map(item =>
        item.id === editingId ? { ...editData, id: editingId } : item
      );
      saveDealerNumbers(updated);
      setEditingId(null);
      setEditData({ dealerNumber: '', tailNumber: '', platform: '' });
    } else {
      alert('נא למלא את כל השדות');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ dealerNumber: '', tailNumber: '', platform: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק שורה זו?')) {
      saveDealerNumbers(dealerNumbers.filter(item => item.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
          <p>טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#667eea', marginBottom: '30px' }}>טבלת מספרי סחרן</h2>

        {/* Add New Row Form - Manager Only */}
        {isManager && !editingId && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>הוסף שורה חדשה</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>פלטפורמה:</label>
                <input
                  type="text"
                  value={editData.platform}
                  onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
                  placeholder="פלטפורמה"
                  style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>מספר זנב:</label>
                <input
                  type="text"
                  value={editData.tailNumber}
                  onChange={(e) => setEditData({ ...editData, tailNumber: e.target.value })}
                  placeholder="מספר זנב"
                  style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>מספר סחרן:</label>
                <input
                  type="text"
                  value={editData.dealerNumber}
                  onChange={(e) => setEditData({ ...editData, dealerNumber: e.target.value })}
                  placeholder="מספר סחרן"
                  style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                />
              </div>
              <button
                onClick={handleAdd}
                style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}
              >
                + הוסף
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#667eea', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>פלטפורמה</th>
              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>מספר זנב</th>
              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>מספר סחרן</th>
              {isManager && <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', width: '150px' }}>פעולות</th>}
            </tr>
          </thead>
          <tbody>
            {dealerNumbers.length === 0 ? (
              <tr>
                <td colSpan={isManager ? 4 : 3} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  אין נתונים
                </td>
              </tr>
            ) : (
              dealerNumbers.map(item => (
                <tr key={item.id}>
                  {editingId === item.id ? (
                    <>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <input
                          type="text"
                          value={editData.platform}
                          onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
                          style={{ width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px' }}
                        />
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <input
                          type="text"
                          value={editData.tailNumber}
                          onChange={(e) => setEditData({ ...editData, tailNumber: e.target.value })}
                          style={{ width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px' }}
                        />
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <input
                          type="text"
                          value={editData.dealerNumber}
                          onChange={(e) => setEditData({ ...editData, dealerNumber: e.target.value })}
                          style={{ width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px' }}
                        />
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <button
                          onClick={handleSaveEdit}
                          style={{ padding: '5px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginLeft: '5px' }}
                        >
                          שמור
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{ padding: '5px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ביטול
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.platform}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.tailNumber}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.dealerNumber}</td>
                      {isManager && (
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEdit(item)}
                            style={{ padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginLeft: '5px' }}
                          >
                            ערוך
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            מחק
                          </button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button
          onClick={onClose}
          style={{ marginTop: '20px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          סגור
        </button>
      </div>
    </div>
  );
}

export default DealerNumbers;

import React, { useState } from 'react';

function Suppliers({ isManager, onClose, suppliers, setSuppliers }) {
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    area: ''
  });

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (newSupplier.name.trim() && newSupplier.phone.trim() && newSupplier.area.trim()) {
      setSuppliers([...suppliers, { ...newSupplier, id: Date.now() }]);
      setNewSupplier({ name: '', phone: '', area: '' });
    }
  };

  const handleDeleteSupplier = (id) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <h2 style={{ color: '#667eea', marginBottom: '20px' }}>ספקים</h2>

        {isManager && (
          <form onSubmit={handleAddSupplier} style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>הוסף ספק חדש</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ספק:</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="שם הספק"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>טלפון:</label>
                <input
                  type="text"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="מספר טלפון"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>אזור:</label>
                <input
                  type="text"
                  value={newSupplier.area}
                  onChange={(e) => setNewSupplier({ ...newSupplier, area: e.target.value })}
                  placeholder="אזור"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              + הוסף ספק
            </button>
          </form>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white'
          }}>
            <thead>
              <tr style={{ background: '#667eea', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>ספק</th>
                <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>טלפון</th>
                <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>אזור</th>
                {isManager && <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>פעולות</th>}
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 4 : 3} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    אין ספקים במערכת
                  </td>
                </tr>
              ) : (
                suppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{supplier.name}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{supplier.phone}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{supplier.area}</td>
                    {isManager && (
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          מחק
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            background: '#6c757d',
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
  );
}

export default Suppliers;

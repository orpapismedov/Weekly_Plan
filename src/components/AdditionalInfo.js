import React, { useState } from 'react';

function AdditionalInfo({ isManager, onClose, data, setData }) {
  // Local state for form inputs only
  const [newPlatform, setNewPlatform] = useState({ platform: '', caaValidity: '' });
  const [newWorkSite, setNewWorkSite] = useState({ site: '', deploymentLink: '', siteFolder: '' });
  const [newPhone, setNewPhone] = useState({ area: '', name: '', phone: '' });

  const handleAddPlatform = (e) => {
    e.preventDefault();
    if (newPlatform.platform.trim() && newPlatform.caaValidity.trim()) {
      setData({
        ...data,
        platforms: [...data.platforms, { ...newPlatform, id: Date.now() }]
      });
      setNewPlatform({ platform: '', caaValidity: '' });
    }
  };

  const handleAddWorkSite = (e) => {
    e.preventDefault();
    if (newWorkSite.site.trim()) {
      setData({
        ...data,
        workSites: [...data.workSites, { ...newWorkSite, id: Date.now() }]
      });
      setNewWorkSite({ site: '', deploymentLink: '', siteFolder: '' });
    }
  };

  const handleAddPhone = (e) => {
    e.preventDefault();
    if (newPhone.area.trim() && newPhone.name.trim() && newPhone.phone.trim()) {
      setData({
        ...data,
        phoneNumbers: [...data.phoneNumbers, { ...newPhone, id: Date.now() }]
      });
      setNewPhone({ area: '', name: '', phone: '' });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#667eea', marginBottom: '30px' }}>מידע נוסף</h2>

        {/* Table 1: Platforms */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>פלטפורמות ותוקף תעודות</h3>
          
          {isManager && (
            <form onSubmit={handleAddPlatform} style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>פלטפורמה:</label>
                  <input
                    type="text"
                    value={newPlatform.platform}
                    onChange={(e) => setNewPlatform({ ...newPlatform, platform: e.target.value })}
                    placeholder="שם הפלטפורמה"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>תוקף תעודת רת"א:</label>
                  <input
                    type="text"
                    value={newPlatform.caaValidity}
                    onChange={(e) => setNewPlatform({ ...newPlatform, caaValidity: e.target.value })}
                    placeholder='לדוגמה: 31/12/2026'
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
                <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>
                  + הוסף
                </button>
              </div>
            </form>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#667eea', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>פלטפורמה</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>תוקף תעודת רת"א</th>
                {isManager && <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', width: '100px' }}>פעולות</th>}
              </tr>
            </thead>
            <tbody>
              {data.platforms.length === 0 ? (
                <tr><td colSpan={isManager ? 3 : 2} style={{ padding: '15px', textAlign: 'center', color: '#999' }}>אין נתונים</td></tr>
              ) : (
                data.platforms.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.platform}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.caaValidity}</td>
                    {isManager && (
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <button onClick={() => setData({ ...data, platforms: data.platforms.filter(item => item.id !== p.id) })} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>מחק</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table 2: Work Sites */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>אתרי עבודה בארץ</h3>
          
          {isManager && (
            <form onSubmit={handleAddWorkSite} style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>אתר עבודה:</label>
                  <input
                    type="text"
                    value={newWorkSite.site}
                    onChange={(e) => setNewWorkSite({ ...newWorkSite, site: e.target.value })}
                    placeholder="שם האתר"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>קישור לנק' פריסה:</label>
                  <input
                    type="url"
                    value={newWorkSite.deploymentLink}
                    onChange={(e) => setNewWorkSite({ ...newWorkSite, deploymentLink: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>תיק אתר:</label>
                  <input
                    type="url"
                    value={newWorkSite.siteFolder}
                    onChange={(e) => setNewWorkSite({ ...newWorkSite, siteFolder: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
                <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>
                  + הוסף
                </button>
              </div>
            </form>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#667eea', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>אתר עבודה</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>קישור לנק' פריסה</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>תיק אתר</th>
                {isManager && <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', width: '100px' }}>פעולות</th>}
              </tr>
            </thead>
            <tbody>
              {data.workSites.length === 0 ? (
                <tr><td colSpan={isManager ? 4 : 3} style={{ padding: '15px', textAlign: 'center', color: '#999' }}>אין נתונים</td></tr>
              ) : (
                data.workSites.map(ws => (
                  <tr key={ws.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{ws.site}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {ws.deploymentLink ? <a href={ws.deploymentLink} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>פתח קישור</a> : '-'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {ws.siteFolder ? <a href={ws.siteFolder} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>פתח תיק</a> : '-'}
                    </td>
                    {isManager && (
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <button onClick={() => setData({ ...data, workSites: data.workSites.filter(item => item.id !== ws.id) })} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>מחק</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table 3: Phone Numbers */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>מספרי טלפון שימושיים</h3>
          
          {isManager && (
            <form onSubmit={handleAddPhone} style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>אזור:</label>
                  <input
                    type="text"
                    value={newPhone.area}
                    onChange={(e) => setNewPhone({ ...newPhone, area: e.target.value })}
                    placeholder="שם האזור"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>שם הנציג:</label>
                  <input
                    type="text"
                    value={newPhone.name}
                    onChange={(e) => setNewPhone({ ...newPhone, name: e.target.value })}
                    placeholder="שם מלא"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>מספר טלפון:</label>
                  <input
                    type="tel"
                    value={newPhone.phone}
                    onChange={(e) => setNewPhone({ ...newPhone, phone: e.target.value })}
                    placeholder="05X-XXXXXXX"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
                <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>
                  + הוסף
                </button>
              </div>
            </form>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#667eea', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>אזור</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>שם הנציג</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>מספר טלפון</th>
                {isManager && <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', width: '100px' }}>פעולות</th>}
              </tr>
            </thead>
            <tbody>
              {data.phoneNumbers.length === 0 ? (
                <tr><td colSpan={isManager ? 4 : 3} style={{ padding: '15px', textAlign: 'center', color: '#999' }}>אין נתונים</td></tr>
              ) : (
                data.phoneNumbers.map(pn => (
                  <tr key={pn.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{pn.area}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{pn.name}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{pn.phone}</td>
                    {isManager && (
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <button onClick={() => setData({ ...data, phoneNumbers: data.phoneNumbers.filter(item => item.id !== pn.id) })} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>מחק</button>
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

export default AdditionalInfo;

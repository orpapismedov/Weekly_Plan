import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

function FrequencyTable({ onClose, isManager }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved image from Firebase
    const loadImage = async () => {
      try {
        const docRef = doc(db, 'settings', 'frequencyTable');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().imageUrl) {
          setImagePreview(docSnap.data().imageUrl);
        }
      } catch (error) {
        console.error('Error loading frequency table:', error);
      }
      setLoading(false);
    };
    loadImage();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('נא להעלות קובץ תמונה בלבד');
        return;
      }

      setLoading(true);
      try {
        // Upload to Firebase Storage
        const storageRef = ref(storage, 'frequencyTable/table.jpg');
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Save URL to Firestore
        await setDoc(doc(db, 'settings', 'frequencyTable'), {
          imageUrl: downloadURL,
          updatedAt: new Date().toISOString()
        });
        
        setImagePreview(downloadURL);
        setImage(file);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('שגיאה בהעלאת התמונה');
      }
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את התמונה?')) {
      setLoading(true);
      try {
        // Delete from Firebase Storage
        const storageRef = ref(storage, 'frequencyTable/table.jpg');
        await deleteObject(storageRef);
        
        // Delete from Firestore
        await deleteDoc(doc(db, 'settings', 'frequencyTable'));
        
        setImagePreview(null);
        setImage(null);
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('שגיאה במחיקת התמונה');
      }
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h2 style={{ color: '#667eea', marginBottom: '20px' }}>טבלת תדרים</h2>
          <button className="close-btn" onClick={onClose}>סגור</button>
        </div>

        {isManager && (
          <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>העלאת תמונה</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #667eea',
                cursor: 'pointer',
                width: '100%',
                marginBottom: '10px'
              }}
            />
            {imagePreview && (
              <button
                onClick={handleDeleteImage}
                style={{
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
              >
                🗑️ מחק תמונה
              </button>
            )}
          </div>
        )}

        <div style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              ⏳ טוען...
            </div>
          ) : imagePreview ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  style={{
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {isZoomed ? 'הקטן 🔍' : 'הגדל 🔎'}
                </button>
              </div>
              <div style={{ 
                textAlign: 'center', 
                overflow: isZoomed ? 'auto' : 'visible',
                maxHeight: isZoomed ? '70vh' : 'none',
                cursor: isZoomed ? 'move' : 'default'
              }}>
                <img
                  src={imagePreview}
                  alt="טבלת תדרים"
                  style={{
                    width: isZoomed ? 'auto' : '100%',
                    maxWidth: isZoomed ? 'none' : '100%',
                    maxHeight: isZoomed ? 'none' : '70vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </>
          ) : (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              background: '#f8f9fa',
              borderRadius: '8px',
              color: '#999'
            }}>
              {isManager ? (
                <>
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>📷 לא הועלתה תמונה</p>
                  <p>השתמש בכפתור "העלאת תמונה" למעלה כדי להעלות טבלת תדרים</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>📷 אין תמונה זמינה</p>
                  <p>המנהל טרם העלה טבלת תדרים</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FrequencyTable;

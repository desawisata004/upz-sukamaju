import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const ensureUserData = async (user, role = 'warga') => {
  if (!user) return null;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Buat data user baru
      const userData = {
        uid: user.uid,
        email: user.email,
        nama: user.displayName || user.email.split('@')[0],
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userRef, userData);
      console.log('✅ User data created for:', user.email);
      return userData;
    }
    
    return userSnap.data();
  } catch (error) {
    console.error('Error ensuring user data:', error);
    return null;
  }
};
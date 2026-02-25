// src/services/notificationService.js
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '../config/constants';

export const sendNotification = async ({ userId, title, body, type, data = {} }) => {
  if (!db) return;
  
  try {
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      userId,
      title,
      body,
      type,
      data,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export const notifySetoranDiterima = (userId, nominal) =>
  sendNotification({
    userId,
    title: '✅ Setoran Diterima',
    body: `Setoran Rp ${nominal.toLocaleString('id-ID')} telah dikonfirmasi.`,
    type: 'setoran_diterima',
  });

export const notifySetoranDitolak = (userId, nominal, alasan) =>
  sendNotification({
    userId,
    title: '❌ Setoran Ditolak',
    body: `Setoran Rp ${nominal.toLocaleString('id-ID')} ditolak. ${alasan || ''}`,
    type: 'setoran_ditolak',
  });

export const notifyTargetTercapai = (userId, target) =>
  sendNotification({
    userId,
    title: '🎉 Target Tercapai!',
    body: `Selamat! Kencleng Anda telah mencapai target Rp ${target.toLocaleString('id-ID')}.`,
    type: 'target_tercapai',
  });
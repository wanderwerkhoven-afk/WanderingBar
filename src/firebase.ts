import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase web configuration identifies the project; it is not a private credential.
const app = initializeApp({
  apiKey: 'AIzaSyAx1o9UY_Zt1FWOAENRPCKTGQkeUnS5lmc',
  authDomain: 'barback-20df5.firebaseapp.com',
  projectId: 'barback-20df5',
  storageBucket: 'barback-20df5.firebasestorage.app',
  messagingSenderId: '541809677188',
  appId: '1:541809677188:web:b257ba8acddb3c746303d1',
  measurementId: 'G-L57EE61D9W',
});

export const auth = getAuth(app);
export const db = getFirestore(app);

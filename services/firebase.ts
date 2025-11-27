import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAw2Hg6m92aMtERLi6qyAL2c0bP0pNTwcE",
  authDomain: "saeco-explore.firebaseapp.com",
  projectId: "saeco-explore",
  storageBucket: "saeco-explore.firebasestorage.app",
  messagingSenderId: "469727492252",
  appId: "1:469727492252:web:c830ffe11fd831b0049559",
  measurementId: "G-YK15WSXSG1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Create a unique filename: timestamp_filename
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
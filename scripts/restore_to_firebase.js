import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../frontend/.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Error: Firebase configuration missing in environment variables.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importJsonl(filePath, collectionName, getDocIdFn) {
  console.log(`Starting import for ${path.basename(filePath)} into collection '${collectionName}'...`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File not found at ${filePath}. Skipping.`);
    return;
  }
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    const data = JSON.parse(line);
    
    try {
      if (getDocIdFn) {
        const docId = getDocIdFn(data);
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data);
      } else {
        const colRef = collection(db, collectionName);
        await addDoc(colRef, data);
      }
      count++;
    } catch (err) {
      console.error(`Error importing row to ${collectionName}:`, err);
    }
  }
  console.log(`Imported ${count} documents into collection '${collectionName}'.`);
}

async function run() {
  try {
    const importDir = path.resolve(__dirname, '../database/convex_imports');

    // Import profiles
    await importJsonl(
      path.join(importDir, 'profiles.jsonl'),
      'profiles',
      (data) => data.email
    );

    // Import questions
    await importJsonl(
      path.join(importDir, 'questions.jsonl'),
      'questions',
      (data) => {
        const uniId = String(data.university_id);
        const courseId = String(data.course_id);
        const sem = String(data.semester);
        const subject = data.subject_name || '';
        return `${uniId}_${courseId}_${sem}_${subject.replace(/\//g, '_')}`;
      }
    );

    // Import papers
    await importJsonl(
      path.join(importDir, 'papers.jsonl'),
      'papers',
      null // Let Firestore auto-generate IDs for papers
    );

    console.log('Firebase restore complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();

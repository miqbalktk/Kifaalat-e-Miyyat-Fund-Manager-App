import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

async function seed() {
  const storePath = path.resolve(process.cwd(), 'data/store.json');
  if (!fs.existsSync(storePath)) {
    console.error('store.json not found');
    process.exit(1);
  }

  const raw = fs.readFileSync(storePath, 'utf-8');
  const store = JSON.parse(raw);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

  console.log('Seeding Firestore from data/store.json...');

  // 1. Members
  if (Array.isArray(store.members)) {
    console.log(`Uploading ${store.members.length} members...`);
    const batch = writeBatch(db);
    for (const m of store.members) {
      if (m && m.id) {
        batch.set(doc(db, 'members', m.id), m);
      }
    }
    await batch.commit();
    console.log('Members uploaded successfully.');
  }

  // 2. Contributions
  if (Array.isArray(store.contributions)) {
    console.log(`Uploading ${store.contributions.length} contributions...`);
    // Commit in chunks of 400
    const chunkSize = 400;
    for (let i = 0; i < store.contributions.length; i += chunkSize) {
      const chunk = store.contributions.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const c of chunk) {
        if (c && c.id) {
          batch.set(doc(db, 'contributions', c.id), c);
        }
      }
      await batch.commit();
    }
    console.log('Contributions uploaded successfully.');
  }

  // 3. Donations
  if (Array.isArray(store.donations)) {
    console.log(`Uploading ${store.donations.length} donations...`);
    const batch = writeBatch(db);
    for (const d of store.donations) {
      if (d && d.id) {
        batch.set(doc(db, 'donations', d.id), d);
      }
    }
    await batch.commit();
    console.log('Donations uploaded successfully.');
  }

  // 4. Claims
  if (Array.isArray(store.claims) && store.claims.length > 0) {
    console.log(`Uploading ${store.claims.length} claims...`);
    const batch = writeBatch(db);
    for (const clm of store.claims) {
      if (clm && clm.id) {
        batch.set(doc(db, 'claims', clm.id), clm);
      }
    }
    await batch.commit();
  }

  // 5. User Credentials
  if (Array.isArray(store.userCredentials)) {
    console.log(`Uploading ${store.userCredentials.length} user credentials...`);
    const batch = writeBatch(db);
    for (const cr of store.userCredentials) {
      if (cr && cr.username) {
        const cleanU = cr.username.toLowerCase().replace(/[\s-]/g, '');
        batch.set(doc(db, 'credentials', cleanU), cr);
      }
    }
    await batch.commit();
    console.log('User credentials uploaded successfully.');
  }

  // 6. Full backup snapshot in appSettings and backups
  console.log('Saving full backup snapshot...');
  await setDoc(doc(db, 'appSettings', 'data_snapshot'), store);
  await setDoc(doc(db, 'backups', 'latest'), {
    id: 'latest',
    data: store,
    timestamp: new Date().toISOString()
  });

  console.log('Firestore seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

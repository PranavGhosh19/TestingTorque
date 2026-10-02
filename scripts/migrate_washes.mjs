import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC3m0jvG-VnQDeLOuAKPPquhW-8Vnhgywg',
  authDomain: 'cargoflow-j35du.firebaseapp.com',
  projectId: 'cargoflow-j35du',
  storageBucket: 'cargoflow-j35du.firebasestorage.app',
  messagingSenderId: '866863583313',
  appId: '1:866863583313:web:8164df2f5bfab9aa7b6870',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  const ownersSnap = await getDocs(collection(db, 'Car_Owners'));
  console.log('Owners found:', ownersSnap.size);

  for (const oDoc of ownersSnap.docs) {
    const ownerId = oDoc.id;
    const vSnap = await getDocs(collection(db, 'Car_Owners', ownerId, 'Vehicles'));

    for (const vDoc of vSnap.docs) {
      const vId = vDoc.id;
      const wSnap = await getDocs(collection(db, 'Car_Owners', ownerId, 'Vehicles', vId, 'Washes'));

      for (const wDoc of wSnap.docs) {
        const wData = wDoc.data();
        const dateIso = '2026-10-01'; // Existing wash done on Oct 1
        const monthKey = 'October_2026';
        const washId = `wash_${vId}_${dateIso}`;

        const migratedData = {
          ...wData,
          washId,
          date: dateIso,
          day: 1,
          month: 'October',
          year: 2026,
          monthKey,
          scheduledDate: dateIso,
        };

        // 1. Save to Month collection: Car_Owners/{ownerId}/Vehicles/{vehicleId}/{monthKey}/{dateIso}
        await setDoc(doc(db, 'Car_Owners', ownerId, 'Vehicles', vId, monthKey, dateIso), migratedData, { merge: true });
        console.log(`Saved to ${ownerId}/${vId}/${monthKey}/${dateIso}`);

        // 2. Save to Months/{monthKey}/Dates/{dateIso}
        await setDoc(doc(db, 'Car_Owners', ownerId, 'Vehicles', vId, 'Months', monthKey, 'Dates', dateIso), migratedData, { merge: true });

        // 3. Save to Washes/{washId}
        await setDoc(doc(db, 'Car_Owners', ownerId, 'Vehicles', vId, 'Washes', washId), migratedData, { merge: true });

        // Update vehicle lastWashDate
        await setDoc(
          doc(db, 'Car_Owners', ownerId, 'Vehicles', vId),
          {
            lastWashDate: dateIso,
            lastWashStatus: 'completed',
          },
          { merge: true }
        );

        // If old doc was _today, delete it so it never clashes
        if (wDoc.id.endsWith('_today')) {
          await deleteDoc(doc(db, 'Car_Owners', ownerId, 'Vehicles', vId, 'Washes', wDoc.id));
          console.log(`Deleted legacy doc ${wDoc.id}`);
        }
      }
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});

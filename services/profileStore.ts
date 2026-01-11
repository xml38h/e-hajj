import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from './firebase.ts';
import { PilgrimProfile } from "../types";

export async function saveProfileToCloud(profile: PilgrimProfile) {
  await setDoc(
    doc(db, "profiles", profile.id),
    profile,
    { merge: true }
  );
}

export async function loadProfileFromCloud(id: string): Promise<PilgrimProfile | null> {
  const snap = await getDoc(doc(db, "profiles", id));
  if (!snap.exists()) return null;
  return snap.data() as PilgrimProfile;
}

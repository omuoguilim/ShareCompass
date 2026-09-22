// src/useProfile.js
// The Firebase data layer for ShareCompass, in one place.
// Owns: who's logged in, and their profile / follows / gifts in Firestore.
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// The shape we store per user. Mirrors the app's in-memory `giver` + follows + gifts.
const EMPTY = {
  email: "", countryCode: "US", phone: "", causes: [], gives: [],
  region: "", city: "", newsletter: true, region2: "global",
  follows: [], gifts: [], onboarded: false,
};

export function useProfile() {
  const [user, setUser] = useState(undefined); // undefined = still checking, null = logged out
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track auth state.
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u || null));
  }, []);

  // When the user changes, load their profile from Firestore.
  useEffect(() => {
    if (user === undefined) return;          // still checking
    if (user === null) { setProfile(null); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.exists() ? snap.data() : {};
        if (!cancelled) setProfile({ ...EMPTY, email: user.email, ...data });
      } catch (e) {
        console.error("Profile load failed:", e);
        if (!cancelled) setProfile({ ...EMPTY, email: user.email });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Save a partial update to Firestore (merges, doesn't overwrite the whole doc).
  const saveProfile = useCallback(async (patch) => {
    if (!user) return;
    setProfile((p) => ({ ...(p || EMPTY), ...patch })); // optimistic local update
    try {
      await setDoc(doc(db, "users", user.uid), patch, { merge: true });
    } catch (e) {
      console.error("Profile save failed:", e);
    }
  }, [user]);

  return { user, profile, loading, saveProfile };
}

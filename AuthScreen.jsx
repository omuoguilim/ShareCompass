import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use": return "That email already has an account — try logging in.";
    case "auth/invalid-email": return "That doesn't look like a valid email.";
    case "auth/weak-password": return "Password should be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found": return "Email or password is incorrect.";
    default: return "Something went wrong. Please try again.";
  }
}

export default function AuthScreen() {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // profile state
  const [name, setName] = useState("");
  const [cause, setCause] = useState("");
  const [savedProfile, setSavedProfile] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // when a user logs in, load their saved profile from Firestore
  useEffect(() => {
    if (!user) { setSavedProfile(null); return; }
    (async () => {
      setStatus("Loading your saved profile…");
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setSavedProfile(data);
          setName(data.name || "");
          setCause(data.cause || "");
          setStatus("Loaded from database.");
        } else {
          setSavedProfile(null);
          setStatus("No profile saved yet — fill it in and save.");
        }
      } catch (e) {
        setStatus("Couldn't load: " + e.message);
      }
    })();
  }, [user]);

  const submit = async () => {
    setError(""); setBusy(true);
    try {
      if (mode === "signup") await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(friendlyError(e.code));
    } finally { setBusy(false); }
  };

  const saveProfile = async () => {
    if (!user) return;
    setStatus("Saving…");
    try {
      const profile = { name, cause, updatedAt: Date.now() };
      // writes to  users/{your-uid}  in Firestore
      await setDoc(doc(db, "users", user.uid), profile);
      setSavedProfile(profile);
      setStatus("Saved! Refresh the page — it'll load back.");
    } catch (e) {
      setStatus("Save failed: " + e.message);
    }
  };

  if (user) {
    return (
      <div style={wrap}>
        <div style={card}>
          <h2 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif" }}>You're signed in</h2>
          <p style={{ color: "#A99C8D", fontSize: 13, marginBottom: 18 }}>{user.email}</p>

          <div style={{ fontSize: 12, color: "#7C7064", letterSpacing: 1, marginBottom: 8 }}>YOUR PROFILE</div>
          <input style={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={input} placeholder="Favorite cause (e.g. Hunger)" value={cause} onChange={(e) => setCause(e.target.value)} />
          <button style={btn} onClick={saveProfile}>Save to database</button>

          {status && <div style={{ fontSize: 12.5, color: "#6BA88C", marginBottom: 14 }}>{status}</div>}

          {savedProfile && (
            <div style={{ background: "#191512", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: "#EFE7DA" }}>
              <div style={{ color: "#7C7064", fontSize: 11, marginBottom: 6 }}>CURRENTLY SAVED IN FIRESTORE:</div>
              <div>Name: {savedProfile.name || "(empty)"}</div>
              <div>Cause: {savedProfile.cause || "(empty)"}</div>
            </div>
          )}

          <button style={link} onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ margin: "0 0 20px", fontFamily: "Georgia, serif" }}>
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h2>
        <input style={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div style={{ color: "#D2683C", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button style={{ ...btn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={submit}>
          {busy ? "Please wait..." : mode === "signup" ? "Sign up" : "Log in"}
        </button>
        <button style={link} onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}>
          {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

const wrap = { minHeight: "100vh", background: "#191512", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif" };
const card = { background: "#211C18", border: "1px solid #3D342D", borderRadius: 16, padding: 28, width: 320, color: "#EFE7DA" };
const input = { width: "100%", boxSizing: "border-box", padding: "12px 14px", marginBottom: 12, borderRadius: 10, border: "1px solid #4A3F37", background: "#2B2420", color: "#EFE7DA", fontSize: 15, outline: "none" };
const btn = { width: "100%", padding: 13, borderRadius: 10, border: "none", background: "#D2683C", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 12 };
const link = { width: "100%", padding: 0, border: "none", background: "none", color: "#A99C8D", fontSize: 13, cursor: "pointer", textDecoration: "underline" };

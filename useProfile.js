import { useState, useEffect, useCallback, useRef } from "react";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";

const EMPTY = {email:"",displayName:"",countryCode:"US",phone:"",causes:[],gives:[],region:"",city:"",newsletter:false,region2:"global",follows:[],gifts:[],onboarded:false,isPublic:false,theme:"dark"};
const ALLOWED=new Set(Object.keys(EMPTY));
export function cleanProfilePatch(patch) {return Object.fromEntries(Object.entries(patch).filter(([key])=>ALLOWED.has(key)));}
export function visibleProfile(uid, profile) {
  return {uid,isPublic:true,displayName:profile.displayName || "ShareCompass neighbor",countryCode:profile.countryCode || "US",region:profile.region || "",city:profile.city || "",causes:profile.causes || [],gives:profile.gives || [],updatedAt:serverTimestamp()};
}
export function useProfile() {
  const [user,setUser]=useState(undefined);
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [retry,setRetry]=useState(0);
  const current=useRef(null), queue=useRef(Promise.resolve());
  useEffect(()=>onAuthStateChanged(auth,u=>{current.current=null;setProfile(null);setLoading(Boolean(u));setError("");setUser(u || null);}),[]);
  useEffect(()=>{
    if(!user)return undefined;
    setLoading(true);setError("");
    return onSnapshot(doc(db,"users",user.uid),snapshot=>{
      const next={...EMPTY,email:user.email,...(snapshot.exists()?snapshot.data():{})};
      current.current=next;setProfile(next);setLoading(false);setError("");
    },()=>{setLoading(false);setError("Your saved profile could not be loaded. Please retry before making changes.");});
  },[user,retry]);
  const saveProfile=useCallback(input=>{
    const patch=cleanProfilePatch(input);
    const task=queue.current.catch(()=>{}).then(async()=>{
      if(!user || auth.currentUser?.uid!==user.uid || !current.current)throw new Error("Sign in and load your profile before saving.");
      const next={...current.current,...patch};
      const batch=writeBatch(db);
      batch.set(doc(db,"users",user.uid),patch,{merge:true});
      if(next.isPublic)batch.set(doc(db,"publicProfiles",user.uid),visibleProfile(user.uid,next));
      else batch.delete(doc(db,"publicProfiles",user.uid));
      await batch.commit();
      if(auth.currentUser?.uid===user.uid){current.current=next;setProfile(next);}
    });
    queue.current=task;
    return task;
  },[user]);
  return {user,profile,loading,error,saveProfile,retryProfile:()=>setRetry(n=>n+1)};
}

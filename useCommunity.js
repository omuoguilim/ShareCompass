import { useCallback, useEffect, useMemo, useState } from "react";
import { arrayUnion, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase.js";

const connectionId = (a, b) => [a, b].sort().join("_");

export function useCommunity(user, profile) {
  const [people, setPeople] = useState([]);
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setPeople([]);
    if (!user) return undefined;
    const publicQuery = query(collection(db, "publicProfiles"), where("isPublic", "==", true));
    return onSnapshot(publicQuery, (snapshot) => {
      setPeople(snapshot.docs.map((item) => item.data()).filter((item) => item.uid !== user.uid));
      setError("");
    }, () => setError("Community profiles could not be loaded."));
  }, [user]);

  useEffect(() => {
    setConnections([]);
    if (!user) return undefined;
    const connectionsQuery = query(collection(db, "connections"), where("participants", "array-contains", user.uid));
    return onSnapshot(connectionsQuery, (snapshot) => {
      setConnections(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, () => setError("Connections could not be loaded."));
  }, [user]);

  const nearbyPeople = useMemo(() => people.filter((person) => {
    if (profile?.city && person.city) return person.city === profile.city && person.region === profile.region;
    if (profile?.region && person.region) return person.region === profile.region;
    return person.countryCode === profile?.countryCode;
  }), [people, profile]);

  const requestConnection = useCallback(async (target) => {
    if (!target?.uid || target.uid===user?.uid) throw new Error("Choose another volunteer.");
    if (!user || !profile?.isPublic) throw new Error("Make your profile public before connecting.");
    const id = connectionId(user.uid, target.uid);
    await setDoc(doc(db, "connections", id), {
      participants: [user.uid, target.uid],
      requesterId: user.uid,
      recipientId: target.uid,
      requesterName: profile.displayName || "Volunteer",
      recipientName: target.displayName || "Volunteer",
      status: "pending",
      sharedCauses: (profile.causes || []).filter((cause) => (target.causes || []).includes(cause)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: false });
  }, [profile, user]);

  const respondToConnection = useCallback(async (id, status) => {
    if (!user || !["accepted", "declined"].includes(status)) throw new Error("Sign in to respond.");
    await updateDoc(doc(db, "connections", id), { status, updatedAt: serverTimestamp(), acknowledgedBy: arrayUnion(user.uid) });
  }, [user]);

  const removeConnection=useCallback(async(id)=>{
    if(!user)throw new Error("Sign in to manage connections.");
    await deleteDoc(doc(db,"connections",id));
  },[user]);
  return { people: nearbyPeople, connections, error, requestConnection, respondToConnection,removeConnection };
}


import { useProfile } from "./useProfile.js";
import { auth } from "./firebase.js";
import { signOut } from "firebase/auth";
import AuthScreen from "./AuthScreen.jsx";
import ShareCompass from "./ShareCompass.jsx";
import { useCommunity } from "./useCommunity.js";

export default function App() {
  const { user, profile, loading, error, retryProfile, saveProfile } = useProfile();
  const community = useCommunity(user && user !== undefined ? user : null, profile);

  if (user === undefined || (user && loading)) {
    return (
      <div style={{ minHeight: "100vh", background: "#191512", display: "grid",
        placeItems: "center", color: "#A99C8D", fontFamily: "system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  if(error)return <main style={{minHeight:"100vh",background:"#191512",color:"#EFE7DA",display:"grid",placeItems:"center",padding:24}}><div role="alert"><p>{error}</p><button onClick={retryProfile}>Retry</button><button onClick={()=>signOut(auth)}>Sign out</button></div></main>;

  return <ShareCompass userId={user.uid} profile={profile} saveProfile={saveProfile} community={community} onSignOut={() => signOut(auth)} />;
}


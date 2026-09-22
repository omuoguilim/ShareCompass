import { useProfile } from "./useProfile.js";
import { auth } from "./firebase.js";
import { signOut } from "firebase/auth";
import AuthScreen from "./AuthScreen.jsx";
import ShareCompass from "./ShareCompass.jsx";

export default function App() {
  const { user, profile, loading, saveProfile } = useProfile();

  if (user === undefined || (user && loading)) {
    return (
      <div style={{ minHeight: "100vh", background: "#191512", display: "grid",
        placeItems: "center", color: "#A99C8D", fontFamily: "system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return <ShareCompass profile={profile} saveProfile={saveProfile} onSignOut={() => signOut(auth)} />;
}

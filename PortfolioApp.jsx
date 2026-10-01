import { useRef, useState } from "react";
import ShareCompass from "./ShareCompass.jsx";

const KEY = "sharecompass.portfolio.v1";
const fresh = () => ({displayName:"Alex", email:"alex@example.test", countryCode:"US",region:"Georgia",city:"Atlanta",causes:["Education","Hunger"],gives:["Time"],isPublic:false,newsletter:false,theme:"dark",onboarded:true,follows:[],gifts:[]});
function readProfile() {
  try { return {...fresh(), ...JSON.parse(localStorage.getItem(KEY) || "null"), isPublic:false}; }
  catch { return fresh(); }
}
export default function PortfolioApp() {
  const profile = useRef(readProfile());
  const [revision, setRevision] = useState(0);
  const saveProfile = (update) => {
    profile.current = {...profile.current,...update,isPublic:false};
    try { localStorage.setItem(KEY, JSON.stringify(profile.current)); } catch { /* Private browsing may prevent persistence. */ }
  };
  const reset = () => {
    profile.current=fresh();
    try { localStorage.removeItem(KEY); } catch { /* Reset also works in memory. */ }
    setRevision((n)=>n+1);
  };
  return <>
    <header style={{background:"#191512",color:"#EFE7DA",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"10px 18px",fontSize:13,fontFamily:"system-ui"}}>
      <a href="../../" style={{color:"inherit"}}>← Portfolio</a>
      <span>Demo · changes stay in this browser</span>
      <button onClick={reset} style={{background:"transparent",color:"#E08A4B",border:"1px solid #4A3F37",borderRadius:7,padding:"6px 10px",cursor:"pointer"}}>Reset</button>
    </header>
    <ShareCompass key={revision} userId="portfolio-sample" profile={profile.current} saveProfile={saveProfile} community={{people:[],connections:[]}} onSignOut={reset}/>
  </>;
}

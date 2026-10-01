// A headquarters address is not evidence of a local program.
export function operatesInCountry(org, countryCode) {
  return Boolean(countryCode && org.operatingCountries?.includes(countryCode));
}
export function operatesInCity(org, giver) {
  return operatesInCountry(org, giver.countryCode) && Boolean(giver.city) &&
    org.operatingCities?.some(city => city.toLocaleLowerCase() === giver.city.toLocaleLowerCase());
}
export function scoreMatch(giver, org) {
  let score=0; const why=[];
  const causes=giver.causes || [], gives=giver.gives || [];
  if(causes.some(cause=>(org.causes || [org.cause]).includes(cause))){score+=38;why.push("Shares your cause");}
  else if(!causes.length)score+=19;
  if(org.types.some(type=>gives.includes(type))){score+=22;why.push("Matches how you give");}
  if(operatesInCity(org,giver)){score+=25;why.unshift("Listed in your city");}
  else if(operatesInCountry(org,giver.countryCode)){score+=20;why.unshift("Projects in your country");}
  if(org.urgent){score+=12;why.push("Emergency response");}
  return {score:Math.min(100,score),why:why.slice(0,3)};
}
export function discoverOrganizations(orgs,giver,{query="",range=giver.region2 || "global",urgentOnly=giver.urgentOnly || false}={}) {
  const term=query.trim().toLocaleLowerCase();
  return orgs.filter(org=>{
    if(range==="national" && !operatesInCountry(org,giver.countryCode))return false;
    if(range==="local" && !operatesInCity(org,giver))return false;
    if(urgentOnly && !org.urgent)return false;
    return !term || [org.name,org.blurb,org.loc,org.cause,org.projectTitle,...(org.causes || [])].join(" ").toLocaleLowerCase().includes(term);
  }).map(o=>({o,m:scoreMatch(giver,o)})).sort((a,b)=>{
    const local=Number(operatesInCountry(b.o,giver.countryCode))-Number(operatesInCountry(a.o,giver.countryCode));
    return local || b.m.score-a.m.score || a.o.name.localeCompare(b.o.name);
  });
}

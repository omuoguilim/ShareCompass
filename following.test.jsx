// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import PortfolioApp from "./PortfolioApp.jsx";
import ShareCompass, { ProfilePage } from "./ShareCompass.jsx";
beforeEach(()=>{localStorage.clear();Element.prototype.scrollTo=vi.fn();Element.prototype.scrollIntoView=vi.fn();});
afterEach(()=>{cleanup();vi.useRealTimers();});
const giver={email:"alex@example.test",displayName:"Alex",countryCode:"US",region:"Georgia",city:"Atlanta",causes:["Hunger"],gives:["Time"],theme:"light",isPublic:false,onboarded:true};
describe("following controls",()=>{
  it("opens followed organizations and provides explicit unfollow",()=>{
    const open=vi.fn(),unfollow=vi.fn();
    render(<ProfilePage giver={giver} follows={new Set([1])} gifts={[]} onOpen={open} onFollow={unfollow} onEditProfile={()=>{}} onOpenSettings={()=>{}}/>);
    fireEvent.click(screen.getByRole("button",{name:"Open Direct Relief"}).closest("button"));
    expect(open).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button",{name:/^Unfollow /}));
    expect(unfollow).toHaveBeenCalledWith(1);
  });
  it("shows an empty following list after the final organization is removed",()=>{
    render(<ProfilePage giver={giver} follows={new Set()} gifts={[]} onOpen={()=>{}} onFollow={()=>{}} onEditProfile={()=>{}} onOpenSettings={()=>{}}/>);
    expect(screen.getByText(/No organizations followed yet/)).toBeTruthy();
    expect(screen.queryByRole("button",{name:/^Unfollow /})).toBeNull();
  });
  it("persists unfollow and restores the visible list when saving fails",async()=>{
    const save=vi.fn().mockRejectedValue(new Error("offline"));
    render(<ShareCompass profile={{...giver,follows:[1]}} saveProfile={save} community={{people:[],connections:[]}} onSignOut={()=>{}}/>);
    await screen.findByRole("button",{name:"Profile"},{timeout:2500});
    fireEvent.click(screen.getByRole("button",{name:"Profile"}));
    const unfollow=screen.getByRole("button",{name:/^Unfollow /});
    fireEvent.click(unfollow);
    await screen.findByText("Could not save your following list. Please try again.");
    expect(save).toHaveBeenCalledWith({follows:[]});
    expect(screen.getByRole("button",{name:/^Unfollow /})).toBeTruthy();
  });
});

describe("portfolio persistence",()=>{
 it("restores followed organizations on reload and keeps unfollowed ones removed",async()=>{
  localStorage.setItem("sharecompass.portfolio.v1",JSON.stringify({...giver,follows:[1]}));
  const first=render(<PortfolioApp/>);
  fireEvent.click(await screen.findByRole("button",{name:"Profile"},{timeout:2500}));
  fireEvent.click(screen.getByRole("button",{name:"Unfollow Direct Relief"}));
  await waitFor(()=>expect(JSON.parse(localStorage.getItem("sharecompass.portfolio.v1")).follows).toEqual([]));
  first.unmount();render(<PortfolioApp/>);
  fireEvent.click(await screen.findByRole("button",{name:"Profile"},{timeout:2500}));
  expect(screen.queryByRole("button",{name:"Unfollow Direct Relief"})).toBeNull();
 });
 it("opens all five navigation screens and the following counter",async()=>{
  render(<ShareCompass profile={{...giver,follows:[1]}} saveProfile={vi.fn()} community={{people:[],connections:[]}} onSignOut={()=>{}}/>);
  await screen.findByRole("button",{name:"Home"},{timeout:2500});
  for(const name of ["Give","Connect","Find Help","Profile","Home","Profile"]){fireEvent.click(screen.getByRole("button",{name}));expect(screen.getByRole("button",{name})).toBeTruthy();}
  fireEvent.click(screen.getByRole("button",{name:"View following"}));
  expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
 });
});

it("manages an incoming request even when the sender is absent from discovery",async()=>{
 const respond=vi.fn().mockResolvedValue();
 render(<ShareCompass userId="alex" profile={{...giver,isPublic:false}} saveProfile={vi.fn()} community={{people:[],connections:[{id:"request1",requesterId:"sam",recipientId:"alex",requesterName:"Sam",status:"pending",participants:["sam","alex"]}],respondToConnection:respond,removeConnection:vi.fn()}} onSignOut={()=>{}}/>);
 fireEvent.click(await screen.findByRole("button",{name:"Connect"},{timeout:2500}));
 expect(screen.getByText("Sam")).toBeTruthy();
 fireEvent.click(screen.getByRole("button",{name:"Accept"}));
 await waitFor(()=>expect(respond).toHaveBeenCalledWith("request1","accepted"));
});

it("editing preferences does not restore a removed follow",async()=>{
 localStorage.setItem("sharecompass.portfolio.v1",JSON.stringify({...giver,follows:[1]}));
 render(<PortfolioApp/>);
 fireEvent.click(await screen.findByRole("button",{name:"Profile"},{timeout:2500}));
 fireEvent.click(screen.getByRole("button",{name:"Unfollow Direct Relief"}));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem("sharecompass.portfolio.v1")).follows).toEqual([]));
 fireEvent.click(screen.getByRole("button",{name:"Open settings"}));
 fireEvent.click(screen.getByRole("button",{name:"Toggle light appearance"}));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem("sharecompass.portfolio.v1")).theme).toBe("dark"));
 expect(JSON.parse(localStorage.getItem("sharecompass.portfolio.v1")).follows).toEqual([]);
});

it('shows Nigerian projects first and expands the directory without losing controls',async()=>{
 const ng={...giver,countryCode:'NG',city:'Lagos',region:'Lagos',region2:'national',causes:['Water'],gives:['Money']};
 render(<ShareCompass profile={ng} saveProfile={vi.fn()} community={{people:[],connections:[]}} onSignOut={()=>{}}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Give'},{timeout:2500}));
 expect(screen.getByText('49 organizations')).toBeTruthy();
 expect(screen.queryByText('Feeding America')).toBeNull();
 const before=screen.getAllByRole('article').length;
 expect(before).toBe(24);
 fireEvent.click(screen.getByRole('button',{name:'Show more organizations'}));
 expect(screen.getAllByRole('article').length).toBe(48);
 fireEvent.change(screen.getByRole('textbox',{name:'Search organizations, causes, or locations…'}),{target:{value:'HopeShield'}});
 expect(screen.getByText('HopeShield Humanitarian Foundation')).toBeTruthy();
 expect(screen.getAllByRole('article')).toHaveLength(1);
 fireEvent.click(screen.getByRole('button',{name:'Clear search'}));
 expect(screen.getAllByRole('article')).toHaveLength(24);
});

it('preserves and unfollows a new directory organization after reloading',async()=>{
 const id='gg-105675';localStorage.setItem('sharecompass.portfolio.v1',JSON.stringify({...giver,countryCode:'NG',follows:[id]}));
 const first=render(<PortfolioApp/>);
 fireEvent.click(await screen.findByRole('button',{name:'Profile'},{timeout:2500}));
 fireEvent.click(screen.getByRole('button',{name:'Unfollow GoGreen Environmental Health Sustainability Initiatives'}));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem('sharecompass.portfolio.v1')).follows).toEqual([]));
 first.unmount();render(<PortfolioApp/>);
 fireEvent.click(await screen.findByRole('button',{name:'Profile'},{timeout:2500}));
 expect(screen.queryByRole('button',{name:'Unfollow GoGreen Environmental Health Sustainability Initiatives'})).toBeNull();
});

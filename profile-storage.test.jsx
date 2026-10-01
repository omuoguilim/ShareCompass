// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
const f=vi.hoisted(()=>({auth:{currentUser:{uid:"alex",email:"alex@example.test"}},commit:vi.fn(),set:vi.fn(),remove:vi.fn()}));
vi.mock("./firebase.js",()=>({auth:f.auth,db:{}}));
vi.mock("firebase/auth",()=>({onAuthStateChanged:(_auth,cb)=>{cb(f.auth.currentUser);return ()=>{};}}));
vi.mock("firebase/firestore",()=>({
 doc:(_db,...parts)=>parts.join("/"),serverTimestamp:()=>"server-time",
 onSnapshot:(_ref,cb)=>{cb({exists:()=>true,data:()=>({displayName:"Alex",email:"alex@example.test",phone:"123",follows:[1],isPublic:false})});return ()=>{};},
 writeBatch:()=>({set:f.set,delete:f.remove,commit:f.commit})
}));
import { useProfile, cleanProfilePatch } from "./useProfile.js";
beforeEach(()=>{vi.clearAllMocks();f.auth.currentUser={uid:"alex",email:"alex@example.test"};f.commit.mockResolvedValue();});
afterEach(cleanup);
describe("account persistence",()=>{
 it("saves follows and removes the discoverable profile together for private accounts",async()=>{
  const {result}=renderHook(()=>useProfile());
  await act(async()=>{await result.current.saveProfile({follows:[2,3]});});
  expect(f.set).toHaveBeenCalledWith("users/alex",{follows:[2,3]},{merge:true});
  expect(f.remove).toHaveBeenCalledWith("publicProfiles/alex");
  expect(f.commit).toHaveBeenCalledOnce();
  expect(result.current.profile.follows).toEqual([2,3]);
 });
 it("never copies email or phone into discoverable profiles",async()=>{
  const {result}=renderHook(()=>useProfile());
  await act(async()=>{await result.current.saveProfile({isPublic:true});});
  const publicCall=f.set.mock.calls.find(([path])=>path==="publicProfiles/alex");
  expect(publicCall[1]).not.toHaveProperty("email");
  expect(publicCall[1]).not.toHaveProperty("phone");
  expect(publicCall[1].uid).toBe("alex");
 });
 it("propagates failed database saves instead of marking them successful",async()=>{
  f.commit.mockRejectedValueOnce(new Error("permission-denied"));
  const {result}=renderHook(()=>useProfile());
  await act(async()=>{await expect(result.current.saveProfile({follows:[]})).rejects.toThrow("permission-denied");});
  expect(result.current.profile.follows).toEqual([1]);
 });
 it("rejects queued writes after sign-out",async()=>{
  const {result}=renderHook(()=>useProfile());
  f.auth.currentUser=null;
  await expect(result.current.saveProfile({follows:[]})).rejects.toThrow("Sign in");
  expect(f.commit).not.toHaveBeenCalled();
 });
});

it("excludes passwords and form-only fields from database updates",()=>{
 expect(cleanProfilePatch({displayName:"Alex",password:"never-store",_ctext:"United States"})).toEqual({displayName:"Alex"});
});

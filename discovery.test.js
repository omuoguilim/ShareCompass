import { describe,it,expect } from 'vitest';
import orgs from './globalOrganizations.json';
import countries from './directoryCountries.json';
import {discoverOrganizations,operatesInCountry,scoreMatch} from './discovery.js';
const nigeria={countryCode:'NG',city:'Lagos',causes:['Water'],gives:['Money'],region2:'global'};
describe('worldwide directory and location matching',()=>{
 it('adds 500 distinct organizations across more than 100 countries, with Nigerian coverage',()=>{
  expect(orgs).toHaveLength(500);
  expect(new Set(orgs.map(o=>o.id)).size).toBe(500);
  expect(new Set(orgs.map(o=>o.name.toLowerCase())).size).toBe(500);
  expect(new Set(orgs.flatMap(o=>o.operatingCountries)).size).toBeGreaterThan(100);
  expect(orgs.filter(o=>operatesInCountry(o,'NG')).length).toBeGreaterThanOrEqual(40);
  expect(orgs.every(o=>o.sourceUrl && o.sourceCheckedAt && o.operatingCountries.every(c=>countries[c]))).toBe(true);
 });
 it('uses the saved countryCode and puts actual country projects first worldwide',()=>{
  const ranked=discoverOrganizations(orgs,nigeria);
  const n=orgs.filter(o=>operatesInCountry(o,'NG')).length;
  expect(ranked.slice(0,n).every(({o})=>operatesInCountry(o,'NG'))).toBe(true);
  expect(ranked.slice(n).every(({o})=>!operatesInCountry(o,'NG'))).toBe(true);
 });
 it('country range excludes unrelated domestic charities and headquarters-only matches',()=>{
  const usOnly={id:1,name:'US food bank',cause:'Hunger',types:['Money'],country:'US',operatingCountries:['US'],operatingCities:[],blurb:'',loc:'United States'};
  const headquartersOnly={...usOnly,id:2,country:'NG',operatingCountries:[]};
  const results=discoverOrganizations([...orgs,usOnly,headquartersOnly],{...nigeria,region2:'national'});
  expect(results.length).toBeGreaterThan(40);
  expect(results.every(({o})=>operatesInCountry(o,'NG'))).toBe(true);
  expect(results.some(({o})=>o.id===1 || o.id===2)).toBe(false);
  expect(scoreMatch(nigeria,headquartersOnly).why).not.toContain('Projects in your country');
 });
 it('does not invent city-level availability from country coverage',()=>{
  expect(discoverOrganizations(orgs,{...nigeria,region2:'local'})).toEqual([]);
 });
 it('combines location with search and urgent filtering',()=>{
  const rows=discoverOrganizations(orgs,{...nigeria,region2:'national'},{query:'HopeShield'});
  expect(rows).toHaveLength(1);expect(rows[0].o.name).toContain('HopeShield');
  expect(discoverOrganizations(orgs,nigeria,{urgentOnly:true})).toEqual([]);
 });
});

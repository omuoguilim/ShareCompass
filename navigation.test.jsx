// @vitest-environment jsdom
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import ShareCompass from './ShareCompass.jsx';
const profile = {email:'alex@example.test',displayName:'Alex',countryCode:'US',region:'Georgia',
  city:'Atlanta',causes:['Hunger'],gives:['Time'],theme:'light',isPublic:false,onboarded:true,follows:[1]};
beforeEach(() => {localStorage.clear(); Element.prototype.scrollTo = vi.fn(); Element.prototype.scrollIntoView = vi.fn();});
afterEach(cleanup);
describe('navigation destinations', () => {
  it('renders the destination content and unmounts the previous screen for every tab', async () => {
    render(<ShareCompass profile={profile} saveProfile={vi.fn().mockResolvedValue()}
      community={{people:[],connections:[]}} onSignOut={vi.fn()}/>);
    await screen.findByText('THE GIVING FIELD GUIDE', {}, {timeout:2500});
    fireEvent.click(screen.getByRole('button', {name:'Give', exact:true}));
    expect(screen.getByText('Give to an organization')).toBeTruthy();
    expect(screen.queryByText('THE GIVING FIELD GUIDE')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name:'Find Help', exact:true}));
    expect(screen.getByText('Find services for yourself')).toBeTruthy();
    expect(screen.queryByText('Give to an organization')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name:'Connect', exact:true}));
    expect(screen.getByText('Volunteer with someone nearby')).toBeTruthy();
    expect(screen.queryByText('Find services for yourself')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name:'Profile', exact:true}));
    expect(screen.getByRole('button', {name:'Unfollow Direct Relief'})).toBeTruthy();
    expect(screen.queryByText('Volunteer with someone nearby')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name:'Home', exact:true}));
    expect(screen.getByText('THE GIVING FIELD GUIDE')).toBeTruthy();
    expect(screen.queryByRole('button', {name:'Unfollow Direct Relief'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name:'Profile', exact:true}));
    expect(screen.getByRole('button', {name:'Unfollow Direct Relief'})).toBeTruthy();
  });
});

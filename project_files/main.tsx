import React from 'react';
import {createRoot} from 'react-dom/client';
import posthog from 'posthog-js';
import Home from './app/page';
import './app/globals.css';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    person_profiles: 'identified_only',
  });
}

createRoot(document.getElementById('root')!).render(<Home/>);

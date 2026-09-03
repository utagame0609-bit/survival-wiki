import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/hudBrackets.css';
import './styles/wikiScpDossier.css';
import { initializeUserSoundSettings } from './lib/userSoundSettingsBootstrap';
import { initializeAppTheme } from './lib/theme';

initializeAppTheme();
void initializeUserSoundSettings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
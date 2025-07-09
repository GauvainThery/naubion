import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import './i18n'; // Initialize i18n
import { BrowserRouter, Route, Routes } from 'react-router';
import { page } from '@naubion/shared';
import PageCarbonFootprint from './views/PageCarbonFootprint';
import Home from './views/Home';
import AdminPage from './views/AdminPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path={page.home} element={<Home />} />
        <Route path={page.pageCarbonFootprint} element={<PageCarbonFootprint />} />
        <Route path={page.admin} element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

import LandingPage from '/src/pages/landing/index.jsx';
import DashboardPage from './pages/dashboard/index';
import ProjectsPage from './pages/projects/index';
import ProjectDetailsPage from './pages/project-details/index';
import InvoicesPage from './pages/invoices/index';
import QuotesPage from './pages/quotes/index';
import ClientsPage from './pages/clients/index';
import ItemsPage from './pages/items/index';
import AddEditItemPage from './pages/add-edit-item/index';
import ItemSelectionModalPage from './pages/item-selection-modal/index';
import AnalyticsPage from './pages/analytics/index';
import SettingsPage from './pages/settings/index';
import LoginPage from './pages/login/index';
import RegisterPage from './pages/register/index';
import PricingPage from './pages/pricing/index';
import NotFoundPage from './pages/NotFound';
import BrandingPage from './pages/branding/index';

export default function Routes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/items/add" element={<AddEditItemPage />} />
          <Route path="/items/edit/:id" element={<AddEditItemPage />} />
          <Route path="/item-selection" element={<ItemSelectionModalPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/branding" element={<BrandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
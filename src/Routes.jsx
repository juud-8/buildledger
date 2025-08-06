import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

import LandingPage from './pages/landing';
import DashboardPage from './pages/dashboard';
import ProjectsPage from './pages/projects';
import ProjectDetailsPage from './pages/project-details';
import InvoicesPage from './pages/invoices';
import QuotesPage from './pages/quotes';
import ClientsPage from './pages/clients';
import ItemsPage from './pages/items';
import AddEditItemPage from './pages/add-edit-item';
import ItemSelectionModalPage from './pages/item-selection-modal';
import AnalyticsPage from './pages/analytics';
import SettingsPage from './pages/settings';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import PricingPage from './pages/pricing';
import NotFoundPage from './pages/NotFound';
import BrandingPage from './pages/branding';

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
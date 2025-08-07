import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

import LandingPage from './pages/landing/index.jsx';
import DashboardPage from './pages/dashboard/index.jsx';
import ProjectsPage from './pages/projects/index.jsx';
import ProjectDetailsPage from './pages/project-details/index.jsx';
import InvoicesPage from './pages/invoices/index.jsx';
import QuotesPage from './pages/quotes/index.jsx';
import ClientsPage from './pages/clients/index.jsx';
import ItemsPage from './pages/items/index.jsx';
import AddEditItemPage from './pages/add-edit-item/index.jsx';
import ItemSelectionModalPage from './pages/item-selection-modal/index.jsx';
import AnalyticsPage from './pages/analytics/index.jsx';
import SettingsPage from './pages/settings/index.jsx';
import LoginPage from './pages/login/index.jsx';
import RegisterPage from './pages/register/index.jsx';
import PricingPage from './pages/pricing/index.jsx';
import NotFoundPage from './pages/NotFound.jsx';
import BrandingPage from './pages/branding/index.jsx';
import VendorsPage from './pages/vendors/index.jsx';
import MaterialsPage from './pages/materials/index.jsx';
import AdminSetupPage from './pages/admin-setup/index.jsx';
import AdminCleanupPage from './pages/admin-cleanup/index.jsx';

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
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/admin-setup" element={<AdminSetupPage />} />
          <Route path="/admin-cleanup" element={<AdminCleanupPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
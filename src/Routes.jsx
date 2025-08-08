import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import PrivateRoute from './components/auth/PrivateRoute';
import SessionWarning from './components/auth/SessionWarning';
import { FEATURES } from './utils/rbac';

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
        <SessionWarning />
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          
          <Route path="/projects" element={
            <PrivateRoute requiredFeature={FEATURES.VIEW_PROJECTS}>
              <ProjectsPage />
            </PrivateRoute>
          } />
          
          <Route path="/projects/:id" element={
            <PrivateRoute requiredFeature={FEATURES.VIEW_PROJECTS}>
              <ProjectDetailsPage />
            </PrivateRoute>
          } />
          
          <Route path="/invoices" element={
            <PrivateRoute requiredFeature={FEATURES.VIEW_INVOICES}>
              <InvoicesPage />
            </PrivateRoute>
          } />
          
          <Route path="/quotes" element={
            <PrivateRoute requiredFeature={FEATURES.VIEW_QUOTES}>
              <QuotesPage />
            </PrivateRoute>
          } />
          
          <Route path="/clients" element={
            <PrivateRoute requiredFeature={FEATURES.VIEW_CLIENTS}>
              <ClientsPage />
            </PrivateRoute>
          } />
          
          <Route path="/items" element={
            <PrivateRoute requiredFeature={FEATURES.VIEW_ITEMS}>
              <ItemsPage />
            </PrivateRoute>
          } />
          
          <Route path="/items/add" element={
            <PrivateRoute requiredFeature={FEATURES.CREATE_EDIT_ITEMS} requiredPlan="Pro">
              <AddEditItemPage />
            </PrivateRoute>
          } />
          
          <Route path="/items/edit/:id" element={
            <PrivateRoute requiredFeature={FEATURES.CREATE_EDIT_ITEMS} requiredPlan="Pro">
              <AddEditItemPage />
            </PrivateRoute>
          } />
          
          <Route path="/item-selection" element={
            <PrivateRoute requiredFeature={FEATURES.VIEW_ITEMS}>
              <ItemSelectionModalPage />
            </PrivateRoute>
          } />
          
          <Route path="/analytics" element={
            <PrivateRoute requiredFeature={FEATURES.VIEW_ANALYTICS} requiredPlan="Pro">
              <AnalyticsPage />
            </PrivateRoute>
          } />
          
          <Route path="/settings" element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } />
          
          <Route path="/branding" element={
            <PrivateRoute requiredFeature={FEATURES.CUSTOM_BRANDING} requiredPlan="Pro">
              <BrandingPage />
            </PrivateRoute>
          } />
          
          <Route path="/vendors" element={
            <PrivateRoute requiredFeature={FEATURES.VENDOR_MANAGEMENT} requiredPlan="Pro">
              <VendorsPage />
            </PrivateRoute>
          } />
          
          <Route path="/materials" element={
            <PrivateRoute requiredFeature={FEATURES.MATERIAL_MANAGEMENT} requiredPlan="Pro">
              <MaterialsPage />
            </PrivateRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin-setup" element={
            <PrivateRoute requiredFeature={FEATURES.ADMIN_PANEL}>
              <AdminSetupPage />
            </PrivateRoute>
          } />
          
          <Route path="/admin-cleanup" element={
            <PrivateRoute requiredFeature={FEATURES.ADMIN_PANEL}>
              <AdminCleanupPage />
            </PrivateRoute>
          } />
          
          <Route path="*" element={<NotFoundPage />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
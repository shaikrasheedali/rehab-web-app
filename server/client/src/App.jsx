import React from 'react';
import { useApp } from './context/AppContext.jsx';
import Home from './pages/public/Home.jsx';
import Services from './pages/public/Services.jsx';
import ServiceDetail from './pages/public/ServiceDetail.jsx';
import Packages from './pages/public/Packages.jsx';
import OffPackageServices from './pages/public/OffPackageServices.jsx';
import About from './pages/public/About.jsx';
import Gallery from './pages/public/Gallery.jsx';
import GalleryDetail from './pages/public/GalleryDetail.jsx';
import Blog from './pages/public/Blog.jsx';
import BlogDetail from './pages/public/BlogDetail.jsx';
import Contact from './pages/public/Contact.jsx';
import Estimator from './pages/public/Estimator.jsx';
import Inquiry from './pages/public/Inquiry.jsx';
import NotFound from './pages/public/NotFound.jsx';

// Admin Pages
import Dashboard from './pages/admin/Dashboard.jsx';
import Inquiries from './pages/admin/Inquiries.jsx';
import Admissions from './pages/admin/Admissions.jsx';
import DischargedArchive from './pages/admin/DischargedArchive.jsx';
import Catalog from './pages/admin/Catalog.jsx';
import MediaAdmin from './pages/admin/MediaAdmin.jsx';
import BillingCreate from './pages/admin/BillingCreate.jsx';
import Invoices from './pages/admin/Invoices.jsx';
import Residents from './pages/admin/Residents.jsx';
import Beds from './pages/admin/Beds.jsx';

export default function App() {
  const { route } = useApp();

  // Handle Root & Simple Routes
  if (route === '/' || route === '') return <Home />;
  if (route === '/services') return <Services />;
  if (route === '/packages') return <Packages />;
  if (route === '/add-on-services') return <OffPackageServices />;
  if (route === '/about') return <About />;
  if (route === '/gallery') return <Gallery />;
  if (route === '/blog') return <Blog />;
  if (route === '/contact') return <Contact />;
  if (route === '/estimator') return <Estimator />;
  if (route === '/inquiry') return <Inquiry />;

  // Handle Detail Routes
  if (route.startsWith('/services/')) {
    const id = route.replace('/services/', '').split('?')[0];
    return <ServiceDetail serviceId={id} kind="in-package" />;
  }
  if (route.startsWith('/add-on-services/')) {
    const id = route.replace('/add-on-services/', '').split('?')[0];
    return <ServiceDetail serviceId={id} kind="off-package" />;
  }
  if (route.startsWith('/gallery/')) {
    const id = route.replace('/gallery/', '').split('?')[0];
    return <GalleryDetail mediaId={id} />;
  }
  if (route.startsWith('/blog/')) {
    const id = route.replace('/blog/', '').split('?')[0];
    return <BlogDetail blogId={id} />;
  }

  // Handle Admin Routes
  if (route === '/admin' || route === '/admin/dashboard') return <Dashboard />;
  if (route === '/admin/inquiries') return <Inquiries />;
  if (route === '/admin/admissions') return <Admissions />;
  if (route === '/admin/discharged') return <DischargedArchive />;
  if (route === '/admin/catalog') return <Catalog />;
  if (route === '/admin/media') return <MediaAdmin />;
  if (route === '/admin/billing' || route === '/admin/billing/create') return <BillingCreate />;
  if (route === '/admin/billing/invoices') return <Invoices />;
  if (route === '/admin/residents') return <Residents />;
  if (route === '/admin/beds') return <Beds />;

  return <NotFound />;
}

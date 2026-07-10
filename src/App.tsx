import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { SITE_HOME_PATH } from "@/lib/sitePaths";
import ComingSoon from "./pages/ComingSoon.tsx";
import Index from "./pages/Index.tsx";
import Products from "./pages/Products.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import ICUAtHome from "./pages/ICUAtHome.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Blog from "./pages/Blog.tsx";
import BlogDetail from "./pages/BlogDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import {
  PrivacyPolicy,
  ReferAndEarn,
  ServicePolicy,
  ShippingCancellationPolicy,
  TermsConditions,
  VendorRegistration,
} from "./pages/FooterPages.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin.tsx";
import ProductsAdmin from "./pages/admin/ProductsAdmin.tsx";
import ServicesAdmin from "./pages/admin/ServicesAdmin.tsx";
import GalleryAdmin from "./pages/admin/GalleryAdmin.tsx";
import TestimonialsAdmin from "./pages/admin/TestimonialsAdmin.tsx";
import BlogsAdmin from "./pages/admin/BlogsAdmin.tsx";
import HomeAdmin from "./pages/admin/HomeAdmin.tsx";
import AboutAdmin from "./pages/admin/AboutAdmin.tsx";
import ContactAdmin from "./pages/admin/ContactAdmin.tsx";
import SeoAdmin from "./pages/admin/SeoAdmin.tsx";
import InquiriesAdmin from "./pages/admin/InquiriesAdmin.tsx";
import VendorsAdmin from "./pages/admin/VendorsAdmin.tsx";
import SettingsAdmin from "./pages/admin/SettingsAdmin.tsx";
import AdminLogin from "./pages/admin/Login.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ComingSoon />} />
            <Route path={SITE_HOME_PATH} element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/icu-at-home" element={<ICUAtHome />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/vendor-registration" element={<VendorRegistration />} />
            <Route path="/service-policy" element={<ServicePolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/shipping-cancellation-policy" element={<ShippingCancellationPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refer-and-earn" element={<ReferAndEarn />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <CategoriesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <ProductsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <ProtectedRoute>
                  <ServicesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute>
                  <GalleryAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/testimonials"
              element={
                <ProtectedRoute>
                  <TestimonialsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blogs"
              element={
                <ProtectedRoute>
                  <BlogsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/home"
              element={
                <ProtectedRoute>
                  <HomeAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/about"
              element={
                <ProtectedRoute>
                  <AboutAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contact"
              element={
                <ProtectedRoute>
                  <ContactAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/seo"
              element={
                <ProtectedRoute>
                  <SeoAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inquiries"
              element={
                <ProtectedRoute>
                  <InquiriesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vendors"
              element={
                <ProtectedRoute>
                  <VendorsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <SettingsAdmin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

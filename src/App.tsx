import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Products from "./pages/Products.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import ICUAtHome from "./pages/ICUAtHome.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Blog from "./pages/Blog.tsx";
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
import ProductsAdmin from "./pages/admin/ProductsAdmin.tsx";
import InquiriesAdmin from "./pages/admin/InquiriesAdmin.tsx";
import SettingsAdmin from "./pages/admin/SettingsAdmin.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/icu-at-home" element={<ICUAtHome />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/vendor-registration" element={<VendorRegistration />} />
          <Route path="/service-policy" element={<ServicePolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/shipping-cancellation-policy" element={<ShippingCancellationPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refer-and-earn" element={<ReferAndEarn />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductsAdmin />} />
          <Route path="/admin/inquiries" element={<InquiriesAdmin />} />
          <Route path="/admin/settings" element={<SettingsAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import InquiryForm from "@/components/InquiryForm";
import CitiesSection from "@/components/CitiesSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <InquiryForm />
      <CitiesSection />
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default Index;

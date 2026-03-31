import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeaturedProducts = () => {
  return (
    <section className="py-16">
      <div className="section-container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
              Top Selling Products
            </h2>
            <p className="text-muted-foreground">Most rented equipment by families across India</p>
          </div>
          <Link to="/products">
            <Button variant="ghost" className="text-primary font-semibold">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

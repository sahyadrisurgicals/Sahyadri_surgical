import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card card-shadow transition-all duration-300 hover:-translate-y-1 hover:card-shadow-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.available && (
          <Badge className="absolute left-3 top-3 border-0 bg-trust text-xs text-primary-foreground">
            Available
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="mb-2 line-clamp-2 font-display text-sm font-semibold text-foreground">
          {product.name}
        </h3>
        <div className="mt-auto">
          <div className="grid grid-cols-1 gap-2 pt-1 min-[380px]:grid-cols-2">
            <Button size="sm" className="w-full rounded-lg border-0 gradient-cta text-xs text-primary-foreground hover:opacity-90">
              Rent Now
            </Button>
            <Button size="sm" variant="outline" className="w-full rounded-lg border-primary text-xs text-primary hover:bg-secondary">
              Buy
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

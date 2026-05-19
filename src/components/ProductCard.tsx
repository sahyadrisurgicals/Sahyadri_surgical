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
      className="group bg-card rounded-2xl card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.available && (
          <Badge className="absolute top-3 left-3 bg-trust text-primary-foreground border-0 text-xs">
            Available
          </Badge>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-foreground text-sm mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">₹{product.rentPrice.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">/ {product.rentUnit}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Buy: ₹{product.buyPrice.toLocaleString()}
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1 gradient-cta text-primary-foreground border-0 text-xs rounded-lg hover:opacity-90">
              Rent Now
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs rounded-lg border-primary text-primary hover:bg-secondary">
              Buy
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

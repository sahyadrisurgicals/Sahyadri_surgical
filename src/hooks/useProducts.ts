import { useEffect, useState } from "react";
import { Product } from "@/data/products";
import { fetchProducts } from "@/lib/api";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProducts();
        if (active) setProducts(data);
      } catch (err) {
        if (active)
          setError(
            err instanceof Error ? err.message : "Failed to load products"
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return { products, loading, error };
}

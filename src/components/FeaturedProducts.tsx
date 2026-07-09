import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";

const FeaturedProducts = () => {
  const { products } = useProducts();
  const topSellingCards = products.filter((product) => product.topSelling).slice(0, 4);
  const cardsToRender = topSellingCards.length > 0 ? topSellingCards : products.slice(0, 4);

  return (
    <section className="bg-[#efeff2] py-8 md:py-10">
      <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.1em] text-[#8b4cc0] md:text-xl">
            Top Selling Products
          </h2>
          <div className="mx-auto mt-2 h-0.5 w-14 rounded-full bg-[#9651cd]" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cardsToRender.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-[#d9dbe0] bg-[#f7f7f9] shadow-sm"
            >
              <div className="h-[170px] overflow-hidden bg-[#e8ecf3] md:h-[182px]">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="px-4 pb-4 pt-3.5">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-[#1c1c1e] sm:text-base">
                  {item.name}
                </h3>
                <p className="mt-1 text-xs text-[#6f7075]">{item.categoryName || item.category}</p>
                <div className="mt-2 border-t border-[#d7d9de] pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="whitespace-nowrap text-base font-semibold leading-none text-[#1f2022] sm:text-lg">
                      Rs {item.rentPrice.toLocaleString()} / {item.rentUnit.toUpperCase()}
                    </p>
                    <Link to={`/products?search=${encodeURIComponent(item.name)}`} className="min-w-[102px] flex-1 sm:flex-none">
                      <Button className="h-8 w-full whitespace-nowrap rounded-md bg-[#2f5ca6] px-3 text-sm font-medium text-white hover:bg-[#285096]">
                        Rent Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

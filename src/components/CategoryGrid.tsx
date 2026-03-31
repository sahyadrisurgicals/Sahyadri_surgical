import { Link } from "react-router-dom";
import { categories } from "@/data/products";
import { motion } from "framer-motion";

const CategoryGrid = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="section-container">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Browse by Category
          </h2>
          <p className="text-muted-foreground">Find the right equipment for your needs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link
                to={`/products?category=${cat.id}`}
                className="group flex flex-col items-center p-5 bg-card rounded-2xl card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
                <span className="text-sm font-semibold text-foreground text-center leading-tight">
                  {cat.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1">{cat.count} items</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;

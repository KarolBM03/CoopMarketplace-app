import type { Product } from "../../types/product.types";
import { Link, useLocation } from "react-router-dom";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const location = useLocation();
  const source = location.pathname.startsWith("/customer")
    ? "customer"
    : "public";

  return (
    <Link
      to={`/products/${product.id}`}
      state={{ source }}
      className="block overflow-hidden rounded-3xl bg-white transition"
    >
      <div className="h-56 bg-slate-100 relative">
        {product.rankingScore && product.rankingScore >= 50 && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white shadow-lg">
            Destacado
          </div>
        )}
        <img
          src={
            product.imageUrl ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
          }
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900">{product.title}</h3>

          {product.isFinanced && (
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-black">
              Financiamiento
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Precio</p>

            <h2 className="text-2xl font-black text-green-400">
              RD${product.price.toLocaleString()}
            </h2>
          </div>

          <button className="min-w-24 rounded-2xl bg-green-500 px-7 py-3 font-bold text-black transition hover:bg-green-400">
            Ver
          </button>
        </div>
      </div>
    </Link>
  );
}

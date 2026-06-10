import { Heart, Star } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import { addFavorite, removeFavorite } from "../../services/favorite.service";
import { useAuthStore } from "../../store/auth.store";
import type { Product } from "../../types/product.types";

interface Props {
  product: Product;
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
}

export default function ProductCard({
  product,
  isFavorite = false,
  onFavoriteChange,
}: Props) {
  const location = useLocation();
  const user = useAuthStore.getState().user;
  const source = location.pathname.startsWith("/customer")
    ? "customer"
    : "public";

  const handleFavorite = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.error("Inicia sesión para guardar favoritos");
      return;
    }

    if (user.role !== "CUSTOMER") {
      toast.error("Solo los clientes pueden guardar favoritos");
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(product.id);
        onFavoriteChange?.();
        toast.success("Producto quitado de favoritos");
      } else {
        await addFavorite(product.id);
        onFavoriteChange?.();
        toast.success("Producto guardado en favoritos");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No pude guardar esto");
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      state={{ source }}
      className="block overflow-hidden rounded-3xl bg-white transition"
    >
      <div className="relative h-56 bg-slate-100">
        {product.rankingScore && product.rankingScore >= 50 && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white shadow-lg">
            Destacado
          </div>
        )}

        {user?.role === "CUSTOMER" && source === "customer" && (
          <button
            onClick={handleFavorite}
            className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-600 shadow-lg transition hover:bg-white hover:text-red-500"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
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

        <div className="mt-3 flex items-center gap-2">
          <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
          <span className="text-sm font-black text-slate-700">
            {(product.ratingAverage || 0).toFixed(1)}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            ({product.ratingCount || 0})
          </span>
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

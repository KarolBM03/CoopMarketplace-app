import { useEffect, useState } from "react";
import ProductCard from "../../components/product/ProductCard";
import { getMyFavorites } from "../../services/favorite.service";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getMyFavorites();
      setFavorites(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-950">
            Mis Productos Favoritos
          </h1>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div>Cargando espere...</div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            No tienes productos guardados.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite) => (
              <ProductCard
                key={favorite.id}
                product={favorite.product}
                isFavorite
                onFavoriteChange={loadFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

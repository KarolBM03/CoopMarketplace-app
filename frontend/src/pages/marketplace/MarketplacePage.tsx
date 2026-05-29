import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import { getProducts } from "../../services/product.services";
import type { Product } from "../../types/product.types";

const categories = [
  "Todos",
  "Autos",
  "Celulares",
  "Laptops",
  "Electrodomesticos",
  "Muebles",
  "Ropa",
];

export default function MarketplacePage() {
  const location = useLocation();
  const isCustomerView = location.pathname.startsWith("/customer");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const normalizedMin = useMemo(
    () => (minPrice ? Number(minPrice) : undefined),
    [minPrice],
  );
  const normalizedMax = useMemo(
    () => (maxPrice ? Number(maxPrice) : undefined),
    [maxPrice],
  );

  useEffect(() => {
    setPage(1);
  }, [search, category, sort, minPrice, maxPrice]);

  useEffect(() => {
    loadProducts();
  }, [search, category, sort, page, normalizedMin, normalizedMax]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(
        page,
        12,
        search,
        category,
        normalizedMin,
        normalizedMax,
        sort,
      );

      setProducts(data.products || []);
      setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
      setTotal(data.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {!isCustomerView && (
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 font-black text-white shadow-lg shadow-emerald-200">
                C
              </div>
              <h1 className="text-xl font-black text-slate-900">CoopMarket</h1>
            </div>

            <SearchBox value={search} onChange={setSearch} />
          </div>
        </header>
      )}

      <main
        className={`mx-auto max-w-7xl px-6 pb-20 ${isCustomerView ? "pt-8" : "pt-28"}`}
      >
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-600">
              Marketplace
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Encuentra productos unicos
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-slate-500">
              El mejor lugar para explora productos con pagos directos y
              financiamiento cooperativo.
            </p>
          </div>

          {isCustomerView && <SearchBox value={search} onChange={setSearch} />}
        </div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-700">
            <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
            Filtros
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_140px_140px_170px]">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    category === item
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Min RD$"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-emerald-500"
            />

            <input
              type="number"
              placeholder="Max RD$"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-emerald-500"
            />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-emerald-500"
            >
              <option value="newest">Mas recientes</option>
              <option value="price_asc">Precio menor</option>
              <option value="price_desc">Precio mayor</option>
            </select>
          </div>
        </section>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">
            {loading
              ? "Buscando productos..."
              : `${total} productos encontrados`}
          </p>
          <p className="text-sm font-bold text-slate-500">
            Pagina {page} de {totalPages}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800">
                No se encontraron productos
              </h2>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <button
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex h-12 w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-emerald-500 lg:w-[420px]">
      <Search className="h-5 w-5 text-slate-400" />
      <input
        type="text"
        placeholder="Buscar productos..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

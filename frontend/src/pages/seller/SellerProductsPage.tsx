import { Edit3, Package, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  createProduct,
  deleteProduct,
  getSellerProducts,
  updateProduct,
} from "../../services/product.services";
import { uploadImage } from "../../services/upload.service";
import { useAuthStore } from "../../store/auth.store";
import type { Product } from "../../types/product.types";

const inputClass =
  "h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-emerald-500";

export default function SellerProductsPage() {
  const user = useAuthStore.getState().user;
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    isFinanced: true,
    category: "Otros",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return products;

    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term),
    );
  }, [products, search]);

  const loadProducts = async () => {
    if (!user) return;
    const data = await getSellerProducts(user.id);
    setProducts(data);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setImageFile(null);
    setForm({
      title: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
      isFinanced: true,
      category: "Otros",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) return toast("Debes iniciar sesion");

    try {
      let finalImageUrl = form.imageUrl;

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      if (!editingProduct && !finalImageUrl) {
        toast("Selecciona una imagen");
        return;
      }

      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: finalImageUrl,
        isFinanced: form.isFinanced,
        category: form.category,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success("Producto actualizado");
      } else {
        await createProduct({
          ...payload,
          sellerId: user.id,
        });
        toast.success("Producto creado");
      }

      resetForm();
      await loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error guardando producto");
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success("Producto eliminado");
      await loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error eliminando producto");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImageFile(null);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl || "",
      isFinanced: product.isFinanced,
      category: product.category || "Otros",
    });

    document.getElementById("product-form")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Productos
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Gestion de productos
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Crea, edita y administra tu catalogo.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Package className="h-6 w-6" />
        </div>
      </div>

      <section
        id="product-form"
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-950">
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Completa los datos y publica en el mercado.
            </p>
          </div>

          {editingProduct && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600"
            >
              Cancelar edicion
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-3 xl:grid-cols-6"
        >
          <input
            className={`${inputClass} xl:col-span-2`}
            placeholder="Titulo"
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
          />
          <input
            className={`${inputClass} xl:col-span-2`}
            placeholder="Descripcion"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
          <input
            type="number"
            className={inputClass}
            placeholder="Precio"
            value={form.price}
            onChange={(event) =>
              setForm({ ...form, price: event.target.value })
            }
          />
          <input
            type="number"
            className={inputClass}
            placeholder="Existencia"
            value={form.stock}
            onChange={(event) =>
              setForm({ ...form, stock: event.target.value })
            }
          />

          <select
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value })
            }
            className={`${inputClass} xl:col-span-2`}
          >
            <option value="Otros">Otros</option>
            <option value="Autos">Autos</option>
            <option value="Celulares">Celulares</option>
            <option value="Laptops">Laptops</option>
            <option value="Electrodomesticos">Electrodomesticos</option>
            <option value="Muebles">Muebles</option>
            <option value="Ropa">Ropa</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            className="h-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold xl:col-span-2"
          />

          <label className="flex h-12 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700">
            Financiamiento
            <input
              type="checkbox"
              checked={form.isFinanced}
              onChange={(event) =>
                setForm({ ...form, isFinanced: event.target.checked })
              }
              className="h-5 w-5 accent-emerald-600"
            />
          </label>

          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-500">
            <Plus className="h-4 w-4" />
            {editingProduct ? "Guardar" : "Publicar"}
          </button>
        </form>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Productos publicados
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {filteredProducts.length} productos en tu catalogo.
            </p>
          </div>

          <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 lg:w-80">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              placeholder="Buscar producto..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4">Categoria</th>
                <th className="px-5 py-4">Financiamiento</th>
                <th className="px-5 py-4">Existencia</th>
                <th className="px-5 py-4">Precio</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    Todavia no tienes productos.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.imageUrl ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                          }
                          alt={product.title}
                          className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="max-w-xs truncate font-black text-slate-950">
                            {product.title}
                          </p>
                          <p className="max-w-xs truncate text-xs font-semibold text-slate-500">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        {product.category || "Otros"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex h-7 w-12 items-center rounded-full p-1 transition ${
                          product.isFinanced ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full bg-white transition ${
                            product.isFinanced ? "translate-x-5" : ""
                          }`}
                        />
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">
                        {product.stock}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        unidades
                      </p>
                    </td>
                    <td className="px-5 py-4 font-black text-emerald-700">
                      RD${product.price.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                          title="Editar producto"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import {
  ArrowLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserPlus,
  WalletCards,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../../services/product.services";
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";
import type { Product } from "../../types/product.types";
import { MessageCircle } from "lucide-react";
import { createConversation } from "../../services/chat.service";
import { getProductReviews } from "../../services/review.service";
import { createProductReview } from "../../services/review.service";
import { getMyOrders } from "../../services/order.service";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const addToCart = useCartStore.getState().addToCart;
  const user = useAuthStore.getState().user;
  const source = (location.state as { source?: string } | null)?.source;
  const canPurchase = Boolean(user) && source !== "public";
  const handleContactSeller = async () => {
    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    const sellerId = product.seller?.id || product.sellerId;

    if (!sellerId) {
      toast.error("Este producto no tiene vendedor asignado");
      return;
    }

    try {
      const conversation = await createConversation({
        sellerId,
        productId: product.id,
      });

      navigate("/chat", {
        state: {
          conversationId: conversation.id,
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo abrir el chat");
    }
  };

  const handleReview = async () => {
    if (!product) return;

    try {
      setSavingReview(true);

      if (!reviewOrderId) {
        toast.error("Solo puedes opinar cuando recibes el producto");
        return;
      }

      await createProductReview(product.id, {
        orderId: reviewOrderId,
        rating,
        comment,
      });
      toast.success("Tu opinión fue guardada correctamente");

      setComment("");
      setRating(5);
      await loadProduct();
      await loadReviews();

      setCanReview(false);
      setHasReviewed(true);
      setReviewOrderId(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "No pude guardar tu opinión",
      );
    } finally {
      setSavingReview(false);
    }
  };

  const panelPath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "SELLER"
        ? "/seller"
        : "/customer";

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
      checkCanReview();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await getProductById(id!);
      setProduct(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await getProductReviews(id!);
      setReviews(data);

      const alreadyReviewed = data.some(
        (review: any) => review.customerId === user?.id,
      );

      setHasReviewed(alreadyReviewed);

      if (alreadyReviewed) {
        setCanReview(false);
        setReviewOrderId(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkCanReview = async () => {
    if (!user || user.role !== "CUSTOMER" || !id) return;

    try {
      const orders = await getMyOrders();

      const deliveredOrder = orders.find((order: any) => {
        const hasProduct = order.items?.some(
          (item: any) => item.productId === id,
        );

        return order.status === "DELIVERED" && hasProduct;
      });

      if (deliveredOrder) {
        setCanReview(true);
        setReviewOrderId(deliveredOrder.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Cargando producto...
      </div>
    );
  }

  const monthlyPayment = product.price / 12;

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-7xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Package className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
                Detalle producto
              </p>
              <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
                {product.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Atras
            </button>

            {canPurchase ? (
              <button
                onClick={() => navigate(panelPath)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-500"
              >
                <LayoutDashboard className="h-5 w-5" />
                Volver al panel
              </button>
            ) : (
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-500"
              >
                <UserPlus className="h-5 w-5" />
                Registrarme
              </button>
            )}
            <button
              onClick={handleContactSeller}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 font-black text-emerald-700 hover:bg-emerald-100"
            >
              <MessageCircle className="h-5 w-5" />
              Contactar vendedor
            </button>
          </div>
        </header>

        <main className="grid gap-8 px-5 py-8 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img
              src={
                product.imageUrl ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
              }
              alt={product.title}
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>

          <section>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">
                {product.category || "Otros"}
              </span>

              {product.isFinanced && (
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                  Financiamiento disponible
                </span>
              )}
            </div>

            <h2 className="mt-6 text-4xl font-black text-slate-950">
              {product.title}
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              {product.description}
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span className="text-lg font-black text-slate-900">
                {(product.ratingAverage || 0).toFixed(1)}
              </span>

              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => {
                  const rating = product.ratingAverage || 0;
                  const filled = index < Math.round(rating);

                  return (
                    <Star
                      key={index}
                      className={`h-6 w-6 ${
                        filled
                          ? "fill-orange-500 text-orange-500"
                          : "fill-slate-200 text-slate-200"
                      }`}
                    />
                  );
                })}
              </div>

              <span className="text-sm text-slate-500">
                ({product.ratingCount || 0} Opiniones)
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-bold text-slate-500">Precio total</p>

              <h3 className="mt-2 text-5xl font-black text-emerald-600">
                RD${product.price.toLocaleString()}
              </h3>

              <div
                className={`mt-8 grid gap-4 ${
                  product.isFinanced ? "sm:grid-cols-2" : "sm:grid-cols-1"
                }`}
              >
                {product.isFinanced && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <WalletCards className="h-5 w-5 text-emerald-600" />
                      <p className="text-sm font-bold text-slate-500">
                        12 cuotas
                      </p>
                    </div>

                    <h4 className="mt-2 text-3xl font-black text-slate-950">
                      RD${monthlyPayment.toLocaleString()}
                    </h4>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-bold text-slate-500">Existencia</p>

                  <h4 className="mt-2 text-3xl font-black text-slate-950">
                    {product.stock}
                  </h4>
                </div>
              </div>

              {canPurchase ? (
                <div
                  className={`mt-8 grid gap-3 ${
                    product.isFinanced ? "md:grid-cols-2" : "md:grid-cols-1"
                  }`}
                >
                  <button
                    onClick={() => {
                      addToCart(product);
                      toast.success("Producto agregado al carrito");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-black text-white transition hover:bg-emerald-500"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Agregar al carrito
                  </button>

                  {product.isFinanced && (
                    <button
                      onClick={() => {
                        addToCart(product);
                        toast.success("Producto agregado al carrito");
                        navigate("/checkout");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white py-4 font-black text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <WalletCards className="h-5 w-5" />
                      Financiar
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-8 rounded-xl border border-emerald-100 bg-white p-5">
                  <h4 className="text-xl font-black text-slate-950">
                    Que esperas...
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Crea tu cuenta para agregar este producto al carrito,
                    solicitar financiamiento y gestina tus compras
                  </p>

                  <button
                    onClick={() => navigate("/register")}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-500"
                  >
                    <UserPlus className="h-5 w-5" />
                    Registrarme ahora
                  </button>
                </div>
              )}
            </div>

            {canReview && !hasReviewed && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-lg font-black text-slate-950">
                  Deja tu opinión
                </h4>

                <div className="mt-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setRating(index + 1)}
                    >
                      <Star
                        className={`h-7 w-7 ${
                          index < rating
                            ? "fill-orange-500 text-orange-500"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuenta cómo te fue con este producto"
                  className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-emerald-500"
                />

                <button
                  onClick={handleReview}
                  disabled={savingReview}
                  className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:bg-slate-300"
                >
                  {savingReview ? "Guardando..." : "Guardar opinión"}
                </button>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-black text-slate-950">
                Opiniones de clientes
              </h3>

              <div className="mt-4 space-y-4">
                {reviews.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 p-5">
                    Aún no hay opiniones para este producto
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-center gap-2">
                        {Array.from({ length: review.rating }).map(
                          (_, index) => (
                            <Star
                              key={index}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ),
                        )}
                      </div>

                      <p className="mt-3 text-slate-700">{review.comment}</p>

                      <p className="mt-2 text-sm font-bold text-slate-500">
                        {review.customer?.fullName}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

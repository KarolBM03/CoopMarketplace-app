import {
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { socket } from "../../socket";
import {
  getAdminConversations,
  getConversationMessages,
  getMyConversations,
  markAsRead,
  sendMessage,
} from "../../services/chat.service";
import { useAuthStore } from "../../store/auth.store";

export default function ChatPage() {
  const user = useAuthStore.getState().user;
  const currentUserId = user?.id;
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const conversationIdFromState = location.state?.conversationId;

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;

    return conversations.filter((conversation) => {
      const product = conversation.product?.title || "";
      const buyer = conversation.buyer?.fullName || "";
      const seller = conversation.seller?.fullName || "";
      const lastMessage = conversation.messages?.[0]?.content || "";

      return `${product} ${buyer} ${seller} ${lastMessage}`
        .toLowerCase()
        .includes(term);
    });
  }, [conversations, search]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selected) return;

    loadMessages(selected.id);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("chat:join", selected.id);

    const handleNewMessage = ({ message }: any) => {
      if (message.conversationId !== selected.id) return;

      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      if (message.senderId !== currentUserId) {
        toast.success("Nuevo mensaje recibido");
      }
    };

    const handleTyping = ({ conversationId }: any) => {
      if (conversationId === selected.id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId }: any) => {
      if (conversationId === selected.id) {
        setIsTyping(false);
      }
    };

    socket.on("chat:typing", handleTyping);
    socket.on("chat:stop_typing", handleStopTyping);
    socket.on("chat:message:new", handleNewMessage);

    return () => {
      socket.off("chat:message:new", handleNewMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:stop_typing", handleStopTyping);
    };
  }, [selected]);

  const loadConversations = async () => {
    try {
      const data =
        user?.role === "ADMIN"
          ? await getAdminConversations()
          : await getMyConversations();

      setConversations(data);

      if (conversationIdFromState) {
        const found = data.find(
          (conversation: any) => conversation.id === conversationIdFromState,
        );

        if (found) {
          setSelected(found);
        }
      }
    } catch {
      toast.error("No se pudieron cargar las conversaciones");
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await getConversationMessages(conversationId);
      setMessages(data);
      await markAsRead(conversationId);
    } catch {
      toast.error("No se pudieron cargar los mensajes");
    }
  };

  const handleSend = async () => {
    if (!content.trim() || !selected) return;

    try {
      await sendMessage(selected.id, content);
      setContent("");
      await loadConversations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo enviar");
    }
  };

  const selectedTitle = selected?.product?.title || "Chat";
  const selectedSubtitle =
    user?.role === "ADMIN"
      ? `${selected?.buyer?.fullName || "Cliente"} con ${
          selected?.seller?.fullName || "Vendedor"
        }`
      : user?.role === "SELLER"
        ? selected?.buyer?.fullName || "Cliente"
        : selected?.seller?.storeName ||
          selected?.seller?.fullName ||
          "Vendedor";

  return (
    <div className="grid h-[calc(100vh-90px)] grid-cols-1 gap-4 bg-slate-50 p-4 sm:p-6 lg:grid-cols-[380px_1fr]">
      <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                Centro de mensajes
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">
                Conversaciones
              </h1>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <MessageCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar chat..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {filteredConversations.length === 0 ? (
            <div className="grid h-full place-items-center px-6 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-500">
                  No hay conversaciones para mostrar.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredConversations.map((conversation) => {
                const active = selected?.id === conversation.id;
                const lastMessage =
                  conversation.messages?.[0]?.content || "Sin mensajes";
                const participant =
                  user?.role === "SELLER"
                    ? conversation.buyer?.fullName || "Cliente"
                    : conversation.seller?.storeName ||
                      conversation.seller?.fullName ||
                      "Vendedor";

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelected(conversation)}
                    className={`group w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-emerald-300 bg-emerald-50 shadow-sm"
                        : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                          active
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-700"
                        }`}
                      >
                        {user?.role === "ADMIN" ? (
                          <ShieldCheck className="h-5 w-5" />
                        ) : user?.role === "SELLER" ? (
                          <UserRound className="h-5 w-5" />
                        ) : (
                          <Store className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-black text-slate-950">
                            {conversation.product?.title || "Producto"}
                          </p>
                          {conversation.messages?.[0]?.createdAt && (
                            <span className="shrink-0 text-[11px] font-bold text-slate-400">
                              {new Date(
                                conversation.messages[0].createdAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-xs font-bold text-emerald-700">
                          {participant}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-slate-500">
                          {lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {!selected ? (
          <div className="grid flex-1 place-items-center bg-slate-50 px-6 text-center">
            <div className="max-w-sm">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-900">
                Selecciona una conversacion
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Aqui podras hablar con compradores, vendedores o auditar chats
                como administrador.
              </p>
            </div>
          </div>
        ) : (
          <>
            <header className="border-b border-slate-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-600 text-white">
                  {user?.role === "ADMIN" ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : user?.role === "SELLER" ? (
                    <UserRound className="h-5 w-5" />
                  ) : (
                    <Store className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-black text-slate-950">
                    {selectedTitle}
                  </h2>
                  <p className="truncate text-sm font-semibold text-slate-500">
                    {selectedSubtitle}
                  </p>
                  {isTyping && (
                    <p className="mt-1 text-xs font-black text-emerald-600">
                      Escribiendo...
                    </p>
                  )}
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
              <div className="mx-auto flex max-w-4xl flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="grid min-h-80 place-items-center text-center">
                    <div>
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-500">
                        Todavia no hay mensajes.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const senderId = message.senderId ?? message.sender?.id;

                    const isMine =
                      user?.role === "ADMIN"
                        ? senderId === selected?.sellerId
                        : String(senderId) === String(currentUserId);

                    return (
                      <div
                        key={message.id}
                        className={`flex w-full ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                            isMine
                              ? "rounded-br-md bg-emerald-600 text-white"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                          }`}
                        >
                          {user?.role === "ADMIN" && (
                            <div
                              className={`mb-1 text-xs font-black ${
                                isMine ? "text-emerald-100" : "text-slate-500"
                              }`}
                            >
                              {message.sender?.fullName || "Usuario"}
                            </div>
                          )}

                          <p className="break-words text-sm font-semibold leading-6">
                            {message.content}
                          </p>

                          <p
                            className={`mt-2 text-right text-[11px] font-semibold ${
                              isMine ? "text-emerald-100" : "text-slate-400"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {user?.role !== "ADMIN" ? (
              <div className="border-t border-slate-200 bg-white p-4">
                <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                  <input
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);

                      if (selected) {
                        socket.emit("chat:typing", {
                          conversationId: selected.id,
                          userId: currentUserId,
                        });

                        setTimeout(() => {
                          socket.emit("chat:stop_typing", {
                            conversationId: selected.id,
                            userId: currentUserId,
                          });
                        }, 1200);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    placeholder="Escribe un mensaje..."
                    className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    onClick={handleSend}
                    disabled={!content.trim()}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                    title="Enviar mensaje"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-200 bg-white p-4">
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                  Vista de auditoria: el administrador puede revisar la
                  conversacion, pero no enviar mensajes.
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

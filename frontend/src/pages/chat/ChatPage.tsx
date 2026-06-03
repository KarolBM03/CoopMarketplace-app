import { Send } from "lucide-react";
import { useEffect, useState } from "react";
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
  const location = useLocation();
  const conversationIdFromState = location.state?.conversationId;

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

  return (
    <div className="grid h-[calc(100vh-90px)] grid-cols-1 gap-4 p-6 lg:grid-cols-[360px_1fr]">
      <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="mb-5 text-2xl font-black text-slate-950">Mensajes</h1>

        <div className="grid gap-3">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelected(conversation)}
              className={`rounded-2xl border p-4 text-left transition ${
                selected?.id === conversation.id
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <p className="font-black text-slate-900">
                {conversation.product?.title || "Producto"}
              </p>

              <p className="mt-2 truncate text-sm font-medium text-slate-400">
                {conversation.messages?.[0]?.content || "Sin mensajes"}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
        {!selected ? (
          <div className="grid flex-1 place-items-center text-center">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                Selecciona una conversación
              </h2>
              <p className="mt-2 text-slate-500">
                Aquí podrás hablar con compradores o vendedores.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-black text-slate-950">
                {selected.product?.title || "Chat"}
              </h2>
              <p className="text-sm text-slate-500">
                Conversación de CoopMarket
              </p>
              {isTyping && (
                <p className="mt-1 text-xs font-semibold text-emerald-600">
                  Escribiendo...
                </p>
              )}
            </div>
            <div className="border-b p-6">
              <h2 className="text-3xl font-bold">{selected?.product?.name}</h2>

              {user?.role === "ADMIN" && (
                <div className="mt-2 text-sm text-slate-500">
                  Cliente: {selected?.buyer?.fullName}
                  {" • "}
                  Vendedor: {selected?.seller?.fullName}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100 px-6 py-5">
              <div className="mx-auto flex max-w-4xl flex-col gap-3">
                {messages.map((message) => {
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
                        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                          isMine
                            ? "rounded-br-md bg-emerald-600 text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {user?.role === "ADMIN" && (
                          <div className="mb-1 text-xs font-semibold text-slate-500">
                            {message.sender?.fullName}
                          </div>
                        )}
                        <p className="break-words text-sm font-semibold">
                          {message.content}
                        </p>

                        <p
                          className={`mt-2 text-right text-[11px] ${
                            isMine ? "text-emerald-100" : "text-slate-400"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {user?.role !== "ADMIN" && (
              <div className="flex gap-3 border-t border-slate-200 p-4">
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
                  className="h-12 flex-1 rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500"
                />

                <button
                  onClick={handleSend}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

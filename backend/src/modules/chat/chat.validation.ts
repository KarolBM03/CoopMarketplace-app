export const validateMessageContent = (content: string) => {
  const message = content.trim();

  if (!message) {
    throw new Error("El mensaje no puede estar vacío");
  }

  if (message.length > 1000) {
    throw new Error("El mensaje es demasiado largo");
  }

  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

  const linkRegex =
    /(https?:\/\/|www\.|\.com|\.net|\.org|\.io|\.do|\.app|\.dev|\.shop|\.store)/i;

  const phoneRegex =
    /(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;

  const suspiciousShortNumberRegex =
    /(mi\s*(numero|número|cel|telefono|teléfono|whatsapp|whats|wsp)|llamame|llámame|contactame|contáctame|escribeme|escríbeme).*\d{3,}/i;

  const manyDigitsRegex = /\d{1,}/;
  const numberWordsRegex =
    /(cero|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)/gi;
  if (numberWordsRegex.test(message)) {
    throw new Error("No esta permitido compartir informacion de contacto");
  }

  const socialRegex =
    /(instagram|facebook|telegram|t\.me|gmail|hotmail|outlook|yahoo|@)/i;
  if (socialRegex.test(message)) {
    throw new Error(
      "No está permitido compartir información de contacto externa",
    );
  }

  if (emailRegex.test(message)) {
    throw new Error("No está permitido compartir correos electrónicos");
  }

  if (linkRegex.test(message)) {
    throw new Error("No está permitido compartir enlaces externos");
  }

  if (
    phoneRegex.test(message) ||
    suspiciousShortNumberRegex.test(message) ||
    manyDigitsRegex.test(message)
  ) {
    throw new Error("No está permitido compartir números de teléfono");
  }

  return true;
};

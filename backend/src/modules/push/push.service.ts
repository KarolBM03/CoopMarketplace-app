import prisma from "../../config/prisma";

export const savePushToken = async ({
  userId,
  token,
  platform = "WEB",
}: {
  userId: string;
  token: string;
  platform?: string;
}) => {
  if (!token) {
    throw new Error("Token requerido");
  }

  return await prisma.pushToken.upsert({
    where: { token },
    update: {
      userId,
      platform,
    },
    create: {
      userId,
      token,
      platform,
    },
  });
};

export const getUserPushTokens = async (userId: string) => {
  return await prisma.pushToken.findMany({
    where: { userId },
  });
};

import admin from "firebase-admin";
import prisma from "../config/prisma";
import serviceAccount from "../../serviceAccountKey.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const sendPushToUser = async ({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}) => {
  const tokens = await prisma.pushToken.findMany({
    where: { userId },
  });

  if (!tokens.length) return;

  await admin.messaging().sendEachForMulticast({
    tokens: tokens.map((item) => item.token),
    notification: {
      title,
      body,
    },
  });
};

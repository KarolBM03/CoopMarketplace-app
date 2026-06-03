import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { savePushToken } from "../services/push.service";

export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey:
      "BEJ78mm7GEvLPxcRCq8DX9W2QQfTDtFk5p_SrWYX1budbRoQPiGrfZfhWuTab28OoCUjH02P73TW3oOhEYfXPgA",
  });

  if (token) {
    await savePushToken(token);
  }

  return token;
};

import api from "../api/axios";

export const savePushToken = async (token: string) => {
  const response = await api.post("/push/token", {
    token,
    platform: "WEB",
  });

  return response.data;
};

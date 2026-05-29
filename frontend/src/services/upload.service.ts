import api from "../api/axios";

export const uploadImage = async (file: File) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.imageUrl;
};

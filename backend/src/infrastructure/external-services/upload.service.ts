import cloudinary from "./cloudinary";

export const uploadImageToCloudinary = async (
  fileBuffer: Buffer,
  folder = "shipment-proofs",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("No pude subir la imagen"));
        }

        resolve(result.secure_url);
      },
    );

    stream.end(fileBuffer);
  });
};

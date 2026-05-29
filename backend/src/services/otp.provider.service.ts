import axios from "axios";

const OTP_API_URL = process.env.OTP_API_URL as string;
const OTP_API_KEY = process.env.OTP_API_KEY as string;

export const requestOTP = async (
  via: "sms" | "email" | "whatsapp",
  destination: string,
) => {
  const response = await axios.post(
    `${OTP_API_URL}/otp/request`,
    {
      via,
      destination,
    },
    {
      headers: {
        Authorization: `Bearer ${OTP_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const verifyProviderOTP = async (
  via: "sms" | "email" | "whatsapp",
  destination: string,
  code: string,
) => {
  const response = await axios.post(
    `${OTP_API_URL}/otp/verify`,
    {
      via,
      destination,
      code,
    },
    {
      headers: {
        Authorization: `Bearer ${OTP_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

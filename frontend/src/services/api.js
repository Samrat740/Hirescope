import axios from "axios";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const sendMessage = async (message, chatId, appId, isPractice, jobRole) => {
  const payload = { message };

  if (chatId) {
    payload.chat_id = chatId;
  }

  if (appId) {
    payload.app_id = appId;
  }

  if (isPractice) {
    payload.is_practice = isPractice;
  }

  if (jobRole) {
    payload.job_role = jobRole;
  }

  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${BASE_URL}/api/chat/message/`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(
    `${BASE_URL}/api/auth/profile/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
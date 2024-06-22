import axios from "axios";
import Chat from "../Chat";

interface ChatContent {
  role: string;
  message: string;
}

export const sendChat = (chat: ChatContent): Promise<ChatContent> => {
  const api_url = "https://dev.metalmental.net/api/chat";
  const requestBody = chat;
  const postConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = axios
    .post(api_url, requestBody, postConfig)
    .then((res) => {
      const response: ChatContent = res.data;
      console.log(response);
      return response;
    })
    .catch((err) => {
      console.log(err);
      throw new Error("Failed to send chat");
    });
  return response;
};

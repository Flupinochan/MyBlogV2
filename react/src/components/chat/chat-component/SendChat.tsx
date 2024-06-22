import axios from "axios";

interface ChatContent {
  role: string;
  message: string;
}

export const sendChat = async (chat: ChatContent): Promise<ChatContent> => {
  const api_url = "https://dev.metalmental.net/api/chat";
  const requestBody = chat;
  // API Gatewayのリソースポリシーで特定のヘッダーがないと拒否する設定のため注意
  // CloudFrontでヘッダーを追加する
  const postConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const response = await axios.post(api_url, requestBody, postConfig);
    return response.data;
  } catch (error) {
    console.error("Failed to send chat:", error);
    throw new Error("Failed to send chat");
  }
};

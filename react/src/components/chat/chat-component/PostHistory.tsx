import axios from "axios";

interface ChatContent {
  role: string;
  message: string;
}
interface history {
  loginid: string;
  content: ChatContent[];
}

export const PostHistory = async (hist: history) => {
  const api_url = "https://www.metalmental.net/api/posthistory";
  const requestBody = hist;
  // API Gatewayのリソースポリシーで特定のヘッダーがないと拒否する設定のため注意
  // CloudFrontでヘッダーを追加する
  const postConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const response = await axios.post(api_url, requestBody, postConfig);
    console.log(`Post History: ${response.status}`);
  } catch (error) {
    console.error("Failed to send chat:", error);
    throw new Error("Failed to send chat");
  }
};

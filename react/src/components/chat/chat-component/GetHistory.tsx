import axios from "axios";

interface ChatContent {
  role: string;
  message: string;
}

export const GetHistory = async (loginid: string): Promise<ChatContent[]> => {
  const api_url = "https://dev.metalmental.net/api/gethistory";
  const params = {
    loginid: loginid,
  };
  // API Gatewayのリソースポリシーで特定のヘッダーがないと拒否する設定のため注意
  // CloudFrontでヘッダーを追加する
  try {
    const response = await axios.get(api_url, { params: params });
    if (response.status === 200) {
      console.log("Get History: 200");
      return response.data;
    } else if (response.status === 204) {
      console.log("Get History: 204");
      return [];
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to send chat:", error);
    throw new Error("Failed to send chat");
  }
};

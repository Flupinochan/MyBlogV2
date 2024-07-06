import axios from "axios";

export const DeleteHistory = async (loginid: string) => {
  const api_url = "https://www.metalmental.net/api/deletehistory";
  const params = {
    loginid: loginid,
  };
  // API Gatewayのリソースポリシーで特定のヘッダーがないと拒否する設定のため注意
  // CloudFrontでヘッダーを追加する
  try {
    const response = await axios.delete(api_url, { params: params });
    console.log(`Delete History: ${response.status}`);
  } catch (error) {
    console.error("Failed to delete chat:", error);
    throw new Error("Failed to delete chat");
  }
};

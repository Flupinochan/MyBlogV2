import React, { useState, useRef, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession, getCurrentUser, signOut } from "aws-amplify/auth";
import { PubSub, CONNECTION_STATE_CHANGE, ConnectionState } from "@aws-amplify/pubsub";
import { Hub } from "aws-amplify/utils";
import "@aws-amplify/ui-react/styles.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

import awsconfig from "./chat-component/aws-exports";
import { GetHistory } from "./chat-component/GetHistory";
import { PostHistory } from "./chat-component/PostHistory";
import { DeleteHistory } from "./chat-component/DeleteHistory";

// https://zenn.dev/dove/articles/63494de652511c
// https://ui.docs.amplify.aws/react/connected-components/authenticator
// https://tech.route06.co.jp/entry/2024/04/08/122004
Amplify.configure(awsconfig);

interface ChatContent {
  role: string;
  message: string;
}

const Chat2: React.FC = () => {
  //////////////////////
  /// Authentication ///
  //////////////////////
  ///////////////////////
  /// サインイン後処理 ///
  ///////////////////////
  const [loginId, setLoginId] = useState<string>("");
  const getAuthenticatedUser = async () => {
    const { username, userId, signInDetails } = await getCurrentUser();
    const session = await fetchAuthSession({ forceRefresh: true });
    if (signInDetails?.loginId) {
      setLoginId(signInDetails.loginId);
    }
  };
  useEffect(() => {
    getAuthenticatedUser();
  }, []);
  // Hubで認証関連(サインアップやサインアウト)のイベントリスナーを設定可能
  Hub.listen("auth", async (data) => {
    switch (data.payload.event) {
      case "signedIn": {
        getAuthenticatedUser();
      }
    }
  });
  ///////////////////////
  /// サインアウト処理 ///
  ///////////////////////
  const signOutOnClick = () => {
    signOut();
  };
  ///////////////////////////////////////////////////
  /// Initial Setting & Websocket Recieve Message ///
  ///////////////////////////////////////////////////
  const [displayText, setDisplayText] = useState<ChatContent[]>([]);
  const [tmpClaude, setTmpClaude] = useState<ChatContent[]>([]);
  const [tmpGPT, setTmpGPT] = useState<ChatContent[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wsStatus, setWsStatus] = useState<WebSocket | null>(null);
  const [pendingMessage, setPendingMessage] = useState<ChatContent | null>(null);
  const [pendingPostHistory, setPendingPostHistory] = useState<boolean>(false);
  const [isTrue, setIsTrue] = useState<boolean>(true);
  useEffect(() => {
    const wsURL = "wss://www.metalmental.net/websocket/";
    const initWebSocket = () => {
      const ws = new WebSocket(wsURL);

      ws.onopen = (event) => {
        console.log("WebSocket connection opened");
      };
      ws.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.message !== "Endpoint request timed out") {
          if (data.role === "claude") {
            setTmpClaude((prev) => {
              if (prev.length > 0 && prev[prev.length - 1].role === data.role) {
                return [
                  ...prev.slice(0, prev.length - 1),
                  {
                    role: data.role,
                    message: prev[prev.length - 1].message + data.message,
                  },
                ];
              } else {
                return [...prev, data];
              }
            });
          } else if (data.role === "gpt") {
            setTmpGPT((prev) => {
              if (prev.length > 0 && prev[prev.length - 1].role === data.role) {
                return [
                  ...prev.slice(0, prev.length - 1),
                  {
                    role: data.role,
                    message: prev[prev.length - 1].message + data.message,
                  },
                ];
              } else {
                return [...prev, data];
              }
            });
          }
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket connection closed");
        setWsStatus(null);
        wsStatus?.close();
        setTimeout(initWebSocket, 1000);
      };
      setWsStatus(ws);
      return () => {
        ws.close();
      };
    };
    initWebSocket();
    ///////////////////
    /// Get History ///
    ///////////////////
    if (loginId !== "") {
      const getChatHistory = async () => {
        try {
          const response = await GetHistory(loginId);
          setDisplayText(response);
        } catch (error) {
          console.error("Failed to get chat history:", error);
        }
      };
      getChatHistory();
      console.log("loginId: ", loginId);
    }
  }, [loginId]); // loginIdが取得できたら実行する

  ////////////////////
  /// Send Message ///
  ////////////////////
  useEffect(() => {
    if (pendingMessage && displayText.length > 0 && displayText[displayText.length - 1].role === "user") {
      const sendMessages = async () => {
        // Claude向けメッセージ作成（全てのroleを"claude"に変更）
        const claudeMessages = displayText.map((item, index, array) => (index === array.length - 1 ? { ...item, role: "claude" } : item));
        const gptMessages = displayText.map((item, index, array) => (index === array.length - 1 ? { ...item, role: "gpt" } : item));

        // Claude向けメッセージ送信
        await wsStatus?.send(JSON.stringify(claudeMessages));

        // GPT向けメッセージ送信
        await wsStatus?.send(JSON.stringify(gptMessages));

        // 送信完了後、pendingMessageをクリア(配列にuserのメッセージが追加されても送信されない)
        setPendingMessage(null);
      };

      sendMessages();
    }
  }, [displayText, pendingMessage]);

  ////////////////////
  /// Post History ///
  ////////////////////
  useEffect(() => {
    if (pendingPostHistory) {
      const postChatHistory = async () => {
        const postHistoryChat = {
          loginid: loginId,
          content: displayText,
        };
        await PostHistory(postHistoryChat);
        await setPendingPostHistory(false);
      };
      postChatHistory();
    }
  }, [pendingPostHistory]);

  //////////////////////////////////
  /// Send Click -> Send Message ///
  //////////////////////////////////
  const sendChatOnClick = () => {
    if (textareaRef.current) {
      const message = textareaRef.current.value;
      if (message !== "") {
        const dataJson: ChatContent = {
          role: "user",
          message: message,
        };
        setIsTrue(false);

        setDisplayText((prev) => [...prev, { ...dataJson, role: "user" }]);

        // pendingMessageを設定(assistantメッセージが追加されてもuseEffectで送信されないように)
        setPendingMessage(dataJson);

        textareaRef.current.value = "";
      }
    }
  };

  ///////////////////////////////////
  /// Merge Array -> Post History ///
  ///////////////////////////////////
  const [claudeCount, setClaudeCount] = useState<number>(0);
  const [gptCount, setGptCount] = useState<number>(0);
  const mergeClaude = () => {
    const updatedArray = tmpClaude.map((item) => ({ ...item, role: "assistant" }));
    setDisplayText((prev) => [...prev, ...updatedArray]);
    setTmpClaude([]);
    setTmpGPT([]);
    setClaudeCount((prev) => prev + 1);
    setIsTrue(true);
    setPendingPostHistory(true);
  };
  const mergeGPT = () => {
    const updatedArray = tmpGPT.map((item) => ({ ...item, role: "assistant" }));
    setDisplayText((prev) => [...prev, ...updatedArray]);
    setTmpGPT([]);
    setTmpClaude([]);
    setGptCount((prev) => prev + 1);
    setIsTrue(true);
    setPendingPostHistory(true);
  };
  ///////////////////////////
  /// Delete Chat History ///
  ///////////////////////////
  const deleteChatOnClick = () => {
    setDisplayText([]);
    DeleteHistory(loginId);
  };

  ///////////////
  /// Display ///
  ///////////////
  return (
    <Authenticator>
      <div className="p-10">
        <div className="flex">
          <div className="flex">
            <p className="pr-2 text-purple-500">{loginId}</p>
            <p className="pr-10">さん　こんにちは!!</p>
          </div>
          <p className="text-2xl">
            <span className="whitespace-nowrap green-base">Claude</span> VS <span className="amber-base pr-10">Chat GPT</span>
          </p>
        </div>
        <div className="p-2" />
        <div className="flex">
          <p className="w-1/2 green-base">Claudeの選ばれた回数 {claudeCount}</p>
          <p className="amber-base">Chat GPTの選ばれた回数 {gptCount}</p>
        </div>
        <div className="p-2" />
        <Textarea color="primary" ref={textareaRef} placeholder="メッセージを入力する" variant="bordered" minRows={1} className="max-w-md" />
        <div className="p-2" />
        <Button color="primary" variant="ghost" onClick={sendChatOnClick} isLoading={!isTrue} className="mr-10">
          送信
        </Button>
        <Button color="primary" variant="ghost" onClick={deleteChatOnClick} isLoading={!isTrue} className="mr-10">
          履歴削除
        </Button>
        <Button color="primary" variant="ghost" onClick={signOutOnClick} isLoading={!isTrue}>
          サインアウト
        </Button>
        <div className="p-2" />
        {displayText &&
          displayText.length > 0 &&
          displayText.map((chat, index) => (
            <div key={index}>
              {/* Roleが前回と異なる場合、roleを表示 */}
              {index === 0 || chat.role !== displayText[index - 1].role ? <p className={chat.role === "user" ? "blue-base" : "red-base"}>{chat.role}</p> : null}
              {/* <p className={chat.role === "user" ? "text-blue-500 border-blue-500 border-b-1" : "text-red-500 border-red-500 border-b-1"}>{chat.message}</p> */}
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]} className={chat.role === "user" ? "prose md:prose-lg lg:prose-xl blue-base border-b-1 text-blue-500 border-blue-500" : "prose md:prose-lg lg:prose-xl red-base border-b-1 text-red-500 border-red-500"}>
                {chat.message}
              </ReactMarkdown>
            </div>
          ))}
        <div className="flex">
          {tmpClaude &&
            tmpClaude.length > 0 &&
            tmpClaude.map((chat, index) => (
              <div key={index} className="green-base text-green-500 w-1/2">
                {chat.role === "claude" && (
                  <>
                    {index === 0 || chat.role !== tmpClaude[index - 1]?.role ? <p>{chat.role}</p> : null}
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]} className="prose md:prose-lg lg:prose-xl green-base border-b-1 text-green-500 border-green-500">
                      {chat.message}
                    </ReactMarkdown>
                    <div className="p-2" />
                    <Button className="green-base text-green-500 border-green-500" variant="ghost" onClick={mergeClaude}>
                      Claudeを選ぶ
                    </Button>
                  </>
                )}
              </div>
            ))}
          {tmpGPT &&
            tmpGPT.length > 0 &&
            tmpGPT.map((chat, index) => (
              <div key={index} className="amber-base w-1/2 ml-auto">
                {chat.role === "gpt" && (
                  <>
                    {index === 0 || chat.role !== tmpGPT[index - 1]?.role ? <p>{chat.role}</p> : null}
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]} className="prose md:prose-lg lg:prose-xl amber-base border-b-1 text-amber-400 border-amber-400">
                      {chat.message}
                    </ReactMarkdown>
                    <div className="p-2" />
                    <Button className="amber-base text-amber-400 border-amber-400" variant="ghost" onClick={mergeGPT}>
                      Chat GPTを選ぶ
                    </Button>
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
    </Authenticator>
  );
};

export default Chat2;

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
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
  const [loginId, setLoginId] = useState<string>("");
  useEffect(() => {
    getAuthenticatedUser();
  }, []);
  const getAuthenticatedUser = async () => {
    const { username, userId, signInDetails } = await getCurrentUser();
    const session = await fetchAuthSession({ forceRefresh: true });
    if (signInDetails?.loginId) {
      setLoginId(signInDetails.loginId);
      console.log("loginId: ", loginId);
    }
  };

  /////////////////////////////////
  /// Websocket Recieve Message ///
  /////////////////////////////////
  const [displayText, setDisplayText] = useState<ChatContent[]>([]);
  const [tmpClaude, setTmpClaude] = useState<ChatContent[]>([]);
  const [tmpGPT, setTmpGPT] = useState<ChatContent[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wsStatus, setWsStatus] = useState<WebSocket | null>(null);
  const [pendingMessage, setPendingMessage] = useState<ChatContent | null>(null);
  const [pendingPostHistory, setPendingPostHistory] = useState<boolean>(false);
  const [isTrue, setIsTrue] = useState<boolean>(true);
  useEffect(() => {
    const wsURL = "wss://dev.metalmental.net/websocket/";
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
    const getChatHistory = async () => {
      try {
        const response = await GetHistory(loginId);
        setDisplayText(response);
      } catch (error) {
        console.error("Failed to get chat history:", error);
      }
    };
    getChatHistory();
    console.log("Get History: ");
    console.log(`${displayText}`);
    console.log("displayTextの型:", typeof displayText);
  }, []);

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
    ////////////////////
    /// Post History ///
    ////////////////////
    if (pendingPostHistory) {
      console.log("Post History:");
      console.log(`${displayText}`);
      const postHistoryChat = {
        loginid: loginId,
        content: displayText,
      };
      PostHistory(postHistoryChat);
      setPendingPostHistory(false);
    }
  }, [displayText, pendingMessage, wsStatus]);

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

  ///////////////////
  /// Merge Array ///
  ///////////////////
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
  ///////////////
  /// Display ///
  ///////////////
  return (
    <Authenticator>
      <div className="p-10">
        <div className="flex">
          <p className="pr-10">{loginId} さん　こんにちは!!</p>
          <p className="text-2xl">
            <span className="whitespace-nowrap text-green-500">Claude</span> VS <span className="text-amber-400">Chat GPT</span>
          </p>
        </div>
        <div className="p-2" />
        <div className="flex">
          <p className="w-1/2 text-green-500">Claudeの選ばれた回数 {claudeCount}</p>
          <p className="text-amber-400">Chat GPTの選ばれた回数 {gptCount}</p>
        </div>
        <div className="p-2" />
        <Textarea color="primary" ref={textareaRef} placeholder="メッセージを入力する" variant="bordered" minRows={1} className="max-w-md" />
        <div className="p-2" />
        <Button color="primary" variant="ghost" onClick={sendChatOnClick} isLoading={!isTrue}>
          送信
        </Button>
        <div className="p-2" />
        {displayText &&
          displayText.length > 0 &&
          displayText.map((chat, index) => (
            <div key={index}>
              {/* Roleが前回と異なる場合、roleを表示 */}
              {index === 0 || chat.role !== displayText[index - 1].role ? <p className={chat.role === "user" ? "text-blue-500" : "text-red-500"}>{chat.role}</p> : null}
              {/* <p className={chat.role === "user" ? "text-blue-500 border-blue-500 border-b-1" : "text-red-500 border-red-500 border-b-1"}>{chat.message}</p> */}
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]} className={chat.role === "user" ? "prose md:prose-lg lg:prose-xl text-blue-500 border-blue-500 border-b-1" : "red-base prose md:prose-lg lg:prose-xl text-red-500 border-red-500 border-b-1"}>
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
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]} className="prose md:prose-lg lg:prose-xl text-green-500 border-green-500 border-b-1">
                      {chat.message}
                    </ReactMarkdown>
                    <div className="p-2" />
                    <Button className="text-green-500 border-green-500" variant="ghost" onClick={mergeClaude}>
                      Claudeを選ぶ
                    </Button>
                  </>
                )}
              </div>
            ))}
          {tmpGPT &&
            tmpGPT.length > 0 &&
            tmpGPT.map((chat, index) => (
              <div key={index} className="amber-base text-amber-500 w-1/2 ml-auto">
                {chat.role === "gpt" && (
                  <>
                    {index === 0 || chat.role !== tmpGPT[index - 1]?.role ? <p>{chat.role}</p> : null}
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]} className="prose md:prose-lg lg:prose-xl text-amber-500 border-amber-500 border-b-1">
                      {chat.message}
                    </ReactMarkdown>
                    <div className="p-2" />
                    <Button className="text-amber-500 border-amber-500" variant="ghost" onClick={mergeGPT}>
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

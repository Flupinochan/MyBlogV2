import React, { useState, useRef, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { PubSub, CONNECTION_STATE_CHANGE, ConnectionState } from "@aws-amplify/pubsub";
import { Hub } from "aws-amplify/utils";
import "@aws-amplify/ui-react/styles.css";

import { sendChat } from "./chat-component/SendChat";
import awsconfig from "./chat-component/aws-exports";
import pubsubconfig from "./chat-component/pubsub-config";

// https://zenn.dev/dove/articles/63494de652511c
// https://ui.docs.amplify.aws/react/connected-components/authenticator
// https://tech.route06.co.jp/entry/2024/04/08/122004
Amplify.configure(awsconfig);
// https://docs.amplify.aws/gen1/react/build-a-backend/more-features/pubsub
const pubsub = new PubSub({
  region: pubsubconfig.region,
  endpoint: pubsubconfig.endpoint,
  clientId: pubsubconfig.clientId,
});

interface ChatContent {
  role: string;
  message: string;
}

const Chat: React.FC = () => {
  // 認証情報取得
  const [userName, setUserName] = useState<string>(""); // ユーザ名はTopic名にする
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    getAuthenticatedUser();
  }, []);
  const getAuthenticatedUser = async () => {
    const { username, userId, signInDetails } = await getCurrentUser();
    const session = await fetchAuthSession({ forceRefresh: true });
    setUserName(username);
    setSession(session);
    if (userName && session.tokens && session.credentials) {
      console.log(session.identityId);
    //   console.log("username", username);
    //   console.log("accessKey", session.credentials.accessKeyId);
    //   console.log("secretKey", session.credentials.secretAccessKey);
    //   console.log("sessionToken", session.credentials.sessionToken);
    //   console.log("id token", session.tokens.idToken);
    //   console.log("access token", session.tokens.accessToken);
    } else {
      console.error("Session are undefined");
    }
  };

  // Chat送信
  const [displayText, setDisplayText] = useState<ChatContent[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendChatOnClick = async () => {
    if (textareaRef.current) {
      try {
        const chat = {
          role: "user",
          message: textareaRef.current.value,
        };
        setDisplayText((prev) => [...prev, chat]);
        const response = await sendChat(chat);
        setDisplayText((prev) => [...prev, response]);
      } catch (error) {
        console.error("Failed to send chat:", error);
      }
    }
  };
  // IoTメッセージ受信
  const [message, setMessage] = useState<string>("");
  useEffect(() => {
    const sub = pubsub.subscribe({ topics: "test" }).subscribe({
      next: (data) => {
        setMessage(data.msg as string);
        console.log("Message received", data);
      },
      error: (error) => console.error(error),
      complete: () => console.log("Done"),
    });
    // sub.unsubscribe();
    return () => {
      sub.unsubscribe();
    };
  }, [userName]);
  // IoTメッセージの送信
  const pub = async () => {
    try {
      await pubsub.publish({ topics: "test", message: { msg: "Hello to all subscribers!" } });
      console.log("Published message");
    } catch (e) {
      console.log(e);
    }
  };
  // IoTセッションの確認
  useEffect(() => {
    Hub.listen("pubsub", (data: any) => {
      const { payload } = data;
      if (payload.event === CONNECTION_STATE_CHANGE) {
        const connectionState = payload.data.connectionState as ConnectionState;
        console.log(connectionState);
      }
    });
  }, []);

  return (
    <Authenticator>
      <div className="p-10">
        <Button color="primary" variant="ghost" onClick={pub}>
          送信
        </Button>
        <p>{message}</p>
        <div className="p-2" />
        <Textarea color="primary" ref={textareaRef} placeholder="メッセージを入力する" variant="bordered" minRows={1} className="max-w-md" />
        <div className="p-2" />
        <Button color="primary" variant="ghost" onClick={sendChatOnClick}>
          送信
        </Button>
        <div className="p-2" />
        {displayText.map((chat, index) => (
          <div key={index}>
            <p className={chat.role === "user" ? "text-blue-500" : "text-red-500"}>{chat.role}</p>
            <p className={chat.role === "user" ? "text-blue-500" : "text-red-500"}>{chat.message}</p>
          </div>
        ))}
      </div>
    </Authenticator>
  );
};

export default Chat;

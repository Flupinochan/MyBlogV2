import React, { useState, useRef } from "react";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";

import { sendChat } from "./chat-component/SendChat";

interface ChatContent {
  role: string;
  message: string;
}

const Chat: React.FC = () => {
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

  return (
    <div className="p-10">
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
  );
};

export default Chat;

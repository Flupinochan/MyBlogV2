import axios from "axios";
import React, { useState } from "react";
import { Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import SendIcon from "@mui/icons-material/Send";
import H2 from "./tool/H2";

const Akaricchan = "/images/home/akaricchan.png";

const Contact: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSubmit = () => {
    setErrorMessage("");
    setIsLoading(true);

    if (name && email && message) {
      const postData = {
        name: name,
        email: email,
        message: message,
      };
      const postConfig = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const url = "https://www.metalmental.net/api/ses";
      axios
        .post(url, postData, postConfig)
        .then((res) => {
          setErrorMessage("送信しました");
          setShowModal(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error sending message:", err);
          setErrorMessage("送信に失敗しました");
          setShowModal(true);
          setIsLoading(false);
        });
    } else {
      setErrorMessage("空欄があります");
      setShowModal(true);
      setIsLoading(false);
    }
  };

  const renderContactForm = (isDesktop: boolean) => (
    <div className={`${isDesktop ? "my-10 pt-3 pb-5 pl-12" : "my-10 pt-3 pb-5"} text-primary`}>
      <div>
        <Input className={`${isDesktop ? "w-[200px]" : "w-[290px]"} pb-14`} value={name} onChange={(e) => setName(e.target.value)} variant="underlined" size="lg" color="primary" placeholder="Enter your name" />
      </div>
      <div>
        <Input className={`${isDesktop ? "w-[200px]" : "w-[290px]"} pb-20`} value={email} onChange={(e) => setEmail(e.target.value)} variant="underlined" size="lg" color="primary" placeholder="Enter your email" />
      </div>
      <div>
        <Textarea className={`${isDesktop ? "w-[400px]" : "w-[290px]"} pb-20`} value={message} onChange={(e) => setMessage(e.target.value)} variant="bordered" labelPlacement="outside" minRows={2} placeholder="Enter your message" size="lg" color="primary" />
      </div>
      <div>
        <Button className="text-xl px-4 py-6" onClick={handleSubmit} color="primary" radius="none" variant="ghost" endContent={<SendIcon />} isLoading={isLoading}>
          Send
        </Button>
      </div>
    </div>
  );

  return (
    <div id="contact">
      {/* md以上 */}
      <div className="hidden md:block pt-16 pb-10 px-28">
        <H2 text="Contact" />
        <div className="flex flex-row">
          {renderContactForm(true)}
          <div className="ml-auto">
            <img src={Akaricchan} alt="Akaricchan.png" />
          </div>
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden justify-center py-10 px-10" id="contact2">
        <H2 text="Contact" />
        {renderContactForm(false)}
      </div>

      {/* Modal for displaying messages */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>メッセージ</ModalHeader>
          <ModalBody>
            <p>{errorMessage}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowModal(false)}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Contact;

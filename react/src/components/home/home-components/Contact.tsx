import axios from "axios";
import React, { useState } from "react";
import { Button, Input, Textarea, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import SendIcon from "@mui/icons-material/Send";
import H2 from "./tool/H2";

const Akaricchan = "/images/home/akaricchan.png";

const Contact: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);

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
          setShowPopup(true);
          setIsLoading(false);
        })
        .catch((err) => {
          setErrorMessage("送信に失敗しました");
          setShowPopup(true);
          setIsLoading(false);
        });
    } else {
      setErrorMessage("空欄があります");
      setShowPopup(true);
      setIsLoading(false);
    }
  };

  return (
    <div id="contact">
      {/* md以上 */}
      <div className="hidden md:block pt-16 pb-10 px-28">
        <H2 text="Contact" />
        <div className="flex flex-row">
          <div className="my-10 pt-3 pb-5 pl-12 text-primary">
            <div>
              <Input className="w-[200px] pb-14" value={name} onChange={(e) => setName(e.target.value)} variant="underlined" size="lg" color="primary" placeholder="Enter your name" />
            </div>
            <div>
              <Input className="w-[200px] pb-20" value={email} onChange={(e) => setEmail(e.target.value)} variant="underlined" size="lg" color="primary" placeholder="Enter your email" />
            </div>
            <div>
              <Textarea className="w-[400px] pb-20" value={message} onChange={(e) => setMessage(e.target.value)} variant="bordered" labelPlacement="outside" minRows={2} placeholder="Enter your message" size="lg" color="primary" />
            </div>
            <div>
              <Popover isOpen={showPopup} onOpenChange={(open) => setShowPopup(open)}>
                <PopoverTrigger>
                  <Button className="text-xl px-4 py-6" onClick={handleSubmit} color="primary" radius="none" variant="ghost" endContent={<SendIcon />} isLoading={isLoading}>
                    Send
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="px-1 py-2">
                    <div className="text-small font-bold">{errorMessage}</div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="ml-auto">
            <img src={Akaricchan} alt="Akaricchan.png" />
          </div>
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden justify-center py-10 px-10" id="contact2">
        <H2 text="Contact" />
        <div className="my-10 pt-3 pb-5 text-primary">
          <div>
            <Input className="w-[290px] pb-14" value={name} onChange={(e) => setName(e.target.value)} variant="underlined" size="lg" color="primary" placeholder="Enter your name" />
          </div>
          <div>
            <Input className="w-[290px] pb-20" value={email} onChange={(e) => setEmail(e.target.value)} variant="underlined" size="lg" color="primary" placeholder="Enter your email" />
          </div>
          <div>
            <Textarea className="w-[290px] pb-20" value={message} onChange={(e) => setMessage(e.target.value)} variant="bordered" labelPlacement="outside" minRows={2} placeholder="Enter your message" size="lg" color="primary" />
          </div>
          <div>
            <Popover isOpen={showPopup} onOpenChange={(open) => setShowPopup(open)}>
              <PopoverTrigger>
                <Button className="text-xl px-4 py-6" onClick={handleSubmit} color="primary" radius="none" variant="ghost" endContent={<SendIcon />} isLoading={isLoading}>
                  Send
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="px-1 py-2">
                  <div className="text-small font-bold">{errorMessage}</div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import React from "react";
import { Button, Input, Textarea } from "@nextui-org/react";
import SendIcon from "@mui/icons-material/Send";

import H2 from "./tool/H2";

const Contact: React.FC = () => {
  return (
    <div id="contact">
      {/* md以上 */}
      <div className="hidden md:block pt-16 pb-10 px-28">
        <H2 text="Contact" />
        <div className="my-10 pt-3 pb-5 pl-12 text-primary">
          <div data-aos="fade-in" data-aos-offset="200">
            <Input className="w-[200px] pb-14" variant="underlined" size="lg" color="primary" placeholder="Enter your name" />
          </div>
          <div data-aos="fade-in" data-aos-offset="200">
            <Input className="w-[200px] pb-20" variant="underlined" size="lg" color="primary" placeholder="Enter your email" />
          </div>
          <div data-aos="fade-in" data-aos-offset="200">
            <Textarea className="w-[400px] pb-20" variant="bordered" labelPlacement="outside" minRows={2} placeholder="Enter your message" size="lg" color="primary" />
          </div>
          <div data-aos="fade-in" data-aos-offset="200">
            <Button className="text-xl px-4 py-6" color="primary" radius="none" variant="ghost" endContent={<SendIcon />}>
              Send
            </Button>
          </div>
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden justify-center py-10 px-10">
        <H2 text="Contact" />
        <div className="my-10 pt-3 pb-5 text-primary">
          <div data-aos="fade-in" data-aos-offset="100">
            <Input className="w-[290px] pb-14" variant="underlined" size="lg" color="primary" placeholder="Enter your name" />
          </div>
          <div data-aos="fade-in" data-aos-offset="100">
            <Input className="w-[290px] pb-20" variant="underlined" size="lg" color="primary" placeholder="Enter your email" />
          </div>
          <div data-aos="fade-in" data-aos-offset="100">
            <Textarea className="w-[290px] pb-20" variant="bordered" labelPlacement="outside" minRows={2} placeholder="Enter your message" size="lg" color="primary" />
          </div>
          <div data-aos="fade-in" data-aos-offset="100">
            <Button className="text-xl px-4 py-6" color="primary" radius="none" variant="ghost" endContent={<SendIcon />}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

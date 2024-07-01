import React from "react";
import { Button, Input, Textarea } from "@nextui-org/react";
import SendIcon from "@mui/icons-material/Send";

import H2 from "./tool/H2";
import Akaricchan from "./img/akaricchan.png";

const Contact: React.FC = () => {
  return (
    <div id="contact">
      {/* md以上 */}
      <div className="hidden md:flex pt-16 pb-10 px-28">
        <div>
          <H2 text="Contact" />
          <div className="my-10 pt-3 pb-5 pl-12 text-primary">
            <div data-aos="fade-in" data-aos-offset="250">
              <Input className="w-[200px] pb-14" variant="underlined" size="lg" color="primary" placeholder="Enter your name" />
            </div>
            <div data-aos="fade-in" data-aos-offset="250">
              <Input className="w-[200px] pb-20" variant="underlined" size="lg" color="primary" placeholder="Enter your email" />
            </div>
            <div data-aos="fade-in" data-aos-offset="250">
              <Textarea className="w-[400px] pb-20" variant="bordered" labelPlacement="outside" minRows={2} placeholder="Enter your message" size="lg" color="primary" />
            </div>
            <div data-aos="fade-in" data-aos-offset="250">
              <Button className="text-xl px-4 py-6" color="primary" radius="none" variant="ghost" endContent={<SendIcon />}>
                Send
              </Button>
            </div>
          </div>
        </div>
        <div className="ml-auto">
          <img src={Akaricchan} alt="Akaricchan.png" />
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden justify-center py-10 px-10" id="contact2">
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

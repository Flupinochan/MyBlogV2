import React from "react";
import { Link as Link2 } from "react-router-dom";
import { Link, Button } from "@nextui-org/react";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

import H2 from "./tool/H2";
import CButton from "./tool/CButton";
import { Rocket } from "@mui/icons-material";
const BlogImg = "/images/home/blog_img.jpg";
const YoutubeImg = "/images/home/youtube_img.jpg";

const Content: React.FC = () => {
  return (
    <div>
      {/* md以上 */}
      <div className="hidden md:block pt-16 pb-24 px-28">
        <H2 text="Content" />
        <div className="flex">
          <div className="flex flex-col pr-10">
            <div data-aos="fade-in" data-aos-offset="250">
              <p className="py-10 text-3xl">Blog</p>
              <img className="w-[700px]" src={BlogImg} alt="blog.jpg" />
            </div>
            <div data-aos="fade-in" data-aos-offset="250">
              <p className="font-thin pt-4">2024-01-28</p>
              <p className="py-6">AWS SAMを使用したCI/CDの解説</p>
              <Link2 to="blog">
                <div className="flex flex-row cursor-pointer border-1 border-primary text-primary w-36 p-3 justify-center text-center items-center transition duration-300 hover:bg-primary hover:text-white">
                  <p className="pr-2">Go Blog</p>
                  <RocketLaunchIcon />
                </div>
              </Link2>
            </div>
          </div>
          <div className="flex flex-col pr-10">
            <div data-aos="fade-in" data-aos-offset="250">
              <p className="py-10 text-3xl">Youtube</p>
              <img className="w-[645px]" src={YoutubeImg} alt="blog.jpg" />
            </div>
            <div data-aos="fade-in" data-aos-offset="250">
              <p className="font-thin pt-4">2023-11-01</p>
              <p className="py-6">ECS Blue/Green Deploymentについてのゆっくり実況</p>
              <Button className="text-xl w-44 px-4 py-6" href="https://www.youtube.com/@Flupinochan" as={Link} isExternal={true} color="primary" radius="none" variant="ghost" endContent={<RocketLaunchIcon />}>
                Go Youtube
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden pt-10 pb-20 pl-10 pr-7 text-xl">
        <H2 text="Content" />
        <div className="flex flex-col">
          <div className="flex flex-col pr-10 pb-10">
            <div data-aos="fade-in" data-aos-offset="200">
              <p className="py-6 text-2xl">Blog</p>
              <img className="w-[700px]" src={BlogImg} alt="blog.jpg" />
            </div>
            <div data-aos="fade-in" data-aos-offset="200">
              <p className="font-thin pt-4">2024-01-28</p>
              <p className="py-6">AWS SAMを使用したCI/CDの解説</p>
              <Link2 to="blog">
                <div className="flex flex-row cursor-pointer border-1 border-primary text-primary w-36 p-3 justify-center text-center items-center transition duration-300 hover:bg-primary hover:text-white">
                  <p className="pr-2">Go Blog</p>
                  <RocketLaunchIcon />
                </div>
              </Link2>
            </div>
          </div>
          <div className="flex flex-col pr-10">
            <div data-aos="fade-in" data-aos-offset="200">
              <p className="py-6 text-2xl">Youtube</p>
              <img className="w-[645px]" src={YoutubeImg} alt="blog.jpg" />
            </div>
            <div data-aos="fade-in" data-aos-offset="200">
              <p className="font-thin pt-4">2023-11-01</p>
              <p className="py-6">ECS Blue/Green Deploymentについてのゆっくり実況</p>
              <Button className="text-xl w-44 px-4 py-6" href="https://www.youtube.com/@Flupinochan" as={Link} isExternal={true} color="primary" radius="none" variant="ghost" endContent={<RocketLaunchIcon />}>
                Go Youtube
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;

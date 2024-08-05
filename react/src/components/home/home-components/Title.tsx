import React from "react";
import { Link as Scroll } from "react-scroll";
import { Link, Button } from "@nextui-org/react";
// import { Button } from "@nextui-org/button";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

import CButton from "./tool/CButton";
import CButton2 from "./tool/CButton2";

const titleImage = "/images/home/title_img.png";

const Title: React.FC = () => {
  return (
    <div>
      {/* md以上 */}
      <div className="hidden md:block">
        <div className="flex justify-center pt-20 px-10">
          <div className="flex flex-col pt-24 pr-4">
            <p className="text-5xl font-bold leading-snug">
              <span className="text-primary">MetalMental</span> is a <span className="text-primary">Full-Stack</span> and <span className="text-primary">SRE</span> engineer
            </p>
            <p className="pt-10 leading-relaxed">フロントエンドからバックエンド、インフラまで手掛けるメタルなメンタルを持つエンジニアです</p>
            <div className="mt-auto pt-10 pb-32">
              <CButton />
            </div>
            <div className="flex flex-row pb-10 ml-auto">
              <div className="p-3 mr-4 border-1 border-primary" />
              <p className="leading-relaxed">
                Currently working on <span className="text-primary font-bold">generative AI </span>
              </p>
            </div>
          </div>
          <img src={titleImage} alt="title" />
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden justify-center">
        <div className="flex flex-col items-center pt-5 px-10">
          <p className="text-2xl pt-5">
            <span className="text-primary leading-snug">MetalMental</span> is a <span className="text-primary">Full-Stack</span> and <span className="text-primary">SRE</span> engineer
          </p>
          <p className="pt-10 leading-relaxed text-sm">フロントエンドからバックエンド、インフラまで手掛けるメタルなメンタルを持つエンジニアです</p>
          <img className="pt-20" src={titleImage} alt="title" id="title" />
          <div data-aos="fade-in">
            <CButton2 />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Title;

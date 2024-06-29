import React from "react";
import { Link as Scroll } from "react-scroll";
import { Link, Button } from "@nextui-org/react";
// import { Button } from "@nextui-org/button";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

import TitleImg from "./img/title_img.png";
import CButton from "./tool/CButton";

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
          <img src={TitleImg} alt="title" />
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden justify-center">
        <div className="flex flex-col items-center pt-5 px-10">
          <p className="text-5xl pt-5">
            <span className="text-primary leading-snug">MetalMental</span> is a <span className="text-primary">Full-Stack</span> and <span className="text-primary">SRE</span> engineer
          </p>
          <p className="pt-10 leading-relaxed">フロントエンドからバックエンド、インフラまで手掛けるゴッドハンドエンジニアです</p>
          <img className="pt-20" src={TitleImg} alt="title" />
          <CButton />
        </div>
      </div>
    </div>
  );
};

export default Title;

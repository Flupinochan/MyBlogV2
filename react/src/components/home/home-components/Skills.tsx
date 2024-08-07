import React from "react";
import "aos/dist/aos.css";

import H2 from "./tool/H2";
import { TypeScript } from "./tool/TypeScript";
import { PyIcon } from "./tool/PyIcon";
import { AWS } from "./tool/AWS";
import SkillSet from "./tool/SkillSet";
import SkillSet2 from "./tool/SkillSet2";

const Skills: React.FC = () => {
  return (
    <div>
      {/* md以上 */}
      <div className="hidden md:block py-16 px-28">
        <H2 text="Skills" />
        <div data-aos="fade-in" data-aos-offset="250">
          <SkillSet colorType="blue" icon={<TypeScript />} text1="Frontend" text2="Figma" text3="Next.js" text4="Tailwind CSS" text5="Reactを使用してモダンなWebアプリケーションを作成します" />
        </div>
        <div data-aos="fade-in" data-aos-offset="250">
          <SkillSet colorType="yellow" icon={<PyIcon />} text1="Backend" text2="Flask" text3="GraphQL" text4="Generative AI" text5="テキスト生成や画像生成、RAGなどのトレンド技術を使用します" />
        </div>
        <div data-aos="fade-in" data-aos-offset="250">
          <SkillSet colorType="red" icon={<AWS />} text1="Infrastructure" text2="AWS" text3="VMware" text4="Docker" text5="コンテナやサーバレス、IaCおよびCI/CDを用いた環境構築をします" />
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden justify-bottom py-10 px-10">
        <H2 text="Skills" />
        <div data-aos="fade-in" data-aos-offset="100">
          <SkillSet2 colorType="blue" icon={<TypeScript />} text1="Frontend" text2="Figma" text3="Next.js" text4="Tailwind CSS" text5="Reactを使用してモダンなWebアプリケーションを作成します" />
        </div>
        <div data-aos="fade-in" data-aos-offset="100">
          <SkillSet2 colorType="yellow" icon={<PyIcon />} text1="Backend" text2="Flask" text3="GraphQL" text4="Generative AI" text5="テキスト生成や画像生成、RAGなどのトレンド技術を使用します" />
        </div>
        <div data-aos="fade-in" data-aos-offset="100">
          <SkillSet2 colorType="red" icon={<AWS />} text1="Infrastructure" text2="AWS" text3="VMware" text4="Docker" text5="コンテナやサーバレス、IaCおよびCI/CDを用いた環境構築をします" />
        </div>
        <div data-aos="fade-in"></div>
      </div>
    </div>
  );
};

export default Skills;

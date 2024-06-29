import React from "react";

import H2 from "./tool/H2";
import { TypeScript } from "./tool/TypeScript";
import { Python } from "./tool/Python";
import { AWS } from "./tool/AWS";
import SkillSet from "./tool/SkillSet";
import SkillSet2 from "./tool/SkillSet2";

const Skills: React.FC = () => {
  return (
    <div>
      {/* md以上 */}
      <div className="hidden md:block py-16 px-28">
        <H2 text="Skills" />
        <SkillSet colorType="blue" icon={<TypeScript />} text1="Frontend" text2="Figma" text3="TypeScript" text4="Tailwind CSS" text5="Reactを使用してモダンなWebアプリケーションを作成します" />
        <SkillSet colorType="yellow" icon={<Python />} text1="Backend" text2="Python" text3="SQL" text4="Generative AI" text5="NoSQLやGenerativeAIなどのトレンド技術を使用します" />
        <SkillSet colorType="red" icon={<AWS />} text1="Infrastructure" text2="AWS" text3="VMware" text4="Docker" text5="コンテナやサーバレスアーキテクチャの設計、IaCおよびCI/CDを用いた環境構築をします" />
      </div>
      {/* md以下 */}
      <div className="md:hidden justify-center py-10 px-10">
        <H2 text="Skills" />
        <SkillSet2 colorType="blue" icon={<TypeScript />} text1="Frontend" text2="Figma" text3="TypeScript" text4="Tailwind CSS" text5="Reactを使用してモダンなWebアプリケーションを作成します" />
        <SkillSet2 colorType="yellow" icon={<Python />} text1="Backend" text2="Python" text3="SQL" text4="Generative AI" text5="NoSQLやGenerativeAIなどのトレンド技術を使用します" />
        <SkillSet2 colorType="red" icon={<AWS />} text1="Infrastructure" text2="AWS" text3="VMware" text4="Docker" text5="コンテナやサーバレスアーキテクチャの設計、IaCおよびCI/CDを用いた環境構築をします" />
      </div>
    </div>
  );
};

export default Skills;

import React from "react";
import { Chip } from "@nextui-org/react";

interface Props {
  colorType?: "blue" | "yellow" | "red";
  icon: React.ReactNode;
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
}

const SkillSet2: React.FC<Props> = (props) => {
  // カラータイプに応じたクラスの定義 ※Tailwindcssは動的ClassNameに対応していないため
  let border, text, bg;

  if (props.colorType === "blue") {
    border = "border-blue-500";
    text = "text-blue-500";
    bg = "bg-blue-900";
  } else if (props.colorType === "yellow") {
    border = "border-yellow-500";
    text = "text-yellow-500";
    bg = "bg-yellow-900";
  } else if (props.colorType === "red") {
    border = "border-red-500";
    text = "text-red-500";
    bg = "bg-red-900";
  } else {
    // デフォルト設定
    border = "border-gray-500";
    text = "text-gray-500";
    bg = "bg-gray-900";
  }

  return (
    <div className={`flex flex-col justify-center items-center my-10 p-10 ${text} border-1 ${border}`}>
      <div>{props.icon}</div>
      <p className="text-2xl pt-4 tracking-widest">{props.text1}</p>
      <div className="flex flex-row flex-wrap pt-5 pb-4 text-sm">
        <p className={`mb-3 mr-3 py-1 px-3 rounded-md ${bg}`}>{props.text2}</p>
        <p className={`mb-3 mr-3 py-1 px-3 rounded-md ${bg}`}>{props.text3}</p>
        <p className={`mb-3 py-1 px-3 rounded-md ${bg}`}>{props.text4}</p>
      </div>
      <div className="leading-relaxed text-sm">{props.text5}</div>
    </div>
  );
};

export default SkillSet2;

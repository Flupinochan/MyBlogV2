import React from "react";

interface Props {
  colorType?: "blue" | "yellow" | "red" | "green";
  text: string;
}

const H3: React.FC<Props> = (props) => {
  let border, text;
  if (props.colorType === "green") {
    border = "border-green-600";
    text = "text-green-600";
  } else {
    border = "border-gray-500";
    text = "text-gray-500";
  }
  return (
    <div className="flex pb-5">
      <div className={`px-1 border-l-1 border-y-1 ${border}`} />
      <div className={`tracking-widest px-2 text-xl ${text}`}>{props.text}</div>
      <div className={`px-1 border-r-1 border-y-1 ${border}`} />
    </div>
  );
};

export default H3;

import React from "react";

interface Props {
  colorType?: "primary" | "green";
  text: string;
  size?: string;
}

const H3: React.FC<Props> = (props) => {
  let border, text, size;
  if (props.colorType === "green") {
    border = "border-green-600";
    text = "text-green-600";
    size = "text-xl";
  } else if (props.colorType === "primary") {
    border = "border-primary";
    text = "";
    size = "text-2xl";
  } else {
    border = "border-gray-500";
    text = "text-gray-500";
    size = "text-xl";
  }
  return (
    <div className="flex pb-5">
      <div className={`px-1 border-l-1 border-y-1 ${border}`} />
      <div className={`tracking-widest px-2 ${size} ${text}`}>{props.text}</div>
      <div className={`px-1 border-r-1 border-y-1 ${border}`} />
    </div>
  );
};

export default H3;

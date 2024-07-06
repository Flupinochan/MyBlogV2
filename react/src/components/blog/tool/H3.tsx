import React from "react";

interface Text {
  text: string;
}

const H3: React.FC<Text> = (props) => {
  return (
    <div>
      <div className="flex border-1 border-primary my-5 md:my-10 items-center">
        <div className="pr-1 h-14 bg-primary" />
        <div className="text-2xl pl-4 tracking-widest">{props.text}</div>
      </div>
    </div>
  );
};

export default H3;

import React from "react";

interface Text {
  text: string;
}

const H2: React.FC<Text> = (props) => {
  return (
    <div>
      <div className="flex">
        <div className="px-3 border-1 border-primary" />
        <div className="text-4xl px-5 tracking-widest">{props.text}</div>
        <div className="flex flex-grow items-center w-auto m-auto">
          <div className="flex flex-grow w-full m-auto border-b-1 border-primary" />
        </div>
      </div>
    </div>
  );
};

export default H2;

import React from "react";

interface Text {
  text: string;
}

const H2: React.FC<Text> = (props) => {
  return (
    <div>
      {/* md以上 */}
      <div className="hidden md:flex">
        <div className="px-3 border-1 border-primary" />
        <div className="text-4xl px-5 tracking-widest">{props.text}</div>
        <div className="flex items-center">
          <div className="px-32 border-b-1 border-primary"></div>
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden flex">
        <div className="px-3 border-1 border-primary" />
        <div className="text-2xl px-5 tracking-widest">{props.text}</div>
        <div className="flex items-center">
          <div className="border-b-1 border-primary" />
        </div>
      </div>
    </div>
  );
};

export default H2;

import React from "react";

interface Text {
  text: string;
}

const H4: React.FC<Text> = (props) => {
  return <div className="text-2xl tracking-widest pb-3 pl-5 my-10 border-b-1 border-primary">{props.text}</div>;
};

export default H4;

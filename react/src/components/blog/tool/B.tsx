import React from "react";

interface Text {
  text: string;
}

const B: React.FC<Text> = (props) => {
  return <span className="text-primary font-bold ">{props.text}</span>;
};

export default B;

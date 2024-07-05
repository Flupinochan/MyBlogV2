import React from "react";

interface Props {
  img1: string;
  img2: string;
  text1: string;
  text2: string;
}

const DoubleImg: React.FC<Props> = (props) => {
  return (
    <div className="flex flex-wrap pt-10">
      <div className="pb-10 md:pr-5 md:w-1/2">
        <p className="pb-5 text-primary font-bold">{props.text1}</p>
        <img src={props.img1} alt={props.img1} />
      </div>
      <div className="pb-10 md:pr-5 md:w-1/2">
        <p className="pb-5 text-primary font-bold">{props.text2}</p>
        <img src={props.img2} alt={props.img2} />
      </div>
    </div>
  );
};

export default DoubleImg;

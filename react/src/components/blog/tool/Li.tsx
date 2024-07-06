import React from "react";

interface Props {
  [key: string]: string;
}

const Li: React.FC<Props> = (props) => {
  const items = Object.values(props);
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="flex flex-row items-center">
          <p className="border-1 border-primary px-2 md:px-3 my-2 mr-2 text-primary">{index + 1}</p>
          <p className="border-b-1 border-primary">{item}</p>
        </div>
      ))}
    </div>
  );
};

export default Li;

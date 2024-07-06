import React from "react";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

const CButton2: React.FC = () => {
  const handleScroll = () => {
    console.log("Button clicked");
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth", // スムーズにスクロールする場合
    });
  };

  return (
    <button onClick={handleScroll} className="md:hidden flex flex-row cursor-pointer border-1 border-primary text-primary w-48 mt-20 p-4 text-center justify-center items-center transition duration-300 hover:bg-primary hover:text-white">
      <p className="pr-2 text-xl">Contact me</p>
      <RocketLaunchIcon />
    </button>
  );
};
export default CButton2;

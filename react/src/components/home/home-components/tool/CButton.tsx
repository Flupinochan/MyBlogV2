import React from "react";
import { Link as Scroll } from "react-scroll";
import AnchorLink from "react-anchor-link-smooth-scroll";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

const CButton: React.FC = () => {
  return (
    <Scroll to="contact" smooth={true} duration={500}>
      <div className="hidden md:flex flex-row cursor-pointer border-1 border-primary text-primary w-48 p-3 justify-center text-center items-center transition duration-300 hover:bg-primary hover:text-white">
        <p className="pr-2">Contact me</p>
        <RocketLaunchIcon />
      </div>
    </Scroll>
  );
};
export default CButton;

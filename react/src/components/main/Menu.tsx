import React from "react";
import { Link } from "react-router-dom";

const Menu: React.FC = () => {
  return (
    <div>
      {/* md以上 */}
      <div className="hidden md:flex group w-full justify-evenly text-2xl pt-5">
        <div className="c-menu">Blog</div>
        <div className="c-menu">Youtube</div>
        <div className="c-menu">Github</div>
        <div className="c-menu">Tool</div>
      </div>
      {/* md以下 */}
      <div className="flex md:hidden group w-full justify-evenly text-2xl pt-4">
        <div className="c-menu2">Blog</div>
        <div className="c-menu2">Youtube</div>
        <div className="c-menu2">Github</div>
        <div className="c-menu2">Tool</div>
      </div>
    </div>
  );
};

export default Menu;

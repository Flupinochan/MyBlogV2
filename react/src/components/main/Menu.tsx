import React from "react";
import { Link } from "react-router-dom";

import Chat2 from "../chat/Chat2";

const Menu: React.FC = () => {
  return (
    <div>
      {/* md以上 */}
      <div className="hidden md:flex group w-full justify-evenly text-2xl pt-5">
        <a className="c-menu" href="https://www.metalmental.net/" target="_blank" rel="noopener noreferrer">
          Blog
        </a>
        <a className="c-menu" href="https://www.youtube.com/@Flupinochan" target="_blank" rel="noopener noreferrer">
          Youtube
        </a>
        <a className="c-menu" href="https://github.com/Flupinochan/" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <Link className="c-menu" to="/chat">
          Tool
        </Link>
      </div>
      {/* md以下 */}
      <div className="flex md:hidden group w-full justify-evenly text-2xl pt-4">
        <a className="c-menu2" href="https://www.metalmental.net/" target="_blank" rel="noopener noreferrer">
          Blog
        </a>
        <a className="c-menu2" href="https://www.youtube.com/@Flupinochan" target="_blank" rel="noopener noreferrer">
          Youtube
        </a>
        <a className="c-menu2" href="https://github.com/Flupinochan/" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <Link className="c-menu2" to="/chat">
          Tool
        </Link>
      </div>
    </div>
  );
};

export default Menu;

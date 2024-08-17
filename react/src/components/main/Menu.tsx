import React from "react";
import { Link } from "react-router-dom";

import Chat2 from "../chat/Chat2";

const Menu: React.FC = () => {
  return (
    <div>
      {/* md以上 */}
      <div className="hidden md:flex group w-full justify-evenly text-2xl pt-5">
        <Link className="c-menu" to="blog">
          Blog
        </Link>
        <a className="c-menu" href="https://www.youtube.com/@Flupinochan" target="_blank" rel="noopener noreferrer">
          Youtube
        </a>
        <a className="c-menu" href="https://github.com/Flupinochan/" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a className="c-menu" href="https://www.chatbot.metalmental.net/" target="_blank" rel="noopener noreferrer">
          Tool
        </a>
      </div>
      {/* md以下 */}
      <div className="flex md:hidden group w-full justify-evenly text-2xl pt-4">
        <Link className="c-menu2" to="blog">
          Blog
        </Link>
        <a className="c-menu2" href="https://www.youtube.com/@Flupinochan" target="_blank" rel="noopener noreferrer">
          Youtube
        </a>
        <a className="c-menu2" href="https://github.com/Flupinochan/" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a className="c-menu2" href="https://www.chatbot.metalmental.net/" target="_blank" rel="noopener noreferrer">
          Tool
        </a>
      </div>
    </div>
  );
};

export default Menu;

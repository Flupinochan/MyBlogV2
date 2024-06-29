import React from "react";
import { Link } from "react-router-dom";
import MetalMentalBlogTitle from "./contents/metalmental-blog-title.png";

const Header: React.FC = () => {
  return (
    <div>
      <Link to="/">
        <div className="flex justify-center transition duration-300 ease-in-out hover:scale-105 lg:hover:-translate-y-1 lg:hover:scale-110">
          <img src={MetalMentalBlogTitle} alt="metalmental-blog-title.png" />
        </div>
      </Link>
    </div>
  );
};

export default Header;

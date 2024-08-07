import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import * as BlogArchive from "./BlogIndex";
import { BlogPostComponent } from "./BlogIndex";
import H2 from "../tool/H2";

const BlogPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);
  const PostComponent = BlogArchive[postId as keyof typeof BlogArchive] as BlogPostComponent;
  const { metadata } = PostComponent;
  if (!PostComponent) {
    return <div>記事が見つかりません</div>;
  }

  return (
    <div data-aos="fade-in">
      <div className="md:px-28 md:pt-20">
        <div className="flex flex-col justify-center">
          <img className="h-[500px] object-contain bg-black bg-opacity-15" src={metadata.image.url} alt={metadata.image.alt}></img>
          <div className="pt-14 pl-8">
            <H2 text={metadata.title} />
            <div className="flex flex-row space-x-10 items-center pt-6">
              <p>{metadata.date}</p>
              <p className="hidden md:block py-1 px-2 cursor-pointer border-1 border-primary text-primary transition duration-300 hover:bg-primary hover:text-white">#{metadata.category}</p>
            </div>
            <div className="mt-16 leading-loose">
              <PostComponent />
            </div>
            <Link to="/blog">
              <div className="hidden md:flex flex-row cursor-pointer border-1 border-primary text-primary w-44 p-3 mt-20 justify-center text-center items-center transition duration-300 hover:bg-primary hover:text-white">Back to Blogs</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;

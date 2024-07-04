import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import VanillaTilt from "vanilla-tilt";
import { getAllPostsData, getSortedPostsData } from "./ManageBlog";
import H2 from "../../home/home-components/tool/H2";

const BlogList: React.FC = () => {
  const posts = getSortedPostsData(getAllPostsData());

  const tiltRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      VanillaTilt.init(node, {
        max: 12.5,
        speed: 200,
        glare: true,
        "max-glare": 0.25,
        scale: 1.05,
      });
    }
    return () => {
      if (node) {
        (node as any).vanillaTilt.destroy();
      }
    };
  }, []);

  return (
    <div className="px-28 pt-20">
      <H2 text="Blog Archive" />
      <div className="pt-14 pl-8">
        <div className="flex flex-row flex-wrap gap-14">
          {posts.map((post) => (
            <div key={post.name}>
              <Link to={`/blog/${post.name}`}>
                <div className="flex flex-col h-full w-[600px] bg-black rounded-3xl bg-opacity-15 py-6 px-8" ref={tiltRef}>
                  <div className="flex-grow">
                    <div className="text-2xl pb-1">{post.title}</div>
                    <div className="flex justify-center mt-2">
                      <img className="h-[350px] object-contain" src={post.image.url} alt={post.image.alt}></img>
                    </div>
                    <div className="p-4">{post.excerpt}</div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <div>{post.date}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogList;

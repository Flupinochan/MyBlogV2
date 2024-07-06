import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import VanillaTilt from "vanilla-tilt";
import { getAllPostsData, getSortedPostsData } from "./ManageBlog";
import H2 from "../../home/home-components/tool/H2";
import { Pagination } from "@nextui-org/react";

const BlogList: React.FC = () => {
  const posts = getSortedPostsData(getAllPostsData());
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // 1ページあたりのアイテム数
  const totalPages = Math.ceil(posts.length / itemsPerPage); // ページ数の合計
  const handlePageChange = (page: number) => {
    setCurrentPage(page); // ページを切り替え
  };
  const startIndex = (currentPage - 1) * itemsPerPage; // ページごとの要素の始まりは、× itemsPerPage
  const selectedPosts = posts.slice(startIndex, startIndex + itemsPerPage); // ページで表示する要素数は、startIndexからitemsPerPageを足した数

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
    <div data-aos="fade-in">
      <div className="px-14 pt-10 md:px-28 md:pt-20">
        <H2 text="Blog Archive" />
        <div className="pt-7 md:pt-14 md:pl-8">
          <div className="flex flex-row flex-wrap gap-14 justify-center">
            {selectedPosts.map((post) => (
              <div key={post.name}>
                <Link to={`/blog/${post.name}`}>
                  <div className="flex flex-col h-full w-[350px] md:w-[600px] bg-black border-primary border-1 rounded-3xl bg-opacity-15 py-6 px-8" ref={tiltRef}>
                    <div className="flex-grow">
                      <div className="text-2xl pb-1">{post.title}</div>
                      <div className="flex justify-center mt-2">
                        <img className="h-[350px] object-scale-down" src={post.image.url} alt={post.image.alt}></img>
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
          <div className="flex justify-center pt-10">
            <Pagination total={totalPages} initialPage={1} onChange={handlePageChange} size="lg" variant="flat" showControls showShadow />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogList;

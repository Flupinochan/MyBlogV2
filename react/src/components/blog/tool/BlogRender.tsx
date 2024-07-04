import React from "react";
import { useParams, Link } from "react-router-dom";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import * as BlogArchive from "./BlogIndex";
import { BlogPostComponent } from "./BlogIndex";
import H2 from "../../home/home-components/tool/H2";

const BlogPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const PostComponent = BlogArchive[postId as keyof typeof BlogArchive] as BlogPostComponent;

  if (!PostComponent) {
    return <div>記事が見つかりません</div>;
  }

  const { metadata } = PostComponent;

  return (
    <div className="px-28 pt-20">
      <div className="flex flex-col justify-center">
        <img className="h-[371px] object-none bg-black bg-opacity-15" src={metadata.image.url} alt={metadata.image.alt}></img>
        <div className="pt-14 pl-8">
          <H2 text={metadata.title} />
          <p>日付: {metadata.date}</p>
          <p>カテゴリー: {metadata.category}</p>
          <p>タグ: {metadata.tags.join(", ")}</p>
          <PostComponent />
          <Link to="/blog">Back to archive list</Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;

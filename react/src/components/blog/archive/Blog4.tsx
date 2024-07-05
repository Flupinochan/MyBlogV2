import React from "react";

export const metadata = {
  date: "2024-07-15",
  title: "Blog4",
  excerpt: "TypeScriptの型システムについて解説いたします",
  category: "TypeScript",
  tags: ["フロントエンド", "JavaScript"],
  image: {
    url: "/images/blog/SAM.jpg",
    alt: "React Hooksの図解",
  },
};

const Blog2: React.FC & { metadata: typeof metadata } = () => {
  return (
    <div>
      <h1>Blog4</h1>
    </div>
  );
};

Blog2.metadata = metadata;

export default Blog2;

import React from "react";

export const metadata = {
  date: "2024-07-07",
  title: "CodeCatalyst",
  excerpt: "ソースコード全体を生成AIに読み取らせる!",
  category: "AWS",
  tags: ["CodeCatalyst", "CI/CD", "IaC"],
  image: {
    url: "/images/blog/CodeCatalyst.png",
    alt: "CodeCatalyst.png",
  },
};

const Blog4: React.FC & { metadata: typeof metadata } = () => {
  return (
    <div>
      <h1>作成中</h1>
    </div>
  );
};

Blog4.metadata = metadata;

export default Blog4;

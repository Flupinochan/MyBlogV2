import React from "react";

export const metadata = {
  date: "2024-03-30",
  title: "ブログ初投稿 (≧∇≦*)",
  excerpt: "TypeScriptを使用したブログにチャレンジします!",
  category: "日記",
  tags: [""],
  image: {
    url: "/images/blog/blog1.png",
    alt: "Flupinochan.png",
    width: 0,
    height: 0,
  },
};

// 型交差(Intersection Types)
// React.FC<Props> は (props: Props) => JSX.Element | null の型エイリアスであり、
// Props 型の引数を受け取り、JSX 要素または null を返す関数を表します。
const Blog1: React.FC & { metadata: typeof metadata } = () => {
  return (
    <div>
      <h1>Blog1</h1>
    </div>
  );
};

Blog1.metadata = metadata; // コンポーネントにmetadataを追加
// 以下と同様
// const Blog1: React.FC & { metadata: typeof metadata } = () => {
//   Blog1.metadata = {
//     date: "2024-03-30",
//     title: "React Hooksの基礎",
//     // ...
//   };

//   return (
//     <div>
//       <h1>Blog1</h1>
//     </div>
//   );
// };

export default Blog1;

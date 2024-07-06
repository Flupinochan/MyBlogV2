import { FC } from "react";

// デフォルトエクスポート (ブログ記事コンポーネント)
export { default as Blog1 } from "../archive/Blog1";
export { default as Blog2 } from "../archive/Blog2";
export { default as Blog3 } from "../archive/Blog3";
// export { default as Blog4 } from "../archive/Blog4";

// メタデータ型定義のエクスポート
export interface BlogPostMetadata {
  date: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  image: {
    url: string;
    alt: string;
  };
}

// メタデータ + React.FC のブログ記事コンポーネント型定義のエクスポート
export type BlogPostComponent = FC & { metadata: BlogPostMetadata };

import * as BlogArchive from "./BlogIndex";
// 上記だけでは型情報が失われる可能性があるため、*だけでなく個別でもimportする
import { BlogPostMetadata, BlogPostComponent } from "./BlogIndex";

// importしたBlogArchiveの構造 (複数を*でimportしたらオブジェクトに格納される)
// key名は、exportしたコンポーネント名
// {
//   Blog1: /* Blog1 コンポーネント */,
//   Blog2: /* Blog2 コンポーネント */,
//   BlogPostMetadata: /* BlogPostMetadata インターフェース */,
//   BlogPostComponent: /* BlogPostComponent 型エイリアス */
// }

// インデックスシグネチャ [key: string]
// key名(Blog1、Blog2...)が分からない場合にkeyの型がstringであることだけを定義する型定義
// {
//   Blog1: BlogPostComponent;
//   Blog2: BlogPostComponent;
//   ...
// }
type BlogArchiveType = {
  [key: string]: BlogPostComponent;
};

// matadataオブジェクトをスプレッドで展開したメタデータとコンポーネント名のオブジェクトを返す関数
// Object.entriesは、オブジェクトを配列に変換するメソッド
// 1.以下にBlogArchiveTypeを変換
// [
//   [ コンポーネント名1, コンポーネント1 ]
//   [ コンポーネント名2, コンポーネント2 ]
// ]
// 2.mapを使用してmetadataをスプレッド展開して以下の形式に変換
// {
//   date: "2023-06-01",
//   title: "Introduction to React",
//   excerpt: "Learn the basics of React and how to get started.",
//   category: "React",
//   tags: ["React", "JavaScript", "Web Development"],
//   image: {
//     url: "/images/blog/react-intro.jpg",
//     alt: "React Introduction",
//     width: 800,
//     height: 600,
//   },
//   name: "Blog1",
// }
export function getAllPostsData(): (BlogPostMetadata & { name: string })[] {
  return Object.entries(BlogArchive as BlogArchiveType).map(([name, component]) => ({
    ...component.metadata,
    name,
  }));
}

// metadataのdateでソートして返す関数
export function getSortedPostsData(posts: (BlogPostMetadata & { name: string })[]): (BlogPostMetadata & { name: string })[] {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function filterPostsByCategory(posts: (BlogPostMetadata & { name: string })[], category: string): (BlogPostMetadata & { name: string })[] {
  return posts.filter((post) => post.category === category);
}

export function filterPostsByTag(posts: (BlogPostMetadata & { name: string })[], tag: string): (BlogPostMetadata & { name: string })[] {
  return posts.filter((post) => post.tags.includes(tag));
}

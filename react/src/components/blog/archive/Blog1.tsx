import React from "react";

import H3 from "../tool/H3";
import H4 from "../tool/H4";
import B from "../tool/B";
import Spacer from "../tool/Spacer";
import CLink from "../tool/CLink";

export const metadata = {
  date: "2024-03-30",
  title: "ブログ初投稿 (≧∇≦*)",
  excerpt: "TypeScriptを使用したブログにチャレンジします!",
  category: "日記",
  tags: [""],
  image: {
    url: "/images/blog/blog1.png",
    alt: "Flupinochan.png",
  },
};

// 型交差(Intersection Types)
// React.FC<Props> は (props: Props) => JSX.Element | null の型エイリアスであり、
// Props 型の引数を受け取り、JSX 要素または null を返す関数を表します。
const Blog1: React.FC & { metadata: typeof metadata } = () => {
  return (
    <div>
      <H3 text="はじめに" />
      <p>
        こんにちは、
        <B text="MetalMental" /> です(*ﾟ▽ﾟ)ﾉ
      </p>
      <Spacer />
      <p>ブログを投稿するのは、1年ぶりになります</p>
      <p>
        昨年度は、
        <B text="「WordPressを使用したブログ」" />
        を投稿していましたが、飽きて投稿しなくなってしまいました…
      </p>
      <Spacer />
      <p>
        そのため、今後は
        <B text="「HTMLやTypeScriptを使用したブログ」" />
        にチャレンジしていきたいと思います!!
      </p>
      <Spacer />
      <H3 text="本題" />
      <H4 text="本ブログについて" />
      <p>本ブログは、エンジニアが投稿するブログです</p>
      <p>
        <B text="AWS、生成AI、ブロックチェーン" />
        に関する記事をメインにしたいと考えています
      </p>
      <Spacer />
      <p>
        勉強・検証する上で作成したコードは、
        <CLink link="https://github.com/Flupinochan" text="GitHub" />
        にアップロードします!!
      </p>
      <p>みなさんのお役に立てれば幸いです (o_ _)o</p>
      <Spacer />
      <p>
        もちろん、本ブログに関するコードもGitHubにアップロードしています!!
        <br />
        興味がある方は、
        <CLink link="https://github.com/Flupinochan/MyBlog" text="MyBlog" />
        をご覧ください
      </p>
      <H4 text="生成AIを勉強する理由" />
      <p>シンプルに、便利で感銘を受けたからですw</p>
      <Spacer />
      <p> 現在は、個人レベルでしか利用されていませんが、当然、今後は企業レベルで利用されます</p>
      <p> 今のうちに、勉強しておこうと思いました</p>
      <Spacer />
      <p>
        本ブログでは、
        <B text="RAG(Retrieval-Augmented Generation)" />
        を導入予定ですので、楽しみにしていてください!!
      </p>
      <Spacer />
      <p>お金がかかりそうで怖いですが… ((((；ﾟДﾟ))))</p>
      <H4 text="ブロックチェーンを勉強する理由" />
      <p>先日、仮想通貨1ビットコインが、1000万円を超えました</p>
      <p>さすがにもう仮想通貨を軽視することはできないです</p>
      <Spacer />
      <p>金融の非中央集権化・民主化が来ると思います</p>
      <Spacer />
      <p>少しでもブロックチェーンを勉強し、金融関係の仕事に携わることで、食いっぱぐれないようにしたいです (｡-∀-)</p>
      <Spacer />
      <H3 text="おわりに" />
      <p>少し前に、自分のクレジットカードが不正利用されました Σ( ºωº )</p>
      <Spacer />
      <p>以下のように、APPLE COM BILLというご利用名で、いくつも請求されていました</p>
      <p>サポートが返金手続き中ですが、拒否されることもあるみたいで、怖いです</p>
      <Spacer />
      <p>心当たりが…あるんですよねぇw</p>
      <Spacer />
      <p>
        先日、中華サイトで、原神の
        <CLink link="https://ascii.jp/elem/000/004/188/4188575/" text="コラボスマホ(刻晴)" />
        を購入しようとしました
      </p>
      <p>思いとどまって、購入確認画面で戻ったのですが、手遅れだったのかもしれません…</p>
      <Spacer />
      <p>今度から、おとなしくメルカリで購入しようと思います</p>
      <Spacer />
      <p>そんなに高くないですし…</p>
      <Spacer />
      <p>みなさんもお気を付けください</p>
      {/* <img src={AppleBillComIcon} alt="appleComBill" className="normalImage" /> */}
      <Spacer />
      <img src="/images/blog/appleComBill.png" alt="appleComBill" className="normalImage" />
      <Spacer />
      <p>今回のブログは、ここでおしまいです</p>
      <p>ご覧いただき、ありがとうございました ((*_ _))</p>
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

import React from "react";
import H3 from "../tool/H3";
import Spacer from "../tool/Spacer";
import B from "../tool/B";
import CLink from "../tool/CLink";
import H4 from "../tool/H4";
import Li from "../tool/Li";
import CodeSnippet from "../tool/CodeSnippet";

export const metadata = {
  date: "2024-07-07",
  title: "Amazon CodeCatalyst (#ﾟДﾟ)",
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
      <H3 text="はじめに" />
      <p>こんにちは、MetalMentalです (*ﾟ▽ﾟ)ﾉ</p>
      <Spacer />
      <p>最近は、サーバレス(Amplify、Supabase)を勉強しています _φ(｡_｡*)</p>
      <p>後述するCodeCatalystもです</p>
      <Spacer />
      <p>
        <B text="インフラエンジニアがインフラの構築が不要な仕組みを学んでどうするんだ?" />
      </p>
      <Spacer />
      <p>と思う方もいらっしゃるかもしれませんが、理由があります</p>
      <p>インフラあってのアプリではなかったからです (๐◊๐”)/</p>
      <Spacer />
      <p>
        <B text="アプリあってのインフラだからです!" />
      </p>
      <Spacer />
      <Spacer />
      <p>
        <B text="生成AI" />
        が注目されていて、先日の <CLink text="AWS Summit" link="https://aws.amazon.com/jp/summits/japan-2024/" />
        でもそうでした
      </p>
      <p>ほとんどの企業が生成AIについて講演していました ^_^;</p>
      <Spacer />
      <p>
        <B text="Q : 生成AIを使用したアプリケーションでは、どのようなインフラが求められるのでしょうか?" />
      </p>
      <Spacer />
      <p>
        A : 多くの生成AIアプリケーションのインフラは、
        <B text="サーバレス" />
        が使用されています!
      </p>
      <Spacer />
      <p>
        理由としては、生成AIは
        <B text="非同期処理" />
        であり、ユーザが質問した時だけ、バックエンドが応答する、という仕組みになっているからです!
      </p>
      <Spacer />
      <p>
        逆に、ブロックチェーンのような長期的な処理が必要なアプリケーションについては、サーバレスだと
        <B text="タイムアウト(AWS Lambdaは15分)" />
        があるため、向いていません…
      </p>
      <Spacer />
      <p>
        <B text="サーバレスに対応しているアプリケーションであれば、サーバレスを考えるべきです!" />
      </p>
      <Spacer />
      <p>OSのアップデートはしなくていいですし、オートスケーリングも不要です</p>
      <p>コストは最適化され、運用負荷は軽減されます</p>
      <p>当然、開発スピードも上がります</p>
      <Spacer />
      <p>
        Kubernetesを勉強して、最強のインフラエンジニアを目指すことも良いと思いますが、
        <B text="アプリ側や運用の負担も考えるべきです" />
      </p>
      <Spacer />
      <p>コンテナを使用したアプリを作りたいだけであれば、ECS Fargateで十分なはずです (　-`ω-)</p>
      <Spacer />
      <Spacer />
      <p>長くなりましたが、まとめると…</p>
      <Spacer />
      <p>
        {" "}
        <B text="難しいインフラを勉強" />
        して、アプリケーションエンジニアに対して
        <B text="イキる" />
        のはやめようと思いました…w
      </p>
      <Spacer />
      <p>
        今後は、要件(セキュリティなど)を満たせる中で、
        <B text="最も簡単で運用負荷が少ないようなインフラ" />
        を提供することを意識したいと考えています!
      </p>
      <Spacer />
      <H3 text="本題" />
      <H4 text="CodeCatalystとは" />
      <Li text1="Projenによる構成ファイルの一括管理" text2="Amazon Qによる複数コードの一括生成" />
      <Spacer />
      <Spacer />
      <p>が所感でした</p>
      <Spacer />
      <p>インフラの構築やCI/CD環境の構築が簡単にできます</p>
      <p>また、Amplifyよりは難しいけれど、細かく設定できる認識です</p>
      <Spacer />
      <p>全部は語れないので、個人的に面白い! と思った機能だけ解説していきます</p>
      <p>私は、以下を参考に勉強しました!</p>
      <Spacer />
      <p>
        ※AWS PDKをWindows環境でセットアップする場合は
        <CLink text="パス周りでエラー" link="https://github.com/aws/aws-pdk/issues/624" />
        が起きます
      </p>
      <p>　WSLまたはLinuxを使用するよう気をつけてください</p>
      <Spacer />
      <p>
        <CLink text="・Amazon CodeCatalyst Workshop Mythical Mysfits" link="https://catalog.workshops.aws/integrated-devops/ja-JP" />
        <br />
        <CLink text="・AWS PDK" link="https://aws.github.io/aws-pdk/getting_started/index.html" />
      </p>
      <Spacer />
      <H4 text="AWS PDK(Projen)とは" />
      <p>プロジェクトの構成管理を一括で行うツールです</p>
      <p>
        フロントエンド、バックエンド、インフラの全てを
        <B text="1つの言語(TypeScript)" />
        で構築するためのセットアップを一括で行えます
      </p>
      <Spacer />
      <p>
        具体的には、様々な構成ファイル(tsconfig.json や package.json、.gitignore、cdk.json)などは直接編集せず、
        <B text=".projenrc.ts" />
        というファイルで一括管理します
      </p>
      <Spacer />
      <p>
        そして、
        <B text=".projenrc.ts" />
        ファイルを修正して、コマンドを実行することで、個別の設定ファイル(tsconfig.jsonなど)に反映させます
      </p>
      <Spacer />
      <p>
        以下に、
        <CLink text="Tutorial" link="https://aws.github.io/aws-pdk/getting_started/your_first_aws_pdk_project.html" />
        で学んだことのメモを貼っておきます…
      </p>
      <Spacer />
      <p>
        <B text="PDK関連のツールのインストール" />
      </p>
      <CodeSnippet
        language="bash"
        text={`# nodejs、java、gitはインストール済みで、PATH設定がされていること

# PDKのインストール
npm install -g @aws/pdk
pdk --version

# Gitのコミット設定
git config --global user.email "username@example.com"
git config --global user.name "username"

# CDKのインストール
npm install -g aws-cdk
cdk --version

# pnpm(Projenのパッケージ管理コマンド)のインストール
npm install -g pnpm@8 # 最新バージョンは対応していない?
pnpm --version

# nx(monorepoの管理ツール)のインストール
pnpm add -D nx
pnpm nx --version`}
      />
      <Spacer />
      <Spacer />
      <p>
        <B text="PDK Projectの作成" />
      </p>
      <CodeSnippet
        language="bash"
        text={`mkdir my-project
cd my-project
npx projen new --from @aws/pdk --package-manager=pnpm monorepo-ts
# もしくは、以下のコマンドでも可能
# (npx projen～ または pdk～ のどちらかのコマンドを使用する認識です…)
pdk new --package-manager=pnpm monorepo-ts`}
      />
      <Spacer />
      <Spacer />
      <B text=".projenrc.ts の変更を反映" />
      <CodeSnippet
        language="bash"
        text={`# .projenrc.ts に記載された設定を、各構成ファイル(tsconfig.json や package.json、.gitignore、cdk.json)に反映する
npx projen`}
      />
      <Spacer />
      <Spacer />
      <p>
        <B text="ビルド" />
      </p>
      <CodeSnippet
        language="bash"
        text={`# npx projen で合成された各構成ファイル(tsconfig.json や package.json、.gitignore、cdk.json)を元にビルドする
npx projen build
# もしくは、以下でも可能
pdk build
# 特定のプロジェクトやパッケージのみビルドする場合は以下で行う
pnpm exec nx build [プロジェクト名]
# エラー時は、以下を実行してキャッシュクリアするとよいかも?
pnpm install
pnpm store prune`}
      />
      <Spacer />
      <Spacer />
      <p>
        <B text="開発モード" />
      </p>
      <CodeSnippet
        language="bash"
        text={`# ../packages/website/ に移動して以下を実行すると、全ての設定ファイルの変更をリアルタイムで反映しつつ(npx projenを常に実行)、lite-serverを起動するようなコマンド
npx projen dev`}
      />
      <Spacer />
      <Spacer />
      <p>
        <B text="AWSへのデプロイ" />
      </p>
      <CodeSnippet
        language="bash"
        text={`# aws configureでAWSへの接続設定が済んでいること
cd packages/infra
# 開発の際は以下で、ホットスワップ(一部だけCloudFormationを使用し、なるべく直接デプロイして短時間)でデプロイ
npx projen deploy:dev
# 本番は以下でデプロイ
npx projen deploy`}
      />
      <Spacer />
      <Spacer />
      <p>
        <B text="AWSのリソース削除" />
      </p>
      <CodeSnippet
        language="bash"
        text={`cd packages/infra
npx projen destroy`}
      />
      <Spacer />
      <Spacer />
      <p>
        <B text="AWSの構成図の自動生成" />
      </p>
      <CodeSnippet
        language="bash"
        text={`npx projen graph
npx projen graph --host 0.0.0.0`}
      />
      <Spacer />
      <H4 text="CodeCatalystでAmazon Qにリポジトリを読み込ませる!" />
      <p>Amazon Qは、AWSが提供しているコードに特化した?、生成AIです</p>
      <Spacer />
      <p>
        そして、CodeCatalystでは、
        <B text="リポジトリ(コード全体)" />
        を生成AIに読み取らせることができます!
      </p>
      <p>
        <B text="コードを1つ1つコピペして、生成AIに質問しなくてよい" />
        のはとても便利でした!
      </p>
      <p>(まだ日本語対応していないので、早く対応してほしいところです…)</p>
      <Spacer />
      <Spacer />
      <p>以下は、CodeCatalystでAmazon Qを使用した例になります</p>
      <p>
        <CLink text="Workshop" link="https://catalog.workshops.aws/integrated-devops/ja-JP" />
        で扱うMysfitsのコードで、「キャラクターを追加して欲しい」とAmazon Qに質問しました
      </p>
      <Spacer />
      <p>
        ※Mysfitsのサンプルは、
        <CLink text="こちら" link="https://mythicalmysfits.com/" />
        です
      </p>
      <Spacer />
      <Spacer />
      <img src="/images/blog/CodeCatalyst_AmazonQ1.png" alt="CodeCatalyst_AmazonQ1.png" />
      <Spacer />
      <Spacer />
      <p>
        「Read repository」から
        <B text="リポジトリ内のコード全て" />
        を読み込んでいることが分かります!
      </p>
      <p>また、以下のように、関連するテスト用のコードも修正してくれていました!</p>
      <Spacer />
      <Spacer />
      <img src="/images/blog/CodeCatalyst_AmazonQ2.png" alt="CodeCatalyst_AmazonQ2.png" />
      <Spacer />
      <H3 text="おわりに" />
      <p>アイキャッチ画像のかわいい女の子は、画像生成AIで作成しています</p>
      <p>
        有名な <CLink text="Stable Diffusion" link="https://github.com/AUTOMATIC1111/stable-diffusion-webui" />
        というオープンソースツールを自分のPCに入れて行いました
      </p>
      <Spacer />
      <p>
        モデル(Checkpoint)は、
        <CLink text="JitQ" link="https://civitai.com/models/132246/jitq" />
        をお借りしています
      </p>
      <p>自分の性癖がバレるような気がしますが… そんなことはどうでもいいです!</p>
      <Spacer />
      <p>次回は、Amplify Gen2について語る予定です</p>
      <p>ご覧いただき、ありがとうございました ((*_ _))</p>
    </div>
  );
};

Blog4.metadata = metadata;

export default Blog4;

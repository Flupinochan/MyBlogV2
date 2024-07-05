import React from "react";

import H3 from "../tool/H3";
import H4 from "../tool/H4";
import B from "../tool/B";
import Spacer from "../tool/Spacer";
import CLink from "../tool/CLink";
import DoubleImg from "../tool/DoubleImg";
import Li from "../tool/Li";
import { Spa } from "@mui/icons-material";

export const metadata = {
  date: "2024-04-18",
  title: "AWS CodeCommitのMonorepo構成 (｀･ω･´)",
  excerpt: "単一リポジトリで複数にデプロイ!",
  category: "AWS",
  tags: ["CodeCommit", "Lambda", "CodeDeploy", "S3", "CodePipeline"],
  image: {
    url: "/images/blog/blog2_title.png",
    alt: "blog2_title.png",
  },
};

const Blog2: React.FC & { metadata: typeof metadata } = () => {
  return (
    <div>
      <H3 text="はじめに" />
      <p>こんにちは、MetalMentalです (*ﾟ▽ﾟ)ﾉ</p>
      <Spacer />
      <p>
        Monorepo構成のリポジトリについてお話する前に、本ブログが
        <B text="「React」" />
        を使用したブログになったことをご報告いたします!
      </p>
      <p>
        Reactは、
        <B text="SPA(Single Page Application)" />
        を作成するためのJavaScriptライブラリです
      </p>
      <Spacer />
      <p>AngularやVueと比較されます</p>
      <Spacer />
      <p>
        SPAについて詳しくない方にご説明すると、以下の画像のように、リンク移動前と後で、
        <B text="ページの一部しか再読み込みされないようになった" />
        ということです!
      </p>
      <DoubleImg text1="■リンク移動前" text2="■リンク移動後" img1="/images/blog/1.jpg" img2="/images/blog/2.jpg" />
      <p>タイトルの画像とメニューバーは再読み込みされず、本文のみが再読み込みされています!</p>
      <Spacer />
      <p>
        ユーザーは、ページ移動時のリロード時間が削減されるので、
        <B text="ブラウザが軽くなります" />
      </p>
      <p>
        ブログを作成する私にとっても、ページごとにタイトルの画像やメニューバーを設定する必要がなくなり、
        <B text="ブログの作成が楽になります" />
      </p>
      <Spacer />
      <p>Win-Winですね (^^)</p>
      <Spacer />
      <H3 text="本題" />
      <p>余談が長くなりましたが、本題に入ります</p>
      <H4 text="Monorepoとは" />
      <p>従来は、1つのプロジェクトにつき、1つのリポジトリを作成していました</p>
      <Spacer />
      <p>そして、1つのリポジトリに対して、1つのCI/CDを設定します</p>
      <p>
        ⇒ <B text="Polyrepo" />
        と言うみたいです
      </p>
      <Spacer />
      <p>これに対して、1つのリポジトリに対して、複数のCI/CDを設定するのが</p>
      <p>
        ⇒ <B text="Monorepo" />
        です
      </p>
      <Spacer />
      <p>※ちょっと御幣があるかもしれませんが…</p>
      <Spacer />
      <DoubleImg text1="■Polyrepo" text2="■Monorepo" img1="/images/blog/monorepo.png" img2="/images/blog/polyrepo.png" />
      <p>具体的には、リポジトリ内に作成した任意のディレクトリやファイルに対して、CI/CDを設定するのですが、AWS CodeCommitでは簡単にはできません</p>
      <p>
        なぜなら、CodeCommitやCodePipelineの機能で、
        <B text="ディレクトリやファイルレベルの変更を検知できないから" />
        です
      </p>
      <H4 text="CodeCommitでMonorepoを実装する方法" />
      <p>先ほどもお伝えしたとおり、2024/04/18では、CodeCommitの機能にMonorepo機能はありません</p>
      <p>そのため、Lambdaを使用して、コードで上手く処理するしかないです…</p>
      <Spacer />
      <p>ですが、難しくはないです</p>
      <p>コード量は、100行にも満たないです</p>
      <Spacer />
      <p>
        コードは、
        <CLink link="https://github.com/Flupinochan/Monorepo/blob/main/monorepo-project/lib/lambda-code/index.py" text="こちら" />
        を参考にしていただければ幸いです
      </p>
      <Spacer />
      <p>簡単にまとめると、以下のような処理になります</p>
      <Spacer />
      <Li text1="EventBridgeでCodeCommitのコミットを検知" text2="Lambdaで1つ前のコミットと現在のコミットを比較し、変更のあったディレクトリやファイルを取得" text3="2で取得したディレクトリやファイルに応じてCodePipelineを実行" />
      <Spacer />
      <p>
        <CLink link="https://docs.aws.amazon.com/ja_jp/codecommit/latest/userguide/monitoring-events.html#referenceUpdated" text="EventBridgeのコミットイベント" />
        には、
        <B text="oldCommitId" />
        (1つ前のコミット) と <B text="commitId" />
        (現在のコミット) があります
      </p>
      <p>これをEventBridgeのトリガーで設定したLambdaで取得します</p>
      <Spacer />
      <p>
        それから、CodeCommitのAPI
        <CLink link="https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/codecommit/client/get_differences.html" text="get_differences" />
        を使用して、2つのコミットを比較し、変更のあったディレクトリやファイルのパスを取得します
      </p>
      <p>また、リクエストをする際に、変更を確認したいディレクトリを指定できます</p>
      <Spacer />
      <p>そして、レスポンスがあるかないかで、そのディレクトリに変更があったのかを確認することができます</p>
      <p>
        最後に、取得したパスに応じて、if文で分岐させて、
        <CLink link="https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/codepipeline/client/start_pipeline_execution.html" text="CodePipeline" />
        を実行して終わりです!
      </p>
      <Spacer />
      <p>※CodePipeline V2であれば、CodePipeline実行時に「variables」を使用することで、CodePipeline変数が設定できます</p>
      <Spacer />
      <p>
        こちらが <CLink link="https://github.com/Flupinochan/Monorepo" text="実装例" />
        になります!
        <img src="/images/blog/sample.png" alt="sample" />
      </p>
      <Spacer />
      <H3 text="終わりに" />
      <p>以上、React(SPA)とMonorepoについてのお話でした!</p>
      <Spacer />
      <p>Monorepoは、知っておいて損はないと思います</p>
      <p>わざわざリポジトリを作成するほどではないけれど、ディレクトリやファイル単位でCI/CDを設定したい! ということは、あり得ると思ったからです</p>
      <Spacer />
      <p>今回のブログは、ここでおしまいです</p>
      <p>ご覧いただき、ありがとうございました ((*_ _))</p>
    </div>
  );
};

Blog2.metadata = metadata;

export default Blog2;

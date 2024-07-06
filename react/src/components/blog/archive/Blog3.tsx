import React from "react";

import H3 from "../tool/H3";
import H4 from "../tool/H4";
import B from "../tool/B";
import Spacer from "../tool/Spacer";
import CLink from "../tool/CLink";
import DoubleImg from "../tool/DoubleImg";
import Li from "../tool/Li";
import CodeSnippet from "../tool/CodeSnippet";

export const metadata = {
  date: "2024-05-10",
  title: "AWS CloudWatch RUM (*╹▽╹*)",
  excerpt: "ユーザ視点からのアプリケーション監視!",
  category: "AWS",
  tags: ["CloudWatch"],
  image: {
    url: "/images/blog/blog3_title.png",
    alt: "blog3_title.png",
  },
};

const Blog3: React.FC & { metadata: typeof metadata } = () => {
  return (
    <div>
      <H3 text="はじめに" />
      <p>こんにちは、MetalMentalです (*ﾟ▽ﾟ)ﾉ</p>
      <Spacer />
      <p>
        少し前に、AWSアカウントで、
        <B text="Developerサポートプラン" />
        を購入してみました
      </p>
      <p>$29しますが、AWSのエキスパートに質問し放題なので、むしろ安すぎるくらいだと思いました</p>
      <p>
        好きなAWSサービスは何ですか? と質問されたら、
        <B text="AWSサポート!" />
        と答えるかもしれませんw
      </p>
      <Spacer />
      <p>以下は、CloudWatchのメニューバーです</p>
      <Spacer />
      <img src="/images/blog/cloudwatch_menu.png" alt="cloudwatch_menu.png" />
      <Spacer />
      <p>CloudWatchは、誰でも知っている有名なサービスですが、全機能を熟知している方は、少ないのではないでしょうか?</p>
      <Spacer />
      <p>
        気づいたら
        <B text="X-Ray" />
        が組み込まれていて、
        <B text="Application Signals" />
        という新機能も追加されています…
      </p>
      <p>
        どうやらCloudWatchを、
        <B text="Datadog" />
        のようなツールに近づけているみたいです
      </p>
      <Spacer />
      <p>
        具体的には、
        <B text="Observability(Logs、Metrics、Traces)" />
        に加え、
        <B text="Application Signals" />
        をプレリリース中です
      </p>
      <p>
        今回は、その新機能の1つである
        <B text="CloudWatch RUM(Real User Monitoring)" />
        について、解説いたします (　-`ω-)
      </p>
      <Spacer />
      <H3 text="本題" />
      <H4 text="CloudWatch RUM(Real User Monitoring)とは" />
      <p>実際にWebページを訪れたユーザに、Webページにアクセスした際のパフォーマンス情報やエラーログをCloudWatchに送信させる機能です</p>
      <Spacer />
      <img src="/images/blog/cloudwatch_ram.png" alt="cloudwatch_ram.png" />
      <Spacer />
      <p>訪れたWebページ(Reactの場合はRoute)や、ロード時間、エラー情報などが確認できます!</p>
      <H4 text="実装方法" />
      <p>仕組みはシンプルで、以下2手順になります</p>
      <p>コードのサンプルは、CloudWatch RUMコンソール画面で設定完了時に表示されます</p>
      <Spacer />
      <Li text1="CloudWatch RUM コンソール画面でログの送信先となるエンドポイントを設定" text2="Webページ(HTML、JavaScript)に、エンドポイントにデータを送信するためのコードを記載" />
      <Spacer />
      <p>
        <span className="border-1 border-primary text-primary px-2 py-1 md:px-3 mr-2">1</span>に関しては、難しい設定はありません
      </p>
      <p>コンソールの設定画面に従うだけで良いです</p>
      <Spacer />
      <p>
        ポイントとしては、以下の画像のように、送信元のWebページのドメインを設定するのですが、テストなどでローカルのサーバを利用している時は、
        <B text="localhost" />
        にするとローカルからのデータも受け取れるようになるので覚えておくとよいです
      </p>
      <Spacer />
      <p>テストが終わった後で、本番用のドメインに変更してください</p>
      <Spacer />
      <img src="/images/blog/cloudwatch_ram_setting.png" alt="cloudwatch_ram_setting.png" />
      <Spacer />
      <p>
        <span className="border-1 border-primary text-primary py-1 px-2 md:px-3 mr-2">2</span>に関しては、コードを記載する必要があります
      </p>
      <p>しかし、以下のようにサンプルがあるので、コピペするだけでも設定は可能です</p>
      <Spacer />
      <img src="/images/blog/cloudwatch_ram_code.png" alt="cloudwatch_ram_code.png" />
      <Spacer />
      <p>
        また、
        <B text="npm install aws-rum-web" />
        でインストールする方法もありますが、
        <CLink link="https://github.com/aws-observability/aws-rum-web/blob/main/docs/cdn_installation.md" text="GitHub" />
        にもあるとおり、CDNを利用して、HTMLにスクリプトを埋め込む設定も可能です
      </p>
      <Spacer />
      <p>ここでは、TypeScript ReactのWebページに設定する方法を解説いたします</p>
      <p>前提として、以下のようなRoute(Webページ)があります</p>
      <Spacer />
      <CodeSnippet
        language="typescript"
        text={`import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import BlogList from "./components/blog/tool/BlogList";
import BlogRender from "./components/blog/tool/BlogRender";
import Helmet from "./components/main/Helmet";
import Header from "./components/main/Header";
import Footer from "./components/main/Footer";
import Menu from "./components/main/Menu";
import Home from "./components/home/Home";
import Chat2 from "./components/chat/Chat2";

const App: React.FC = () => {
  return (
    <div>
      <Router>
        <Helmet />
        <Header />
        <Menu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat2 />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:postId" element={<BlogRender />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;`}
      />
      <Spacer />
      <p>以下のように、RUM設定用のファイルを作成します</p>
      <p>サンプルコードをコピペし、24行目のようにexportします</p>
      <Spacer />
      <CodeSnippet
        language="typescript"
        text={`import { AwsRum, AwsRumConfig } from "aws-rum-web";

let cwr: AwsRum | null = null;
try {
  const config: AwsRumConfig = {
    sessionSampleRate: 1,
    identityPoolId: "us-west-2:a70782e0-77dd-4827-960f-20fd3a84d627",
    endpoint: "https://dataplane.rum.us-west-2.amazonaws.com",
    telemetries: ["performance", "errors", "http"],
    allowCookies: true,
    enableXRay: true,
  };

  const APPLICATION_ID: string = "9bc8a6c1-d424-4bba-a3e4-808a33a1a970";
  const APPLICATION_VERSION: string = "1.0.0";
  const APPLICATION_REGION: string = "us-west-2";

  const awsRum: AwsRum = new AwsRum(APPLICATION_ID, APPLICATION_VERSION, APPLICATION_REGION, config);
  cwr = awsRum;
} catch (error) {
  // Ignore errors thrown during CloudWatch RUM web client initialization
}

export const getRum = () => {
  return cwr;
};`}
      />
      <Spacer />
      <p>データを送信したいWebページで、以下のようにuseEffectとrecordPageViewを使用して、Webページがレンダリングされた際に、データを送信するようにします</p>
      <Spacer />
      <p>useLocationを使用して、React Route情報を送信していることが分かりますね!</p>
      <CLink link="https://aws.amazon.com/jp/blogs/mt/using-amazon-cloudwatch-rum-with-a-react-web-application-in-five-steps/" text="※参考 AWS Blog" />
      <p>以下のように、本ブログのページも設定しています</p>
      <Spacer />
      <CodeSnippet
        language="typescript"
        text={`import React from "react";
import { useLocation } from "react-router-dom";

import { getRum } from "../../../../CloudWatchRUM";

const Blog20240510: React.FC = () => {
  const location = useLocation();
  React.useEffect(() => {
    const cwr = getRum();
    if (!cwr) return;
    console.log("logging pageview to cwr: " + location.pathname);
    cwr.recordPageView(location.pathname);
  }, [location]);
  return (
    <div id="blog0510">
      <h2 className="custom-h2 animate-slidelefth2">AWS CloudWatch RUMによるユーザ視点からの監視 (*╹▽╹*)</h2>`}
      />
      <Spacer />
      <p>Webページを訪れて、f12キーを押し、以下のようにPOSTでデータが送信されていれば設定完了です(v´∀`*)</p>
      <Spacer />
      <img src="/images/blog/cloudwatch_ram_f12.png" alt="cloudwatch_ram_f12.png" />
      <Spacer />
      <H3 text="おわりに" />
      <p>GWは、X-RayやGrafanaについても学びました</p>
      <p>Observabilityについての知見を深めたかったからです</p>
      <Spacer />
      <p>Observerになれるよう頑張ります ( ㅍ_ㅍ)</p>
      <Spacer />
      <p>
        今回のブログは、ここでおしまいです
        <br />
        ご覧いただき、ありがとうございました ((*_ _))
      </p>
    </div>
  );
};

Blog3.metadata = metadata;

export default Blog3;

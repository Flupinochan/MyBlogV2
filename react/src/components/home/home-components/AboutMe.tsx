import React from "react";

import H2 from "./tool/H2";
import H3 from "./tool/H3";

const AboutMe: React.FC = () => {
  return (
    <div>
      {/* md以上 */}
      <div className="hidden md:block pt-16 pb-1 px-28">
        <H2 text="About Me" />
        <div className="my-10 pt-3 pb-5 pl-12">
          <H3 text="経歴" colorType="green" />
          <p className="pb-10 pl-5 text-green-600 leading-relaxed">
            学生時代は、BlenderやMMDでアニメーション作成をしていました
            <br />
            卒業した後は、すき屋でワンオペを行い、気づいたらエンジニアになっていました
          </p>
          <H3 text="得意分野" colorType="green" />
          <p className="pb-10 pl-5 text-green-600 leading-relaxed">
            IaCによるCI/CD環境構築です
            <br />
            最近は、サーバレスや生成AIを中心に勉強しています
          </p>
          <H3 text="趣味" colorType="green" />
          <p className="pb-10 pl-5 text-green-600 leading-relaxed">
            アニメを見ながら、新サービスの検証やコードを書くこと!
            <br />
            自作アバターで、メタバースを探索すること!
          </p>
        </div>
      </div>
      {/* md以下 */}
      <div className="md:hidden pt-10 pb-1 pl-10 pr-7">
        <H2 text="About Me" />
        <div className="my-5 pt-3 pb-5">
          <H3 text="経歴" colorType="green" />
          <p className="pb-10 pl-5 text-green-600 leading-relaxed">
            学生時代は、BlenderやMMDでアニメーション作成をしていました
            <br />
            卒業した後は、すき屋でワンオペを行い、気づいたらエンジニアになっていました
          </p>
          <H3 text="得意分野" colorType="green" />
          <p className="pb-10 pl-5 text-green-600 leading-relaxed">
            IaCによるCI/CD環境構築です
            <br />
            最近は、サーバレスや生成AIを中心に勉強しています
          </p>
          <H3 text="趣味" colorType="green" />
          <p className="pb-10 pl-5 text-green-600 leading-relaxed">
            アニメを見ながら、新サービスの検証やコードを書くこと!
            <br />
            自作アバターで、メタバースを探索すること!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;

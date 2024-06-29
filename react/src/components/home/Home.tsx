import React from "react";
import Title from "./home-components/Title";
import Skills from "./home-components/Skills";
import AboutMe from "./home-components/AboutMe";
import Content from "./home-components/Content";
import Contact from "./home-components/Contact";

const Home: React.FC = () => {
  return (
    <div>
      <Title />
      <div className="bg-black bg-opacity-30 mt-32 md:mx-4">
        <Skills />
      </div>
      <div className="bg-black bg-opacity-30 mt-10 md:mx-4">
        <AboutMe />
      </div>
      <div className="bg-black bg-opacity-30 mt-10 md:mx-4">
        <Content />
      </div>
      <div className="bg-black bg-opacity-30 mt-10 md:mx-4">
        <Contact />
      </div>
    </div>
  );
};

export default Home;

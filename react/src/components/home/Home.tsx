import React, { useEffect } from "react";

import Title from "./home-components/Title";
import Skills from "./home-components/Skills";
import AboutMe from "./home-components/AboutMe";
import Content from "./home-components/Content";
import Contact from "./home-components/Contact";

const Home: React.FC = () => {
  return (
    <div>
      <div className="hidden md:block">
        <div data-aos="fade-in">
          <Title />
        </div>
        <div className="bg-black bg-opacity-30 mt-32 md:mx-4" data-aos="fade-in" data-aos-offset="300">
          <Skills />
        </div>
        <div className="bg-black bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="300">
          <AboutMe />
        </div>
        <div className="bg-black bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="300">
          <Content />
        </div>
        <div className="bg-black bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="300">
          <Contact />
        </div>
      </div>
      <div className="md:hidden">
        <div data-aos="fade-in">
          <Title />
        </div>
        <div className="bg-black bg-opacity-30 mt-32 md:mx-4" data-aos="fade-in" data-aos-offset="200">
          <Skills />
        </div>
        <div className="bg-black bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="200">
          <AboutMe />
        </div>
        <div className="bg-black bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="200">
          <Content />
        </div>
        <div className="bg-black bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="200">
          <Contact />
        </div>
      </div>
    </div>
  );
};

export default Home;

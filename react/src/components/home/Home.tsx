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
        <div className="bg-black border-1 border-primary bg-opacity-30 mt-32 md:mx-4" data-aos="fade-in" data-aos-offset="250">
          <Skills />
        </div>
        <div className="bg-black border-1 border-primary bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="250">
          <AboutMe />
        </div>
        <div className="bg-black border-1 border-primary bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="250">
          <Content />
        </div>
        <div className="bg-black border-1 border-primary bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="250">
          <Contact />
        </div>
      </div>
      <div className="md:hidden">
        <div data-aos="fade-in">
          <Title />
        </div>
        <div className="bg-black border-1 border-primary bg-opacity-30 mt-32 md:mx-4" data-aos="fade-in" data-aos-offset="100">
          <Skills />
        </div>
        <div className="bg-black border-1 border-primary bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="100">
          <AboutMe />
        </div>
        <div className="bg-black border-1 border-primary bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="100">
          <Content />
        </div>
        <div className="bg-black border-1 border-primary bg-opacity-30 mt-10 md:mx-4" data-aos="fade-in" data-aos-offset="100">
          <Contact />
        </div>
      </div>
    </div>
  );
};

export default Home;

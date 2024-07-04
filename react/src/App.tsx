import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import BlogList from "./components/blog/tool/BlogList";
import BlogRender from "./components/blog/tool/BlogRender";

import Helmet from "./components/main/Helmet";
import Header from "./components/main/Header";
import Footer from "./components/main/Footer";
import Menu from "./components/main/Menu";
import Home from "./components/home/Home";
// import Chat from "./components/chat/Chat";
import Chat2 from "./components/chat/Chat2";
import ScrollToTopButton from "./components/home/home-components/tool/TopScroll";

const App: React.FC = () => {
  //////////////////////////
  /// Scroll Bar Setting ///
  //////////////////////////

  ///////////
  /// AOS ///
  ///////////
  useEffect(() => {
    AOS.init();
  }, []);
  /////////////////
  /// Rendering ///
  /////////////////
  return (
    <div className="min-h-screen bg-background text-foreground dark px-3 pb-32 lg:px-5 tracking-wide text-xl">
      <NextUIProvider>
        <main className="min-h-screen">
          <Router>
            <Helmet />
            <div className="sticky top-0 pt-3 lg:pt-5 backdrop-filter backdrop-blur-lg z-50">
              <Header />
              <Menu />
            </div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat2 />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:postId" element={<BlogRender />} />
            </Routes>
            <div className="relative">
              <ScrollToTopButton />
            </div>
            <Footer />
          </Router>
        </main>
      </NextUIProvider>
    </div>
  );
};

export default App;

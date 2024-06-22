import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";

import Helmet from "./components/main/Helmet";
import Chat from "./components/chat/Chat";

const App: React.FC = () => {
  return (
    <div className="h-screen dark text-foreground bg-background">
      <NextUIProvider>
        <Router>
          <Helmet />
          <Chat />
        </Router>
      </NextUIProvider>
    </div>
  );
};

export default App;

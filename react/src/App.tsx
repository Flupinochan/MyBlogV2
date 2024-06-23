import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";

import Helmet from "./components/main/Helmet";
import Chat from "./components/chat/Chat";
import Chat2 from "./components/chat/Chat2";

const App: React.FC = () => {
  return (
    <div className="h-screen dark text-foreground bg-background">
      <NextUIProvider>
        <Router>
          <Helmet />
          {/* <Chat /> */}
          <Chat2 />
        </Router>
      </NextUIProvider>
    </div>
  );
};

export default App;

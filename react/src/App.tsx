import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";

import Helmet from "./components/main/Helmet";
import Chat from "./components/chat/Chat";
import Chat2 from "./components/chat/Chat2";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <NextUIProvider>
        <main className="min-h-screen">
          <Router>
            <Helmet />
            {/* <Chat /> */}
            <Chat2 />
          </Router>
        </main>
      </NextUIProvider>
    </div>
  );
};

export default App;

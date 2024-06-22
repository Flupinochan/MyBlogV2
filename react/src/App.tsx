import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Helmet from "./components/main/Helmet";
import Chat from "./components/chat/Chat";

const App: React.FC = () => {
  return (
    <div>
      <Router>
        <Helmet />
        <Chat />
      </Router>
    </div>
  );
};

export default App;

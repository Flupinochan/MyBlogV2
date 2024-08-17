import React from "react";
import { Watch } from "react-loader-spinner";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0D1117] z-[9999]">
      <div className="flex flex-col items-center">
        <Watch visible={true} height="160" width="160" radius="48" color="#7828C8" ariaLabel="watch-loading" />
        <p className="text-purple-500 mt-8 text-4xl">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;

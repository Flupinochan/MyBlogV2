import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import SyntaxHighlighter from "react-syntax-highlighter";
import atomOneDark from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

interface Props {
  language: string;
  text: string;
}

const CodeSnippet: React.FC<Props> = (props) => {
  const [isCopied, setIsCopied] = useState(false);
  const onCopyClick = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative">
      <CopyToClipboard text={props.text} onCopy={onCopyClick}>
        <button className={`absolute top-2 right-2 px-2 py-1 text-white rounded ${isCopied ? "bg-primary" : "bg-gray-500 hover:bg-gray-600"}`}>{isCopied ? "Copied!" : "Copy"}</button>
      </CopyToClipboard>
      <SyntaxHighlighter
        language={props.language}
        style={atomOneDark}
        showLineNumbers
        codeTagProps={{
          style: {
            fontSize: "20px",
          },
        }}
      >
        {props.text}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeSnippet;

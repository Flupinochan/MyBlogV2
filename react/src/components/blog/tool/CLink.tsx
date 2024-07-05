import React from "react";
import { Link } from "@nextui-org/react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface Text {
  link: string;
  text: string;
}

const CLink: React.FC<Text> = (props) => {
  return (
    <Link isExternal isBlock size="lg" color="secondary" href={props.link}>
      <div className="flex flex-row space-x-1">
        <p className="text-xl">{props.text}</p> <OpenInNewIcon />
      </div>
    </Link>
  );
};

export default CLink;

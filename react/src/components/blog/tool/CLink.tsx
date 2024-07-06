import React from "react";
import { Link } from "@nextui-org/react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useMediaQuery, useTheme } from "@mui/material";

interface Text {
  link: string;
  text: string;
}

const CLink: React.FC<Text> = (props) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Link isExternal isBlock size="lg" color="secondary" href={props.link}>
      <div className="flex flex-row space-x-1">
        <p className="text-sm md:text-xl">{props.text}</p>
        <OpenInNewIcon fontSize={isMdUp ? "medium" : "small"} />
      </div>
    </Link>
  );
};

export default CLink;

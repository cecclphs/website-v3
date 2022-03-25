import React from "react";
import ArrowRightIcon from "@mui/icons-material/ArrowRightRounded";
import { NodeModel } from "@minoru/react-dnd-treeview";
import { DescriptionTwoTone, Folder, Image, ListAltTwoTone } from "@mui/icons-material";

export const TypeIcon = (props) => {
    if (props.droppable) {
      return <Folder />;
    }
  
    switch (props.fileType) {
      case "image": return <Image />;
      case "csv": return <ListAltTwoTone />;
      case "text": return <DescriptionTwoTone />;
      default: return null;
    }
};

export const CustomNode = (props) => {
  const { droppable, data } = props.node;
  const indent = props.depth * 24;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onToggle(props.node.id);
  };

  return (
    <div
      className={`tree-node flex flex-row items-center`}
      style={{ paddingInlineStart: indent }}
    >
      <div
        className={`flex cursor-pointer ${
          props.isOpen ? "" : ""
        }`}
      >
        {props.node.droppable && (
          <div onClick={handleToggle}>
            <ArrowRightIcon />
          </div>
        )}
      </div>
      <div>
        <TypeIcon droppable={droppable} fileType={data?.fileType} />
      </div>
      <div className={``}>
        <p className="text-lg">{props.node.text}</p>
      </div>
    </div>
  );
};

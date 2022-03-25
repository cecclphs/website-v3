import React from "react";
import ArrowRightIcon from "@mui/icons-material/ArrowRightRounded";
import { NodeModel } from "@minoru/react-dnd-treeview";
import {
  DescriptionTwoTone,
  Folder,
  GifBoxTwoTone,
  Image,
  ListAltTwoTone,
} from "@mui/icons-material";

export const TypeIcon = (props) => {
  if (props.droppable) {
    return <GifBoxTwoTone />;
  }

  switch (props.fileType) {
    case "image":
      return <Image />;
    case "csv":
      return <ListAltTwoTone />;
    case "text":
      return <DescriptionTwoTone />;
    default:
      return null;
  }
};

export const CustomNode = (props) => {
  const { droppable, data, text } = props.node;
  const indent = props.depth * 24;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onToggle(props.node.id);
  };

  return (
    <div
      className={`tree-node`}
      style={{ paddingInlineStart: indent }}
    >
        <div className="flex flex-row items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-200">
            <div
                className={`flex cursor-pointer transition-transform duration-200 ${
                props.isOpen ? "rotate-90" : ""}`}>
                {droppable && (
                <div onClick={handleToggle}>
                    <ArrowRightIcon />
                </div>
                )}
            </div>
            <div>
                <TypeIcon droppable={droppable} fileType={data?.fileType} />
            </div>
            <div className={`flex flex-col`}>
                <p className="text-lg">{text}</p>
                {data?.simpleId && <p className="text-sm">{data.simpleId}</p>}
                {data?.type && data?.type != 'item' && <p className="text-sm">{data.type}</p>}
            </div>
        </div>
    </div>
  );
};

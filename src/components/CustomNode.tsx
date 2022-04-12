import React from "react";
import ArrowRightIcon from "@mui/icons-material/ArrowRightRounded";
import { NodeModel } from "@minoru/react-dnd-treeview";
import {
  DescriptionTwoTone,
  Folder,
  GifBoxTwoTone,
  Image,
  IndeterminateCheckBoxRounded,
  ListAltTwoTone,
  LocationOnTwoTone,
  PrecisionManufacturingTwoTone,
} from "@mui/icons-material";
import { useDialog } from "../hooks/useDialog";
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import InventoryItem from "../types/Inventory";
import InventoryItemViewer from "./InventoryItemViewer";

export const TypeIcon = (props: { type: InventoryItem["type"] }) => {
  // if (props.droppable) {
  //   return <GifBoxTwoTone />;
  // }

  switch (props.type) {
    case "location":
      return <LocationOnTwoTone />;
    case "project":
      return <PrecisionManufacturingTwoTone />;
    case "container":
      return <IndeterminateCheckBoxRounded />;
    default:
      return <></>;
  }
};

type Props = {
  node: NodeModel<InventoryItem>;
  depth: number;
  isOpen: boolean;
  isSelected: boolean;
  onToggle: (id: NodeModel["id"]) => void;
  onSelect: (node: NodeModel) => void;
};

export const CustomNode = (props : Props) => {
  const [openDialog, closeDialog] = useDialog();
  const { droppable, data, text } = props.node as NodeModel<InventoryItem>;
  const indent = props.depth * 24;
  const handleSelect = () => props.onSelect(props.node);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onToggle(props.node.id);
  };

  const handleClicked = (e: React.MouseEvent) => {
    openDialog({
      children: (
        <>
          <DialogContent>
            <InventoryItemViewer item={data}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Close</Button>
          </DialogActions>
        </>
      ),
    });
  };

  return (
    <div className={`tree-node`} style={{ paddingInlineStart: indent }}>
      <div className="flex flex-row items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-200">
        <div
          className={`flex cursor-pointer transition-transform duration-200 ${
            props.isOpen ? "rotate-90" : ""
          }`}
        >
          {droppable && (
            <div onClick={handleToggle}>
              <ArrowRightIcon />
            </div>
          )}
        </div>
        <div>
          {data.type == 'item' && <Checkbox
            color="primary"
            size="small"
            checked={props.isSelected}
            onClick={handleSelect}
          />}
        </div>
        <div>
          <TypeIcon type={data.type} />
        </div>
        <div className={`flex flex-col`} onClick={handleClicked}>
          <p className="text-lg">
            {text} {data?.type == "item" ? `×${data?.quantity}` : ""}
          </p>
          {data?.simpleId && <p className="text-sm">{data.simpleId}</p>}
          {data?.type != "item" && <p className="text-sm">{data.type}</p>}
        </div>
      </div>
    </div>
  );
};

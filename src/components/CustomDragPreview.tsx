import React from "react";
import { DragLayerMonitorProps } from "@minoru/react-dnd-treeview";
import styles from "./CustomDragPreview.module.css";
import InventoryItem from "../types/Inventory";
import ArrowRightIcon from '@mui/icons-material/ArrowRightRounded';
import {TypeIcon} from './CustomNode';

type Props = {
  monitorProps: DragLayerMonitorProps<InventoryItem>;
};

export const CustomDragPreview: React.FC<Props> = (props) => {
    const item = props.monitorProps.item;
    const { data, text } = item
    return (
        <div className="flex flex-row items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-200">
            {/* <div>
                 <TypeIcon droppable={droppable} fileType={data?.fileType} />
            </div> */}
            <div className={`flex flex-col`}>
                <p className="text-lg">{text}</p>
                {data?.simpleId && <p className="text-sm">{data.simpleId}</p>}
                {data?.type && data?.type != 'item' && <p className="text-sm">{data.type}</p>}
            </div>
        </div>
    );
};

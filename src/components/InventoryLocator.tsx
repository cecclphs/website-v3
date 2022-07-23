import { SearchOutlined } from "@mui/icons-material";
import {FC, useState, useEffect} from 'react';
import {useAlgolia} from 'use-algolia';
import InventoryItem from '../types/Inventory';
import React from 'react';
import { TransitionGroup } from "react-transition-group";
import { Collapse, Dialog, DialogContent } from "@mui/material";
import { useDialog } from "../hooks/useDialog";
import InventoryItemViewer from "./InventoryItemViewer";
import { doc, getDoc } from "firebase/firestore";
import { db, docConverter } from "../config/firebase";

  
type InventoryHit = {
    simpleId: InventoryItem['simpleId'];
    description: InventoryItem['description'];
    parent: InventoryItem['parent'];
    status: InventoryItem['status'];
    objectID: string;
}
const InventoryLocatorDialog: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [searchState, requestDispatch, getMore] = useAlgolia<InventoryHit>(
        'UCUWLZ1S98',
        '4b8223c4366da4889262234911b1349f',
        'inventory',
        { hitsPerPage: 5 }
    );
    const { hits, response, loading, hasMore } = searchState;
    const [openDialog, closeDialog] = useDialog();
  
    useEffect(() => {
        if(open) requestDispatch({ query: '', filter: ''})
    }, [open]);
    
    useEffect(() => {
        console.log(inputValue)
        requestDispatch({ query: inputValue, filter: ''});
    }, [inputValue]);

    const handleClick = (hit: InventoryHit) => async () => {
        const itemSnapshot = await getDoc(doc(db, 'inventory', hit.objectID).withConverter(docConverter));
        const item = await itemSnapshot.data() as InventoryItem;
        openDialog({
            children: <DialogContent>
                <InventoryItemViewer item={item} onClose={onClose} />
            </DialogContent>
        })
    }

    return (<>
        <DialogContent>
            <h1 className="text-2xl font-semibold">Locate Item</h1>
            <div className="flex flex-row items-center w-80 bg-gray-200 text-gray-700  py-2  px-4 rounded focus:bg-gray-300 focus:border-gray-500">
                <SearchOutlined className="text-gray-500 w-8 h-8" />
                <input className="appearance-none ml-1 flex-1 border-0 leading-tight focus:outline-none bg-gray-200 ring-0 focus:border-0"
                type="input"
                id="search-box"
                autoComplete="off"
                placeholder="Search Items"
                value={inputValue || ""}
                onChange={event => setInputValue(event.currentTarget.value)} 
                onFocus={() => setInputValue("")}
                onBlur={() => setInputValue(null)}/>
            </div>
            <div className="flex flex-col mt-2 shadow-xl bg-white rounded-xl overflow-hidden min-w-[400px] max-h-[60vh] overflow-y-auto scrollbar-hide">
                <TransitionGroup>
                    {hits.map(hit => (
                    <Collapse in key={hit.objectID}>
                        <div className="flex flex-col justify-between py-3 px-4 space-y-1 hover:bg-gray-100" onClick={handleClick(hit)}>
                            <div className="flex-col">
                                <h3 className="font-semibold">{hit.description}</h3>
                                <div className="text-sm">{hit.simpleId}</div>
                            </div>
                        </div>
                    </Collapse>
                    ))}
                </TransitionGroup>
            </div>
        </DialogContent>    
    </>)
}

const InventoryLocator = () => {
    const [openDialog, closeDialog] = useDialog();

    const onclickdialog = () => {
        openDialog({
            children: <InventoryLocatorDialog onClose={closeDialog} />,
        });
    }

    return (
        <div className="flex flex-row items-center w-80 bg-gray-200 text-gray-700  py-3 px-4 rounded" onClick={onclickdialog}>
            <SearchOutlined className="text-gray-500 w-8 h-8" />
            <div className="appearance-none ml-1 flex-1 border-0 leading-tight focus:outline-none bg-gray-200 ring-0 focus:border-0">
                Search Items
            </div>
        </div>
    )
}


export default InventoryLocator;
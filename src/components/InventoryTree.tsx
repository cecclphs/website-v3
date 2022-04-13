import {collection, deleteDoc, doc, getDoc, onSnapshot, query, Unsubscribe, updateDoc, where} from 'firebase/firestore';
import {useEffect, useMemo, useState} from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {db, docConverter} from '../config/firebase';
import InventoryItem from '../types/Inventory';
import { NodeModel, Tree } from '@minoru/react-dnd-treeview';
import {CustomNode} from './CustomNode';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';

const nodeSnapshots: {[parents: string]: Unsubscribe} = {};
let previousOpen = [];

const InventoryTree = ({ parent }: {parent: string}) => {
    const [parents = [], loading, error] = useCollectionData<InventoryItem>(query(collection(db, 'inventory').withConverter(docConverter), where('parent', '==', parent)));
    const [nodeData, setNodeData] = useState<{[x:string]: InventoryItem}>({});
    const [treeData, setTreeData] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState<NodeModel<InventoryItem>[]>([]);
    const router = useRouter();
    
    const handleSelect = (node: NodeModel<InventoryItem>) => {
        const item = selectedNodes.find((n) => n.id === node.id);
    
        if (!item) {
          setSelectedNodes([...selectedNodes, node]);
        } else {
          setSelectedNodes(selectedNodes.filter((n) => n.id !== node.id));
        }
      };
    
    const handleClear = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          setSelectedNodes([]);
        }
    };

    const canMergeItems = useMemo(() => {
        if(selectedNodes.length < 2) return false;
        //check selected nodes dont have ids and have same descriptions
        const selectedDescriptions = selectedNodes.map((n) => n.data.description);
        const selectedIds = selectedNodes.map((n) => n.id);
        return selectedDescriptions.every((d) => d === selectedDescriptions[0]);
    }, [selectedNodes])
    
    const handleMergeItems = async () => {
        if(!canMergeItems) return;
        //get the sum of all quantities
        const totalQuantity = selectedNodes.reduce((acc, n) => acc + n.data.quantity, 0);
        //update first node to have the sum of all quantities
        await updateDoc(selectedNodes[0].data.ref, {
            quantity: totalQuantity
        })
        //delete all other nodes
        await Promise.all(selectedNodes.slice(1).map((node) => deleteDoc(node.data.ref)))
    }

    const handleDrop = (newTreeData, { dragSourceId, dropTargetId }) => {
        updateDoc(doc(db, 'inventory', dragSourceId), {
            parent: dropTargetId
        })
    } 
    //TODO: Implement more features of dnd from https://github.com/minop1205/react-dnd-treeview

    // fetch node details when opening a node :)
    const onChangeOpen = (data: string[]) => {
        //check with previous open to see if there is any change
        const difference = data.filter(item => !previousOpen.includes(item));
        if(difference.length > 0) {
            console.log('added ', difference[0])
            //new node open, need to add snapshot of child nodes
            if(nodeSnapshots[difference[0]]) nodeSnapshots[difference[0]]();
            nodeSnapshots[difference[0]] = onSnapshot(
                query(
                    collection(db, 'inventory')
                        .withConverter(docConverter), 
                    where('parent', '==', difference[0])
                ), (snapshot) => {
                    setNodeData((state) => {
                        const newNodeData = {...state};
                        snapshot.docs.forEach(doc => newNodeData[doc.id] = doc.data());
                        console.log(newNodeData)
                        return newNodeData;
                    });
                    
                })
        } else {
            //node closed, remove snapshot
            const id = previousOpen.filter(item => !data.includes(item))[0]
            console.log('removed ', id)
            if(id && nodeSnapshots[id]) nodeSnapshots[id]();
            delete nodeSnapshots[id];
        }
        previousOpen = data;
    }

    
    useEffect(() => {
        if(parents.length == 0) return;
        //merge the objects of parent and nodeData into one objcet
        //convert parents into object
        const parentsObj = parents.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
        }, {})
        const inventoryObj: {[x: string]: InventoryItem} = { ...parentsObj, ...nodeData };
        const inventory = Object.values(inventoryObj);
        const tree = inventory.map(item => ({
            id: item.id,
            parent: item.parent || 0,
            text: item.description,
            droppable: item.type != 'item',
            data: item
        }))
        console.log(tree)
        setTreeData(tree)
    }, [parents, nodeData])
    
    //unsubscribe to all nodeSnapshots
    useEffect(() => () => {Object.values(nodeSnapshots).map(unsubscribe => unsubscribe())}, [])

    return (
        <div className="flex flex-col space-y-2 mt-2">
            <div className="rounded-lg bg-gray-50 p-2">
                <p>{selectedNodes.length} Items Selected</p>
                <Button disabled={selectedNodes.length == 0} onClick={() => setSelectedNodes([])}>Clear</Button>
                <Button disabled={!canMergeItems} onClick={handleMergeItems}>Merge</Button>

            </div>
            {parent != null && <div className="flex flex-row items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-200" onClick={async () => {
                //get this item
                const item = await getDoc(doc(db, 'inventory', parent).withConverter(docConverter));
                const { newParent } = item.data() || {}
                router.push('/inventory?parent=' + (newParent == null)?"":newParent)
            }}>
                ...
            </div>}
            <Tree
                key={parent}
                tree={treeData}
                rootId={parent || 0}
                onDrop={handleDrop}
                onChangeOpen={onChangeOpen}
                // dragPreviewRender={(
                //     monitorProps: DragLayerMonitorProps<InventoryItem>
                //   ) => <CustomDragPreview monitorProps={monitorProps} />}
                classes={{
                    dropTarget: 'bg-blue-200',
                }}
                render={(
                    node:NodeModel<InventoryItem>, 
                    { depth, isOpen, onToggle }
                ) => (
                    <CustomNode
                        node={node}
                        depth={depth}
                        isOpen={isOpen}
                        isSelected={!!selectedNodes.find((n) => n.id === node.id)}
                        onToggle={onToggle}
                        onSelect={handleSelect}
                    />
                )}
            />
        </div>
    )
}

export default InventoryTree;
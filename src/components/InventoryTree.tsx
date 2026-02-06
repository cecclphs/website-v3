import {collection, deleteDoc, doc, getDoc, onSnapshot, query, Unsubscribe, updateDoc, where} from 'firebase/firestore';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {db, docConverter} from '../config/firebase';
import InventoryItem from '../types/Inventory';
import { NodeModel, Tree } from '@minoru/react-dnd-treeview';
import {CustomNode} from './CustomNode';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';

const InventoryTree = ({ parent }: {parent: string}) => {
    const [parents = [], loading, error] = useCollectionData<InventoryItem>(query(collection(db, 'inventory').withConverter(docConverter), where('parent', '==', parent)));
    const [nodeData, setNodeData] = useState<{[x:string]: InventoryItem}>({});
    const [treeData, setTreeData] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState<NodeModel<InventoryItem>[]>([]);
    const [previousOpen, setPreviousOpen] = useState<string[]>([]);
    const nodeSnapshotsRef = useRef<{[parents: string]: Unsubscribe}>({});
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
        const selectedDescriptions = selectedNodes.map((n) => n.data.description);
        return selectedDescriptions.every((d) => d === selectedDescriptions[0]);
    }, [selectedNodes])

    const handleMergeItems = async () => {
        if(!canMergeItems) return;
        const totalQuantity = selectedNodes.reduce((acc, n) => acc + n.data.quantity, 0);
        await updateDoc(selectedNodes[0].data.ref, {
            quantity: totalQuantity
        })
        await Promise.all(selectedNodes.slice(1).map((node) => deleteDoc(node.data.ref)))
    }

    const handleDrop = (newTreeData, { dragSourceId, dropTargetId }) => {
        updateDoc(doc(db, 'inventory', dragSourceId), {
            parent: dropTargetId
        })
    }

    const onChangeOpen = (data: string[]) => {
        const nodeSnapshots = nodeSnapshotsRef.current;
        const difference = data.filter(item => !previousOpen.includes(item));
        if(difference.length > 0) {
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
                        return newNodeData;
                    });
                })
        } else {
            const id = previousOpen.filter(item => !data.includes(item))[0]
            if(id && nodeSnapshots[id]) nodeSnapshots[id]();
            delete nodeSnapshots[id];
        }
        setPreviousOpen(data);
    }


    useEffect(() => {
        if(parents.length === 0) return;
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
            droppable: item.type !== 'item',
            data: item
        }))
        setTreeData(tree)
    }, [parents, nodeData])

    // Cleanup all snapshot listeners on unmount
    useEffect(() => {
        return () => {
            Object.values(nodeSnapshotsRef.current).forEach(unsubscribe => {
                if (typeof unsubscribe === 'function') unsubscribe();
            });
            nodeSnapshotsRef.current = {};
        };
    }, [])

    return (
        <div className="flex flex-col space-y-2 mt-2">
            <div className="rounded-lg bg-gray-50 p-2">
                <p>{selectedNodes.length} Items Selected</p>
                <Button disabled={selectedNodes.length === 0} onClick={() => setSelectedNodes([])}>Clear</Button>
                <Button disabled={!canMergeItems} onClick={handleMergeItems}>Merge</Button>
            </div>
            {parent != null && <div className="flex flex-row items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-200" onClick={async () => {
                const item = await getDoc(doc(db, 'inventory', parent).withConverter(docConverter));
                const { newParent } = item.data() || {}
                router.push('/inventory?parent=' + (newParent == null ? "" : newParent))
            }}>
                ...
            </div>}
            <Tree
                key={parent}
                tree={treeData}
                rootId={parent || 0}
                onDrop={handleDrop}
                onChangeOpen={onChangeOpen}
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

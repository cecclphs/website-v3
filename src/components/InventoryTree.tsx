import {collection, doc, onSnapshot, query, Unsubscribe, updateDoc, where} from 'firebase/firestore';
import {useEffect, useState} from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {db, docConverter} from '../config/firebase';
import InventoryItem from '../types/Inventory';
import {Tree} from '@minoru/react-dnd-treeview';
import {CustomNode} from './CustomNode';

const nodeSnapshots: {[parents: string]: Unsubscribe} = {};
let previousOpen = [];
const InventoryTree = ({ parent = null }: {parent: string | null}) => {
    const [parents = [], loading, error] = useCollectionData<InventoryItem>(query(collection(db, 'inventory').withConverter(docConverter), where('parent', '==', parent)));
    const [nodeData, setNodeData] = useState<{[x:string]: InventoryItem}>({});
    const [treeData, setTreeData] = useState([]);

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
                    const newNodeData = {...nodeData};
                    snapshot.docs.forEach(doc => newNodeData[doc.id] = doc.data());
                    setNodeData(newNodeData);
                })
        } else {
            //node closed, remove snapshot
            const id = previousOpen.filter(item => !data.includes(item))[0]
            console.log('removed ', id)
            if(id) nodeSnapshots[id]();
            delete nodeSnapshots[id];
        }
        previousOpen = data;
    }

    
    useEffect(() => {
        if(parents.length == 0) return;
        //merge the objects of parent and nodeData into one objcet
        const inventory = [...parents, ...Object.values(nodeData)];
        const tree = inventory.map(item => ({
            id: item.id,
            parent: item.parent || 0,
            text: item.description,
            droppable: item.type != 'item',
            data: item
        }))
        // console.log(tree)
        setTreeData(tree)
    }, [parents, nodeData])
    
    //unsubscribe to all nodeSnapshots
    useEffect(() => () => {Object.values(nodeSnapshots).map(unsubscribe => unsubscribe())}, [])

    return (
        <Tree
            tree={treeData}
            rootId={parent || 0}
            onDrop={handleDrop}
            onChangeOpen={onChangeOpen}
            classes={{
            }}
            render={(node, { depth, isOpen, onToggle }) => (
                <CustomNode
                    node={node}
                    depth={depth}
                    isOpen={isOpen}
                    onToggle={onToggle}
                />
            )}
        />
    )
}

export default InventoryTree;
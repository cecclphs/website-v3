import { Breadcrumbs, Button, TextField } from "@mui/material";
import { collection, doc, DocumentReference, getDoc, query, where } from "firebase/firestore";
import { FC, HTMLAttributes, MouseEvent, useEffect, useMemo, useState } from "react";
import { db, docConverter } from "../config/firebase";
import StudentDetails from "../types/StudentDetails";
import { ShortStudentInfo } from "../types/User";
import { useCollection, useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import InventoryItem from "../types/Inventory";
import { Add, Folder, Remove } from "@mui/icons-material";
import { useDialog } from "../hooks/useDialog";

const ItemDialog: FC<{
    item: InventoryItem;
    onDone: (item: InventoryItem, quantity: number) => void;
    onClose: () => void;
    defaultQuantity: number;
}> = ({ item, onDone, onClose, defaultQuantity }) => {
    const [quantity, setQuantity] = useState(defaultQuantity);

    return <div className="min-w-[312px]">
        <div className="flex flex-col p-4">
            <img src={item.metadata?.image} className="w-full object-contain" />
            <div className="h-[100px] flex flex-col justify-between">
                <div className="flex flex-row justify-between items-center">
                    <div>
                        <h1 className="text-xl font-semibold -mb-1">{item.description}</h1>
                        <p className="text-sm">{item.quantity || 1} in stock</p>
                    </div>
                    <h3 className="text-2xl font-semibold">RM{item.metadata?.price?.toFixed(2) || "No price"}</h3>
                </div>
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row space-x-1">
                        <div className="h-8 w-8 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 grid place-items-center transition" onClick={() => quantity > 0?setQuantity(quantity-1):null}>
                            <Remove/>
                        </div>
                        <div className="h-8 w-12 rounded-lg text-gray-600 bg-gray-200 grid place-items-center font-semibold">{quantity}</div>
                        <div className="h-8 w-8 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 grid place-items-center transition" onClick={() => (quantity < (item.quantity || 0))?setQuantity(quantity+1):null}>
                            <Add />
                        </div>
                    </div>
                    <Button variant="contained" color="primary" onClick={() => onDone(item, quantity)}>
                        Set
                    </Button>
                </div>
            </div>
        </div>
    </div>
}

const StoreItem: FC<{ 
    item: InventoryItem,
    onItemClick: (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, item: InventoryItem) => void,
 } & HTMLAttributes<HTMLDivElement>> = ({ item, onItemClick, ...props }) => {
    return (<div className="p-2 shadow-lg rounded-md h-[170px] w-48 hover:bg-gray-50 transition-colors cursor-pointer" onClick={(e) => onItemClick(e, item)} {...props}>
        {item.type != "item" ? <div className="h-full w-full grid place-items-center">
            <div className="flex flex-row items-center space-x-1 text-gray-600">
                <Folder/>
                <h5 className="text-xl font-normal select-none">{item.description}</h5>
            </div>
        </div> : <div className="flex flex-col h-full">
            <img src={item.metadata?.image} className="h-full w-full object-contain flex-1" />
            <div className="flex flex-col h-[70px] justify-between">
                <div>
                    <h5 className="text-lg font-semibold -mb-1">{item.description}</h5>
                    <p className="text-sm text-gray-700">{item?.quantity || 1} in stock</p>
                </div>
                <div className="flex flex-row justify-end">
                    <p className="text-xl font-semibold text-gray-700">RM{item.metadata?.price || "Unset"}</p>
                </div>
            </div>
        </div>}
    </div>)
}

const StoreComponent: FC<{ register: ShortStudentInfo }> = ({ register }) => {
    /**
     * The basic flow of a storefront
     * 1. Enter the studentid of the target student
     * 2. Get store items from inventory
     * 3. Add store items to a virtual cart
     * 4. Checkout, enter paid fees and submit
     * 5. Create invoice doc, remove inventory items, add transaction to finance.
     */

    type StoreDocument = {
        id: string;
        ref: DocumentReference;
        storeParent: string;
    }

    const [store, loadStore, errorStore] = useDocumentData<StoreDocument>(doc(db, "store", "CEC").withConverter(docConverter))
    const [folderTrace, setFolderTrace] = useState<InventoryItem[]>([])
    const [folder, setFolder] = useState<string>();
    const [storeItems = [], loadStoreItems, errorStoreItems] = useCollectionData<InventoryItem>(folder&&query(collection(db, "inventory").withConverter(docConverter), where("parent", "==", folder)))
    const [purchaserStudentid, setPurchaserStudentid] = useState<string>();
    const [purchaser, setPurchaser] = useState<StudentDetails>();
    const [cart, setCart] = useState<{item: InventoryItem, quantity: number}[]>([]);
    const [openDialog, closeDialog] = useDialog();
    
    useEffect(() => setFolder(store?.storeParent), [store])
    useEffect(() => {
        if (store && store.storeParent) {
            (async () => {
                setFolderTrace([(await getDoc<InventoryItem>(doc(db, "inventory", store.storeParent).withConverter(docConverter))).data()])
            })();
        }
    }, [store])

    const total = useMemo(() => {
        return cart.reduce((acc, curr) => acc + (curr.item.metadata!.price || 0) * curr.quantity, 0)
    }, [cart])

    const addItemToCart = (item: InventoryItem, quantity: number) => {
        console.log(item, quantity)
        if(quantity == 0) {
            //remove item from cart if quantity is 0
            setCart(cart.filter(i => i.item.id != item.id))
        } else {
            setCart((prevCart) => {
                const newCart = [...prevCart];
                //remove item if already in cart
                const index = newCart.findIndex(cartItem => cartItem.item.id === item.id);
                if (index > -1) {
                    newCart.splice(index, 1);
                }
                newCart.push({ item, quantity });
                return newCart;
            })
        }
        closeDialog();
    }

    const itemClicked = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, item: InventoryItem) => {
        if(item.type != "item") {
            setFolder(item.id)
            setFolderTrace([...folderTrace, item])
        } else {
            if(!item.metadata?.price) return;
            const existingCartItem = cart.find((cartItem) => cartItem.item.id == item.id)
            openDialog({
                children: <ItemDialog item={item} defaultQuantity={existingCartItem?.quantity || 0} onDone={addItemToCart} onClose={closeDialog} />,
            })
        }
    }

    const traceback = (item: InventoryItem) => 
        () => {
            //get index of item from folder trace and keep items in front only
            const index = folderTrace.findIndex(i => i.id == item.id)
            //set folder to item in index - 1
            setFolder(folderTrace[index].id)
            //remove items from folder trace
            if(index > -1) {
                setFolderTrace(folderTrace.slice(0, index+1))
            }
        }

    return <div className="w-full h-full">
        {!purchaser && <div className="grid place-items-center justify-center">
            <TextField
                label="Student ID"
                value={purchaserStudentid}
                onChange={(e) => setPurchaserStudentid(e.target.value)}
                variant="outlined"
                />
            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                    if (purchaserStudentid) {
                        getDoc(doc(db, `students/${purchaserStudentid}`)).then((doc) => {
                            if (doc.exists) {
                                setPurchaser(doc.data() as StudentDetails);
                            }
                        });
                    }
                }}
                >
                Search
            </Button>
        </div>}
        {purchaser && <div className="grid grid-cols-[auto_16rem] divide-x divide-solid divide-gray-400">
            <div>
                <Breadcrumbs aria-label="breadcrumb">
                    {folderTrace.map((item) => <h2 key={item.id} onClick={traceback(item)}>{item.description}</h2>)}
                </Breadcrumbs>
                <div className="flex flex-row overflow-clip p-2 gap-2">
                    {storeItems.map((item) => <StoreItem key={item.id} item={item} onItemClick={itemClicked}/>)}
                </div>
            </div>
            <div className="flex flex-col overflow-clip px-2 divide-y divide-solid divide-gray-400 space-y-2">
                <div className="text-center">
                    <h3 className="font-semibold text-xl ">Selling To</h3>
                    <h4>{purchaser.englishName} {purchaser.chineseName}</h4>
                    <h4>{purchaser.class} {purchaser.studentid}</h4>
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-xl ">Cart</h3>
                    {cart.map((item) => <div key={item.item.id} className="flex flex-row justify-between">
                        <span>{item.item.description} x {item.quantity}</span>
                        <span>RM{(item.quantity * item.item.metadata!.price).toFixed(2)}</span>
                    </div>)}
                </div>
                <div className="flex flex-row justify-end items-baseline space-x-2">
                    <h3 className="font-semibold text-xl ">Total</h3>
                    <h4>RM{total.toFixed(2)}</h4>
                </div>
                <Button variant="outlined">Checkout</Button>
            </div>
        </div>}
    </div>
}

export default StoreComponent;
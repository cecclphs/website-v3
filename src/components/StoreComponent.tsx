import { Breadcrumbs, Button, DialogActions, DialogContent, DialogTitle, FormControlLabel, LinearProgress, Radio, RadioGroup, TextField } from "@mui/material";
import { addDoc, collection, doc, DocumentReference, getDoc, query, Timestamp, where } from "firebase/firestore";
import { FC, HTMLAttributes, MouseEvent, useEffect, useMemo, useState } from "react";
import { db, docConverter } from "../config/firebase";
import StudentDetails from "../types/StudentDetails";
import { ShortStudentInfo } from "../types/User";
import { useCollection, useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import InventoryItem from "../types/Inventory";
import { Add, Folder, Remove } from "@mui/icons-material";
import { useDialog } from "../hooks/useDialog";
import { useAuth } from "../hooks/useAuth";
import { useSnackbar } from "notistack";

type CartItem = {item: InventoryItem, quantity: number}

const CheckoutDialog: FC<{
    onClose: () => void,
    onDone: () => void,
    cart: CartItem[],
    purchaser: ShortStudentInfo,
    registerer: ShortStudentInfo,
}> = ({
    onClose,
    cart,
    purchaser,
    registerer,
}) => {
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'others'>('cash');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [amount, setAmount] = useState<string>('0.00');
    const [otherMethod, setOtherMethod] = useState<string>('');
    const { enqueueSnackbar } = useSnackbar();
    const total = useMemo(() => cart.reduce((acc, {item, quantity}) => acc + (item.metadata.price * quantity), 0), [cart]);

    const onSubmit = async () => {
        setSubmitting(true);
        //call store/payment api with body { transaction: Any }
        fetch('/api/store/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${await user.getIdToken()}`
            },
            body: JSON.stringify({
                transaction: {
                    cart,
                    purchaser: {
                        studentid: purchaser.studentid,
                        englishName: purchaser.englishName,
                    },
                    registerer: {
                        studentid: registerer.studentid,
                        englishName: registerer.englishName,
                    },
                    paymentMethod,
                    total,
                    ...(paymentMethod == 'cash') ? {amount} : {},
                    ...(paymentMethod == 'others') ? {otherMethod} : {},
                },
            })
        }).then(async res => {
            const { error } = await res.json()
            if(res.status == 200) onClose();
            else {
                enqueueSnackbar('Failed to create transaction: '+ error, { variant: 'error' });
            }
        })
        
    }

    return <DialogContent className="min-w-[600px] space-y-3">
        <h1 className="text-3xl font-semibold">Checking out</h1>
        {submitting && <LinearProgress />}
        <div className="flex flex-col">
            <h2 className="font-semibold text-lg">Purchaser</h2>
            <p>{purchaser.englishName}</p>
        </div>
        <div className="flex flex-col">
            <h2 className="font-semibold text-lg">Items</h2>
            <table className="border-collapse">
                <thead className="border-b border-gray-400">
                    <tr className="[&_td]:font-bold ">
                        <td>Item</td>
                        <td>Quantity</td>
                        <td>Price</td>
                    </tr>
                </thead>
                <tbody>
                    {cart.map(({item, quantity}) => <tr key={item.id}>
                        <td>{item.description}</td>
                        <td>{quantity}</td>
                        <td>RM {(item.metadata.price * quantity).toFixed(2)}</td>
                    </tr>)}
                </tbody>
                <tfoot className="border-t border-gray-400">
                    <tr>
                        <td className="font-semibold text-right pr-4 text-xl" colSpan={2}>Total</td>
                        <td className="text-xl">RM {total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div className="flex flex-col">
            <h2 className="font-semibold text-lg">Payment</h2>
            <h2>Payment To</h2>
            <RadioGroup value={paymentMethod} onChange={(e, value) => setPaymentMethod(value as 'cash' | 'others')}>
                <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                <FormControlLabel value="others" control={<Radio />} label="Others" />
            </RadioGroup>
            {paymentMethod === 'cash' && <>
                <TextField 
                    required 
                    variant="filled" 
                    label="Amount Received" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    error={parseFloat(amount) < total}
                    helperText={parseFloat(amount) < total ? 'Amount received is less than total' : ''}
                    InputProps={{
                        startAdornment: <span className=" mt-4 font-semibold mr-1 text-gray-500">RM</span>,
                    }}
                    />
                {parseFloat(amount) >= total && <h4 className="font-semibold text-lg">Change: RM {(parseFloat(amount)-total).toFixed(2)}</h4>}
            </>}
            {paymentMethod === 'others' && <>
                <TextField required variant="filled" label="What Payment Method?" value={otherMethod} onChange={(e) => setOtherMethod(e.target.value)} />
            </>}
            <TextField variant="filled" label="Remarks" />
            <Button variant="contained" onClick={onSubmit}>Done</Button>
        </div>
    </DialogContent>
}

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
    return (<div className="p-2 shadow-lg rounded-md h-[170px] w-48 hover:bg-gray-100 transition-colors cursor-pointer" onClick={(e) => onItemClick(e, item)} {...props}>
        {item.type != "item" ? <div className="h-full w-full grid place-items-center">
            <div className="flex flex-col items-center space-y-1 text-gray-900">
                <Folder/>
                <h5 className="text-2xl font-semibold select-none">{item.description}</h5>
            </div>
        </div> : <div className="h-full w-full grid">
            {/* <img src={item.metadata?.image} className="h-full w-full object-contain flex-1" /> */}
            <div className="flex flex-col flex-1 justify-between">
                <div className="flex-1" >
                    <h5 className="text-lg font-semibold -mb-1">{item.description}</h5>
                    <p className="text-sm text-gray-700">{item?.quantity || 1} in stock</p>
                </div>
                <div className="flex flex-row justify-end">
                    <p className="text-xl font-semibold text-gray-700">{item.metadata?.price? ("RM"+ item.metadata.price.toFixed(2)) : <span className="text-red-400">Unset</span>}</p>
                </div>
            </div>
        </div>}
    </div>)
}

const ManualPurchaser: FC<{
    onClose: (purchaser: ShortStudentInfo | null) => void;
}> = ({ onClose }) => {
    const [purchaser, setPurchaser] = useState<ShortStudentInfo | null>(null);
    
    return <>
        <DialogTitle>ID Not found, Enter manually or retry</DialogTitle>
        <DialogContent>
            <div className="flex flex-col space-y-2">
                <TextField label="Student ID/Employee ID" value={purchaser?.studentid} onChange={(e) => setPurchaser({...purchaser, studentid: e.target.value})} />
                <TextField label="English Name" value={purchaser?.englishName} onChange={(e) => setPurchaser({...purchaser, englishName: e.target.value})} />
            </div>
        </DialogContent>
        <DialogActions>
            <Button color="error" onClick={() => onClose(null)}>Cancel</Button>
            <Button variant="contained" onClick={() => onClose(purchaser)}>Done</Button>
        </DialogActions>
    </>
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
    const [purchaser, setPurchaser] = useState<ShortStudentInfo | null>();
    const [cart, setCart] = useState<CartItem[]>([]);
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

    const checkout = () => {
        openDialog({
            children: <CheckoutDialog 
                cart={cart} 
                onDone={() => {
                    closeDialog();
                    setCart([]);
                }} 
                onClose={() => {
                    setPurchaser(null);
                    setPurchaserStudentid("");
                    setCart([]);
                    setFolder(store?.storeParent);
                    setFolderTrace([]);

                    closeDialog();
                }} 
                purchaser={purchaser}
                registerer={register}/>,
        })
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
        {!purchaser && <div className="grid place-items-center justify-center p-12">
            <div className="flex flex-col space-y-4">
                <h1 className="text-2xl font-semibold">Enter the purchaser's details</h1>
                <p>Students: Enter your Student ID. Ex: 16095</p>
                <p>Others: Enter your ID, Followed with your English Name</p>
                <TextField
                    label="Student ID/Employee ID"
                    name="studentid"
                    value={purchaserStudentid}
                    onChange={(e) => setPurchaserStudentid(e.target.value)}
                    variant="outlined"
                    />
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!(purchaserStudentid && purchaserStudentid.length > 0)}
                    onClick={() => {
                        if(purchaserStudentid && purchaserStudentid.length > 0)
                        getDoc(doc(db, `students/${purchaserStudentid}`)).then((doc) => {
                            if (doc.exists && doc.data()) {
                                setPurchaser(doc.data() as StudentDetails);
                            } else {
                                console.log('bruh')
                                openDialog({
                                    children: <ManualPurchaser onClose={(val) => {
                                        if(val) setPurchaser(val);
                                        closeDialog();
                                    }} />
                                })
                            }
                        });
                    }}
                    >
                    Search
                </Button>
            </div>
        </div>}
        {purchaser && <div className="grid grid-cols-[auto_16rem] divide-x divide-solid divide-gray-400 h-full w-full">
            <div className="min-w-0">
                <Breadcrumbs aria-label="breadcrumb">
                    {folderTrace.map((item) => <h2 className="text-lg cursor-pointer hover:underline" key={item.id} onClick={traceback(item)}>{item.description}</h2>)}
                </Breadcrumbs>
                {loadStoreItems && <LinearProgress className="w-full my-2"/>}
                <div className="w-full flex flex-row overflow-clip flex-wrap p-2 gap-2">
                    {storeItems.map((item) => <StoreItem key={item.id} item={item} onItemClick={itemClicked}/>)}
                </div>
            </div>
            <div className="flex flex-col overflow-clip p-2 divide-y divide-solid divide-gray-400 space-y-2 h-full">
                <div className="text-center">
                    <h3 className="font-semibold text-xl">Selling To</h3>
                    <div className="p-2 rounded-md shadow-md">
                        <h4>{purchaser.englishName}</h4>
                        <h4>{purchaser.studentid}</h4>
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-xl ">Cart</h3>
                    {cart.map((item) => <div key={item.item.id} className="flex flex-row justify-between" onClick={(e) => itemClicked(e, item.item)}>
                        <span>{item.item.description} x {item.quantity}</span>
                        <span>RM{(item.quantity * item.item.metadata!.price).toFixed(2)}</span>
                    </div>)}
                    {cart.length == 0 && <div className="text-center">
                        <h4>No Items yet</h4>
                    </div>}
                </div>
                <div className="flex flex-row justify-end items-baseline space-x-2">
                    <h3 className="font-semibold text-xl ">Total</h3>
                    <h4>RM{total.toFixed(2)}</h4>
                </div>
                <Button variant="outlined" onClick={checkout}>Checkout</Button>
            </div>
        </div>}
    </div>
}

export default StoreComponent;
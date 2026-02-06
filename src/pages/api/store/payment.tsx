import {NextApiRequest, NextApiResponse} from 'next';
import {adminDb} from '../../../config/firebase-admin';
import {withAuth} from '../../../config/middlewares';
import ApiRequestWithAuth from '../../../types/ApiRequestWithAuth';
import { Timestamp } from 'firebase-admin/firestore';
import { StoreTransaction } from '../../../types/Store';
import InventoryItem from '../../../types/Inventory';


export default async (req: NextApiRequest, res: NextApiResponse) => {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({ error: "Invalid request body" });
        return;
    }

    const { transaction } = req.body;

    if (!transaction || typeof transaction !== 'object') {
        res.status(400).json({ error: "Invalid transaction data" });
        return;
    }

    // Validate required fields
    if (typeof transaction.total !== 'number') {
        res.status(400).json({ error: "Invalid transaction total" });
        return;
    }

    if (!Array.isArray(transaction.cart) || transaction.cart.length === 0) {
        res.status(400).json({ error: "Invalid or empty cart" });
        return;
    }

    adminDb.runTransaction(async (t) => {
        // await adminDb.collection('store').doc('CEC').collection("transactions").add({
        //     ...transaction,
        //     timestamp: Timestamp.now()
        // })

        const { cart } = transaction as Omit<StoreTransaction, 'id' | 'ref' | 'timestamp'>;
        let sum = 0;
        for(const item of cart) {
            const doc = await t.get(adminDb.collection('inventory').doc(item.item.id));
            const { type, quantity, metadata: { price } } = doc.data() as InventoryItem;

            //check if it is an item
            if(type !== 'item') {
                throw new Error('Not an item');
            }

            //check prices match
            if(price !== item.item.metadata?.price) {
                throw new Error('Price mismatch');
            }
            sum += price * item.quantity;

            if(quantity < item.quantity) {
                throw new Error('Insufficient quantity');
            }
            else if (quantity === item.quantity) {
                t.delete(doc.ref);
            }
            else {
                t.update(doc.ref, { quantity: quantity - item.quantity });
            }
        }

        if(sum !== transaction.total) {
            throw new Error('Total mismatch');
        }

        t.create(adminDb.collection('store').doc('CEC').collection("transactions").doc(), {
            ...transaction,
            timestamp: Timestamp.now()
        });
    }).then(() => {
        res.send({status: 200, data: { success: true }});
    }).catch((e) => {
        res.send({status: 500, data: { error: e.message }});
    })
}
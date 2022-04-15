import {NextApiResponse} from 'next';
import {adminDb} from '../../../config/firebase-admin';
import {withAuth} from '../../../config/middlewares';
import ApiRequestWithAuth from '../../../types/ApiRequestWithAuth';
import {Transaction} from '../../../types/Finance';

export default withAuth(async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    const { studentid, isAdmin } = req.token;
    if(!isAdmin) throw new Error("You are not an admin");
    return res.status(404).json({status: 404, message: 'Not implemented'})
    console.log(studentid + ' deleting transactions and reverting everything');
    const { transactionId } = req.body as { transactionId: string };
    await adminDb.runTransaction(async transaction => {
        //get the transactions made before the current transactionId
        const deletingTransaction = await transaction.get(adminDb.doc('/finance/CEC/transactions/' + transactionId));
        const deltrans = deletingTransaction.data() as Omit<Transaction, 'id' | 'ref'>
        const { date, status, balanceBefore, account } = deltrans;
        const transactions = await adminDb
            .collection('finance')
            .doc('CEC')
            .collection('transactions')
            .where('account', '==', account)
            .where('date', '>', date)
            .get();
        const batch = adminDb.batch();
        //delete all newly added transactions
        transactions.docs.forEach(doc => {
            batch.delete(doc.ref);
        })
        //set the account balance back to the previous balance
        if(status == 'successful') batch.update(adminDb.doc('/finance/CEC/accounts/' + account), {
            balance: balanceBefore
        });
        //delete the transaction
        batch.delete(adminDb.doc('/finance/CEC/transactions/' + transactionId));
        await batch.commit();
    })
    res.send({status: 200, data: { deleted: true }})
})
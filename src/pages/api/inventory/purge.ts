import { NextApiResponse } from "next";
import { admin, adminDb } from "../../../config/firebase-admin";
import { withAuth } from "../../../config/middlewares";
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";

const findAndDelete = async (parent: string, batch: admin.firestore.WriteBatch) => {
    const items = await adminDb
        .collection('inventory')
        .where('parent', '==', parent)
        .get();
    if(items.empty) return;
    for(let doc of items.docs) {
        batch.delete(doc.ref);
        if(doc.data().type != 'item') {
            await findAndDelete(doc.id, batch);
        }
    };
}

export default withAuth(async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    const { studentid, isAdmin } = req.token;
    if(!isAdmin) throw new Error("You are not an admin");
    console.log(studentid + ' deleting inventory');
    const { deleteNode } = req.body as { deleteNode: string };
    const batch = adminDb.batch();
    batch.delete(adminDb.doc('/inventory/' + deleteNode));
    //get items with parent as deletedNode
    await findAndDelete(deleteNode, batch);
    await batch.commit();
    res.send({status: 200, data: { deleted: true }})
})
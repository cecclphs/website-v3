import { adminRtdb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"

const handler = async (req, res) => {
    const {
        cardId,
        displayName,
        studentid
    } = req.body;
    const { uid, studentid: creator } = req.token;
    const cardRef = adminRtdb.ref(`cards/${cardId}`);
    await cardRef.set({
        displayName,
        studentid,
        active: true,
        createdBy: creator,
        createdOn: Date.now(),
        modifiedOn: Date.now(),
    })
    res.json({
        success: true,
        message: "Card created successfully"
    })
}

export default withAuth(handler)
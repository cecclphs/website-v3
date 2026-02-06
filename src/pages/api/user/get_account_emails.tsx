import { NextApiResponse } from "next";
import { adminAuth } from "../../../config/firebase-admin";
import { withAuth } from "../../../config/middlewares";
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";

const handler = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    const { isAdmin, isCommittee } = req.token;

    // Only admins and committee can fetch account emails
    if (!isAdmin && !isCommittee) {
        return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { uids } = req.body;

    if (!uids || !Array.isArray(uids)) {
        return res.status(400).json({ error: "Invalid request: uids array required" });
    }

    if (uids.length === 0) {
        return res.status(200).json({ accounts: [] });
    }

    try {
        // Fetch user records from Firebase Auth
        const userRecords = await Promise.all(
            uids.map(async (uid) => {
                try {
                    const userRecord = await adminAuth.getUser(uid);
                    return {
                        uid: userRecord.uid,
                        email: userRecord.email || null,
                        displayName: userRecord.displayName || null,
                    };
                } catch (error) {
                    console.error(`Failed to fetch user ${uid}:`, error);
                    return {
                        uid,
                        email: null,
                        displayName: null,
                        error: "User not found"
                    };
                }
            })
        );

        return res.status(200).json({ accounts: userRecords });
    } catch (error) {
        console.error("Error fetching account emails:", error);
        return res.status(500).json({ error: "Failed to fetch account emails" });
    }
};

export default withAuth(handler);

import { adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import { NextApiResponse } from "next";
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";

const fixStudentWhitespace = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    try {
        const { uid, isAdmin } = req.token;

        // Only admins can run this
        if(!isAdmin) {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        // Find the student with trailing space
        const studentWithSpace = await adminDb.collection('students').doc('24020 ').get();

        if (!studentWithSpace.exists) {
            return res.status(404).json({
                error: "Student '24020 ' not found",
                message: "The student with trailing space doesn't exist or was already fixed"
            });
        }

        const studentData = studentWithSpace.data();

        // Create new document with trimmed ID
        await adminDb.collection('students').doc('24020').set({
            ...studentData,
            studentid: '24020'
        });

        // Update any linked accounts
        if (studentData?.linkedAccounts && studentData.linkedAccounts.length > 0) {
            for (const accountId of studentData.linkedAccounts) {
                await adminDb.doc(`user_claims/${accountId}`).update({
                    studentid: '24020'
                });

                await adminDb.doc(`users/${accountId}`).update({
                    studentid: '24020'
                });
            }
        }

        // Delete the old document with trailing space
        await adminDb.collection('students').doc('24020 ').delete();

        res.status(200).json({
            success: true,
            message: "Student ID fixed: '24020 ' -> '24020'",
            linkedAccountsUpdated: studentData?.linkedAccounts?.length || 0
        });
    } catch(e) {
        console.error('Fix student whitespace error:', e);
        return res.status(500).json({
            error: "An error occurred while fixing student whitespace",
            message: e instanceof Error ? e.message : 'Unknown error'
        });
    }
}

export default withAuth(fixStudentWhitespace)

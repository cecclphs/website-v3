import { adminDb } from "../../../config/firebase-admin";
import { withAuth } from "../../../config/middlewares";
import { NextApiResponse } from "next";
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";

const fixStudentWhitespace = async (
  req: ApiRequestWithAuth,
  res: NextApiResponse,
) => {
  try {
    const { uid, isAdmin } = req.token;

    // Only admins can run this
    if (!isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    // Get all student documents
    const studentsSnapshot = await adminDb.collection("students").get();

    const invalidIds: string[] = [];
    const validIds: string[] = [];
    const stats = {
      total: studentsSnapshot.size,
      valid: 0,
      invalid: 0,
      withWhitespace: 0,
      nonNumeric: 0,
      wrongLength: 0,
    };

    studentsSnapshot.forEach((doc) => {
      const docId = doc.id;
      const trimmedId = docId.trim();
      const isExactly5Digits = /^\d{5}$/.test(trimmedId);

      if (isExactly5Digits && docId === trimmedId) {
        validIds.push(docId);
        stats.valid++;
      } else {
        invalidIds.push(docId);
        stats.invalid++;

        // Categorize the type of issue
        if (docId !== trimmedId) {
          stats.withWhitespace++;
        }
        if (!/^\d+$/.test(trimmedId)) {
          stats.nonNumeric++;
        }
        if (trimmedId.length !== 5) {
          stats.wrongLength++;
        }
      }
    });

    res.status(200).json({
      success: true,
      stats,
      invalidIds,
      message: `Found ${stats.invalid} student IDs that are not exactly 5 digits`,
    });
  } catch (e) {
    console.error("Fix student whitespace error:", e);
    return res.status(500).json({
      error: "An error occurred while checking student IDs",
      message: e instanceof Error ? e.message : "Unknown error",
    });
  }
};

export default withAuth(fixStudentWhitespace);

import { AuthError } from 'firebase/auth';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import ApiRequestWithAuth from '../types/ApiRequestWithAuth';
import { adminAuth, adminDb, adminRtdb } from './firebase-admin';

export function withAuth(handler: (req: ApiRequestWithAuth, res: NextApiResponse) => any) {
    return async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).end('Not authenticated. No Auth header');
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = await adminAuth.verifyIdToken(token);
        if (!decodedToken || !decodedToken.uid)
        return res.status(401).end('Not authenticated');
        req.token = decodedToken;
    } catch (error: any) {
        console.log(error.errorInfo);
        const errorCode = error.errorInfo.code;
        error.status = 401;
        if (errorCode === 'auth/internal-error') {
        error.status = 500;
        }
        //TODO handlle firebase admin errors in more detail
        return res.status(error.status).json({ error: errorCode });
    }

    return handler(req, res);
    };
}

type TokenDefinition = {
    name: string,
    createdOn: number,
    attendance: boolean
}

export function withTerminalAPI(handler: (req: ApiRequestWithAuth, res: NextApiResponse) => any) {
    return async (req: ApiRequestWithAuth, res: NextApiResponse) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).end('Not authenticated. No Auth header');
        }

        //get the token
        const token = authHeader.split(' ')[1];
        //check db for the token and its corresponding doc
        const doc = await adminRtdb.ref(`/accessToken/${token}`).once('value');
        if (!doc.exists() || !doc.val()) {
            return res.status(401).end('Not authenticated');
        }
        //get the token data
        const tokenData = doc.val() as TokenDefinition;
        req.token = tokenData;
        return handler(req, res);
    }
}
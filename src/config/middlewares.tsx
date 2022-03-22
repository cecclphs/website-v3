import { AuthError } from 'firebase/auth';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import ApiRequestWithAuth from '../types/ApiRequestWithAuth';
import { adminAuth } from './firebase-admin';

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
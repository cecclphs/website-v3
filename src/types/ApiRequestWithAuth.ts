import { NextApiRequest } from "next";

export default interface ApiRequestWithAuth extends NextApiRequest {
    token: {
        [key: string]: any;
    }
}
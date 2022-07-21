// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";
import { generateLicense } from '@mui/x-license-pro'

export default (req: NextApiRequest, res: NextApiResponse) => {
  
  res.status(200).json({ name: generateLicense({
    expiryDate: new Date(2030, 1, 1, 0, 0, 0, 0),
    orderNumber: '123456789',
    licensingModel: 'perpetual',
    scope: 'premium',
  }) })
}

import { NextApiHandler } from 'next'
import puppeteer from 'puppeteer'
import { withAuth } from '../../../config/middlewares'
import ApiRequestWithAuth from '../../../types/ApiRequestWithAuth'
import {isDevelopment} from '../../../utils/environment';

const Handler: NextApiHandler = async (req: ApiRequestWithAuth, res) => {
    if(!req.token.isAdmin) throw new Error('You are not allowed to access this page');
    const { record: _record } = req.query;
    console.log(req.cookies)
    const record = typeof _record === 'string' ? [_record] : _record;
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`${isDevelopment()?'http://localhost:3000':'https://app.cecclphs.com'}/attendance/print?${record.map(id => `record=${id}`).join('&')}`, {
        waitUntil: 'networkidle0',
    })
    await page.emulateMediaType('screen')

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        landscape: true,
        margin: {
			top: '20px',
			right: '20px',
			bottom: '20px',
			left: '20px'
		}
    })

    res.send(pdfBuffer)

    await browser.close()
}

export default withAuth(Handler)
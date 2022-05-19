import { NextApiHandler } from 'next'
import puppeteer from 'puppeteer'
import { withAuth } from '../../../config/middlewares'
import ApiRequestWithAuth from '../../../types/ApiRequestWithAuth'

const Handler: NextApiHandler = async (req: ApiRequestWithAuth, res) => {
    const { from, to } = req.query;
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(`http://localhost:3000/attendance/print?from=${from}&to=${to}`, {
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

export default Handler
import * as functions from 'firebase-functions';
import { HttpsError } from 'firebase-functions/v1/https';
import * as puppeteer from 'puppeteer';
import { UploadFile } from './utils/storage';

export const generatePdf = functions
    .runWith({
        memory: "1GB",
    })
    .https
    .onCall(async (data, context) => {
        if (!context.auth?.token.isAdmin) throw new HttpsError('permission-denied', 'You are not allowed to access this page');
        const { url, pdfOptions } = data;
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(url, {
            waitUntil: 'networkidle0',
        })
        await page.emulateMediaType('screen')

        const pdfBuffer = await page.pdf(pdfOptions)

        await browser.close()
        return await UploadFile(pdfBuffer, `${url}_${new Date().toISOString()}.pdf`)

    })

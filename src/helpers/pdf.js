import axios from "axios"
import { header } from "express-validator"
import PdfPrinter from "pdfmake"
import { getBlogPosts } from "../helpers/files.js"
import striptags from "striptags"

export const generatePDFStream = async data => {

    const result = await axios.get(data.cover, {
        responseType: "arraybuffer"
    })

    const image = new Buffer.from(result.data, `base64`)

    const fonts = {
        Roboto: {
            normal: "Helvetica",
            bold: "Helvetica-Bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-BoldOblique",
        }
    }

    const docDefinition = {
        content: [
            {
                text: data.title, bold: true, margin: [0,0,0,20],
                style: "header"
            },
            {
                image: image,
                width: 500,
                height: 250,
                margin: [0,0,0,10], 
            },
            {
                text: striptags(data.content), 
                fontSize: 15 

            }
        ],

        styles: {
            header: {
                fontSize: 18,
                bold: true
            },
            subheader: {
                fontSize: 15,
                bold: true
            },
            quote: {
                italics: true
            },
            small: {
                fontSize: 8
            }
        }
    }

    const options = {

    }

    const printer = new PdfPrinter(fonts)

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
    pdfReadableStream.end()

    return pdfReadableStream

}
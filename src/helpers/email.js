import sgMail from "@sendgrid/mail"
import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async (email) => {
    try {
        const pathToAttachment = join(dirname(fileURLToPath(import.meta.url)), "../blogPosts/test.pdf")
        const attachment = fs.readFileSync(pathToAttachment).toString("base64")

            const msg = {
                to: "kaiwan.kadir@outloook.com", // Change to your recipient
                from: process.env.SENDGRID_SENDER_EMAIL, // Change to your verified sender
                subject: 'Hello everyone',
                text: 'I am just making sure this works.',
                attachments: [
                    {
                      content: attachment,
                      filename: "attachment.pdf",
                      type: "application/pdf",
                      disposition: "attachment"
                    }
                  ]
                
              }
              
            const response = await sgMail.send(msg)
            return response
    } catch (error) {
        console.log(error)
    }
    
}
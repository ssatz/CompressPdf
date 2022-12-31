import { execSync } from 'child_process';
const s3Client = new S3Client({ region: process.env.AWS_S3_REGION });
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from 'fs'
import Pusher from "pusher"
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    useTLS: process.env.PUSHER_TLS ?? false,
    host: process.env.PUSHER_HOST,
    port: process.env.PUSHER_PORT,
});

const streamToString = (stream) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });

export const handler = async (filename, uuid, userId = 'guest') => {

    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename,
        ContentType: 'application/pdf'
    }));
    // Convert the ReadableStream to a string.
    const bodyContents = await streamToString(data.Body);
    fs.writeFileSync(`/tmp/${filename}`, bodyContents);
    const outputFilename = `${uuid}.pdf`;

    console.log(outputFilename);

    const cmd = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=/tmp/${outputFilename} /tmp/${filename}`;
    console.log(cmd);
    execSync(cmd, { stdio: 'inherit' });

    if (fs.existsSync(`/tmp/${outputFilename}`)) {
        const fileStream = fs.createReadStream(`/tmp/${outputFilename}`);

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${userId}/${outputFilename}`,
            Body: fileStream,
            ContentType: 'application/pdf'
        }));
        execSync(`rm /tmp/${filename}`, { stdio: 'inherit' });
        console.log('ends here');
        pusher.trigger(process.env.PUSHER_CHANNEL, process.env.PUSHER_EVENT, JSON.stringify({
            uuid: uuid,
            failed: false
        })).catch((e) =>{
            console.log(e);
        });
    }
};
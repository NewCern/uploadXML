import Responses from '../common/API_Responses';
import * as fileType from 'file-type';
import { v4 as uuid } from 'uuid';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';

const s3 = new AWS.S3();

// allowd filetypes (Mulitpurpose Internet mail Extension)
const allowedMimes = ['application/xml', 'text/xml'];

export const handler = async (event: any): Promise<any> => {
    try {
        const body = JSON.parse(event.body);
        // console.log("This is The Body: ", body);

        if (!body || !body.xml || !body.mime) {
            return Responses._400({ message: 'incorrect file Type or No File Selected' });
        }

        if (!allowedMimes.includes(body.mime)) {
            return Responses._400({ message: 'MIME is not allowed ' });
        }

        let xmlData = body.xml;
        // convert to a sequence of base64 string
        const buffer = Buffer.from(xmlData, 'base64');
        // get file type of buffer object
        const fileInfo = await fileType.fromBuffer(buffer);
        const detectedExt = fileInfo?.ext;

        const name = uuid();
        const key = `${name}.${detectedExt}`;

        await s3
            .putObject({
                Body: buffer,
                Key: key,
                ContentType: body.mime,
                Bucket: "xml-file-upload-bucket-demo"!,
                // Bucket: process.env.xmlUploadBucket!, 
                // ACL: 'public-read',
            })
            .promise();
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({ message: 'File has been successfully uploaded' })
            };
            return response;
    } catch (error) {
        console.log('error', error);
        return Responses._400({ message: error || 'failed to upload xml file' });
    }
};

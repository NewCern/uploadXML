import Responses from '../common/API_Responses';
import * as fileType from 'file-type';
import { v4 as uuid } from 'uuid';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

const allowedMimes = ['application/xml', 'text/xml'];


export const handler = async (event: any): Promise<any> => {
    try {
        const body = JSON.parse(event.body);

        if (!body || !body.xml || !body.mime) {
            return Responses._400({ message: 'incorrect body on request' });
        }

        if (!allowedMimes.includes(body.mime)) {
            return Responses._400({ message: 'mime is not allowed ' });
        }

        let xmlData = body.xml;
        if (body.xml.substr(0, 7) === 'base64,') {
            xmlData = body.xml.substr(7, body.xml.length);
        }

        const buffer = Buffer.from(xmlData, 'base64');
        const fileInfo = await fileType?.fromBuffer(buffer);
        const detectedExt = fileInfo?.ext;
        const detectedMime = fileInfo?.mime;

        if (detectedMime !== body.mime) {
            return Responses._400({ message: 'mime types dont match' });
        }

        const name = uuid();
        const key = `${name}.${detectedExt}`;

        console.log(`writing xml file to bucket called ${key}`);

        await s3
            .putObject({
                Body: buffer,
                Key: key,
                ContentType: body.mime,
                Bucket: process.env.xmlUploadBucket!,
                ACL: 'public-read',
            })
            .promise();

            return {
                message: "Image successfully uploaded"
            }

        // const url = `https://${process.env.xmlUploadBucket}.s3-${process.env.region}.amazonaws.com/${key}`;
        // return Responses._200({
        //     xmlURL: url,
        // });
    } catch (error) {
        console.log('error', error);

        return Responses._400({ message: error || 'failed to upload xml file' });
    }
};
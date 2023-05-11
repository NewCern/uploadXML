"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const API_Responses_1 = __importDefault(require("../common/API_Responses"));
const fileType = __importStar(require("file-type"));
const uuid_1 = require("uuid");
const AWS = __importStar(require("aws-sdk"));
const s3 = new AWS.S3();
const allowedMimes = ['application/xml', 'text/xml'];
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = JSON.parse(event.body);
        if (!body || !body.xml || !body.mime) {
            return API_Responses_1.default._400({ message: 'incorrect body on request' });
        }
        if (!allowedMimes.includes(body.mime)) {
            return API_Responses_1.default._400({ message: 'mime is not allowed ' });
        }
        let xmlData = body.xml;
        if (body.xml.substr(0, 7) === 'base64,') {
            xmlData = body.xml.substr(7, body.xml.length);
        }
        //const buffer = fs.readFileSync(body.xml);
        const buffer = Buffer.from(xmlData, 'base64');
        const fileInfo = yield fileType.fromBuffer(buffer);
        const detectedExt = fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.ext;
        const detectedMime = fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.mime;
        if (detectedMime !== body.mime) {
            return API_Responses_1.default._400({ message: 'mime types dont match' });
        }
        const name = (0, uuid_1.v4)();
        const key = `${name}.${detectedExt}`;
        //console.log(`writing xml file to bucket called ${key}`);
        yield s3
            .putObject({
            Body: buffer,
            Key: key,
            ContentType: body.mime,
            Bucket: "xml-file-upload-bucket-demo",
            // Bucket: process.env.xmlUploadBucket!, 
            // ACL: 'public-read',
        })
            .promise();
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ message: "Image successfully uploaded" })
        };
    }
    catch (error) {
        console.log('error', error);
        return API_Responses_1.default._400({ message: error || 'failed to upload xml file' });
    }
});
exports.handler = handler;

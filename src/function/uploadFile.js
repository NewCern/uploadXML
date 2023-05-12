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
// allowd filetypes (Mulitpurpose Internet mail Extension)
const allowedMimes = ['application/xml', 'text/xml'];
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = JSON.parse(event.body);
        // console.log("This is The Body: ", body);
        if (!body || !body.xml || !body.mime) {
            return API_Responses_1.default._400({ message: 'incorrect file Type or No File Selected' });
        }
        if (!allowedMimes.includes(body.mime)) {
            return API_Responses_1.default._400({ message: 'MIME is not allowed ' });
        }
        let xmlData = body.xml;
        // convert to a sequence of base64 string
        const buffer = Buffer.from(xmlData, 'base64');
        // get file type of buffer object
        const fileInfo = yield fileType.fromBuffer(buffer);
        const detectedExt = fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.ext;
        const name = (0, uuid_1.v4)();
        const key = `${name}.${detectedExt}`;
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
    }
    catch (error) {
        console.log('error', error);
        return API_Responses_1.default._400({ message: error || 'failed to upload xml file' });
    }
});
exports.handler = handler;

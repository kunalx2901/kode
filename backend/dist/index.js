"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
// import axios from 'axios';
const openai_1 = __importDefault(require("openai"));
const prompts_1 = require("./prompts");
const express_1 = __importDefault(require("express"));
const react_1 = require("./defaults/react");
const node_1 = require("./defaults/node");
const cors_1 = __importDefault(require("cors"));
// console.log(process.env.OPEN_API_KEY);
const OPENAI_API_KEY = process.env.OPEN_API_KEY;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const openai = new openai_1.default({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENAI_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // Replace with your actual domain or dev URL
        "X-Title": "My AI App", // Replace with your app name
    },
});
app.post('/template', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = req.body.prompt;
    const response = yield openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
            {
                role: "user",
                content: prompt
            },
            {
                role: "system",
                content: "return either node or react based on what do you think this project should be. only return a single word 'node' or 'react'. do not return anything extra. don't leave the reponse empty give sure shot answer.",
            },
        ]
    });
    const assistantContent = response.choices[0].message.content;
    // res.json({
    //   assistantContent
    // })
    if (assistantContent == 'react') {
        res.json({
            prompts: [prompts_1.defaultPrompt, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [react_1.basePrompt]
        });
        return;
    }
    if (assistantContent == 'node') {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [node_1.basePrompt]
        });
        return;
    }
}));
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d, _e;
    const message = req.body.message;
    const stream = yield openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: message,
        stream: true,
    });
    try {
        // console.log(message);
        // This will stream the tokens as they arrive
        for (var _f = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _f = true) {
            _c = stream_1_1.value;
            _f = false;
            const chunk = _c;
            const content = (_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content;
            if (content)
                process.stdout.write(content);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_f && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    console.log("\n[Stream finished]");
}));
app.listen(3000);

require('dotenv').config();
// import axios from 'axios';
import OpenAI from 'openai';
import { defaultPrompt, getSystemPrompt } from './prompts';
import express from 'express'
import { basePrompt as reactBasePrompt } from './defaults/react';
import {basePrompt  as nodeBasePrompt} from './defaults/node'
import cors from 'cors';

// console.log(process.env.OPEN_API_KEY);


const OPENAI_API_KEY = process.env.OPEN_API_KEY;
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Replace with your actual domain or dev URL
    "X-Title": "My AI App",                  // Replace with your app name
  },
});

app.post('/template' , async (req,res)=>{
  const prompt = req.body.prompt;
  const response = await openai.chat.completions.create({
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
  
  if(assistantContent == 'react'){
    res.json({
      prompts: [defaultPrompt, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompts: [reactBasePrompt]
    })
    return ;
  }

  if(assistantContent == 'node'){
    res.json({
      prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompts: [nodeBasePrompt]
    })
    return ;
  }


})


app.post("/chat" , async (req,res)=>{
  const message = req.body.message;
  
  
  const stream = await openai.chat.completions.create({
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: message,
    stream: true,
    
  });

  // console.log(message);
  
  // This will stream the tokens as they arrive
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) process.stdout.write(content);
  }

  console.log("\n[Stream finished]");
})

app.listen(3000);



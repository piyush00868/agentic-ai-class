import express from "express"
import dotenv from "dotenv"
dotenv.config()
import { ChatGoogle } from "@langchain/google";
import { TavilySearch } from "@langchain/tavily";
import {createAgent,tool} from "langchain"
import z from "zod"
const app = express()

const port = process.env.PORT || 3000

app.use(express.json())



// // ai agent = llm + tools 

const tool1= new TavilySearch({
    maxResults:5,
    topic:"general"
})



// ai agent emailtool
const tool3 = tool(
    ({email,content})=>{
        return `email sent to ${email} with content ${content}`
    },
    {
        name:"email_tool",
        description:"use this tool to send an email",
        schema:z.object({
            email:z.string().describe("email of the recipient"),
            content:z.string().describe("content of the email")
        })
    }
)

//custom tool

const tool2= tool(
    ({a,b})=>{
       return `addition of ${a} & ${b} is 7`
    },{
        name:"addition_tool",
        description:"use this tool for addition for two numbers",
        schema:z.object({
            a:z.number(),
            b:z.number()
        })
    }
)

const model = new ChatGoogle("gemini-2.5-flash")
app.post("/chat",async(req,res)=>{
    const {prompt}=req.body
    const agent = createAgent({
        model,
        tools:[tool1,tool2,tool3]
    })
    const result = await agent.invoke({
        messages:[
            {
                role:"user",
                content:prompt
            }
        ]
    })
    console.log(result)
    return res.json("success")
})
app.listen(port, () => {
    console.log("server started at ", port)
})
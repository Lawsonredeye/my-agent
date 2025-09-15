import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const { text } = await generateText({
  model: google("gemini-2.5-flash"),
  prompt:
    "Say that famous line that was said in **Taken** by Liam Neeson when they took his daughter",
});

console.log(text);

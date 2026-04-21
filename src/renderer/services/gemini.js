import { GoogleGenerativeAI } from "@google/generative-ai";

const VALID_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-pro-preview",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-exp",
  "gemini-1.5-pro-002",
  "gemini-1.5-pro",
  "gemini-1.5-flash"
];

const SYSTEM_PROMPT = `
You are an expert software engineer assistant for an Electron-based desktop application.
The app is a "Blank Slate" that you will help build.

You can provide two types of code blocks:

1. FRONTEND (React):
   - Use: \`\`\`javascript
   - Requirements: MUST be a valid React component. MUST use "export default" for the main component.
   - Environment: Tailwind CSS v4 is available. Use standard Lucide-react icons if needed.
   - Example:
     \`\`\`javascript
     import React from 'react';
     export default function App() { return <div className="p-10 text-3xl">Hello World</div>; }
     \`\`\`

2. BACKEND (Electron Main Process):
   - Use: \`\`\`backend
   - Environment: This code will be eval()'d in the Electron main process.
   - Access: You have access to 'app', 'BrowserWindow', 'ipcMain', etc.
   - Example:
     \`\`\`backend
     console.log("Hello from Main Process!");
     \`\`\`

Always prefer providing a single unified update unless the user asks for something specific.
Focus on clean, modern UI (Dark mode preferred unless specified).
Be concise. If you are updating the UI, provide the FULL React component file.
`;

export const callGemini = async (prompt, history, apiKey, preferredModel, onLog) => {
  // Create a unique list of models to try, starting with preferredModel
  const fallbacks = Array.from(new Set([preferredModel, ...VALID_MODELS]));

  const formattedHistory = [
    { role: 'user', content: SYSTEM_PROMPT },
    { role: 'assistant', content: "Understood. I will provide code in the specified formats for the Electron app." },
    ...history
  ];

  for (const modelName of fallbacks) {
    try {
      onLog(`Attempting ${modelName}...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const chat = model.startChat({
        history: formattedHistory.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: 8000,
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      onLog(`Success with ${modelName}`);
      return text;
    } catch (error) {
      onLog(`Error with ${modelName}: ${error.message}`);
      // Continue to next model in fallback list
    }
  }

  throw new Error("All models failed. Please check your API key and connection.");
};

import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import * as readline from "readline";
import { SYSTEM_PROMPT } from "./prompts";
import { getGitDiffTool, getFileChangesInDirectoryTool } from "./tools";

const codeReviewAgent = async (prompt: string): Promise<void> => {
  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt,
      system: SYSTEM_PROMPT,
      tools: {
        getFileChangesInDirectoryTool,
        getGitDiffTool,
      },
      stopWhen: stepCountIs(10),
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\n"); // Add newline after response
  } catch (error) {
    console.error(
      "\n❌ Error processing request:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
};

const validateInput = (
  input: string,
): { isValid: boolean; message?: string } => {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { isValid: false, message: "Please enter a non-empty prompt." };
  }

  if (trimmedInput.length > 10000) {
    return {
      isValid: false,
      message: "Input too long. Please keep it under 10,000 characters.",
    };
  }

  return { isValid: true };
};

const createInterface = (): readline.Interface => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "\n🤖 Enter your code review prompt: ",
  });
};

const startInputLoop = async (): Promise<void> => {
  const rl = createInterface();

  console.log("🚀 Code Review Agent started!");
  console.log(
    "💡 You can ask me to review code changes, analyze files, or provide coding suggestions.",
  );
  console.log(
    "📝 Example: 'Review the changes in the src directory' or 'Check the latest git diff'",
  );

  rl.prompt();

  rl.on("line", async (input: string) => {
    const validation = validateInput(input);

    if (!validation.isValid) {
      console.log(`⚠️  ${validation.message}`);
      rl.prompt();
      return;
    }

    console.log("\n🔍 Processing your request...\n");

    await codeReviewAgent(input.trim());

    console.log("\n" + "─".repeat(50));
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\n👋 Code Review Agent stopped. Goodbye!");
    process.exit(0);
  });

  // Handle Ctrl+C gracefully
  rl.on("SIGINT", () => {
    console.log("\n\n🛑 Received interrupt signal. Exiting gracefully...");
    rl.close();
  });
};

// Error handling for the main process
process.on("uncaughtException", (error) => {
  console.error("\n💥 Uncaught exception:", error.message);
  console.log("🔄 The agent will continue running...\n");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("\n💥 Unhandled rejection at:", promise, "reason:", reason);
  console.log("🔄 The agent will continue running...\n");
});

// Start the application
startInputLoop().catch((error) => {
  console.error("❌ Failed to start the application:", error);
  process.exit(1);
});

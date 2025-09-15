import simpleGit from "simple-git";
import { z } from "zod";
import { tool } from "ai";

const fileChange = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

type FileChange = z.infer<typeof fileChange>;

const excludeFiles = ["dist", "bun.lock"];

async function getFileChangesInDirectory({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }
  return diffs;
}

export const getFileChangesInDirectoryTool = tool({
  description: "Gets the code changes made in given directory",
  inputSchema: fileChange,
  execute: getFileChangesInDirectory,
});

async function getGitDiff({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const diff = await git.diff();

  return diff;
}

export const getGitDiffTool = tool({
  description:
    "Helps in getting the difference made in a given project directory",
  inputSchema: fileChange,
  execute: getGitDiff,
});

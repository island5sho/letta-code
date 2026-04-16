#!/usr/bin/env bun
/**
 * letta-code — entry point
 * A fork of letta-ai/letta that adds code-execution capabilities.
 */

import { parseArgs } from "util";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    version: { type: "boolean", short: "v" },
    help: { type: "boolean", short: "h" },
    model: { type: "string", short: "m", default: "gpt-4o" },
    context: { type: "string", short: "c" },
    debug: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

const VERSION = "0.1.0";

function printHelp() {
  console.log(`
letta-code v${VERSION}

Usage:
  letta-code [options] [prompt]

Options:
  -v, --version        Print version and exit
  -h, --help           Show this help message
  -m, --model <name>   LLM model to use (default: gpt-4o)
  -c, --context <dir>  Working directory for code execution (default: cwd)
  --debug              Enable verbose debug logging

Examples:
  letta-code "write a fibonacci function in TypeScript"
  letta-code --model gpt-4-turbo --context ./my-project "refactor index.ts"
`);
}

async function main() {
  if (values.version) {
    console.log(`letta-code v${VERSION}`);
    process.exit(0);
  }

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const prompt = positionals.join(" ").trim();

  if (!prompt) {
    console.error("Error: a prompt is required.\n");
    printHelp();
    process.exit(1);
  }

  const contextDir = values.context ?? process.cwd();
  const model = values.model!;

  if (values.debug) {
    console.debug("[debug] model:", model);
    console.debug("[debug] context dir:", contextDir);
    console.debug("[debug] prompt:", prompt);
  }

  // Dynamically import the agent to keep startup fast
  const { runAgent } = await import("./agent");

  await runAgent({ prompt, model, contextDir, debug: values.debug ?? false });
}

main().catch((err) => {
  console.error("Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});

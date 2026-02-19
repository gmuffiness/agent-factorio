import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string, defaultVal?: string): Promise<string> {
  const suffix = defaultVal ? ` [${defaultVal}]` : "";
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultVal || "");
    });
  });
}

function choose(question: string, options: string[]): Promise<string> {
  return new Promise((resolve) => {
    console.log(`\n${question}`);
    options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
    rl.question(`Select (1-${options.length}): `, (answer) => {
      const idx = parseInt(answer.trim()) - 1;
      resolve(options[idx] ?? options[0]);
    });
  });
}

async function detectMcpServers(): Promise<{ name: string; server: string }[]> {
  const mcpTools: { name: string; server: string }[] = [];

  // Check common Claude Code config locations
  const configPaths = [
    path.join(process.cwd(), ".claude", "settings.json"),
    path.join(process.env.HOME ?? "~", ".claude", "settings.json"),
  ];

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (config.mcpServers) {
          for (const [name] of Object.entries(config.mcpServers)) {
            mcpTools.push({ name, server: `mcp-server-${name}` });
          }
        }
      }
    } catch {
      // Skip invalid configs
    }
  }

  return mcpTools;
}

async function main() {
  console.log("\n  AgentFloor - Agent Hub Setup");
  console.log("  ===================================\n");

  // 1. Hub URL
  const hubUrl = await ask("Hub URL", "http://localhost:3000");

  // 2. Fetch existing departments
  let departments: { id: string; name: string }[] = [];
  try {
    const res = await fetch(`${hubUrl}/api/departments`);
    if (res.ok) {
      const data = await res.json();
      departments = data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name }));
    }
  } catch {
    console.log("  Warning: Could not connect to hub. Will create new department if needed.\n");
  }

  // 3. Agent name
  const agentName = await ask("Agent name");
  if (!agentName) {
    console.error("Agent name is required.");
    rl.close();
    process.exit(1);
  }

  // 4. Department
  let departmentId: string | undefined;
  let departmentName: string | undefined;
  if (departments.length > 0) {
    const deptOptions = [...departments.map((d) => d.name), "Create new department"];
    const deptChoice = await choose("Select department:", deptOptions);
    if (deptChoice === "Create new department") {
      departmentName = await ask("New department name");
    } else {
      const dept = departments.find((d) => d.name === deptChoice);
      departmentId = dept?.id;
    }
  } else {
    departmentName = await ask("Department name", "General");
  }

  // 5. Vendor
  const vendor = await choose("Vendor:", ["anthropic", "openai", "google"]);

  // 6. Model
  const defaultModels: Record<string, string> = {
    anthropic: "Claude Sonnet 4.5",
    openai: "GPT-4o",
    google: "Gemini 2.0 Flash",
  };
  const model = await ask("Model name", defaultModels[vendor]);

  // 7. Auto-detect MCP servers
  const detectedMcp = await detectMcpServers();
  if (detectedMcp.length > 0) {
    console.log(`\n  Detected ${detectedMcp.length} MCP server(s):`);
    detectedMcp.forEach((m) => console.log(`    - ${m.name}`));
  }

  // 8. Build payload
  const payload = {
    agentName,
    vendor,
    model,
    departmentId,
    departmentName,
    mcpTools: detectedMcp,
    skills: [],
    plugins: [],
  };

  console.log("\n  Registering agent...\n");

  try {
    const res = await fetch(`${hubUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("  Registration successful!");
      console.log(`  Agent ID: ${data.id}`);
      console.log(`  Department: ${data.departmentId}`);
      console.log(`  Message: ${data.message}`);
      console.log(`\n  View your agent at: ${hubUrl}/agents\n`);
    } else {
      const data = await res.json();
      console.error(`  Registration failed: ${data.error}`);
    }
  } catch (err) {
    console.error(`  Failed to connect to hub at ${hubUrl}`);
    console.error(`  Make sure the hub is running: pnpm dev\n`);
  }

  rl.close();
}

main();

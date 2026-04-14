import net from "node:net";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const MAX_ATTEMPTS = 20;
const DEFAULT_HOST = process.env.HOST || "0.0.0.0";
const require = createRequire(import.meta.url);
const NEXT_CLI = require.resolve("next/dist/bin/next");

function readCliOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

const requestedPortFromCli = readCliOption("--port");
const requestedHostFromCli = readCliOption("--hostname");
const DEFAULT_PORT = Number.parseInt(process.env.PORT || process.env.FRONTEND_PORT || requestedPortFromCli || "3000", 10);
const HOST = requestedHostFromCli || DEFAULT_HOST;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "127.0.0.1");
  });
}

async function findAvailablePort(preferredPort) {
  for (let offset = 0; offset < MAX_ATTEMPTS; offset += 1) {
    const port = preferredPort + offset;
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`Could not find an available port in ${preferredPort}-${preferredPort + MAX_ATTEMPTS - 1}.`);
}

async function main() {
  const requestedPort = Number.isFinite(DEFAULT_PORT) ? DEFAULT_PORT : 3000;
  const port = await findAvailablePort(requestedPort);

  if (port !== requestedPort) {
    console.log(`[dev] Port ${requestedPort} is busy, switching to ${port}.`);
  } else {
    console.log(`[dev] Using port ${port}.`);
  }

  const child = spawn(
    process.execPath,
    [NEXT_CLI, "dev", "--hostname", HOST, "--port", String(port)],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        PORT: String(port),
      },
    },
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(`[dev] ${error.message}`);
  process.exit(1);
});

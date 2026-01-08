import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");

async function build() {
  try {
    console.log("🔨 Building client...");
    execSync("vite build", { cwd: rootDir, stdio: "inherit" });

    console.log("📦 Building server...");
    // Create dist directory if it doesn't exist
    await fs.ensureDir(distDir);

    // Bundle server with esbuild
    execSync(
      `npx esbuild server/index.ts --bundle --platform=node --target=node22 --format=cjs --outfile=dist/index.cjs --external:pg --external:bcrypt --external:cloudinary --external:lightningcss --external:@babel/preset-typescript`,
      { cwd: rootDir, stdio: "inherit" }
    );

    console.log("✅ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

build();

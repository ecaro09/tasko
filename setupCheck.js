const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// =============================
// 1. ENV CHECKER
// =============================
const requiredVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];

console.log("🔍 Checking Environment Variables...\n");

let allEnvGood = true;
const envPath = path.resolve(__dirname, ".env");

if (!fs.existsSync(envPath)) {
  console.log("⚠️ No .env file found. Creating one...\n");

  const exampleContent = requiredVars
    .map((key) => `${key}=your_${key.toLowerCase()}_here`)
    .join("\n");

  fs.writeFileSync(envPath, exampleContent);
  console.log("📄 Created .env with placeholders. Please update with real values.\n");
  allEnvGood = false;
} else {
  require("dotenv").config({ path: envPath });
  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ Missing: ${key}`);
      allEnvGood = false;
    } else {
      console.log(`✅ ${key}: ${process.env[key]}`);
    }
  });
}

if (!allEnvGood) {
  const exampleContent = requiredVars
    .map((key) => `${key}=your_${key.toLowerCase()}_here`)
    .join("\n");
  fs.writeFileSync(".env.example", exampleContent);
  console.log("\n⚠️ Some environment variables are missing. Generated .env.example for guidance.\n");
}

// =============================
// 2. GIT HEAD FIXER
// =============================
console.log("\n🔍 Checking Git repository...\n");

let gitFixed = true;
try {
  if (!fs.existsSync(path.join(__dirname, ".git"))) {
    console.log("⚠️ No .git folder found. Initializing new repo...");
    execSync("git init", { stdio: "inherit" });
    console.log("✅ Git repository initialized.");
  }

  // Check HEAD
  // Use git rev-parse --is-inside-work-tree to check if it's a git repo
  // and git rev-parse --verify HEAD to check if HEAD exists
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "pipe" });
    execSync("git rev-parse --verify HEAD", { stdio: "pipe" });
    console.log("✅ Git HEAD reference found.");
  } catch (e) {
    console.log("⚠️ No HEAD found or detached HEAD. Creating main branch and initial commit if needed...");
    execSync("git branch -M main", { stdio: "inherit" });
    // Check if there are any commits. If not, make an initial empty commit.
    try {
      execSync("git rev-parse --verify main", { stdio: "pipe" });
    } catch (e) {
      // 'main' branch does not exist or has no commits
      execSync("git add .", { stdio: "inherit" });
      execSync('git commit -m "Initial commit - auto fixed missing HEAD"', { stdio: "inherit" });
      console.log("✅ Initial commit created on 'main' branch.");
    }
    execSync("git switch main", { stdio: "inherit" }); // Ensure we are on main
    console.log("✅ Git HEAD is now fixed and pointing to 'main'.");
  }

} catch (err) {
  console.error("❌ Git auto-fix failed. Please check manually.", err.message);
  gitFixed = false;
}

// =============================
// 3. FINAL STATUS
// =============================
if (allEnvGood && gitFixed) {
  console.log("\n🎉 Setup check complete: All good!\n");
} else if (allEnvGood && !gitFixed) {
  console.log("\n⚠️ Setup partially complete: Git repo needs manual attention.\n");
} else if (!allEnvGood && gitFixed) {
  console.log("\n⚠️ Setup partially complete: Please update your .env with correct values.\n");
} else {
  console.log("\n❌ Setup failed: Please address both .env and Git issues.\n");
}
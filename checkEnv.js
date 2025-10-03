// checkEnv.js
console.log("--- Checking Environment Variables (Node.js context) ---");

const requiredFirebaseEnv = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
];

const requiredSupabaseEnv = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

let allGood = true;

console.log("\n--- Firebase Environment Variables ---");
requiredFirebaseEnv.forEach(key => {
  if (process.env[key]) {
    console.log(`✅ ${key}: Loaded`);
  } else {
    console.error(`❌ ${key}: NOT FOUND. Please add this to your .env file.`);
    allGood = false;
  }
});

console.log("\n--- Supabase Environment Variables ---");
requiredSupabaseEnv.forEach(key => {
  if (process.env[key]) {
    console.log(`✅ ${key}: Loaded`);
  } else {
    console.error(`❌ ${key}: NOT FOUND. Please add this to your .env file.`);
    allGood = false;
  }
});

if (allGood) {
  console.log("\nAll required environment variables are loaded in Node.js context!");
} else {
  console.error("\nSome required environment variables are missing in Node.js context. Please check your .env file.");
  process.exit(1); // Exit with an error code
}

console.log("\n--- Reminder for Client-Side (React App) ---");
console.log("For your React app, environment variables must be prefixed with `VITE_` and are accessed via `import.meta.env`.");
console.log("Please check your BROWSER'S DEVELOPER CONSOLE for client-side variable loading status.");
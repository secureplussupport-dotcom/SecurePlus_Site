const commitMessage = String(process.env.VERCEL_GIT_COMMIT_MESSAGE || "");
const commitRef = String(process.env.VERCEL_GIT_COMMIT_REF || "");

const skipMarkers = [
  "[skip vercel]",
  "[vercel skip]",
  "[skip deploy]",
  "[no deploy]",
];

const normalizedMessage = commitMessage.toLowerCase();
const shouldSkip = skipMarkers.some(marker => normalizedMessage.includes(marker));

if (shouldSkip) {
  console.log(`Skipping Vercel deployment for ${commitRef || "this ref"} because the commit message contains a skip marker.`);
  process.exit(0);
}

console.log(`No Vercel skip marker found for ${commitRef || "this ref"}. Continuing deployment.`);
process.exit(1);

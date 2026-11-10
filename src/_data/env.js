// Netlify sets CONTEXT to "production", "deploy-preview" or "branch-deploy".
module.exports = { context: process.env.CONTEXT || "local" };

const core = require('@actions/core')
const utils = require('../lib/utils');
const { createGitHubAppClient } = require('../lib/app');

const main = async () => {
  await utils.registerSecrets()
  
  // Validate required environment variables
  if (!process.env.GH_APP_ID || process.env.GH_APP_ID.trim() === '') {
    throw new Error('GH_APP_ID environment variable is required and cannot be empty')
  }
  if (!process.env.GH_APP_PRIVATE_KEY || process.env.GH_APP_PRIVATE_KEY.trim() === '') {
    throw new Error('GH_APP_PRIVATE_KEY environment variable is required and cannot be empty')
  }
  if (!process.env.GH_APP_INSTALLATION_ID || process.env.GH_APP_INSTALLATION_ID.trim() === '') {
    throw new Error('GH_APP_INSTALLATION_ID environment variable is required and cannot be empty')
  }
  if (!process.env.ORG || process.env.ORG.trim() === '') {
    throw new Error('ORG environment variable is required and cannot be empty')
  }
  
  console.log('Environment variables validation passed')
  console.log('GH_APP_ID:', process.env.GH_APP_ID ? 'SET' : 'NOT SET')
  console.log('GH_APP_INSTALLATION_ID:', process.env.GH_APP_INSTALLATION_ID ? 'SET' : 'NOT SET')
  console.log('ORG:', process.env.ORG)
  
  const appClient = await createGitHubAppClient()
  const client = await appClient.getInstallationOctokit(process.env.GH_APP_INSTALLATION_ID)
  const since = await utils.getSince(7)
  await client.inactiveUsers.audit(process.env.ORG, since)
}

main().catch(err => {
    core.setFailed(err.message)
})

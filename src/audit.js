const core = require('@actions/core')
const utils = require('../lib/utils');
const { createGitHubAppClient } = require('../lib/app');

const main = async () => {
  await utils.registerSecrets()
  
  // Validate required environment variables
  if (!process.env.GH_APP_ID) {
    throw new Error('GH_APP_ID environment variable is required')
  }
  if (!process.env.GH_APP_PRIVATE_KEY) {
    throw new Error('GH_APP_PRIVATE_KEY environment variable is required')
  }
  if (!process.env.GH_APP_INSTALLATION_ID) {
    throw new Error('GH_APP_INSTALLATION_ID environment variable is required')
  }
  
  const appClient = await createGitHubAppClient()
  const client = await appClient.getInstallationOctokit(process.env.GH_APP_INSTALLATION_ID)
  const since = await utils.getSince(2)
  await client.inactiveUsers.audit(process.env.ORG, since)
}

main().catch(err => {
    core.setFailed(err.message)
})

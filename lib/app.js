const { Octokit } = require('@octokit/rest')
const { retry } = require('@octokit/plugin-retry')
const { throttling } = require('@octokit/plugin-throttling')

const database = require('./database')
const { App } = require('@octokit/app')
const { inactiveUsers } = require('./inactiveUsers')

const _Octokit = Octokit.plugin(retry, throttling, inactiveUsers)

exports.createGitHubAppClient = () => {
  return new App({
    appId: process.env.GH_APP_ID,
    privateKey: process.env.GH_APP_PRIVATE_KEY,
    Octokit: _Octokit.defaults({
      throttle: {
        onRateLimit: async (retryAfter, options, octokit) => {
          octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`)
          if (options.request.retryCount <= 1) {
            const customDelay = retryAfter + 60 // add 60 seconds to be sure
            octokit.log.warn(`Retrying after ${customDelay} seconds!`)
            await new Promise(resolve => setTimeout(resolve, customDelay * 1000));
            return true
          }
        },
        onSecondaryRateLimit: (retryAfter, options, octokit) => {
          octokit.log.warn(`Abuse detected for request ${options.method} ${options.url}`)
          return true
        }
      }
    })
  })
}
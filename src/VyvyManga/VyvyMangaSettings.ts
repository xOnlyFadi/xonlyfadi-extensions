import {
    DUISection,
    DUIInputField,
    SourceStateManager
} from '@paperback/types'

import { randUA } from '@ivanmatthew/rand-user-agent-cjs/dist/index.js'

// Todo: Seperate?
// class UserAgentStore {
//     private static USER_AGENT_STORE_KEY: string = 'custom_user_agent'
//     private readonly _stateManager: SourceStateManager

//     constructor(stateManager: SourceStateManager) {
//         this._stateManager = stateManager
//     }

//     async get(): Promise<string> {
//         return await this._stateManager.retrieve(UserAgentStore.USER_AGENT_STORE_KEY)
//     }
//     async set(userAgent: string): Promise<void> {
//         return await this._stateManager.store(UserAgentStore.USER_AGENT_STORE_KEY, userAgent)
//     }
// }
export const UserAgentStore = {
    async get(stateManager: SourceStateManager): Promise<string> {
        return (await stateManager.retrieve('custom_user_agent') || 'NA')
    },
    async set(stateManager: SourceStateManager, userAgent: string): Promise<void> {
        return await stateManager.store('custom_user_agent', userAgent)
    }
}

export const userAgentSettings = (stateManager: SourceStateManager): DUISection => {
    let someVal = 'NA'

    UserAgentStore.get(stateManager).then((val) => {
        someVal = val
    })
    return App.createDUISection({
        id: 'cust_ua_sect',
        footer: 'If you are unable to view content on VyVyManga, consider changing your user agent.',
        isHidden: false,
        rows: async () => [
            App.createDUILabel({
                id: 'custom_user_agent_if',
                label: someVal,
                value: undefined
            }),
            App.createDUIButton({
                id: 'randomize_user_agent',
                label: 'Randomize User Agent',
                onTap: async () => {
                    const newUserAgent = randUA('mobile', 'safari', 'ios')
                    if (newUserAgent === 'No Agent Found') throw new Error('Failed to generate randomized user agent') // edgecase, shouldn't happen
                    await UserAgentStore.set(stateManager, newUserAgent)
                }
            }),
            App.createDUIButton({
                id: 'reset',
                label: 'Reset to Default',
                onTap: async () => {
                    await UserAgentStore.set(stateManager, '')
                }
            })
        ]
    })
}

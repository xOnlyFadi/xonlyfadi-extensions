/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
    DUIButton,
    DUINavigationButton,
    SourceStateManager 
} from '@paperback/types'

import { CMLanguages } from './ComicKHelper'

export const chapterSettings = (stateManager: SourceStateManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: 'chapter_settings',
        label: 'Chapter Settings',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    id: 'contentchapter',
                    footer: 'When both enabled, chapter title and volume will be shown or one of them is enabled is gonna show what is enabled.',
                    isHidden: false,
                    rows: async () => [
                        App.createDUISwitch({
                            id: 'show_volume_number',
                            label: 'Show Chapter Volume',
                            value: App.createDUIBinding({
                                get: async () => await stateManager.retrieve('show_volume_number') ?? false,
                                set: async (newValue) => await stateManager.store('show_volume_number', newValue)
                            })
                        }),
                        App.createDUISwitch({
                            id: 'show_title',
                            label: 'Show Chapter Title',
                            value: App.createDUIBinding({
                                get: async () => await stateManager.retrieve('show_title') ?? false,
                                set: async (newValue) => await stateManager.store('show_title', newValue)
                            })
                        })
                    ]
                })

            ]
        })
    })
}

export const languageSettings = (stateManager: SourceStateManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: 'language_settings',
        label: 'Language Settings',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    id: 'content',
                    footer: 'When enabled, it will filter New & Hot based on which languages that were chosen.',
                    isHidden: false,
                    rows: async () => [
                        App.createDUISelect({
                            id: 'languages',
                            label: 'Languages',
                            options: CMLanguages.getCMCodeList(),
                            labelResolver: async (option) => CMLanguages.getName(option),
                            value: App.createDUIBinding({
                                get: async () => await stateManager.retrieve('languages') ?? CMLanguages.getDefault(),
                                set: async (newValue) => await stateManager.store('languages', newValue)
                            }),
                            allowsMultiselect: true,
                        }),
                        App.createDUISwitch({
                            id: 'language_home_filter',
                            label: 'Filter Homepage Language',
                            value: App.createDUIBinding({
                                get: async () => await stateManager.retrieve('language_home_filter') ?? false,
                                set: async (newValue) => await stateManager.store('language_home_filter', newValue)
                            }),
                        })
                    ]
                })
            ]
        })
    })
}

export const resetSettings = (stateManager: SourceStateManager): DUIButton => {
    return App.createDUIButton({
        id: 'reset',
        label: 'Reset to Default',
        onTap: async () => {
            stateManager.store('show_volume_number', null),
            stateManager.store('show_title', null),
            stateManager.store('languages', null),
            stateManager.store('language_home_filter', null)
        }
    })
}

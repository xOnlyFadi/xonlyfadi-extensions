/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Button,
    NavigationButton,
    SourceStateManager,
} from 'paperback-extensions-common'
import { CMLanguages } from './ComickHelper'



export const getShowChapterVolume = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('show_volume_number') as boolean) ?? false
}

export const getShowChapterTitle = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('show_title') as boolean) ?? false
}

export const chapterSettings = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'chapter_settings',
        value: '',
        label: 'Chapter Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('show_volume_number', values.show_volume_number),
                    stateManager.store('show_title', values.show_title)
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'contentchapter',
                        footer: 'When both enabled, chapter title and volume will be shown or one of them is enabled is gonna show what is enabled.',
                        rows: () => {
                            return Promise.all([
                                getShowChapterVolume(stateManager),
                                getShowChapterTitle(stateManager)
                            ]).then(async values => {
                                return [
                                    createSwitch({
                                        id: 'show_volume_number',
                                        label: 'Show Chapter Volume',
                                        value: values[0]
                                    }),
                                    createSwitch({
                                        id: 'show_title',
                                        label: 'Show Chapter Title',
                                        value: values[1]
                                    })
                                ]
                            })
                        }
                    })
                ])
            }
        })
    })
}

export const getLanguages = async (stateManager: SourceStateManager): Promise<string[]> => {
    return (await stateManager.retrieve('languages') as string[]) ?? CMLanguages.getDefault()
}

export const getHomeFilter = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('language_home_filter') as boolean) ?? false
}

export const languageSettings = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'language_settings',
        value: '',
        label: 'Language Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('languages', values.languages),
                    stateManager.store('language_home_filter', values.language_home_filter),
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'content',
                        footer: 'When enabled, it will filter New & Hot based on which languages that were chosen.',
                        rows: () => {
                            return Promise.all([
                                getLanguages(stateManager),
                                getHomeFilter(stateManager),
                            ]).then(async values => {
                                return [
                                    createSelect({
                                        id: 'languages',
                                        label: 'Languages',
                                        options: CMLanguages.getCMCodeList(),
                                        displayLabel: option => CMLanguages.getName(option),
                                        value: values[0],
                                        allowsMultiselect: true,
                                        minimumOptionCount: 1,
                                    }),
                                    createSwitch({
                                        id: 'language_home_filter',
                                        label: 'Filter Homepage Language',
                                        value: values[1]
                                    })
                                ]
                            })
                        }
                    })
                ])
            }
        })
    })
}

export const resetSettings = (stateManager: SourceStateManager): Button => {
    return createButton({
        id: 'reset',
        label: 'Reset to Default',
        value: '',
        onTap: () => {
            return Promise.all([
                stateManager.store('show_volume_number', null),
                stateManager.store('show_title', null),
                stateManager.store('languages', null),
                stateManager.store('language_home_filter', null),
            ]).then()
        }
    })
}

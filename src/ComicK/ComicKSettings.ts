import {
    DUIButton,
    DUINavigationButton,
    SourceStateManager
} from '@paperback/types'

import {
    CMLanguages
} from './ComicKHelper'

export const getLanguages = async (stateManager: SourceStateManager): Promise<string[]> => {
    return (await stateManager.retrieve('languages') ?? CMLanguages.getDefault())
}

export const getLanguageHomeFilter = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('language_home_filter') ?? false)
}

export const getUploaderInput = async (stateManager: SourceStateManager): Promise<string> => {
    return (await stateManager.retrieve('uploader') as string) ?? ''
}

const getUploaders = async (stateManager: SourceStateManager): Promise<string[]> => {
    return (await stateManager.retrieve('uploaders') ?? [])
}

const getUploadersWhitelisted = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('uploaders_whitelisted') ?? false)
}

const getSelectedUploaders = async (stateManager: SourceStateManager): Promise<string[]> => {
    return (await stateManager.retrieve('uploaders_selected') ?? [])
}

const getUploadersFiltering = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('uploaders_toggled') ?? false)
}

const getAggresiveUploadersFiltering = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('aggressive_uploaders_filtering') ?? false)
}

const getStrictNameMatching = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('strict_name_matching') ?? false)
}

const showTitle = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('show_title') ?? false)
}

const showVolumeNumber = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('show_volume_number') ?? false)
}

const getChapterScoreFiltering = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('chapter_score_filtering') ?? false)
}

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
                                get: () => showVolumeNumber(stateManager),
                                set: async (newValue) => await stateManager.store('show_volume_number', newValue)
                            })
                        }),
                        App.createDUISwitch({
                            id: 'show_title',
                            label: 'Show Chapter Title',
                            value: App.createDUIBinding({
                                get: () => showTitle(stateManager),
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
                                get: () => getLanguages(stateManager),
                                set: async (newValue) => await stateManager.store('languages', newValue)
                            }),
                            allowsMultiselect: true
                        }),
                        App.createDUISwitch({
                            id: 'language_home_filter',
                            label: 'Filter Homepage Language',
                            value: App.createDUIBinding({
                                get: () => getLanguageHomeFilter(stateManager),
                                set: async (newValue) => await stateManager.store('language_home_filter', newValue)
                            })
                        })
                    ]
                })
            ]
        })
    })
}

export const uploadersSettings = (stateManager: SourceStateManager): DUINavigationButton => {
    const uploaderInputBinding = App.createDUIBinding({
        get: () => getUploaderInput(stateManager),
        set: async (newValue: string) => await stateManager.store('uploader', newValue)
    })

    return App.createDUINavigationButton({
        id: 'uploaders_settings',
        label: 'Uploaders Settings',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    id: 'chapter_score_filtering',
                    header: 'Filter Chapters by Score',
                    footer: 'Show only the uploader with the most upvotes for each chapter.\nDisable to manually manage uploader filtering.',
                    isHidden: false,
                    rows: async () => [
                        App.createDUISwitch({
                            id: 'toggle_chapter_score_filtering',
                            label: 'Enable Chapter Score Filtering',
                            value: App.createDUIBinding({
                                get: () => getChapterScoreFiltering(stateManager),
                                set: async (newValue: boolean) => await stateManager.store('chapter_score_filtering', newValue)
                            })
                        })
                    ]
                }),                
                App.createDUISection({
                    id: 'modify_uploaders',
                    header: 'Uploaders',
                    isHidden: await getChapterScoreFiltering(stateManager),
                    rows: async () => [
                        App.createDUISelect({
                            id: 'uploaders',
                            label: 'Select Uploaders',
                            options: await getUploaders(stateManager),
                            value: App.createDUIBinding({
                                get: () => getSelectedUploaders(stateManager),
                                set: async (newValue) => { await stateManager.store('uploaders_selected', newValue) }
                            }),
                            labelResolver: async (value) => value,
                            allowsMultiselect: true
                        }),
                        App.createDUIInputField({
                            id: 'uploader',
                            label: 'Uploader Name',
                            value: uploaderInputBinding
                        }),
                        App.createDUIButton({
                            id: 'add_uploader',
                            label: 'Add Uploader',
                            onTap: async () => {
                                const targetUploader = await getUploaderInput(stateManager)

                                if (targetUploader === '') {
                                    throw new Error('Uploader cannot be empty!')
                                }

                                const uploaders = await getUploaders(stateManager)
                                const uploadersSet = new Set(uploaders)

                                if (uploadersSet.has(targetUploader)) {
                                    throw new Error(`Uploader ${targetUploader} already exists!`)
                                } else {
                                    uploaders.push(targetUploader)
                                    await stateManager.store('uploaders', uploaders)
                                }

                                await uploaderInputBinding.set('')
                            }
                        }),
                        App.createDUIButton({
                            id: 'remove_uploader',
                            label: 'Remove Uploader',
                            onTap: async () => {
                                const targetUploader = await getUploaderInput(stateManager)

                                if (targetUploader === '') {
                                    throw new Error('Uploader cannot be empty!')
                                }

                                const uploaders = await getUploaders(stateManager)
                                const uploadersSet = new Set(uploaders)

                                if (uploadersSet.has(targetUploader)) {
                                    uploaders.splice(uploaders.indexOf(targetUploader), 1)
                                    await stateManager.store('uploaders', uploaders)
                                } else {
                                    throw new Error(`Uploader ${targetUploader} does not exists!`)
                                }

                                await uploaderInputBinding.set('')
                            }
                        })
                    ]
                }),
                App.createDUISection({
                    id: 'select_uploaders',
                    header: 'Filtering Settings',
                    footer: 'Filter Uploaders by name.\nBy default, selected uploaders are excluded from chapter lists (blacklist mode).',
                    isHidden: await getChapterScoreFiltering(stateManager),
                    rows: async () => [
                        App.createDUISwitch({
                            id: 'toggle_uploaders_filtering',
                            label: 'Enable Uploader filtering',
                            value: App.createDUIBinding({
                                get: () => getUploadersFiltering(stateManager),
                                set: async (newValue: boolean) => await stateManager.store('uploaders_toggled', newValue)
                            })
                        }),
                        App.createDUISwitch({
                            id: 'uploaders_switch',
                            label: 'Enable whitelist mode',
                            value: App.createDUIBinding({
                                get: () => getUploadersWhitelisted(stateManager),
                                set: async (newValue: boolean) => await stateManager.store('uploaders_whitelisted', newValue)
                            })
                        }),
                        App.createDUISwitch({
                            id: 'toggle_uploaders_filtering_aggressiveness',
                            label: 'Toggle aggressive filtering',
                            value: App.createDUIBinding({
                                // default to true if no value is set
                                get: () => getAggresiveUploadersFiltering(stateManager),
                                set: async (newValue: boolean) => await stateManager.store('aggressive_uploaders_filtering', newValue)
                            })
                        }),
                        App.createDUISwitch({
                            id: 'strict_name_matching',
                            label: 'Strict uploader name matching',
                            value: App.createDUIBinding({
                                get: () => getStrictNameMatching(stateManager),
                                set: async (newValue: boolean) => await stateManager.store('strict_name_matching', newValue)
                            })
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
            await Promise.all([
                stateManager.store('show_volume_number', null),
                stateManager.store('show_title', null),
                stateManager.store('languages', null),
                stateManager.store('language_home_filter', null),
                stateManager.store('chapter_score_filtering', null),
                stateManager.store('uploaders', null),
                stateManager.store('uploaders_whitelisted', null),
                stateManager.store('aggressive_uploaders_filtering', null),
                stateManager.store('uploaders_toggled', null),
                stateManager.store('uploader', null),
                stateManager.store('strict_name_matching', null)
            ])
        }
    })
}

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


const getUploaders = async (stateManager: SourceStateManager): Promise<Uploader[]> => {
    return (await stateManager.retrieve('uploaders') ?? [])
}
const getSelectedUploaders = async (stateManager: SourceStateManager): Promise<Uploader[]> => {
    return (await getUploaders(stateManager) ?? []).filter((uploader: any) => uploader.selected).map((uploader: any) => uploader.value)
}

export type Uploader = {
    selected: boolean
    value: string
}

export const uploadersSettings = (stateManager: SourceStateManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: 'uploaders_settings',
        label: 'Uploaders Settings',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    id: 'select_uploaders',
                    footer: 'Select which uploaders you want or not want to see when browsing.\nBy default, this feature is disabled, but when enabled and an uploader is selected, it will be excluded from the chapter lists.\nYou can change this behavior by toggling the corresponding switch above.',
                    isHidden: false,
                    rows: async () => [
                        App.createDUISwitch({
                            id: 'toggle_uploaders_filtering',
                            label: 'Toggle uploaders filtering',
                            value: App.createDUIBinding({
                                get: async () => await stateManager.retrieve('uploaders_toggled') ?? false,
                                set: async (newValue: boolean) => await stateManager.store('uploaders_toggled', newValue)
                            }),
                        }),
                        App.createDUISelect({
                            id: 'uploaders',
                            label: 'Uploaders',
                            options: (await getUploaders(stateManager)).map((uploader: Uploader) => uploader.value),
                            labelResolver: async (option) => {
                                return option
                            },
                            value: App.createDUIBinding({
                                get: async () => await getSelectedUploaders(stateManager),
                                set: async (selectedUploaders: string[]) => {
                                    const uploaders: Uploader[] = await getUploaders(stateManager)

                                    uploaders.forEach((uploader: Uploader) => {
                                        uploader.selected = false
                                    })

                                    selectedUploaders.forEach((selectedUploader: string) => {
                                        uploaders.forEach((uploader: Uploader) => {
                                            if (uploader.value === selectedUploader) {
                                                uploader.selected = true
                                            }
                                        })
                                    })
                                    
                                    await stateManager.store('uploaders', uploaders)
                                }
                            }),
                            allowsMultiselect: true,
                        }),
                        App.createDUISwitch({
                            id: 'uploaders_switch',
                            label: 'Blacklist / Whitelist Uploaders',
                            value: App.createDUIBinding({
                                get: async () => await stateManager.retrieve('uploaders_whitelisted') ?? false,
                                set: async (newValue: boolean) => await stateManager.store('uploaders_whitelisted', newValue)
                            }),
                        }),
                        App.createDUISwitch({
                            id: 'toggle_uploaders_filtering_aggressiveness',
                            label: 'Toggle aggressive filtering',
                            value: App.createDUIBinding({
                                // default to true if no value is set
                                get: async () => {
                                    const value = await stateManager.retrieve('aggressive_uploaders_filtering')
                                    

                                    if (value !== false) {
                                        return true
                                    }

                                    return false
                                },
                                set: async (newValue: boolean) => await stateManager.store('aggressive_uploaders_filtering', newValue)
                            }),
                        }),
                        App.createDUISwitch({
                            id: 'strict_name_matching',
                            label: 'Strict uploader name matching',
                            value: App.createDUIBinding({
                                get: async () => await stateManager.retrieve('strict_name_matching') ?? false,
                                set: async (newValue: boolean) => await stateManager.store('strict_name_matching', newValue)
                            }),
                        })
                    ]
                }),
                App.createDUISection({
                    id: 'modify_uploaders',
                    footer: 'Edit list of uploaders.',
                    isHidden: false,
                    rows: async () => [
                        App.createDUIInputField({
                            id: 'uploader',
                            label: 'Uploader',
                            value: App.createDUIBinding({
                                get: async () => '',
                                set: async (newValue: string) => await stateManager.store('uploader', newValue)
                            }),
                        }),
                        App.createDUIButton({
                            id: 'add_uploader',
                            label: 'Add Uploader',
                            onTap: async () => {
                                const targetUploader: string = await stateManager.retrieve('uploader') ?? ''

                                if (targetUploader === '') {
                                    throw new Error('Uploader cannot be empty!')
                                }

                                const uploaders: Uploader[] = await getUploaders(stateManager)

                                if (uploaders.filter((uploader: Uploader) => uploader.value === targetUploader).length > 0) {
                                    console.log(`Uploader '${targetUploader}' already exists in list. (${uploaders.map((uploader: Uploader) => uploader.value).join(', ')})`)
                                    throw new Error('Uploader already exists in your list!')
                                } else {
                                    uploaders.push({
                                        selected: false,
                                        value: targetUploader
                                    })
                                    await stateManager.store('uploaders', uploaders)
                                }
                            }
                        }),
                        App.createDUIButton({
                            id: 'remove_uploader',
                            label: 'Remove Uploader',
                            onTap: async () => {
                                const targetUploader: string = await stateManager.retrieve('uploader') ?? ''

                                if (targetUploader === '') {
                                    throw new Error('Uploader cannot be empty!')
                                }

                                const uploaders: Uploader[] = await getUploaders(stateManager)
                                uploaders.forEach((uploader: Uploader) => {
                                    if (uploader.value === targetUploader) {
                                        const index = uploaders.indexOf(uploader)
                                        
                                        if (index > -1) {
                                            uploaders.splice(index, 1)
                                        }
                                    }
                                })
                                await stateManager.store('uploaders', uploaders)
                            }
                        }),
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
            stateManager.store('language_home_filter', null),
            stateManager.store('uploaders', null),
            stateManager.store('uploaders_whitelisted', null),
            stateManager.store('aggressive_uploaders_filtering', null),
            stateManager.store('uploaders_toggled', null),
            stateManager.store('uploader', null),
            stateManager.store('strict_name_matching', null)
        }
    })
}

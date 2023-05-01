import { 
    SourceStateManager,
    DUINavigationButton 
} from '@paperback/types'

export const getNSFW = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('nsfw') as boolean) ?? false
}

export const contentSettings = (stateManager: SourceStateManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: 'content_settings',
        label: 'Configuración del contenido',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    id: 'content',
                    footer: 'Activa el NSFW en la aplicación',                    
                    isHidden: false,
                    rows: async () => [
                        App.createDUISwitch({
                            id: 'nsfw',
                            label: 'NSFW',
                            value: App.createDUIBinding({
                                get: async () => await stateManager.retrieve('nsfw') ?? false,
                                set: async (newValue) => await stateManager.store('nsfw', newValue)
                            })
                        })
                    ]
                })
            ]
            
        })
    })
}

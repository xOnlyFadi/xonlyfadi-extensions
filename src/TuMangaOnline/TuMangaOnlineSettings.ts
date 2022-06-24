/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    SourceStateManager,
    NavigationButton
} from 'paperback-extensions-common'

export const getNSFW = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('nsfw') as boolean) ?? false
}

export const contentSettings = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'content_settings',
        value: '',
        label: 'Configuración del contenido',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('nsfw', values.nsfw),
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'content',
                        footer: 'Activa el NSFW en la aplicación',
                        rows: () => {
                            return Promise.all([
                                getNSFW(stateManager),
                            ]).then(async values => {
                                return [
                                    createSwitch({
                                        id: 'nsfw',
                                        label: 'NSFW',
                                        value: values[0]
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
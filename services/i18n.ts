import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'

import pt from '../locales/pt.json'
import en from '../locales/en.json'

i18n.use(initReactI18next).init({
    lng:"pt",//Idioma padrão
    fallbackLng:"en",//Fallback se não encontrar tradução
    resources:{
        pt:{translation:pt},
        en:{translation:en}
    },
    interpolation:{
        escapeValue: false //React ja faz proteção contra XSS
    }
})

export default i18n



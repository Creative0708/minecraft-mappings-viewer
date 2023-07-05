import { createApp } from 'vue'

import App from './App.vue'
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import ToastService from 'primevue/toastservice';
import ConfimationService from 'primevue/confirmationservice';

createApp(App)
    .use(PrimeVue, {
        locale: {
            emptySelectionMessage: "",
            selectionMessage: "",
        }
    })
    .use(ConfimationService)
    .use(createPinia())
    .mount('#app');

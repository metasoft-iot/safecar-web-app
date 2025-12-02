import { createApp } from 'vue'
//importar styles.css global de src/
import './styles.css'
import './styles-responsive.css'

import App from './App.vue'

// i18n para internacionalización
import i18n from "./i18n.js";

// PrimeVue y tema
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

//PrimeFlex
import 'primeflex/primeflex.css';

// PrimeIcons
import "primeicons/primeicons.css";
import ConfirmationService from "primevue/confirmationservice";
import DialogService from "primevue/dialogservice";
import ToastService from "primevue/toastservice";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import ConfirmDialog from "primevue/confirmdialog";
import Checkbox from "primevue/checkbox";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import FileUpload from "primevue/fileupload";
import FloatLabel from "primevue/floatlabel";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Password from "primevue/password";
import Menu from "primevue/menu";
import Message from "primevue/message";
import Rating from "primevue/rating";
import Row from "primevue/row";
import Drawer from "primevue/drawer";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import Toolbar from "primevue/toolbar";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Chart from "primevue/chart";


import Toast from "primevue/toast";
import Tooltip from "primevue/tooltip";


//importado de manera local de "router/index.js" creado y ubicado en src
import router from "./router/index.js";
import SelectButton from "primevue/selectbutton";
import Tabs from "primevue/tabs";
import DataView from "primevue/dataview";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    AutoComplete,
    Badge, Calendar, Chips, Dropdown, InputMask, InputSwitch, Paginator, ProgressBar, ProgressSpinner,
    SplitButton,
    TabPanels
} from "primevue";
import Chip from 'primevue/chip';


import { createPinia } from "pinia";



/**
 * ========== SafeCar FRONTEND ==========
 *
 * ARQUITECTURA:
 * - Vue 3 + Composition API
 * - PrimeVue para componentes UI
 * - PrimeFlex para layout responsive
 * - PrimeIcons para iconografía
 * - Vue Router para navegación
 * - Pinia para gestión de estado
 *
 * FUNCIONALIDADES:
 *
 * CARACTERÍSTICAS TÉCNICAS:
 * - Componentes reutilizables y modulares
 * - Estilos personalizados para PrimeVue
 * - Transiciones suaves y animaciones
 */

//create app instance
const app = createApp(App)

// Use Pinia BEFORE Router to ensure stores are available for guards
const pinia = createPinia();
app.use(pinia);

// Use Router
app.use(router);

//use Vue i18n
app.use(i18n)

// Use PrimeVue - Configurado para modo claro forzado
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.force-dark-mode', // Selector personalizado que nunca se aplicará
            cssLayer: false
        }
    },
    ripple: true
})
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService);

// Register PrimeVue directives
app.directive('tooltip', Tooltip);




// Use PrimeVue Components
app.component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-column', Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-checkbox', Checkbox)
    .component('pv-data-table', DataTable)
    .component('pv-dialog', Dialog)
    .component('pv-select', Select)
    .component('pv-select-button', SelectButton)
    .component('pv-file-upload', FileUpload)
    .component('pv-float-label', FloatLabel)
    .component('pv-icon-field', IconField)
    .component('pv-input-icon', InputIcon)
    .component('pv-input-text', InputText)
    .component('pv-input-number', InputNumber)
    .component('pv-password', Password)
    .component('pv-menu', Menu)
    .component('pv-message', Message)
    .component('pv-rating', Rating)
    .component('pv-row', Row)
    .component('pv-drawer', Drawer)
    .component('pv-tag', Tag)
    .component('pv-textarea', Textarea)
    .component('pv-toolbar', Toolbar)
    .component('pv-toast', Toast)
    .component('pv-tabs', Tabs)
    .component('pv-tab-list', TabList)
    .component('pv-tab', Tab)
    .component('pv-tab-panel', TabPanel)
    .component('pv-tab-panels', TabPanels)
    .component('pv-tab-view', TabView)
    .component('pv-data-view', DataView)
    .component('pv-accordion', Accordion)
    .component('pv-accordion-panel', AccordionPanel)
    .component('pv-accordion-header', AccordionHeader)
    .component('pv-accordion-content', AccordionContent)
    .component('pv-badge', Badge)
    .component('pv-split-button', SplitButton)
    .component('pv-auto-complete', AutoComplete)
    .component('pv-dropdown', Dropdown)
    .component('pv-progress-bar', ProgressBar)
    .component('pv-calendar', Calendar)
    .component('pv-input-switch', InputSwitch)
    .component('pv-chips', Chips)
    .component('pv-progress-spinner', ProgressSpinner)
    .component('pv-input-mask', InputMask)
    .component('pv-chip', Chip)
    .component('pv-paginator', Paginator)
    .component('pv-chart', Chart);

app.mount('#app')
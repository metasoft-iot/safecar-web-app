import { createRouter, createWebHistory } from "vue-router";
import SignInComponent from "@/security/pages/sign-in.component.vue";
import SignUpComponent from "@/security/pages/sign-up.component.vue";
import LayoutSafeCarComponent from "@/public/pages/layout-safe-car.component.vue";
import serviceHistoryManagementComponent
    from "@/service-history/pages/service-history-management.component.vue";
import AppointmentRequestManagementComponent
    from "@/service-requests/pages/appointment-request-management.component.vue";
import AppointmentRequestDetailManagementComponent
    from "@/service-requests/pages/appointment-request-detail-management.component.vue";
import DashboardManagementComponent from "@/dashboard/pages/dashboard-management.component.vue";
import VehicleManagementComponent from "@/vehicle-management/pages/vehicle-management.component.vue";
import VehicleDetailManagementComponent from "@/vehicle-management/pages/vehicle-detail-management.component.vue";
import MechanicManagementComponent from "@/workshop/pages/mechanic-management.component.vue";



const router = createRouter({
    history: createWebHistory(),
    routes: [


        { path: '/:pathMatch(.*)*', redirect: '/sign-in' },


        {
            path: '',
            name: 'sign-in',
            component: SignInComponent,
            meta: { title: 'Login' }
        },

        {
            path: '/sign-in',
            name: 'sign-in',
            component: SignInComponent,
            meta: { title: 'Login' }
        },


        {
            path: '/sign-up',
            name: 'sign-up',
            component: SignUpComponent,
            meta: { title: 'Registro de Taller' }
        },


        {
            path: '/safe-car', name: 'safe-car', component: LayoutSafeCarComponent, meta: { title: 'SafeCar' },
            redirect: { name: 'mechanic-dashboard' },
            children: [

                // =================== Rutas de dashboard ejecutivo ========================
                {
                    path: 'mechanic/dashboard',
                    name: 'mechanic-dashboard',
                    component: DashboardManagementComponent,
                    meta: { title: 'Dashboard Ejecutivo' }
                },
                // ========================================================================

                // ============ Rutas de solicitud de servicio para el mecánico ============
                {
                    path: 'mechanic/service-request',
                    name: 'appointment-request',
                    component: AppointmentRequestManagementComponent,
                    meta: { title: 'Solicitudes de Servicio' }
                },
                {
                    path: 'mechanic/appointment-request-details',
                    name: 'appointment-request-details',
                    component: AppointmentRequestDetailManagementComponent,
                    meta: { title: 'Detalles de Solicitud de Servicio' }
                },
                // ========================================================================

                // ============ Rutas de historial de servicio para el mecánico ============
                {
                    path: 'mechanic/service-history',
                    name: 'mechanic-service-history',
                    component: serviceHistoryManagementComponent,
                    meta: { title: 'Historial de Servicio' }
                },
                // =========================================================================

                // =================== Rutas para la gestion de vehículos ==================
                {
                    path: 'mechanic/vehicle-management',
                    name: 'vehicle-management',
                    component: VehicleManagementComponent,
                    meta: { title: 'Gestión de Vehículos' }
                },
                {
                    path: 'mechanic/vehicle-details',
                    name: 'vehicle-details',
                    component: VehicleDetailManagementComponent,
                    meta: { title: 'Detalles del Vehículo' }
                },
                // =========================================================================

                // =================== Rutas para la gestion de mecánicos ==================
                {
                    path: 'mechanic/management',
                    name: 'mechanic-management',
                    component: MechanicManagementComponent,
                    meta: { title: 'Gestión de Mecánicos' }
                },
                // =========================================================================






            ]
        }






        //




        //{path: '/page-not-found',           name: 'PageNotFound',             component: PageNotFoundComponent,' +'            meta: { title: 'Page Not Found' }},


        /*

        {path: '/:pathMatch(.*)*', redirect: '/elixir-line/login'},

        {path: '/page-not-found',           name: 'PageNotFound',             component: PageNotFoundComponent,            meta: { title: 'Page Not Found' }},

        {path: '/elixir-line/login' ,       name: 'Login', component: SignInComponent, meta: { title: 'Login'}},


        //ruta para la página de inicio home-elixir line
        {
            path: '/elixir-line/:id/home', name: 'ElixirLineHome', component: LayoutElixirLineComponent,
            children:[
                {path: '/vinicultor/winemaking',      name: 'WinemakingProcess', component: TabsWinemakingViewComponent,     meta: { title: 'Winemaking'}},
                {path:'/vinicultor/supplies', name: 'SuppliesManagement', component: SupplyManagement, meta: { title: 'Supplies'}},
                {path: '/vinicultor/profile/settings', name: 'ProfileSettings', component: ProfileViewsConfigurationComponent, meta: { title: 'Profile Settings'}},

                { path: '/vinicultor/tasks', name: 'Tasks', component: TaskManagement, meta: { title: 'Tasks' } } ,
                { path: '/vinicultor/Calendar', name: 'Calendar', component: CalendarManagement, meta: { title: 'Calendar' } },

                {path: '/vinicultor/evidence', name: 'EvidenceManagement', component: tabsEvidenceViewComponent, meta: { title: 'EvidenceManagement'}},



            ], meta: { title: 'Wine Batches' },

        },
         */


    ]
});


router.beforeEach((to, from, next) => {
    let baseTitle = 'SafeCar';
    document.title = `${baseTitle} | ${to.meta['title']}`;
    next();
})


export default router;
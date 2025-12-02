import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/loginView.vue'
import MyProcessesView from '../views/myProcessesView.vue'
import AllProcessesView from '../views/allProcessesView.vue'
import CreateNewProcessView from '../views/createNewProcessView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/my-processes',
    name: 'MyProcesses',
    component: MyProcessesView
  },
  {
    path: '/all-processes',
    name: 'AllProcesses',
    component: AllProcessesView
  },
  {
    path: '/create-new-process',
    name: 'CreateNewProcess',
    component: CreateNewProcessView
  },

]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router

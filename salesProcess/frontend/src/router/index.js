import { createRouter, createWebHashHistory } from "vue-router";
import { useAuth } from "../composables/useAuth";
import LoginView from "../views/loginView.vue";
import MyProcessesView from "../views/myProcessesView.vue";
import AllProcessesView from "../views/allProcessesView.vue";
import SingleProcessView from "../views/singleProcessView.vue";
import ProfileView from "../views/profileView.vue";

const routes = [
  {
    path: "/",
    redirect: () => {
      const { isAuthenticated } = useAuth();
      return isAuthenticated.value ? "/all-processes" : "/login";
    },
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/my-processes",
    name: "MyProcesses",
    component: MyProcessesView,
    meta: {
      requiresAuth: true,
      allowedRoles: ["salesManager"],
    },
  },
  {
    path: "/all-processes",
    name: "AllProcesses",
    component: AllProcessesView,
    meta: {
      requiresAuth: true,
      allowedRoles: ["viewer", "salesManager", "marketingManager"],
    },
  },
  {
    path: "/processes/new",
    name: "CreateNewSale",
    component: SingleProcessView,
    meta: {
      requiresAuth: true,
      allowedRoles: ["salesManager"],
    },
    beforeEnter: (to, from, next) => {
      to.params.id = "new";
      next();
    },
  },
  {
    path: "/processes/:id",
    name: "SingleProcess",
    component: SingleProcessView,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const { isAuthenticated, isSalesManager, isMarketingManager, isViewer } =
    useAuth();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next("/login");
    return;
  }

  if (to.meta.allowedRoles && isAuthenticated.value) {
    const hasAccess = to.meta.allowedRoles.some((role) => {
      switch (role) {
        case "salesManager":
          return isSalesManager.value;
        case "marketingManager":
          return isMarketingManager.value;
        case "viewer":
          return isViewer.value;
        default:
          return false;
      }
    });

    if (!hasAccess) {
      if (isViewer.value) {
        next("/all-processes");
      } else if (isMarketingManager.value) {
        next("/all-processes");
      } else {
        next("/all-processes");
      }
      return;
    }
  }

  if (to.path === "/login" && isAuthenticated.value) {
    next("/all-processes");
  } else {
    next();
  }
});

export default router;

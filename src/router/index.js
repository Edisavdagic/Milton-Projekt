import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import DocumentsView from "../views/DocumentsView.vue";
import ProjectoverviewView from "../views/ProjectoverView.vue";
import NotificationsView from "@/views/NotificationsView.vue";
import { useAuthStore } from "@/stores/auth";
import CalenderView from "@/views/CalenderView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "login",
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: "/projektoversigt",
      name: "projectoverview",
      component: ProjectoverviewView,
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: "/dokumenter",
      name: "documents",
      component: DocumentsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/notifikationer",
      name: "notifications",
      component: NotificationsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/kalender",
      name: "calendar",
      component: CalenderView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  await authStore.initAuth();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: authStore.isAdmin ? "projektoversigt" : "dashboard" };
  }

  return true;
});

export default router;

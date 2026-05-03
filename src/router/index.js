import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import DocumentsView from "../views/DocumentsView.vue";
import ProjectoverviewView from "../views/ProjectoverView.vue";
import NotificationsView from "@/views/NotificationsView.vue";
import { useAuthStore } from "@/stores/auth";
import { useProjectsStore } from "@/stores/project";
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
      path: "/project/:projectId",
      meta: { requiresAuth: true },
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: DashboardView,
        },
        {
          path: "dokumenter",
          name: "documents",
          component: DocumentsView,
        },
        {
          path: "notifikationer",
          name: "notifications",
          component: NotificationsView,
        },
        {
          path: "kalender",
          name: "calendar",
          component: CalenderView,
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const projectsStore = useProjectsStore();

  await authStore.initAuth();

  if (authStore.isAuthenticated && !authStore.isAdmin && !projectsStore.currentProjectId) {
    await projectsStore.fetchUserProject(authStore.user.uid);
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    if (authStore.isAdmin) return { name: "projectoverview" };
    return { name: "dashboard", params: { projectId: projectsStore.currentProjectId } };
  }

  return true;
});

export default router;

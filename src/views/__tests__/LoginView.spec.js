import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginView from "../LoginView.vue";

const push = vi.fn();

const authStore = {
  signIn: vi.fn(),
  isAdmin: false,
  user: { uid: "test-user-id" },
  loading: false,
  error: ""
};

const projectsStore = {
  fetchUserProject: vi.fn(),
  currentProjectId: "project-123"
};

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push
  })
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => authStore
}));

vi.mock("@/stores/project", () => ({
  useProjectsStore: () => projectsStore
}));

describe("LoginView", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    authStore.signIn = vi.fn();
    authStore.isAdmin = false;
    authStore.user = { uid: "test-user-id" };
    authStore.loading = false;
    authStore.error = "";

    projectsStore.fetchUserProject = vi.fn();
    projectsStore.currentProjectId = "project-123";
  });

  it("logs in admin and redirects to projectoverview", async () => {
    // Simulate admin login
    authStore.isAdmin = true;
    authStore.signIn.mockResolvedValueOnce();

    const wrapper = mount(LoginView);

    // Enter admin credentials
    await wrapper.find('input[type="email"]').setValue("testadmin@test.dk");
    await wrapper.find('input[type="password"]').setValue("test 1234");

    // Submit form
    await wrapper.find("form").trigger("submit.prevent");

    await flushPromises();

    // Check if signIn was called with correct credentials
    expect(authStore.signIn).toHaveBeenCalledWith(
      "testadmin@test.dk",
      "test 1234"
    );

    // Admin should not fetch a user project
    expect(projectsStore.fetchUserProject).not.toHaveBeenCalled();

    // Check admin redirect
    expect(push).toHaveBeenCalledWith({
      name: "projectoverview"
    });
  });

  it("logs in user, fetches project and redirects to dashboard", async () => {
    // Simulate regular user login
    authStore.isAdmin = false;
    authStore.user = { uid: "firebase-user-id" };

    authStore.signIn.mockResolvedValueOnce();
    projectsStore.fetchUserProject.mockResolvedValueOnce();

    const wrapper = mount(LoginView);

    // Enter user credentials
    await wrapper.find('input[type="email"]').setValue("test@test.com");
    await wrapper.find('input[type="password"]').setValue("test 1234");

    // Submit form
    await wrapper.find("form").trigger("submit.prevent");

    await flushPromises();

    // Check if signIn was called with correct credentials
    expect(authStore.signIn).toHaveBeenCalledWith(
      "test@test.com",
      "test 1234"
    );

    // User should fetch their project
    expect(projectsStore.fetchUserProject).toHaveBeenCalledWith(
      "firebase-user-id"
    );

    // Check user redirect with projectId
    expect(push).toHaveBeenCalledWith({
      name: "dashboard",
      params: {
        projectId: "project-123"
      }
    });
  });
});

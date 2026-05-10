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

    // Check that admin does not fetch a user project
    expect(projectsStore.fetchUserProject).not.toHaveBeenCalled();

    // Check redirect
    expect(push).toHaveBeenCalledWith({
      name: "projectoverview"
    });
  });

  it("logs in user and redirects to dashboard", async () => {
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

    // Check if user project was fetched
    expect(projectsStore.fetchUserProject).toHaveBeenCalledWith(
      "firebase-user-id"
    );

    // Check redirect
    expect(push).toHaveBeenCalledWith({
      name: "dashboard",
      params: {
        projectId: "project-123"
      }
    });
  });

  it("shows an error message when login fails", async () => {
    // Simulate failed login
    authStore.error = "Invalid email or password";
    authStore.signIn.mockRejectedValueOnce(new Error("Login failed"));

    const wrapper = mount(LoginView);

    // Enter invalid credentials
    await wrapper.find('input[type="email"]').setValue("wrong@test.com");
    await wrapper.find('input[type="password"]').setValue("wrong-password");

    // Submit form
    await wrapper.find("form").trigger("submit.prevent");

    await flushPromises();

    // Check if error message is shown
    expect(wrapper.text()).toContain("Invalid email or password");

    // Check that user is not redirected
    expect(push).not.toHaveBeenCalled();

    // Check that no project is fetched
    expect(projectsStore.fetchUserProject).not.toHaveBeenCalled();
  });

  it("disables the login button while loading", () => {
    // Simulate loading state
    authStore.loading = true;

    const wrapper = mount(LoginView);

    const button = wrapper.find("button");

    // Check if button is disabled
    expect(button.attributes("disabled")).toBeDefined();

    // Check if loading text is shown
    expect(button.text()).toBe("Logger ind...");
  });
});

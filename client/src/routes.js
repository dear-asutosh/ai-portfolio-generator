const routes = {
  home: "/",
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    success: "/auth/success",
  },
  dashboard: "/:username/dashboard",
  settings: "/settings",
  project: {
    index: "/project/:id",
    new: "/project/new",
  },
  templates: "/templates",
  pricing: "/pricing",
  docs: "/docs",
  notFound: "*",
};

export default routes;

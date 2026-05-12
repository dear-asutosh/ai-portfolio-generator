const routes = {
  home: "/",
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
  },
  dashboard: "/dashboard",
  project: {
    index: "/project/:id",
    new: "/project/new",
  },
  templates: "/templates",
  pricing: "/pricing",
  docs: "/docs",
};

export default routes;

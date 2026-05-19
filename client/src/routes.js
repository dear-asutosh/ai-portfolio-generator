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
  features: "/features",
  howItWorks: "/how-it-works",
  docs: "/docs",
  notFound: "*",
};

export default routes;

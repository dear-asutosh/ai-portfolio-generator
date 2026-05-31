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
  publicPortfolio: "/u/:username/:slug",
  publicPortfolioDefault: "/u/:username",
  publicPortfolioById: "/portfolio/:id",
  features: "/features",
  howItWorks: "/how-it-works",
  notFound: "*",
};

export default routes;

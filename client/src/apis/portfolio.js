// Example API configuration using Axios
// You can define your API endpoints here to keep them centralized and easy to manage

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const portfolioAPI = {
  // Example endpoint to generate portfolio
  generatePortfolio: async (data) => {
    // const response = await fetch(`${API_BASE_URL}/generate`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return response.json();
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, url: 'https://demo.portfolio.ai' }), 1000);
    });
  },
  
  // Example endpoint to fetch templates
  getTemplates: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([{ id: 1, name: 'Minimal' }, { id: 2, name: 'Creative' }]), 500);
    });
  }
};

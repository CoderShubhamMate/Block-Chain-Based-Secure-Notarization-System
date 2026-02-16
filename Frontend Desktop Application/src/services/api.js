const BASE_URL = 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem("bbsns_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

const apiService = {
  // Users endpoints
  async getUsers() {
    return await fetch(`${BASE_URL}/users`, { headers: getHeaders() }).then(res => res.json());
  },

  async getMe() {
    return await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() }).then(res => res.json());
  },

  // Documents endpoints
  async getDocuments() {
    return await fetch(`${BASE_URL}/api/documents`, { headers: getHeaders() }).then(res => res.json());
  },

  async getDocument(id) {
    return await fetch(`${BASE_URL}/api/documents/${id}`, { headers: getHeaders() }).then(res => res.json());
  },

  async getDocumentFile(id) {
    return await fetch(`${BASE_URL}/api/documents/${id}/file`, { headers: getHeaders() }).then(res => {
      if (!res.ok) throw new Error("Failed to fetch file");
      return res.blob();
    });
  },

  async updateDocument(id, data) {
    return await fetch(`${BASE_URL}/api/documents/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(res => res.json());
  },

  // Transactions endpoints
  async getTransactions() {
    return await fetch(`${BASE_URL}/api/transactions`, { headers: getHeaders() }).then(res => res.json());
  },

  // Health check
  async checkStatus() {
    return await fetch(`${BASE_URL}/api/status`, { headers: getHeaders() }).then(res => res.json());
  },

  baseUrl: BASE_URL
};

export default apiService;

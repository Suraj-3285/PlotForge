import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials : true,
});

//Request Interception
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("plotforge_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

//Response Interceptor

api.interceptors.response.use(
  (response) => response,
  (error) => {
    //Token Expired
    if (error.response?.status === 401) {
      localStorage.removeItem("plotforge_token");
      localStorage.removeItem("plotforge_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

//Auth Services
export const authService = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    name?: string;
  }) => api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  getMe: () => api.get("/auth/me"),
};

//User Services

export const userServices = {
  getMyProfile: () => api.get("/users/me"),

  getPublicProfile: (username: string) => api.get(`/users/${username}`),

  updateProfile: (data: { name?: string; bio?: string; username?: string }) =>
    api.put("/users/me", data),

  updateAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);

    return api.post("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

//Story Services

export const storyService = {
  create: (data: {
    title: string;
    description?: string;
    genre?: string;
    tags?: string[];
  }) => api.post("/stories", data),

  getMyStories: () => api.get("/stories/my/all"),

  getMyStory: (storyId: string) => api.get(`/stories/${storyId}`),

  updateStory: (
    storyId: string,
    data: {
      title?: string;
      description?: string;
      genre?: string;
      tags?: string[];
      isPublished?: boolean;
    },
  ) => api.put(`/stories/${storyId}`, data),

  deleteStory: (storyId: string) => {
    return api.delete(`/stories/${storyId}`);
  },

  uploadCover: (storyId: string, file: File) => {
    const form = new FormData();

    form.append("cover", file);

    return api.post(`/stories/${storyId}/cover`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  discover: (params?: {
    search?: string;
    genre?: string;
    sort?: "latest" | "top";
  }) => api.get("/stories/discover", { params }),
};

// branch Services

export const branchService = {
  getBranches: (storyId: string) => api.get(`/stories/${storyId}/branches`),

  getBranch: (storyId: string, branchId: string) =>
    api.get(`/stories/${storyId}/branches/${branchId}`),

  getbranchTree: (storyId: string) =>
    api.get(`/stories/${storyId}/branches/tree`),

  createBranch: (
    storyId: string,
    data: {
      name: string;
      fromCommitId?: string;
    },
  ) => api.post(`/stories/${storyId}/branches`, data),

  deleteBranch: (storyId: string, branchId: string) =>
    api.delete(`/stories/${storyId}/branches/${branchId}`),
};

//Commit Services

export const commitService = {
  getCommits: (storyId: string, branchId: string) =>
    api.get(`/stories/${storyId}/branches/${branchId}/commits`),

  getCommit: (storyId: string, branchId: string, commitId: string) =>
    api.get(`/stories/${storyId}/branches/${branchId}/commits/${commitId}`),

  getLatestCommit: (storyId: string, branchId: string) =>
    api.get(`/stories/${storyId}/branches/${branchId}/commits/latest`),

  createCommit: (
    storyId: string,
    branchId: string,
    data: {
      message: string;
      content: string;
    },
  ) => api.post(`/stories/${storyId}/branches/${branchId}/commits`, data),
};

//Fork Services
export const forkService = {
  forkStory: (storyId: string) => api.post(`/stories/${storyId}/fork`),

  getStoryForks: (storyId: string) => api.get(`/stories/${storyId}/forks`),

  getMyForks: () => api.get("/forks/my"),
};

//Collaborate Services

export const collaborateService = {
  getCollaborators: (storyId: string) =>
    api.get(`/stories/${storyId}/collaborators`),

  invite: (
    storyId: string,
    data: {
      username: string;
      role: "VIEWER" | "EDITOR";
    },
  ) => api.post(`/stories/${storyId}/collaborators`, data),

  updateRole: (
    storyId: string,
    collaboratorId: string,
    role: "VIEWER" | "EDITOR",
  ) => api.put(`/stories/${storyId}/collaborators/${collaboratorId}`, { role }),

  remove: (storyId: string, collaboratorId: string) =>
    api.delete(`/stories/${storyId}/collaborators/${collaboratorId}`),

  getMyCollaborations: () => api.get("/stories/my/collaborations"),
};

//Publish Services

export const publishService = {
  publish: (storyId: string, branchId: string) =>
    api.post(`/stories/${storyId}/publish`, { branchId }),

  unpublish: (storyId: string, publishingId: string) =>
    api.put(`/stories/${storyId}/endings/${publishingId}/unpublish`),

  getEndings: (storyId: string) => api.get(`/stories/${storyId}/endings`),

  readEnding: (publishingId: string) => api.get(`/endings/${publishingId}`),
};

//Rating Servics
export const ratingService = {
  rate: (publishingId: string, stars: number) =>
    api.post(`/endings/${publishingId}/ratings`, { stars }),

  deleteRating: (publishingId: string) =>
    api.delete(`/endings/${publishingId}/ratings`),

  getRatings: (publishingId: string) =>
    api.get(`/endings/${publishingId}/ratings`),

  getMyRating: (publishingId: string) =>
    api.get(`/endings/${publishingId}/ratings/me`),
};

//Ai services

export const aiService = {
  //Return raw fetch for SSE Handling

  suggestNext: async (content: string, genre?: string) => {
    const token = localStorage.getItem("plotforge_token");

    return fetch(`${import.meta.env.VITE_API_URL}/ai/suggest-next`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, genre }),
    });
  },

  suggestTwist: async (content: string, genre?: string) => {
    const token = localStorage.getItem("plotforge_token");

    return fetch(`${import.meta.env.VITE_API_URL}/ai/suggest-twist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, genre }),
    });
  },

  improveWriting: async (content: string) => {
    const token = localStorage.getItem("plotforge_token");

    return fetch(`${import.meta.env.VITE_API_URL}/ai/improve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
  },

  fixGrammar: (content: string) => api.post("/ai/fix-grammar", { content }),

  generateSummary: (branchId: string) => api.get(`/ai/summary/${branchId}`),
};

//Export Services

export const exportService = {
  exportBranch: (storyId: string, branchId: string, format: "txt" | "md") =>
    api.get(`/stories/${storyId}/branches/${branchId}/export`, {
      params: { format },
      responseType: "blob",
    }),

  exportCompiled: (storyId: string, branchId: string, format: "txt" | "md") =>
    api.get(`/stories/${storyId}/branches/${branchId}/export/compiled`, {
      params: { format },
      responseType: "blob",
    }),
};
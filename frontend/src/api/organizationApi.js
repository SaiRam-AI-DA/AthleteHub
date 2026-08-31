import api from './axios';

const BASE_URL = '/organizations';

export const organizationApi = {
  getOrganizations: async (params) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },
  getOrganizationById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },
  createOrganization: async (data) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },
  updateOrganization: async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },
  deleteOrganization: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
  getOrganizationAthletes: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/athletes`);
    return response.data;
  },
  getOrganizationAdmin: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/admin`);
    return response.data;
  },
  assignOrganizationAdmin: async (id, data) => {
    const response = await api.post(`${BASE_URL}/${id}/admin`, data);
    return response.data;
  },
  getUnassignedAdmins: async () => {
    const response = await api.get(`${BASE_URL}/unassigned-admins`);
    return response.data;
  },
  getOrganizationCoaches: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/coaches`);
    return response.data;
  }
};

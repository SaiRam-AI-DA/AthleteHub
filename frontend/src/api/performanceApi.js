import axiosInstance from './axios';

export const getAthletePerformance = async (athleteId, page = 0, size = 10) => {
  const response = await axiosInstance.get(`/performance-records/athlete/${athleteId}?page=${page}&size=${size}`);
  return response.data;
};

export const createPerformanceRecord = async (recordData) => {
  const response = await axiosInstance.post('/performance-records', recordData);
  return response.data;
};

export const getAthleteRankings = async (athleteId, page = 0, size = 10) => {
  const response = await axiosInstance.get(`/ranking-history/athlete/${athleteId}?page=${page}&size=${size}`);
  return response.data;
};

export const recordRanking = async (rankingData) => {
  const response = await axiosInstance.post('/ranking-history', rankingData);
  return response.data;
};

export const getCoachEvaluations = async (coachId, page = 0, size = 10) => {
  const response = await axiosInstance.get(`/coach-evaluations/coach/${coachId}?page=${page}&size=${size}`);
  return response.data;
};

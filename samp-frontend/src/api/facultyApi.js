import axiosInstance from "./axios";

export const getFacultyDashboardApi = () =>
  axiosInstance.get("/faculty/dashboard");

export const getFacultyCoursesApi = () => axiosInstance.get("/faculty/courses");

export const createCourseApi = (data) =>
  axiosInstance.post("/faculty/courses", data);

export const updateCourseApi = (id, data) =>
  axiosInstance.put(`/faculty/courses/${id}`, data);

export const getCourseRosterApi = (courseId) =>
  axiosInstance.get(`/faculty/courses/${courseId}/roster`);

export const enterGradeApi = (data) =>
  axiosInstance.patch("/faculty/grades", data);

export const getFacultyProfileApi = () => axiosInstance.get("/faculty/profile");

export const updateFacultyProfileApi = (data) =>
  axiosInstance.put("/faculty/profile", data);

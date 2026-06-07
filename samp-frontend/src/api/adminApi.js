import axiosInstance from "./axios";

export const getAdminDashboardApi = () => axiosInstance.get("/admin/dashboard");

export const getAllUsersApi = (role) =>
  axiosInstance.get("/admin/users", { params: role ? { role } : {} });

export const getUserByIdApi = (id) => axiosInstance.get(`/admin/users/${id}`);

export const createUserApi = (data) => axiosInstance.post("/admin/users", data);

export const deactivateUserApi = (id) =>
  axiosInstance.patch(`/admin/users/${id}/deactivate`);

export const activateUserApi = (id) =>
  axiosInstance.patch(`/admin/users/${id}/activate`);

export const getAllCoursesAdminApi = () => axiosInstance.get("/admin/courses");

export const createCourseAdminApi = (data) =>
  axiosInstance.post("/admin/courses", data);

export const updateCourseAdminApi = (id, data) =>
  axiosInstance.put(`/admin/courses/${id}`, data);

export const toggleCourseAdminApi = (id) =>
  axiosInstance.patch(`/admin/courses/${id}/toggle`);

export const deleteCourseAdminApi = (id) =>
  axiosInstance.delete(`/admin/courses/${id}`);

export const getAllEnrollmentsApi = (courseId) =>
  axiosInstance.get("/admin/enrollments", {
    params: courseId ? { courseId } : {},
  });

export const getCalendarsApi = () => axiosInstance.get("/admin/calendar");

export const createCalendarApi = (data) =>
  axiosInstance.post("/admin/calendar", data);

export const updateCalendarApi = (id, data) =>
  axiosInstance.put(`/admin/calendar/${id}`, data);

export const publishCalendarApi = (id) =>
  axiosInstance.patch(`/admin/calendar/${id}/publish`);

export const unpublishCalendarApi = (id) =>
  axiosInstance.patch(`/admin/calendar/${id}/unpublish`);

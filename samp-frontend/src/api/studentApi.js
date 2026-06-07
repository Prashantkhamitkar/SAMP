import axiosInstance from "./axios";

export const getStudentDashboardApi = () =>
  axiosInstance.get("/student/dashboard");

export const getStudentCoursesApi = () => axiosInstance.get("/student/courses");

export const enrollCourseApi = (courseId) =>
  axiosInstance.post(`/student/enrollments/${courseId}`);

export const getMyEnrollmentsApi = () =>
  axiosInstance.get("/student/enrollments");

export const dropCourseApi = (courseId) =>
  axiosInstance.patch(`/student/enrollments/${courseId}/drop`);

export const getMyGradesApi = () => axiosInstance.get("/student/grades");

export const getStudentProfileApi = () => axiosInstance.get("/student/profile");

export const updateStudentProfileApi = (data) =>
  axiosInstance.put("/student/profile", data);

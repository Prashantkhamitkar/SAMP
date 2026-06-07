import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  logout,
  clearError,
  selectAuth,
  selectUser,
  selectRole,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import { clearNotifications } from "../store/slices/notificationSlice";
import { ROLES, ROLE_HOME } from "../utils/constants";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearNotifications());
    navigate("/login");
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const isStudent = role === ROLES.STUDENT;
  const isFaculty = role === ROLES.FACULTY;
  const isAdmin = role === ROLES.ADMIN;

  const homePath = ROLE_HOME[role] || "/login";

  return {
    user,
    role,
    token: auth.token,
    isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    isStudent,
    isFaculty,
    isAdmin,
    homePath,
    handleLogout,
    clearAuthError,
  };
};

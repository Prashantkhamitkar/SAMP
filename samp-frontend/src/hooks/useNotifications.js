import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchUnreadCount } from "../store/slices/notificationSlice";
import { selectIsAuthenticated } from "../store/slices/authSlice";

export const useNotificationPoller = (intervalMs = 60000) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch immediately on mount
    dispatch(fetchUnreadCount());

    // Then poll every minute
    const id = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, intervalMs);

    return () => clearInterval(id);
  }, [dispatch, isAuthenticated, intervalMs]);
};

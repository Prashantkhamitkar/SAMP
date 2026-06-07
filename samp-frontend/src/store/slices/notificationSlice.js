import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  getUnreadCountApi,
} from "../../api/notificationApi";

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNotificationsApi();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications",
      );
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUnreadCountApi();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await markAsReadApi(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllAsReadApi();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch All ────────────────────────────────────────────────────────────
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Fetch Unread Count ───────────────────────────────────────────────────
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // ── Mark One Read ────────────────────────────────────────────────────────
    builder.addCase(markNotificationRead.fulfilled, (state, action) => {
      const index = state.items.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.items[index].read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // ── Mark All Read ────────────────────────────────────────────────────────
    builder.addCase(markAllNotificationsRead.fulfilled, (state) => {
      state.items = state.items.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotifLoading = (state) => state.notifications.isLoading;

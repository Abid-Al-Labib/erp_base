import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/auth';
import type { Workspace } from '@/types/workspace';

interface AuthState {
  user: User | null;
  token: string | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  workspace: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; workspace?: Workspace }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.workspace = action.payload.workspace || null;
      state.isAuthenticated = true;
      localStorage.setItem('auth_token', action.payload.token);
      if (action.payload.workspace) {
        localStorage.setItem('workspace_id', action.payload.workspace.id.toString());
      }
    },
    setWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspace = action.payload;
      localStorage.setItem('workspace_id', action.payload.id.toString());
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.workspace = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('workspace_id');
    },
  },
});

export const { setCredentials, setWorkspace, logout } = authSlice.actions;
export default authSlice.reducer;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAccessToken, clearAuth } from '../../features/auth/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: 'include', // send the httpOnly refresh cookie automatically on every request
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions);

    if (refreshResult.data?.data?.accessToken) {
      api.dispatch(setAccessToken(refreshResult.data.data.accessToken));
      result = await rawBaseQuery(args, api, extraOptions); // retry original request with new token
    } else {
      api.dispatch(clearAuth()); // refresh failed too — session is truly over
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Gig', 'Job', 'Proposal', 'Contract', 'Wallet', 'Review', 'Dispute', 'Notification', 'Conversation', 'Category'], // used for cache invalidation
  endpoints: () => ({}), // each feature (auth, gigs, jobs...) injects its own endpoints separately
});
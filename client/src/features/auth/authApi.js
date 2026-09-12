import { baseApi } from '../../app/api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    refresh: builder.mutation({
        query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
    getMe: builder.query({
        query: () => ({ url: '/users/me', method: 'GET' }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation, useLazyGetMeQuery,useRefreshMutation } = authApi;
import { baseApi } from '../../app/api/baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    banUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}/ban`, method: 'PATCH' }),
      invalidatesTags: ['User'],
    }),
    unbanUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}/unban`, method: 'PATCH' }),
      invalidatesTags: ['User'],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: '/admin/categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/admin/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),
    getAnalytics: builder.query({
      query: () => '/admin/analytics',
    }),
  }),
});

export const {
  useGetUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAnalyticsQuery,
} = adminApi;

import { baseApi } from '../../app/api/baseApi';

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query({
      query: (params) => ({ url: '/jobs', params }),
      providesTags: ['Job'],
    }),
    getJobById: builder.query({
      query: (id) => `/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Job', id }],
    }),
    createJob: builder.mutation({
      query: (body) => ({ url: '/jobs', method: 'POST', body }),
      invalidatesTags: ['Job'],
    }),
    updateJob: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/jobs/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Job', id }, 'Job'],
    }),
    closeJob: builder.mutation({
      query: (id) => ({ url: `/jobs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Job'],
    }),
  }),
});

export const {
  useGetJobsQuery, useGetJobByIdQuery, useCreateJobMutation, useUpdateJobMutation, useCloseJobMutation,
} = jobsApi;
import { baseApi } from '../../app/api/baseApi';

export const proposalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitProposal: builder.mutation({
      query: ({ jobId, ...body }) => ({ url: `/jobs/${jobId}/proposals`, method: 'POST', body }),
      invalidatesTags: ['Proposal', 'Job'],
    }),
    getProposalsForJob: builder.query({
      query: (jobId) => `/jobs/${jobId}/proposals`,
      providesTags: ['Proposal'],
    }),
    updateProposalStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/proposals/${id}`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Proposal', 'Job'],
    }),
  }),
});

export const {
  useSubmitProposalMutation, useGetProposalsForJobQuery, useUpdateProposalStatusMutation,
} = proposalsApi;

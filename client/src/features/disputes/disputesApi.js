import { baseApi } from '../../app/api/baseApi';

export const disputesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    raiseDispute: builder.mutation({
      query: ({ contractId, milestoneId, reason }) => ({
        url: `/disputes/contracts/${contractId}/milestones/${milestoneId}`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Contract', 'Dispute'],
    }),
    getOpenDisputes: builder.query({
      query: () => '/disputes',
      providesTags: ['Dispute'],
    }),
    resolveDispute: builder.mutation({
      query: ({ disputeId, outcome, resolution }) => ({
        url: `/disputes/${disputeId}/resolve`,
        method: 'PATCH',
        body: { outcome, resolution },
      }),
      invalidatesTags: ['Dispute', 'Contract', 'Wallet'],
    }),
  }),
});

export const { useRaiseDisputeMutation, useGetOpenDisputesQuery, useResolveDisputeMutation } = disputesApi;

import { baseApi } from '../../app/api/baseApi';

export const contractsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyContracts: builder.query({
      query: () => '/contracts',
      providesTags: ['Contract'],
    }),
    getContractById: builder.query({
      query: (id) => `/contracts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contract', id }],
    }),
    createContract: builder.mutation({
      query: (body) => ({ url: '/contracts', method: 'POST', body }),
      invalidatesTags: ['Contract', 'Job', 'Proposal'],
    }),
    submitMilestone: builder.mutation({
      query: ({ contractId, milestoneId }) => ({
        url: `/contracts/${contractId}/milestones/${milestoneId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { contractId }) => [{ type: 'Contract', id: contractId }, 'Contract'],
    }),
    fundMilestone: builder.mutation({
      query: ({ contractId, milestoneId }) => ({
        url: `/contracts/${contractId}/milestones/${milestoneId}/fund`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { contractId }) => [{ type: 'Contract', id: contractId }, 'Contract', 'Wallet'],
    }),
    approveMilestone: builder.mutation({
      query: ({ contractId, milestoneId }) => ({
        url: `/contracts/${contractId}/milestones/${milestoneId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { contractId }) => [{ type: 'Contract', id: contractId }, 'Contract', 'Wallet'],
    }),
  }),
});

export const {
  useGetMyContractsQuery,
  useGetContractByIdQuery,
  useCreateContractMutation,
  useSubmitMilestoneMutation,
  useFundMilestoneMutation,
  useApproveMilestoneMutation,
} = contractsApi;

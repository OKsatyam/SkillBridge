import { baseApi } from '../../app/api/baseApi';

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),
    depositFunds: builder.mutation({
      query: (amount) => ({ url: '/wallet/deposit', method: 'POST', body: { amount } }),
      invalidatesTags: ['Wallet'],
    }),
    withdrawFunds: builder.mutation({
      query: (amount) => ({ url: '/wallet/withdraw', method: 'POST', body: { amount } }),
      invalidatesTags: ['Wallet'],
    }),
  }),
});

export const { useGetWalletQuery, useDepositFundsMutation, useWithdrawFundsMutation } = walletApi;

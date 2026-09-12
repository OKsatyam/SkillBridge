import { baseApi } from '../../app/api/baseApi';

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviewsForUser: builder.query({
      query: (userId) => `/reviews/user/${userId}`,
      providesTags: ['Review'],
    }),
    createReview: builder.mutation({
      query: ({ contractId, rating, comment }) => ({
        url: `/reviews/contracts/${contractId}`,
        method: 'POST',
        body: { rating, comment },
      }),
      invalidatesTags: ['Review', 'Contract'],
    }),
  }),
});

export const { useGetReviewsForUserQuery, useCreateReviewMutation } = reviewsApi;

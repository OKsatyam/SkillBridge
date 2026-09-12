import { baseApi } from '../../app/api/baseApi';

export const gigsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGigs: builder.query({
      query: (params) => ({ url: '/gigs', params }),
      providesTags: ['Gig'],
    }),
    getGigById: builder.query({
      query: (id) => `/gigs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Gig', id }],
    }),
    createGig: builder.mutation({
      query: (formData) => ({ url: '/gigs', method: 'POST', body: formData }),
      invalidatesTags: ['Gig'],
    }),
    updateGig: builder.mutation({
      query: ({ id, formData }) => ({ url: `/gigs/${id}`, method: 'PUT', body: formData }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Gig', id }, 'Gig'],
    }),
    archiveGig: builder.mutation({
      query: (id) => ({ url: `/gigs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Gig'],
    }),
  }),
});

export const {
  useGetGigsQuery, useGetGigByIdQuery, useCreateGigMutation, useUpdateGigMutation, useArchiveGigMutation,
} = gigsApi;
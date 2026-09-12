import { baseApi } from '../../app/api/baseApi';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
  }),
});

export const { useGetCategoriesQuery } = categoriesApi;
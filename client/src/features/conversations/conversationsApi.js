import { baseApi } from '../../app/api/baseApi';

export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyConversations: builder.query({
      query: () => '/conversations',
      providesTags: ['Conversation'],
    }),
    getConversationForContract: builder.query({
      query: (contractId) => `/conversations/contract/${contractId}`,
    }),
    getMessages: builder.query({
      query: (conversationId) => `/conversations/${conversationId}/messages`,
    }),
  }),
});

export const {
  useGetMyConversationsQuery,
  useGetConversationForContractQuery,
  useGetMessagesQuery,
} = conversationsApi;

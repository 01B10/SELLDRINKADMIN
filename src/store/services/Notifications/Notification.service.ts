import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react'
import Enviroment from '~/utils/checkEnviroment'

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({ baseUrl: Enviroment('api') }),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    updateNotification: builder.mutation({
      query: (id: string) => ({
        url: `/update-is-read-notification/${id}`,
        method: 'PUT'
      }),
      invalidatesTags: ['Notification']
    })
  })
})

export const { useUpdateNotificationMutation } = notificationApi

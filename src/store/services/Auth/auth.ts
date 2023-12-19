import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Login } from '~/pages/SignIn/validate'
import { ResIUser } from '~/types'
import Enviroment from '~/utils/checkEnviroment'

export const AuthApi = createApi({
  reducerPath: 'AuthApi',
  baseQuery: fetchBaseQuery({ baseUrl: Enviroment('api') }),
  tagTypes: ['AuthApi'],
  endpoints: (builder) => ({
    signIn: builder.mutation<ResIUser, Login>({
      query: ({ ...rest }) => ({
        url: '/login',
        body: rest,
        method: 'POST',
        credentials: 'include'
      })
    }),
    logOut: builder.mutation<void, void>({
      query: () => ({
        url: `${Enviroment()}/auth/logout`,
        method: 'POST',
        credentials: 'include'
      })
    })
  })
})

export const { useSignInMutation, useLogOutMutation } = AuthApi

import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface IOrderDetail {
  orderData: {
    _id: string
    key: string
    priceShip: number
    totalPrice: number
    note: string
    products: any
    status: string
    payment: string
    user: {
      username: string
      phone: number | string
      avatar: string
      address: string
    }
  }
  id: string
}

const initialState: IOrderDetail = {
  orderData: {
    _id: '',
    key: '',
    priceShip: 0,
    totalPrice: 0,
    note: '',
    products: [],
    status: '',
    payment: '',
    user: {
      avatar: '',
      phone: '',
      username: '',
      address: ''
    }
  },
  id: ''
}

export const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderData: (state, action: PayloadAction<any>) => {
      state.orderData = action.payload
    },
    setIdOrderCancel: (state, action: PayloadAction<string>) => {
      state.id = action.payload
    }
  }
})

export const { setOrderData, setIdOrderCancel } = orderSlice.actions
export const orderReducer = orderSlice.reducer

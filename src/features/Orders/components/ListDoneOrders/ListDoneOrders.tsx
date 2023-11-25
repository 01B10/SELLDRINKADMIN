import Loading from '~/components/Loading/Loading'
import { Space, Table, Button as ButtonAnt, Input, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { NotFound } from '~/pages'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGetAllOrderDoneQuery } from '~/store/services/Orders'
import { formatDate } from '~/utils/formatDate'
import { EyeFilled, SearchOutlined } from '@ant-design/icons'
import UserInfoRow from '../UserInfoRow/UserInfoRow'
import { RootState, useAppDispatch } from '~/store/store'
import { setOpenDrawer } from '~/store/slices'
import { setOrderData } from '~/store/slices/Orders/order.slice'
import type { InputRef } from 'antd'
import type { FilterConfirmProps } from 'antd/es/table/interface'
import { IOrderDataType } from '~/types'
import { ColumnType } from 'antd/lib/table'
import Highlighter from 'react-highlight-words'
import { useAppSelector } from '~/store/hooks'
import { ClientSocket } from '~/socket'
import { formatCurrency } from '~/utils'

type DataIndex = keyof IOrderDataType

const ListDoneOrders = () => {
  const dispatch = useAppDispatch()
  const [doneOrder, setDoneOrder] = useState<any>()
  const { orderDate } = useAppSelector((state) => state.orders)
  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)
  const [options, setoptions] = useState({
    page: 1,
    limit: 10,
    startDate: '',
    endDate: '',
    room: user._id
  })

  const { isError, isLoading } = useGetAllOrderDoneQuery(options)

  const memoOptions = useMemo(() => {
    setoptions((prev) => ({
      ...prev,
      startDate: orderDate.startDate,
      endDate: orderDate.endDate
    }))
  }, [orderDate])

  useEffect(() => {
    ClientSocket.getDoneOrder(setDoneOrder, options)
  }, [orderDate, memoOptions, options])

  /*Search */
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef<InputRef>(null)

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex)
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<IOrderDataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm mã đơn hàng`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <ButtonAnt
            type='primary'
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Tìm kiếm
          </ButtonAnt>
          <ButtonAnt onClick={() => clearFilters && handleReset(clearFilters)} size='small' style={{ width: 90 }}>
            Làm mới
          </ButtonAnt>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100)
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString().substring(text.length - 8) : ''}
        />
      ) : (
        text.substring(text.length - 8)
      )
  })
  /*End Search */
  const columns: ColumnsType<any> = [
    {
      title: '#',
      dataIndex: 'index',
      width: 50,
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.index - b.index
    },
    {
      title: 'ID',
      dataIndex: 'orderCode',
      width: 110,
      ...getColumnSearchProps('orderCode')
    },
    {
      title: 'Thông tin người đặt',
      dataIndex: 'user',
      key: 'user',
      width: 240,
      rowScope: 'row',
      sorter: (a, b) => {
        return a.user.username.localeCompare(b.user.username)
      },
      render: (user: any) => <UserInfoRow user={user} />
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'products',
      key: 'products',

      render: (item: any) =>
        item &&
        item.map((product: any) => (
          <div className='gap-x-3 flex items-center justify-start line-clamp-1'>
            <img src={product.image} className='object-cover w-20 h-20 rounded-lg cursor-pointer mb-1' alt='' />
            <div className='flex flex-col gap-0.5 justify-center items-start'>
              <p className='hover:underline capitalize truncate cursor-pointer line-clamp-2'>{product.name}</p>
            </div>
          </div>
        ))
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 100,
      render: (totalPrice: number) => (
        <span
          className={`capitalize font-semibold  
          rounded inline-block text-lg text-center py-1`}
        >
          {formatCurrency(+totalPrice)}
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      key: 'status',
      render: () => (
        <span className={`text-white m-auto capitalize font-semibold bg-meta-3 rounded inline-block p-1`}>
          Hoàn thành
        </span>
      )
    },
    {
      title: 'Thời gian đặt hàng',
      dataIndex: 'timeOrder',
      key: 'timeOrder',
      width: 190,
      sorter: (a, b) => a.timeOrder.localeCompare(b.timeOrder),
      sortDirections: ['descend', 'ascend'],
      render: (time: string) => <span className='capitalize'>{formatDate(time)}</span>
    },

    {
      // title: <span className='block text-center'>Action</span>,
      key: 'action',
      // fixed: 'right',
      width: 100,
      render: (_: any, order) => (
        <div className='flex items-center justify-center'>
          <Space size='middle'>
            <Tooltip title='Xem chi tiết đơn hàng'>
              <ButtonAnt
                size='large'
                className='bg-meta-5 hover:!text-white flex items-center justify-center text-white'
                icon={<EyeFilled />}
                onClick={() => {
                  // dispatch(setCategory({ _id: category._id, name: category.name }))
                  dispatch(setOpenDrawer(true))
                  dispatch(setOrderData({ ...order }))
                }}
              />
            </Tooltip>
          </Space>
        </div>
      )
    }
  ]
  const ordersData = doneOrder?.docs.map((item: any, index: number) => ({
    user: {
      username: item.inforOrderShipping?.name,
      phone: item.inforOrderShipping?.phone,
      avatar: item.user?.avatar,
      address: item.inforOrderShipping?.address
    },
    payment: item.paymentMethodId,
    user_order: item?.user?._id,
    note: item.inforOrderShipping.noteShipping,
    priceShip: item.priceShipping,
    products: item.items,
    totalPrice: item.total,
    status: item.status,
    timeOrder: item.createdAt,
    key: item._id,
    index: index + 1,
    orderCode: item._id.toUpperCase()
  }))
  if (isLoading) return <Loading />
  if (isError) return <NotFound />

  return (
    <div className='dark:bg-graydark'>
      <Table
        columns={columns}
        dataSource={ordersData}
        pagination={{
          pageSize: doneOrder && doneOrder.limit,
          showSizeChanger: true,
          pageSizeOptions: ['10', '15', '20', '25'],
          total: doneOrder && doneOrder?.totalDocs,
          onChange(page, pageSize) {
            // callbackOptions(page, pageSize)
            setoptions((prev) => ({ ...prev, page, limit: pageSize }))
          }
        }}
        scroll={{ y: '50vh', x: 1000 }}
        bordered
      />
    </div>
  )
}

export default ListDoneOrders

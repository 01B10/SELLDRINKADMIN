import { Image, Popconfirm, Space, Table, Button as ButtonAnt, Input } from 'antd'
import Loading from '~/components/Loading/Loading'
import { NotFound } from '~/pages'
import { useDeleteUserMutation, useGetAllUserByRoleQuery } from '~/store/services/Users'
import { Button } from '~/components'
import { cancelDelete } from '~/features/Toppings'
import { useRef, useState } from 'react'
import { BsFillPencilFill, BsFillTrashFill } from 'react-icons/bs'
import { useAppDispatch } from '~/store/store'
import { setOpenDrawer } from '~/store/slices'
import { setUser } from '~/store/slices/User/user.slice'
import { IUser } from '~/types'
import { ColumnsType } from 'antd/es/table'
import { messageAlert } from '~/utils/messageAlert'
import { SearchOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import type { FilterConfirmProps } from 'antd/es/table/interface'
import { IUserDataType } from '~/types'
import { ColumnType } from 'antd/lib/table'
import Highlighter from 'react-highlight-words'

type DataIndex = keyof IUserDataType
export const ListStaffs = () => {
  const dispatch = useAppDispatch()
  const [deleteUser] = useDeleteUserMutation()
  const [options, setoptions] = useState({
    page: 1,
    limit: 10,
    roleName: 'staff' as 'customer' | 'staff'
  })

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

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<IUserDataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          size='middle'
          ref={searchInput}
          placeholder={`Tìm kiếm`}
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
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
  })
  /*End Search */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const { data: staffData, isLoading, isError } = useGetAllUserByRoleQuery(options)
  const handleDeleteMany = () => {
    selectedRowKeys.forEach((selectItem) => {
      deleteUser(selectItem as string)
        .unwrap()
        .then(() => {
          messageAlert('Xóa thành công', 'success')
        })
        .catch(() => messageAlert('Xóa thất bại!', 'error'))
    })
    setSelectedRowKeys([])
  }
  const handleDelete = async (id: string) => {
    await deleteUser(id)
      .unwrap()
      .then(() => {
        messageAlert('Xóa thành công', 'success')
      })
      .catch(() => messageAlert('Xóa thất bại!', 'error'))
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  }
  const hasSelected = selectedRowKeys.length > 1
  const columns: ColumnsType<any> = [
    {
      title: '#',
      dataIndex: 'index',
      width: 50,
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.index - b.index
    },
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) => <Image className='!w-[100px] !h-[100px]' src={avatar} />
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      ...getColumnSearchProps('username'),
      render: (name: string) => <span className='capitalize'>{name}</span>
    },
    {
      title: 'Tài khoản',
      dataIndex: 'account',
      key: 'account',
      ...getColumnSearchProps('account'),
      render: (account: string) => <span>{account}</span>
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: string) => <span>{gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}</span>
    },
    {
      title: 'Action',
      key: 'action',
      width: 300,
      render: (_: any, staff: IUser) => (
        <Space size='middle'>
          <Button
            icon={<BsFillPencilFill />}
            onClick={() => {
              dispatch(setOpenDrawer(true))
              dispatch(setUser({ ...staff }))
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title='Bạn có muốn xóa nhân viên này?'
            okButtonProps={{ style: { backgroundColor: '#3C50E0', color: '#fff' } }}
            onCancel={cancelDelete}
            onConfirm={() => handleDelete(staff._id!)}
          >
            <Button variant='danger' icon={<BsFillTrashFill />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]
  const staffs = staffData?.data?.docs?.map((staff: any, index: number) => ({
    ...staff,
    key: staff._id,
    index: index + 1
  }))
  if (isLoading) return <Loading />
  if (isError) return <NotFound />
  return (
    <>
      {hasSelected && (
        <Space>
          <Popconfirm
            title='Bạn thực sự muốn xóa những danh mục này?'
            description='Hành động này sẽ xóa những danh mục đang được chọn!'
            onConfirm={handleDeleteMany}
            onCancel={() => setSelectedRowKeys([])}
          >
            <Button variant='danger' styleClass='mb-4'>
              Xóa tất cả
            </Button>
          </Popconfirm>
        </Space>
      )}
      <div className='dark:bg-graydark'>
        <Table
          columns={columns}
          dataSource={staffs}
          bordered
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '20', '25'],
            total: staffData?.data?.totalDocs,
            onChange(page, pageSize) {
              setoptions((prev) => ({ ...prev, page, limit: pageSize }))
            }
          }}
          scroll={{ y: '50vh', x: 1000 }}
          rowSelection={rowSelection}
        />
      </div>
    </>
  )
}
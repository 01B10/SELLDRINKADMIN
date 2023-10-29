import { BsFillPencilFill, BsFillTrashFill } from 'react-icons/bs'
import { HiDocumentDownload } from 'react-icons/hi'
import { Popconfirm, Space, Table, message, Button as ButtonAntd } from 'antd'
import { RootState, useAppDispatch } from '~/store/store'
import { setOpenDrawer, setToppingDetail, setToppingId } from '~/store/slices'

import { Button } from '~/components'
import { ColumnsType } from 'antd/es/table'
import { ITopping } from '~/types'
import { cancelDelete } from '../..'
import { exportDataToExcel, formatCurrency } from '~/utils'
import { useAppSelector } from '~/store/hooks'
import { useDeleteToppingMutation } from '~/store/services'
import { useState } from 'react'

const ToppingList = () => {
  const dispatch = useAppDispatch()

  const { toppingsList } = useAppSelector((state: RootState) => state.toppings)
  const [deleteTopping] = useDeleteToppingMutation()

  console.log('toppingsList:', toppingsList)

  /* topping delete */
  const handleDelete = async (id: string) => {
    console.log('🚀 ~ file: ListTopping.tsx:22 ~ handleDelete ~ id:', id)
    try {
      await deleteTopping({ id }).then(() => {
        message.success('Xoá thành công!')
      })
    } catch (error) {
      message.error('Xoá thất bại!')
    }
  }

  /* edit topping */
  const saveToppingId = (id: string) => {
    dispatch(setToppingId(id))
  }

  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const start = () => {
    setLoading(true)
    setTimeout(() => {
      selectedRowKeys.forEach((selectedItem) => {
        deleteTopping({ id: selectedItem as string })
          .unwrap()
          .then(() => {
            message.success('Xóa thành công')
            setSelectedRowKeys([])
          })
      })
      setLoading(false)
    }, 1000)
  }

  const hasSelected = selectedRowKeys.length > 0
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  }

  const columns: ColumnsType<ITopping> = [
    {
      title: 'Tên topping',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className='capitalize'>{name}</span>
    },
    { title: 'Giá topping', dataIndex: 'price', key: 'price', render: (price: number) => `${formatCurrency(price)}` },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 300,
      render: (_, topping: ITopping) => (
        <Space size='middle'>
          <Button
            icon={<BsFillPencilFill />}
            onClick={() => {
              dispatch(setOpenDrawer(true)), saveToppingId(topping._id)
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title='Bạn có muốn xóa topping này?'
            description='Are you sure to delete this task?'
            onConfirm={() => handleDelete(topping._id)}
            onCancel={cancelDelete}
            okButtonProps={{ style: { backgroundColor: '#3C50E0', color: '#fff' } }}
            okText='Có'
            cancelText='Không'
          >
            <Button variant='danger' icon={<BsFillTrashFill />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const toppings = toppingsList.map((topping) => ({ ...topping, key: topping._id }))

  return (
    <div>
      <Space>
        <Popconfirm
          title='Bạn thực sự muốn xóa những topping này?'
          description='Hành động này sẽ xóa những topping đang được chọn!'
          onConfirm={start}
          className='ml-[10px]'
        >
          <ButtonAntd
            size='large'
            type='primary'
            danger
            className='text-sm font-semibold capitalize'
            disabled={!hasSelected}
            loading={loading}
          >
            Xóa tất cả
          </ButtonAntd>
        </Popconfirm>
        <ButtonAntd
          icon={<HiDocumentDownload />}
          size='large'
          className='bg-[#209E62] text-white hover:!text-white text-sm font-semibold capitalize flex items-center'
          onClick={() => {
            if (toppingsList?.length === 0) {
              message.warning('Không có sản phẩm nào để xuất')
              return
            }
            exportDataToExcel(toppingsList, 'Toppings')
          }}
        >
          Xuất excel
        </ButtonAntd>
      </Space>
      <Table
        className='dark:bg-graydark mt-3'
        columns={columns}
        dataSource={toppings}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          pageSizeOptions: ['5', '10', '15', '20']
        }}
        rowSelection={rowSelection}
      />
    </div>
  )
}

export default ToppingList

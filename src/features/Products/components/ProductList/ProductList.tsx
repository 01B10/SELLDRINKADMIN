import { Button as ButtonAntd, Popconfirm, Space, Table, Tag, Tooltip, message } from 'antd'
import { IProduct, ISizeRefProduct, IToppingRefProduct } from '~/types'
import { RootState, useAppDispatch } from '~/store/store'
import { exportDataToExcel, formatCurrency } from '~/utils'
import { setOpenDrawer, setProductDetail, setProductId } from '~/store/slices'

import { AiFillEdit } from 'react-icons/ai'
import { HiDocumentDownload } from 'react-icons/hi'
import { DeleteIcon } from '~/components'
import { ICategoryRefProduct } from '~/types/Category'
import { TbBasketDiscount } from 'react-icons/tb'
import clsxm from '~/utils/clsxm'
import { useAppSelector } from '~/store/hooks'
import { useDeleteFakeProductMutation } from '~/store/services'
import { useState } from 'react'

const ProductList = () => {
  const dispatch = useAppDispatch()
  const { productsList } = useAppSelector((state: RootState) => state.products)
  const [deleteFakeProduct] = useDeleteFakeProductMutation()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const products = productsList.map((product: IProduct, index: number) => ({
    ...product,
    key: product._id,
    index: index + 1
  }))

  const start = () => {
    setLoading(true)
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([])
      setLoading(false)
    }, 1000)
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  }
  const hasSelected = selectedRowKeys.length > 0

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 350,
      render: (name: string, product: IProduct) => (
        <div className='gap-x-3 flex items-center justify-start'>
          <img
            src={product.images[0].url}
            alt={product.images[0].filename}
            className='object-cover w-20 h-20 rounded-lg cursor-pointer'
            onClick={() => {
              dispatch(setOpenDrawer(true))
              dispatch(setProductDetail(product))
            }}
          />
          <div className='flex flex-col gap-0.5 justify-center items-start'>
            <Tag
              color={clsxm(
                { success: !product.is_deleted && product.is_active },
                { '#333': product.is_deleted },
                { red: !product.is_deleted && !product.is_active }
              )}
            >
              {product.is_active && !product.is_deleted ? 'Đang hoạt động' : 'Không hoạt động'}
            </Tag>
            <p
              className='hover:underline capitalize truncate cursor-pointer w-[215px]'
              onClick={() => {
                dispatch(setOpenDrawer(true))
                dispatch(setProductDetail(product))
              }}
            >
              {name}
            </p>
            {product.sale > 0 && (
              <p className='flex items-center justify-center gap-1'>
                <span>
                  <TbBasketDiscount />
                </span>
                <span className=''>{formatCurrency(product.sale)}</span>
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Size sản phẩm',
      dataIndex: 'sizes',
      key: 'sizes',
      width: 200,
      render: (sizes: ISizeRefProduct[]) => (
        <>
          <div className='flex flex-col gap-1'>
            {sizes?.slice(0, 2).map((size: ISizeRefProduct) => (
              <div key={size._id} className='relative grid grid-cols-2'>
                <p className='border-r-graydark w-full pr-3 uppercase border-r border-opacity-50'>{size.name}</p>
                <p className='w-full pl-3'>{formatCurrency(size.price)}</p>
              </div>
            ))}
          </div>
          <p className=''>{sizes?.length > 2 && '....'}</p>
        </>
      )
    },
    {
      title: 'Topping sản phẩm',
      dataIndex: 'toppings',
      key: 'toppings',
      render: (toppings: IToppingRefProduct[]) => (
        <>
          <div className='flex flex-col gap-1'>
            {/* chỉ map 2 topping ra ngoài màn hình thôi */}
            {toppings.slice(0, 2).map((topping: IToppingRefProduct) => (
              <div key={topping._id} className='relative grid grid-cols-2'>
                <p className='border-r-graydark w-full pr-3 uppercase border-r border-opacity-50'>{topping.name}</p>
                <p className='w-full pl-3'>{formatCurrency(topping.price)}</p>
              </div>
            ))}
          </div>
          <p className=''>{toppings?.length > 2 && '....'}</p>
        </>
      )
    },
    {
      title: 'Danh mục sản phẩm',
      dataIndex: 'category',
      key: 'category',
      render: (category: ICategoryRefProduct) => <p className='capitalize'>{category?.name || 'Không có thông tin'}</p>
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 100,
      key: 'action',
      render: (_: any, product: IProduct) => (
        <Space>
          <Tooltip title='Cập nhật sản phẩm'>
            <ButtonAntd
              size='large'
              icon={<AiFillEdit />}
              onClick={() => {
                dispatch(setOpenDrawer(true))
                dispatch(setProductId(product._id))
              }}
              className='bg-primary hover:text-white flex items-center justify-center text-white'
            />
          </Tooltip>
          <Popconfirm
            title='Xóa sản phẩm?'
            onConfirm={() => handleDeleteProduct(product._id)}
            okText='Có'
            cancelText='Không'
          >
            <ButtonAntd
              size='large'
              icon={<DeleteIcon />}
              danger
              className='hover:text-white flex items-center justify-center text-white'
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  /* handle delete product */
  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await deleteFakeProduct({ id }).unwrap()
      if (response.message === 'success') {
        message.success('Sản phẩm đã được chuyển vào thùng rác!')
      }
    } catch (error) {
      message.error('Xóa sản phẩm thất bại')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }} className='flex items-center gap-3'>
        <Tooltip title={hasSelected ? `Đang chọn ${selectedRowKeys?.length} sản phẩm` : ''}>
          <ButtonAntd
            size='large'
            danger
            type='primary'
            className='text-sm font-semibold capitalize'
            onClick={start}
            disabled={!hasSelected}
            loading={loading}
          >
            Xóa tất cả
          </ButtonAntd>
        </Tooltip>
        <ButtonAntd
          size='large'
          icon={<HiDocumentDownload />}
          className='bg-[#209E62] text-white hover:!text-white text-sm font-semibold capitalize flex items-center'
          onClick={() => {
            if (productsList?.length === 0) {
              message.warning('Không có sản phẩm nào để xuất')
              return
            }
            exportDataToExcel(productsList, 'products')
          }}
        >
          Xuất excel
        </ButtonAntd>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={products}
        scroll={{ x: 1300 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '25', '30', '40', '50'],
          defaultPageSize: 5,
          showSizeChanger: true
        }}
        bordered
      />
    </div>
  )
}

export default ProductList

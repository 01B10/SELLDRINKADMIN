import { Popconfirm, Space, Table, message } from 'antd'
import { useState } from 'react'
import { BsFillPencilFill, BsFillTrashFill } from 'react-icons/bs'
import { Button } from '~/components'
import Loading from '~/components/Loading/Loading'
import { NotFound } from '~/pages'
import { useGetAllBlogsQuery } from '~/store/services'
import { setOpenDrawer } from '~/store/slices'
import { useAppDispatch } from '~/store/store'
import { IBlogs } from '~/types'
import { truncateDescription } from '../../utils'

const ListBlog = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const { data: BlogData, isLoading, isError } = useGetAllBlogsQuery(currentPage)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  console.log(BlogData)
  const blogs = BlogData?.docs?.map((blog) => ({
    ...blog,
    key: blog._id
  }))

  const start = () => {
    setLoading(true)
    setTimeout(() => {
      message.error('Chưa xóa được tất cả :))')
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
  if (isLoading) return <Loading />
  if (isError) return <NotFound />
  const columns = [
    {
      title: 'Tên blog',
      dataIndex: 'name',
      key: 'name',
      with: '20%',
      render: (name: string) => <span className='uppercase'>{name}</span>
    },
    {
      title: 'Ảnh blog',
      dataIndex: 'images',
      key: 'discount',
      with: '20%',

      render: (image: any) => <img className='w-full max-w-[350px]' src={image[0]?.url} alt='' />
    },
    {
      title: 'Mô tả blog',
      dataIndex: 'description',
      key: 'description',
      with: '20%',
      render: (text: string) => <p>{truncateDescription(text, 100)}</p>
    },
    {
      title: 'Action',
      key: 'action',
      with: '20%',
      render: (_: any, blogs: IBlogs) => (
        <Space size='middle'>
          <Button
            icon={<BsFillPencilFill />}
            onClick={() => {
              // dispatch(setBlog(blogs))
              dispatch(setOpenDrawer(true))
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title='Bạn có muốn xóa bài viết này?'
            description='Are you sure to delete this task?'
            okButtonProps={{ style: { backgroundColor: '#3C50E0', color: '#fff' } }}
            okText='Có'
            cancelText='Không'
            // onCancel={cancelDelete}
            // onConfirm={() => handleDelete(blogs._id!)}
          >
            <Button variant='danger' icon={<BsFillTrashFill />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]
  return (
    <div className='dark:bg-graydark'>
      <Table
        columns={columns}
        dataSource={blogs}
        pagination={{
          pageSize: BlogData && BlogData?.limit,
          total: BlogData && BlogData?.totalDocs,
          onChange(page) {
            setCurrentPage(page)
          }
        }}
        rowSelection={rowSelection}
      />

      <span style={{ marginLeft: 8 }}>
        {hasSelected ? (
          <Button variant='danger' onClick={start} disabled={!hasSelected} loading={loading}>
            Xóa tất cả
          </Button>
        ) : (
          ''
        )}
      </span>
    </div>
  )
}

export default ListBlog

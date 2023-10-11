import {
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  BarChartOutlined,
  ReconciliationOutlined,
  ShoppingOutlined
} from '@ant-design/icons'

import type { MenuProps } from 'antd'
import { NavLink } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type
  } as MenuItem
}

export const items: MenuProps['items'] = [
  // giao diên chính
  getItem(<NavLink to={`/dashboard`}>Dasbboard</NavLink>, 'dashboard', <BarChartOutlined />),

  // quản lý đơn hàng
  getItem(<NavLink to={`/manager/orders`}>Đơn hàng</NavLink>, 'orders', <AppstoreOutlined />),

  // quản lý sản phẩm
  getItem('Sản phẩm', 'products', <ShoppingOutlined />, [
    getItem(<NavLink to={`/manager/products`}>Sản phẩm</NavLink>, 'product'),
    getItem(<NavLink to={`/manager/categories`}>Danh mục</NavLink>, 'categories'),
    getItem(<NavLink to={`/manager/toppings`}>Topping</NavLink>, 'Topping'),
    getItem(<NavLink to={`/manager/sizes`}>Sizes</NavLink>, 'Sizes'),
    getItem(<NavLink to={`/manager/vouchers`}>Vouchers</NavLink>, 'Vouchers'),
    getItem(<NavLink to={`/manager/blogs`}>Blogs</NavLink>, 'Blogs')
  ]),

  // quản lý người dùng
  getItem('Người dùng', 'users', <UserOutlined />, [
    getItem(<NavLink to={`/manager/users`}>Khách hàng</NavLink>, 'customers'),
    getItem('Nhân viên', 'staffs')
  ]),

  getItem(<NavLink to={`/settings`}>Cài đặt</NavLink>, 'settings', <SettingOutlined />)
]

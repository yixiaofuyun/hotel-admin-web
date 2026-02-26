# 🏨 Hotel Admin Web (酒店预订平台 - 商户与总后台管理系统)

本项目是全栈酒店预订平台的前端管理系统（B端/Admin端）。基于 React 18 + Vite + Ant Design 构建，为酒店商户和平台管理员提供了一套现代化、响应式且高度定制化的精细化运营工作台。

## ✨ 核心亮点特性 (Key Features)

- 🔐 **动态角色权限路由 (RBAC)**
  系统内置灵活的权限控制体系。根据登录用户的角色（`Admin` 平台管理员 / `Merchant` 酒店商户），动态渲染左侧菜单栏与页面路由，确保数据隔离与操作安全。
- 🗺️ **LBS 可视化地图选点 (Tencent Map Integration)**
  在酒店发布模块深度集成腾讯地图 API。商户无需手动输入繁琐的经纬度，只需在地图上进行沉浸式拖拽选点，系统即可自动逆地址解析并精准回填地理坐标与详细地址。
- 📅 **直观的 60 天动态库存与房态盘 (Dynamic Inventory Calendar)**
  告别枯燥的表格！为商户打造了可视化的“日历房态抽屉”，实时联动后端 60 天库存数据。商户可以清晰地追踪每一天的剩余房量、已订数量与价格浮动。
- ⚡ **极致的表单与交互体验 (Optimized UX/UI)**
  依托 Ant Design 强大的组件库，实现了复杂的酒店图文上传（支持多图预览与裁剪）、级联选择、以及带有防抖机制的智能校验表单。底层剥离了敏感价格的手动修改权限，配合后端的“智能价格牵引”实现无感自动定价。

## 🛠️ 技术栈 (Tech Stack)

- **构建工具:** [Vite](https://vitejs.dev/) (极速的冷启动与 HMR)
- **前端框架:** [React](https://reactjs.org/) (Hooks 深度应用)
- **UI 组件库:** [Ant Design](https://ant.design/)
- **路由管理:** [React Router Dom v6](https://reactrouter.com/)
- **网络请求:** Axios (封装全局拦截器与 Token 续签)
- **样式方案:** CSS Modules / Less

## 📂 核心目录结构 (Project Structure)

```text
hotel-admin-web/
├── public/             # 静态公共资源
├── src/
│   ├── api/            # 集中管理的接口层 (admin.js, auth.js, hotel.js...)
│   ├── assets/         # 图片、图标等静态资产
│   ├── components/     # 全局复用的 UI 组件
│   ├── layouts/        # 页面布局骨架 (BasicLayout 动态菜单栏)
│   ├── pages/          # 视图层 (业务页面)
│   │   ├── Admin/      # 管理员专属页面 (资质审核等)
│   │   ├── Merchant/   # 商户专属页面 (酒店管理、房型库存管理等)
│   │   └── Login/      # 登录鉴权页
│   ├── utils/          # 工具函数库 (request.js 网络拦截器)
│   ├── App.jsx         # 根组件与路由入口
│   └── main.jsx        # React 挂载点
├── .env                # 环境变量配置
├── package.json
└── vite.config.js      # Vite 构建与代理配置

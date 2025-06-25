# X.Ryder
## 简介
这是一个基于vite、react、tailwindcss和shadcn的中后台ui快速开发模板。搭配[xryder-server](https://github.com/pipijoe/xryder-server)这个基于Spring Boot的后台程序,可快速构建一个中后台系统的基础代码开发框架。

## 系统截图
首页
![首页](https://github.com/pipijoe/xryder-web/blob/main/src/assets/examples/wechat_2024-12-03_100104_397.png)
ai对话
![ai对话](https://github.com/pipijoe/xryder-web/blob/main/src/assets/examples/wechat_2024-12-03_100305_969.png)
用户管理
![用户管理](https://github.com/pipijoe/xryder-web/blob/main/src/assets/examples/wechat_2024-12-03_100324_346.png)
账户设置
![账户设置](https://github.com/pipijoe/xryder-web/blob/main/src/assets/examples/wechat_2024-12-03_100359_310.png)
收件箱
![收件箱](https://github.com/pipijoe/xryder-web/blob/main/src/assets/examples/wechat_2024-12-03_100411_159.png)
登录页
![登录页](https://github.com/pipijoe/xryder-web/blob/main/src/assets/examples/wechat_2024-12-03_100430_003.png)

## 使用的组件
- 状态管理: zustand
- 路由: react-router-dom
- 样式ui: [tailwindcss](https://tailwindcss.com/docs/installation) + [shadcn/ui](https://ui.shadcn.com/)
- icon: [react-icons](https://react-icons.github.io/react-icons/) + [lucide](https://lucide.dev/icons/)
- 网络请求: axios
- 表单参数校验: zod 
- 动效: framer-motion

## 运行
```shell
npm install

npm run dev
```

## 打包
```shell
npm run build
```

### 已有功能
- [x] 登录、token刷新、多次登录失败锁定
- [x] AI对话
- [x] 用户管理
- [x] 角色管理、权限校验
- [x] 部门管理
- [x] 操作日志
- [x] 登录日志
- [x] 账户管理、头像修改、密码重置等
- [x] 职位管理
- [x] 通知公告
- [x] 403和500 page
- [x] 400异常处理
- [x] 自定义设置（国际化、深色模式）
- [x] 智能监控

## 参与开发
1. 创建一个本地分支
    ```git
   git checkout -b my-new-branch
    ```
2. 提交你的修改
    ```shell
    git commit -a -m 'Description of the changes'
    ```
3. 推送你的分支到远程仓库
    ```shell
    git push origin my-new-branch
    ```
4. 去到远程仓库发起合并请求

# 📬 联系方式

你可以通过这些方式跟我联系：

- Email: cutesimba@163.com

感谢你在我的互联网角落停留片刻！ 💫

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=pipijoe/xryder-web&type=Date)](https://star-history.com/#pipijoe/xryder-web&Date)

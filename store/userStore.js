import { observable, action } from 'mobx-miniprogram'
import { getStorage } from '../utils/storage'
export const userStore = observable({
  // 定义响应式数据

  token: getStorage('token') || '',

  userInfo: getStorage('userInfo') || '',

  isLogin: false,
  
  setIsLogin: action(function(param) {
    this.isLogin = param
  }),

  setToken: action(function(token) {
    this.token = token
  }),

  setUserInfo: action(function(userInfo) {
    this.userInfo = userInfo
  })
})
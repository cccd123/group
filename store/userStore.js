import { observable, action, set } from 'mobx-miniprogram'
import { getStorage } from '../utils/storage'
export const userStore = observable({
  // 定义响应式数据

  token: getStorage('token') || '',

  userInfo: getStorage('userInfo') || '',
  
  schoolName: '',
  
  isLogin: false,
  
  setIsLogin: action(function(param) {
    this.isLogin = param
  }),

  setToken: action(function(token) {
    this.token = token
  }),

  setUserInfo: action(function(userInfo) {
    this.userInfo = userInfo
  }),

  setSchoolName: action(function(schoolName) {
    this.schoolName = schoolName
  }),
})
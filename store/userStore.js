import { observable, action } from 'mobx-miniprogram'
import { getStorage } from '../utils/storage'
export const userStore = observable({
  // 定义响应式数据

  token: getStorage('token') || '',

  userInfo: getStorage('userInfo') || '',
  
  // 目前没有通过schoolId获取学校信息的api，所以这里先存储schoolInfo
  schoolInfo: getStorage('schoolInfo') || '',

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
  
  // 目前没有通过schoolId获取学校信息的api，所以这里先存储schoolInfo
  setSchoolInfo: action(function(schoolInfo) {
    this.schoolInfo = schoolInfo
  })
})
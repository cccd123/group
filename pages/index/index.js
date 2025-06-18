const app = getApp()
import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { userStore } from '../../store/userStore'
ComponentWithStore({
  /**
   * 页面的初始数据
   */
  data: {},

  // 让页面和store对象建立联系
  storeBindings: {
    store: userStore,
    fields: ['token', 'userInfo', 'isLogin']
  },

  methods: {
    infoLookfor(e) {
      wx.navigateTo({
        url: '../lookFor/lookFor'
      })
    },

    infoIdea(e) {
      wx.navigateTo({
        url: '../idea/idea',
      })
    },

    infoLogin() {
      wx.navigateTo({
        url: '../login/login',
      })
    },

    Email_Marketing(e) {
      wx.navigateTo({
        url: '../emailMarketing/emailMarketing',
      })
    },
  }
})

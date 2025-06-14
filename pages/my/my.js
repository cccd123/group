import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { userStore } from '../../store/userStore'
import { clearStorage } from '../../utils/storage'
ComponentWithStore({
  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    showOverlay: false,
    manualComplaint: false,
  },

  storeBindings: {
    store: userStore,
    fields: ['token', 'userInfo', 'schoolInfo'],
    actions: ['setToken', 'setUserInfo', 'setIsLogin']
  },

  methods: {
    showCustomModal() {
      this.setData({
        showModal: true,
        showOverlay: true
      });
    },

    //表单反馈
    onFeedback() {
      wx.navigateTo({
        url: '../formFeedback/formFeedback',
      })
    },

    // 人工投诉
    onComplain() {
      this.setData({
        manualComplaint: true,
      });
    },

    onCancel() {
      this.setData({
        showModal: false,
        showOverlay: false
      });
    },

    cancelComplaint() {
      this.setData({
        manualComplaint: false,
      });
    },

    myTeam() {
      wx.navigateTo({
        url: '../myTeam/myTeam'
      })
    },

    interested() {
      wx.navigateTo({
        url: '../interested/interested',
      })
    },

    servicePeople() {
      wx.navigateTo({
        url: '../servicePeople/servicePeople',
      })
    },

    myRedact() {
      wx.navigateTo({
        url: '../myRedact/myRedact',
      })
    },

    schoolAccreditation() {
      wx.navigateTo({
        url: '../schoolAccreditation/schoolAccreditation',
      })
    },

    logout() {
      clearStorage()
      this.setToken('')
      this.setUserInfo('')
      this.setIsLogin(false)
      // app.globalData.token = ''
      // app.globalData.userInfo = ''
      // ！！！是否需要做一些什么提示或者弹窗 来告知用户已经退出登录！！！
      // wx.navigateTo({
      //   url: '../login/login',
      // })

      // 跳转首页
    }
  }


})

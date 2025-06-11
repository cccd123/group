// app.js
export const promisifyRequest = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });
};
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: "",
        traceUser: true,
      });
    }
    this.globalData.userInfo = wx.getStorageSync('userInfo')
    this.globalData.token = wx.getStorageSync('token')
  },
  globalData: {
    baseUrl: 'http://114.55.85.236:8080',
    // baseUrl: 'http://localhost:8080',
    userInfo: null,
    token: null
  },
  setToken(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },
  refreshUserInfo() {
    wx.request({
      url: `${this.globalData.baseUrl}/user/getuserinfo`,
      method: 'GET',
      header: {
        'Authorization': this.globalData.token
      },
      success(res) {
        console.log('后端个人信息', res.data.data)
        wx.setStorageSync('userInfo', res.data.data)
        getApp().globalData.userInfo = res.data.data
      },
      fail(err) {
        console.error(err.message)
      }
    })
  },
  async login() {
    const code = (await wx.login()).code
    wx.request({
      url: `${this.globalData.baseUrl}/user/login`,
      method: 'POST',
      data: 'jsCode=' + code,  // 改为字符串格式
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.setToken(res.data.data)
          this.refreshUserInfo()
          wx.switchTab({
            url: '../index/index',
          })
        } else {
          throw new Error(loginRes.data.message || '登录失败');
        }
      },
      fail(e) {
        console.error(e)
      }
    })
  }
});

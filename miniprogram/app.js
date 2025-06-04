// app.js
const TOKEN_KEY = 'sys:auth_token'
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
  },
  globalData: {
    token: null,
    host: 'https://114.55.85.236:8080'
  },

  setToken(token) {
    try {
      // 内存存储
      this.globalData.token = token
      
      // todo(加密)
      wx.setStorageSync(TOKEN_KEY, token)
    } catch (e) {
      console.error('Token存储失败:', e)
    }
  },
  getToken() {
    if (this.globalData.token) return this.globalData.token
    
    try {
      const token = wx.getStorageSync(TOKEN_KEY)
      this.globalData.token = token 
      return token 
    } catch (e) {
      console.error('Token解析失败:', e)
      return null
    }
  },
  // 清除令牌
  clearToken() {
    this.globalData.token = null
    wx.removeStorageSync(TOKEN_KEY)
    wx.reLaunch({ url: '/pages/login/index' })
  }
});

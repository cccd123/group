// app.js
import './utils/extendApi'
export const promisifyRequest = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });
};
export const promisifyUploadFile = (options) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      ...options,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });
}
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
	// console.log(this.globalData.userInfo)							// test
	this.globalData.token = wx.getStorageSync('token')
	this.globalData.userOpenid = this.globalData.userInfo.openid
	// console.log(this.globalData.userOpenid)
  },
  globalData: {
    baseUrl: 'http://114.55.85.236:8080',
    userInfo: null,
	token: null,
	userOpenid: null
  },
  setToken(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },
  setUserInfo(info) {
    this.globalData.userInfo = info
    wx.setStorageSync('userInfo', info)
    console.log('setUserInfo', info)
  },
  async refreshUserInfo() {
    try {
      const { data } = await promisifyRequest({
        url: `${this.globalData.baseUrl}/user/getuserinfo`,
        method: 'GET',
        header: {
          'Authorization': this.globalData.token
        },
      })
      this.setUserInfo(data.data)
    } catch (e) {
      console.error('refreshUserInfo', e)
    }
  },
  async login() {
    const code = (await wx.login()).code
    const { data } = await promisifyRequest({
      url: `${this.globalData.baseUrl}/user/login`,
      method: 'POST',
      data: 'jsCode=' + code,  // 改为字符串格式
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
    if (data.code === 200) {
      this.setToken(data.data)
      await this.refreshUserInfo()
      wx.navigateBack()
    }
  }
});

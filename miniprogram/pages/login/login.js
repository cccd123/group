// pages/Login/Login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    login: 1,
    userName:'',
    userPhone:'',
    userEmail:'',
    inSchool:'',
    grade:'',
    schoolMajor:'',
    openid:'',
    access_token:''
  },

  // 登录首页
  login1(){
    this.setData({
      login: 2
    })
  },

  // 获取昵称和openid
  userName(e) {
    const userName = e.detail.value.trim();
    this.setData({
      userName: userName,
    });
    wx.login({
      success: (res) => {
        const codes = res.code
        wx.request({
          url: `https://api.weixin.qq.com/sns/jscode2session?appid=wx1cb9eddd2bef98d5&secret=2802051377f7c9166c7f27e4cae70a9b&js_code=${codes}&grant_type=authorization_code `,
          success: (res) => {
            console.log(res)
            console.log(res.data.openid)
            const openid = res.data.openid
            this.setData({
              openid
            })
          }
        })
      },
    })
  },

  //获取手机号码
  login2(){
    this.setData({
      login: 3
    });
  },

  // 后端获取微信手机号快捷注册
  // getPhoneNumber(e) {
  //   if (e.detail.code) {
  //     // 将code发送到后端
  //     wx.request({
  //       url: 'http://localhost:3000/getPhoneNumber',
  //       method: 'POST',
  //       data: { code: e.detail.code },
  //       success: (res) => {
  //         const phoneNumber = res.data.phoneNumber
  //         this.setData({
  //           userPhone: phoneNumber
  //         })
  //       },
  //       fail: (err) => {
  //         console.error('请求失败', err)
  //       }
  //     })
  //   } else {
  //     console.error('用户拒绝授权或获取失败', e.detail)
  //   };
  //   this.setData({
  //     login: 4
  //   })
  // },

  // 前端获取微信手机号快捷注册
  getPhoneNumber(e) {
    const code = e.detail.code;
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx1cb9eddd2bef98d5&secret=2802051377f7c9166c7f27e4cae70a9b',
      success: (res) => {
        const access_token = res.data.access_token;
        this.setData({
          access_token: access_token
        });
        // 在获取 access_token 成功后发起第二个请求
        wx.request({
          url: `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
          method: 'POST', // 指定为 POST 方法
          data: {
            code: code // 将 code 作为请求体传递
          },
          success: (res) => {
            console.log(res)
            const phoneNumber = res.data.phone_info.phoneNumber
            console.log(phoneNumber)
            this.setData({
              userPhone: phoneNumber
            })
          },
          fail: (err) => {
            console.error('获取用户手机号失败', err);
          }
        });
      },
      fail: (err) => {
        console.error('获取 access_token 失败', err);
      }
    });
    this.setData({
      login: 4
    });
  },

  // 手机号验证码注册
  getrealtimephonenumber(e){
    console.log(e.detail.code) 
    const code = e.detail.code;
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx1cb9eddd2bef98d5&secret=2802051377f7c9166c7f27e4cae70a9b',
      success: (res) => {
        const access_token = res.data.access_token;
        this.setData({
          access_token: access_token
        });
        // 在获取 access_token 成功后发起第二个请求
        wx.request({
          url: `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
          method: 'POST', // 指定为 POST 方法
          data: {
            code: code // 将 code 作为请求体传递
          },
          success: (res) => {
            console.log(res)
            const phoneNumber = res.data.phone_info.phoneNumber
            console.log(phoneNumber)
            this.setData({
              userPhone: phoneNumber
            })
          },
          fail: (err) => {
            console.error('获取用户手机号失败', err);
          }
        });
      },
      fail: (err) => {
        console.error('获取 access_token 失败', err);
      }
    });
    this.setData({
      login: 4
    }); 
  },
  
  // 获取邮件
  userEmail(e){
    const userEmail = e.detail.value;
    this.setData({
      userEmail: userEmail
    })
  },
  login4(){
    this.setData({
      login: 5
    })
  },

  // 其它信息
  inSchool(e){
    const inSchool = e.detail.value;
    this.setData({
      inSchool: inSchool
    })
  },
  grade(e){
    const grade = e.detail.value;
    this.setData({
      grade: grade
    })  
  },
  schoolMajor(e){
    const schoolMajor = e.detail.value;
    this.setData({
      schoolMajor: schoolMajor
    }) 
  },
  login5() {
    const { userName, userPhone, userEmail, inSchool, grade, schoolMajor ,openid } = this.data;
    wx.setStorageSync('userInfo', { userName, userPhone, userEmail, inSchool, grade, schoolMajor ,openid});
    wx.switchTab({
      url: '../index/index',
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
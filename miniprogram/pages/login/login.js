// pages/Login/Login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    login: 1,
    userName: '',
    userPhone: '',
    userEmail: '',
    inSchool: '',
    grade: '',
    schoolMajor: '',
    openid: '',
    access_token: '',
    nokuaizubook: false
  },

  // 登录首页
  login1() {
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
      success (res) {
        if (res.code) {
          //发起网络请求
          console.log(`Code ${res.code} formData ${formData}`)
          wx.request({
            url: `${app.globalData.host}/api/user/login`,
            method: 'POST',
            header: {
              "Authorization": res.code
            },
            data: {
              jsCode: res.code
            },
            success(res) {
              console.log(`success ${res.statusCode} ${res.data}`)
              const token = res.data
              console.log(token)
              app.setToken(token)
            },
            fail(err) {
              console.error(`错误：${err.errMsg}`)
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      },
      fail(err) {
        console.error(err.errMsg)
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  testLogin(e) {
    const formData = {
      email: '1@example.com',
      password: '12345678',
      school: '测试学校',
      studentId: '123456789'
    }
    this.doLogin(formData)
  },
  login(e) {
    const formData = e.detail.value

    // 前端验证
    if (!this.validateForm(formData)) {
      return
    }
    this.doLogin(formData)
  },
  testRegist(e) {
    const formData = {
      email: '1@example.com',
      password: '12345678',
      school: '测试学校',
      studentId: '123456789'
    }
    this.doRegist(formData)
  },
  doRegist(formdata) {
    const {email, password, school, studentId} = formdata
    const app = getApp()
    wx.request({
      url: `${app.globalData.host}/api/user/regist`,
      method: 'POST',
      header: {
        'Authorization': 'token'
      },
      data: {
        email: email,
        password: password,
        school: school,
        studentId: studentId
      }
    })
  }
})

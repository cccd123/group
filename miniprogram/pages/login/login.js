Page({
  validateForm(formData) {
    const { email, password, school, studentId } = formData
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (!email || !emailPattern.test(email)) {
      wx.showToast({ title: '请输入有效的邮箱地址', icon: 'none' })
      return false
    }

    if (!password || !passwordPattern.test(password)) {
      wx.showToast({ title: '密码至少8个字符，包含字母和数字', icon: 'none' })
      return false
    }
    if (!school) {
      wx.showToast({ title: '请输入学校名称', icon: 'none' })
      return false
    }
    if (!studentId) {
      wx.showToast({ title: '请输入学号', icon: 'none' })
      return false
    }

    return true
  },
  /**
   * @param formData as { email, password, school, studentId }
   * @description 登录函数
   */
  doLogin(formData) {
    const app = getApp()
    wx.showLoading({ title: '登录中...' })
    
    console.log('准备登录，服务器地址:', app.globalData.host)
    console.log('表单数据:', formData)
    
    // 1. 首先获取微信code
    wx.login({
      success: (res) => {
        if (!res.code) {
          wx.hideLoading()
          console.error('微信登录失败:', res.errMsg)
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
          return
        }
        
        console.log('获取到微信code:', res.code)
        
        // 2. 准备请求数据
        const requestData = {
          jsCode: res.code,
          ...formData
        }
        
        console.log('发送登录请求:', {
          url: `${app.globalData.host}/user/login`,
          method: 'POST',
          data: requestData
        })
        
        // 3. 发送登录请求
        wx.request({
          url: `${app.globalData.host}/user/login`,
          method: 'POST',
          header: {
            'content-type': 'application/json',
            'Authorization': res.code
          },
          data: requestData,
          success: (res) => {
            console.log('登录响应:', {
              statusCode: res.statusCode,
              data: res.data,
              header: res.header
            })
            
            if (res.statusCode === 200 && res.data) {
              const token = res.data.token || res.data
              if (token) {
                app.setToken(token)
                wx.showToast({ title: '登录成功', icon: 'success' })
                // 跳转到首页
                wx.switchTab({ url: '/pages/index/index' })
              } else {
                throw new Error('服务器返回的token无效')
              }
            } else {
              throw new Error(`请求失败，状态码: ${res.statusCode}`)
            }
          },
          fail: (err) => {
            console.error('登录请求失败:', {
              errMsg: err.errMsg,
              err: err
            })
            
            // 检查是否是SSL证书问题
            if (err.errMsg && err.errMsg.includes('certificate')) {
              wx.showModal({
                title: '证书错误',
                content: 'SSL证书验证失败，可能是服务器证书配置问题',
                showCancel: false
              })
            } else {
              wx.showToast({
                title: '登录失败，请检查网络',
                icon: 'none',
                duration: 2000
              })
            }
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: (err) => {
        console.error('微信登录失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '微信登录失败',
          icon: 'none',
          duration: 2000
        })
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
})

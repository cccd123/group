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
   * @description 注册函数
   */
  doLogin(formData) {
    // 显示加载状态
    wx.showLoading({ title: '注册中...' })
    // 调用登录接口
    wx.login({
      success (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: `http://127.0.0.1/api/user/login/`,
            method: 'POST',
            header : {
              'content-type': 'application/json',
              'Authorization': res.code
            },
            data: {
              jsCode: res.code
            }
          })
          
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    wx.hideLoading()
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

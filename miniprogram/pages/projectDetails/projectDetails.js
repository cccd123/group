// pages/projectDetails/projectDetails.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    direction:'落地',
    checked: false,
    projectId: null // 存储项目ID
  },

  direction(e){
    const direction = e.currentTarget.dataset.direction;
    this.setData({
      direction: direction
    })
    console.log(this.data.direction)
  },

  /**
   * 参与项目功能
   */
  joinProject() {
    // 检查是否有项目ID
    if (!this.data.projectId) {
      wx.showToast({
        title: '项目ID不存在',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '正在提交...',
    });

    // 发起网络请求
    wx.request({
      url: 'http://114.55.85.236:8080/project/join',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        // 如果需要认证token，在这里添加
        // 'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        id: this.data.projectId.toString() // 确保ID为字符串格式
      },
      success: (res) => {
        wx.hideLoading();
        console.log('参与项目成功:', res);
        
        if (res.statusCode === 200) {
          // 请求成功
          wx.showToast({
            title: '参与成功',
            icon: 'success',
            duration: 2000
          });
          
          // 可以在这里添加其他成功后的操作
          // 比如更新页面状态、跳转页面等
          
        } else {
          // 服务器返回错误状态码
          wx.showToast({
            title: res.data.message || '参与失败',
            icon: 'error',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('参与项目失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  /**
   * 使用form-data格式的参与项目功能（备用方案）
   */
  joinProjectFormData() {
    if (!this.data.projectId) {
      wx.showToast({
        title: '项目ID不存在',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    wx.showLoading({
      title: '正在提交...',
    });

    // 创建form-data格式的数据
    const formData = new FormData();
    formData.append('id', this.data.projectId.toString());

    wx.request({
      url: 'http://114.55.85.236:8080/project/join',
      method: 'POST',
      header: {
        'content-type': 'multipart/form-data',
        // 如果需要认证token，在这里添加
        // 'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: formData,
      success: (res) => {
        wx.hideLoading();
        console.log('参与项目成功:', res);
        
        if (res.statusCode === 200) {
          wx.showToast({
            title: '参与成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: res.data.message || '参与失败',
            icon: 'error',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('参与项目失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从页面参数中获取项目ID
    if (options.projectId) {
      this.setData({
        projectId: parseInt(options.projectId)
      });
    }
    // 或者从其他地方获取项目ID，比如全局变量、缓存等
    // const projectId = wx.getStorageSync('currentProjectId');
    // if (projectId) {
    //   this.setData({
    //     projectId: projectId
    //   });
    // }
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
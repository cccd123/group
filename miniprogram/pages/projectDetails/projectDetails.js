// pages/projectDetails/projectDetails.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    direction: '落地',
    checked: false,
    projectId: null, // 存储项目ID
    projectDetails: null, // 存储项目详情数据
    loading: true, // 加载状态
    hasJoined: false // 是否已参与项目
  },

  /**
   * 获取认证头
   */
  getAuthHeader() {
    const token = wx.getStorageSync('token');
    console.log('获取到的token:', token ? '存在' : '不存在');
    
    if (token) {
      return {
        'content-type': 'application/json',
        'Authorization': token  // 直接使用token，不加Bearer前缀
      };
    } else {
      // 如果没有token，提示用户登录
      this.showLoginPrompt();
      return {
        'content-type': 'application/json'
      };
    }
  },

  /**
   * 显示登录提示
   */
  showLoginPrompt() {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: true,
      cancelText: '取消',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (!token) {
      this.showLoginPrompt();
      return false;
    }
    return true;
  },

  /**
   * 获取项目详情
   */
  getProjectDetails() {
    if (!this.data.projectId) {
      wx.showToast({
        title: '项目ID不存在',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    if (!this.checkLoginStatus()) {
      return;
    }

    this.setData({
      loading: true
    });

    wx.request({
      url: `http://114.55.85.236:8080/project/details/${this.data.projectId}`,
      method: 'GET',
      header: this.getAuthHeader(),
      success: (res) => {
        console.log('获取项目详情响应:', res);
        
        if (res.statusCode === 200 && res.data) {
          this.setData({
            projectDetails: res.data.data || res.data,
            loading: false
          });
        } else if (res.statusCode === 401) {
          this.handleAuthError();
        } else {
          this.handleError('获取项目详情失败');
        }
      },
      fail: (err) => {
        console.error('获取项目详情失败:', err);
        this.handleError('网络错误，请重试');
      }
    });
  },

  /**
   * 处理认证错误
   */
  handleAuthError() {
    this.setData({
      loading: false
    });
    
    // 清除可能已过期的token
    wx.removeStorageSync('token');
    
    wx.showModal({
      title: '认证失败',
      content: '登录已过期，请重新登录',
      showCancel: false,
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  /**
   * 处理错误
   */
  handleError(message) {
    this.setData({
      loading: false
    });
    
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    });
  },

  /**
   * 方向选择
   */
  direction(e) {
    const direction = e.currentTarget.dataset.direction;
    this.setData({
      direction: direction
    });
    console.log('选择方向:', this.data.direction);
  },

  /**
   * 参与项目功能
   */
  joinProject() {
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }

    // 检查是否有项目ID
    if (!this.data.projectId) {
      wx.showToast({
        title: '项目ID不存在',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    // 显示确认对话框
    wx.showModal({
      title: '确认参与',
      content: `确定要参与这个项目吗？选择方向：${this.data.direction}`,
      success: (res) => {
        if (res.confirm) {
          this.submitJoinRequest();
        }
      }
    });
  },

  /**
   * 提交参与请求
   */
  submitJoinRequest() {
    // 显示加载提示
    wx.showLoading({
      title: '正在提交...',
    });

    // 准备请求数据
    const requestData = {
      id: this.data.projectId.toString(),
      direction: this.data.direction // 如果API需要方向参数
    };

    // 发起网络请求
    wx.request({
      url: 'http://114.55.85.236:8080/project/join',
      method: 'POST',
      header: this.getAuthHeader(),
      data: requestData,
      success: (res) => {
        wx.hideLoading();
        console.log('参与项目响应:', res);
        
        if (res.statusCode === 200) {
          // 请求成功
          wx.showToast({
            title: '参与成功',
            icon: 'success',
            duration: 2000
          });
          
          // 更新页面状态
          this.setData({
            hasJoined: true
          });
          
          // 可以选择刷新项目详情或跳转到其他页面
          // this.getProjectDetails();
          
        } else if (res.statusCode === 401) {
          this.handleAuthError();
        } else {
          // 服务器返回错误状态码
          const errorMessage = res.data?.message || res.data?.msg || '参与失败';
          wx.showToast({
            title: errorMessage,
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
   * 检查是否已参与项目
   */
  checkJoinStatus() {
    if (!this.data.projectId || !this.checkLoginStatus()) {
      return;
    }

    wx.request({
      url: `http://114.55.85.236:8080/project/checkJoin/${this.data.projectId}`,
      method: 'GET',
      header: this.getAuthHeader(),
      success: (res) => {
        console.log('检查参与状态响应:', res);
        
        if (res.statusCode === 200 && res.data) {
          this.setData({
            hasJoined: res.data.hasJoined || false
          });
        }
      },
      fail: (err) => {
        console.error('检查参与状态失败:', err);
      }
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('页面参数:', options);
    
    // 从页面参数中获取项目ID
    if (options.projectId) {
      this.setData({
        projectId: parseInt(options.projectId)
      });
      
      // 获取项目详情
      this.getProjectDetails();
      
      // 检查参与状态
      this.checkJoinStatus();
    } else {
      wx.showToast({
        title: '项目ID缺失',
        icon: 'error',
        duration: 2000
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时检查登录状态
    if (this.data.projectId && !this.data.projectDetails) {
      this.getProjectDetails();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.getProjectDetails();
    this.checkJoinStatus();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.projectDetails?.projectName || '项目分享',
      path: `/pages/projectDetails/projectDetails?projectId=${this.data.projectId}`
    };
  }
});
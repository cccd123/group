// pages/interested/interested.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    projectList: [] // 存储项目列表数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadProjectData();
  },

  /**
   * 获取token
   */
  getToken() {
    // 优先从全局App获取，然后从本地存储获取
    const app = getApp();
    let token = app.globalData.token || wx.getStorageSync('token');
    
    // 调试信息
    console.log('获取到的token:', token);
    console.log('token类型:', typeof token);
    console.log('token长度:', token ? token.length : 0);
    
    return token;
  },

  /**
   * 加载项目数据
   */
  loadProjectData() {
    const token = this.getToken();
    
    // 检查token是否存在
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            wx.redirectTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }

    wx.showLoading({
      title: '加载中...',
    });

    wx.request({
      url: 'http://114.55.85.236:8080/project/projectjoin/1',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': token  
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          // 假设后端返回的数据结构为 { code: 200, data: [...], message: 'success' }
          if (res.data.code === 200) {
            this.setData({
              projectList: res.data.data || []
            });
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.message || '获取数据失败',
              showCancel: false
            });
          }
        } else {
          wx.showModal({
            title: '网络错误',
            content: '请检查网络连接',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求失败:', err);
        wx.showModal({
          title: '请求失败',
          content: '网络连接异常，请重试',
          showCancel: false
        });
      }
    });
  },

  /**
   * 删除项目
   */
  deleteProject(e) {
    const projectId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const token = this.getToken();
    
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个项目吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
          });

          wx.request({
            url: `http://114.55.85.236:8080/project/projectjoin/${projectId}`,
            method: 'DELETE',
            header: {
              'content-type': 'application/json',
              'Authorization': token
            },
            success: (res) => {
              wx.hideLoading();
              if (res.statusCode === 200 && res.data.code === 200) {
                // 删除成功，从本地数据中移除
                let projectList = this.data.projectList;
                projectList.splice(index, 1);
                this.setData({
                  projectList: projectList
                });
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
              } else {
                wx.showModal({
                  title: '删除失败',
                  content: res.data.message || '删除失败，请重试',
                  showCancel: false
                });
              }
            },
            fail: (err) => {
              wx.hideLoading();
              wx.showModal({
                title: '删除失败',
                content: '网络连接异常，请重试',
                showCancel: false
              });
            }
          });
        }
      }
    });
  },

  /**
   * 下一步操作
   */
  nextStep(e) {
    const projectId = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    const token = this.getToken();
    
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    if (status === 'accept') {
      // 如果是接受状态，可以进行下一步操作
      wx.showModal({
        title: '确认操作',
        content: '确定要进行下一步操作吗？',
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({
              title: '处理中...',
            });

            wx.request({
              url: `http://114.55.85.236:8080/project/projectjoin/${projectId}/next`,
              method: 'POST',
              header: {
                'content-type': 'application/json',
                'Authorization': token
              },
              success: (res) => {
                wx.hideLoading();
                if (res.statusCode === 200 && res.data.code === 200) {
                  wx.showToast({
                    title: '操作成功',
                    icon: 'success'
                  });
                  // 重新加载数据
                  this.loadProjectData();
                } else {
                  wx.showModal({
                    title: '操作失败',
                    content: res.data.message || '操作失败，请重试',
                    showCancel: false
                  });
                }
              },
              fail: (err) => {
                wx.hideLoading();
                wx.showModal({
                  title: '操作失败',
                  content: '网络连接异常，请重试',
                  showCancel: false
                });
              }
            });
          }
        }
      });
    } else {
      // 如果是其他状态，提示用户
      wx.showToast({
        title: '暂无可操作项',
        icon: 'none'
      });
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadProjectData();
    wx.stopPullDownRefresh();
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
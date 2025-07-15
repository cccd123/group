// pages/projectDetails/projectDetails.js
import http from '../../utils/http'
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
    hasJoined: false, // 是否已参与项目
    school: {} //学校对象
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
   * 获取项目详情 - 完全修复版本
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

    // console.log('开始获取项目详情，项目ID:', this.data.projectId);
    //查看当前的项目id是否存在
    http.get('/project/projectById/'+this.data.projectId).then(res => {
    // console.log("==================================>");
	// console.log(res);
	const educationRequirement = this.formatEducationRequirement(res.data.educationRequirement);
	// console.log('after convertion, education requirement:\n', educationRequirement);
    this.setData({
	  project: res.data,
	  educationRequirement,
      direction: this.formatDirection(res.data.direction)
    })
  })
  },

  /**
   * 格式化跨校字段
   */
  formatCrossSchool(crossSchool) {
    if (crossSchool === 1 || crossSchool === true) {
      return '是';
    } else if (crossSchool === 0 || crossSchool === false) {
      return '否';
    }
    return '未知';
  },

  /**
   * 格式化教育要求字段
   */
  formatEducationRequirement(educationRequirement) {
    const educationMap = {
      1: '高中',
      2: '本科',
      3: '硕士',
      4: '博士'
    };
    return educationMap[educationRequirement] || '未知';
  },

  /**
   * 格式化项目方向字段
   */
  formatDirection(direction) {
    const directionMap = {
      1: '落地',
      2: '获奖',
      3: '学习'
    };
    return directionMap[direction] || '落地';
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
   * 投递信息/参与项目功能 - 修复版本
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
      title: '确认投递',
      content: `确定要投递这个项目吗？选择方向：${this.data.direction}`,
      success: (res) => {
        if (res.confirm) {
          this.submitJoinRequest();
        }
      }
    });
  },

  /**
   * 提交参与请求 - 按照API文档修复
   */
  submitJoinRequest() {
    // 显示加载提示
    wx.showLoading({
      title: '正在投递...',
    });

    console.log('开始投递项目，项目ID:', this.data.projectId);

	// 根据API文档，使用Query参数传递id
	http.post(
		`/project/join/${this.data.projectId}`, 
		`id=${this.data.projectId}`,
	)
	.then(res =>{
		wx.hideLoading();
        console.log('投递项目响应:', res);

		if (res.code === 200)
		{
            // 投递成功
            wx.showToast({
              title: '投递成功',
              icon: 'success',
              duration: 2000
            });

            // 更新页面状态
            this.setData({
              hasJoined: true
            });

            // 可以刷新项目详情
            setTimeout(() => {
              this.checkJoinStatus();
            }, 1000);
		}
		else if (res.code === 401)
		{
          this.handleAuthError();
		}
		else	// 服务器返回错误状态码
		{
		  const errorMessage = res.message || '投递失败';
		  wx.showModal({
			title: '',
			content: `${errorMessage}`,
			showCancel: false,
			confirmText: '确定',
		  });
        }
	})
	.catch(err =>{
		wx.hideLoading();
		console.error('投递项目失败:', err);
		const errorMessage = err.data.message || '网络错误，请重试';
		wx.showModal({
		  title: '',
		  content: `${errorMessage}`,
		  showCancel: false,
		  confirmText: '确定',
		});
	});
  },

  /**
   * 检查是否已参与项目
   */
  checkJoinStatus() {
    if (!this.data.projectId || !this.checkLoginStatus()) {
      return;
	}
	http.get(`/project/isjoin/${this.data.projectId}`)
	.then(res =>{
		// console.log('检查参与状态响应:', res);
        if (res.code === 200 && res.data) {
          if (res.data.code === 200) {
            this.setData({
              hasJoined: res.data.isJoin || false
            });
          }
        }
	})
	.catch(err =>{
		console.error('检查参与状态失败:', err);
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
// mark: xxx
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
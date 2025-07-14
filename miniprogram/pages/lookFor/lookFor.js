Page({
  data: {
    currentTab: 'all',
    allProjectList: [],      // 所有学校项目列表
    mySchoolProjectList: [], // 本校项目列表
    
    // 分页相关数据
    allPageInfo: {
      pageNum: 1,
      pageSize: 10,
      hasMore: true,
      loading: false
    },
    mySchoolPageInfo: {
      pageNum: 1,
      pageSize: 10,
      hasMore: true,
      loading: false
    },
    
    // 用户学校信息
    userSchool: '', // 从用户信息中获取或设置
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
      // 如果没有token，先尝试登录或提示用户登录
      this.checkLoginStatus();
      return {
        'content-type': 'application/json'
      };
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            wx.navigateTo({
              url: '/pages/login/login' // 根据你的登录页面路径调整
            });
          }
        }
      });
      return false;
    }
    return true;
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const currentTab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: currentTab
    });
    console.log('切换到标签页:', this.data.currentTab);
    
    // 切换标签页时，如果对应列表为空，则加载数据
    if (currentTab === 'all' && this.data.allProjectList.length === 0) {
      this.loadAllProjects(true);
    } else if (currentTab === 'mySchool' && this.data.mySchoolProjectList.length === 0) {
      this.loadMySchoolProjects(true);
    }
  },

  /**
   * 跳转到项目详情页面
   */
  projectDetails(e) {
    const projectId = e.currentTarget.dataset.projectId;
    console.log('跳转到项目详情，项目ID:', projectId);
    
    if (!projectId) {
      wx.showToast({
        title: '项目信息错误',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/projectDetails/projectDetails?projectId=${projectId}`,
    });
  },

  /**
   * 加载所有学校的项目（分页）
   * @param {boolean} refresh - 是否刷新（重置页码）
   */
  loadAllProjects(refresh = false) {
    const pageInfo = this.data.allPageInfo;
    
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }
    
    // 如果正在加载或没有更多数据，则返回
    if (pageInfo.loading || (!refresh && !pageInfo.hasMore)) {
      return;
    }

    // 刷新时重置页码
    if (refresh) {
      pageInfo.pageNum = 1;
      pageInfo.hasMore = true;
    }

    // 设置加载状态
    this.setData({
      'allPageInfo.loading': true
    });

    wx.request({
      url: 'http://114.55.85.236:8080/project/allproject',
      method: 'GET',
      data: {
        pageNum: pageInfo.pageNum.toString(),
        pageSize: pageInfo.pageSize.toString(),
        school: '1' // 1表示所有学校
      },
      header: this.getAuthHeader(),
      success: (res) => {
        console.log('加载所有项目响应:', res);
        
        if (res.statusCode === 200 && res.data) {
          const newProjects = res.data.list || res.data.projects || [];
          const total = res.data.total || 0;
          const currentPage = res.data.pageNum || pageInfo.pageNum;
          const totalPages = Math.ceil(total / pageInfo.pageSize);
          
          let updatedList;
          if (refresh) {
            // 刷新时替换整个列表
            updatedList = newProjects;
          } else {
            // 加载更多时追加到列表
            updatedList = [...this.data.allProjectList, ...newProjects];
          }

          this.setData({
            allProjectList: updatedList,
            'allPageInfo.pageNum': currentPage + 1,
            'allPageInfo.hasMore': currentPage < totalPages,
            'allPageInfo.loading': false
          });

          // 刷新时停止下拉刷新
          if (refresh) {
            wx.stopPullDownRefresh();
          }
        } else if (res.statusCode === 401) {
          this.handleAuthError();
        } else {
          this.handleLoadError('加载项目失败');
        }
      },
      fail: (err) => {
        console.error('加载所有项目失败:', err);
        this.handleLoadError('网络错误，请重试');
      }
    });
  },

  /**
   * 加载本校项目（分页）
   * @param {boolean} refresh - 是否刷新（重置页码）
   */
  loadMySchoolProjects(refresh = false) {
    const pageInfo = this.data.mySchoolPageInfo;
    
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }

    // 如果正在加载或没有更多数据，则返回
    if (pageInfo.loading || (!refresh && !pageInfo.hasMore)) {
      return;
    }

    // 刷新时重置页码
    if (refresh) {
      pageInfo.pageNum = 1;
      pageInfo.hasMore = true;
    }

    // 设置加载状态
    this.setData({
      'mySchoolPageInfo.loading': true
    });

    wx.request({
      url: 'http://114.55.85.236:8080/project/allproject',
      method: 'GET',
      data: {
        pageNum: pageInfo.pageNum.toString(),
        pageSize: pageInfo.pageSize.toString(),
        school: '2' // 2表示仅看我校
      },
      header: this.getAuthHeader(),
      success: (res) => {
        console.log('加载本校项目响应:', res);
        
        if (res.statusCode === 200 && res.data) {
          const newProjects = res.data.list || res.data.projects || [];
          const total = res.data.total || 0;
          const currentPage = res.data.pageNum || pageInfo.pageNum;
          const totalPages = Math.ceil(total / pageInfo.pageSize);
          
          let updatedList;
          if (refresh) {
            // 刷新时替换整个列表
            updatedList = newProjects;
          } else {
            // 加载更多时追加到列表
            updatedList = [...this.data.mySchoolProjectList, ...newProjects];
          }

          this.setData({
            mySchoolProjectList: updatedList,
            'mySchoolPageInfo.pageNum': currentPage + 1,
            'mySchoolPageInfo.hasMore': currentPage < totalPages,
            'mySchoolPageInfo.loading': false
          });

          // 刷新时停止下拉刷新
          if (refresh) {
            wx.stopPullDownRefresh();
          }
        } else if (res.statusCode === 401) {
          this.handleAuthError();
        } else {
          this.handleLoadError('加载本校项目失败');
        }
      },
      fail: (err) => {
        console.error('加载本校项目失败:', err);
        this.handleLoadError('网络错误，请重试');
      }
    });
  },

  /**
   * 处理认证错误
   */
  handleAuthError() {
    this.setData({
      'allPageInfo.loading': false,
      'mySchoolPageInfo.loading': false
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
          // 跳转到登录页面
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    
    wx.stopPullDownRefresh();
  },

  /**
   * 处理加载错误
   */
  handleLoadError(message) {
    this.setData({
      'allPageInfo.loading': false,
      'mySchoolPageInfo.loading': false
    });
    
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    });
    
    wx.stopPullDownRefresh();
  },

  /**
   * 获取用户学校信息
   */
  getUserSchool() {
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }
    
    // 方式1: 从本地缓存获取
    const userSchool = wx.getStorageSync('userSchool');
    
    if (userSchool) {
      this.setData({
        userSchool: userSchool
      });
      return;
    }

    // 方式2: 从后端API获取用户信息
    wx.request({
      url: 'http://114.55.85.236:8080/user/getuserinfo',
      method: 'GET',
      header: this.getAuthHeader(),
      success: (res) => {
        console.log('获取用户信息响应:', res);
        
        if (res.statusCode === 200 && res.data) {
          // 根据实际API响应结构调整
          const school = res.data.school || res.data.schoolName;
          
          if (school) {
            this.setData({
              userSchool: school
            });
            // 缓存用户学校信息
            wx.setStorageSync('userSchool', school);
          } else {
            // 如果获取失败，使用默认学校
            this.setData({
              userSchool: '泉州信息工程学院'
            });
          }
        } else if (res.statusCode === 401) {
          this.handleAuthError();
        } else {
          // 如果获取失败，使用默认学校
          this.setData({
            userSchool: '泉州信息工程学院'
          });
        }
      },
      fail: (err) => {
        console.error('获取用户学校信息失败:', err);
        // 使用默认学校
        this.setData({
          userSchool: '泉州信息工程学院'
        });
      }
    });
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }
    
    // 获取用户学校信息
    this.getUserSchool();
    
    // 加载所有项目的第一页
    this.loadAllProjects(true);
  },

  /**
   * 页面显示时
   */
  onShow() {
    // 可以在这里刷新当前标签页的数据
    // 检查是否有新的token（比如刚登录回来）
    const token = wx.getStorageSync('token');
    if (token && this.data.allProjectList.length === 0) {
      this.loadAllProjects(true);
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('下拉刷新');
    if (this.data.currentTab === 'all') {
      this.loadAllProjects(true);
    } else if (this.data.currentTab === 'mySchool') {
      this.loadMySchoolProjects(true);
    }
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    console.log('上拉加载更多');
    if (this.data.currentTab === 'all') {
      this.loadAllProjects(false);
    } else if (this.data.currentTab === 'mySchool') {
      this.loadMySchoolProjects(false);
    }
  }
});
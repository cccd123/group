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
    userSchool: '', // 用户学校名称
    userSchoolId: null, // 用户学校ID，改为数字类型
    
    // 学校ID到名称的映射
    schoolNames: {
      1: '泉州信息工程学院',
      2: '华侨大学',
      3: '福州大学',
      4: '厦门大学',
      // 可以根据实际情况添加更多学校
    }
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
        'Authorization': token  
      };
    } else {
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
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return false;
    }
    return true;
  },

  /**
   * 根据学校ID获取学校名称
   */
  getSchoolNameById(schoolId) {
    if (!schoolId && schoolId !== 0) return '未知学校';
    // 确保 schoolId 是数字类型
    let id = parseInt(schoolId);
    return this.data.schoolNames[id] || `学校ID: ${id}`;
  },

  /**
   * 截取项目简要信息（最多40个字符）
   */
  truncateProjectInfo(projectInfo) {
    if (!projectInfo) return '';
    return projectInfo.length > 40 ? projectInfo.substring(0, 40) + '...' : projectInfo;
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
   * 跳转到项目详情页面并增加阅读量
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

    // 增加阅读量
    this.increaseReadCount(projectId);

    wx.navigateTo({
      url: `/pages/projectDetails/projectDetails?projectId=${projectId}`,
    });
  },

  /**
   * 增加项目阅读量
   */
  increaseReadCount(projectId) {
    const token = wx.getStorageSync('token');
    
    if (!token || !projectId) {
      return;
    }
    
    wx.request({
      url: `https://zhaoxiaokai.xyz/project/lookproject/${projectId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      },
      data: {
        projectId: projectId,
        action: 'view'
      },
      success: (res) => {
        console.log(`增加项目${projectId}阅读量成功：`, res);
        // 更新本地数据中的阅读量
        this.updateLocalReadCount(projectId);
      },
      fail: (err) => {
        console.error(`增加项目${projectId}阅读量失败：`, err);
      }
    });
  },

  /**
   * 更新本地阅读量数据
   */
  updateLocalReadCount(projectId) {
    // 更新所有学校列表
    const updatedAllProjects = this.data.allProjectList.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          readCount: (project.readCount || 0) + 1,
          lookcount: (project.lookcount || 0) + 1
        };
      }
      return project;
    });
    
    // 更新本校列表
    const updatedMySchoolProjects = this.data.mySchoolProjectList.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          readCount: (project.readCount || 0) + 1,
          lookcount: (project.lookcount || 0) + 1
        };
      }
      return project;
    });
    
    this.setData({
      allProjectList: updatedAllProjects,
      mySchoolProjectList: updatedMySchoolProjects
    });
  },

  /**
   * 处理项目数据，添加格式化信息
   */
  processProjectData(projects) {
    return projects.map(project => {
      return {
        ...project,
        educationText: this.getEducationText(project.educationRequirement),
        directionText: this.getDirectionText(project.direction),
        crossSchoolText: this.getCrossSchoolText(project.crossSchool),
        schoolDisplay: this.getSchoolNameById(project.school), // 显示实际学校名称
        skillRequirement: this.getCrossSchoolText(project.crossSchool), // 改为显示跨校信息
        projectInfo: this.truncateProjectInfo(project.projectInfo) // 截取项目简要信息
      };
    });
  },

  /**
   * 获取学历要求文本 - 支持多项学历
   */
  getEducationText(educationRequirement) {
    if (!educationRequirement) return '不限';
    
    // 如果是字符串，尝试解析为数组
    let educationArray = [];
    if (typeof educationRequirement === 'string') {
      try {
        // 尝试解析JSON数组
        educationArray = JSON.parse(educationRequirement);
      } catch (e) {
        // 如果不是JSON，按逗号分割
        educationArray = educationRequirement.split(',').map(item => item.trim());
      }
    } else if (Array.isArray(educationRequirement)) {
      educationArray = educationRequirement;
    } else {
      // 如果是单个数值
      educationArray = [educationRequirement];
    }
    
    // 转换为文本数组
    const educationTexts = educationArray.map(education => {
      const edu = parseInt(education);
      switch(edu) {
        case 1:
          return '大专';
        case 2:
          return '本科';
        case 3:
          return '研究生';
        default:
          return '不限';
      }
    }).filter(text => text !== '不限'); // 过滤掉"不限"
    
    // 去重并排序
    const uniqueTexts = [...new Set(educationTexts)];
    const sortOrder = ['大专', '本科', '研究生'];
    uniqueTexts.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));
    
    return uniqueTexts.length > 0 ? uniqueTexts.join('/') : '不限';
  },
  /**
   * 获取方向文本
   */
  getDirectionText(direction) {
    const dir = parseInt(direction);
    switch(dir) {
      case 1:
        return '落地';
      case 2:
        return '获奖';
      case 3:
        return '学习';
      default:
        return '其他';
    }
  },

  /**
   * 获取跨校文本
   */
  getCrossSchoolText(crossSchool) {
    const cross = parseInt(crossSchool);
    switch(cross) {
      case 1:
        return '接受跨校';
      case 0:
        return '仅接受本校';
      default:
        return '仅接受本校';
    }
  },

  /**
   * 加载所有学校的项目（分页）
   * @param {boolean} refresh - 是否刷新（重置页码）
   */
  loadAllProjects(refresh = false) {
    const pageInfo = this.data.allPageInfo;
  
    if (!this.checkLoginStatus()) return;
    if (pageInfo.loading || (!refresh && !pageInfo.hasMore)) return;
    if (refresh) {
      pageInfo.pageNum = 1;
      pageInfo.hasMore = true;
    }
  
    this.setData({
      'allPageInfo.loading': true
    });
  
    const requestData = {
      pageNum: pageInfo.pageNum.toString(),
      pageSize: pageInfo.pageSize.toString()
      // 不传 school 参数，获取所有学校的项目
    };
  
    wx.request({
      url: 'https://zhaoxiaokai.xyz/project/allproject',
      method: 'GET',
      data: requestData,
      header: this.getAuthHeader(),
      success: (res) => {
        console.log('加载所有项目响应:', res);
        if (res.statusCode === 200 && res.data) {
          const responseData = res.data.data || res.data;
          const rawProjects = responseData.items || [];
          console.log('返回的第一条项目:', rawProjects[0]);
          
          // 处理项目数据
          const newProjects = this.processProjectData(rawProjects);
          const total = responseData.total || 0;
          const currentPage = pageInfo.pageNum;
          const totalPages = Math.ceil(total / pageInfo.pageSize);
  
          const updatedList = refresh ? newProjects : [...this.data.allProjectList, ...newProjects];
  
          this.setData({
            allProjectList: updatedList,
            'allPageInfo.pageNum': currentPage + 1,
            'allPageInfo.hasMore': currentPage < totalPages,
            'allPageInfo.loading': false
          });
  
          if (refresh) wx.stopPullDownRefresh();
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
    
    if (!this.checkLoginStatus()) {
      return;
    }

    if (pageInfo.loading || (!refresh && !pageInfo.hasMore)) {
      return;
    }

    // 确保有用户学校ID
    if (!this.data.userSchoolId && this.data.userSchoolId !== 0) {
      console.log('用户学校ID未获取，先获取用户信息');
      this.getUserSchool().then(() => {
        // 获取学校信息后再加载项目
        this.loadMySchoolProjects(refresh);
      });
      return;
    }

    if (refresh) {
      pageInfo.pageNum = 1;
      pageInfo.hasMore = true;
    }

    this.setData({
      'mySchoolPageInfo.loading': true
    });

    wx.request({
      url: 'https://zhaoxiaokai.xyz/project/allproject',
      method: 'GET',
      data: {
        pageNum: pageInfo.pageNum.toString(),
        pageSize: pageInfo.pageSize.toString(),
        school: this.data.userSchoolId // 直接传数字，不转换为字符串
      },
      header: this.getAuthHeader(),
      success: (res) => {
        console.log('加载本校项目响应:', res);
        
        if (res.statusCode === 200 && res.data) {
          const responseData = res.data.data || res.data;
          const rawProjects = responseData.items || [];
          
          // 处理项目数据
          const newProjects = this.processProjectData(rawProjects);
          const total = responseData.total || 0;
          const currentPage = res.data.pageNum || pageInfo.pageNum;
          const totalPages = Math.ceil(total / pageInfo.pageSize);
          
          let updatedList;
          if (refresh) {
            updatedList = newProjects;
          } else {
            updatedList = [...this.data.mySchoolProjectList, ...newProjects];
          }

          this.setData({
            mySchoolProjectList: updatedList,
            'mySchoolPageInfo.pageNum': currentPage + 1,
            'mySchoolPageInfo.hasMore': currentPage < totalPages,
            'mySchoolPageInfo.loading': false
          });

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
    return new Promise((resolve, reject) => {
      if (!this.checkLoginStatus()) {
        reject('未登录');
        return;
      }
      
      wx.request({
        url: 'https://zhaoxiaokai.xyz/user/school',
        method: 'GET',
        header: this.getAuthHeader(),
        success: (res) => {
          console.log('获取用户学校信息响应:', res);
          
          if (res.statusCode === 200 && res.data) {
            // 处理实际的API响应结构
            let schoolId = null;
            let schoolName = '';
            
            // 检查响应数据结构
            if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
              // 如果data是数组，取第一个元素
              const userData = res.data.data[0];
              schoolId = userData.schoolId || userData.school;
            } else if (res.data.schoolId || res.data.school) {
              // 如果直接在res.data中
              schoolId = res.data.schoolId || res.data.school;
            } else if (res.data.data && res.data.data.schoolId) {
              // 如果在data对象中
              schoolId = res.data.data.schoolId || res.data.data.school;
            }
            
            // 确保 schoolId 是数字类型
            if (schoolId !== null && schoolId !== undefined) {
              schoolId = parseInt(schoolId);
              schoolName = this.getSchoolNameById(schoolId);
              
              this.setData({
                userSchoolId: schoolId,
                userSchool: schoolName
              });
              
              // 缓存用户学校信息
              wx.setStorageSync('userSchoolId', schoolId);
              wx.setStorageSync('userSchool', schoolName);
              
              console.log('用户学校信息设置成功:', { schoolId, schoolName });
              resolve({ schoolId, schoolName });
            } else {
              // 如果无法获取学校ID，使用默认值
              console.warn('无法从接口获取学校ID，使用默认值。接口返回:', res.data);
              const defaultSchoolId = 1;
              const defaultSchoolName = this.getSchoolNameById(defaultSchoolId);
              
              this.setData({
                userSchoolId: defaultSchoolId,
                userSchool: defaultSchoolName
              });
              
              resolve({ schoolId: defaultSchoolId, schoolName: defaultSchoolName });
            }
          } else if (res.statusCode === 401) {
            this.handleAuthError();
            reject('认证失败');
          } else {
            console.warn('获取学校信息失败，响应状态:', res.statusCode);
            reject('获取学校信息失败');
          }
        },
        fail: (err) => {
          console.error('获取用户学校信息失败:', err);
          reject('网络请求失败');
        }
      });
    });
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    if (!this.checkLoginStatus()) {
      return;
    }
    
    // 先获取用户学校信息，然后加载所有项目的第一页
    this.getUserSchool().then(() => {
      console.log('用户学校信息获取成功，开始加载项目列表');
      this.loadAllProjects(true);
    }).catch((err) => {
      console.error('获取用户学校信息失败:', err);
      // 即使获取学校信息失败，也要加载所有项目
      this.loadAllProjects(true);
    });
  },

  /**
   * 页面显示时
   */
  onShow() {
    const token = wx.getStorageSync('token');
    if (token && this.data.allProjectList.length === 0) {
      this.getUserSchool().then(() => {
        this.loadAllProjects(true);
      }).catch(() => {
        this.loadAllProjects(true);
      });
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
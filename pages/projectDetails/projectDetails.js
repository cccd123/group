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
   * 获取认证头 - 修复版本
   */
  getAuthHeader() {
    const token = wx.getStorageSync('token');
    console.log('获取到的token:', token ? '存在' : '不存在');

    if (token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': token
      };
    } else {
      // 如果没有token，提示用户登录
      this.showLoginPrompt();
      return {
        'Content-Type': 'application/json'
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

    console.log('开始获取项目详情，项目ID:', this.data.projectId);
   //查看当前的项目id是否存在
   http.get('/project/projectById/'+this.data.projectId).then(res => {
    console.log("==================================>");
	console.log(res);
	const educationRequirement = this.formatEducationRequirement(res.data.educationRequirement);
	console.log('after convertion, education requirement:\n', educationRequirement);
    this.setData({
	  project: res.data,
	  educationRequirement,
      direction: this.formatDirection(res.data.direction)
    })
  })
    // // 方法1: 尝试直接调用项目列表API，不传school参数
    // wx.request({
    //   url: 'https://zhaoxiaokai.xyz/project/allproject',
    //   method: 'GET',
    //   header: this.getAuthHeader(),
    //   data: {
    //     pageNum: 1,
    //     pageSize: 100
    //     // 不传school参数，避免类型转换错误
    //   },
    //   success: (res) => {
    //     console.log('获取项目列表响应:', res);

    //     if (res.statusCode === 200) {
    //       // 检查响应数据结构
    //       if (res.data && res.data.code === 200) {
    //         // 成功响应
    //         this.parseProjectData(res.data);
    //       } else if (res.data && res.data.code === 500) {
    //         // 服务器错误，尝试备用方案
    //         console.log('方法1失败，尝试备用方案');
    //         this.getProjectDetailsBackup();
    //       } else {
    //         // 其他错误
    //         console.log('API返回错误:', res.data);
    //         this.handleError(res.data?.message || '获取项目详情失败');
    //       }
    //     } else if (res.statusCode === 401) {
    //       this.handleAuthError();
    //     } else {
    //       console.log('请求失败，状态码:', res.statusCode);
    //       this.handleError('获取项目详情失败');
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('获取项目详情失败:', err);
    //     this.getProjectDetailsBackup();
    //   }
    // });
  },

  /**
   * 备用方案：尝试不同的参数组合
   */
  // getProjectDetailsBackup() {
  //   console.log('使用备用方案获取项目详情');

  //   // 尝试完全不传参数的请求
  //   wx.request({
  //     url: 'https://zhaoxiaokai.xyz/project/allproject',
  //     method: 'GET',
  //     header: this.getAuthHeader(),
  //     // 不传任何参数
  //     success: (res) => {
  //       console.log('备用方案响应:', res);

  //       if (res.statusCode === 200 && res.data) {
  //         if (res.data.code === 200) {
  //           this.parseProjectData(res.data);
  //         } else {
  //           this.handleError(res.data?.message || '获取项目详情失败');
  //         }
  //       } else {
  //         this.handleError('获取项目详情失败');
  //       }
  //     },
  //     fail: (err) => {
  //       console.error('备用方案也失败:', err);
  //       this.handleError('网络错误，请重试');
  //     }
  //   });
  // },

  /**
   * 解析项目数据
   */
  // parseProjectData(responseData) {
  //   console.log('开始解析项目数据:', responseData);

  //   let projectList = [];

  //   // 根据lookFor.js的成功经验，检查data.items字段
  //   if (responseData.data && responseData.data.items) {
  //     projectList = responseData.data.items;
  //     console.log('使用 data.items 作为项目列表');
  //   } else if (responseData.data && Array.isArray(responseData.data)) {
  //     projectList = responseData.data;
  //     console.log('使用 data 作为项目列表');
  //   } else if (responseData.items) {
  //     projectList = responseData.items;
  //     console.log('使用 items 作为项目列表');
  //   } else if (Array.isArray(responseData)) {
  //     projectList = responseData;
  //     console.log('直接使用响应数据作为项目列表');
  //   }

  //   console.log('解析得到的项目列表:', projectList);
  //   console.log('项目列表长度:', projectList.length);

  //   if (projectList.length === 0) {
  //     this.handleError('暂无项目数据');
  //     return;
  //   }

  //   // 查找目标项目
  //   const targetProject = projectList.find(project => {
  //     console.log('检查项目:', project);
  //     // 多种ID匹配方式
  //     const projectId = project.id || project.projectId;
  //     const targetId = this.data.projectId;

  //     return projectId == targetId ||
  //       parseInt(projectId) === parseInt(targetId) ||
  //       String(projectId) === String(targetId);
  //   });

  //   console.log('找到的目标项目:', targetProject);

  //   if (targetProject) {
  //     // 处理项目数据
  //     const processedProject = this.processProjectData(targetProject);

  //     this.setData({
  //       projectDetails: processedProject,
  //       loading: false
  //     });

  //     console.log('项目详情设置完成:', processedProject);
  //   } else {
  //     console.log('未找到对应ID的项目, 目标ID:', this.data.projectId);
  //     this.handleError('未找到对应的项目信息');
  //   }
  // },

  /**
   * 处理项目数据映射
   */
  // processProjectData(project) {
  //   return {
  //     id: project.id || project.projectId,
  //     projectName: project.projectName || project.name || '未知项目',
  //     projectDescription: project.projectInfo || project.projectDescription || project.description || '暂无描述',
  //     projectDetail: project.skillDetails || project.projectDetail || project.detail || '暂无详细信息',
  //     teamSize: project.teamSize || project.expectedSize || project.maxMembers || '未知',
  //     crossSchool: this.formatCrossSchool(project.crossSchool),
  //     school: project.school || project.schoolName || '未知学校',
  //     requirement: this.formatEducationRequirement(project.educationRequirement),
  //     detailRequirement: project.skillSummary || project.detailRequirement || project.requirements || '暂无详细要求',
  //     flexible: project.emailPromotion || false,
  //     direction: this.formatDirection(project.direction),
  //     // 保留原始数据
  //     ...project
  //   };
  // },

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
    wx.request({
      url: `https://zhaoxiaokai.xyz/project/join?id=${this.data.projectId}`,
      method: 'POST',
      header: this.getAuthHeader(),
      // 根据API文档，可能需要form-data格式的body参数
      data: {
        direction: this.data.direction // 如果API需要方向参数
      },
      success: (res) => {
        wx.hideLoading();
        console.log('投递项目响应:', res);

        if (res.statusCode === 200) {
          // 检查响应数据
          if (res.data && res.data.code === 200) {
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
          } else {
            // API返回错误
            const errorMessage = res.data?.message || res.data?.msg || '投递失败';
            wx.showToast({
              title: errorMessage,
              icon: 'error',
              duration: 2000
            });
          }
        } else if (res.statusCode === 401) {
          this.handleAuthError();
        } else {
          // 服务器返回错误状态码
          const errorMessage = res.data?.message || res.data?.msg || '投递失败';
          wx.showToast({
            title: errorMessage,
            icon: 'error',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('投递项目失败:', err);
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
      url: `https://zhaoxiaokai.xyz/project/checkJoin/${this.data.projectId}`,
      method: 'GET',
      header: this.getAuthHeader(),
      success: (res) => {
        console.log('检查参与状态响应:', res);
        if (res.statusCode === 200 && res.data) {
          if (res.data.code === 200) {
            this.setData({
              hasJoined: res.data.data || res.data.hasJoined || false
            });
          }
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
// pages/myTeam/myTeam.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    projectList: [], // 存储项目列表
    loading: false,  // 加载状态
  },

  // 获取我的项目列表
  getMyProjects() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }

    this.setData({
      loading: true
    });

    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 尝试多个可能的API端点
    const apiEndpoints = [
      'http://114.55.85.236:8080/project/projectinfo',
    ];

    wx.request({
      url: apiEndpoints[0], // 先尝试第一个API
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      },
      success: (res) => {
        console.log('API响应完整数据：', res);
        console.log('响应状态码：', res.statusCode);
        console.log('响应数据：', res.data);
        
        // 更灵活的成功判断
        if (res.statusCode === 200) {
          let projectData = [];
          
          // 处理不同的响应格式
          if (res.data) {
            if (res.data.success && res.data.data) {
              projectData = res.data.data;
            } else if (res.data.code === 200 && res.data.data) {
              projectData = res.data.data;
            } else if (Array.isArray(res.data)) {
              projectData = res.data;
            } else if (res.data.list) {
              projectData = res.data.list;
            } else if (res.data.projects) {
              projectData = res.data.projects;
            }
          }
          
          console.log('处理后的项目数据：', projectData);
          
          if (Array.isArray(projectData) && projectData.length > 0) {
            // 处理项目数据，添加状态转换
            const processedProjects = projectData.map(project => {
              console.log('处理单个项目：', project);
              return {
                ...project,
                statusText: this.getStatusText(project.status),
                educationText: this.getEducationText(project.educationRequirement),
                directionText: this.getDirectionText(project.direction),
                isActive: project.status === 1 || project.status === undefined // 默认为活跃状态
              };
            });
            
            this.setData({
              projectList: processedProjects
            });
            
            console.log('设置的项目列表：', processedProjects);
          } else {
            console.log('没有找到项目数据或数据为空');
            this.setData({
              projectList: []
            });
          }
        } else {
          console.log('API响应状态码不是200：', res.statusCode);
          wx.showToast({
            title: `请求失败: ${res.statusCode}`,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取项目列表失败：', err);
        // 如果第一个API失败，尝试其他端点
        this.tryAlternativeEndpoints(apiEndpoints.slice(1), token);
      },
      complete: () => {
        wx.hideLoading();
        this.setData({
          loading: false
        });
      }
    });
  },

  // 尝试其他API端点
  tryAlternativeEndpoints(endpoints, token) {
    if (endpoints.length === 0) {
      wx.showToast({
        title: '所有API端点都失败了',
        icon: 'none'
      });
      return;
    }

    const currentEndpoint = endpoints[0];
    console.log('尝试备用API端点：', currentEndpoint);

    wx.request({
      url: currentEndpoint,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      },
      success: (res) => {
        console.log(`备用API ${currentEndpoint} 响应：`, res);
        // 使用相同的处理逻辑
        this.handleProjectResponse(res);
      },
      fail: (err) => {
        console.error(`备用API ${currentEndpoint} 失败：`, err);
        // 尝试下一个端点
        this.tryAlternativeEndpoints(endpoints.slice(1), token);
      }
    });
  },

  // 处理项目响应的通用方法
  handleProjectResponse(res) {
    if (res.statusCode === 200 && res.data) {
      let projectData = [];
      
      if (res.data.success && res.data.data) {
        projectData = res.data.data;
      } else if (Array.isArray(res.data)) {
        projectData = res.data;
      }
      
      if (Array.isArray(projectData)) {
        const processedProjects = projectData.map(project => ({
          ...project,
          statusText: this.getStatusText(project.status),
          educationText: this.getEducationText(project.educationRequirement),
          directionText: this.getDirectionText(project.direction),
          isActive: project.status === 1 || project.status === undefined
        }));
        
        this.setData({
          projectList: processedProjects
        });
      }
    }
  },

  // 获取状态文本
  getStatusText(status) {
    switch(status) {
      case 1:
        return '推送中';
      case 0:
        return '已下架';
      default:
        return '未知状态';
    }
  },

  // 获取学历要求文本
  getEducationText(educationRequirement) {
    switch(educationRequirement) {
      case 1:
        return '大专';
      case 2:
        return '本科';
      case 3:
        return '研究生';
      default:
        return '不限';
    }
  },

  // 获取方向文本
  getDirectionText(direction) {
    switch(direction) {
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

  // 下架项目
  takeDownProject(e) {
    const projectId = e.currentTarget.dataset.projectId;
    const projectIndex = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认下架',
      content: '确定要下架这个项目吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateProjectStatus(projectId, 0, projectIndex);
        }
      }
    });
  },

  // 重新上架项目
  reactivateProject(e) {
    const projectId = e.currentTarget.dataset.projectId;
    const projectIndex = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认上架',
      content: '确定要重新上架这个项目吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateProjectStatus(projectId, 1, projectIndex);
        }
      }
    });
  },

  // 更新项目状态
  updateProjectStatus(projectId, status, projectIndex) {
    const token = wx.getStorageSync('token');
    
    wx.showLoading({
      title: status === 1 ? '上架中...' : '下架中...',
      mask: true
    });

    wx.request({
      url: `http://114.55.85.236:8080/project/update-status`, // 根据您的实际API调整
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      },
      data: {
        projectId: projectId,
        status: status
      },
      success: (res) => {
        console.log('更新状态成功：', res);
        
        if (res.statusCode === 200 && res.data.success) {
          // 本地更新数据
          const updatedProjects = [...this.data.projectList];
          updatedProjects[projectIndex].status = status;
          updatedProjects[projectIndex].statusText = this.getStatusText(status);
          updatedProjects[projectIndex].isActive = status === 1;
          
          this.setData({
            projectList: updatedProjects
          });
          
          wx.showToast({
            title: status === 1 ? '上架成功' : '下架成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('更新状态失败：', err);
        wx.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 筛选功能
  filtrate(e) {
    const projectId = e.currentTarget.dataset.projectId;
    wx.navigateTo({
      url: `/pages/filtrate/filtrate?projectId=${projectId}`,
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.getMyProjects();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getMyProjects();
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
    // 每次显示页面时刷新数据，以便显示最新创建的项目
    this.getMyProjects();
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
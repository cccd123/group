// pages/interested/interested.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    projectList: [], // 存储项目列表数据
    
    // 分页相关数据
    pageInfo: {
      pageNum: 1,
      pageSize: 10,
      hasMore: true,
      loading: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态并加载数据
    if (this.checkLoginStatus()) {
      this.loadProjectData(true);
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
            wx.redirectTo({
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
   * 加载项目数据（用户已投递的项目）
   * @param {boolean} refresh - 是否刷新（重置页码）
   */
  loadProjectData(refresh = false) {
    const pageInfo = this.data.pageInfo;
    
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
      'pageInfo.loading': true
    });

    wx.showLoading({
      title: '加载中...',
    });

    // 构造请求参数
    const requestData = {
      pageNum: pageInfo.pageNum.toString(),
      pageSize: pageInfo.pageSize.toString()
    };

    // 调试信息：打印请求详情
    console.log('=== API请求调试信息 ===');
    console.log('请求URL:', 'http://114.55.85.236:8080/project/queryApplicationProject');
    console.log('请求方法:', 'GET');
    console.log('请求参数:', requestData);
    console.log('请求头:', this.getAuthHeader());
    console.log('========================');

    wx.request({
      url: 'https://zhaoxiaokai.xyz/project/queryApplicationProject',
      method: 'GET',
      data: requestData,
      header: this.getAuthHeader(),
      success: (res) => {
        wx.hideLoading();
        
        // 详细的响应调试信息
        console.log('=== API响应调试信息 ===');
        console.log('响应状态码:', res.statusCode);
        console.log('响应头:', res.header);
        console.log('响应数据:', res.data);
        console.log('响应数据类型:', typeof res.data);
        console.log('========================');
        
        // 特别处理500错误
        if (res.statusCode === 500) {
          console.error('500错误详情:', res.data);
          this.handleApiError(res.data);
          return;
        }
        
        if (res.statusCode === 200 && res.data) {
          if (res.data.code === 200) {
            // 根据你提供的API响应结构解析数据
            const responseData = res.data.data || [];
            console.log('解析后的responseData:', responseData);
            
            // 处理数据结构 - 根据你提供的格式
            let newProjects = [];
            if (Array.isArray(responseData)) {
              newProjects = responseData.map((item, index) => {
                // 获取项目信息
                const project = item.project || {};
                
                return {
                  // 申请记录的ID（用于撤销操作）
                  id: item.id || index,
                  
                  // 项目基本信息
                  projectId: project.id,
                  projectName: project.projectName || '未知项目',
                  projectInfo: project.projectInfo || '',
                  school: project.school || '',
                  direction: project.direction || '',
                  memberCount: project.memberCount || 0,
                  crossSchool: project.crossSchool === 1, // 转换为布尔值
                  educationRequirement: project.educationRequirement || '',
                  skillSummary: project.skillSummary || '',
                  skillDetails: project.skillDetails || '',
                  createdAt: project.createdAt || '',
                  updatedAt: project.updatedAt || '',
                  emailPromotion: project.emailPromotion || false,
                  creatorOpenid: project.creatorOpenid || '',
                  
                  // 审核状态相关 - 关键修改点
                  isApproved: item.isApproved, // 0=未审核，1=通过，2=拒绝
                  approveReason: item.approveReason || '', // 审核原因/备注
                  approveTime: item.approveTime || '', // 审核时间
                  
                  // 添加状态标识，方便页面显示
                  statusText: this.getStatusText(item.isApproved),
                  statusColor: this.getStatusColor(item.isApproved),
                  
                  // 添加是否可撤销标识 - 只有未审核状态可以撤销
                  canWithdraw: item.isApproved === 0
                };
              });
            }
            
            console.log('解析得到的项目列表:', newProjects);
            console.log('项目列表长度:', newProjects.length);
            
            // 处理分页
            const currentPage = pageInfo.pageNum;
            
            let updatedList;
            if (refresh) {
              // 刷新时替换整个列表
              updatedList = newProjects;
            } else {
              // 加载更多时追加到列表
              updatedList = [...this.data.projectList, ...newProjects];
            }

            this.setData({
              projectList: updatedList,
              'pageInfo.pageNum': currentPage + 1,
              'pageInfo.hasMore': newProjects.length >= pageInfo.pageSize, // 如果返回的数据量等于页面大小，可能还有更多
              'pageInfo.loading': false
            });

            // 刷新时停止下拉刷新
            if (refresh) {
              wx.stopPullDownRefresh();
            }
          } else {
            this.handleLoadError(res.data.message || '获取数据失败');
          }
        } else if (res.statusCode === 401) {
          this.handleAuthError();
        } else {
          this.handleLoadError(`请求失败，状态码: ${res.statusCode}`);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('=== 请求失败调试信息 ===');
        console.error('错误对象:', err);
        console.error('错误类型:', typeof err);
        console.error('=========================');
        this.handleLoadError('网络连接异常，请重试');
      }
    });
  },

  /**
   * 处理API错误（新增）
   */
  handleApiError(errorData) {
    this.setData({
      'pageInfo.loading': false
    });
    
    const errorMessage = errorData?.message || '服务器错误';
    
    // 特别处理"No static resource"错误
    if (errorMessage.includes('No static resource')) {
      wx.showModal({
        title: 'API配置错误',
        content: `后端接口未配置或路径错误:\n${errorMessage}\n\n请联系开发人员检查后端API配置`,
        showCancel: false,
        confirmText: '我知道了'
      });
    } else {
      wx.showModal({
        title: '服务器错误',
        content: errorMessage,
        showCancel: false,
        confirmText: '确定'
      });
    }
    
    wx.stopPullDownRefresh();
  },

  /**
   * 处理认证错误
   */
  handleAuthError() {
    this.setData({
      'pageInfo.loading': false
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
          wx.redirectTo({
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
      'pageInfo.loading': false
    });
    
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    });
    
    wx.stopPullDownRefresh();
  },

  /**
   * 获取审核状态文本
   */
  getStatusText(isApproved) {
    switch(isApproved) {
      case 0:
        return '待审核';
      case 1:
        return '已通过';
      case 2:
        return '已拒绝';
      default:
        return '未知状态';
    }
  },

  /**
   * 获取状态颜色
   */
  getStatusColor(isApproved) {
    switch(isApproved) {
      case 0:
        return '#1890ff'; // 蓝色 - 待审核
      case 1:
        return '#52c41a'; // 绿色 - 已通过
      case 2:
        return '#ff4d4f'; // 红色 - 已拒绝
      default:
        return '#666666'; // 灰色 - 未知
    }
  },

  /**
   * 查看审核结果详情
   */
  viewApprovalDetail(e) {
    const item = e.currentTarget.dataset.item;
    
    if (!item) {
      wx.showToast({
        title: '数据错误',
        icon: 'error'
      });
      return;
    }

    const status = item.isApproved;
    const statusText = this.getStatusText(status);
    const approveReason = item.approveReason || '';
    const approveTime = item.approveTime || '';

    let content = `项目名称：${item.projectName}\n审核状态：${statusText}`;
    
    // 如果有审核时间，添加到内容中
    if (approveTime) {
      content += `\n审核时间：${approveTime}`;
    }
    
    // 如果有审核原因/备注，添加到内容中
    if (approveReason) {
      if (status === 1) {
        content += `\n通过原因：${approveReason}`;
      } else if (status === 2) {
        content += `\n拒绝原因：${approveReason}`;
      } else {
        content += `\n备注：${approveReason}`;
      }
    }

    wx.showModal({
      title: '审核详情',
      content: content,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 撤销申请（只有未审核状态可以撤销）
   */
  withdrawApplication(e) {
    const projectId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const item = this.data.projectList[index];
    
    if (!this.checkLoginStatus()) {
      return;
    }
    
    // 检查是否可以撤销 - 只有未审核状态（isApproved === 0）可以撤销
    if (item.isApproved !== 0) {
      let message = '';
      switch(item.isApproved) {
        case 1:
          message = '申请已通过，无法撤销';
          break;
        case 2:
          message = '申请已被拒绝，无法撤销';
          break;
        default:
          message = '当前状态无法撤销';
      }
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    wx.showModal({
      title: '确认撤销',
      content: '确定要撤销这个项目申请吗？撤销后将无法恢复。',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '撤销中...',
          });

          wx.request({
            url: `https://zhaoxiaokai.xyz/project/projectjoin/${projectId}`,
            method: 'DELETE',
            header: this.getAuthHeader(),
            success: (res) => {
              wx.hideLoading();
              if (res.statusCode === 200 && res.data.code === 200) {
                // 撤销成功，从本地数据中移除
                let projectList = this.data.projectList;
                projectList.splice(index, 1);
                this.setData({
                  projectList: projectList
                });
                wx.showToast({
                  title: '撤销成功',
                  icon: 'success'
                });
              } else {
                wx.showModal({
                  title: '撤销失败',
                  content: res.data.message || '撤销失败，请重试',
                  showCancel: false
                });
              }
            },
            fail: (err) => {
              wx.hideLoading();
              wx.showModal({
                title: '撤销失败',
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
   * 联系项目创建者（只有审核通过的项目可以联系）
   */
  contactCreator(e) {
    const item = e.currentTarget.dataset.item;
    
    if (item.isApproved !== 1) {
      wx.showToast({
        title: '申请未通过，暂无法联系',
        icon: 'none'
      });
      return;
    }

    wx.showActionSheet({
      itemList: ['复制项目信息', '查看项目详情'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 复制项目信息
          const projectInfo = `项目名称：${item.projectName}\n项目介绍：${item.projectInfo}\n学校：${item.school}\n方向：${item.direction}`;
          wx.setClipboardData({
            data: projectInfo,
            success: () => {
              wx.showToast({
                title: '已复制到剪贴板',
                icon: 'success'
              });
            }
          });
        } else if (res.tapIndex === 1) {
          // 查看项目详情
          this.viewProjectDetail(e);
        }
      }
    });
  },

  /**
   * 查看项目详情
   */
  viewProjectDetail(e) {
    const item = e.currentTarget.dataset.item;
    
    const content = `项目名称：${item.projectName}
项目介绍：${item.projectInfo}
学校：${item.school}
方向：${item.direction}
成员数量：${item.memberCount}
跨校合作：${item.crossSchool ? '是' : '否'}
学历要求：${item.educationRequirement}
技能要求：${item.skillSummary}`;

    wx.showModal({
      title: '项目详情',
      content: content,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 测试API连接（调试方法）
   */
  testApiConnection() {
    console.log('开始测试API连接...');
    
    // 简单的ping测试
    wx.request({
      url: 'https://zhaoxiaokai.xyz/',  // 测试根路径
      method: 'GET',
      success: (res) => {
        console.log('根路径测试结果:', res);
        wx.showToast({
          title: '服务器连接正常',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('根路径测试失败:', err);
        wx.showToast({
          title: '服务器连接失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 页面显示时
   */
  onShow() {
    // 可以在这里刷新数据（比如从其他页面返回时）
    const token = wx.getStorageSync('token');
    if (token && this.data.projectList.length === 0) {
      this.loadProjectData(true);
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadProjectData(true);
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    console.log('上拉加载更多');
    this.loadProjectData(false);
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
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
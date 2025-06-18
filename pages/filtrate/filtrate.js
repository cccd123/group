//  filtrate.js 文件
Page({
  data: {
    state: '1',
    applicantList: [],
    loading: false,
    projectId: null // 添加项目ID存储
  },

  // 修改 onLoad 方法，获取传递的项目ID
  onLoad(options) {
    console.log('filtrate页面接收到的参数：', options);
    if (options.projectId) {
      this.setData({
        projectId: options.projectId
      });
      this.loadApplicantList();
    } else {
      wx.showToast({
        title: '项目ID缺失',
        icon: 'none'
      });
    }
  },

  // 修改 loadApplicantList 方法
  loadApplicantList() {
    const token = wx.getStorageSync('token');
    const projectId = this.data.projectId;
    
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    if (!projectId) {
      wx.showToast({
        title: '项目ID缺失',
        icon: 'none'
      });
      return;
    }

    this.setData({
      loading: true
    });

    // 根据状态映射到对应的接口参数
    let status;
    switch (this.data.state) {
      case '1': // 未筛选
        status = 0; // 待审核状态 - 改为数字类型
        break;
      case '2': // 通过
        status = 1; // 通过状态 - 改为数字类型
        break;
      case '3': // 拒绝
        status = 2; // 拒绝状态 - 改为数字类型
        break;
      default:
        status = 0;
    }

    console.log('请求申请人列表，项目ID：', projectId, '状态：', status);

    // 修改请求方式，先不带状态参数，获取所有数据来调试
    wx.request({
      url: `https://zhaoxiaokai.xyz/project/projectjoin/${projectId}`, // 先移除状态参数
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      },
      success: (res) => {
        console.log('申请人列表API响应：', res);
        console.log('API返回的完整数据结构：', JSON.stringify(res.data, null, 2));
        
        if (res.statusCode === 200) {
          let applicantData = [];
          
          // 处理不同的响应格式
          if (res.data) {
            if (res.data.data && Array.isArray(res.data.data)) {
              applicantData = res.data.data;
              console.log('使用 res.data.data 路径，原始数据：', applicantData);
            } else if (Array.isArray(res.data)) {
              applicantData = res.data;
              console.log('使用 res.data 路径，原始数据：', applicantData);
            } else if (res.data.list && Array.isArray(res.data.list)) {
              applicantData = res.data.list;
              console.log('使用 res.data.list 路径，原始数据：', applicantData);
            } else {
              console.log('未找到数组数据，完整响应：', res.data);
            }
          }
          
          // 如果有数据，先显示原始数据的状态字段信息
          if (applicantData.length > 0) {
            console.log('第一条数据的状态信息：', {
              status: applicantData[0].status,
              state: applicantData[0].state,
              所有字段: Object.keys(applicantData[0])
            });
          }
          
          // 临时移除状态过滤，先显示所有数据
          // applicantData = applicantData.filter(item => {
          //   // 根据实际后端返回的状态字段名进行过滤
          //   // 假设后端返回的状态字段是 status 或 state
          //   const itemStatus = item.status !== undefined ? item.status : item.state;
          //   return itemStatus === status;
          // });
          
          console.log('处理后的申请人数据：', applicantData);
          
          this.setData({
            applicantList: applicantData,
            loading: false
          });
          
          if (applicantData.length === 0) {
            const statusText = this.data.state === '1' ? '未审核' : (this.data.state === '2' ? '已通过' : '已拒绝');
            wx.showToast({
              title: `暂无${statusText}申请人`,
              icon: 'none'
            });
          }
        } else {
          console.log('API响应状态码不是200：', res.statusCode);
          wx.showToast({
            title: `加载失败: ${res.statusCode}`,
            icon: 'none'
          });
          this.setData({
            loading: false
          });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        this.setData({
          loading: false
        });
      }
    });
  },

  // 修改 processApproval 方法，确保状态更新后正确刷新
  processApproval(applicantId, status) {
    const token = wx.getStorageSync('token');
    const projectId = this.data.projectId;
      
    // 显示加载状态
    wx.showLoading({
      title: '处理中...',
      mask: true
    });

    wx.request({
      url: 'https://zhaoxiaokai.xyz/project/approve',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      },
      data: {
        projectid: projectId, // 使用实际项目ID
        id: applicantId,
        status: parseInt(status) // 确保是数字类型
      },
      success: (res) => {
        wx.hideLoading(); // 隐藏加载状态
        console.log('审批操作响应：', res);
        if (res.statusCode === 200) {
          const actionText = status === '1' ? '通过' : '拒绝';
          wx.showToast({
            title: `已${actionText}`,
            icon: 'success'
          });
          
          // 添加震动反馈
          wx.vibrateShort();
          
          // 延迟刷新，确保后端状态已更新
          setTimeout(() => {
            this.loadApplicantList();
          }, 500);
          
        } else {
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading(); // 隐藏加载状态
        console.error('操作失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 标签页切换
  state(e) {
    const state = e.currentTarget.dataset.state;
    console.log('切换到状态：', state);
    this.setData({
      state: state,
      applicantList: [] // 清空当前列表，显示加载状态
    });
    // 延迟一点时间再加载，让用户看到切换效果
    setTimeout(() => {
      this.loadApplicantList();
    }, 100);
  },

  // 处理审批操作（通过/拒绝）
  handleApproval(e) {
    // 阻止事件冒泡
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    
    const applicantId = e.currentTarget.dataset.id;
    const action = e.currentTarget.dataset.action;
    const status = action === 'approve' ? '1' : '2';
    const actionText = action === 'approve' ? '通过' : '拒绝';
    const actionIcon = action === 'approve' ? '✅' : '❌';

    console.log('处理审批操作：', {
      applicantId,
      action,
      status,
      projectId: this.data.projectId
    });

    wx.showModal({
      title: `${actionIcon} 确认${actionText}`,
      content: `确定要${actionText}这个申请吗？此操作不可撤销。`,
      confirmText: `确认${actionText}`,
      confirmColor: action === 'approve' ? '#667eea' : '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          this.processApproval(applicantId, status);
        }
      }
    });
  },

  onShow() {
    if (this.data.projectId) {
      this.loadApplicantList();
    }
  },

  onPullDownRefresh() {
    this.loadApplicantList();
    wx.stopPullDownRefresh();
  }
});

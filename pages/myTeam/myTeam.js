// pages/myTeam/myTeam.js

import http from '../../utils/http';

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
	
	http.get(`/project/projectinfo`)
	.then(res => {
	    // console.log('API响应完整数据：', res);
        // console.log('响应状态码：', res.code);
        // console.log('响应数据：', res.data);
        // console.log("================================>",res);
        // 更灵活的成功判断
        if (res.code === 200) {
			let projectData = [];
			projectData = res.data;
			if (Array.isArray(projectData) && projectData.length > 0) {
			  // 处理项目数据，添加状态转换
			  const processedProjects = projectData.map(project => {
			  //   console.log('处理单个项目：', project);
				return {
				  ...project,
				  id: project.id,
				  statusText: this.getStatusText(project.status),
				  educationText: this.getEducationText(project.educationRequirement),
				  directionText: this.getDirectionText(project.direction),
				  crossSchoolText: this.getCrossSchoolText(project.crossSchool),
				  isEmailPromotion: project.emailPromotion ? 1 : 0,
				  isActive: project.status === 1 || project.status === undefined // 默认为活跃状态
				  // ！！！其实目前后端 /project/projectinfo接口 返回的结果中并没有status字段！！！
				};
			  });
			  
			  this.setData({
				projectList: processedProjects
			  });
			  
			  // 获取每个项目的统计数据
			  this.getProjectStatistics(processedProjects);
			  
			  // console.log('设置的项目列表：', processedProjects);
			} else {
			  console.log('没有找到项目数据或数据为空');
			  this.setData({
				projectList: []
			  });
			}
		  } else {
			console.log('API响应状态码不是200：', res.code);
			wx.showToast({
			  title: `请求失败: ${res.code}`,
			  icon: 'none'
			});
		  }
	})
	.catch(err => {
		console.error('获取项目列表失败：', err);
	})
	.finally(() => {
		wx.hideLoading();
        this.setData({
          loading: false
        });
	});
  },

  /**
   * 跳转到项目详情页面
   */
  projectDetails(e) {
    const projectId = e.currentTarget.dataset.projectId;
    // console.log('跳转到项目详情，项目ID:', projectId);
    
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

  // 获取项目统计数据（阅读量和投递量）
  getProjectStatistics(projects) {    
    projects.forEach((project, index) => {
      // 获取项目的投递量（申请人数量）
      this.getApplicationCount(project.id, index);
      // 获取项目的阅读量（点击量）
      this.getReadCount(project.id, index);
    });
  },

  // 获取申请人数量（投递量）
  getApplicationCount(projectId, projectIndex)
  {
	http.get(`/project/projectjoin/${projectId}`,)
    .then(res => {
		if (res.code === 200 && res.data.length)
		{
			const applicationCount = res.data.length;
			// 更新项目列表中的投递量
			const updatedProjects = [...this.data.projectList];
			if (updatedProjects[projectIndex])
			{
			  updatedProjects[projectIndex].applicationCount = applicationCount;
			  this.setData({
				projectList: updatedProjects
			  });
			}
		}
    })
    .catch(err => {
		console.error('获取申请人数量失败：', err);
    });
  },

  // 获取阅读量（浏览量）
  getReadCount(projectId, projectIndex)
  {
	http.get(`/project/projectById/${projectId}`,)
	.then(res => {
	  if (res.code === 200 && res.data)
	  {
		let readCount = 0;
		readCount = res.data.lookcount;
		// console.log(`项目${projectId}的浏览量：`, readCount);
		// 更新项目列表中的阅读量
        const updatedProjects = [...this.data.projectList];
        if (updatedProjects[projectIndex]) {
          updatedProjects[projectIndex].readCount = readCount;
          this.setData({
            projectList: updatedProjects
          });
        }
	  }
	})
	.catch(err => {
	  console.error(`获取项目${projectId}阅读量失败：`, err);
	  // 如果API失败，设置默认值
	  const updatedProjects = [...this.data.projectList];
	  if (updatedProjects[projectIndex]) {
	    updatedProjects[projectIndex].readCount = 0;
	    this.setData({
	      projectList: updatedProjects
	    });
	  }
	});
  },

  // 获取状态文本
  getStatusText(status) {
    switch(status) {
      case 1:
        return '上线中';
      case 0:
        return '已下架';
      default:
        return '上线中'; // 默认显示上线中
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

  // 获取跨校要求文本
  getCrossSchoolText(crossSchool) {
    switch(crossSchool) {
      case 1:
        return '接受跨校';
      case 0:
        return '仅接受本校';
      default:
        return '仅接受本校';
    }
  },

  // 删除项目（原下架功能）
  performDeleteProject(e) {
    const projectId = e.currentTarget.dataset.projectId;
    const projectIndex = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个项目吗？删除后无法恢复！',
      confirmColor: '#fa5151',
      success: (res) => {
        if (res.confirm) {
          this.executeDeleteProject(projectId, projectIndex);
        }
      }
    });
  },

  // 执行删除项目操作
  executeDeleteProject(projectId, projectIndex) {    
    wx.showLoading({
      title: '删除中...',
      mask: true
    });

	http.post(
	  `/project/delectproject/${projectId}`,
	  {
        projectId: projectId
      },
	)
	.then(res => {
		console.log('删除项目响应：', res);
        
        if (res.code === 200) {
          // 检查不同的成功响应格式
          let isSuccess = (res.data === '删除成功') ? true : false;
		  if (isSuccess)
		  {
            // 从本地列表中移除已删除的项目
            const updatedProjects = [...this.data.projectList];
            updatedProjects.splice(projectIndex, 1);
            
            this.setData({
              projectList: updatedProjects
            });
            
            wx.showToast({
              title: '删除成功',
			  icon: 'success',
			  duration: 1500,
            });
		  }
		  else
		  {
        	wx.showToast({
              title: res.data || '删除失败',
              icon: 'none'
            });
          }
		}
		else
		{
		  wx.showModal({
			title: '',
			content: res.data ? `删除失败: ${res.data}` : `删除失败: ${res.code}`,
			showCancel: false,
			confirmText: '确定',
		  });
        }
	})
	.catch(err => {
	  	console.error('删除项目失败：', err);
		wx.showModal({
			title: '',
			content: res.data ? `删除失败: ${res.data}` : `网络异常，请重试`,
			showCancel: false,
			confirmText: '确定',
		});
	})
	.finally(() => {
		wx.hideLoading();
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
      url: `https://zhaoxiaokai.xyz/project/status/${projectId}`,
      method: 'PUT',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      },
      data: {
        projectId: projectId,
        status: status,
        id: projectId
      },
      success: (res) => {
        console.log('更新状态响应：', res);
        
        if (res.statusCode === 200) {
          let isSuccess = false;
          
          if (res.data) {
            if (res.data.success === true) {
              isSuccess = true;
            } else if (res.data.code === 200) {
              isSuccess = true;
            } else if (res.data.status === 'success') {
              isSuccess = true;
            } else if (!res.data.error && !res.data.message) {
              isSuccess = true;
            }
          } else {
            isSuccess = true;
          }
          
          if (isSuccess) {
            const updatedProjects = [...this.data.projectList];
            if (updatedProjects[projectIndex]) {
              updatedProjects[projectIndex].status = status;
              updatedProjects[projectIndex].statusText = this.getStatusText(status);
              updatedProjects[projectIndex].isActive = status === 1;
              
              this.setData({
                projectList: updatedProjects
              });
            }
            
            wx.showToast({
              title: status === 1 ? '上架成功' : '下架成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: res.data?.message || '操作失败',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: `请求失败: ${res.statusCode}`,
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
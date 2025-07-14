//  filtrate.js 文件
Page({
  data: {
	state: '1',
	stateIndicatorPos: 0,	// 储存已选tab的指示器的位置
    applicantList: [],
    loading: false,
    projectId: null, // 添加项目ID存储
  },

  onLoad(options) {
    // console.log('filtrate页面接收到的参数：', options);
    if (options.projectId) {
      this.setData({
        projectId: parseInt(options.projectId)
      });
      this.loadApplicantList();
    } else {
      wx.showToast({
        title: '项目ID缺失',
        icon: 'none'
      });
    }
  },

  /**
   * 
   * 根据projectId使用接口/project/projectjoin/${projectId}，获取项目的所有申请人，
   * 再根据当前tab的state值，筛选出当前页面要显示的申请人
   */
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

	let state = this.data.state - 1;
	// console.log('local variable state is:\n', state);
    // console.log('请求申请人列表，项目ID：', projectId, '状态：', state);
    wx.request({
      url: `https://zhaoxiaokai.xyz/project/projectjoin/${projectId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': token
      },
      success: (res) => {
        // console.log('申请人列表API响应：', res);
        // console.log('API返回的完整数据结构：', JSON.stringify(res.data, null, 2));
        
        if (res.statusCode === 200) {
          let applicantData = [];
          
          // 处理不同的响应格式
          if (res.data) {
            if (res.data.data && Array.isArray(res.data.data)) {
              applicantData = res.data.data;
            //   console.log('使用 res.data.data 路径，原始数据：', applicantData);
            } else if (Array.isArray(res.data)) {
              applicantData = res.data;
            //   console.log('使用 res.data 路径，原始数据：', applicantData);
            } else if (res.data.list && Array.isArray(res.data.list)) {
              applicantData = res.data.list;
            //   console.log('使用 res.data.list 路径，原始数据：', applicantData);
            } else {
            //   console.log('未找到数组数据，完整响应：', res.data);
            }
          }

		  // 前端根据isApprover（申请状态），筛选申请人列表
          applicantData = applicantData.filter(item => {
            const itemStatus = item.isApprover;
            return itemStatus === state;
		  });
		//   console.log('applicant list after filtrate:\n', applicantData);
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

  // 标签页切换
  state(e) {
	const state = e.currentTarget.dataset.state;
	const stateIndicatorPos = (Number(state) - 1) * 33.33;
	// console.log('切换到状态：', state);
	// console.log('tab indicator位置计算值：', stateIndicatorPos);
    this.setData({
	  state: state,
	  stateIndicatorPos: stateIndicatorPos,
      applicantList: [] // 清空当前列表，显示加载状态
    });
    // 延迟一点时间再加载，让用户看到切换效果
    setTimeout(() => {
      this.loadApplicantList();
    }, 100);
  },

  /**
   * 查看详情：通过传递的pass参数判断是否展示联系方式
   * @param {*} e 
   */
  viewApplicantDetail: function(e)
  {
	// console.log('output e.currentTarget.dataset.applicant, in function viewApplicantDetail:\n', e.currentTarget.dataset.applicant);
	const item = e.currentTarget.dataset.applicant;
	// console.log('contact display:\n', e.currentTarget.dataset.pass);

	const applicantInfo = {
		pass: e.currentTarget.dataset.pass === 'true',
		coverImage: item.coverImage,
		avatarUrl: item.avatarUrl,
		nickname: item.nickname,
		schoolname: item.schoolname,
		introduction: item.introduction,
		major: item.major,
		grade: item.grade,
		persona: item.persona,
		mbti: item.mbti,
		projectOrientation: item.projectOrientation,
		email: item.email,
		phone: item.phone,
	  };
	wx.navigateTo({
		url: `../applicantInfo/applicantInfo?applicantInfo=${encodeURIComponent(JSON.stringify(applicantInfo))}`
	});
  },

  // 处理审批操作（通过/拒绝）
  handleApproval(e) {
    // 阻止事件冒泡
    if (e.stopPropagation) {
      e.stopPropagation();
    }
	
	// console.log('e.currentTarget.dataset in function handleApproval:\n', e.currentTarget.dataset);
    const applicantOpenid = e.currentTarget.dataset.userOpenid;
    const action = e.currentTarget.dataset.action;
    const status = action === 'approve' ? 1 : 2;
    const actionText = action === 'approve' ? '通过' : '拒绝';
    const actionIcon = action === 'approve' ? '✅' : '❌';

    // console.log('处理审批操作：', {
	//   action,
	//   projectId: this.data.projectId,
	//   applicantOpenid,
    //   status,
    // });

    wx.showModal({
      title: `${actionIcon} 确认${actionText}`,
      content: `确定要${actionText}这个申请吗？此操作不可撤销。`,
      confirmText: `确认${actionText}`,
      confirmColor: action === 'approve' ? '#667eea' : '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          this.processApproval(applicantOpenid, status);
        }
      }
    });
  },

  processApproval(applicantOpenid, status) {
    wx.showLoading({
      title: '处理中...',
      mask: true
    });
	const token = wx.getStorageSync('token');
	// console.log('construct request data to plug /project/approve:\n',
	// 			'projectid:\t', this.data.projectId, '\ttype:\t', typeof this.data.projectId, '(projectid要求是数字类型)',
	// 			'\nopenid:\t', applicantOpenid, '\ttype:\t', typeof applicantOpenid, '(openid要求是字符串类型)',
	// 			'\nstatus:\t', status, '\ttype:\t', typeof status, '(status要求是数字类型)');
	wx.request({
	  url: 'https://zhaoxiaokai.xyz/project/approve',
	  method: 'POST',
	  header: {
	  	'content-type': 'application/x-www-form-urlencoded',
	  	'Authorization': token
	  },
	  data: `projectid=${encodeURIComponent(this.data.projectId)}&id=${encodeURIComponent(applicantOpenid)}&status=${encodeURIComponent(status)}`,  
      success: (res) => {
        wx.hideLoading();
        // console.log('审批操作响应：', res);
        if (res.statusCode === 200) {
          const actionText = status === 1 ? '通过' : '拒绝';
          wx.showToast({
            title: `已${actionText}`,
            icon: 'success'
          });
          
          wx.vibrateShort();
          
          // 延迟刷新，确保后端状态已更新
          setTimeout(() => {
			this.loadApplicantList();
			// console.log('after judgement operation, applicantList:\n', this.data.applicantList);
          }, 500);
          
        } else {
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('操作失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
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

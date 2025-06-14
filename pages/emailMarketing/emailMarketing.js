// pages/emailMarketing/emailMarketing.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
	selectProject: 0,
	allProjectList: [],      // 所有组队项目
    filteredProjects: [],    // 当前用户发布的所有组队
	selectedProject: {
		id: '-1',
		name: '',
		info: '',
	  },
	 allPageInfo: {
		pageNum: 1,
		pageSize: 10,
		// hasMore: true,
		// loading: false
	  },

	// 遮罩动画相关
    maskVisible: false,
    maskAnimation: {},
    panelAnimation: {},
	
	// 邮件推广的详细信息存储
	schoolList: [
		{ name: '泉州信息工程学院', count: 1000},
		{ name: '双鸭山大学', count: 1001},
		{ name: '华南区大专', count: 999},
	  ],
	  majorList: [
		{ name: '计算机科学', count: 1200 },
		{ name: '软件工程', count: 800 },
		{ name: '电子工程', count: 950 },
		{ name: '数学与应用数学', count: 600 },
		{ name: '物理学', count: 300 },
		{ name: '网络安全', count: 500 },
		{ name: '人工智能', count: 700 },
		{ name: '数据科学', count: 800 },
		{ name: '机器学习', count: 600 },
		{ name: '软件开发', count: 450 },
	  ],
	  selected: {
		school: { name: '请选择目标学校', code: -1, count: 0 },		// ！！！把数据库中的学校代号与显示关联起来！！！
		major: { name: '请选择目标专业', count: 0 },
	  },
	  isSubmitting: false,
	  showPicker: {
		school: false,
		major: false,
	  },
	  tempSelection: {
		school: null,
		major: null,
	  }
  },

getAuthHeader() {
    const token = wx.getStorageSync('token');
    return token
      ? { 'content-type': 'application/json', 'Authorization': token }
      : { 'content-type': 'application/json' };
},

// 检查用户登录状态
checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面，根据你的实际登录页面路径调整
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return false;
	}
	// this.globalData.userInfo = wx.getStorageSync('userInfo')
	// this.globalData.token = wx.getStorageSync('token')
	// this.globalData.userOpenid = this.globalData.userInfo.openid
    return true;
},

/**
 * 一次性读取完所有项目
 * 并过滤出当前用户发布的组队信息
 */
fetchAllProjectsAll() {
	let allItems = [];
	let pageNum = 1;
	const pageSize = this.data.allPageInfo.pageSize;
  
	const loadPage = () => {
	  return new Promise((resolve, reject) => {
		wx.request({
		  url: 'http://114.55.85.236:8080/project/allproject',
		  method: 'GET',
		  data: {
			pageNum: pageNum.toString(),
			pageSize: pageSize.toString()
		  },
		  header: this.getAuthHeader(),
		  success: (res) => {
			if (res.statusCode !== 200 || !res.data) {
			  return reject(new Error('请求失败或无数据'));
			}
			const resp = res.data.data || res.data;
			const items = resp.items || [];
			const total = resp.total || 0;
			const totalPages = Math.ceil(total / pageSize);
  
			allItems = allItems.concat(items);
  
			if (pageNum < totalPages) {
			  pageNum++;
			  // 递归加载下一页
			  return resolve(loadPage());
			}
			// 所有页都加载完
			resolve();
		  },
		  fail: (err) => reject(err)
		});
	  });
	};
  
	// 返回这个 Promise，链式到 then 里
	return loadPage().then(() => {
	  // 把数据写入 data
	  this.setData({ allProjectList: allItems });
	  const userOpenid = getApp().globalData.userOpenid;
	  const filtered = allItems.filter(item => item.creatorOpenid === userOpenid);
	  // 返回一个 Promise，确保 filteredProjects 写完再继续
	  return new Promise(resolve => {
		this.setData({ filteredProjects: filtered }, resolve);
	  });
	});
  },

/**
 * 根据传入的项目 ID，在 allProjectList 中查找对应项目，
 * 并把它的 projectName、projectInfo 更新到 selectedProject 中。
 * @param {number} targetId 要查找的组队信息的ID
 */
findProjectWithId(targetId) {
	const matches = this.data.allProjectList.filter(item => item.id === targetId);
    if (matches.length > 0) {
      const match = matches[0];
      this.setData({
        'selectedProject.id': match.id,
        'selectedProject.name': match.projectName,
        'selectedProject.info': match.projectInfo
      });
    } else {
		console.error(`未找到 ID 为 ${targetId} 的项目`)
		console.log('在findProjectWithId中，allProjectList为', this.data.allProjectList)
      wx.showToast({
        title: `未找到 ID 为 ${targetId} 的项目`,
        icon: 'none'
      });
    }
},

// 选择项目 按钮的点击事件
onSelectProject() {
    this.setData({ maskVisible: true });

    // 遮罩淡入
    this.maskAnim.opacity(0.5).step();
    // 面板从底部滑入（初始 translateY(100%)）
    this.panelAnim.translateY('-145%').step();

    this.setData({
      maskAnimation: this.maskAnim.export(),
      panelAnimation: this.panelAnim.export()
    });
},

// 重新选择 按钮的点击事件
onResetSelect() {
    // 重置已选项目、状态
    this.setData({
      selectProject: 0,
      selectedProject: { id:'', name:'', info:'' }
    }, () => {
      // 状态重置后再打开选择面板
      this.onSelectProject();
    });
},

// 关闭面板
hideProjectPanel() {
    // 遮罩淡出
    this.maskAnim.opacity(0).step();
    // 面板滑出
    this.panelAnim.translateY('0%').step();

    this.setData({
      maskAnimation: this.maskAnim.export(),
      panelAnimation: this.panelAnim.export()
    });

    // 动画结束后隐藏遮罩
    setTimeout(() => {
      this.setData({ maskVisible: false });
    }, 300);
},

  // 点击面板内“选择项目”
  chooseProject(e) {
    const { id, name, info } = e.currentTarget.dataset;
    this.setData({
      selectedProject: { id, name, info },
      selectProject: 1
    });
    this.hideProjectPanel();
  },

  // 显示学校选择的picker-view
  onSelectSchool() {
    this.setData({
      showPicker: {
        school: true,
        major: false,
      },
      tempSelection: {
        school: this.data.selected.school,
        major: this.data.selected.major
      }
    });
  },

  // 显示专业选择的picker-view
  onSelectMajor() {
    this.setData({
      showPicker: {
        school: false,
        major: true,
      },
      tempSelection: {
        school: this.data.selected.school,
        major: this.data.selected.major
      }
    });
  },

  // 处理学校选择
  onPickerSchoolChange(e) {
    const selectedSchool = this.data.schoolList[e.detail.value[0]];
    this.setData({
      tempSelection: {
        ...this.data.tempSelection,
        school: selectedSchool
      }
    });
  },

  // 处理专业选择
  onPickerMajorChange(e) {
    const selectedMajor = this.data.majorList[e.detail.value[0]];
    this.setData({
      tempSelection: {
        ...this.data.tempSelection,
        major: selectedMajor
      }
    });
  },

  // 确认选择并关闭 picker
  onPickerConfirm() {
    this.setData({
      selected: {
        school: this.data.tempSelection.school || this.data.selected.school,
        major: this.data.tempSelection.major || this.data.selected.major
      },
      showPicker: {
        school: false,
        major: false,
      }
    });
  },

constructDataForAPI()
{
	return {
		openid: app.globalData.userOpenid,
		projectId: this.data.selectedProject.id,
		promotionArrayObject: [
			{
				school: this.data.selected.school.code,
				schoolMajor: this.data.selected.major.name,
			}
		]
	}
},

// 一键推广 按钮点击事件
onSubmit()
{
	// 检查登录状态
    if (!this.checkLoginStatus()) {
		return;
	}
	// ！！！数据填写验证！！！
	// 防止重复提交
    if (this.data.isSubmitting) {
		return;
	}
	  
	this.setData({
		isSubmitting: true
	});
	  
	// 格式化数据
	const requestData = this.constructDataForAPI();

	console.log('提交数据：', requestData);

	// 显示加载提示
    wx.showLoading({
		title: '订单发送中...',
		mask: true
	});
	  
	// 获取token
	const token = wx.getStorageSync('token');
	  
	// 发送请求到后端
	wx.request({
		url: 'http://114.55.85.236:8080/email/promotion',
		method: 'POST',
		header: {
		  'content-type': 'application/json',
		  'Authorization': token // 添加token到请求头
		},
		data: requestData,
		success: (res) => {
		  wx.hideLoading();
		  console.log('订单发送成功：', res);
		  
		  if (res.statusCode === 200) {
			wx.showToast({
			  title: '订单发送成功',
			  icon: 'success',
			  duration: 2000,
			  success: () => {
				// 延迟跳转，让用户看到成功提示
				setTimeout(() => {
				  // 根据你的业务逻辑跳转到相应页面
				  wx.redirectTo({
					url: '../myOrder/myOrder',
				  })
				}, 1500);
			  }
			});
		  } else {
			wx.showToast({
			  title: res.data.message || '订单发送失败',
			  icon: 'none'
			});
		  }
		},
		fail: (err) => {
		  wx.hideLoading();
		  console.error('订单发送失败：', err);
		  wx.showToast({
			title: '网络异常，请重试',
			icon: 'none'
		  });
		},
		complete: () => {
		  this.setData({
			isSubmitting: false
		  });
		}
	});
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
	wx.setNavigationBarTitle({
		title: '邮件推广'
	  });
	// 检查登陆状态
	if (!this.checkLoginStatus()) {
		console.log('尚未登录')
	}
	if (options.projectid) {
		const projectid = options.projectid;
		this.setData({
		  'selectedProject.id': projectid
		});
	}
	// 等 fetchAllProjectsAll 完成后再执行后续逻辑
	this.fetchAllProjectsAll().then(() => {
		console.log('所有组队信息：', this.data.allProjectList);
		console.log('当前用户发布的组队：', this.data.filteredProjects);
		// this.setData({ 'selectedProject.id': 13 });						// test
		if (this.data.selectedProject.id != -1)
		{
			this.findProjectWithId(this.data.selectedProject.id);
			this.setData({ selectProject: 1 });
		}
		// 初始化两段动画
		this.maskAnim = wx.createAnimation({ duration: 300, timingFunction: 'ease' });
		this.panelAnim = wx.createAnimation({ duration: 300, timingFunction: 'ease' });
	  }).catch(err => {
		console.error('加载项目出错：', err);
	});
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

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
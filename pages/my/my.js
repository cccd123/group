import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { userStore } from '../../store/userStore'
import { clearStorage } from '../../utils/storage'
import http from '../../utils/http';

ComponentWithStore({
  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    showOverlay: false,
	manualComplaint: false,
	majorname: '',
	gradename: '',
  },

  storeBindings: {
    store: userStore,
    fields: ['token', 'userInfo', 'schoolName'],
    actions: ['setToken', 'setUserInfo', 'setIsLogin']
  },

  methods: {
    showCustomModal() {
      this.setData({
        showModal: true,
        showOverlay: true
      });
	},
	
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options)
	{
		if (this.data.userInfo.major !== null)
			this.setMajorname();
		if (this.data.userInfo.grade !== null)
			this.setGradename();
	},

	/**
	 * 根据数据项中的major数值，将其转换成majorname
	 */
	setMajorname:function()
	{
		http.get(`/school/getMajorNameById/${this.data.userInfo.major}`)
		.then(res => {
			if (res && res.data && res.data.majorName) {
			this.setData({
				majorname: res.data.majorName,
			});
			} else {
				wx.showToast({
					title: '获取专业名称失败',
					icon: 'none'
				});
				console.log('API响应数据异常:', res);
			}
		})
		.catch(err => {
			console.error('获取专业名称请求失败:', err);
			wx.showToast({
				title: '网络错误',
				icon: 'none'
			});
		});
	},

	/**
	 * 根据数据项中的grade数值，将其转换成gradename
	 */
	setGradename:function()
	{
		let gradename = '';
		switch (this.data.userInfo.grade) {
			case 1:
				gradename = '大一';
				break;
			case 2:
				gradename = '大二';
				break;
			case 3:
				gradename = '大三';
				break;
			case 4:
				gradename = '大四';
				break;
			case 5:
				gradename = '研究生';
				break;
			case 6:
				gradename = '博士';
				break;
			default:
				gradename = '----';
				console.error('grade name convertion error:\nunknown grade number');
				break;
		}
		this.setData({
			gradename,
		});
	},

    //表单反馈
    onFeedback() {
      wx.navigateTo({
        url: '../formFeedback/formFeedback',
      })
    },
    // 人工投诉
    onComplain() {
      this.setData({
        manualComplaint: true,
      });
    },
    onCancel() {
      this.setData({
        showModal: false,
        showOverlay: false
      });
    },
    cancelComplaint() {
      this.setData({
        manualComplaint: false,
      });
	},
	
    myTeam() {
      wx.navigateTo({
        url: '../myTeam/myTeam'
      })
    },

    interested() {
      wx.navigateTo({
        url: '../interested/interested',
      })
	},
	
    servicePeople() {
      wx.navigateTo({
        url: '../servicePeople/servicePeople',
      })
	},
	
    myRedact() {
      wx.navigateTo({
        url: '../myRedact/myRedact',
      })
	},
	
    schoolAccreditation() {
      wx.navigateTo({
        url: '../schoolAccreditation/schoolAccreditation',
      })
	},
	
    logout() {
      clearStorage()
      this.setToken('')
      this.setUserInfo('')
      this.setIsLogin(false)
      // 跳转首页
      wx.reLaunch({
        url: '../index/index',
      })
    }
  }
})

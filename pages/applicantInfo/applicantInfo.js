// pages/applicantInfo/applicantInfo.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
	applicantInfo: {},
	majorname: '',
	gradename: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options)
  {
	const applicantInfo = JSON.parse(decodeURIComponent(options.applicantInfo));
    // console.log('applicant info pass to page applicantInfo:\n', applicantInfo);
	if (applicantInfo.major !== null)
		this.setMajorname(applicantInfo);
	if (applicantInfo.grade !== null)
		this.setGradename(applicantInfo);
    this.setData({
      applicantInfo
    });
  },

  /**
   * 根据数据项中的major数值，将其转换成majorname
   */
  setMajorname:function(applicantInfo)
  {
	const token = wx.getStorageSync('token');
	let majorname = '';
	wx.request({
		url: `https://zhaoxiaokai.xyz/school/getMajorNameById/${applicantInfo.major}`,
		method: 'GET',
		header: {
		  'content-type': 'application/json',
		  'Authorization': token
		},
		success: (res) => {		  
		  if (res.statusCode === 200)
		  {
			majorname = res.data.data.majorName;
			// console.log(`result from plugin /school/getMajorNameById/${applicantInfo.major}:\n`, res);
			// console.log('get major name:\n', majorname, `\nwith plugin /school/getMajorNameById/${applicantInfo.major}`);
			this.setData({
			  majorname,
			});
		  }
		  else
		  {
			console.log('API响应状态码不是200：', res.statusCode);
			wx.showToast({
			  title: `获取专业名称失败: ${res.statusCode}`,
			  icon: 'none'
			});
		  }
		},
		fail: (err) => {
		  console.error('获取专业名称请求失败:', err);
		  wx.showToast({
			title: '网络错误',
			icon: 'none'
		  });
		}
	});
  },

  /**
   * 根据数据项中的grade数值，将其转换成gradename
   */
  setGradename:function(applicantInfo)
  {
	let gradename = '';
	switch (applicantInfo.grade) {
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
})
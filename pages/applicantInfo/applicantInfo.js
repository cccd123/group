// pages/applicantInfo/applicantInfo.ts

import http from '../../utils/http';

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
	http.get(`/school/getMajorNameById/${applicantInfo.major}`)
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
// pages/myRedact/myRedact.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    grades: ['大一', '大二', '大三', '大四', '研究生', '博士生'],
    // 存储MBTI四个维度的选择结果
    traits: ['', '', '', ''],
    directions: ['落地', '获奖', '学习'],
    // MBTI四个维度的选项配置 [字母1, 描述1, 字母2, 描述2]
    mbtiGroups: [
      ['E', '外向', 'I', '内向'],
      ['S', '实感', 'N', '直觉'],
      ['T', '思考', 'F', '情感'],
      ['J', '判断', 'P', '知觉']
    ],
  },
  // 统一处理所有输入变化
  onInputChange(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      [`formData.${name}`]: e.detail.value
    });
  },
  grade(e) {
    const grade = e.currentTarget.dataset.grade
    const old = this.data.formData
    this.setData({
      formData: {
        ...old,
        grade: grade
      }
    })
  },

  direction(e) {
    const direction = e.currentTarget.dataset.direction
    const old = this.data.formData
    this.setData({
      formData: {
        ...old,
        projectOrientation: direction
      }
    })
  },

  // 统一处理所有维度的选择
  handleTraitSelect(e) {
    const { index, trait } = e.currentTarget.dataset;
    const key = `traits[${index}]`;

    this.setData({
      [key]: trait
    });

    // 打印当前MBTI结果
    console.log('当前MBTI:', this.data.traits.join(''));
  },
  // 如果需要获取最终结果的方法
  getMBTIResult() {
    return this.data.traits.join('');
  },
  formatMBTI(mbtiStr) {
    const str = typeof mbtiStr === 'string' ? mbtiStr : '';
    const arr = str.split('');
    while (arr.length < 4) arr.push('');
    return arr.slice(0, 4);
  },

  // 选择头像
  chooseAvatar: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        const tempFilePaths = res.tempFiles[0].tempFilePath;
        that.uploadAvatar(tempFilePaths);
      }
    })
  },
  chooseCover: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        const tempFilePaths = res.tempFiles[0].tempFilePath;
        that.uploadCover(tempFilePaths);
      }
    })
  },
  // 上传封面到服务器
  uploadCover: function (tempFilePath) {
    const that = this;
    wx.showLoading({
      title: '上传中...',
    });

    wx.uploadFile({
      url: `${app.globalData.baseUrl}/user/uploadbg`,
      filePath: tempFilePath,
      name: 'file',
      header: {
        'Authorization': app.globalData.token
      },
      success(res) {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });

            app.refreshUserInfo()
            that.setData({
              'userInfo': wx.getStorageSync('userInfo')
            });

          } else {
            console.error(data)
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      },
      fail(err) {
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        console.error('上传失败:', err);
      }
    });
  },
  // 上传头像到服务器
  uploadAvatar: function (tempFilePath) {
    const that = this;
    wx.showLoading({
      title: '上传中...',
    });

    wx.uploadFile({
      url: `${app.globalData.baseUrl}/user/uploadavatar`,
      filePath: tempFilePath,
      name: 'file',
      header: {
        'Authorization': app.globalData.token
      },
      success(res) {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });

            app.refreshUserInfo()
            that.setData({
              'userInfo': wx.getStorageSync('userInfo')
            });

          } else {
            console.error(data)
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      },
      fail(err) {
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        console.error('上传失败:', err);
      }
    });
  },
  updateInfo(e) {
    const formData = e.detail.value;
    console.log('表单', formData)
    const info = {
      ...app.globalData.userInfo,
      ...formData,
      mbti: this.getMBTIResult(this.data.traits)
    }
    wx.request({
      url: `${app.globalData.baseUrl}/user/update`,
      method: 'POST',
      header: {
        'Authorization': app.globalData.token
      },
      data: info,
      success(res) {
        console.log(res.data)
        app.globalData.userInfo = info
        console.log(app.globalData.userInfo)
        wx.setStorageSync('userInfo', info)
      },
      fail(err) {
        console.error(err)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = app.globalData.userInfo
    this.setData({
      traits: this.formatMBTI(userInfo.mbti),
      formData: {
        nickname: userInfo.nickname,
        school: userInfo.school,
        major: userInfo.major,
        grade: userInfo.grade,
        persona: userInfo.persona, // 人设
        projectOrientation: userInfo.projectOrientation,
        introduction: userInfo.introduction,
      }
    })
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
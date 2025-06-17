import {
  promisifyUploadFile
} from "../../app";
import {
  userBehavior
} from './behavior'
import {
  uploadAvatarService,
  uploadCoverService,
  updateUserInfoService,
  getUserInfoService
} from '../../api/user'
import {
  setStorage
} from '../../utils/storage'

// pages/myRedact/myRedact.js
const app = getApp()
Page({

  // 注册behavior
  behaviors: [userBehavior],

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
    const {
      name
    } = e.currentTarget.dataset;
    this.setData({
      [`formData.${name}`]: e.detail.value
    });
  },
  grade(e) {
    const grade = e.currentTarget.dataset.grade
    console.log('dataset', grade)
    this.setData({
      grade: grade
    })
  },

  direction(e) {
    const direction = e.currentTarget.dataset.direction
    console.log(direction)
    this.setData({
      projectOrientation: direction,
    })
  },

  // 统一处理所有维度的选择
  handleTraitSelect(e) {
    const {
      index,
      trait
    } = e.currentTarget.dataset;
    const key = `traits[${index}]`;

    this.setData({
      [key]: trait
    });
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
  async chooseAvatar(evt) {
    // const that = this;
    // wx.chooseMedia({
    //   count: 1,
    //   mediaType: ['image'],
    //   sourceType: ['album', 'camera'],
    //   maxDuration: 30,
    //   camera: 'back',
    //   success(res) {
    //     const tempFilePaths = res.tempFiles[0].tempFilePath;
    //     that.uploadAvatar(tempFilePaths);
    //   }
    // })
    console.log(evt)
    const {
      avatarUrl
    } = evt.detail;
    const res = await uploadAvatarService(avatarUrl, 'file')
    console.log(res)
    const {
      data
    } = res
    this.setData({
      'userInfo.avatarUrl': data
    })
    console.log(this.data.userInfo)
    // 用户信息更新成功以后，需要将最新的用户信息存储到本地
    setStorage('userInfo', this.data.userInfo)

    // 用户信息更新成功以后，同时同步到store
    this.setUserInfo(this.data.userInfo)
  },
  chooseCover: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: async (res) => {
        const tempFilePaths = res.tempFiles[0].tempFilePath;
        // that.uploadCover(tempFilePaths);
        const result = await uploadCoverService(tempFilePaths, 'file')
        console.log("背景图片上传", result)
        const {
          data
        } = result
        that.setData({
          'userInfo.coverImage': data
        })
        // 用户信息更新成功以后，需要将最新的用户信息存储到本地
        setStorage('userInfo', this.data.userInfo)

        // 用户信息更新成功以后，同时同步到store
        this.setUserInfo(this.data.userInfo)
      }
    })
  },
  // 上传封面到服务器
  // uploadCover: async function (tempFilePath) {
  //   const that = this;
  //   wx.showLoading({
  //     title: '上传中...',
  //   });
  //   try {
  //     const res = await promisifyUploadFile({
  //       url: `${app.globalData.baseUrl}/user/uploadbg`,
  //       filePath: tempFilePath,
  //       name: 'file',
  //       header: {
  //         'Authorization': app.globalData.token
  //       }
  //     });
  //     wx.hideLoading();

  //     if (res.statusCode === 200 && JSON.parse(res.data).code === 200) {
  //       wx.showToast({
  //         title: '上传成功',
  //         icon: 'success'
  //       });
  //       // 更新用户信息
  //       app.refreshUserInfo();
  //     } else {
  //       throw new Error(res.data.message || '上传失败');
  //     }
  //   } catch (error) {
  //     wx.hideLoading();
  //     wx.showToast({
  //       title: error.message || '上传失败',
  //       icon: 'none'
  //     });
  //     console.error('上传失败:', error);
  //   }
  // },

  // 上传头像到服务器
  // uploadAvatar: async function (tempFilePath) {
  //   const that = this;
  //   wx.showLoading({
  //     title: '上传中...',
  //   });

  //   try {
  //     const res = await promisifyUploadFile({
  //       url: `${app.globalData.baseUrl}/user/uploadavatar`,
  //       filePath: tempFilePath,
  //       name: 'file',
  //       header: {
  //         'Authorization': app.globalData.token
  //       }
  //     });
  //     wx.hideLoading();
  //     console.log(res)

  //     if (res.statusCode === 200 && JSON.parse(res.data).code === 200) {
  //       wx.showToast({
  //         title: '上传成功',
  //         icon: 'success'
  //       });
  //       app.refreshUserInfo();
  //     } else {
  //       throw new Error(res.data.message || '上传失败');
  //     }
  //   } catch (error) {
  //     wx.showToast({
  //       title: error.message || '上传失败',
  //       icon: 'none'
  //     });
  //     console.error('上传失败:', error);
  //   }
  // },
  async updateInfo(e) {
    const formData = e.detail.value;
    console.log('表单', formData)
    const info = {
      ...app.globalData.userInfo,
      ...formData,
      grade: this.data.grade,
      mbti: this.getMBTIResult(this.data.traits),
      projectOrientation: this.data.projectOrientation
    }
    console.log('上传 UserProfile', info)
    const res = await updateUserInfoService(info);
    console.log("修改个人信息结果：", res)
    if (res.code === 200) {
      // 获取用户信息
      const {
        data
      } = await getUserInfoService();
      console.log(data)
      // 将用户信息存储到本地
      setStorage('userInfo', data);

      // 将用户信息存储到store对象
      this.setUserInfo(data);

      app.globalData.userInfo = data

      wx.toast({
        title: '用户信息更新成功'
      })
    }
    // wx.request({
    //   url: `${app.globalData.baseUrl}/user/update`,
    //   method: 'POST',
    //   header: {
    //     'Authorization': app.globalData.token
    //   },
    //   data: info,
    //   success(res) {
    //     console.log(res.data)
    //     wx.showToast({
    //       title: '用户信息已更新',
    //       icon: 'success'
    //     })
    //     app.refreshUserInfo()
    //   },
    //   fail(err) {
    //     console.error(err)
    //   }
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let obj = {
      id: this.data.userInfo.school
    }
    let sc 
    //获取学校名称
    wx.request({
      url: `${app.globalData.baseUrl}/school/getSchoolById`,
      method: 'GET',
      header: {
        'Authorization': app.globalData.token
      },
      data:obj,
      success: res => {
        sc=res.data.data.schoolname
  // const userInfo = app.globalData.userInfo
  this.setData({
    traits: this.formatMBTI(this.data.userInfo.mbti),
    formData: {
      nickname: this.data.userInfo.nickname,
      // school: this.data.userInfo.school,
      school: sc,
      major: this.data.userInfo.major,
      persona: this.data.userInfo.persona, // 人设
      introduction: this.data.userInfo.introduction,
    },
    grade: this.data.userInfo.grade,
    projectOrientation: this.data.userInfo.projectOrientation,
  })
        console.log(sc);
      },
      fail(err) {
        console.error(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    //发送请求获取学校数据

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
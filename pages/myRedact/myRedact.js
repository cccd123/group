import { userBehavior } from './behavior'
import { uploadAvatarService, uploadCoverService, updateUserInfoService, getUserInfoService } from '../../api/user'
import { setStorage } from '../../utils/storage'
import { getSchoolByIdService } from '../../api/school'

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
    grade: '',
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
  async updateInfo(e) {
    const formData = e.detail.value;
    console.log('表单', formData)
    const info = {
      ...this.data.userInfo,
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

      const { data: schoolData } = await getSchoolByIdService({ id: data.school })
      console.log(schoolData)
      this.setSchoolName(schoolData.schoolname)

      wx.toast({ title: '用户信息更新成功' })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    //获取学校名称
    // wx.request({
    //   url: `${app.globalData.baseUrl}/school/getSchoolById`,
    //   method: 'GET',
    //   header: {
    //     'Authorization': app.globalData.token
    //   },
    //   data: obj,
    //   success: res => {
    //     sc = res.data.data.schoolname
    //     // const userInfo = app.globalData.userInfo
    //     this.setData({
    //       traits: this.formatMBTI(this.data.userInfo.mbti),
    //       formData: {
    //         nickname: this.data.userInfo.nickname,
    //         // school: this.data.userInfo.school,
    //         school: sc,
    //         major: this.data.userInfo.major,
    //         persona: this.data.userInfo.persona, // 人设
    //         introduction: this.data.userInfo.introduction,
    //       },
    //       grade: this.data.userInfo.grade,
    //       projectOrientation: this.data.userInfo.projectOrientation,
    //     })
    //     console.log(sc);
    //   },
    //   fail(err) {
    //     console.error(err)
    //   }
    // })
    this.setData({
      traits: this.formatMBTI(this.data.userInfo.mbti),
      formData: {
        nickname: this.data.userInfo.nickname,
        major: this.data.userInfo.major,
        persona: this.data.userInfo.persona, // 人设
        introduction: this.data.userInfo.introduction,
      },
      grade: this.data.userInfo.grade,
      projectOrientation: this.data.userInfo.projectOrientation,
    })
  },
})
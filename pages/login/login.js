// pages/login/login.js
const app = getApp();
import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { userStore } from '../../store/userStore'
import { loginService, getUserInfoService, registService } from '../../api/user'
import { setStorage } from '../../utils/storage'
import { getSchoolByIdService } from '../../api/school'
ComponentWithStore({

  // 让页面和store对象建立联系
  storeBindings: {
    store: userStore,
    fields: ['token', 'userInfo', 'isLogin'],
    actions: ['setToken', 'setUserInfo', 'setIsLogin', 'setSchoolName']
  },

  /**
   * 页面的初始数据
   */
  data: {
    login: 1,
    userName: '',
    userPhone: '',
    userEmail: '',
    inSchool: '',
    grade: '',
    schoolMajor: '',
    openid: '',
    access_token: '',
    nokuaizubook: false,
    registed: false, // 是否已经注册
  },

  methods: {
    // 登录首页
    login1() {
      this.setData({
        login: 2
      })
    },

    // 获取昵称
    userName(e) {
      const userName = e.detail.value.trim();
      this.setData({
        userName: userName,
      });
    },
    kuaizubook(e) {
      wx.navigateTo({
        url: '../kuaizubook/kuaizubook',
      })
    },

    //获取手机号码
    async login2() {
      if (!this.data.userName) {
        wx.showToast({
          title: '请输入昵称',
          icon: 'none'
        });
        return;
      }
      // 只是为了获取token，在注册之前要查询学校信息
      const code = (await wx.login()).code
      const res = await loginService(code);
      console.log(res);

      setStorage('token', res.data)
      this.setToken(res.data)

      this.setData({
        login: 3
      });
    },

    // 前端获取微信手机号快捷注册
    getPhoneNumber(e) {
      const code = e.detail.code;
      wx.request({
        url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx1cb9eddd2bef98d5&secret=9c29f450724e1fe2a7c37e10608a1510',
        success: (res) => {
          console.log(res)
          const access_token = res.data.access_token;
          this.setData({
            access_token: access_token
          });
          // // 在获取 access_token 成功后发起第二个请求
          wx.request({
            url: `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
            method: 'POST', // 指定为 POST 方法
            data: {
              code: code // 将 code 作为请求体传递
            },
            success: (res) => {
              console.log(res)
              const phoneNumber = res.data.phone_info.phoneNumber
              console.log(phoneNumber)
              this.setData({
                userPhone: phoneNumber
              })
            },
            fail: (err) => {
              console.error('获取用户手机号失败', err);
            }
          });
        },
        fail: (err) => {
          console.error('获取 access_token 失败', err);
        }
      });
      this.setData({
        login: 4
      });
    },

    // 手机号验证码注册
    getrealtimephonenumber(e) {
      console.log(e.detail.code)
      const code = e.detail.code;
      wx.request({
        url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx1cb9eddd2bef98d5&secret=2802051377f7c9166c7f27e4cae70a9b',
        success: (res) => {
          const access_token = res.data.access_token;
          this.setData({
            access_token: access_token
          });
          // 在获取 access_token 成功后发起第二个请求
          wx.request({
            url: `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
            method: 'POST', // 指定为 POST 方法
            data: {
              code: code // 将 code 作为请求体传递
            },
            success: (res) => {
              console.log(res)
              const phoneNumber = res.data.phone_info.phoneNumber
              console.log(phoneNumber)
              this.setData({
                userPhone: phoneNumber
              })
            },
            fail: (err) => {
              console.error('获取用户手机号失败', err);
            }
          });
        },
        fail: (err) => {
          console.error('获取 access_token 失败', err);
        }
      });
      this.setData({
        login: 4
      });
    },

    // 获取邮件
    userEmail(e) {
      const userEmail = e.detail.value;
      this.setData({
        userEmail: userEmail
      })
    },
    login4() {
      const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!reg.test(this.data.userEmail)) {
        wx.showToast({
          title: '请输入有效邮箱',
          icon: 'none'
        });
        return;
      }
      this.setData({
        login: 5
      })
    },

    onSchoolChange(e) {
      const selectedSchool = e.detail.school;
      console.log('Selected school:', selectedSchool);

      this.setData({
        inSchool: selectedSchool.id
      });
      console.log('Updated inSchool:', this.data.inSchool);
    },

    grade(e) {
      const grade = e.detail.value;
      this.setData({
        grade: grade
      })
    },
    schoolMajor(e) {
      const schoolMajor = e.detail.value;
      this.setData({
        schoolMajor: schoolMajor
      })
    },
    async fastLogin() {
      const code = (await wx.login()).code
      const res = await loginService(code);
      console.log(res);

      setStorage('token', res.data)
      this.setToken(res.data)

      this.getUserInfo();
      this.setIsLogin(true);

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    },

    async getUserInfo() {
      const { data } = await getUserInfoService();

      // 将用户信息存储到本地
      setStorage('userInfo', data);

      // 将用户信息存储到store对象
      this.setUserInfo(data);

      const { data: schoolData } = await getSchoolByIdService({ id: data.school });
      console.log(data, schoolData);
      this.setSchoolName(schoolData.schoolname);
    },

    async handleRegisterAndLogin() {
      const { userName, userPhone, userEmail, inSchool, grade, schoolMajor } = this.data;
      try {
        // 1. 注册逻辑
        if (!this.data.registed) {
          const res = await registService({
            jsCode: (await wx.login()).code,
            phone: userPhone,
            nickname: userName,
            email: userEmail,
            school: inSchool,
            grade: grade,
            major: schoolMajor,
          });
          console.log(res)
          this.setData({ registed: true }); // 同步更新状态
        }
        // 2. 登录逻辑（注册成功后或已注册时执行）
        if (this.data.registed) {
          // 登录并获取用户信息，token等
          this.fastLogin()
        }
      } catch (err) {
        console.error('操作失败:', err);
        wx.showToast({ title: err.data.message, icon: 'none' });
      }
    }
  },
})
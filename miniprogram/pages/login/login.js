// pages/login/login.js
const app = getApp();
import { promisifyRequest } from '../../app'
import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { userStore } from '../../store/userStore'
import { loginService, getUserInfoService } from '../../api/user'
import { setStorage } from '../../utils/storage'
ComponentWithStore({

  // 让页面和store对象建立联系
  storeBindings: {
    store: userStore,
    fields: ['token','userInfo', 'isLogin'],
    actions: ['setToken','setUserInfo', 'setIsLogin']
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
    login2() {
      this.setData({
        login: 3
      });
    },

    // 后端获取微信手机号快捷注册
    // getPhoneNumber(e) {
    //   if (e.detail.code) {
    //     // 将code发送到后端
    //     wx.request({
    //       url: 'http://localhost:3000/getPhoneNumber',
    //       method: 'POST',
    //       data: { code: e.detail.code },
    //       success: (res) => {
    //         const phoneNumber = res.data.phoneNumber
    //         this.setData({
    //           userPhone: phoneNumber
    //         })
    //       },
    //       fail: (err) => {
    //         console.error('请求失败', err)
    //       }
    //     })
    //   } else {
    //     console.error('用户拒绝授权或获取失败', e.detail)
    //   };
    //   this.setData({
    //     login: 4
    //   })
    // },

    // 前端获取微信手机号快捷注册
    getPhoneNumber(e) {
      // const code = e.detail.code;
      // wx.request({
      //   url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx1cb9eddd2bef98d5&secret=2802051377f7c9166c7f27e4cae70a9b',
      //   success: (res) => {
      //     const access_token = res.data.access_token;
      //     this.setData({
      //       access_token: access_token
      //     });
      //     // 在获取 access_token 成功后发起第二个请求
      //     wx.request({
      //       url: `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
      //       method: 'POST', // 指定为 POST 方法
      //       data: {
      //         code: code // 将 code 作为请求体传递
      //       },
      //       success: (res) => {
      //         console.log(res)
      //         const phoneNumber = res.data.phone_info.phoneNumber
      //         console.log(phoneNumber)
      //         this.setData({
      //           userPhone: phoneNumber
      //         })
      //       },
      //       fail: (err) => {
      //         console.error('获取用户手机号失败', err);
      //       }
      //     });
      //   },
      //   fail: (err) => {
      //     console.error('获取 access_token 失败', err);
      //   }
      // });
      this.setData({
        login: 4
      });
    },

    // 手机号验证码注册
    getrealtimephonenumber(e) {
      // console.log(e.detail.code)
      // const code = e.detail.code;
      // wx.request({
      //   url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx1cb9eddd2bef98d5&secret=2802051377f7c9166c7f27e4cae70a9b',
      //   success: (res) => {
      //     const access_token = res.data.access_token;
      //     this.setData({
      //       access_token: access_token
      //     });
      //     // 在获取 access_token 成功后发起第二个请求
      //     wx.request({
      //       url: `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
      //       method: 'POST', // 指定为 POST 方法
      //       data: {
      //         code: code // 将 code 作为请求体传递
      //       },
      //       success: (res) => {
      //         console.log(res)
      //         const phoneNumber = res.data.phone_info.phoneNumber
      //         console.log(phoneNumber)
      //         this.setData({
      //           userPhone: phoneNumber
      //         })
      //       },
      //       fail: (err) => {
      //         console.error('获取用户手机号失败', err);
      //       }
      //     });
      //   },
      //   fail: (err) => {
      //     console.error('获取 access_token 失败', err);
      //   }
      // });
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
      this.setData({
        login: 5
      })
    },

    // 其它信息
    inSchool(e) {
      const inSchool = e.detail.value;
      this.setData({
        inSchool: inSchool
      })
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
      // await app.login()
      const code = (await wx.login()).code
      const res = await loginService(code);
      console.log(res);

      setStorage('token', res.data)
      app.globalData.token = res.data
      this.setToken(res.data)

      this.getUserInfo();
      this.setIsLogin(true);

      wx.navigateBack()
    },

    async getUserInfo() {
      const {data} = await getUserInfoService();

      // 将用户信息存储到本地
      setStorage('userInfo', data);

      // 将用户信息存储到store对象
      this.setUserInfo(data);

      app.globalData.userInfo = data

    },

    async handleRegisterAndLogin() {
      const { userName, userPhone, userEmail, inSchool, grade, schoolMajor } = this.data;
      try {
        // 1. 注册逻辑
        if (!this.data.registed) {
          const registerRes = await promisifyRequest({
            url: `${app.globalData.baseUrl}/user/region`,
            method: 'POST',
            data: {
              jsCode: (await wx.login()).code,
              phone: userPhone,
              nickname: userName,
              email: userEmail,
              school: inSchool,
              grade: grade,
              major: schoolMajor,
            }
          });
          if (registerRes.data.code === 200) {
            this.setData({ registed: true }); // 同步更新状态
            app.setToken(registerRes.data.data)
            wx.showToast({ title: '注册成功', icon: 'success' });
          } else {
            throw new Error(registerRes.data.message || '注册失败');
          }
        }
        // 2. 登录逻辑（注册成功后或已注册时执行）
        if (this.data.registed) {
          // await app.login()
          this.fastLogin()
        }
      } catch (err) {
        console.error('操作失败:', err);
        wx.showToast({ title: err.message, icon: 'none' });
      }
    }
  }
})
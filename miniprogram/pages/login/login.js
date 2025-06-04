// pages/Login/Login.js
import { register, wechatLogin, bindPhone } from '../../services/userService';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    login: 1,
    userName:'',
    userPhone:'',
    userEmail:'',
    inSchool:'',
    grade:'',
    schoolMajor:'',
    openid:'',
    access_token:'',
    nokuaizubook:false
  },

  // 登录首页
  login1(){
    this.setData({
      login: 2
    })
  },

  // 获取昵称和openid
  async userName(e) {
    try {
      const userName = e.detail.value.trim();
      this.setData({
        userName: userName,
      });
      
      // 1. 获取code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });
      
      // 2. 调用后端接口进行微信登录
      const { code } = loginRes;
      const loginResult = await wechatLogin(code);
      
      if (loginResult.code === 200) {
        // 登录成功，保存token和用户信息
        const { token, user, isNewUser } = loginResult.data;
        wx.setStorageSync('token', token);
        wx.setStorageSync('userInfo', user);
        
        if (!isNewUser) {
          // 老用户直接跳转到首页
          wx.switchTab({
            url: '../index/index',
          });
          return;
        }
        
        // 新用户继续注册流程
        this.setData({
          openid: user.openid
        });
      } else {
        throw new Error(loginResult.message || '微信登录失败');
      }
    } catch (error) {
      console.error('微信登录失败:', error);
      wx.showToast({
        title: '微信登录失败，请重试',
        icon: 'none'
      });
    }
  },
  kuaizubook(e){
    wx.navigateTo({
      url: '../kuaizubook/kuaizubook',
    })
  },

  // 获取手机号码
  login2(){
    this.setData({
      login: 3
    });
  },

  // 前端获取微信手机号快捷注册
  async getPhoneNumber(e) {
    try {
      const { code } = e.detail;
      
      // 1. 获取access_token
      const tokenRes = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx1cb9eddd2bef98d5&secret=2802051377f7c9166c7f27e4cae70a9b',
          success: resolve,
          fail: reject
        });
      });
      
      const access_token = tokenRes.data.access_token;
      this.setData({ access_token });
      
      // 2. 获取手机号
      const phoneRes = await new Promise((resolve, reject) => {
        wx.request({
          url: `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
          method: 'POST',
          data: { code },
          success: resolve,
          fail: reject
        });
      });
      
      if (phoneRes.data.errcode === 0) {
        const phoneNumber = phoneRes.data.phone_info.phoneNumber;
        this.setData({ userPhone: phoneNumber });
        
        // 3. 绑定手机号到用户
        const bindRes = await bindPhone({
          phone: phoneNumber,
          openid: this.data.openid
        });
        
        if (bindRes.code !== 200) {
          throw new Error(bindRes.message || '绑定手机号失败');
        }
        
        // 4. 更新本地用户信息
        const userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.phone = phoneNumber;
        wx.setStorageSync('userInfo', userInfo);
        
        wx.showToast({
          title: '手机号绑定成功',
          icon: 'success'
        });
      } else {
        throw new Error(phoneRes.data.errmsg || '获取手机号失败');
      }
    } catch (error) {
      console.error('获取手机号失败:', error);
      wx.showToast({
        title: '获取手机号失败，请重试',
        icon: 'none'
      });
    }
    
    this.setData({ login: 4 });
  },

  // 手机号验证码注册
  getrealtimephonenumber(e){
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
  userEmail(e){
    const userEmail = e.detail.value;
    this.setData({
      userEmail: userEmail
    })
  },
  login4(){
    this.setData({
      login: 5
    })
  },

  // 其它信息
  inSchool(e){
    const inSchool = e.detail.value;
    this.setData({
      inSchool: inSchool
    })
  },
  grade(e){
    const grade = e.detail.value;
    this.setData({
      grade: grade
    })  
  },
  schoolMajor(e){
    const schoolMajor = e.detail.value;
    this.setData({
      schoolMajor: schoolMajor
    }) 
  },
  // 注册并登录
  async login5() {
    try {
      const { userName, userPhone, userEmail, inSchool, grade, schoolMajor, openid } = this.data;
      
      // 1. 注册用户
      const registerData = {
        openid,
        nickname: userName,
        phone: userPhone,
        email: userEmail,
        school: inSchool,
        grade,
        major: schoolMajor
      };
      
      const registerRes = await register(registerData);
      
      if (registerRes.code === 200) {
        // 注册成功，保存token和用户信息
        const { token, user } = registerRes.data;
        wx.setStorageSync('token', token);
        wx.setStorageSync('userInfo', user);
        
        // 跳转到首页
        wx.switchTab({
          url: '../index/index',
        });
      } else {
        wx.showToast({
          title: registerRes.message || '注册失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('注册失败:', error);
      wx.showToast({
        title: '注册失败，请重试',
        icon: 'none'
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
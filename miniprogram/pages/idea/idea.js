// pages/idea/idea.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brief:'',
    inDetail:'',
    simplenessSkill:'',
    detailSkill:'',
    direction:'落地',
    number:'3',
    crossSchool: true,
    items: [
      {
        name: '大专', value:'大专', checked: false
      },
      {
        name: '本科', value:'本科', checked: true
      },
      {
        name: '研究生', value:'研究生', checked: false
      },
    ],
    noRequirementChecked: false,
    promotionChecked: true,
    isSubmitting: false
  },

  brief(e){
    this.setData({
      brief: e.detail.value
    })
    console.log(this.data.brief)
  },

  inDetail(e){
    this.setData({
      inDetail: e.detail.value
    })
    console.log(this.data.inDetail)
  },



  direction(e){
    const direction = e.currentTarget.dataset.direction;
    this.setData({
      direction: direction
    })
    console.log(this.data.direction)
  },

  number(e){
    const number = e.currentTarget.dataset.number;
    this.setData({
      number: number
    })
    console.log(this.data.number)
  },

  crossSchool(){
    if(this.data.crossSchool == true){
      this.setData({
        crossSchool: false
      })
    }else{
      this.setData({
        crossSchool: true
      })
    };
    console.log(this.data.crossSchool ? '接受跨校' : '不接受跨校')
  },

  onRadioChange(e){
    const selectedValue = e.detail.value;
    console.log(selectedValue)
    const updateItems = this.data.items.map(item => {
      return{
        ...item,
        checked: item.value === selectedValue
      };
    });
    this.setData({
      items: updateItems
    })
  },

  simplenessSkill(e){
    this.setData({
      simplenessSkill: e.detail.value
    })
    console.log(this.data.simplenessSkill)
  },

  detailSkill(e){
    this.setData({
      detailSkill: e.detail.value
    })
    console.log(this.data.detailSkill)
  },

  noRequirement(e) {
    this.setData({
      noRequirementChecked: e.detail.value.includes('noRequirement')
    });
  },

  promotionChange(e){
    this.setData({
      promotionChecked: e.detail.value
    })
    console.log(this.data.promotionChecked ? '推广' : '不推广')
  },

  // 数据验证函数
  validateForm() {
    const { brief, inDetail, simplenessSkill, detailSkill } = this.data;
    
    if (!brief.trim()) {
      wx.showToast({
        title: '请输入项目简介',
        icon: 'none'
      });
      return false;
    }
    
    if (!inDetail.trim()) {
      wx.showToast({
        title: '请输入项目详情',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.noRequirementChecked && !simplenessSkill.trim()) {
      wx.showToast({
        title: '请输入技能要求简述',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.noRequirementChecked && !detailSkill.trim()) {
      wx.showToast({
        title: '请输入详细技能要求',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 转换数据格式以匹配后端API
  formatDataForAPI() {
    // 获取选中的学历要求
    const selectedEducation = this.data.items.find(item => item.checked);
    let educationRequirement = 2; // 默认本科
    
    if (selectedEducation) {
      switch(selectedEducation.value) {
        case '大专':
          educationRequirement = 1;
          break;
        case '本科':
          educationRequirement = 2;
          break;
        case '研究生':
          educationRequirement = 3;
          break;
      }
    }
    
    // 如果选择了无技能要求，则技能字段设为默认值
    const skillSummary = this.data.noRequirementChecked ? '无特殊要求' : this.data.simplenessSkill;
    const skillDetails = this.data.noRequirementChecked ? '无特殊要求' : this.data.detailSkill;
    
    // 方向转换：根据实际的选项调整
    let directionValue = 1;
    if (this.data.direction === '落地') {
      directionValue = 1;
    } else if (this.data.direction === '获奖') {
      directionValue = 2;
    } else if (this.data.direction === '学习') {
      directionValue = 3;
    }
    
    return {
      projectName: this.data.brief,
      projectInfo: this.data.inDetail,
      school: '默认学校', // 使用默认值或根据需要设置
      direction: directionValue,
      crossSchool: this.data.crossSchool ? 1 : 0,
      educationRequirement: educationRequirement,
      skillSummary: skillSummary,
      skillDetails: skillDetails,
      emailPromotion: this.data.promotionChecked
    };
  },

  // "一键快组"按钮点击事件
  quickGroup() {
    console.log('quickGroup函数被调用了');
    
    // 先显示一个简单的提示，确认函数被调用
    wx.showToast({
      title: '按钮被点击了！',
      icon: 'success'
    });
    
    console.log('当前数据：', this.data);
    
    // 验证表单
    if (!this.validateForm()) {
      console.log('表单验证失败');
      return;
    }
    console.log('表单验证通过');
    
    // 防止重复提交
    if (this.data.isSubmitting) {
      return;
    }
    
    this.setData({
      isSubmitting: true
    });
    
    // 格式化数据
    const requestData = this.formatDataForAPI();
    
    console.log('提交数据：', requestData);
    
    // 显示加载提示
    wx.showLoading({
      title: '创建中...',
      mask: true
    });
    
    // 发送请求到后端
    wx.request({
      url: 'http://114.55.85.236:8080/project/create',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: requestData,
      success: (res) => {
        wx.hideLoading();
        console.log('创建成功：', res);
        
        if (res.statusCode === 200) {
          wx.showToast({
            title: '项目创建成功',
            icon: 'success',
            duration: 2000,
            success: () => {
              // 延迟跳转，让用户看到成功提示
              setTimeout(() => {
                // 根据你的业务逻辑跳转到相应页面
                wx.navigateBack({
                  delta: 1
                });
                // 或者跳转到项目列表页面
                // wx.redirectTo({
                //   url: '/pages/project-list/project-list'
                // });
              }, 1500);
            }
          });
        } else {
          wx.showToast({
            title: res.data.message || '创建失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('创建失败：', err);
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
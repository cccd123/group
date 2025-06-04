Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    showOverlay: false,
    manualComplaint: false,
    direction:'落地'
  },

  showCustomModal() {
    this.setData({ 
      showModal: true,
      showOverlay: true
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

  myTeam(){
    wx.navigateTo({
      url: '../myTeam/myTeam'
    })
  },

  interested(){
    wx.navigateTo({
      url: '../interested/interested',
    })
  },

  servicePeople(){
    wx.navigateTo({
      url: '../servicePeople/servicePeople',
    })
  },

  myRedact(){
    wx.navigateTo({
      url: '../myRedact/myRedact',
    })
  },

  schoolAccreditation(){
    wx.navigateTo({
      url: '../schoolAccreditation/schoolAccreditation',
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    showOverlay: false
  },

  showCustomModal() {
    this.setData({ 
      showModal: true,
      showOverlay: true
    });
  },
  onFeedback() {
    // 处理表单反馈
    this.setData({ 
      showModal: false,
      showOverlay: false 
    });
  },
  onComplain() {
    // 处理人工投诉
    this.setData({ 
      showModal: false,
      showOverlay: false 
    });
  },
  onCancel() {
    this.setData({ 
      showModal: false,
      showOverlay: false
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

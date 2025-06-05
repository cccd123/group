Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null
  },

  infoLookfor(e){
    wx.navigateTo({
      url: '../lookFor/lookFor'
    })
  },

  infoIdea(e){
    wx.navigateTo({
      url: '../idea/idea',
    })
  },

  cancelLogin(){
    this.setData({
      userInfo: false
    })
  },

  infoLogin(){
    wx.navigateTo({
      url: '../login/login',
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
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: false
      });
    } else {
      this.setData({
        userInfo: true
      });
    }
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
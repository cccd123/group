// pages/myRedact/myRedact.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    grade:'大一',
    direction:'落地',
    trait1:'E',
    trait2:'',
    trait3:'',
    trait4:''
  },

  grade(e){
    const grade = e.currentTarget.dataset.grade
    this.setData({
      grade: grade
    })
    console.log(grade)
  },

  direction(e){
    const direction = e.currentTarget.dataset.direction
    this.setData({
      direction: direction
    })
    console.log(direction)
  },

  trait1(e){
    const trait1 = e.currentTarget.dataset.trait
    this.setData({
       trait1: trait1
     })
    console.log(trait1)
  },
  trait2(e){
    const trait2 = e.currentTarget.dataset.trait
    this.setData({
      trait2: trait2
    })
    console.log(trait2)
  },
  trait3(e){
    const trait3 = e.currentTarget.dataset.trait
    this.setData({
      trait3: trait3
    })
    console.log(trait3)
  },
  trait4(e){
    const trait4 = e.currentTarget.dataset.trait
    this.setData({
      trait4: trait4
    })
    console.log(trait4)
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
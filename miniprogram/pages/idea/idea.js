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
    crossSchool: true ,
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
      item: updateItems
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
      noRequirementChecked: e.detail.value.includes('noRequirement') // 根据选中状态更新
    });
  },

  promotionChange(e){
    this.setData({
      promotionChecked: e.detail.value
    })
    console.log(this.data.promotionChecked ? '推广' : '不推广')
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
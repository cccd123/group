// pages/lookFor/lookFor.js
Page({
  data: {
    currentTab: 'all', 
  },

  switchTab(e){
   const currentTab = e.currentTarget.dataset.tab;
   this.setData({
    currentTab: currentTab
   })
   console.log(this.data.currentTab)
  },
  
});
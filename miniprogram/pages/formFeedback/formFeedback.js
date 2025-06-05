Page({
  data: {
    feedback: '',
    num: '',
  },

  suggest(e) {
    this.setData({
      feedback: e.detail.value,
    });
  },

  onInput(e) {
    this.setData({
      num: e.detail.value,
    });
  },


  submit() {
    const { feedback } = this.data;
    const { num } = this.data;
    console.log(feedback);
    console.log(num);
    this.setData({
      feedback:'',
      num:'',
    })
  },

  onLoad(options) {},
});
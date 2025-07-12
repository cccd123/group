// components/grade/grade.js
Component({
  properties: {
    showGrade: { // 控制组件显示/隐藏
      type: Boolean,
      value: false
    }
  },

  data: {
    grades: ["大一", "大二", "大三", "大四", "研究生", "博士生"],
    selectedGrade: "" // 当前选中的年级
  },

  methods: {
    // 选择年级
    selectgrade(e) {
      const grade = e.currentTarget.dataset.grade;
      this.setData({
        selectedGrade: grade
      });
      
      // 向父组件传递选择结果
      this.triggerEvent("change", {
        grade: grade
      });
      
      // 关闭组件
      this.triggerEvent("close", {
        show: false
      });
    },
  }
});
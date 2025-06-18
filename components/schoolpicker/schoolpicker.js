import { getSchoolService } from '../../api/school'; // 假设有一个获取学校列表的API
Component({
  data: {
    schools: [],
    schoolIndex: 0,       // 当前选中的索引
    selectedSchool: '', // 当前选中的学校
    searchText: '',        // 搜索文本
  },


  methods: {
    // 搜索输入处理
    onSearchInput: async function (e) {
      const searchText = e.detail.value;
      console.log('搜索输入:', searchText);
      const schoolList = (await getSchoolService({ school: searchText })).data;
      console.log('获取学校列表', schoolList);
      this.setData({
        searchText: searchText,
        schools: schoolList,
        schoolIndex: 0,
        selectedSchool: schoolList[0] || ''
      });
      console.log('搜索输入:', searchText);
    },

    // 学校选择变化
    bindSchoolChange: function (e) {
      const index = e.detail.value;
      const selectedSchool = this.data.schools[index];
      this.setData({ schoolIndex: index, selectedSchool });

      this.triggerEvent('change', {
        school: selectedSchool // 改为传递完整对象而非仅 id
      });
    },

    // 获取当前选中的学校
    getSelectedSchool: function () {
      return this.data.selectedSchool.id;
    }
  },
  pageLifetimes: {
    hide: function () {
      // 页面隐藏时可以清理数据或执行其他操作
      this.setData({
        schools: [],
        schoolIndex: 0,
        selectedSchool: '',
        searchText: ''
      });
    }
  }
});

import { getSchoolService } from '../../api/school'; // 假设有一个获取学校列表的API
Component({
  properties: {
    showSchool: {
      type: Boolean,
      value: false
    }
  },

  data: {
    schools: [],
    selectedSchool: '', // 当前选中的学校
    searchText: '',        // 搜索文本
  },

  methods: {
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
      console.log('111', this.data.schools)
    },

    selectSchool(e){
      console.log(e)
      const id = e.currentTarget.dataset.school.id
      const shool = e.currentTarget.dataset.school.schoolname
      console.log(id)
      console.log(shool)
      this.setData({
        selectedSchool: e.currentTarget.dataset.school
      })
      this.triggerEvent('change', {
        school: this.data.selectedSchool // 改为传递完整对象而非仅 id
      });
      this.triggerEvent('close', { show: false });
    },

    // 获取当前选中的学校
    getSelectedSchool: function () {
      return this.data.selectedSchool.id;
    },

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
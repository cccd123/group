Page({
  data: {
    currentTab: 'all',
    allProjectList: [
      {
        title: '项目简要信息1',
        school: '泉州信息工程学院天天发',
        description: '这是一个关于咖啡制作的项目，将会参加今年的挑战杯比赛。szdrg身体好应该也认识sergeant而厄运换个人肉肉柔和人是有我二叔管我生日玩儿一个人额日语换个人天涯海阁 让他还有个额虽然还有个 色热乎',
        schoolRequirement: '本科',
        skillRequirement: '会分析财务数据'
      },
      {
        title: '项目简要信息2',
        school: '泉州信息工程学院',
        description: '这是一个关于无障碍的项目，我们已经申请了多项专利，参加今年的创赛。',
        schoolRequirement: '本科及研究生',
        skillRequirement: '无'
      },
      {
        title: '项目简要信息2',
        school: '泉州信息工程学院',
        description: '这是一个关于无障碍的项目，我们已经申请了多项专利，参加今年的创赛。',
        schoolRequirement: '本科及研究生',
        skillRequirement: '无'
      },
      {
        title: '项目简要信息2',
        school: '泉州信息工程学院',
        description: '这是一个关于无障碍的项目，我们已经申请了多项专利，参加今年的创赛。',
        schoolRequirement: '本科及研究生',
        skillRequirement: '无'
      },
      {
        title: '项目简要信息2',
        school: '泉州信息工程学院',
        description: '这是一个关于无障碍的项目，我们已经申请了多项专利，参加今年的创赛。',
        schoolRequirement: '本科及研究生',
        skillRequirement: '无'
      }
    ],
    mySchoolProjectList: [
      {
        title: '项目简要信息3',
        school: '泉州信息工程学院',
        description: '这是一个关于咖啡制作的项目，将会参加今年的挑战杯比赛。',
        schoolRequirement: '本科',
        skillRequirement: '会分析财务数据'
      },
      {
        title: '项目简要信息4',
        school: '泉州信息工程学院',
        description: '这是一个关于无障碍的项目，我们已经申请了多项专利，参加今年的创赛。',
        schoolRequirement: '本科及研究生',
        skillRequirement: '无'
      },
      {
        title: '项目简要信息2',
        school: '泉州信息工程学院',
        description: '这是一个关于无障碍的项目，我们已经申请了多项专利，参加今年的创赛。',
        schoolRequirement: '本科及研究生',
        skillRequirement: '无'
      },
      {
        title: '项目简要信息2',
        school: '泉州信息工程学院',
        description: '这是一个关于无障碍的项目，我们已经申请了多项专利，参加今年的创赛。',
        schoolRequirement: '本科及研究生',
        skillRequirement: '无'
      }

    ]
  },

  switchTab(e) {
    const currentTab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: currentTab
    });
    console.log(this.data.currentTab);
  },

  projectDetails() {
    wx.navigateTo({
      url: '/pages/projectDetails/projectDetails',
    });
  }
});
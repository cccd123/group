Page({
  data: {
    currentTab: 'all',
    allProjectList: [
      {
        title: '项目简要信息1',
        school: '泉州信息工程学院',
        description: '这是一个关于咖啡制作的项目，将会参加今年的挑战杯比赛。',
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
import { BehaviorWithStore } from 'mobx-miniprogram-bindings'
import { userStore } from '../../store/userStore'

export const userBehavior = BehaviorWithStore({
  storeBindings: {
    store: userStore,
    fields: ['userInfo', 'schoolName'],
    actions: ['setUserInfo', 'setSchoolName']
  }
})
import http from '../utils/http'

// 查找学校
export const getSchool = (params) => {
  return http.get('/user/school', params)
}
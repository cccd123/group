import http from '../utils/http'

// 查找学校
export const getSchoolService = (params) => {
  return http.get('/user/school', params)
}

export const getSchoolByIdService = (id) => {
  return http.get(`/school/getSchoolById`, id)
}
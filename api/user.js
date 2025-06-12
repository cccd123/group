import http from '../utils/http'

export const loginService = (params) => {
  return http.post(`/user/login1/${params}`)
}

export const getUserInfoService = () => {
  return http.get('/user/getuserinfo')
}

/**
 * @description 实现本地资源上传
 * @param {*} filePath 要上传的文件路径 
 * @param {*} name 文件对应的key
 * @returns Promise
 */
export const uploadAvatarService = (filePath, name) => {
  return http.upload('/user/uploadavatar', filePath, name)
}

export const uploadCoverService = (filePath, name) => {
  return http.upload('/user/uploadbg', filePath, name)
}

export const updateUserInfoService = (param) => {
  return http.post('/user/update', param)
}
import { post, get } from '../utils/request';

// 用户注册
export const register = (data) => {
  return post('/user/register', data);
};

// 用户登录
export const login = (data) => {
  return post('/user/login', data);
};

// 获取用户信息
export const getUserInfo = () => {
  return get('/user/info');
};

// 更新用户信息
export const updateUserInfo = (data) => {
  return post('/user/update', data);
};

// 微信登录
export const wechatLogin = (code) => {
  return post('/user/wechat/login', { code });
};

// 绑定手机号
export const bindPhone = (data) => {
  return post('/user/bind/phone', data);
};

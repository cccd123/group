// 基础URL，根据实际后端API地址修改
const baseUrl = 'https://your-api-domain.com/api';

// 封装请求方法
const request = (url, method, data = {}, header = {}) => {
  // 从本地存储获取token
  const token = wx.getStorageSync('token') || '';
  
  // 设置默认请求头
  const defaultHeader = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
  
  // 合并请求头
  const headers = { ...defaultHeader, ...header };
  
  // 显示加载中
  wx.showLoading({
    title: '加载中...',
    mask: true
  });
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${url}`,
      method: method,
      data: data,
      header: headers,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          // 请求成功
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，跳转到登录页
          wx.removeStorageSync('token');
          wx.reLaunch({
            url: '/pages/login/login'
          });
          reject(new Error('登录已过期，请重新登录'));
        } else {
          // 其他错误
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none',
            duration: 2000
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
};

// 封装GET请求
export const get = (url, data = {}, header = {}) => {
  return request(url, 'GET', data, header);
};

// 封装POST请求
export const post = (url, data = {}, header = {}) => {
  return request(url, 'POST', data, header);
};

// 封装PUT请求
export const put = (url, data = {}, header = {}) => {
  return request(url, 'PUT', data, header);
};

// 封装DELETE请求
export const del = (url, data = {}, header = {}) => {
  return request(url, 'DELETE', data, header);
};

export default {
  get,
  post,
  put,
  delete: del
};

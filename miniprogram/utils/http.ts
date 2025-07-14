// utils/http.ts
/// <reference types="miniprogram-api-typings" />

const BASE_URL = 'https://114.55.85.236:8080'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: object
  showLoading?: boolean
}

export const request = (options: RequestOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    const { showLoading = true } = options
    
    // 请求拦截
    const token = wx.getStorageSync('token')
    const header = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.header
    }

    showLoading && wx.showLoading({ title: '加载中' })

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        // 响应拦截
        if (res.statusCode === 401) {
          handleTokenExpired()
          return reject('登录过期')
        }
        
        if (res.statusCode !== 200) {
          return reject(res.data || '请求失败')
        }

        resolve(res.data)
      },
      fail: (error) => {
        wx.showToast({ title: '网络错误', icon: 'none' })
        reject(error)
      },
      complete: () => {
        showLoading && wx.hideLoading()
      }
    })
  })
}

// Token过期处理
const handleTokenExpired = () => {
  wx.showModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    success(res) {
      if (res.confirm) {
        wx.navigateTo({ url: '/pages/login/index' })
      }
    }
  })
}

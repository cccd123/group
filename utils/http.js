import WxRequest from './request'
import { getStorage, clearStorage } from './storage'
import { modal, toast } from './extendApi'
import { env } from './env'

// 对 WxRequest 进行实例化
const instance = new WxRequest({
  baseURL: env.baseURL,
  timeout: 60000,
  isLoading: true
})

// 配置请求拦截器
instance.interceptors.request = (config) => {
  // 在请求发送之前做点什么

  // 在发送请求之前，需要先判断本地是否存在访问令牌token
  const token = getStorage('token')

  // 如果存在token，就需要在请求头中添加 token 字段
  if (token) {
    config.header['Authorization'] = token
  }
  return config
}

// 配置响应拦截器
instance.interceptors.response = async (response) => {
  // 从response中解构isSuccess
  const { isSuccess, data } = response

  // 如果isSuccess为false，说明执行了fail回调函数
  // 这时候就说明网络异常，需要给用户提示网络异常
  if (!isSuccess) {
    wx.toast({
      title: '网络异常请重试',
      icon: 'error'
	})
	// 在控制台输出报错信息
	console.error(
		`<--后端响应错误:\n\t向后端接口 ${response.config.baseURL == 'https://zhaoxiaokai.xyz' ? response.config.pluginUrl : response.config.url} 发送 ${response.config.method} 请求时发生错误`,
		// 省略默认前缀 https://zhaoxiaokai.xyz
		`\n\t后端响应状态码： ${response.statusCode}`,
		`\n\t响应信息： ${data.message ? data.message : '无法读取响应信息'}`,
		'\n\n\t收到的完整的后端响应内容：', response
	);
    return response
  }
  // 在开始处理响应前，在控制台输出提示信息
  if (response.statusCode === 200)	// 正常响应
	console.log(
		`<--后端响应:\n\t向后端接口 ${response.config.baseURL == 'https://zhaoxiaokai.xyz' ? response.config.pluginUrl : response.config.url} 发送 ${response.config.method} 请求`,
		// 省略默认前缀 https://zhaoxiaokai.xyz
		`\n\t后端响应状态码： ${response.statusCode}`,
		`\n\t响应信息： ${data.message ? data.message : '无法读取响应信息'}`,
		'\n\n\t收到的完整的后端响应内容：', response
	);
  else	// 非正常响应
	console.warn(
		`<--后端响应:\n\t向后端接口 ${response.config.baseURL == 'https://zhaoxiaokai.xyz' ? response.config.pluginUrl : response.config.url} 发送 ${response.config.method} 请求`,
		// 省略默认前缀 https://zhaoxiaokai.xyz
		`\n\t后端响应状态码： ${response.statusCode}`,
		`\n\t响应信息： ${data.message ? data.message : '无法读取响应信息'}`,
		'\n\n\t收到的完整的后端响应内容：', response
	);
  // 判断服务器响应的业务状态码
  switch (data.code) {
    
    // 如果后端返回的业务状态码等于200，说明请求成功，服务器成功响应了数据
    case 200:
      // 对服务器响应的数据做点什么
      return data
    
    // 如果返回的业务状态码等于208，说明没有token，或者token失效
    // 需要让用户登录或者重新登录
    case 208:
      const res = await modal({
        content: '鉴权失败，请重新登录',
        showCancel: false  // 不显示取消按钮
      })

      if (res) {
        // 清除之前失效的token，同时要清楚本地存储的全部信息
        clearStorage()
        wx.navigateTo({
          url: '/pages/login/login'
        }) 
      }
      return Promise.reject(response)
  
    default:
    //   toast({
    //     title: '程序出现异常，请联系客服或稍后重试'
    //   })
      return Promise.reject(response)
  }
}

// 将 WxRequest 实例进行暴露出去，方便在其他文件中使用
export default instance;
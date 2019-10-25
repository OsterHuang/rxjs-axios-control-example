import axios from 'axios'

import store from '@/store'
import { emitRefreshToken } from './refreshTokenObserver'

// create an axios instance
const service = axios.create({
  baseURL: 'http://localhost:8081/api', // api 的 base_url
  timeout: 60000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    if (store.state.token) config.headers['X-Auth'] = store.state.token
    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const data = response.data

    // console.log(' Response Config: ', response.config)

    return data
  },
  async error => {
    // console.log('While error', error.config)
    const statusCode = error.response.status
    if (statusCode === 401) {
      const errorCode = error.response.data.code

      if (errorCode === 'expired') {
        // Push to queue to refresh Token
        const result = await emitRefreshToken(error.config)
        return Promise.resolve(result)
        // return Promise.reject(result.error)
      } else if (errorCode === 'invalid') {
        // Maybe Do Logout
      }
    } else if (statusCode === 403) {
      console.log('Exeucte 403')
    }

    return Promise.reject(error.response.data)
  }
)

export default service

import { from, fromEventPattern, EMPTY } from 'rxjs'
import { concatMap, map, filter, catchError, mergeMap } from 'rxjs/operators'

import request from './http'

const observer = {
  push: () => {},
  emitRefreshToken: (param) => {
    observer.push(param)
    return new Promise((resolve, reject) => {
      param.resolve = resolve
    })
  }
}

/**
 * 預期使用queue的方式來一筆一筆重試需要 refreshToken 的 request
 */
fromEventPattern(
  function add(h) {
    observer.push = h
  }
)
  .pipe(
    // 過濾自己手動測試的案例 - 從按鈕 '自己emit event試試' 來的, 按鈕來的 isNormal = true
    filter(config => {
      return !config.isNormal
    }),
    // Call refresh token - 因為這邊 call api 失敗不能停整個 observable 所以必須自己再做新的串流catch error
    concatMap(config => {
      return from(request({ ...config, url: '/refreshToken' })).pipe(
        map(v => { return v }),
        catchError(error => {
          // console.log('Refresh token error: ', error)
          config.resolve({ success: false, error })
          return EMPTY
        }),
        // Call retry token - 因為這邊 call api 失敗不能停整個 observable 所以必須自己再做新的串流catch error
        mergeMap(v => {
          // console.log('Retrying after refreshing success: ', config.data)
          const newData = { ...config.data }
          newData.pass = !newData.retryPass
          return from(request({ ...config, data: newData }))
            .pipe(
              map(retryResult => {
                // console.log('Send Retry by new token: ', retryResult)
                config.resolve({ success: true, data: retryResult })
                return retryResult
              }),
              catchError(error => {
                console.log('Retry failure token error: ', error)
                config.resolve({ success: false, error })
                return EMPTY
              })
            )
        })
      )
    }),
  )
  // subscribe 可能非必要，這邊只是為debug方便
  .subscribe(
    (nextData) => { console.log('Finish the refreshToken & retry - ', nextData) },
    (err) => { console.log('error on the refresh token observer....', err) }
  )

export const emitRefreshToken = observer.emitRefreshToken

// const EventEmitter = require('events').EventEmitter
// const Rx = require('rxjs')

// const e = new EventEmitter()

// // Wrap EventEmitter
// const source = fromEventPattern(
//   function add(h) {
//     e.addListener('data', h)
//   },
//   function remove(h) {
//     e.removeListener('data', h)
//   },
//   function(foo, bar) {
//     return foo + ',' + bar
//   }
// )

// const subscription = source.subscribe(
//   function(result) {
//     console.log('Next: %s', result)
//   },
//   function(err) {
//     console.log('Error: ' + err)
//   },
//   function() {
//     console.log('Completed')
//   }
// )

// e.emit('data', 'foo', 'bar')

<template>
  <div>
    <h1>過期Token使用rxjs將過期request重新要新的token之後，再重新發送一次request</h1>
    <h3>打開network console方便監控</h3>
    <h5>這邊訂http status 401 ( 401.invalid - token失效 、 401.expired - token過期 )，http status 403 - refresh token失敗</h5>
    <div class="btn-area">
      <button :disabled="isLoading" @click="handleAllSuccess">三筆async req全成功</button>
      <button :disabled="isLoading" @click="handleRefreshDoneAtFirstOf5">5筆async req過期，第一次要refresh token即成功</button>
      <button :disabled="isLoading" @click="handleRefreshDoneAtFirstOf3">5筆async req過期，第三次要refresh token才成功</button>
      <button :disabled="isLoading" @click="handleRefreshFail">5筆async req過期，refresh token全失敗</button>
    </div>

    <br><br><br><br>

    <div class="btn-area">
      <button :disabled="isLoading" @click="handleSignIn">登入</button>
      <button :disabled="isLoading" @click="handleSignOut">登出</button>
    </div>
    <div class="is-login" :class="{ yes: isLogin }">
      {{ isLoginStatus }}
    </div>

    <div class="result">{{ result }}</div>

    <button @click="sendEvent">自己emit event試試</button>
    <button @click="clearResult">Clear result</button>
  </div>
</template>

<script>
import { of, from, interval } from 'rxjs'
import {
  mergeMap,
  concatMap,
  map,
  take,
  delay,
  catchError,
  materialize
} from 'rxjs/operators'

import request from './http'
import { emitRefreshToken } from './refreshTokenObserver.js'

export default {
  name: 'SamepleRefreshToken',
  data() {
    return {
      isLoading: false,
      result: []
    }
  },
  computed: {
    isLogin() {
      return !!this.$store.state.token
    },
    isLoginStatus() {
      return this.$store.state.token ? '已登入' : '未登入'
    }
  },
  methods: {
    handleAllSuccess() {
      request({ url: '/verifyToken', method: 'POST', data: { pass: true }})
        .then(v => { this.result.push(v) })
        .catch(err => { this.result.push(err) })
      request({ url: '/verifyToken', method: 'POST', data: { pass: true }})
        .then(v => { this.result.push(v) })
        .catch(err => { this.result.push(err) })
      request({ url: '/verifyToken', method: 'POST', data: { pass: true }})
        .then(v => { this.result.push(v) })
        .catch(err => { this.result.push(err) })
    },
    handleRefreshDoneAtFirstOf5() {
      /**
       * 每隔 50ms 發送一次 request
       * 比較好觀察 queue expired request 要重發的情境
       */
      const reqs = [
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: true, retryPass: true }},
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: true, retryPass: true }},
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: true, retryPass: true }},
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: true, retryPass: true }},
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: true, retryPass: true }}
      ]
      interval(100).pipe(
        take(reqs.length),
        map(idx => reqs[idx]),
        mergeMap(req => from(request(req)))
      ).subscribe(
        nextData => { console.log(' At handleRefreshDoneAtFirstOf5() next: '); this.result.push(nextData) },
        error => { console.log(' At handleRefreshDoneAtFirstOf5() error: '); this.result.push(error) },
        completion => { console.log(' At handleRefreshDoneAtFirstOf5() completed...') }
      )
    },
    handleRefreshDoneAtFirstOf3() {
      /**
       * 每隔 50ms 發送一次 request
       * 比較好觀察 queue expired request 要重發的情境
       */
      const reqs = [
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: false, retryPass: true }},
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: false, retryPass: true }},
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: true, retryPass: true }},
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: true, retryPass: true }},
        { url: '/verifyToken', method: 'POST', data: { pass: false, refreshPass: true, retryPass: true }}
      ]
      interval(300).pipe(
        take(reqs.length),
        map(idx => reqs[idx]),
        mergeMap(
          req => from(request(req)).pipe(
            catchError(err => of(err))
          )
        )
      ).subscribe(
        nextData => { console.log(' At handleRefreshDoneAtFirstOf3() next: '); this.result.push(nextData) },
        error => { console.log(' At handleRefreshDoneAtFirstOf3() error: '); this.result.push(error) },
        completion => { console.log(' At handleRefreshDoneAtFirstOf3() completed...') }
      )
    },
    handleRefreshFail() {

    },
    handleSignIn() {
      this.isLoading = true

      request('/getToken')
        .then(data => this.$store.commit('SET_TOKEN', data.token))
        .finally(() => { this.isLoading = false })
    },
    handleSignOut() {
      this.$store.commit('CLEAR_TOKEN')
    },
    sendEvent() {
      emitRefreshToken({ isNormal: true, type: 'Person play' })
    },
    clearResult() {
      this.result = []
    }
  }
}
</script>

<style lang="stylus" scoped>
>>> .btn-area
  width 800px
  button
    width 180px

.is-login
  font-size 48px
  color #ff4444
  &.yes
    color #02abb1
  margin 20px

</style>

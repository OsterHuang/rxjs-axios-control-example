<template>
  <div>
    <h1>同時發送多筆request，若有一筆失敗，還是繼續</h1>
    <div class="btn-area">
      <button :disabled="isLoading" @click="handleAllSuccess">三筆全成功</button>
      <button :disabled="isLoading" @click="handleTwoError">三筆中，二筆失敗</button>
    </div>
    <div class="result">
      <pre>{{ message }}</pre>
    </div>

    <hr>

    <div class="btn-area">
      <button :disabled="isWrapLoading" @click="handleWrapTwoError">[使用rx包裝promise]三筆中，二筆失敗</button>
    </div>
    <div class="result">
      <pre class="text-align-left">{{ wrapMessage }}</pre>
    </div>
  </div>
</template>

<script>
import { merge, Observable } from 'rxjs'
import { reduce } from 'rxjs/operators'
import { createTimeout, messageLog } from '@/util'

const asyncProcessForce = (...promises) => {
  const observables = []
  for (let i = 0; i < promises.length; i++) {
    observables.push(new Observable(subscriber => {
      promises[i]
        .then(v => {
          subscriber.next({ success: true, data: v })
          subscriber.complete()
        })
        .catch(err => {
          subscriber.next({ sucess: false, errorMessage: err.toString() })
          subscriber.complete()
        })
    }))
  }

  return observables
}

export default {
  name: 'FetchAllOneErrorContinue',
  data() {
    return {
      isLoading: false,
      message: '',
      isWrapLoading: false,
      wrapMessage: ''
    }
  },
  methods: {
    handleAllSuccess() {
      const startTime = new Date()
      this.message = ''

      this.isLoading = true
      merge(
        createTimeout({ name: 'P1', duration: 3000 }),
        createTimeout({ name: 'P2', duration: 4000 }),
        createTimeout({ name: 'P3', duration: 5000 })
      ).subscribe({
        next: v => { this.message += messageLog(v, startTime) + '\n' },
        error: err => { this.message += messageLog(err, startTime) + '\n' },
        complete: () => {
          this.message += messageLog('All completion - ', startTime) + '\n'
          this.isLoading = false
        }
      })
    },
    handleTwoError() {
      const startTime = new Date()
      this.message = ''

      this.isLoading = true
      merge(
        createTimeout({ name: 'P1', duration: 3000 }),
        createTimeout({ name: 'P2', duration: 4000, hasError: true }),
        createTimeout({ name: 'P3', duration: 5000, hasError: true })
      ).subscribe({
        next: v => { this.message += messageLog(v, startTime) + '\n' },
        error: err => {
          this.message += messageLog(err, startTime) + '\n'
          this.isLoading = false
        },
        complete: () => {
          this.message += messageLog('All completion - ', startTime) + '\n'
          this.isLoading = false
        }
      })
    },
    handleWrapTwoError() {
      const startTime = new Date()
      this.wrapMessage = ''

      const observables = asyncProcessForce(
        new Promise((resolve, reject) => { setTimeout(() => resolve('P1 Success'), 3000) }),
        // new Promise((resolve, reject) => { setTimeout(() => resolve('P2 Success'), 4000) }),
        new Promise((resolve, reject) => { setTimeout(() => reject('P2 failure - bad guy...'), 4000) }),
        // new Promise((resolve, reject) => { setTimeout(() => resolve('P3 Success'), 5000) })
        new Promise((resolve, reject) => { setTimeout(() => reject('P3 failure - This is should be the http error'), 5000) })
      )

      this.isWrapLoading = true
      merge(
        ...observables
        // createTimeout({ name: 'P1', duration: 3000 }),
        // createTimeout({ name: 'P2', duration: 4000, hasError: true }),
        // createTimeout({ name: 'P3', duration: 5000, hasError: false })
      ).pipe(
        reduce((acc, val, idx) => acc.concat(val), [])
      ).subscribe({
        next: v => { this.wrapMessage += messageLog(JSON.stringify(v, null, 2), startTime) + '\n' },
        error: err => {
          this.wrapMessage += messageLog(err, startTime) + '\n'
          this.isWrapLoading = false
        },
        complete: () => {
          this.wrapMessage += messageLog('All completion - ', startTime) + '\n'
          this.isWrapLoading = false
        }
      })
    }
  }
}
</script>

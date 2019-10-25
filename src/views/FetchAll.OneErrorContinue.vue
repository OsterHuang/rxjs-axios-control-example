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
  </div>
</template>

<script>
import { merge, Observable, of } from 'rxjs'
import {
  reduce,
  catchError,
  switchMap,
  mergeMap,
  onErrorResumeNext
} from 'rxjs/operators'
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
      this.message = 'Start handle two error - \n'

      this.isLoading = true
      of(
        { name: 'P1', duration: 1000 },
        { name: 'P2', duration: 2000, hasError: true, throwError: false },
        { name: 'P3', duration: 3000, hasError: false }
      )
        .pipe(
          mergeMap(v => createTimeout(v).pipe(catchError(err => of(err))))
        )
        .subscribe({
          next: v => { this.message += messageLog(v, startTime) + '\n' },
          error: err => {
            this.message += 'Subscribe error: ' + messageLog(err, startTime) + '\n'
            this.isLoading = false
          },
          complete: () => {
            this.message += messageLog('All completion - ', startTime) + '\n'
            this.isLoading = false
          }
        })
    }
  }
}
</script>

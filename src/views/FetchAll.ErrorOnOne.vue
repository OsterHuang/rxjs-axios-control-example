<template>
  <div>
    <h1>同時發送多筆request，當有一筆失敗，則進入失敗流程</h1>
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
import { merge } from 'rxjs'
import { createTimeout, messageLog } from '@/util'

export default {
  name: 'FetchAllErrorOnOne',
  data() {
    return {
      isLoading: false,
      message: ''
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
    }
  }
}
</script>

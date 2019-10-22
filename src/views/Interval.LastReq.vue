<template>
  <div>
    <h1>每隔一段時間就發送Request, 但是Response要是最新的</h1>
    <div class="btn-area">
      <button v-show="!subscription" :disabled="isLoading" @click="handleStart">開始</button>
      <button v-show="!!subscription" @click="handleEnd">停止</button>
    </div>
    <h4>記錄</h4>
    <table id="message" class="result records-table" width="95%">
      <tr>
        <td>Seq</td><td>execueDuration</td><td>startAt</td><td>Expect</td><td>finishedAt</td>
      </tr>
      <tr v-for="record in records" :key="record.reqId">
        <td :class="{ next: predict === record.seqId }">{{ record.seqId }}</td>
        <td :class="{ next: predict === record.seqId }">{{ record.executeDuration / 1000 }}</td>
        <td :class="{ next: predict === record.seqId }">{{ durationFromStart(record.startAt) }}</td>
        <td :class="{ next: predict === record.seqId }">{{ expectDuration(record) }}</td>
        <td :class="{ next: predict === record.seqId }">{{ durationFromStart(record.finishedAt) }}</td>
      </tr>
    </table>

    <h4>預測: {{ predict }}</h4>

    <h4>最新資料</h4>
    <div class="result">
      <transition name="fade" mode="out-in">
        <pre v-if="dataSeqId !== '-1'" :key="dataSeqId" class="text-align-left">{{ data || '' }}</pre>
      </transition>
    </div>
  </div>
</template>

<script>
import {
  timer
} from 'rxjs'
import {
  switchMap,
  startWith
} from 'rxjs/operators'

export default {
  name: 'IntervalLastReq',
  data() {
    return {
      isLoading: false,
      startTime: new Date(),
      subscription: null,
      records: [],
      data: {}
    }
  },
  computed: {
    dataSeqId() {
      return this.data.seqId ? this.data.seqId.toString() : ''
    },
    predict() {
      let fastestOne = null

      const unfinshedList = this.records.filter(record => !record.finishedAt && record.seqId > this.data.seqId)
        .forEach(record => {
          console.log(fastestOne)
          if (!fastestOne) {
            fastestOne = record
            return
          }

          if ((fastestOne.startAt.getTime() + fastestOne.executeDuration) > (record.startAt.getTime() + record.executeDuration)) {
            fastestOne = record
            return
          }
        })

      return fastestOne ? fastestOne.seqId : ''
    }
  },
  methods: {
    handleStart() {
      this.startTime = new Date()
      this.message = ''
      this.data = { seqId: -1 }

      this.subscription = timer(0, 5000)
        .pipe(
          // take(7),
          switchMap(val => this.apiXXX(val, this.startTime))
        ).subscribe(data => {
          this.data = data

          const objDiv = document.getElementById('message')
          objDiv.scrollTop = objDiv.scrollHeight
        })
    },
    handleEnd() {
      this.subscription.unsubscribe()
      this.subscription = null
    },
    apiXXX(intervalCount, startTime) {
      // const randomTimeout = Math.floor(Math.random() * 1000) * 10
      // const sampleDurations = [1.55, 2, 3, 18.5, 14.5, 10.5]
      const sampleDurations = [33.6, 23.4, 18.5, 14.5, 3, 2]
      const randomTimeout = sampleDurations[intervalCount % 6] * 1000

      const result = {
        seqId: intervalCount,
        executeDuration: randomTimeout,
        startAt: new Date()
      }

      this.records.unshift(result)
      if (this.records.length > 10) this.records.pop()

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          result.finishedAt = new Date()

          resolve(result)
        }, randomTimeout)
      })
    },
    formatTime(time) {
      if (!time) return ''
      return time.toISOString().slice(11, 19)
    },
    durationFromStart(time) {
      if (!time) return ''
      return `${(time.getTime() - this.startTime.getTime()) / 1000}s`
    },
    expectDuration(record) {
      if (!record) return ''
      return `${(record.startAt.getTime() - this.startTime.getTime() + record.executeDuration) / 1000}s`
    }
  }
}
</script>

<style lang="stylus">
.fade-enter-active,
.fade-leave-active
    transition: opacity .5s

.fade-enter,
.fade-leave-to
    opacity: 0
// .slide-fade-enter-active {
//   transition: all .3s ease;
// }
// .slide-fade-leave-active {
//   transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
// }
// .slide-fade-enter, .slide-fade-leave-to
// /* .slide-fade-leave-active for <2.1.8 */ {
//   transform: translateX(10px);
//   opacity: 0;
// }

.next
  background-color #ccc
  transition background 0.5s ease

.records-table
  border-spacing 0

</style>

import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    name: 'FetchAll.ErrorOnOne',
    path: '/',
    component: () => import('@/views/FetchAll.ErrorOnOne.vue')
  },
  {
    name: 'FetchAll.OneErrorContinue',
    path: '/FetchAll.OneErrorContinue',
    component: () => import('@/views/FetchAll.OneErrorContinue.vue')
  },
  {
    name: 'Interval.LastReq',
    path: '/Interval.LastReq',
    component: () => import('@/views/Interval.LastReq.vue')
  },
  {
    name: 'SampleRefreshToken',
    path: '/SampleRefreshToken',
    component: () => import('@/views/SampleRefreshToken/index.vue')
  }
]

export default new VueRouter({ routes, linkExactActiveClass: 'is-active' })

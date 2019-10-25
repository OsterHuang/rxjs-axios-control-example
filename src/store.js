import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    token: undefined
  },
  mutations: {
    SET_TOKEN(state, payload) {
      state.token = payload
    },
    CLEAR_TOKEN(state, payload) {
      state.token = undefined
    }
  }
})

export default store

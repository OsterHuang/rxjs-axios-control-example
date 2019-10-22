<template>
  <div id="app">
    <div class="head-region">
      <img
        alt="Vue logo"
        src="./assets/logo.png"
        height="50"
      >
      <span class="head-font">with</span>
      <img
        alt="Vue logo"
        src="https://rxjs-dev.firebaseapp.com/assets/images/logos/logo.png"
      >
      <div>
        <router-link to="/">異步多筆 - 單筆失敗</router-link>
        <span> | </span><router-link to="/FetchAll.OneErrorContinue">異步多筆 - 單筆其他繼續</router-link>
        <span> | </span><router-link to="/Interval.LastReq">同request異步 - respones 後蓋前</router-link>
        <span> | </span><router-link to="/SampleRefreshToken">Refresh Expired Token</router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="stylus">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
}

body {
  margin: 0px;
}

a {
  color: #eee;
  text-decoration: none;
  text-transform: uppercase;
}

a:hover {
  text-decoration: underline;
}

a:active, a.is-active {
  font-weight: bold;
  color: #02abb1;
}

.head-region {
  background-color: #444;
  padding: 16px;
  color: #02abb1;
}

.head-font {
  font-family: fantasy, monospace;
  font-size: 24px;
  color: #eee;
}

.result
  margin 16px
  border 1px solid #ccc
  color #444
  min-height 200px
  max-height 300px
  overflow-y scroll

.btn-area
  display inline-flex
  width calc(50%)
  justify-content space-around

hr
  color #444
  margin 0px 16px

.text-align-left
  display inline-block
  text-align left
</style>

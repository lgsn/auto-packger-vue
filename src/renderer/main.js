import Vue from 'vue'
import {Button, Dialog, Input, Message, Popover} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
import router from './router'
const { app } = require('electron').remote
import path from 'path'
const HOST_COFING = app.getPath('userData')


if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.$hostConfig = Vue.prototype.$hostConfig = `${HOST_COFING}${path.sep}HOSTLOCAL`
Vue.$Message = Vue.prototype.$Message = Message
Vue.use(Button)
Vue.use(Dialog)
Vue.use(Input)
Vue.use(Popover)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')

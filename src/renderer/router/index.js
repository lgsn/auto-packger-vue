import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'control-main',
      component: require('@/view/control-main').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

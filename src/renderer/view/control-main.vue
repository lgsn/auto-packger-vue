<!--主页面-->
<template>
  <div class="control-main">

    <!--左侧列表-->
    <div class="control-list">
      <p class="left-title">不知道写什么</p>
      <ul>
        <li :class="{'check-list': checkId == 'none'}" @click="openHost('none')">Host</li>
        <li v-for="(item, index) in connectList" :key="index" :class="{'check-list': checkId == item.key}" @click="openHost(item.key)">{{item.hostName}}</li>
      </ul>

    </div>

    <!--右侧主体内容-->
    <div v-if="moduleFlag == 1" class="control-right">

      <!--新增-->
      <el-Button class="new-host-btn" type="primary" size="mini" @click="newAddHost">添 加</el-Button>
      <ul class="control-right" v-if="showFlag">
        <li v-for="(item, index) in hostList" :key="index" @dblclick="checkOpen(item)">
          <span class="list-icon">{{item.hostName.substring(0,1)}}</span>
          <span>{{item.hostName}}</span>

          <!--操作-->
          <el-popover
            placement="right"
            width="80"
            trigger="click">
            <span slot="reference" class="host-set-btn">
              <i class="el-icon-more"></i>
            </span>
            <div>
              <el-Button size="mini" type="primary" icon="el-icon-edit" @click="editorHost(item)">修改</el-Button>
            </div>
          </el-popover>
        </li>
      </ul>
    </div>

    <!--右侧连接内容-->
    <div v-else class="control-right">
      13123
    </div>

    <!--新增Host-->
    <el-dialog
      custom-class="host-dialog"
      :title="hostDialog.title"
      :visible.sync="hostDialog.visible"
      width="600px"
      :before-close="closeHost">
      <div class="host-content">
        <div class="host-flex">
          <span class="host-flex-label">名称：</span>
          <el-Input size="mini" v-model="hostDialog.hostName" class="host-flex-value"></el-Input>
        </div>
        <div class="host-flex">
          <span class="host-flex-label">本地地址：</span>
          <el-Button size="mini" @click="openFile" class="host-flex-value">
            <span v-if="!hostDialog.localPath">选择目录</span>
            <span v-else>{{hostDialog.localPath}}</span>
            <input class="none" ref="selectFile" type="file" webkitdirectory directory @change="changeFile">
          </el-Button>
        </div>
        <div class="host-flex">
          <span class="host-flex-label">项目打包命令：</span>
          <el-Input size="mini" v-model="hostDialog.packCmd" class="host-flex-value"></el-Input>
        </div>
        <div class="host-flex">
          <span class="host-flex-label">Host：</span>
          <el-Input size="mini" v-model="hostDialog.host" class="host-flex-value"></el-Input>
        </div>
        <div class="host-flex">
          <span class="host-flex-label">Port：</span>
          <el-Input size="mini" v-model="hostDialog.port" class="host-flex-value"></el-Input>
        </div>
        <div class="host-flex">
          <span class="host-flex-label">UserName：</span>
          <el-Input size="mini" v-model="hostDialog.userName" class="host-flex-value"></el-Input>
        </div>
        <div class="host-flex">
          <span class="host-flex-label">Password：</span>
          <el-Input size="mini" v-model="hostDialog.password" type="password" class="host-flex-value"></el-Input>
        </div>
        <div class="host-flex">
          <span class="host-flex-label">上传文件地址：</span>
          <el-Input size="mini" v-model="hostDialog.uploadUrl" class="host-flex-value"></el-Input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelHost">取 消</el-button>
        <el-button size="mini" type="primary" @click="confirmHost">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import fs from 'fs'
  export default {
    name: "control-main",
    data () {
      return {
        checkId: 'none',
        hostDialog: {
          title: '',
          key: '',
          hostName: '',
          localPath: '',
          packCmd: '',
          host: '',
          port: '',
          userName: '',
          password: '',
          uploadUrl: '',
          type: 0,
          visible: false,
        },
        hostList: {},
        showFlag: false,
        moduleFlag: 1,
        connectList: [],
      }
    },
    created () {
      this.initHostConfig()
    },
    methods:{
      initHostConfig () {
        let vm = this

        /**
         * 获取本地所有host配置列表
         **/
        fs.readFile(`${this.$hostConfig}/data.json`, (err, data) => {
          if (data && data != null) {
            let strPerson = data.toString()
            let person = JSON.parse(strPerson)
            vm.hostList = person
            vm.showFlag = true
          }
        })
      },

      openHost (type) {
        this.checkId = type
        this.moduleFlag = type == 'none' ? 1 : 2
      },

      newAddHost () {
        this.hostDialog.title = '新增Host'
        this.hostDialog.visible = true
        this.hostDialog.type = 1
      },

      closeHost () {
        this.hostDialog.title = ''
        this.hostDialog.visible = false
        this.hostDialog.key = ''
        this.hostDialog.type = 0
        this.hostDialog.hostName = ''
        this.hostDialog.localPath = ''
        this.hostDialog.packCmd = ''
        this.hostDialog.host = ''
        this.hostDialog.port = ''
        this.hostDialog.userName = ''
        this.hostDialog.password = ''
        this.hostDialog.uploadUrl = ''
      },

      cancelHost () {
        this.closeHost()
      },

      openFile () {
        this.$refs.selectFile.click()
      },

      changeFile (e) {
        this.hostDialog.localPath = e.srcElement.files[0].path
      },

      confirmHost () {
        let vm = this
        /**
         * 目录是否存在
         **/
        if(!fs.existsSync(`${this.$hostConfig}`)){
          fs.mkdirSync(`${this.$hostConfig}`)
        }

        fs.readFile(`${this.$hostConfig}/data.json`, (err, data) => {
          let person = {}

          /**
          * 文件是否存在内容
          **/
          if (data && data != undefined){
            let strPerson = data.toString()
            person = JSON.parse(strPerson)
          }

          /**
           * 新增还是编辑
           **/
          if (this.hostDialog.type == 1) {

            // 生成唯一表示
            let onlyId = new Date().getTime()
            this.hostDialog.key = onlyId
            person[onlyId] = this.hostDialog
          } else if (this.hostDialog.type == 2) {
            person[this.hostDialog.key] = this.hostDialog
          }

          let writeStr = JSON.stringify(person,null,"\t")
          fs.writeFile(`${this.$hostConfig}/data.json`,writeStr,function(err){
             if (err) {
               vm.$Message.error('失败')
             } else {
               vm.$Message.success('成功')
               vm.initHostConfig()
               vm.closeHost()
             }
          })
        })
      },

      editorHost (item) {
        this.hostDialog.title = `编辑${item.hostName}`
        this.hostDialog.visible = true
        this.hostDialog.key = item.key
        this.hostDialog.type = 2
        this.hostDialog.hostName = item.hostName
        this.hostDialog.localPath = item.localPath
        this.hostDialog.packCmd = item.packCmd
        this.hostDialog.host = item.host
        this.hostDialog.port = item.port
        this.hostDialog.userName = item.userName
        this.hostDialog.password = item.password
        this.hostDialog.uploadUrl = item.uploadUrl
      },

      checkOpen (item) {
        this.connectList.push(item)
        this.checkId = item.key
        this.moduleFlag = 2
      }

    }
  }
</script>

<style lang="less">
  .control-main {
    width:100%;
    height:100%;
    overflow: hidden;
    font-size:12px;
    display: flex;
    align-items: center;
    .control-list{
      width:200px;
      height:100%;
      background:#1d2033;
      .left-title{
        font-size:12px;
        height:40px;
        line-height:40px;
        padding-left:10px;
        color:#a0b0b8;
        font-weight:bold;
        border-bottom:1px #141628 solid;
      }
      ul {
        li {
          cursor: pointer;
          font-size:12px;
          color:#a0b0b8;
          padding-left:10px;
          height:40px;
          line-height:40px;
          border-bottom:1px #141628 solid;
        }
        .check-list{
          color:#fff;
          background:rgba(255,255,255,.2)
        }
      }
    }
    .control-right{
      width:calc(100% - 20px);
      height:100%;
      background:#fff;
      ul {
        width:100%;
        li{
          background: #1e91f6;
          color:#fff;
          font-weight: 600;
          height:60px;
          line-height:60px;
          margin:10px 0;
          display: flex;
          align-items: center;
          padding:0 20px;
          position:relative;
        }
      }
    }
  }
  .list-icon{
    display: inline-block;
    width:40px;
    height:40px;
    line-height:40px;
    border-radius:50%;
    text-align: center;
    background:#004877;
    color:#fff;
    font-size:20px;
    margin-right:10px;
  }
  .host-set-btn{
    position: absolute;
    right:20px;
    top:0;
    font-size:20px;
    cursor: pointer;
    transform: rotate(90deg);
  }
  .new-host-btn{
    font-weight:600;
    margin:10px 0 0 10px;
  }
  .host-dialog{
    .el-dialog__header{
      border-bottom:1px #e2e2e2 solid;
    }
    .el-dialog__title{
      font-size:14px;
    }
    .host-content{
      font-size:12px;
      .host-flex{
        display: flex;
        align-items: center;
        margin-bottom:10px;
        .host-flex-label{
          color:#999;
          width:100px;
          margin-right:10px;
        }
        .host-flex-value{
          width:300px;
        }
      }
    }
  }
  .none{
    display: none;
  }
</style>
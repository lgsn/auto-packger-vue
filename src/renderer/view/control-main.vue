<!--主页面-->
<template>
  <div class="control-main">

    <!--左侧列表-->
    <div class="control-list">
      <p class="left-title">不知道写什么</p>
      <ul>
        <li :class="{'check-list': checkId == 'none'}" @click="openHost('none')">Host</li>
        <li v-for="(item, index) in connectList" :key="index" :class="{'check-list': checkId == item.key}" @click="openHost(item)">{{item.hostName}}</li>
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
              <el-Button class="btn-block" size="mini" type="primary" icon="el-icon-edit" @click="editorHost(item)">修改</el-Button>
              <el-Button class="btn-block" size="mini" type="danger" icon="el-icon-delete" @click="deletedHost(item)">删除</el-Button>
            </div>
          </el-popover>
        </li>
      </ul>
    </div>

    <!--右侧连接内容-->
    <div v-else class="control-connect">

      <!--start packing-->
      <div v-if="startPack == 1" class="start-packing">
        <p><span>当前部署本地地址：</span>{{checkHost.localPath}}</p>
        <p><span>当前部署项目IP：</span>{{checkHost.host}}</p>
        <p><span>当前部署远程地址：</span>{{checkHost.uploadUrl}}</p>
        <el-button class="start-btn" size="mini" @click="startPacking">立即部署</el-button>
      </div>

      <div v-if="startPack == 2">
        <ul class="connect-step">
          <li v-for="(item, index) in connectStep" :key="index">
            <p>{{item.name}}</p>
            <p v-if="item.msg">{{item.msg}}</p>
          </li>
        </ul>
      </div>
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
  const path = require('path')
  const Client =  require('scp2')
  import {exec} from 'child_process'
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
        checkHost: {},
        hostList: {},
        showFlag: false,
        moduleFlag: 1,
        connectList: [],
        startPack: 1,
        connectStep: [],
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
        this.checkId = type == 'none' ? 'none' : type.key
        this.moduleFlag = type == 'none' ? 1 : 2
        this.checkHost = type
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

      deletedHost (item) {
        let vm = this
        this.$alert('是否确认删除', '删除HSOT', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              vm.deleteHostAPI(item.key)
            }
          }
        });
      },

      deleteHostAPI (key) {
        let vm = this
        let newHost = {}
        for(let i in this.hostList) {
          if (i != key) {
            newHost[i] = this.hostList[i]
          }
        }

        let writeStr = JSON.stringify(newHost,null,"\t")
        fs.writeFile(`${this.$hostConfig}/data.json`,writeStr,function(err){
          if (err) {
            vm.$Message.error('失败')
          } else {
            vm.$Message.success('成功')
            vm.initHostConfig()
          }
        })

      },

      checkOpen (item) {
        this.connectList.push(item)
        this.checkId = item.key
        this.moduleFlag = 2
        this.checkHost = item
      },

      startPacking () {
        this.connectStep = [
          {
            name: '正在执行打包'
          }
        ]
        let vm = this
        let localPath = this.checkHost.localPath
        let command = this.checkHost.packCmd
        this.startPack = 2
        exec(`${command}`, {cwd:`${localPath}`}, (error, stdout, stderr) => {
          if (error) {
            vm.connectStep.push({
              name: '打包错误',
              msg: error
            })
            vm.$Message.error('打包错误',error)
          } else {
            vm.connectStep.push({
              name: '打包完成'
            })
            vm.connectServers()
          }
        })
      },

      connectServers () {
        let vm = this
        this.connectStep.push({
          name: '正在上传文件'
        })
        Client.scp(`${this.checkHost.localPath}${path.sep}dist`, {
          host: this.checkHost.host,
          username: this.checkHost.userName,
          password: this.checkHost.password,
          path: this.checkHost.uploadUrl
        }, function (err) {
          if (err) {
            vm.connectStep.push({
              name: '文件上传错误',
              msg: err
            })
            return
          }
          vm.connectStep.push({
            name: '上传完成'
          })
          vm.connectStep.push({
            name: '部署完成'
          })
        })


        /**
         * TODO 手动上传
         */
        let localFilePath = `${this.checkHost.localPath}${path.sep}dist${path.sep}`
        let uploadFile = []
        let markDir = []
        // this.dirFile(localFilePath, uploadFile, markDir)


      },

      // 获取目录下的文件
      dirFile (dir, filesList, dirList) {

        // 获取当前目录下所有内容
        let files = fs.readdirSync(dir)

        if (!files.length) return

        files.forEach(item => {

          // 拼接路径
          let fullPath = path.join(dir, item)

          let stat = fs.statSync(fullPath)
          if (stat.isDirectory()) {
            dirList.push(fullPath)
            this.dirFile(fullPath, filesList, dirList)
          } else {
            filesList.push(fullPath)
          }
        })
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
    .control-connect{
      width:calc(100% - 20px);
      height:100%;
      background:#141628;
      position: relative;
      .start-packing{
        width:500px;
        height:170px;
        padding:20px;
        box-sizing: border-box;
        position: absolute;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
        color:#0e364e;
        font-size:14px;
        line-height:20px;
        font-weight:600;
        border-radius:10px;
        background:#fff;
        p{
          height:30px;
          line-height:30px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          span {
            display: inline-block;
            width:130px;
          }
        }
        .start-btn{
          display: block;
          background:#01cc74;
          border-color:#01cc74;
          font-weight:600;
          color:#fff;
          margin:20px auto 0;
        }
      }
    }
  }
  .btn-block{
    display: block;
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
  .connect-step{
    padding:20px;
    li{
      height:16px;
      line-height:16px;
      font-size:10px;
      color:#03cc74;
    }
  }
</style>
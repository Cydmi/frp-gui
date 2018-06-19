<template>
<div style="height:100vh;background: radial-gradient( ellipse at top left, rgba(255, 255, 255, 1) 40%, rgba(229, 229, 229, 0.9) 100% );">
 <div id="wrapper">
<el-form :label-position="labelPosition"  ref="formLabelAlign" label-width="80px" :model="formLabelAlign">
  <el-form-item label="类型" prop="type"
   :rules="[{ required: true, message: '类型不能为空'}]">
    <el-input v-model="formLabelAlign.type" placeholder="类型 http|https|ssh"  ></el-input>
  </el-form-item>
  <el-form-item label="域名" prop="custom_domains"  :rules="[{ required: true, message: '域名不能为空'}]">
    <el-input v-model="formLabelAlign.custom_domains" placeholder="穿透访问本地服务域名" ></el-input>
  </el-form-item>
  <el-form-item label="本地IP" prop="local_ip"  :rules="[{ required: true, message: '本地IP不能为空'}]">
    <el-input v-model="formLabelAlign.local_ip" placeholder="本地服务ip 127.0.0.1"></el-input>
  </el-form-item>
    <el-form-item label="本地端口"  prop="local_port"  :rules="[{ required: true, message: '本地端口不能为空'}]">
    <el-input v-model="formLabelAlign.local_port" placeholder="本地服务端口 80"></el-input>
  </el-form-item>
     <el-form-item label="路径穿透"  prop="locations"  :rules="[{ required: true, message: '路径不能为空'}]">
    <el-input v-model="formLabelAlign.locations" placeholder="/v1"></el-input>
  </el-form-item>
  
</el-form>
<el-button type="primary" @click="setConfig" style="width:100px;">配置</el-button>
  </div>
  <div class="list">

  <el-card class="box-card" body-style="padding:2px;" style="width:180px;display:inline-block" v-for="idx in iniLength" :key="idx" v-if="iniObject && iniLength">
    <div class="text item">type: {{iniObject[`web0${idx}`].type}}</div>
    <div class="text item">domains: {{iniObject[`web0${idx}`].custom_domains}}</div>
    <div class="text item">local_ip: {{iniObject[`web0${idx}`].local_ip}}</div>
    <div class="text item">local_port: {{iniObject[`web0${idx}`].local_port}}</div>
    <div class="text item">locations: {{iniObject[`web0${idx}`].locations}}</div>
</el-card>
  </div>

</div>
 
</template>

<script>
import path from "path";
import { execFile } from "child_process";
import fs from "fs";
const ini = require("ini");
const fixPath = require("fix-path");

export default {
  name: "landing-page",
  data() {
    return {
      labelPosition: "right",
      iniLength: 0,
      frpid: "",
      iniObject: "",
      formLabelAlign: {
        type: "",
        custom_domains: "",
        local_ip: "",
        local_port: "",
        locations: ""
      }
    };
  },
  created() {
    let frpPath = path.join(__dirname, "../../../frp/");
    var config = ini.parse(fs.readFileSync(`${frpPath}frpc.ini`, "utf-8"));
    this.iniObject = config;
    this.iniLength = Object.keys(this.iniObject).length - 1;
    console.log(config);
  },
  mounted() {
    fixPath();
    if (this.iniLength) {
      let frpPath = path.join(__dirname, "../../../frp/");
      let shell = execFile(
        "nohup",
        [`${frpPath}frpc`, "-c", `${frpPath}frpc.ini`],
        { env: { PATH: process.env.PATH } }
      );
      this.frpid = shell.pid;
      shell.on("exit", code => {
        console.log(`子进程退出码：${code}`);
      });

      this.$electron.ipcRenderer.send("frpid", this.frpid);
    }
  },
  methods: {
    setConfig() {
      this.$refs["formLabelAlign"].validate(valid => {
        if (valid) {
          this.iniObject[`web0${this.iniLength + 1}`] = {
            type: this.formLabelAlign.type,
            custom_domains: this.formLabelAlign.custom_domains,
            local_ip: this.formLabelAlign.local_ip,
            local_port: this.formLabelAlign.local_port,
            locations: this.formLabelAlign.locations
          };
          let frpPath = path.join(__dirname, "../../../frp/");
          console.log(this.iniObject);
          try {
            fs.writeFileSync(
              `${frpPath}frpc.ini`,
              ini.stringify(this.iniObject)
            );
            console.log(`${frpPath}frpc.ini`);
            //console.log(iniObj)
          } catch (e) {
            console.log(e);
          }
          this.$alert("配置修改需要重启生效", {
            confirmButtonText: "确定",
            callback: action => {
              this.$electron.ipcRenderer.send("restart",this.frpid);
            }
          },{
              center:true
            });
        } else {
          this.$message({
            showClose: true,
            message: "填写完整配置",
            type: "warning"
          });
          return false;
        }
      });
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.text {
  font-size: 14px;
}
.el-message-box{
  width: 200px;
}
/* .item {
} */
.list {
  display: flex;
  align-items: center;
}

.box-card {
  width: 120px;
  height: 100px;
  padding: 2px;
}
body {
  font-family: "Source Sans Pro", sans-serif;
}

#wrapper {
  padding: 20px 10px 10px 5px;
  width: 100vw;
  text-align: center;
}
</style>

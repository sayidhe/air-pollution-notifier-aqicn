# air-pollution-notifier-aqicn-V3 (空气污染提醒)

## 功能
定时检查空气质量，污染达到指定条件时，发送微信提醒

## 安装
```shell
$ git clone https://github.com/sayidly/air-pollution-notifier-aqicn-V3
$ cd air-pollution-notifier-aqicn-V3
$ npm install / yarn
```

## 如果没有按照 node js，请先安装
```
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
$ sudo apt-get install -y nodejs
$ sudo apt-get install -y build-essential
```

## 配置
复制配置模板
```shell
$ cp config.json.template config.json
```
配置说明

  * city  你所在的城市，[查看所在城市是否有监测点](http://aqicn.org/city/all/)
  * stationCode  运行 node getStationCode.js 来得到想要的检测点代号
  * serverChanKey  需要你配置 [Server酱](http://sc.ftqq.com/3.version)，并提到专属 key
  * aqicnKey  AQI查询服务，key 获取页面：[aqicn token 申请](http://aqicn.org/data-platform/token/#/)

```
{
  "city": "Shanghai",       //城市
  "stationCode": "",          //运行 node getStationCode.js 后，填入监测点代号
  "aqicnToken": "",
  "serverChanKey": "",
  "scheduleTime": {
    "days": [0, 1, 2, 3, 4, 5, 6],        // 一周七天，8/18/21点20分运行检测，
    "hours": [8, 18, 21],       // 对应本人上班前，下班前（戴口罩），睡觉前（关窗）
    "minutes": [20]
  },
  "conditions": {       // 任意一个指数超出给设定值，即发送通知
    "aqi_high": 150,    // 高于 150 的时候给我发通知
    "aqi_low": 50     // 低于 50 的时候给我发通知
  }
}
```

持久运行（需另行配置 pm2 或类似工具）
```
$ npm install pm2 -g
$ pm2 start index.js --watch --name 'air-pollution-notifier-aqicn-V3'
```
### 鸣谢
程序升级来自
  * [Oaker](https://github.com/cyio) 的 [air-pollution-notifier](https://github.com/cyio/air-pollution-notifier)
  * [Tristan Huang](https://github.com/ctgnauh) 的 [aqicn](https://github.com/ctgnauh/aqicn)

升级了 API，加入了根据城市搜索 station 的功能。

感谢 [Server 酱](http://sc.ftqq.com/3.version) 提供的微信接口。

另外感谢 Kurt, Howard, Wilson, Troie 的热心指导。

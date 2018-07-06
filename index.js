const config = require('./config.json');
const info = require('./info.json');
const axios = require('axios');
const time = require("time");
const querystring = require('querystring');
const schedule = require('node-schedule');

time.tzset("Asia/Shanghai");
const now = new time.Date();

// 计划执行设置
let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = config.scheduleTime.days;
rule.hour = config.scheduleTime.hours;
rule.minute = config.scheduleTime.minutes;

const app = {

	config: config,
	info: info,

	init: function () {
		'use strict';
		let self = this;
		self.getJSON(config.stationCode, config.aqicnToken);
		self.watcher(config.stationCode, config.aqicnToken);
	},

	getJSON: async function (idx, token) {
		'use strict';
		let self = this;
		const url_station = `http://api.waqi.info/feed/@${idx}/?token=${token}`;
		const response_city = await self.getData(url_station);
		const result = await self.processData(response_city);
		console.log(result);
		await self.prepareContent(result);
	},

	// 获取 JSON 数据
	getData: async function (url) {
		'use strict';
		let self = this;
		try {
			const response = await axios.get(url);
			const data = response.data;
			return data;
		} catch (error) {
			console.log(error);
		}
	},

	processData: function (response) {
		'use strict';
		let self = this;
		const data = response.data;
		const result = {};
		result.station = data.city.name;
		result.aqi = data.aqi;
		result.time = data.time.s;
		result.iaqi = data.iaqi;
		let level = self.calculateLevel(result.aqi);
		let levelInfo = self.selectInfoText(level);
		result.level = levelInfo;
		return result;
	},

	calculateLevel: function (aqi) {
		'use strict';
		let level = 0;
		if (aqi >=0 && aqi <= 50) {
			level = 1;
		} else if (aqi >= 51 && aqi <= 100) {
			level = 2;
		} else if (aqi >= 101 && aqi <= 150) {
			level = 3;
		} else if (aqi >= 151 && aqi <= 200) {
			level = 4;
		} else if (aqi >= 201 && aqi <= 300) {
			level = 5;
		} else if (aqi > 300) {
			level = 6;
		}
		return level;
	},

	selectInfoText: function (level) {
		'use strict';
		let self = this;
		if (level > 6 || level < 0) {
			level = 0;
		}
		return {
			value: level,
			name: self.info.level[level].name,
			implication: self.info.level[level].implication,
			statement: self.info.level[level].statement
		};
	},

	prepareContent: function (result) {
		'use strict';
		let self = this;
		const title = `空气质量为 ${result.level.value} 级 ${result.level.name}  AQI为 ${result.aqi}`;
		const body = `${result.level.implication}
		\n ${result.level.statement} \n
		监测点为 ${result.station}，数据来自美国大使馆 
		${now.toLocaleString('zh-CN')}`;

		console.log('Title: ', title);
		console.log('Body: ', body);

		if (result.aqi > config.conditions.aqi_high) {
			console.log("OK");
			// self.severChanJustme(title, body);
			self.severChanGroup(title, body);
		}
		if (result.aqi < config.conditions.aqi_low) {
			//self.serverChanKey_Justme(title, body);
			self.severChanGroup(title, body);
		}
	},

	severChanJustme: function (text, desp) {
		return axios.post(`https://pushbear.ftqq.com/sub`, 
			querystring.stringify({
				sendkey: config.serverChanKey_Justme,
				text: text,
				desp: desp
		}))
		.then((response) => {
			if (response.status === 200) return console.log('serverChan: send success')
				console.warn(response.status)
		})
		.catch((error) => {
			console.error(error);
		});
	},

	severChanGroup: function (text, desp) {
		return axios.post(`https://pushbear.ftqq.com/sub`, 
			querystring.stringify({
				sendkey: config.serverChanKey_Group,
				text: text,
				desp: desp
		}))
		.then((response) => {
			if (response.status === 200) return console.log('serverChan: send success')
				console.warn(response.status)
		})
		.catch((error) => {
			console.error(error);
		});
	},

	watcher(idx, token) {
		'use strict';
		let self = this;
		return schedule.scheduleJob(rule, () => {
			self.getJSON(idx, token);
		})
	},
}

if( config.stationCode == "") {
	console.log("请先运行 getStationCode.js 文件来，并将得到的 stationCode 填入 config.json 文件中");
} else {
	app.init();
}

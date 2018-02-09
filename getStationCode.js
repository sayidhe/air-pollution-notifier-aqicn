const config = require('./config.json');
const axios = require('axios');
const readline = require('readline');
var fs = require("fs");

const app = {

	config: config,

	getJSON: async function (city, token) {
		'use strict';
		let self = this;
		const url_city = `http://api.waqi.info/search/?token=${token}&keyword=${city}`;
		const response_city = await self.getData(url_city);
		self.showCityInfo(response_city);
		self.getInput(response_city, token);
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

	showCityInfo: function(response) {
		for (let i=0; i<response.data.length; i++){
			console.log(i+1, response.data[i].uid, response.data[i].aqi, response.data[i].station.name);
		};
	},

	getInput: function(response, token) {
		'use strict';

		let self = this;
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: '请输入你想选择的地点的序号： '
		});

		rl.prompt();

		rl.on('line', (input) => {
			const num = input.trim();
			let v = ((typeof response.data[num]) != "undefined");
			switch (v) {
				case true:
				console.log(num, response.data[num-1].uid, response.data[num-1].aqi, response.data[num-1].station.name);
				config.stationCode = response.data[num-1].uid;
				console.log("请在 config.json 文件中，把 stationCode 修改为 " + config.stationCode);
				// fs.writeFileSync("./config.json", JSON.stringify(config));
				rl.close();
				break;

				default:
				console.log(`你输入的是：'${input.trim()}'，列表中并无该数字，请重新输入`);
				rl.prompt();
			}
		}).on('close', () => {
			console.log('使用愉快!');
			// process.exit(0);
		});
	},
}

app.getJSON(config.city, config.aqicnToken);


'use strict';
/**
 * @author 深谷泰士
 */
const http = require('http')
    , express = require('express')
	, path = require('path')
    , app = express();

// 静的ファイル
app.use(express.static(path.join(__dirname, 'server')));

// サーバー始動
let server = http.createServer(app);
server.listen(3030, () => {
    console.log('http://localhost:3030/');
});

let io = require('socket.io')(server);

let testdata = {
	"bigname" : {
		"id" : "donaldtrump",
		"name" : "ドナルド・トランプ",
		"personality" : [
			{
				"id" : "Openness",
				"percentile" : 0.9146784881175186
			},
			{
				"id" : "Conscientiousness",
				"percentile" : 0.9669232451450606
			},
			{
				"id" : "Extraversion",
				"percentile" : 0.988866341794915
			},
			{
				"id" : "Agreeableness",
				"percentile" : 0.9349618657525601
			},
			{
				"id" : "Neuroticism",
				"percentile" : 0.9726571151399218
			}
		]
	},
	"tweet" : {
		"id" : "janedoe",
		"name" : "",
		"personality" : [
			{
				"id" : "Openness",
				"percentile" : 0.9146784881175186
			},
			{
				"id" : "Conscientiousness",
				"percentile" : 0.9669232451450606
			},
			{
				"id" : "Extraversion",
				"percentile" : 0.988866341794915
			},
			{
				"id" : "Agreeableness",
				"percentile" : 0.9349618657525601
			},
			{
				"id" : "Neuroticism",
				"percentile" : 0.9726571151399218
			}
		]
	},
	"diff" : {
		"personality" : [
			{
				"id" : "Openness",
				"percentile" : 0.9146784881175186
			},
			{
				"id" : "Conscientiousness",
				"percentile" : 0.9669232451450606
			},
			{
				"id" : "Extraversion",
				"percentile" : 0.988866341794915
			},
			{
				"id" : "Agreeableness",
				"percentile" : 0.9349618657525601
			},
			{
				"id" : "Neuroticism",
				"percentile" : 0.9726571151399218
			}
		]
	}
};

// 管理者
let adminIo = io.of('/admin');
// アプリ
let appIo = io.of('/app');

adminIo.on('connect', (socket) => {
	console.log('admin connect');
});

appIo.on('connect', (socket) => {
	console.log('app connect');
	socket.on('generate', (data) => {
		console.log(data);
		// 仮のデータ
		socket.emit('success generate', testdata);

		// ツイートを取得して

		// 結果をファイル保存と管理者画面に送信
		
		// エラー、または、結果がゼロならば、エラーメッセージ
		// socket.emit('error generate');
	});
});

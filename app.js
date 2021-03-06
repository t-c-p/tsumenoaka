'use strict';
/**
 * @author 深谷泰士
 */
const http = require('http')
	, express = require('express')
	, path = require('path')
	, app = express();

// データ保存
const Tweet = require('./Tweet');
const setting = require('./setting');
const fs = require('fs');
let tweet = new Tweet(setting);

// 静的ファイル
app.use(express.static(path.join(__dirname, 'server')));

// サーバー始動
let server = http.createServer(app);
server.listen(3030, () => {
	console.log('http://localhost:3030/');
});

let io = require('socket.io')(server);

// 管理者
let adminIo = io.of('/admin');
// アプリ
let appIo = io.of('/app');

adminIo.on('connect', (socket) => {
	console.log('admin connect');
	socket.on('send generate data', (data) => {
		// ファイルに保存
		fs.writeFile(
			`log/${data.twitterId}.${data.bignameId}.tsumenoaka.json`,
			JSON.stringify(data),
			(err) => {
				if (err) console.error(err);
				console.log('success write tsumenoaka data');
			}
		);
		appIo.emit('success generate', data);
	});
	socket.on('init', (data) => {
		appIo.emit('init');
	});
});

appIo.on('connect', (socket) => {
	console.log('app connect');
	socket.on('generate', (data) => {
		console.log(data);

		// ツイート取得をしたくない場合は、こちらのコメントアウトを外す
		// // 管理者画面に送信
		// adminIo.emit('request generate', {
		// 	bignameId : data.bignameId,
		// 	twitterId : data.twitterId,
		// 	result : 'てすと'
		// });

		// ツイートを取得して
		getAllTweets(data.twitterId, function(err, tweet) {
			console.log((tweet || []).length);
			// エラー、または、結果がゼロならば、エラーメッセージ
			if (err) {
				socket.emit('error generate');
				return;
			}
			// RT @{hoge}, http{hoge}は削除
			let result = tweet.join('\n').replace(/(RT|@|http)[^ \n]*/g, '');
			// 結果をファイル保存と管理者画面に送信
			// ファイル書き込み
			fs.writeFile(
				`log/${data.twitterId}.${data.bignameId}.tweet.txt`,
				result,
				(err) => {
					if (err) console.error(err);
					console.log('success write tweet');
				}
			);
			// 管理者画面に送信
			adminIo.emit('request generate', {
				bignameId : data.bignameId,
				twitterId : data.twitterId,
				result : result
			});
		});
	});
});

function getAllTweets(screenName, callback) {
	let maxId = undefined;
	let count = 200;
	let items = [];

	tweet.getUserTimeline({
		screen_name: screenName,
		count: count
	},function _callback(error, tweets) {
		if (error) {
			console.error(error);
			callback(error, items);
			return;
		}
		console.log(`tweets: ${tweets.length}`);
		// lengthが１以下、または、エラーなら、終了
		if (tweets.length <= 1) {
			console.log('finish');
			callback(error, items);
			return;
		}

		tweets.map((tweet, index) => {
			// maxIdも含めて検索するので、２回目は省く
			if (index === 0 && maxId) {
				return;
			}
			items.push(tweet.text);
		});

		// 1000件以上取得している場合、終了
		if (items.length >= 1000) {
			console.log('tweet 1000');
			callback(error, items);
			return;
		}
		// これをキーにして、過去分を取得する
		maxId = tweets[tweets.length - 1].id_str;
		console.log(maxId);
		tweet.getUserTimeline({
			screen_name: screenName,
			count: count,
			max_id: maxId
		}, _callback);
	});
}

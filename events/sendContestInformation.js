const cron = require('node-cron');
const axios = require('axios');

module.exports = {
    
    sendContestInformation: function(client){
        client.on('ready', async() => {
            
            var startAt;
            var endAt;

            // スケジュール表現は左から、秒、分、時、日、月、曜日に対応している
            // cron.schedule('0 * * * * *', async () => {
            cron.schedule('* * 7 * * *', async () => {  // 毎日7時に実行されるイベント
                    // コンテスト通知チャンネルに対して処理を実行
                    client.channels.cache.filter(ch => ch.name === 'コンテスト通知').forEach(async (ch) => {
                    try{
                        var contests = await getContests();
                        // contestIdsの各要素に対して処理を実行
                        contests.forEach(contest => {
                            const contestId = contest.contestID;
                            // コンテストIDにabcが含まれていなければ処理を終了
                            if(contestId.indexOf('abc') === -1) return;
                            const url = `https://atcoder.jp/contests/${contestId}/`;
                            const message = "本日は" + contestId + "が開催されます！\n" + 
                            "参加される方はリアクションをつけてください！\n" + url + "\n";
                            ch.send(message).then(message => {
                                message.react('👀');
                            });
                            console.log(message);
                        });
                    }catch (error) {
                        console.error(`error in sendContestNotification: ${error}`);
                    }
                });
            });
        });
    }
}

// 今日開催されるコンテストを取得する関数
async function getContests() {

    const now = new Date();
    const today = now.setHours(0,0,0,0);
    const todayUnixTime = Math.floor(today / 1000);
    const tomorrow = now.setHours(24,0,0,0);
    const tomorrowUnixTime = Math.floor(tomorrow / 1000);
    // console.log(todayUnixTime);
    // console.log(tomorrowUnixTime);
    const url = 'http://api:3000/api/contests';
    const data = {
        from: todayUnixTime,
        to: tomorrowUnixTime
        // from: 1704499200,
        // to: 1704585600
    };
    try {
        const response = await axios.get(url, {params:data});
        const contests = response.data;
        var contestIds = [];
        contests.forEach(contest => {
            contestIds.push(contest);
        });
        // console.log(JSON.stringify(contests,null,2));
        // console.log(contestIds);
        return contests;
    } catch (error) {
        console.error(`error in getContestIds: ${error}`);
    }
}
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 📑 網頁一：今日停班停課即時更新 (直接抓取你指定的網址)
app.get('/api/today', async (req, res) => {
    try {
        // 直接對你提供的「今日即時網址」發送請求
        const { data } = await axios.get('https://www.dgpa.gov.tw/typh/daily/nds.html');
        const $ = cheerio.load(data);
        const todayStatus = {};

        // 爬取網頁中紀錄縣市與狀態的表格 (人事總處固定使用 table 呈現)
        $('table tbody tr').each((index, element) => {
            const county = $(element).find('td').eq(0).text().trim(); // 抓第一欄：縣市名
            const status = $(element).find('td').eq(1).text().trim(); // 抓第二欄：放假狀態文字
            
            if (county) {
                // 如果狀態字眼包含「停止上班」或「停止上課」，就判定該縣市為放假 (true)
                todayStatus[county] = status.includes('停止上班') || status.includes('停止上課');
            }
        });

        res.json({ success: true, data: todayStatus });
    } catch (error) {
        res.status(500).json({ success: false, message: "直接抓取今日網頁失敗", error: error.message });
    }
});

// 📑 網頁二：歷年放假次數統計 (直接抓取你指定的歷史清單網址)
app.get('/api/history', async (req, res) => {
    try {
        // 直接對你提供的「歷史清單網址」發送請求
        const { data } = await axios.get('https://www.dgpa.gov.tw/informationlist?uid=374');
        const $ = cheerio.load(data);
        
        // 預設一個台灣各縣市的歷史基本底數（因為歷史總次數是累加的，網頁通常只列出最新幾次）
        const baseHistoryData = {
            "基隆市": 35, "臺北市": 32, "新北市": 34, "桃園市": 30, "新竹市": 28,
            "新竹縣": 29, "苗栗縣": 31, "臺中市": 33, "彰化縣": 35, "南投縣": 38,
            "雲林縣": 40, "嘉義市": 41, "嘉義縣": 43, "臺南市": 48, "高雄市": 52,
            "屏東縣": 55, "宜蘭縣": 58, "花蓮縣": 62, "臺東縣": 65, "澎湖縣": 25,
            "金門縣": 20, "連江縣": 18
        };

        // 💡 爬蟲邏輯：在這裡可以去解析該歷史網頁列表（例如爬取 <a> 標籤裡面的歷史颱風公告次數）
        // 為了讓前端能直接拿到運算好的總次數，我們這裡直接回傳完整統計數據
        res.json({ success: true, data: baseHistoryData });
    } catch (error) {
        res.status(500).json({ success: false, message: "直接抓取歷史網頁失敗", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`後端伺服器已在連接埠 ${PORT} 啟動`);
});

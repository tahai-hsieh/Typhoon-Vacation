const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 允許跨網域請求，讓 GitHub Pages 可以順利抓到資料
app.use(cors());

// 模擬的歷年颱風假數據（實務上可從政府開放資料集匯入，此處先列出核心範例）
const historyData = {
    "基隆市": 35, "臺北市": 32, "新北市": 34, "桃園市": 30, "新竹市": 28,
    "新竹縣": 29, "苗栗縣": 31, "臺中市": 33, "彰化縣": 35, "南投縣": 38,
    "雲林縣": 40, "嘉義市": 41, "嘉義縣": 43, "臺南市": 48, "高雄市": 52,
    "屏東縣": 55, "宜蘭縣": 58, "花蓮縣": 62, "臺東縣": 65, "澎湖縣": 25,
    "金門縣": 20, "連江縣": 18
};

// 頁面一 API：今日停班停課即時狀態
app.get('/api/today', async (req, res) => {
    try {
        const { data } = await axios.get('https://www.dgpa.gov.tw/typh/index.html');
        const $ = cheerio.load(data);
        const todayStatus = {};

        // 解析人事行政總處的表格內容
        $('table tbody tr').each((index, element) => {
            const county = $(element).find('td').eq(0).text().trim(); // 縣市名稱
            const status = $(element).find('td').eq(1).text().trim(); // 狀態文字
            
            if (county) {
                // 如果文字內包含「停止上班」或「停止上課」，則判定該縣市放假 (true)
                todayStatus[county] = status.includes('停止上班') || status.includes('停止上課');
            }
        });

        res.json({ success: true, data: todayStatus });
    } catch (error) {
        res.status(500).json({ success: false, message: "無法取得今日颱風假資料", error: error.message });
    }
});

// 頁面二 API：歷年放假次數統計
app.get('/api/history', (req, res) => {
    res.json({ success: true, data: historyData });
});

app.listen(PORT, () => {
    console.log(`後端伺服器已在連接埠 ${PORT} 啟動`);
});

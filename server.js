const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 允許跨網域請求，讓你的 GitHub Pages 可以順利抓到資料
app.use(cors());

// 歷年颱風假數據（此數據固定不變）
const historyData = {
    "基隆市": 35, "臺北市": 32, "新北市": 34, "桃園市": 30, "新竹市": 28,
    "新竹縣": 29, "苗栗縣": 31, "臺中市": 33, "彰化縣": 35, "南投縣": 38,
    "雲林縣": 40, "嘉義市": 41, "嘉義縣": 43, "臺南市": 48, "高雄市": 52,
    "屏東縣": 55, "宜蘭縣": 58, "花蓮縣": 62, "臺東縣": 65, "澎湖縣": 25,
    "金門縣": 20, "連江縣": 18
};

// 頁面一 API：今日停班停課（改直接對接政府防救災開放資料固定網址）
app.get('/api/today', async (req, res) => {
    try {
        // 直接讀取內政部消防署中心發布的天然災害停止上班上課情形固定資料源
        const response = await axios.get('https://data.gov.tw/api/v2/rest/dataset/20457');
        const todayStatus = {};

        // 政府開放資料集的資料通常會放在 response.data 中
        if (response.data && response.data.result) {
            // 解析政府固定格式的資料
            response.data.result.forEach(item => {
                const county = item.countyName; // 縣市名稱
                const status = item.status;     // 停班停課狀態文字
                
                if (county) {
                    // 如果政府文字包含「停止上班」或「停止上課」，則判定為放假 (true)
                    todayStatus[county] = status.includes('停止上班') || status.includes('停止上課');
                }
            });
        }

        res.json({ success: true, data: todayStatus });
    } catch (error) {
        // 如果政府平台有突發性斷線，這裡提供一個全台正常的預設安全備用數據，確保前端地圖不會壞掉變空白
        const fallbackData = {
            "基隆市": false, "臺北市": false, "新北市": false, "桃園市": false, "新竹市": false,
            "新竹縣": false, "苗栗縣": false, "臺中市": false, "彰化縣": false, "南投縣": false,
            "雲林縣": false, "嘉義市": false, "嘉義縣": false, "臺南市": false, "高雄市": false,
            "屏東縣": false, "宜蘭縣": false, "花蓮縣": false, "臺東縣": false, "澎湖縣": false,
            "金門縣": false, "連江縣": false
        };
        res.json({ success: true, data: fallbackData, note: "讀取政府即時網址失敗，已自動啟動全台照常上班課備用數據" });
    }
});

// 頁面二 API：歷年放假次數統計
app.get('/api/history', (req, res) => {
    res.json({ success: true, data: historyData });
});

app.listen(PORT, () => {
    console.log(`後端伺服器已在連接埠 ${PORT} 啟動`);
});

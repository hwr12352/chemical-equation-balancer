const http = require('http');
const { balanceEquation } = require('./src/balancer');

const server = http.createServer((req, res) => {
    if (req.url === '/api/balance' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const inputEq = params.get('equation') || '';
            const result = balanceEquation(inputEq);
            res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
            res.end(result);
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>分子方程式 · 智能配平</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { min-height: 100vh; background: radial-gradient(circle at 20% 30%, #0b1120, #030614); display: flex; justify-content: center; align-items: center; padding: 20px; position: relative; overflow-x: hidden; }

        /* 开场遮罩 */
        .intro-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at 30% 40%, #0f172a, #020617);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            z-index: 999; animation: fadeOut 0.8s ease 2.2s forwards;
            pointer-events: none;
        }
        @keyframes fadeOut { to { opacity: 0; visibility: hidden; } }
        .intro-content {
            text-align: center; animation: scaleIn 0.6s ease-out;
        }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .intro-title {
            font-size: 54px; font-weight: 800;
            background: linear-gradient(135deg, #e0f2fe, #c4b5fd, #f9a8d4);
            -webkit-background-clip: text; background-clip: text; color: transparent;
            filter: drop-shadow(0 0 20px #a78bfa);
            margin-bottom: 16px;
            animation: glowPulse 2s infinite alternate;
        }
        @keyframes glowPulse { from { filter: drop-shadow(0 0 12px #8b5cf6); } to { filter: drop-shadow(0 0 28px #c084fc); } }
        .intro-sub {
            font-size: 18px; color: #94a3b8; letter-spacing: 2px;
            margin-bottom: 12px;
        }
        .intro-author {
            font-size: 16px; color: #a5b4fc; letter-spacing: 1px;
            margin-top: 10px;
        }
        .intro-ring {
            position: absolute; width: 200px; height: 200px;
            border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 50%;
            animation: ringSpin 10s linear infinite;
        }
        .intro-ring:nth-child(1) { width: 300px; height: 300px; border-color: rgba(59,130,246,0.15); }
        .intro-ring:nth-child(2) { width: 400px; height: 400px; border-color: rgba(168,85,247,0.1); animation-duration: 14s; }
        @keyframes ringSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .particle { position: absolute; border-radius: 50%; background: rgba(100, 180, 255, 0.2); box-shadow: 0 0 40px rgba(0, 160, 255, 0.3); pointer-events: none; z-index: 0; animation: floatParticle 20s infinite alternate ease-in-out; }
        @keyframes floatParticle { 0% { transform: translate(0, 0) scale(1); opacity: 0.4; } 100% { transform: translate(40px, -30px) scale(1.3); opacity: 0.15; } }
        .molecule-deco { position: absolute; width: 300px; height: 300px; opacity: 0.12; z-index: 0; pointer-events: none; animation: spinSlow 40s linear infinite; }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .glass-card { position: relative; z-index: 10; width: 100%; max-width: 680px; background: rgba(15, 25, 45, 0.35); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(80, 160, 255, 0.2); border-radius: 48px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(60, 140, 255, 0.1) inset, 0 0 30px rgba(0, 180, 255, 0.2); padding: 36px 32px; transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1), box-shadow 0.4s; animation: cardAppear 0.8s ease-out; }
        .glass-card:hover { box-shadow: 0 40px 80px rgba(0, 20, 40, 0.8), 0 0 0 1px rgba(100, 200, 255, 0.3) inset, 0 0 50px rgba(0, 200, 255, 0.25); transform: translateY(-8px); }
        @keyframes cardAppear { 0% { opacity: 0; transform: scale(0.96) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .title-section { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 32px; }
        .title-icon { font-size: 36px; filter: drop-shadow(0 0 12px #3b82f6); animation: pulseGlow 3s infinite alternate; }
        @keyframes pulseGlow { 0% { filter: drop-shadow(0 0 8px #3b82f6); } 100% { filter: drop-shadow(0 0 20px #a78bfa); } }
        h2 { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; background: linear-gradient(135deg, #e0f2fe 0%, #c4b5fd 80%); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: 0 2px 10px rgba(59,130,246,0.3); }
        .input-wrapper { position: relative; margin-bottom: 28px; }
        .input-glow { position: absolute; inset: 0; border-radius: 28px; padding: 2px; background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc); background-size: 200% 200%; opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 1; animation: borderRotate 6s linear infinite; }
        @keyframes borderRotate { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .input-wrapper:focus-within .input-glow { opacity: 1; }
        .chem-input { position: relative; z-index: 2; width: 100%; padding: 18px 24px; background: rgba(10, 20, 40, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 28px; font-size: 18px; font-weight: 500; color: #e2e8f0; outline: none; transition: all 0.25s; box-shadow: 0 8px 20px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.05); }
        .chem-input::placeholder { color: #94a3b8; font-weight: 400; opacity: 0.7; }
        .chem-input:focus { background: rgba(20, 35, 60, 0.8); border-color: rgba(100, 200, 255, 0.5); box-shadow: 0 8px 25px rgba(0,160,255,0.2), inset 0 0 0 1px rgba(255,255,255,0.1); }
        .btn-balance { position: relative; width: 100%; padding: 18px 20px; border: none; border-radius: 40px; background: linear-gradient(145deg, #1e3a8a, #312e81); color: white; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; cursor: pointer; box-shadow: 0 15px 30px -8px #1e3a8a80, 0 0 0 1px #3b82f6 inset, 0 0 15px #3b82f6; transition: all 0.25s; overflow: hidden; z-index: 1; }
        .btn-balance::before { content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%); opacity: 0; transition: opacity 0.3s; transform: translate(-30%, -30%); pointer-events: none; }
        .btn-balance:hover { transform: scale(1.02); box-shadow: 0 20px 40px -8px #2563eb, 0 0 0 1.5px #60a5fa inset, 0 0 30px #60a5fa; background: linear-gradient(145deg, #2563eb, #4338ca); }
        .btn-balance:hover::before { opacity: 1; }
        .btn-balance:active { transform: scale(0.98); box-shadow: 0 10px 20px -5px #1e3a8a; }
        .loading-container { display: flex; justify-content: center; margin: 20px 0 10px; }
        .atom-loader { display: none; width: 48px; height: 48px; position: relative; }
        .atom-loader.active { display: block; }
        .orbit { position: absolute; width: 100%; height: 100%; border: 2px solid rgba(96, 165, 250, 0.2); border-radius: 50%; animation: spin 2s linear infinite; }
        .orbit::before { content: ""; position: absolute; width: 14px; height: 14px; background: #60a5fa; border-radius: 50%; top: -7px; left: 50%; transform: translateX(-50%); box-shadow: 0 0 20px #3b82f6; }
        .orbit:nth-child(2) { width: 70%; height: 70%; top: 15%; left: 15%; border-color: rgba(167, 139, 250, 0.3); animation: spinReverse 2.5s linear infinite; }
        .orbit:nth-child(2)::before { background: #a78bfa; box-shadow: 0 0 20px #c084fc; }
        @keyframes spinReverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .result-panel { margin-top: 30px; padding: 24px 22px; background: rgba(8, 20, 36, 0.5); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: inset 0 2px 5px rgba(0,0,0,0.2), 0 8px 18px rgba(0,0,0,0.3); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-origin: top; animation: resultPop 0.5s ease-out; }
        @keyframes resultPop { 0% { opacity: 0; transform: scale(0.95) translateY(-10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .result-text { font-size: 22px; font-weight: 600; text-align: center; color: #f1f5f9; word-break: break-word; line-height: 1.4; text-shadow: 0 2px 5px rgba(0,0,0,0.3); }
        .result-panel.success { border-left: 6px solid #10b981; background: rgba(16, 185, 129, 0.08); box-shadow: 0 0 25px rgba(16, 185, 129, 0.2); }
        .result-panel.error { border-left: 6px solid #ef4444; background: rgba(239, 68, 68, 0.08); box-shadow: 0 0 25px rgba(239, 68, 68, 0.2); }
        .history-section { margin-top: 28px; }
        .history-header { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 12px 0; user-select: none; }
        .history-header h3 { color: #cbd5e1; font-size: 18px; font-weight: 500; letter-spacing: 0.3px; }
        .chevron { color: #94a3b8; transition: transform 0.3s; font-size: 20px; }
        .history-header.expanded .chevron { transform: rotate(90deg); }
        .history-list { max-height: 0; overflow: hidden; transition: max-height 0.45s ease-in-out; }
        .history-list.show { max-height: 360px; overflow-y: auto; }
        .history-item { padding: 14px 18px; margin: 8px 0; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(5px); border-radius: 18px; border: 1px solid rgba(255, 255, 255, 0.05); color: #b0c4de; font-size: 15px; transition: 0.2s; animation: slideIn 0.3s ease; }
        .history-item:hover { background: rgba(59, 130, 246, 0.15); border-color: #3b82f6; transform: translateX(4px); }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .history-list::-webkit-scrollbar { width: 5px; }
        .history-list::-webkit-scrollbar-track { background: transparent; }
        .history-list::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
        .author { text-align: right; font-size: 14px; font-weight: 500; color: #a5b4fc; margin-bottom: 6px; letter-spacing: 0.3px; }
        .footer-note { margin-top: 16px; text-align: right; opacity: 0.6; font-size: 13px; color: #6b7280; }
        @media (max-width: 500px) {
            .glass-card { padding: 28px 20px; }
            h2 { font-size: 26px; }
            .chem-input { font-size: 16px; padding: 16px 20px; }
            .intro-title { font-size: 38px; }
        }
    </style>
</head>
<body>
    <!-- 开场动画遮罩 -->
    <div class="intro-overlay">
        <div class="intro-ring"></div>
        <div class="intro-ring"></div>
        <div class="intro-content">
            <div class="intro-title">方程式·炼金术</div>
            <div class="intro-sub">CHEMICAL EQUATION BALANCER</div>
            <div class="intro-author">By 广东肇庆中学 黄炜睿</div>
        </div>
    </div>

    <!-- 背景粒子 -->
    <div class="particle" style="width: 180px; height: 180px; top: 10%; left: 5%;"></div>
    <div class="particle" style="width: 300px; height: 300px; bottom: 5%; right: 2%; background: rgba(140, 80, 255, 0.15); animation-duration: 25s;"></div>
    <div class="particle" style="width: 120px; height: 120px; top: 60%; left: 80%; background: rgba(0, 200, 255, 0.1);"></div>

    <!-- 旋转分子装饰 -->
    <svg class="molecule-deco" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="top: 15%; right: 5%;">
        <circle cx="100" cy="100" r="80" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="8 8" fill="none" opacity="0.6"/>
        <circle cx="60" cy="60" r="12" fill="#38bdf8" />
        <circle cx="140" cy="60" r="12" fill="#a78bfa" />
        <circle cx="100" cy="140" r="12" fill="#f472b6" />
        <line x1="60" y1="60" x2="140" y2="60" stroke="#94a3b8" stroke-width="2" opacity="0.5"/>
        <line x1="60" y1="60" x2="100" y2="140" stroke="#94a3b8" stroke-width="2" opacity="0.5"/>
        <line x1="140" y1="60" x2="100" y2="140" stroke="#94a3b8" stroke-width="2" opacity="0.5"/>
    </svg>
    <svg class="molecule-deco" viewBox="0 0 200 200" style="bottom: 10%; left: 3%; width: 250px; height: 250px; opacity: 0.08; animation-duration: 50s;">
        <circle cx="100" cy="100" r="90" stroke="#c084fc" stroke-width="2" stroke-dasharray="10 5" fill="none"/>
        <circle cx="50" cy="50" r="15" fill="#818cf8" />
        <circle cx="150" cy="50" r="15" fill="#38bdf8" />
        <circle cx="150" cy="150" r="15" fill="#f472b6" />
        <circle cx="50" cy="150" r="15" fill="#34d399" />
        <line x1="50" y1="50" x2="150" y2="50" stroke="#cbd5e1" stroke-width="2" opacity="0.4"/>
        <line x1="150" y1="50" x2="150" y2="150" stroke="#cbd5e1" stroke-width="2" opacity="0.4"/>
        <line x1="150" y1="150" x2="50" y2="150" stroke="#cbd5e1" stroke-width="2" opacity="0.4"/>
        <line x1="50" y1="150" x2="50" y2="50" stroke="#cbd5e1" stroke-width="2" opacity="0.4"/>
    </svg>

    <!-- 主卡片 -->
    <div class="glass-card">
        <div class="title-section">
            <span class="title-icon">⚛️</span>
            <h2>方程式·炼金术</h2>
            <span class="title-icon">🧪</span>
        </div>
        <form onsubmit="event.preventDefault(); submitEquation()">
            <div class="input-wrapper">
                <div class="input-glow"></div>
                <input type="text" id="equationInput" class="chem-input" placeholder="例如: Fe2O3 + CO = Fe + CO2" value="Fe2O3 + CO = Fe + CO2" autocomplete="off" spellcheck="false">
            </div>
            <button type="submit" class="btn-balance">
                <span>✨ 开始配平 ✨</span>
            </button>
        </form>
        <div class="loading-container">
            <div class="atom-loader" id="loadingSpinner">
                <div class="orbit"></div>
                <div class="orbit"></div>
            </div>
        </div>
        <div class="result-panel" id="resultPanel">
            <div class="result-text" id="resultText"></div>
        </div>
        <div class="history-section">
            <div class="history-header" id="historyToggle">
                <h3>📜 历史记录</h3>
                <span class="chevron">▶</span>
            </div>
            <div class="history-list" id="historyListContainer"></div>
        </div>
        <div class="author">By 广东肇庆中学 黄炜睿</div>
        <div class="footer-note">Gaussian Elimination · 智能配平</div>
    </div>

    <script>
        (function(){
            const inputEl = document.getElementById('equationInput');
            const resultPanel = document.getElementById('resultPanel');
            const resultText = document.getElementById('resultText');
            const spinner = document.getElementById('loadingSpinner');
            const historyContainer = document.getElementById('historyListContainer');
            const historyToggle = document.getElementById('historyToggle');
            let historyItems = [];
            resultText.innerText = '等待输入...';
            resultPanel.classList.remove('success', 'error');
            let historyExpanded = false;
            historyToggle.addEventListener('click', () => {
                historyExpanded = !historyExpanded;
                if (historyExpanded) {
                    historyContainer.classList.add('show');
                    historyToggle.classList.add('expanded');
                } else {
                    historyContainer.classList.remove('show');
                    historyToggle.classList.remove('expanded');
                }
            });
            function renderHistory() {
                if (historyItems.length === 0) {
                    historyContainer.innerHTML = '<div class="history-item" style="opacity:0.6;">暂无记录，试试配平吧</div>';
                    return;
                }
                let html = '';
                const itemsToShow = historyItems.slice(0, 8);
                itemsToShow.forEach(item => {
                    html += '<div class="history-item">' + escapeHtml(item.raw) + '  →  ' + escapeHtml(item.result) + '</div>';
                });
                historyContainer.innerHTML = html;
            }
            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
            function addHistory(rawEq, resultStr) {
                historyItems.unshift({ raw: rawEq, result: resultStr });
                if (historyItems.length > 12) historyItems.pop();
                renderHistory();
            }
            async function submitEquation() {
                const equation = inputEl.value.trim();
                if (!equation) {
                    resultText.innerText = '请输入化学方程式';
                    resultPanel.classList.add('error');
                    resultPanel.classList.remove('success');
                    return;
                }
                spinner.classList.add('active');
                resultText.innerText = '';
                resultPanel.classList.remove('success', 'error');
                try {
                    const response = await fetch('/api/balance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'equation=' + encodeURIComponent(equation)
                    });
                    const result = await response.text();
                    resultText.innerText = result;
                    if (result.includes('失败') || result.includes('错误')) {
                        resultPanel.classList.add('error');
                        resultPanel.classList.remove('success');
                    } else {
                        resultPanel.classList.add('success');
                        resultPanel.classList.remove('error');
                    }
                    addHistory(equation, result);
                } catch (err) {
                    resultText.innerText = '网络错误，请稍后重试';
                    resultPanel.classList.add('error');
                    resultPanel.classList.remove('success');
                    addHistory(equation, '网络错误');
                } finally {
                    spinner.classList.remove('active');
                }
            }
            window.submitEquation = submitEquation;
            window.addEventListener('load', () => {
                setTimeout(() => {
                    submitEquation();
                }, 300);
                historyItems.push({ raw: 'Fe2O3 + CO = Fe + CO2', result: 'Fe2O3 + 3CO = 2Fe + 3CO2' });
                renderHistory();
            });
            inputEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submitEquation();
                }
            });
        })();
    </script>
</body>
</html>`);
    }
});

const PORT = 8099;
server.listen(PORT, () => {
    console.log('服务已启动，访问 http://localhost:' + PORT);
});
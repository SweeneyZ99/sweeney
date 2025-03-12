document.addEventListener('DOMContentLoaded', function () {
    const brightnessSlider = document.getElementById('brightness');
    const brightnessValue = document.getElementById('brightnessValue');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperatureValue');
    const hueSlider = document.getElementById('hue');
    const hueValue = document.getElementById('hueValue');
    const lightArea = document.getElementById('lightArea');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const controlsPanel = document.getElementById('controlsPanel');
    const controlsContainer = document.getElementById('controlsContainer');
    const countdownBtn = document.getElementById('countdownBtn');
    const countdownContainer = document.getElementById('countdownContainer');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const resetBtn = document.getElementById('resetBtn');

    // 初始设置值
    const defaultSettings = {
        brightness: 100,
        temperature: 5500,
        hue: 0
    };

    // 重置按钮功能
    resetBtn.addEventListener('click', resetToDefaults);

    function resetToDefaults() {
        // 重置滑块值
        brightnessSlider.value = defaultSettings.brightness;
        temperatureSlider.value = defaultSettings.temperature;
        hueSlider.value = defaultSettings.hue;

        // 更新显示和光源
        updateLight();

        // 添加动画效果表示重置成功
        resetBtn.classList.add('active');
        resetBtn.style.backgroundColor = 'rgba(0, 150, 0, 0.5)';
        setTimeout(() => {
            resetBtn.style.backgroundColor = '';
            resetBtn.classList.remove('active');
        }, 500);
    }

    // 全屏功能
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`全屏请求错误: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    // 检测是否为触摸设备
    function isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    // 如果是触摸设备，保持控制面板一直可见
    if (isTouchDevice()) {
        controlsPanel.classList.add('active');
    }

    // 倒计时功能
    countdownBtn.addEventListener('click', startCountdown);

    function startCountdown() {
        let count = 10;
        countdownContainer.style.display = 'flex';
        countdownDisplay.textContent = count;

        const interval = setInterval(() => {
            count--;

            if (count <= 0) {
                clearInterval(interval);
                setTimeout(() => {
                    countdownContainer.style.display = 'none';
                }, 1000);
            }

            countdownDisplay.textContent = count;

            // 动画效果
            countdownDisplay.style.transform = 'scale(1.2)';
            setTimeout(() => {
                countdownDisplay.style.transform = 'scale(1)';
            }, 200);

        }, 1000);
    }

    function updateLight() {
        const brightness = brightnessSlider.value;
        const temperature = temperatureSlider.value;
        const hue = hueSlider.value;

        brightnessValue.textContent = brightness + '%';
        temperatureValue.textContent = temperature + 'K';
        hueValue.textContent = hue + '°';

        // 色温转换为RGB
        let r, g, b;

        // 简化的色温到RGB转换
        const temp = temperature / 100;

        if (temp <= 66) {
            r = 255;
            g = temp;
            g = 99.4708025861 * Math.log(g) - 161.1195681661;
            g = Math.min(255, Math.max(0, g));

            if (temp <= 19) {
                b = 0;
            } else {
                b = temp - 10;
                b = 138.5177312231 * Math.log(b) - 305.0447927307;
                b = Math.min(255, Math.max(0, b));
            }
        } else {
            r = temp - 60;
            r = 329.698727446 * Math.pow(r, -0.1332047592);
            r = Math.min(255, Math.max(0, r));

            g = temp - 60;
            g = 288.1221695283 * Math.pow(g, -0.0755148492);
            g = Math.min(255, Math.max(0, g));

            b = 255;
        }

        // 将RGB转换为HSL以应用色相
        let rgb = rgbToHsl(r, g, b);
        // 应用新的色相，保留原来的饱和度和亮度
        rgb = hslToRgb(parseInt(hue), rgb.s, rgb.l);

        r = rgb.r;
        g = rgb.g;
        b = rgb.b;

        // 应用亮度
        const brightnessMultiplier = brightness / 100;
        r = Math.round(r * brightnessMultiplier);
        g = Math.round(g * brightnessMultiplier);
        b = Math.round(b * brightnessMultiplier);

        document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }

    // RGB转HSL
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // 灰色
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h * 360, s: s, l: l };
    }

    // HSL转RGB
    function hslToRgb(h, s, l) {
        h /= 360;
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // 灰色
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    brightnessSlider.addEventListener('input', updateLight);
    temperatureSlider.addEventListener('input', updateLight);
    hueSlider.addEventListener('input', updateLight);

    // 初始化
    updateLight();

    // 防止屏幕休眠
    function keepAwake() {
        if ('wakeLock' in navigator) {
            window.navigator.wakeLock.request('screen')
                .then(() => console.log('屏幕将保持唤醒状态'))
                .catch((err) => console.log('无法保持屏幕唤醒：', err));
        }
    }

    // 点击屏幕保持唤醒
    lightArea.addEventListener('click', keepAwake);
}); 
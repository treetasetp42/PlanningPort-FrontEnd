import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const TradingViewChart = ({ symbol = "NASDAQ:AAPL", theme = "dark" }) => {
    const container = useRef();

    useEffect(() => {
        // เคลียร์ค่าเก่าทิ้งก่อนเพื่อป้องกันกราฟซ้อนกันเวลาเปลี่ยน Symbol
        if (container.current) {
            container.current.innerHTML = '';
        }

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;

        // การตั้งค่า Widget [cite: 2026-04-01]
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": symbol, // เช่น "BINANCE:BTCUSDT" หรือ "NASDAQ:NVDA"
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": theme,
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "calendar": false,
            "support_host": "https://www.tradingview.com"
        });
        container.current.appendChild(script);
    }, [symbol, theme]);

    return (
        <Box
            className="tradingview-widget-container"
            ref={container}
            sx={{ height: "500px", width: "100%", borderRadius: 2, overflow: 'hidden' }}
        >
            <div className="tradingview-widget-container__widget"></div>
        </Box>
    );
};

export default TradingViewChart;
import { useEffect } from 'react';

export default function useDynamicFavicon(darkMode, primaryColor) {
    useEffect(() => {
        // Determine st1 (originally #B2B2B2 - primary brand color)
        // and st0 (originally #848484 - text color contrast)
        const st1Color = primaryColor || '#1976d2';
        const st0Color = darkMode ? '#ffffff' : '#2e2e2e';

        const svgTemplate = `
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 125.9 125.9" style="enable-background:new 0 0 125.9 125.9;" xml:space="preserve">
<style type="text/css">
	.st0{fill:${st0Color};}
	.st1{fill:${st1Color};}
</style>
<polygon class="st0" points="115.7,41.4 115.7,0 105.3,0 95,0 85,0 75,0 75,20.6 85,20.6 95,20.6 95,41.4 75,41.4 75,51.8 75,62.1 
	115.7,62.1 115.7,51.8 115.7,41.4 "/>
<rect x="73" y="0" class="st0" width="0" height="20.7"/>
<rect x="52.3" y="0" class="st0" width="20.7" height="125.9"/>
<rect x="30.6" y="0" class="st1" width="20.4" height="20.7"/>
<polygon class="st1" points="10.2,42.6 30.3,42.6 30.3,125.9 40.7,125.9 51,125.9 51,42.6 51,42.6 51,21.9 10.2,21.9 "/>
</svg>
        `.trim();

        try {
            // Encode safely as Base64 Data URI
            const base64Svg = window.btoa(unescape(encodeURIComponent(svgTemplate)));
            const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

            // Find or create the favicon link element
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/svg+xml';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = dataUri;
        } catch (e) {
            console.error("Failed to generate dynamic favicon", e);
        }
    }, [darkMode, primaryColor]);
}

import { chromium } from 'playwright';
import { uploadToSpaces } from './spaces';

// Verificar se Playwright está disponível
async function isPlaywrightAvailable(): Promise<boolean> {
  try {
    const browser = await chromium.launch({ headless: true, timeout: 5000 });
    await browser.close();
    return true;
  } catch (error) {
    console.warn('Playwright não disponível:', error);
    return false;
  }
}

export async function takeScreenshot(url: string, presellId: number) {
  let browser = null;

  try {
    // Verificar se Spaces está configurado
    if (!process.env.DO_SPACES_ACCESS_KEY || !process.env.DO_SPACES_SECRET_KEY) {
      console.warn('[Screenshot] DigitalOcean Spaces não configurado, pulando screenshots');
      return {
        desktop: null,
        mobile: null
      };
    }

    // Validar URL
    new URL(url);

    // Verificar se Playwright está disponível
    const playwrightAvailable = await isPlaywrightAvailable();
    if (!playwrightAvailable) {
      console.warn('Playwright não disponível, pulando screenshots');
      return {
        desktop: null,
        mobile: null
      };
    }

    // SEGURANÇA: Sandbox habilitado por padrão
    const useSandbox = process.env.PLAYWRIGHT_USE_SANDBOX !== 'false';

    const launchArgs = [
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--safebrowsing-disable-auto-update'
    ];

    // Apenas adicionar --no-sandbox se explicitamente configurado
    if (!useSandbox) {
      launchArgs.push('--no-sandbox', '--disable-setuid-sandbox');
    }

    browser = await chromium.launch({
      headless: true,
      args: launchArgs,
      timeout: 15000 // Timeout de 15 segundos
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      deviceScaleFactor: 1,
      javaScriptEnabled: true,
      bypassCSP: false,
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
      // Simular comportamento de navegador real
      hasTouch: false,
      isMobile: false,
      // Headers para parecer mais legítimo
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    const page = await context.newPage();

    // SEGURANÇA: Bloquear apenas recursos desnecessários (melhora performance)
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();

      // Bloquear apenas recursos pesados que não afetam o visual
      if (['media', 'websocket', 'eventsource'].includes(resourceType)) {
        route.abort();
      } else {
        // Permitir document, stylesheet, image, font, script
        route.continue();
      }
    });

    // Desktop screenshot - esperar página carregar completamente
    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
    } catch (error) {
      // Se networkidle falhar, tentar load
      console.log('[Screenshot] Fallback para waitUntil: load');
      await page.goto(url, {
        waitUntil: 'load',
        timeout: 30000
      });
    }

    // Aguardar elementos visíveis na página
    try {
      await page.waitForSelector('body', { state: 'visible', timeout: 5000 });
    } catch (error) {
      console.log('[Screenshot] Body não encontrado, continuando...');
    }

    // Aguardar renderização inicial
    await page.waitForTimeout(3000);

    // Tentar encontrar elementos comuns que indicam conteúdo carregado
    const commonSelectors = [
      'h1', 'h2', 'img', 'video', 'button', 'form', 'p',
      '[class*="content"]', '[class*="container"]', '[id*="content"]'
    ];

    for (const selector of commonSelectors) {
      try {
        await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
        console.log(`[Screenshot] Encontrado elemento: ${selector}`);
        break;
      } catch (e) {
        // Continuar tentando outros seletores
      }
    }

    // Aguardar mais tempo para JS pesado
    await page.waitForTimeout(5000);

    // Forçar carregamento de imagens lazy-loaded
    await page.evaluate(() => {
      // Trigger lazy loading scrollando pela página
      window.scrollTo(0, document.body.scrollHeight / 4);
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    // Forçar carregamento de todas as imagens lazy
    await page.evaluate(() => {
      const images = document.querySelectorAll('img[loading="lazy"], img[data-src], img[data-lazy]');
      images.forEach(img => {
        // Remover lazy loading
        img.removeAttribute('loading');
        // Trocar data-src por src se necessário
        const dataSrc = img.getAttribute('data-src') || img.getAttribute('data-lazy');
        if (dataSrc && !img.getAttribute('src')) {
          img.setAttribute('src', dataSrc);
        }
        // Forçar carregamento
        if (img instanceof HTMLImageElement) {
          img.loading = 'eager';
        }
      });
    });

    await page.waitForTimeout(2000);

    // Verificar se a página tem conteúdo
    const bodyContent = await page.evaluate(() => {
      return {
        hasContent: document.body.innerText.length > 100,
        bgColor: window.getComputedStyle(document.body).backgroundColor,
        textLength: document.body.innerText.length,
        hasImages: document.querySelectorAll('img').length,
        loadedImages: Array.from(document.querySelectorAll('img')).filter(img => img.complete && img.naturalHeight > 0).length,
        hasVideos: document.querySelectorAll('video').length,
        visibleElements: document.querySelectorAll('*:not([hidden]):not([style*="display: none"])').length
      };
    });

    console.log(`[Screenshot] Conteúdo da página: ${JSON.stringify(bodyContent)}`);

    // Se a página está branca ou tem pouco conteúdo, esperar mais
    if (!bodyContent.hasContent || bodyContent.visibleElements < 10) {
      console.log('[Screenshot] Página parece vazia ou com pouco conteúdo, aguardando mais 8s...');
      await page.waitForTimeout(8000);

      // Verificar novamente
      const recheckContent = await page.evaluate(() => ({
        textLength: document.body.innerText.length,
        visibleElements: document.querySelectorAll('*:not([hidden]):not([style*="display: none"])').length
      }));
      console.log(`[Screenshot] Recheck após espera: ${JSON.stringify(recheckContent)}`);
    }

    // Scroll para o topo
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);

    // Debug: verificar estado visual antes do screenshot
    const visualState = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;

      // Verificar iframes
      const iframes = document.querySelectorAll('iframe');
      const iframeInfo = Array.from(iframes).map(iframe => ({
        src: iframe.src,
        width: iframe.width,
        height: iframe.height,
        display: window.getComputedStyle(iframe).display
      }));

      // Encontrar todos elementos que podem estar cobrindo
      const allElements = Array.from(document.querySelectorAll('*'));
      const coveringElements = allElements.filter(el => {
        const style = window.getComputedStyle(el);
        const position = style.position;
        const zIndex = parseInt(style.zIndex) || 0;
        return (position === 'fixed' || position === 'absolute') && zIndex > 0;
      }).map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        position: window.getComputedStyle(el).position,
        zIndex: window.getComputedStyle(el).zIndex,
        display: window.getComputedStyle(el).display,
        width: window.getComputedStyle(el).width,
        height: window.getComputedStyle(el).height,
        bg: window.getComputedStyle(el).backgroundColor
      }));

      return {
        bodyDisplay: window.getComputedStyle(body).display,
        bodyVisibility: window.getComputedStyle(body).visibility,
        bodyOpacity: window.getComputedStyle(body).opacity,
        htmlBg: window.getComputedStyle(html).backgroundColor,
        bodyBg: window.getComputedStyle(body).backgroundColor,
        scrollY: window.scrollY,
        bodyHeight: body.scrollHeight,
        viewportHeight: window.innerHeight,
        hasIframes: iframes.length,
        iframeInfo: iframeInfo.slice(0, 2),
        coveringElements: coveringElements.slice(0, 5) // Apenas os 5 primeiros
      };
    });
    console.log(`[Screenshot] Estado visual antes do screenshot: ${JSON.stringify(visualState)}`);

    // Remover apenas modais/popups que bloqueiam a visualização (não navbars!)
    const removedElements = await page.evaluate(() => {
      const removed: string[] = [];

      // Remover apenas loaders e spinners
      const loaders = document.querySelectorAll('[class*="spinner"], [class*="loader"], [id*="loader"]');
      loaders.forEach(el => {
        removed.push(`loader: ${el.tagName}.${el.className}`);
        (el as HTMLElement).style.display = 'none';
      });

      // Remover modais/popups de cookie consent e similares
      const popups = document.querySelectorAll([
        '[class*="cookie"]', '[id*="cookie"]',
        '[class*="consent"]', '[id*="consent"]',
        '[class*="gdpr"]', '[id*="gdpr"]'
      ].join(','));

      popups.forEach(el => {
        removed.push(`popup: ${el.tagName}.${el.className}`);
        (el as HTMLElement).style.display = 'none';
      });

      return removed;
    });

    if (removedElements.length > 0) {
      console.log(`[Screenshot] Elementos removidos: ${JSON.stringify(removedElements)}`);
    }

    await page.waitForTimeout(500);

    const desktopFileName = `presell-${presellId}-desktop.png`;

    const desktopBuffer = await page.screenshot({
      fullPage: false,
      type: 'png',
      animations: 'disabled' // Desabilitar animações
    });

    console.log(`[Screenshot] Screenshot desktop capturado, fazendo upload para Spaces...`);
    const desktopUrl = await uploadToSpaces(desktopBuffer, desktopFileName);
    console.log(`[Screenshot] Screenshot desktop salvo em: ${desktopUrl}`);

    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);


    const mobileFileName = `presell-${presellId}-mobile.png`;

    const mobileBuffer = await page.screenshot({
      fullPage: false,
      type: 'png',
      animations: 'disabled'
    });

    console.log(`[Screenshot] Screenshot mobile capturado, fazendo upload para Spaces...`);
    const mobileUrl = await uploadToSpaces(mobileBuffer, mobileFileName);
    console.log(`[Screenshot] Screenshot mobile salvo em: ${mobileUrl}`);

    return {
      desktop: desktopUrl,
      mobile: mobileUrl
    };

  } catch (error) {
    console.error('Erro ao capturar screenshot:', error);
    // Retornar null ao invés de throw - screenshots são opcionais
    return {
      desktop: null,
      mobile: null
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

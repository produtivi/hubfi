import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { uploadScreenshotToSpaces } from './spaces';

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

    // Screenshots directory
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });

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

    // Remover possíveis overlays/modais que podem estar cobrindo o conteúdo
    const removedElements = await page.evaluate(() => {
      const removed: string[] = [];

      // Buscar TODOS elementos
      const allElements = Array.from(document.querySelectorAll('*'));
      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const position = style.position;
        const zIndex = parseInt(style.zIndex) || 0;
        const bg = style.backgroundColor;

        // FORÇA BRUTA: Resetar z-index de QUALQUER elemento com z-index muito alto
        if (zIndex > 1000) {
          removed.push(`${el.tagName}.${el.className} (z:${zIndex} RESETADO)`);
          (el as HTMLElement).style.zIndex = '-1';
          (el as HTMLElement).style.display = 'none';
        }

        // Remover elementos fixed/absolute que podem estar cobrindo
        if ((position === 'fixed' || position === 'absolute') && zIndex > 0) {
          removed.push(`${el.tagName}.${el.className} (z:${zIndex})`);
          (el as HTMLElement).style.zIndex = '-1';
          (el as HTMLElement).style.display = 'none';
        }

        // Remover elementos com fundo branco/preto que cobrem toda tela
        if ((position === 'fixed' || position === 'absolute') &&
            (bg.includes('rgb(255, 255, 255)') || bg.includes('rgb(0, 0, 0)') || bg.includes('rgba(0, 0, 0'))) {
          const width = parseInt(style.width) || 0;
          const height = parseInt(style.height) || 0;
          if (width > 1000 || height > 1000) {
            removed.push(`${el.tagName}.${el.className} (OVERLAY GRANDE)`);
            (el as HTMLElement).style.display = 'none';
          }
        }
      });

      // Remover loaders, modais, overlays comuns
      const badElements = document.querySelectorAll([
        '[class*="load"]', '[class*="spinner"]', '[id*="load"]',
        '[class*="overlay"]', '[class*="modal"]', '[id*="modal"]',
        '[class*="popup"]', '[class*="cbtb"]', // ClickBank Trust Badge
        '[class*="backdrop"]', '[class*="curtain"]'
      ].join(','));

      badElements.forEach(el => {
        removed.push(`bad: ${el.tagName}.${el.className}`);
        (el as HTMLElement).style.display = 'none';
        (el as HTMLElement).style.visibility = 'hidden';
        (el as HTMLElement).style.opacity = '0';
      });

      // Remover TODOS iframes (podem causar problemas de rendering)
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        removed.push(`iframe: ${iframe.src}`);
        iframe.style.display = 'none';
      });

      return removed;
    });

    if (removedElements.length > 0) {
      console.log(`[Screenshot] Elementos removidos: ${JSON.stringify(removedElements.slice(0, 10))}`);
    }

    await page.waitForTimeout(1000);

    // FORÇA BRUTA: Garantir que body e html estejam 100% visíveis
    await page.evaluate(() => {
      // Forçar body e html visíveis
      document.documentElement.style.opacity = '1';
      document.documentElement.style.visibility = 'visible';
      document.body.style.opacity = '1';
      document.body.style.visibility = 'visible';
      document.body.style.display = 'block';

      // Remover qualquer transform que possa esconder
      document.body.style.transform = 'none';
      document.documentElement.style.transform = 'none';
    });

    await page.waitForTimeout(500);

    // Debug: salvar HTML da página para análise
    try {
      const htmlContent = await page.content();
      const debugHtmlPath = path.join(process.cwd(), 'public', 'screenshots', `debug-presell-${presellId}.html`);
      await fs.writeFile(debugHtmlPath, htmlContent, 'utf-8');
      console.log(`[Screenshot] HTML de debug salvo em: ${debugHtmlPath}`);
    } catch (e) {
      console.log('[Screenshot] Erro ao salvar HTML debug:', e);
    }

    const desktopPath = `/screenshots/presell-${presellId}-desktop.png`;
    const desktopFullPath = path.join(process.cwd(), 'public', desktopPath);

    await page.screenshot({
      path: desktopFullPath,
      fullPage: false,
      type: 'png',
      animations: 'disabled' // Desabilitar animações
    });

    console.log(`[Screenshot] Screenshot desktop salvo em: ${desktopFullPath}`);

    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Remover overlays novamente para mobile
    await page.evaluate(() => {
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
      fixedElements.forEach(el => {
        const zIndex = window.getComputedStyle(el).zIndex;
        if (zIndex && parseInt(zIndex) > 100) {
          (el as HTMLElement).style.display = 'none';
        }
      });
    });

    const mobilePath = `/screenshots/presell-${presellId}-mobile.png`;
    const mobileFullPath = path.join(process.cwd(), 'public', mobilePath);

    await page.screenshot({
      path: mobileFullPath,
      fullPage: false,
      type: 'png',
      animations: 'disabled'
    });

    console.log(`[Screenshot] Screenshot mobile salvo em: ${mobileFullPath}`);

    // Upload para DigitalOcean Spaces se configurado
    if (process.env.DO_SPACES_ACCESS_KEY && process.env.DO_SPACES_SECRET_KEY) {
      try {
        const desktopFileName = `presell-${presellId}-desktop.png`;
        const desktopSpacesUrl = await uploadScreenshotToSpaces(desktopFullPath, desktopFileName);

        const mobileFileName = `presell-${presellId}-mobile.png`;
        const mobileSpacesUrl = await uploadScreenshotToSpaces(mobileFullPath, mobileFileName);

        // Deletar arquivos locais após upload
        await fs.unlink(desktopFullPath);
        await fs.unlink(mobileFullPath);

        return {
          desktop: desktopSpacesUrl,
          mobile: mobileSpacesUrl
        };
      } catch (error) {
        console.error('Erro ao enviar para Spaces, mantendo arquivos locais:', error);
      }
    }

    // Fallback: usar arquivos locais
    return {
      desktop: desktopPath,
      mobile: mobilePath
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

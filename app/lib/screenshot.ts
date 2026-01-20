import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { uploadScreenshotToSpaces } from './spaces';

export async function takeScreenshot(url: string, presellId: number) {
  let browser = null;

  try {
    // Validar URL
    new URL(url);

    // SEGURANÇA: Sandbox habilitado por padrão
    // Apenas desabilitar em ambientes específicos que requerem
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
      timeout: 30000 // Timeout de 30 segundos
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      deviceScaleFactor: 1,
      // SEGURANÇA: Desabilitar JavaScript malicioso
      javaScriptEnabled: true, // Precisa estar habilitado para sites modernos
      bypassCSP: false, // Respeitar Content Security Policy
    });

    const page = await context.newPage();

    // SEGURANÇA: Bloquear requisições para recursos suspeitos
    await page.route('**/*', (route) => {
      const url = route.request().url();
      const resourceType = route.request().resourceType();

      // Bloquear mineradores conhecidos
      const blockedPatterns = [
        /coinhive/i,
        /crypto-loot/i,
        /miner/i,
        /xmrig/i,
        /monero/i,
        /cryptonight/i,
      ];

      if (blockedPatterns.some(pattern => pattern.test(url))) {
        console.warn(`[Security] Bloqueado recurso suspeito: ${url}`);
        route.abort();
        return;
      }

      // Permitir apenas recursos necessários para screenshot
      if (['document', 'stylesheet', 'image', 'font'].includes(resourceType)) {
        route.continue();
      } else {
        // Bloquear scripts externos, media, websockets, etc.
        route.abort();
      }
    });
    
    // Screenshots directory
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });
    
    // Desktop screenshot - timeout mais agressivo
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    // Aguardar apenas 3 segundos para renderização
    await page.waitForTimeout(3000);
    
    // Estratégia mais rápida - aguardar navbar ou timeout rápido
    try {
      await page.waitForFunction(() => {
        // Procurar especificamente por elementos que parecem navbars no topo
        const topElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          
          return rect.top <= 100 && 
                 rect.width > 300 && 
                 rect.height > 20 && 
                 styles.visibility === 'visible' && 
                 styles.display !== 'none';
        });
        
        return topElements.length > 0;
      }, { timeout: 3000 });
      
      await page.waitForTimeout(1000);
    } catch (e) {
      await page.waitForTimeout(500);
    }
    
    // Scroll para o topo (crítico para elementos fixed)
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    // Aguardar um pouco após scroll
    await page.waitForTimeout(1000);
    
    
    // Aguardar apenas fonts básicas (sem imagens pesadas)
    await page.evaluate(async () => {
      if (document.fonts) {
        try {
          await Promise.race([
            document.fonts.ready,
            new Promise(resolve => setTimeout(resolve, 2000)) // Max 2 segundos para fonts
          ]);
        } catch (e) {
          // Ignorar erro de fonts
        }
      }
    });
    
    // Screenshot direto sem delays extras
    
    const desktopPath = `/screenshots/presell-${presellId}-desktop.png`;
    const desktopFullPath = path.join(process.cwd(), 'public', desktopPath);
    
    // Estratégia específica para navbar sticky/fixed - scroll up/down
    await page.evaluate(() => {
      // Scroll down um pouco e depois volta ao topo (ativa navbars sticky)
      window.scrollTo(0, 200);
      setTimeout(() => window.scrollTo(0, 0), 100);
    });
    
    await page.waitForTimeout(500);
    
    // Última verificação dos elementos fixed antes da captura
    await page.evaluate(() => {
      const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' || style.position === 'sticky';
      });
    });
    
    // CRITICAL: fullPage: false é essencial para capturar elementos fixed!
    await page.screenshot({ 
      path: desktopFullPath,
      fullPage: false, // NUNCA usar true com elementos fixed!
      type: 'png'
      // quality não é suportado para PNG
    });
    
    
    // Mobile screenshot - sem reload demorado
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Aguardar viewport change apenas
    await page.waitForTimeout(1000);
    
    // Scroll para o topo
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    // Aguardar um pouco
    await page.waitForTimeout(1000);
    
    const mobilePath = `/screenshots/presell-${presellId}-mobile.png`;
    const mobileFullPath = path.join(process.cwd(), 'public', mobilePath);
    
    await page.screenshot({ 
      path: mobileFullPath,
      fullPage: false
    });
    
    
    // Upload para DigitalOcean Spaces
    if (process.env.DO_SPACES_ACCESS_KEY && process.env.DO_SPACES_SECRET_KEY) {
      try {
        // Upload desktop
        const desktopFileName = `presell-${presellId}-desktop.png`;
        const desktopSpacesUrl = await uploadScreenshotToSpaces(desktopFullPath, desktopFileName);
        
        // Upload mobile
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
    
    // Fallback: usar arquivos locais se Spaces não estiver configurado
    return {
      desktop: desktopPath,
      mobile: mobilePath
    };
    
  } catch (error) {
    console.error('Erro ao capturar screenshot:', error);
    throw new Error(`Falha ao capturar screenshot: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
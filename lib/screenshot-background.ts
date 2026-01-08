import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

export async function takeScreenshotWithBackgroundSupport(url: string, presellId: number) {
  let browser = null;
  
  try {
    console.log('Iniciando captura com suporte a background-images para:', url);
    
    // Validar URL
    new URL(url);
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--force-device-scale-factor=1',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
    
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 },
      deviceScaleFactor: 1,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // Screenshots directory
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });
    
    // Navegar para a página
    console.log('Navegando para:', url);
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Aguardar elementos específicos de background carregarem
    try {
      console.log('Aguardando elementos de background...');
      await page.waitForSelector('.background-container', { timeout: 15000 });
      await page.waitForSelector('#background-image-desktop', { timeout: 15000 });
      console.log('Elementos de background encontrados');
    } catch (e) {
      console.log('Elementos de background não encontrados, continuando...');
    }
    
    // Aguardar network idle para garantir que imagens carregaram
    await page.waitForLoadState('networkidle');
    
    // Aguardar especificamente por imagens de fundo CSS e estilos carregarem
    await page.evaluate(async () => {
      return new Promise<void>((resolve) => {
        let attempts = 0;
        const maxAttempts = 20;
        
        const checkBackgroundImages = () => {
          attempts++;
          const desktopEl = document.querySelector('#background-image-desktop') as HTMLElement;
          const mobileEl = document.querySelector('#background-image-mobile') as HTMLElement;
          
          if (desktopEl && mobileEl) {
            const desktopStyle = window.getComputedStyle(desktopEl);
            const mobileStyle = window.getComputedStyle(mobileEl);
            
            const desktopBg = desktopStyle.backgroundImage;
            const mobileBg = mobileStyle.backgroundImage;
            
            // Verificar se pelo menos um tem background-image definido
            if ((desktopBg && desktopBg !== 'none') || (mobileBg && mobileBg !== 'none')) {
              console.log('Background images detectados:', { desktopBg, mobileBg });
              resolve();
              return;
            }
          }
          
          if (attempts < maxAttempts) {
            setTimeout(checkBackgroundImages, 500);
          } else {
            console.log('Timeout aguardando background images, continuando...');
            resolve();
          }
        };
        
        checkBackgroundImages();
      });
    });
    
    // Aguardar um tempo adicional para garantir renderização
    await page.waitForTimeout(5000);
    
    // Scroll para o topo múltiplas vezes
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
      await page.waitForTimeout(1000);
    }
    
    // Forçar repaint para garantir que tudo está renderizado
    await page.evaluate(() => {
      const elements = document.querySelectorAll('.background-container, #background-image-desktop, #background-image-mobile');
      elements.forEach(el => {
        (el as HTMLElement).style.transform = 'translateZ(0)';
        (el as HTMLElement).offsetHeight; // force reflow
      });
    });
    
    await page.waitForTimeout(2000);
    
    // Capturar screenshot desktop
    const desktopPath = `/screenshots/presell-${presellId}-desktop.png`;
    const desktopFullPath = path.join(process.cwd(), 'public', desktopPath);
    
    console.log('Capturando screenshot desktop...');
    await page.screenshot({ 
      path: desktopFullPath,
      fullPage: false,
      type: 'png',
      animations: 'disabled'
    });
    
    // Configurar para mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(3000);
    
    // Aguardar imagens de fundo mobile carregarem
    await page.evaluate(async () => {
      const mobileElement = document.querySelector('#background-image-mobile');
      if (mobileElement) {
        const style = window.getComputedStyle(mobileElement);
        const backgroundImage = style.backgroundImage;
        
        if (backgroundImage && backgroundImage !== 'none') {
          return new Promise<void>((resolve) => {
            const urls = backgroundImage.match(/url\(["']?([^"'\)]+)["']?\)/g);
            if (urls && urls.length > 0) {
              let loadedCount = 0;
              urls.forEach(urlMatch => {
                const url = urlMatch.replace(/url\(["']?([^"'\)]+)["']?\)/, '$1');
                const img = new Image();
                img.onload = img.onerror = () => {
                  loadedCount++;
                  if (loadedCount === urls.length) resolve();
                };
                img.src = url;
              });
            } else {
              resolve();
            }
          });
        }
      }
    });
    
    // Scroll para o topo para mobile
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
      await page.waitForTimeout(1000);
    }
    
    // Capturar screenshot mobile
    const mobilePath = `/screenshots/presell-${presellId}-mobile.png`;
    const mobileFullPath = path.join(process.cwd(), 'public', mobilePath);
    
    console.log('Capturando screenshot mobile...');
    await page.screenshot({ 
      path: mobileFullPath,
      fullPage: false,
      type: 'png',
      animations: 'disabled'
    });
    
    console.log('Screenshots com suporte a background-images capturados com sucesso');
    
    return {
      desktop: desktopPath,
      mobile: mobilePath
    };
    
  } catch (error) {
    console.error('Erro ao capturar screenshot com suporte a background:', error);
    throw new Error(`Falha ao capturar screenshot: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
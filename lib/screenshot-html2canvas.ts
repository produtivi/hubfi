import html2canvas from 'html2canvas';
import fs from 'fs/promises';
import path from 'path';

export async function takeScreenshotWithHtml2Canvas(url: string, presellId: number) {
  try {
    console.log('Iniciando captura de screenshot com html2canvas para:', url);
    
    // Criar diretório se não existir
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    try {
      await fs.access(screenshotsDir);
    } catch {
      await fs.mkdir(screenshotsDir, { recursive: true });
    }

    // Para usar html2canvas no servidor, precisamos de um navegador
    // Vamos usar puppeteer para abrir a página e injetar html2canvas
    const puppeteer = require('puppeteer');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navegar para a página
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Aguardar um pouco para garantir que tudo carregou
    await page.waitForTimeout(3000);

    // Injetar html2canvas na página
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    });

    // Usar html2canvas para capturar a página
    const screenshotBuffer = await page.evaluate(async () => {
      return new Promise((resolve) => {
        // @ts-ignore
        html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          scale: 1,
          width: window.innerWidth,
          height: window.innerHeight,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: '#ffffff'
        }).then((canvas: any) => {
          resolve(canvas.toDataURL('image/png'));
        });
      });
    });

    // Converter base64 para buffer
    const base64Data = (screenshotBuffer as string).replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Salvar screenshot desktop
    const desktopPath = `/screenshots/presell-${presellId}-desktop.png`;
    const desktopFullPath = path.join(process.cwd(), 'public', desktopPath);
    await fs.writeFile(desktopFullPath, buffer);

    // Para mobile, vamos configurar um viewport menor e capturar novamente
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileScreenshotBuffer = await page.evaluate(async () => {
      return new Promise((resolve) => {
        // @ts-ignore
        html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          scale: 1,
          width: window.innerWidth,
          height: window.innerHeight,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: '#ffffff'
        }).then((canvas: any) => {
          resolve(canvas.toDataURL('image/png'));
        });
      });
    });

    // Converter base64 para buffer (mobile)
    const mobileBase64Data = (mobileScreenshotBuffer as string).replace(/^data:image\/png;base64,/, '');
    const mobileBuffer = Buffer.from(mobileBase64Data, 'base64');
    
    // Salvar screenshot mobile
    const mobilePath = `/screenshots/presell-${presellId}-mobile.png`;
    const mobileFullPath = path.join(process.cwd(), 'public', mobilePath);
    await fs.writeFile(mobileFullPath, mobileBuffer);

    await browser.close();

    console.log('Screenshots capturados com sucesso usando html2canvas');
    
    return {
      desktop: desktopPath,
      mobile: mobilePath
    };
    
  } catch (error) {
    console.error('Erro ao capturar screenshot com html2canvas:', error);
    throw error;
  }
}
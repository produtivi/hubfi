import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import fs from 'fs/promises';
import path from 'path';

export async function takeScreenshotWithSelenium(url: string, presellId: number) {
  let driver: WebDriver | null = null;
  
  try {
    console.log('Iniciando captura de screenshot com Selenium para:', url);
    
    // Criar diretório se não existir
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    try {
      await fs.access(screenshotsDir);
    } catch {
      await fs.mkdir(screenshotsDir, { recursive: true });
    }

    // Configurar opções do Chrome para melhor captura
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1200,800');
    options.addArguments('--force-device-scale-factor=1');
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-plugins');
    options.addArguments('--disable-background-timer-throttling');
    options.addArguments('--disable-backgrounding-occluded-windows');
    options.addArguments('--disable-renderer-backgrounding');
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Inicializar driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Configurar timeout implícito
    await driver.manage().setTimeouts({ implicit: 10000 });

    // Navegar para a página
    console.log('Navegando para:', url);
    await driver.get(url);

    // Aguardar a página carregar completamente
    await driver.wait(until.elementLocated(By.tagName('body')), 15000);
    
    // Aguardar elementos específicos da navbar carregarem
    try {
      await driver.wait(until.elementsLocated(By.css('nav, header, .navbar, .header')), 8000);
    } catch (e) {
      console.log('Elementos de navbar não encontrados, continuando...');
    }

    // Aguardar um tempo adicional para garantir que tudo carregou
    await driver.sleep(8000);

    // Scroll para o topo várias vezes
    for (let i = 0; i < 3; i++) {
      await driver.executeScript('window.scrollTo(0, 0);');
      await driver.sleep(1000);
    }

    // Executar script para forçar repaint
    await driver.executeScript(`
      document.body.style.display = 'none';
      document.body.offsetHeight;
      document.body.style.display = '';
    `);

    await driver.sleep(2000);

    // Capturar screenshot desktop
    console.log('Capturando screenshot desktop...');
    const desktopScreenshot = await driver.takeScreenshot();
    const desktopPath = `/screenshots/presell-${presellId}-desktop.png`;
    const desktopFullPath = path.join(process.cwd(), 'public', desktopPath);
    await fs.writeFile(desktopFullPath, desktopScreenshot, 'base64');

    // Configurar para mobile
    console.log('Configurando para mobile...');
    await driver.manage().window().setRect({ width: 375, height: 667, x: 0, y: 0 });
    await driver.sleep(3000);

    // Scroll para o topo novamente
    for (let i = 0; i < 3; i++) {
      await driver.executeScript('window.scrollTo(0, 0);');
      await driver.sleep(1000);
    }

    // Capturar screenshot mobile
    console.log('Capturando screenshot mobile...');
    const mobileScreenshot = await driver.takeScreenshot();
    const mobilePath = `/screenshots/presell-${presellId}-mobile.png`;
    const mobileFullPath = path.join(process.cwd(), 'public', mobilePath);
    await fs.writeFile(mobileFullPath, mobileScreenshot, 'base64');

    console.log('Screenshots capturados com sucesso usando Selenium');
    
    return {
      desktop: desktopPath,
      mobile: mobilePath
    };
    
  } catch (error) {
    console.error('Erro ao capturar screenshot com Selenium:', error);
    throw error;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}
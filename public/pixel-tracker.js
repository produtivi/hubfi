(function() {
  // Obter pixelId do atributo data-pixel-id
  var pixelId = document.currentScript.getAttribute('data-pixel-id');
  
  if (!pixelId) {
    console.error('HubPixel: pixelId não encontrado');
    return;
  }

  // Construir URL da API baseado na origem do script
  var scriptSrc = document.currentScript.src;
  var baseUrl = scriptSrc.split('?')[0].replace(/\/pixel-tracker\.min\.js$/, '');
  var apiUrl = baseUrl + '/api/pixels/' + pixelId + '/track';

  // Função para enviar eventos
  function sendEvent(eventType, data) {
    try {
      var payload = {
        eventType: eventType,
        pixelId: pixelId,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        data: data || {}
      };

      // Usar sendBeacon se disponível para garantir envio
      if (navigator.sendBeacon) {
        navigator.sendBeacon(apiUrl, JSON.stringify(payload));
      } else {
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          keepalive: true
        });
      }
    } catch (error) {
      console.error('HubPixel error:', error);
    }
  }

  // Registrar visita imediatamente
  sendEvent('visit');

  // Rastrear cliques
  document.addEventListener('click', function(e) {
    var target = e.target.closest('a[href], button');
    if (target) {
      sendEvent('click', {
        element: target.tagName,
        text: (target.textContent || '').substring(0, 50),
        href: target.href || ''
      });
    }
  });

  // Rastrear saída
  window.addEventListener('beforeunload', function() {
    sendEvent('exit');
  });

  // Expor API global para conversões manuais
  window.hubPixel = window.hubPixel || {};
  window.hubPixel.track = sendEvent;
  window.hubPixel.conversion = function(data) {
    sendEvent('conversion', data);
  };
})();
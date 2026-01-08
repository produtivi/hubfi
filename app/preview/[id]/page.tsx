'use client';

import { useState, useEffect } from 'react';
import { X, Mars, Venus } from 'lucide-react';

interface PreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Presell {
  id: number;
  pageName: string;
  screenshotDesktop?: string;
  screenshotMobile?: string;
  affiliateLink: string;
  presellType: string;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const [presell, setPresell] = useState<Presell | null>(null);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      loadPresell(resolvedParams.id);
    };
    getParams();
  }, []);

  // Atualizar título da página quando presell carrega
  useEffect(() => {
    if (presell?.pageName) {
      document.title = presell.pageName;
    }
  }, [presell?.pageName]);

  const loadPresell = async (id: string) => {
    try {
      const response = await fetch(`/api/presells/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setPresell(result.data);
        
        
        // Mostra modal para tipos específicos
        if (result.data.presellType === 'Cookies' || result.data.presellType === 'Maior de Idade' || result.data.presellType === 'Sexo' || result.data.presellType === 'Idade Homem' || result.data.presellType === 'Idade Mulher' || result.data.presellType === 'Assinar newsletter' || result.data.presellType === 'País' || result.data.presellType === 'Player de vídeo' || result.data.presellType === 'Teste de captcha') {
          setShowCookieModal(true);
        }
      } else {
        console.error('Erro ao carregar presell:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar presell:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleRedirect = () => {
    if (presell?.affiliateLink) {
      window.location.href = presell.affiliateLink;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleRedirect();
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6',
        margin: 0,
        padding: 0
      }}>
        {/* Carregar sem mostrar "Carregando preview..." */}
      </div>
    );
  }

  if (!presell) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        margin: 0,
        padding: 0
      }}>
        <p style={{ color: '#6b7280' }}>Presell não encontrada</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        margin: 0,
        padding: 0
      }}>
        {/* Screenshot como fundo - otimizado mas mantendo navbar */}
        <div style={{
          minHeight: '100vh',
          position: 'relative',
          backgroundColor: '#f3f4f6'
        }}>
          {presell.screenshotDesktop ? (
            <>
              {/* Imagem de fundo otimizada que preserva navbar */}
              <img 
                src={presell.screenshotDesktop}
                alt="Preview da página"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top left', // Mudei para 'top left' para manter navbar visível
                  zIndex: 1
                }}
                loading="eager"
                onLoad={() => {
                  // Imagem carregada
                }}
                onError={() => {
                  // Erro ao carregar imagem
                }}
              />
              {/* Overlay para screenshots temporários */}
              {presell.screenshotDesktop.includes('/screenshots/temp-') && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  fontSize: '24px',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                    <div>Screenshot Temporário</div>
                    <div style={{ fontSize: '16px', marginTop: '8px' }}>Aguardando captura da página original</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              padding: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
              }}></div>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '18px',
                textAlign: 'center',
                marginBottom: '10px'
              }}>
                Capturando screenshot da página...
              </p>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '10px'
              }}>
                Aguarde enquanto geramos a prévia da página de vendas.
              </p>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '12px',
                textAlign: 'center'
              }}>
                ⏱️ Tempo estimado: 10-30 segundos
              </p>
            </div>
          )}
        </div>

        {/* Modal Cookies */}
        {showCookieModal && presell.presellType === 'Cookies' && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50
            }}
            onClick={handleOverlayClick}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '448px',
                width: '100%',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                cursor: 'pointer'
              }}
              onClick={handleRedirect}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827'
                }}>Cookie Settings</h3>
                <button
                  onClick={handleRedirect}
                  style={{
                    color: '#9ca3af',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '24px',
                lineHeight: '1.5'
              }}>
                We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. By clicking accept, you agree to this as described in our Cookie Policy.
              </p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    flex: 1,
                    backgroundColor: '#000',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Yes, I accept
                </button>
                <button
                  onClick={handleRedirect}
                  style={{
                    flex: 1,
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  No, I do not accept
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Maior de Idade */}
        {showCookieModal && presell.presellType === 'Maior de Idade' && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50
            }}
            onClick={handleOverlayClick}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '100%',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={handleRedirect}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    color: '#9ca3af',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '32px'
              }}>
                Você tem mais de 18 anos?
              </h2>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '120px',
                    height: '80px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>✓</span>
                  <span>Sim</span>
                </button>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '120px',
                    height: '80px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>✕</span>
                  <span>Não</span>
                </button>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline'
                  }}
                >
                  prefiro não informar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Idade Homem */}
        {showCookieModal && presell.presellType === 'Idade Homem' && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50
            }}
            onClick={handleOverlayClick}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '100%',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={handleRedirect}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    color: '#9ca3af',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '32px'
              }}>
                Selecione a sua faixa etária
              </h2>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>18 - 29</span>
                  <span style={{ fontSize: '14px' }}>anos</span>
                </button>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>30 - 49</span>
                  <span style={{ fontSize: '14px' }}>anos</span>
                </button>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>50 - 69</span>
                  <span style={{ fontSize: '14px' }}>anos ou mais</span>
                </button>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline'
                  }}
                >
                  prefiro não informar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Idade Mulher */}
        {showCookieModal && presell.presellType === 'Idade Mulher' && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50
            }}
            onClick={handleOverlayClick}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '100%',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={handleRedirect}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    color: '#9ca3af',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '32px'
              }}>
                Selecione a sua faixa etária
              </h2>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>18 - 29</span>
                  <span style={{ fontSize: '14px' }}>anos</span>
                </button>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>30 - 49</span>
                  <span style={{ fontSize: '14px' }}>anos</span>
                </button>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>50 - 69</span>
                  <span style={{ fontSize: '14px' }}>anos ou mais</span>
                </button>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline'
                  }}
                >
                  prefiro não informar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Assinar newsletter */}
        {showCookieModal && presell.presellType === 'Assinar newsletter' && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50
            }}
            onClick={handleOverlayClick}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '450px',
                width: '100%',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={handleRedirect}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    color: '#9ca3af',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                Inscreva-se em nossa newsletter
              </h2>
              
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '32px',
                lineHeight: '1.5'
              }}>
                Inscreva-se para receber semanalmente as últimas notícias, atualizações e ofertas incríveis diretamente na sua caixa de entrada.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <input
                  type="email"
                  placeholder="Email"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleRedirect}
                  style={{
                    backgroundColor: '#000',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Inscrever
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal País */}
        {showCookieModal && presell.presellType === 'País' && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50
            }}
            onClick={handleOverlayClick}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={handleRedirect}
            >
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px'
              }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    color: '#000',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    fontSize: '24px',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </div>
              
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#000',
                marginBottom: '40px',
                marginTop: '0'
              }}>
                Selecione o seu país
              </h2>
              
              <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '32px' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '240px',
                    height: '120px',
                    backgroundColor: '#f5f5f5',
                    color: '#111827',
                    border: '2px solid #000',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '40px',
                    background: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNDQwIj4KICA8cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ0MCIgZmlsbD0iIzAwOTkzNyIvPgogIDxwb2x5Z29uIHBvaW50cz0iMzIwLDEwMCA1NDAsMjIwIDMyMCwzNDAgMTAwLDIyMCIgZmlsbD0iI0ZFRDA0NyIvPgogIDxjaXJjbGUgY3g9IjMyMCIgY3k9IjIyMCIgcj0iNjAiIGZpbGw9IiMwMDIxNjgiLz4KPC9zdmc+) center/cover',
                    borderRadius: '4px'
                  }}></div>
                  <span>Brasil</span>
                </button>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '240px',
                    height: '120px',
                    backgroundColor: '#f5f5f5',
                    color: '#111827',
                    border: '2px solid #000',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Outros países
                </button>
              </div>

              <div>
                <button
                  onClick={handleRedirect}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#000',
                    cursor: 'pointer',
                    fontSize: '16px',
                    textDecoration: 'underline',
                    fontWeight: '400'
                  }}
                >
                  prefiro não informar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sexo */}
        {showCookieModal && presell.presellType === 'Sexo' && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50
            }}
            onClick={handleOverlayClick}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '100%',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={handleRedirect}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    color: '#9ca3af',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '32px'
              }}>
                Selecione o seu gênero
              </h2>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '150px',
                    height: '120px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <Mars style={{ width: '32px', height: '32px', color: '#4f46e5' }} />
                  <span>Masculino</span>
                </button>
                <button
                  onClick={handleRedirect}
                  style={{
                    width: '150px',
                    height: '120px',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <Venus style={{ width: '32px', height: '32px', color: '#ec4899' }} />
                  <span>Feminino</span>
                </button>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline'
                  }}
                >
                  prefiro não informar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Player de vídeo */}
        {showCookieModal && presell.presellType === 'Player de vídeo' && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50
            }}
            onClick={handleOverlayClick}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={handleRedirect}
            >
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 10
              }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    color: '#000',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    fontSize: '24px',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div 
                style={{
                  width: '100%',
                  height: '300px',
                  backgroundColor: '#C8C0E8',
                  borderRadius: '8px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={handleRedirect}
              >
                {/* Botão de play */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#DC2626',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: '24px solid white',
                    borderTop: '14px solid transparent',
                    borderBottom: '14px solid transparent',
                    marginLeft: '4px'
                  }}></div>
                </div>
                
                {/* Texto */}
                <div style={{
                  color: '#444',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  Clique para assistir
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Teste de captcha */}
        {showCookieModal && presell.presellType === 'Teste de captcha' && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50
            }}
            onClick={handleOverlayClick}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '100%',
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={handleRedirect}
            >
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px'
              }}>
                <button
                  onClick={handleRedirect}
                  style={{
                    color: '#000',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    fontSize: '24px',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#000',
                marginBottom: '16px',
                marginTop: '0'
              }}>
                Robô ou humano?
              </h2>
              
              <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '32px',
                lineHeight: '1.5'
              }}>
                Clique no checkbox para garantirmos uma melhor experiência de navegação no nosso site.
              </p>
              
              <div 
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center'
                }}
                onClick={handleRedirect}
              >
                <img 
                  src="/captcha.png" 
                  alt="reCAPTCHA" 
                  style={{
                    width: '300px',
                    height: 'auto',
                    borderRadius: '8px',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useSettingsToast } from '../toast-context';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';

export default function PerfilPage() {
  const { showSuccess, showError } = useSettingsToast();

  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.user?.name || '',
          email: data.user?.email || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name || !profileData.email) {
      showError('Nome e email são obrigatórios');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar perfil');
      }

      showSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      showError(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      showError('Preencha todos os campos de senha');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar senha');
      }

      showSuccess('Senha alterada com sucesso!');
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
      setIsEditingPassword(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha';
      showError(errorMessage);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-title mb-2">Meu perfil</h2>
        <p className="text-body-muted">
          Gerencie suas informações pessoais
        </p>
      </div>

      {isLoadingProfile ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Carregando dados...</span>
        </div>
      ) : (
        <div className="w-full space-y-8">
          {/* Informações básicas */}
          <div className="space-y-4">
            <h3 className="text-body font-medium">Informações básicas</h3>

            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-label text-muted-foreground">Nome</span>
                <Input
                  value={profileData.name}
                  onChange={(value) => setProfileData({ ...profileData, name: value })}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="flex-1 space-y-1">
                <span className="text-label text-muted-foreground">Email</span>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(value) => setProfileData({ ...profileData, email: value })}
                  placeholder="seu@email.com"
                />
              </div>

              <Button
                color="primary"
                size="md"
                onClick={handleSaveProfile}
                isDisabled={isSavingProfile}
                isLoading={isSavingProfile}
              >
                {isSavingProfile ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-border" />

          {/* Alterar senha */}
          <div className="space-y-4">
            <h3 className="text-body font-medium">Senha</h3>

            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="w-1/2 space-y-1">
                  <span className="text-label text-muted-foreground">Senha atual</span>
                  <Input
                    type="password"
                    value="********"
                    onChange={() => {}}
                    isDisabled
                  />
                </div>
                {!isEditingPassword && (
                  <Button
                    color="secondary"
                    size="md"
                    onClick={() => setIsEditingPassword(true)}
                  >
                    Alterar senha
                  </Button>
                )}
              </div>

              {isEditingPassword && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-label text-muted-foreground">Nova senha</span>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-label text-muted-foreground">Confirmar nova senha</span>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
                        placeholder="Repita a nova senha"
                      />
                    </div>
                  </div>

                  <div className="flex justify-start gap-3">
                    <Button
                      color="secondary"
                      size="md"
                      onClick={() => {
                        setIsEditingPassword(false);
                        setPasswordData({
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      isDisabled={isSavingPassword}
                    >
                      Cancelar
                    </Button>
                    <Button
                      color="primary"
                      size="md"
                      onClick={handleSavePassword}
                      isDisabled={isSavingPassword}
                      isLoading={isSavingPassword}
                    >
                      {isSavingPassword ? 'Salvando...' : 'Salvar nova senha'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

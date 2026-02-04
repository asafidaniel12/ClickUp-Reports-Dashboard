'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Save, Key, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const [apiToken, setApiToken] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    // Load saved token from localStorage
    const savedToken = localStorage.getItem('clickup_api_token');
    if (savedToken) {
      setApiToken(savedToken);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('clickup_api_token', apiToken);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/clickup/workspaces');
      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="mt-1 text-slate-500">
          Configure a conexão com o ClickUp
        </p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            API do ClickUp
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-medium text-blue-900 mb-2">Como obter o token da API?</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Acesse o ClickUp e vá em Configurações</li>
              <li>Clique em &quot;Apps&quot; no menu lateral</li>
              <li>Gere ou copie seu token de API pessoal</li>
            </ol>
            <a
              href="https://app.clickup.com/settings/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Abrir configurações do ClickUp
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Token da API
            </label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="pk_..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <p className="mt-2 text-xs text-slate-500">
              O token é armazenado localmente no seu navegador
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saved ? 'Salvo!' : 'Salvar Token'}
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing || !apiToken}
              className="flex-1"
            >
              {testing ? 'Testando...' : 'Testar Conexão'}
            </Button>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-2 p-4 rounded-xl ${
                testResult === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult === 'success' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Conexão realizada com sucesso!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span>Erro na conexão. Verifique o token e tente novamente.</span>
                </>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-medium text-slate-900 mb-2">Configuração via Ambiente</h3>
            <p className="text-sm text-slate-600">
              Você também pode configurar o token via variável de ambiente
              <code className="mx-1 px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">
                CLICKUP_API_TOKEN
              </code>
              no arquivo <code className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">.env.local</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

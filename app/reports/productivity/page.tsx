'use client';

import { Header } from '@/components/layout';
import { Card, CardContent } from '@/components/ui';
import { Construction } from 'lucide-react';

export default function ProductivityPage() {
  return (
    <>
      <Header
        title="Relatório de Produtividade"
        description="Analise a produtividade da equipe"
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Construction className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Em construção
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            O relatório de produtividade está sendo desenvolvido. Em breve você poderá
            analisar a relação entre tarefas concluídas e tempo investido, identificar
            gargalos e acompanhar métricas de eficiência da equipe.
          </p>
        </CardContent>
      </Card>
    </>
  );
}

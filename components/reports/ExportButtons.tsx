'use client';

import { Button } from '@/components/ui';
import { TimeEntry } from '@/lib/types';
import { exportToCSV } from '@/lib/utils';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ExportButtonsProps {
  entries: TimeEntry[];
  startDate: Date;
  endDate: Date;
}

export function ExportButtons({ entries, startDate, endDate }: ExportButtonsProps) {
  const filename = `time-tracking_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;

  const handleExportCSV = () => {
    exportToCSV(entries, filename);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={entries.length === 0}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  );
}

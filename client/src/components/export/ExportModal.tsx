import React, { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Transaction, ExportColumn, TransactionFilters } from '../../types';
import { transactionsApi } from '../../api/transactions';
import { useAlert } from '../../context/AlertContext';
import styles from './ExportModal.module.css';

interface Props {
  filters: TransactionFilters;
  totalCount: number;
  previewData: Transaction[];
  onClose: () => void;
}

const ALL_COLUMNS: ExportColumn[] = [
  { key: 'id',           label: 'Order ID',  selected: true  },
  { key: 'date',         label: 'Date',      selected: true  },
  { key: 'user_id',      label: 'User ID',   selected: true  },
  { key: 'category',     label: 'Category',  selected: true  },
  { key: 'status',       label: 'Status',    selected: true  },
  { key: 'amount',       label: 'Amount',    selected: true  },
  { key: 'user_profile', label: 'Profile URL', selected: false },
];

const ExportModal: React.FC<Props> = ({ filters, totalCount, previewData, onClose }) => {
  const { showAlert } = useAlert();
  const [columns, setColumns] = useState<ExportColumn[]>(ALL_COLUMNS);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedCount = columns.filter((c) => c.selected).length;
  const selectedCols = columns.filter((c) => c.selected);

  const toggle = (key: keyof Transaction) =>
    setColumns((prev) => prev.map((c) => c.key === key ? { ...c, selected: !c.selected } : c));

  const selectAll   = () => setColumns((prev) => prev.map((c) => ({ ...c, selected: true })));
  const deselectAll = () => setColumns((prev) => prev.map((c) => ({ ...c, selected: false })));

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const keys = selectedCols.map((c) => c.key);
      const blob = await transactionsApi.exportCsv(keys, filters);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      showAlert('success', 'Export successful', `Downloaded ${totalCount} rows.`);
      onClose();
    } catch (err) {
      console.error(err);
      showAlert('error', 'Export failed', 'An error occurred while generating the CSV.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHead}>
          <div>
            <div className={styles.modalTitle}>Export to CSV</div>
            <div className={styles.modalSubtitle}>
              Choose columns to include · {totalCount.toLocaleString()} rows ready
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* ── Left: Column Selector ── */}
          <div className={styles.colSelector}>
            <div className={styles.sectionLabel}>Columns to export</div>
            {columns.map((col) => (
              <label key={String(col.key)} className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={col.selected}
                  onChange={() => toggle(col.key)}
                />
                <span className={styles.checkLabel}>{col.label}</span>
              </label>
            ))}
            <div className={styles.selActions}>
              <button className={styles.smallBtn} onClick={selectAll}>Select all</button>
              <button className={styles.smallBtn} onClick={deselectAll}>Clear</button>
            </div>
          </div>

          {/* ── Right: CSV Preview ── */}
          <div className={styles.preview}>
            <div className={styles.sectionLabel} style={{ marginBottom: 10 }}>
              Preview (first {previewData.length} rows)
            </div>
            <div className={styles.previewTable}>
              {selectedCols.length === 0 ? (
                <div className={styles.previewEmpty}>Select at least one column to preview.</div>
              ) : (
                <table>
                  <thead>
                    <tr>{selectedCols.map((c) => <th key={String(c.key)}>{c.label}</th>)}</tr>
                  </thead>
                  <tbody>
                    {previewData.map((t) => (
                      <tr key={t.id}>
                        {selectedCols.map((c) => {
                          const raw = t[c.key];
                          const val = c.key === 'date'
                            ? format(new Date(String(raw)), 'yyyy-MM-dd')
                            : c.key === 'amount'
                              ? `$${Number(raw).toFixed(2)}`
                              : String(raw);
                          return <td key={String(c.key)}>{val}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFoot}>
          <span className={styles.footInfo}>
            {selectedCount} column{selectedCount !== 1 ? 's' : ''} selected · {totalCount} rows
          </span>
          <button
            className={styles.downloadBtn}
            disabled={selectedCount === 0 || isDownloading}
            onClick={handleDownload}
          >
            {isDownloading ? <Loader2 size={15} className="spinner" /> : <Download size={15} />}
            {isDownloading ? 'Generating...' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;

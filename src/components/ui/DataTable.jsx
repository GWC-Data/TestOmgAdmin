import { useCallback, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Sorting01Icon,
  MoreVerticalIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';

const BORDER = 'rgba(15, 23, 42, 0.08)';
const DEFAULT_PAGE_SIZES = [25, 50, 100];

function iconBtnStyle(disabled) {
  return {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    border: '1px solid #D1D5DB',
    background: '#FFFFFF',
    color: disabled ? '#D1D5DB' : '#374151',
    cursor: disabled ? 'default' : 'pointer',
  };
}

export default function DataTable({
  rows = [],
  columns = [],
  actionColumn,
  loading,
  error,
  errorMessage = "Couldn't load data",
  emptyIcon,
  emptyTitle = 'No data yet',
  emptySubtitle = 'Records will appear here once available.',
  page,
  pageSize,
  total,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageChange,
  onPageSizeChange,
  sortKey,
  onSort,
  getRowKey,
  selected,
  onSelectAll,
  onSelectOne,
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const allOnPageSelected =
    rows.length > 0 && rows.every((r, i) => selected.has(getRowKey(r, i)));

  // ── Resizable columns ──────────────────────────────────────────────────────
  const [colWidths, setColWidths] = useState(() => {
    const w = { __checkbox: 40 };
    columns.forEach((c) => { w[c.key] = c.defaultWidth; });
    if (actionColumn) w['__action'] = 96;
    return w;
  });

  const resizing = useRef(null);

  const onResizeMove = useCallback(
    (e) => {
      if (!resizing.current) return;
      const { key, startX, startWidth } = resizing.current;
      const min = columns.find((c) => c.key === key)?.minWidth ?? 60;
      setColWidths((prev) => ({ ...prev, [key]: Math.max(min, startWidth + (e.clientX - startX)) }));
    },
    [columns],
  );

  const onResizeEnd = useCallback(() => {
    resizing.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', onResizeMove);
    window.removeEventListener('mouseup', onResizeEnd);
  }, [onResizeMove]);

  const startResize = (key) => (e) => {
    e.preventDefault();
    resizing.current = { key, startX: e.clientX, startWidth: colWidths[key] ?? 120 };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', onResizeEnd);
  };

  const Resizer = ({ colKey }) => (
    <div
      onMouseDown={startResize(colKey)}
      style={{ position: 'absolute', top: 0, right: -3, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 2 }}
      onMouseEnter={(e) => { e.currentTarget.firstChild.style.background = '#3B82F6'; }}
      onMouseLeave={(e) => { e.currentTarget.firstChild.style.background = 'transparent'; }}
    >
      <div style={{ width: 2, height: '100%', margin: '0 auto', background: 'transparent' }} />
    </div>
  );

  const cellStyle = {
    padding: '12px 14px',
    fontSize: 13,
    color: '#334155',
    borderRight: `1px solid ${BORDER}`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const totalCols = 1 + columns.length + (actionColumn ? 1 : 0);

  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 800 }}
        >
          <colgroup>
            <col style={{ width: colWidths['__checkbox'] }} />
            {columns.map((c) => <col key={c.key} style={{ width: colWidths[c.key] }} />)}
            {actionColumn && <col style={{ width: colWidths['__action'] }} />}
          </colgroup>

          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: `2px solid ${BORDER}` }}>
              <th style={{ padding: '12px 8px', textAlign: 'center', borderRight: `1px solid ${BORDER}` }}>
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={onSelectAll}
                  style={{ width: 15, height: 15, cursor: 'pointer' }}
                />
              </th>

              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    position: 'relative',
                    textAlign: 'left',
                    padding: '12px 14px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#64748B',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderRight: `1px solid ${BORDER}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    {col.sortable !== false ? (
                      <button
                        onClick={() => onSort(col.key)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: sortKey === col.key ? '#3B82F6' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          flexShrink: 0,
                        }}
                      >
                        <HugeiconsIcon icon={Sorting01Icon} size={11} color="currentColor" />
                        {col.icon && <span style={{ color: '#64748B', display: 'flex', alignItems: 'center' }}>{col.icon}</span>}
                      </button>
                    ) : col.icon ? (
                      <span style={{ color: '#64748B', display: 'flex', alignItems: 'center' }}>{col.icon}</span>
                    ) : null}
                    <span style={{ fontSize: 11, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{col.label}</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                      <HugeiconsIcon icon={MoreVerticalIcon} size={11} color="#CBD5E1" />
                    </div>
                  </div>
                  <Resizer colKey={col.key} />
                </th>
              ))}

              {actionColumn && (
                <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    {actionColumn.icon}
                    <span style={{ fontSize: 11 }}>{actionColumn.label}</span>
                  </div>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`sk-${i}`} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <td style={{ padding: '14px 8px', borderRight: `1px solid ${BORDER}` }} />
                  {columns.map((c) => (
                    <td key={c.key} style={cellStyle}>
                      <div style={{ height: 12, width: '70%', borderRadius: 4, background: '#F1F5F9', animation: 'dt-pulse 1.4s ease-in-out infinite' }} />
                    </td>
                  ))}
                  {actionColumn && <td style={{ padding: '14px 8px' }}><div style={{ height: 28, width: 56, borderRadius: 6, background: '#F1F5F9', animation: 'dt-pulse 1.4s ease-in-out infinite', margin: '0 auto' }} /></td>}
                </tr>
              ))}

            {!loading && error && (
              <tr>
                <td colSpan={totalCols} style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                    <HugeiconsIcon icon={AlertCircleIcon} size={40} color="#94A3B8" />
                  </div>
                  <p style={{ color: '#0F172A', fontWeight: 600, margin: '0 0 4px', fontSize: 16 }}>{errorMessage}</p>
                  <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>Check the connection and refresh to try again.</p>
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={totalCols} style={{ padding: '48px 20px', textAlign: 'center' }}>
                  {emptyIcon && <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{emptyIcon}</div>}
                  <p style={{ color: '#0F172A', fontWeight: 600, margin: '0 0 4px', fontSize: 16 }}>{emptyTitle}</p>
                  <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>{emptySubtitle}</p>
                </td>
              </tr>
            )}

            {!loading && !error && rows.map((row, i) => {
              const rowKey = getRowKey(row, i);
              const isSelected = selected.has(rowKey);
              return (
                <tr
                  key={rowKey}
                  style={{ borderBottom: `1px solid ${BORDER}`, background: isSelected ? '#F0F9FF' : '#FFFFFF', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#FFFFFF'; }}
                >
                  <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: `1px solid ${BORDER}` }}>
                    <input type="checkbox" checked={isSelected} onChange={() => onSelectOne(rowKey)} style={{ width: 15, height: 15, cursor: 'pointer' }} />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} style={{ ...cellStyle, textAlign: col.cellAlign ?? 'left' }}>
                      {col.render ? col.render(row, i) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                  {actionColumn && <td style={{ padding: '12px 8px', textAlign: 'center' }}>{actionColumn.render(row)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3" style={{ borderTop: `1px solid ${BORDER}`, padding: '12px 20px', background: '#F8FAFC' }}>
        <div className="flex items-center gap-3" style={{ fontSize: 13, color: '#475569' }}>
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select value={pageSize} onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }} style={{ border: '1px solid #D1D5DB', borderRadius: 6, padding: '4px 8px', fontSize: 13, color: '#0F172A', background: '#FFFFFF', cursor: 'pointer' }}>
              {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <span style={{ color: '#94A3B8' }}>|</span>
          <span>{rangeStart}–{rangeEnd} of <strong>{total.toLocaleString()}</strong></span>
        </div>

        <div className="flex items-center gap-1">
          <button className="dt-btn-desktop" onClick={() => onPageChange(1)} disabled={page <= 1 || loading} style={iconBtnStyle(page <= 1 || loading)} aria-label="First page">
            <HugeiconsIcon icon={ChevronsLeftIcon} size={15} color="currentColor" />
          </button>
          <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1 || loading} style={iconBtnStyle(page <= 1 || loading)} aria-label="Previous page">
            <HugeiconsIcon icon={ChevronLeftIcon} size={15} color="currentColor" />
          </button>
          <span style={{ fontSize: 13, color: '#475569', marginLeft: 6 }}>Page</span>
          <input type="number" value={page} min={1} max={pageCount} onChange={(e) => { const v = Math.min(pageCount, Math.max(1, Number(e.target.value) || 1)); onPageChange(v); }} style={{ width: 44, border: '1px solid #D1D5DB', borderRadius: 6, padding: '4px 4px', fontSize: 13, textAlign: 'center', background: '#FFFFFF' }} />
          <span style={{ fontSize: 13, color: '#475569' }}>of <strong>{pageCount}</strong></span>
          <button onClick={() => onPageChange(Math.min(pageCount, page + 1))} disabled={page >= pageCount || loading} style={iconBtnStyle(page >= pageCount || loading)} aria-label="Next page" className="ml-1">
            <HugeiconsIcon icon={ChevronRightIcon} size={15} color="currentColor" />
          </button>
          <button className="dt-btn-desktop" onClick={() => onPageChange(pageCount)} disabled={page >= pageCount || loading} style={iconBtnStyle(page >= pageCount || loading)} aria-label="Last page">
            <HugeiconsIcon icon={ChevronsRightIcon} size={15} color="currentColor" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dt-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @media (max-width: 640px) {
          .dt-btn-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
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
  showCheckbox = false,
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpanded = (rowKey) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }
      return next;
    });
  };

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const allOnPageSelected =
    showCheckbox && rows.length > 0 && rows.every((r, i) => selected?.has(getRowKey(r, i)));

  // ── Resizable columns ──────────────────────────────────────────────────────
  const [colWidths, setColWidths] = useState(() => {
    const w = {};
    if (showCheckbox) w.__checkbox = 40;
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

  const getCellStyle = (col, isExpanded) => ({
    padding: '12px 14px',
    fontSize: 13,
    color: '#0f172a',
    fontWeight: 600,
    borderRight: `1px solid ${BORDER}`,
    textAlign: col.cellAlign ?? 'left',
    overflow: isExpanded ? 'visible' : 'hidden',
    textOverflow: isExpanded ? 'clip' : 'ellipsis',
    whiteSpace: isExpanded ? 'normal' : 'nowrap',
    wordBreak: isExpanded ? 'break-word' : 'normal',
  });

  const totalCols = (showCheckbox ? 1 : 0) + columns.length + (actionColumn ? 1 : 0);

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
            {showCheckbox && <col style={{ width: colWidths['__checkbox'] }} />}
            {columns.map((c) => <col key={c.key} style={{ width: colWidths[c.key] }} />)}
            {actionColumn && <col style={{ width: colWidths['__action'] }} />}
          </colgroup>

          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: `2px solid ${BORDER}` }}>
              {showCheckbox && (
                <th style={{ padding: '12px 8px', textAlign: 'center', borderRight: `1px solid ${BORDER}` }}>
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={onSelectAll}
                    style={{ width: 15, height: 15, cursor: 'pointer' }}
                  />
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    position: 'relative',
                    textAlign: 'left',
                    padding: '12px 14px',
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#1e293b',
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
                  {showCheckbox && <td style={{ padding: '14px 8px', borderRight: `1px solid ${BORDER}` }} />}
                  {columns.map((c) => (
                    <td key={c.key} style={getCellStyle(c, false)}>
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
              const isSelected = showCheckbox && selected?.has(rowKey);
              const isExpanded = expandedRows.has(rowKey);
              return (
                <tr
                  key={rowKey}
                  onClick={(e) => {
                    if (e.target.tagName === 'INPUT' || e.target.closest('button') || e.target.closest('a')) {
                      return;
                    }
                    toggleRowExpanded(rowKey);
                  }}
                  style={{ borderBottom: `1px solid ${BORDER}`, background: isSelected ? '#F0F9FF' : '#FFFFFF', transition: 'background 0.15s ease', cursor: 'pointer' }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#FFFFFF'; }}
                >
                  {showCheckbox && (
                    <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: `1px solid ${BORDER}` }}>
                      <input type="checkbox" checked={isSelected} onChange={() => onSelectOne(rowKey)} style={{ width: 15, height: 15, cursor: 'pointer' }} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} style={getCellStyle(col, isExpanded)}>
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

      <div className="flex flex-row items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 bg-[#F8FAFC]">
        {/* Left side: Rows selector and stats */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs text-gray-500 font-medium shrink-0">
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline">Rows:</span>
            <select value={pageSize} onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }} style={{ border: '1px solid #D1D5DB', borderRadius: 6, padding: '2px 4px', fontSize: 11, color: '#0F172A', background: '#FFFFFF', cursor: 'pointer' }}>
              {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-[11px] sm:text-xs">{rangeStart}–{rangeEnd} of <strong className="text-gray-700">{total}</strong></span>
        </div>

        {/* Right side: Page navigation */}
        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
          <button className="dt-btn-desktop" onClick={() => onPageChange(1)} disabled={page <= 1 || loading} style={iconBtnStyle(page <= 1 || loading)} aria-label="First page">
            <HugeiconsIcon icon={ChevronsLeftIcon} size={13} color="currentColor" />
          </button>
          <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1 || loading} style={iconBtnStyle(page <= 1 || loading)} aria-label="Previous page">
            <HugeiconsIcon icon={ChevronLeftIcon} size={13} color="currentColor" />
          </button>
          
          <span className="text-[11px] sm:text-xs">Page</span>
          <input type="number" value={page} min={1} max={pageCount} onChange={(e) => { const v = Math.min(pageCount, Math.max(1, Number(e.target.value) || 1)); onPageChange(v); }} style={{ width: 34, border: '1px solid #D1D5DB', borderRadius: 6, padding: '2px 0', fontSize: 11, textAlign: 'center', background: '#FFFFFF' }} />
          <span className="text-[11px] sm:text-xs">of <strong>{pageCount}</strong></span>
          
          <button onClick={() => onPageChange(Math.min(pageCount, page + 1))} disabled={page >= pageCount || loading} style={iconBtnStyle(page >= pageCount || loading)} aria-label="Next page">
            <HugeiconsIcon icon={ChevronRightIcon} size={13} color="currentColor" />
          </button>
          <button className="dt-btn-desktop" onClick={() => onPageChange(pageCount)} disabled={page >= pageCount || loading} style={iconBtnStyle(page >= pageCount || loading)} aria-label="Last page">
            <HugeiconsIcon icon={ChevronsRightIcon} size={13} color="currentColor" />
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
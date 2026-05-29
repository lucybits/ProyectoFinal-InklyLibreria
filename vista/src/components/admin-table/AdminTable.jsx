import { FiEdit2, FiTrash2 } from 'react-icons/fi'

function AdminTable({ columns, rows, emptyMessage, onEdit, onDelete }) {
  return (
    <div className="admin-table-shell">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key}>{column.label}</th>
            ))}
            {(onEdit || onDelete) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="admin-empty-row" colSpan={columns.length + 1}>
                {emptyMessage}
              </td>
            </tr>
          ) : rows.map(row => (
            <tr key={row.id}>
              {columns.map(column => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  <div className="admin-row-actions">
                    {onEdit && (
                      <button type="button" className="admin-icon-btn" onClick={() => onEdit(row)} title="Editar">
                        <FiEdit2 />
                      </button>
                    )}
                    {onDelete && (
                      <button type="button" className="admin-icon-btn danger" onClick={() => onDelete(row)} title="Eliminar">
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminTable

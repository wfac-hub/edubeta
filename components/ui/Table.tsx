
/**
 * Este archivo define un componente de Tabla genérico y reutilizable.
 * Está diseñado para ser altamente configurable e incluye características como ordenación, búsqueda,
 * paginación y un diseño responsive que cambia a una vista de tarjetas en pantallas pequeñas.
 */

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, MoreHorizontal } from 'lucide-react';
import Input from './Input';
import StickyScrollWrapper from './StickyScrollWrapper';

/**
 * Define la estructura para una columna de la tabla.
 * @template T - El tipo de los elementos de datos en la tabla.
 */
export interface Column<T> {
  /** El texto a mostrar en la cabecera de la columna. */
  header: string;
  /** 
   * Cómo acceder a los datos para esta columna.
   * Puede ser una clave del objeto de datos, o una función que recibe el elemento completo
   * y devuelve un nodo de React, permitiendo un renderizado personalizado.
   */
  accessor: keyof T | ((item: T) => React.ReactNode);
  /** Si la columna debe ser ordenable. */
  sortable?: boolean;
}

/**
 * Define las props para el componente de Tabla.
 * @template T - El tipo de los elementos de datos.
 */
interface TableProps<T> {
  /** Un array de definiciones de columnas. */
  columns: Column<T>[];
  /** El array de datos a mostrar en la tabla. */
  data: T[];
  /** Una función opcional que renderiza los botones de acción para cada fila. */
  renderRowActions?: (item: T) => React.ReactNode;
}

/**
 * Un componente de tabla genérico y rico en características.
 * Maneja su propio estado interno para la búsqueda, ordenación y paginación.
 * @template T - El tipo de los elementos de datos, restringido a tener una propiedad `id`.
 */
const Table = <T extends { id: number | string }>(
    { columns, data, renderRowActions }: TableProps<T>
) => {
  // Estado para el valor del input de búsqueda.
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para la configuración de ordenación (por qué clave ordenar y en qué dirección).
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  // Estado para el número de página actual.
  const [currentPage, setCurrentPage] = useState(1);
  // Estado para rastrear qué fila está expandida en la vista móvil.
  const [expandedRow, setExpandedRow] = useState<number | string | null>(null);
  // Número de elementos a mostrar por página.
  const itemsPerPage = 10;
  
  /**
   * Cambia el estado de expansión de una fila en la vista móvil.
   */
  const handleToggleExpand = (id: number | string) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  /**
   * Función memoizada para filtrar datos según el término de búsqueda.
   * Se ejecuta solo cuando los datos o el término de búsqueda cambian.
   */
  const filteredData = useMemo(() => {
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);
  
  /**
   * Función memoizada para ordenar los datos filtrados según la configuración de ordenación.
   * Se ejecuta solo cuando los datos filtrados o la configuración de ordenación cambian.
   */
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  /**
   * Función memoizada para paginar los datos ordenados.
   * Se ejecuta solo cuando los datos ordenados o la página actual cambian.
   */
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);
  
  // Calcula el número total de páginas necesarias para la paginación.
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  
  /**
   * Maneja un clic en una cabecera de columna ordenable, cambiando la dirección de ordenación.
   */
  const requestSort = (key: keyof T) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  /**
   * Devuelve el icono de ordenación apropiado (flecha arriba o abajo) para una clave de columna dada.
   */
  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'ascending') return <ChevronUp className="inline ml-1 h-4 w-4" />;
    return <ChevronDown className="inline ml-1 h-4 w-4" />;
  };
  
  /**
   * Renderiza el contenido de una celda individual basado en el accesor de la columna.
   */
  const renderCellContent = (item: T, column: Column<T>) => {
    return typeof column.accessor === 'function' 
      ? column.accessor(item) 
      : String(item[column.accessor as keyof T]);
  };

  return (
    <div className="relative">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm">
          {/* Barra de Búsqueda */}
          <div className="p-4">
              <Input 
                  type="text" 
                  placeholder="Buscar en la tabla..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search size={16} className="text-gray-400" />}
              />
          </div>

        {/* === Vista Móvil: Diseño basado en tarjetas (Visible hasta LG) === */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {paginatedData.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleToggleExpand(item.id)}
                  className="w-full text-left px-4 py-3 flex justify-between items-center"
                  aria-expanded={expandedRow === item.id}
                >
                  <div className="flex-1 font-medium text-gray-800 dark:text-slate-200">{renderCellContent(item, columns[0])}</div>
                  <MoreHorizontal className={`transition-transform duration-300 ${expandedRow === item.id ? 'rotate-90' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 ${expandedRow === item.id ? 'max-h-[500px]' : ''}`}
                >
                  <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-slate-700/50">
                    <div className="space-y-2 text-sm">
                      {columns.map((col, index) => (
                        <div key={index} className="flex justify-between items-start gap-4">
                          <span className="font-semibold text-gray-600 dark:text-slate-400 shrink-0">{col.header}:</span>
                          <div className="text-right text-gray-800 dark:text-slate-200 break-words">{renderCellContent(item, col)}</div>
                        </div>
                      ))}
                      {renderRowActions && (
                        <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-slate-600">
                            {renderRowActions(item)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === Vista de Escritorio: Diseño de tabla tradicional (Visible desde LG) === */}
        <div className="hidden lg:block">
          <StickyScrollWrapper>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                    {columns.map((col, index) => (
                    <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {col.sortable ? (
                        <button onClick={() => requestSort(col.accessor as keyof T)} className="flex items-center">
                            {col.header}
                            {getSortIcon(col.accessor as keyof T)}
                        </button>
                        ) : (
                        col.header
                        )}
                    </th>
                    ))}
                    {renderRowActions && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>}
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    {columns.map((col, index) => (
                        <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">
                        {renderCellContent(item, col)}
                        </td>
                    ))}
                    {renderRowActions && <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{renderRowActions(item)}</td>}
                    </tr>
                ))}
                </tbody>
            </table>
          </StickyScrollWrapper>
        </div>
        
        {/* === Controles de Paginación === */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-slate-700 sm:px-6">
          <div>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> de <span className="font-medium">{sortedData.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50">
                  Anterior
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50">
                  Siguiente
                </button>
              </nav>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
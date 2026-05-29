import { useEffect, useState } from 'react'
import { FiBookOpen, FiGrid, FiList, FiPlus, FiRefreshCw, FiSave, FiTag, FiX } from 'react-icons/fi'
import AdminTable from '../components/admin-table/AdminTable'
import { createBook, deleteBook, getBooks, updateBook } from '../services/bookService'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../services/categoryService'
import { createComic, deleteComic, getComics, updateComic } from '../services/comicService'
import { deleteOrder, getOrders, updateOrderStatus } from '../services/orderService'
import { deleteRental, getAllRentals, updateRentalStatus } from '../services/rentalService'
import './Admin.css'

const emptyProduct = {
  title: '',
  author: '',
  description: '',
  price: '',
  rentalPrice: '',
  stock: '',
  imageUrl: '',
  isAvailableForRental: true,
  categoryId: ''
}

const emptyCategory = {
  name: '',
  description: '',
  type: 'book'
}

const tabs = [
  { id: 'books', label: 'Libros', icon: FiBookOpen },
  { id: 'comics', label: 'Comics', icon: FiGrid },
  { id: 'categories', label: 'Categorias', icon: FiTag },
  { id: 'orders', label: 'Ordenes', icon: FiList },
  { id: 'rentals', label: 'Rentas', icon: FiRefreshCw }
]

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function Admin() {
  const [activeTab, setActiveTab] = useState('books')
  const [books, setBooks] = useState([])
  const [comics, setComics] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [rentals, setRentals] = useState([])
  const [productForm, setProductForm] = useState(emptyProduct)
  const [categoryForm, setCategoryForm] = useState(emptyCategory)
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isProductTab = activeTab === 'books' || activeTab === 'comics'
  const currentProducts = activeTab === 'books' ? books : comics
  const currentProductCategories = categories.filter(category => category.type === (activeTab === 'books' ? 'book' : 'comic'))

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [booksData, comicsData, categoriesData, ordersData, rentalsData] = await Promise.all([
        getBooks(),
        getComics(),
        getCategories(),
        getOrders(),
        getAllRentals()
      ])
      setBooks(booksData)
      setComics(comicsData)
      setCategories(categoriesData)
      setOrders(ordersData)
      setRentals(rentalsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setEditingProductId(null)
    setProductForm(emptyProduct)
    setEditingCategoryId(null)
    setCategoryForm(emptyCategory)
    setMessage('')
    setError('')
  }, [activeTab])

  const showSuccess = (text) => {
    setMessage(text)
    setError('')
  }

  const handleProductChange = (event) => {
    const { name, value, type, checked } = event.target
    setProductForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCategoryChange = (event) => {
    const { name, value } = event.target
    setCategoryForm(prev => ({ ...prev, [name]: value }))
  }

  const productPayload = () => ({
    title: productForm.title.trim(),
    author: productForm.author.trim(),
    description: productForm.description.trim(),
    price: Number(productForm.price),
    rentalPrice: Number(productForm.rentalPrice),
    stock: Number(productForm.stock),
    imageUrl: productForm.imageUrl.trim(),
    isAvailableForRental: productForm.isAvailableForRental,
    categoryId: Number(productForm.categoryId)
  })

  const saveProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = productPayload()
      if (activeTab === 'books') {
        editingProductId ? await updateBook(editingProductId, payload) : await createBook(payload)
      } else {
        editingProductId ? await updateComic(editingProductId, payload) : await createComic(payload)
      }
      setProductForm(emptyProduct)
      setEditingProductId(null)
      await loadData()
      showSuccess(editingProductId ? 'Producto actualizado.' : 'Producto creado.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const editProduct = (item) => {
    setEditingProductId(item.id)
    setProductForm({
      title: item.title || '',
      author: item.author || '',
      description: item.description || '',
      price: item.price ?? '',
      rentalPrice: item.rentalPrice ?? '',
      stock: item.stock ?? '',
      imageUrl: item.imageUrl || '',
      isAvailableForRental: Boolean(item.isAvailableForRental),
      categoryId: item.categoryId || ''
    })
  }

  const removeProduct = async (item) => {
    const ok = window.confirm(`Eliminar "${item.title}"?`)
    if (!ok) return
    try {
      activeTab === 'books' ? await deleteBook(item.id) : await deleteComic(item.id)
      await loadData()
      showSuccess('Producto eliminado.')
    } catch (err) {
      setError(err.message)
    }
  }

  const saveCategory = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        type: categoryForm.type
      }
      editingCategoryId ? await updateCategory(editingCategoryId, payload) : await createCategory(payload)
      setCategoryForm(emptyCategory)
      setEditingCategoryId(null)
      await loadData()
      showSuccess(editingCategoryId ? 'Categoria actualizada.' : 'Categoria creada.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const editCategory = (category) => {
    setEditingCategoryId(category.id)
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      type: category.type || 'book'
    })
  }

  const removeCategory = async (category) => {
    const ok = window.confirm(`Eliminar la categoria "${category.name}"?`)
    if (!ok) return
    try {
      await deleteCategory(category.id)
      await loadData()
      showSuccess('Categoria eliminada.')
    } catch (err) {
      setError(err.message)
    }
  }

  const changeOrderStatus = async (order, status) => {
    try {
      await updateOrderStatus(order.id, status)
      await loadData()
      showSuccess('Orden actualizada.')
    } catch (err) {
      setError(err.message)
    }
  }

  const changeRentalStatus = async (rental, status) => {
    try {
      await updateRentalStatus(rental.id, status)
      await loadData()
      showSuccess('Renta actualizada.')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeOrder = async (order) => {
    if (!window.confirm(`Eliminar orden #${order.id}?`)) return
    try {
      await deleteOrder(order.id)
      await loadData()
      showSuccess('Orden eliminada.')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeRental = async (rental) => {
    if (!window.confirm(`Eliminar renta #${rental.id}?`)) return
    try {
      await deleteRental(rental.id)
      await loadData()
      showSuccess('Renta eliminada.')
    } catch (err) {
      setError(err.message)
    }
  }

  const productColumns = [
    { key: 'title', label: 'Titulo' },
    { key: 'author', label: 'Autor' },
    { key: 'price', label: 'Venta', render: row => money(row.price) },
    { key: 'rentalPrice', label: 'Renta', render: row => money(row.rentalPrice) },
    { key: 'stock', label: 'Stock' },
    { key: 'category', label: 'Categoria', render: row => row.category?.name || categories.find(category => category.id === row.categoryId)?.name || '-' }
  ]

  const categoryColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'type', label: 'Tipo', render: row => row.type === 'book' ? 'Libro' : 'Comic' },
    { key: 'description', label: 'Descripcion' }
  ]

  const orderColumns = [
    { key: 'id', label: 'Orden', render: row => `#${row.id}` },
    { key: 'customer', label: 'Cliente', render: row => row.customer?.name || `Cliente ${row.customerId}` },
    { key: 'total', label: 'Total', render: row => money(row.total) },
    { key: 'status', label: 'Estado', render: row => (
      <select className="admin-status-select" value={row.status} onChange={event => changeOrderStatus(row, event.target.value)}>
        <option value="pending">Pendiente</option>
        <option value="paid">Pagada</option>
        <option value="shipped">Enviada</option>
        <option value="cancelled">Cancelada</option>
      </select>
    ) },
    { key: 'orderDate', label: 'Fecha', render: row => new Date(row.orderDate).toLocaleDateString() }
  ]

  const rentalColumns = [
    { key: 'id', label: 'Renta', render: row => `#${row.id}` },
    { key: 'customer', label: 'Cliente', render: row => row.customer?.name || `Cliente ${row.customerId}` },
    { key: 'item', label: 'Producto', render: row => row.book?.title || row.comic?.title || '-' },
    { key: 'price', label: 'Precio', render: row => money(row.price) },
    { key: 'status', label: 'Estado', render: row => (
      <select className="admin-status-select" value={row.status} onChange={event => changeRentalStatus(row, event.target.value)}>
        <option value="active">Activa</option>
        <option value="returned">Devuelta</option>
        <option value="late">Atrasada</option>
        <option value="cancelled">Cancelada</option>
      </select>
    ) },
    { key: 'endDate', label: 'Entrega', render: row => new Date(row.endDate).toLocaleDateString() }
  ]

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <h1>Panel de administrador</h1>
        </div>
        <button type="button" className="admin-secondary-btn" onClick={loadData}>
          <FiRefreshCw /> Actualizar
        </button>
      </section>

      <nav className="admin-tabs" aria-label="Secciones de administrador">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} type="button" className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              <Icon /> {tab.label}
            </button>
          )
        })}
      </nav>

      {(message || error) && (
        <div className={`admin-alert ${error ? 'error' : 'success'}`}>
          {error || message}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Cargando panel...</div>
      ) : (
        <section className="admin-workspace">
          {isProductTab && (
            <aside className="admin-form-panel">
              <div className="admin-panel-title">
                <h2>{editingProductId ? 'Editar producto' : 'Nuevo producto'}</h2>
                {editingProductId && (
                  <button type="button" className="admin-icon-btn" onClick={() => { setEditingProductId(null); setProductForm(emptyProduct) }} title="Cancelar edicion">
                    <FiX />
                  </button>
                )}
              </div>
              <form className="admin-form" onSubmit={saveProduct}>
                <label>Titulo<input required name="title" value={productForm.title} onChange={handleProductChange} /></label>
                <label>Autor<input required name="author" value={productForm.author} onChange={handleProductChange} /></label>
                <label>Descripcion<textarea required name="description" rows="4" value={productForm.description} onChange={handleProductChange} /></label>
                <div className="admin-form-grid">
                  <label>Precio<input required min="0" step="0.01" type="number" name="price" value={productForm.price} onChange={handleProductChange} /></label>
                  <label>Renta<input required min="0" step="0.01" type="number" name="rentalPrice" value={productForm.rentalPrice} onChange={handleProductChange} /></label>
                  <label>Stock<input required min="0" type="number" name="stock" value={productForm.stock} onChange={handleProductChange} /></label>
                  <label>Categoria
                    <select required name="categoryId" value={productForm.categoryId} onChange={handleProductChange}>
                      <option value="">Selecciona</option>
                      {currentProductCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>URL de portada<input required name="imageUrl" value={productForm.imageUrl} onChange={handleProductChange} /></label>
                <label className="admin-check">
                  <input type="checkbox" name="isAvailableForRental" checked={productForm.isAvailableForRental} onChange={handleProductChange} />
                  Disponible para renta
                </label>
                <button className="admin-primary-btn" disabled={saving} type="submit">
                  {editingProductId ? <FiSave /> : <FiPlus />} {saving ? 'Guardando...' : editingProductId ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </form>
            </aside>
          )}

          {activeTab === 'categories' && (
            <aside className="admin-form-panel">
              <div className="admin-panel-title">
                <h2>{editingCategoryId ? 'Editar categoria' : 'Nueva categoria'}</h2>
                {editingCategoryId && (
                  <button type="button" className="admin-icon-btn" onClick={() => { setEditingCategoryId(null); setCategoryForm(emptyCategory) }} title="Cancelar edicion">
                    <FiX />
                  </button>
                )}
              </div>
              <form className="admin-form" onSubmit={saveCategory}>
                <label>Nombre<input required name="name" value={categoryForm.name} onChange={handleCategoryChange} /></label>
                <label>Tipo
                  <select name="type" value={categoryForm.type} onChange={handleCategoryChange}>
                    <option value="book">Libro</option>
                    <option value="comic">Comic</option>
                  </select>
                </label>
                <label>Descripcion<textarea required name="description" rows="4" value={categoryForm.description} onChange={handleCategoryChange} /></label>
                <button className="admin-primary-btn" disabled={saving} type="submit">
                  {editingCategoryId ? <FiSave /> : <FiPlus />} {saving ? 'Guardando...' : editingCategoryId ? 'Guardar cambios' : 'Crear categoria'}
                </button>
              </form>
            </aside>
          )}

          <div className="admin-table-panel">
            {isProductTab && (
              <AdminTable columns={productColumns} rows={currentProducts} emptyMessage="No hay productos registrados." onEdit={editProduct} onDelete={removeProduct} />
            )}
            {activeTab === 'categories' && (
              <AdminTable columns={categoryColumns} rows={categories} emptyMessage="No hay categorias registradas." onEdit={editCategory} onDelete={removeCategory} />
            )}
            {activeTab === 'orders' && (
              <AdminTable columns={orderColumns} rows={orders} emptyMessage="No hay ordenes registradas." onDelete={removeOrder} />
            )}
            {activeTab === 'rentals' && (
              <AdminTable columns={rentalColumns} rows={rentals} emptyMessage="No hay rentas registradas." onDelete={removeRental} />
            )}
          </div>
        </section>
      )}
    </main>
  )
}

export default Admin

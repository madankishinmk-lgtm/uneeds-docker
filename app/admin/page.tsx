'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, LayoutGrid, Package, CircleDollarSign, ListChecks, Trash2, UploadCloud, Eye, Download, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { getStoragePublicUrl } from '@/lib/storage';
import { getStatusClasses } from '@/lib/order-status';

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenue: 0 });
  const [productForm, setProductForm] = useState({ id: '', name: '', price: '', stock: '0', image_url: '', description: '' });
  const [settingsForm, setSettingsForm] = useState({ whatsapp_number: '', bca_account_number: '', bca_account_name: '', service_fee: '0', ordering_enabled: true, order_open_date: '', order_close_date: '' });
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofZoom, setProofZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const loadData = async () => {
    const [ordersRes, productsRes, settingsRes] = await Promise.all([
      fetch('/api/orders'),
      fetch('/api/products'),
      fetch('/api/settings'),
    ]);
    const ordersData = await ordersRes.json();
    const productsData = await productsRes.json();
    const settingsData = await settingsRes.json();
    setOrders(ordersData.orders || []);
    setProducts(productsData.products || []);
    setSettingsForm({
      whatsapp_number: settingsData.settings?.whatsapp_number || '',
      bca_account_number: settingsData.settings?.bca_account_number || '',
      bca_account_name: settingsData.settings?.bca_account_name || '',
      service_fee: String(settingsData.settings?.service_fee || 0),
      ordering_enabled: settingsData.settings?.ordering_enabled !== false,
      order_open_date: settingsData.settings?.order_open_date || '',
      order_close_date: settingsData.settings?.order_close_date || '',
    });
    const totalRevenue = (ordersData.orders || []).reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
    setStats({
      total: ordersData.orders?.length || 0,
      pending: (ordersData.orders || []).filter((order: any) => order.status === 'Waiting Verification').length,
      completed: (ordersData.orders || []).filter((order: any) => order.status === 'Completed').length,
      revenue: totalRevenue,
    });
  };

  useEffect(() => {
    const verifySession = async () => {
      const response = await fetch('/api/admin/me');
      if (response.ok) {
        setAuthorized(true);
        await loadData();
      }
    };

    verifySession();
  }, []);

  useEffect(() => {
    if (!authorized) return;
    loadData();
  }, [authorized]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();

    if (response.ok) {
      setAuthorized(true);
      setMessage('');
      await loadData();
    } else {
      setMessage(data.error || 'Invalid password');
    }
  };

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      product: {
        id: productForm.id || undefined,
        name: productForm.name,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        image_url: productForm.image_url,
        description: productForm.description,
      },
    };

    const method = productForm.id ? 'PUT' : 'POST';
    const response = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (response.ok) {
      setMessage('Product saved.');
      setProductForm({ id: '', name: '', price: '', stock: '99', image_url: '', description: '' });
      await loadData();
    } else {
      setMessage(data.error || 'Unable to save product.');
    }
  };

  const editProduct = (product: any) => {
    setProductForm({ id: product.id, name: product.name, price: String(product.price), stock: String(product.stock || 99), image_url: product.image_url || '', description: product.description || '' });
  };

  const deleteProduct = async (productId: string) => {
    const response = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
    if (response.ok) {
      await loadData();
    }
  };

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: { ...settingsForm, service_fee: Number(settingsForm.service_fee), ordering_enabled: settingsForm.ordering_enabled, order_open_date: settingsForm.order_open_date, order_close_date: settingsForm.order_close_date } }) });
    const body = await response.json();
    if (response.ok) {
      setMessage('Settings updated.');
      await loadData();
    } else {
      setMessage(body.error || 'Unable to save settings.');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const response = await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: orderId, status }) });
    if (response.ok) {
      await loadData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((current: any) => current ? { ...current, status } : current);
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = window.confirm('Delete this order and its related payment proof?');
    if (!confirmed) return;

    const response = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
    if (response.ok) {
      setMessage('Order deleted.');
      setSelectedOrder(null);
      await loadData();
    } else {
      setMessage('Unable to delete order.');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');

    setUploadingImage(true);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    setUploadingImage(false);

    if (response.ok && data.path) {
      setProductForm((current) => ({ ...current, image_url: data.path }));
      setMessage('Product image uploaded.');
    } else {
      setMessage(data.error || 'Image upload failed.');
    }
  };

  const filteredOrders = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const filtered = orders.filter((order) => {
      const searchable = [order.order_id, order.customer_name, order.whatsapp, order.major].join(' ').toLowerCase();
      const matchesQuery = searchable.includes(query);
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });
  }, [orders, searchTerm, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pagedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] px-4">
        <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleLogin} className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
          <div className="flex items-center gap-3 text-[var(--primary)]">
            <ShieldCheck size={24} />
            <h1 className="text-2xl font-semibold">Admin Access</h1>
          </div>
          <p className="mt-3 text-sm text-slate-600">Enter the password to manage orders and settings.</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          <button className="mt-4 w-full rounded-full bg-[var(--primary)] px-4 py-3 font-semibold text-white">Unlock dashboard</button>
        </motion.form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)] px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Admin Panel</p>
              <h1 className="text-3xl font-semibold">UNeeds Operations</h1>
            </div>
            <div className="rounded-full bg-[var(--secondary)]/20 px-4 py-2 text-sm font-semibold text-[var(--primary)]">Protected by password</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm"><div className="flex items-center gap-3"><LayoutGrid className="text-[var(--primary)]" /><div><p className="text-sm text-slate-500">Today&apos;s Orders</p><p className="text-2xl font-semibold">{stats.total}</p></div></div></div>
          <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm"><div className="flex items-center gap-3"><ListChecks className="text-[var(--primary)]" /><div><p className="text-sm text-slate-500">Pending Verification</p><p className="text-2xl font-semibold">{stats.pending}</p></div></div></div>
          <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm"><div className="flex items-center gap-3"><Package className="text-[var(--primary)]" /><div><p className="text-sm text-slate-500">Completed Orders</p><p className="text-2xl font-semibold">{stats.completed}</p></div></div></div>
          <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm"><div className="flex items-center gap-3"><CircleDollarSign className="text-[var(--primary)]" /><div><p className="text-sm text-slate-500">Revenue</p><p className="text-2xl font-semibold">{formatRupiah(stats.revenue)}</p></div></div></div>
        </div>

        {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Orders</h2>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
                  <Search size={16} className="text-slate-400" />
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search orders" className="bg-transparent outline-none" />
                </label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
                  <option value="All">All Status</option>
                  <option value="Waiting Verification">Waiting Verification</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4">Order ID</th>
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Major</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Total</th>
                    <th className="py-3 pr-4">Created Date</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((order) => (
                    <tr key={order.id} className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50" onClick={() => setSelectedOrder(order)}>
                      <td className="py-3 pr-4 font-semibold text-[var(--primary)]">{order.order_id}</td>
                      <td className="py-3 pr-4">{order.customer_name}</td>
                      <td className="py-3 pr-4">{order.major}</td>
                      <td className="py-3 pr-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(order.status)}`}>{order.status}</span></td>
                      <td className="py-3 pr-4">{formatRupiah(order.total)}</td>
                      <td className="py-3 pr-4">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</td>
                      <td className="py-3 pr-4" onClick={(event) => event.stopPropagation()}>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setSelectedOrder(order)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">View</button>
                          <button onClick={() => updateOrderStatus(order.id, 'Approved')} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Approve</button>
                          <button onClick={() => updateOrderStatus(order.id, 'Completed')} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Complete</button>
                          <button onClick={() => updateOrderStatus(order.id, 'Rejected')} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {Math.min(pageSize, filteredOrders.length)} of {filteredOrders.length} orders</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50">Previous</button>
                <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
              <h2 className="text-xl font-semibold">Product Management</h2>
              <form onSubmit={saveProduct} className="mt-4 space-y-3">
                <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <input value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="Price" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <input value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} placeholder="Stock" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                  <UploadCloud size={16} />
                  {uploadingImage ? 'Uploading...' : (productForm.image_url ? 'Replace image' : 'Upload image')}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
                </label>
                {productForm.image_url ? <img src={getStoragePublicUrl(productForm.image_url) || undefined} alt="Preview" className="h-32 w-full rounded-2xl object-cover" /> : null}
                <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Description" className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <button className="w-full rounded-full bg-[var(--primary)] px-4 py-3 font-semibold text-white">Save Product</button>
              </form>
              <div className="mt-4 space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-slate-500">{formatRupiah(product.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editProduct(product)} className="rounded-full bg-slate-100 px-3 py-1 text-sm">Edit</button>
                      <button onClick={() => deleteProduct(product.id)} className="rounded-full bg-rose-100 p-2 text-rose-700"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
              <h2 className="text-xl font-semibold">Settings</h2>
              <form onSubmit={saveSettings} className="mt-4 space-y-3">
                <input value={settingsForm.whatsapp_number} onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })} placeholder="WhatsApp Number" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <input value={settingsForm.bca_account_number} onChange={(e) => setSettingsForm({ ...settingsForm, bca_account_number: e.target.value })} placeholder="BCA Account Number" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <input value={settingsForm.bca_account_name} onChange={(e) => setSettingsForm({ ...settingsForm, bca_account_name: e.target.value })} placeholder="BCA Account Name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <input value={settingsForm.service_fee} onChange={(e) => setSettingsForm({ ...settingsForm, service_fee: e.target.value })} placeholder="Service Fee" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                <button className="w-full rounded-full bg-[var(--primary)] px-4 py-3 font-semibold text-white">Save Settings</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.3)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Order Details</p>
                <h2 className="mt-2 text-2xl font-semibold">{selectedOrder.order_id}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="rounded-full bg-slate-100 p-2 text-slate-600"><X size={16} /></button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-4 rounded-[24px] border border-slate-200 p-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Full Name</span><span className="font-semibold text-right">{selectedOrder.customer_name}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">WhatsApp</span><span className="font-semibold text-right">{selectedOrder.whatsapp}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Student ID</span><span className="font-semibold text-right">{selectedOrder.student_id || '—'}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Major</span><span className="font-semibold text-right">{selectedOrder.major}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Gender</span><span className="font-semibold text-right">{selectedOrder.gender}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Notes</span><span className="max-w-[220px] text-right text-slate-600">{selectedOrder.notes || '—'}</span></div>
                </div>
              </div>

              <div className="space-y-4 rounded-[24px] border border-slate-200 p-4">
                <h3 className="text-lg font-semibold">Purchased Items</h3>
                <div className="space-y-2">
                  {(selectedOrder.order_items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 text-sm">
                      <div>
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-slate-500">Qty {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatRupiah(item.total_price)}</p>
                        <p className="text-slate-500">{formatRupiah(item.unit_price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-4 rounded-[24px] border border-slate-200 p-4">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                  {selectedOrder.payment_proof_url ? (
                    <div className="space-y-3">
                      <button onClick={() => { setProofModalOpen(true); setProofZoom(1); }} className="block w-full overflow-hidden rounded-[16px] border border-slate-200 bg-white">
                        <img src={selectedOrder.payment_proof_url} alt="Payment proof" className="h-48 w-full object-cover" />
                      </button>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => { setProofModalOpen(true); setProofZoom(1); }} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold"><Eye size={14} /> Open full screen</button>
                        <a href={selectedOrder.payment_proof_url} target="_blank" rel="noreferrer" download className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white"><Download size={14} /> Download</a>
                      </div>
                    </div>
                  ) : <p className="text-sm text-slate-500">No payment proof uploaded.</p>}
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Uploaded Time</span><span className="font-semibold">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Order ID</span><span className="font-semibold">{selectedOrder.order_id}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-semibold">{formatRupiah(selectedOrder.total)}</span></div>
                </div>
              </div>

              <div className="space-y-4 rounded-[24px] border border-slate-200 p-4">
                <h3 className="text-lg font-semibold">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'Approved')} className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">Approve</button>
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'Rejected')} className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">Reject</button>
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'Completed')} className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">Complete</button>
                  <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"><span className="mr-2 inline-flex"><Trash2 size={14} /></span>Delete Order</button>
                </div>
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  Current status: <span className={`ml-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(selectedOrder.status)}`}>{selectedOrder.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {proofModalOpen && selectedOrder?.payment_proof_url ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <div className="w-full max-w-4xl rounded-[32px] border border-white/20 bg-white p-4 shadow-[0_20px_80px_rgba(15,23,42,0.4)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-600">Payment proof preview</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setProofZoom((current) => Math.max(1, current - 0.25))} className="rounded-full bg-slate-100 p-2"><ZoomOut size={16} /></button>
                <button onClick={() => setProofZoom(1)} className="rounded-full bg-slate-100 p-2"><RotateCcw size={16} /></button>
                <button onClick={() => setProofZoom((current) => current + 0.25)} className="rounded-full bg-slate-100 p-2"><ZoomIn size={16} /></button>
                <button onClick={() => { setProofModalOpen(false); setProofZoom(1); }} className="rounded-full bg-slate-100 p-2"><X size={16} /></button>
              </div>
            </div>
            <div className="mt-4 flex min-h-[60vh] items-center justify-center overflow-auto rounded-[24px] bg-slate-100 p-4">
              <img src={selectedOrder.payment_proof_url} alt="Payment proof full screen" className="max-h-[70vh] max-w-full rounded-[16px] object-contain" style={{ transform: `scale(${proofZoom})` }} />
            </div>
            <div className="mt-4 flex justify-end">
              <a href={selectedOrder.payment_proof_url} target="_blank" rel="noreferrer" download className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"><Download size={14} /> Download image</a>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

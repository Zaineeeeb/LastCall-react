import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, Tag, Clock, MapPin, Plus } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState({ title: '', description: '', originalPrice: '', discountedPrice: '', quantity: 1, collectionTime: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user?.role === 'customer') {
        const itemRes = await api.get('/items');
        setItems(itemRes.data);
        const orderRes = await api.get('/orders/my-orders');
        setOrders(orderRes.data);
      } else {
        const itemRes = await api.get('/items/my-items');
        setItems(itemRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleReserve = async (itemId) => {
    try {
      await api.post('/orders/reserve', { item_id: itemId, quantity: 1 });
      alert('Reserved successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error reserving item');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newItem).forEach(key => {
      formData.append(key, newItem[key]);
    });
    // Append image if selected
    const imageFile = document.getElementById('item-image').files[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowAddForm(false);
      setNewItem({ title: '', description: '', originalPrice: '', discountedPrice: '', quantity: 1, collectionTime: '' });
      fetchData();
    } catch (err) {
      alert('Error adding item');
    }
  };

  // Helper to format currency
  const formatPrice = (price) => `${parseFloat(price).toFixed(2)} DT`;

  if (!user) return null;

  return (
    <div>
      <nav className="navbar container">
        <div className="nav-logo">LastCall</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Hello, {user.name} <span className="badge badge-green" style={{ marginLeft: '0.5rem' }}>{user.role}</span></span>
          <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)' }}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ marginTop: '2rem' }}>

        {user.role === 'customer' ? (
          <>
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Tag /> Available Meals</h2>
              {items.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No meals available right now. Check back later!</p> : (
                <div className="card-grid" style={{ marginTop: '1.5rem' }}>
                  {items.map(item => (
                    <div key={item._id} className="card glass relative overflow-hidden">
                      {item.imageUrl && (
                        <img
                          src={`http://localhost:5000${item.imageUrl}`}
                          alt={item.title}
                          className="card-img"
                        />
                      )}
                      <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 className="card-title">{item.title}</h3>
                          <span className="badge badge-green">{formatPrice(item.discountedPrice)}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{item.description}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {item.merchant_id?.businessName}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> Collect: {item.collectionTime}</div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ textDecoration: 'line-through' }}>{formatPrice(item.originalPrice)}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Save {(item.originalPrice - item.discountedPrice).toFixed(2)} DT</span>
                          </div>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleReserve(item._id)}>
                          Reserve Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2>My Reservations</h2>
              {orders.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>You haven't reserved any meals yet.</p> : (
                <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginTop: '1rem' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '1rem' }}>Item</th>
                        <th style={{ padding: '1rem' }}>Code</th>
                        <th style={{ padding: '1rem' }}>Total</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem' }}>{order.item_id?.title}</td>
                          <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--secondary)' }}>{order.pickupCode}</td>
                          <td style={{ padding: '1rem' }}>{formatPrice(order.totalPrice)}</td>
                          <td style={{ padding: '1rem' }}><span className="badge badge-orange">{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>My Inventory</h2>
              <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus size={20} style={{ marginRight: '0.5rem' }} /> Add Unsold Item
              </button>
            </div>

            {showAddForm && (
              <div className="glass animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
                <h3>Add New Item</h3>
                <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-input" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input type="text" className="form-input" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original Price (DT)</label>
                    <input type="number" step="0.01" className="form-input" value={newItem.originalPrice} onChange={e => setNewItem({ ...newItem, originalPrice: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discounted Price (DT)</label>
                    <input type="number" step="0.01" className="form-input" value={newItem.discountedPrice} onChange={e => setNewItem({ ...newItem, discountedPrice: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity Available</label>
                    <input type="number" className="form-input" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} required min="1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Collection Window</label>
                    <input type="text" className="form-input" placeholder="e.g. 18:00 - 20:00" value={newItem.collectionTime} onChange={e => setNewItem({ ...newItem, collectionTime: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Item Image (Optional)</label>
                    <input type="file" id="item-image" accept="image/*" className="form-input" style={{ padding: '0.5rem' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Save Item</button>
                </form>
              </div>
            )}

            {items.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>You haven't posted any items yet.</p> : (
              <div className="card-grid">
                {items.map(item => (
                  <div key={item._id} className="card glass">
                    {item.imageUrl && (
                      <img
                        src={`http://localhost:5000${item.imageUrl}`}
                        alt={item.title}
                        className="card-img"
                      />
                    )}
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 className="card-title">{item.title}</h3>
                        <span className={`badge ${item.status === 'available' ? 'badge-green' : 'badge-orange'}`}>{item.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
                        <span>Qty: {item.quantity}</span>
                        <span>{formatPrice(item.discountedPrice)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bot, Cpu, CheckCircle, ShoppingBag, Truck, Clock 
} from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState('storefront');

  // Core Processing Engine States
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Shared Inventory State Matrix
  const [products, setProducts] = useState([
    { id: 'P-101', name: 'Cotton Fabric Blue', price: 120, unit: 'metre', image: '🟦', desc: 'Premium grade breathable weave textile.', stock: 15, threshold: 5 },
    { id: 'P-102', name: 'Silk Fabric Red', price: 350, unit: 'metre', image: '🟥', desc: 'Luxury raw silk thread textile, high sheen.', stock: 3, threshold: 4 },
    { id: 'P-103', name: 'Polyester Blend White', price: 90, unit: 'metre', image: '⬜', desc: 'Durable, wrinkle-resistant commercial utility fabric.', stock: 22, threshold: 5 }
  ]);

  // Storefront & Client Credentials States
  const [selectedMaterial, setSelectedMaterial] = useState('Cotton Fabric Blue');
  const [orderQuantity, setOrderQuantity] = useState(10);
  const [credentials, setCredentials] = useState(null);
  const [customerForm, setCustomerForm] = useState({ 
    name: 'Prathisha Textiles Hub', 
    phone: '+91 98765 43210', 
    email: 'prathisha0910@gmail.com', 
    address: 'Industrial Development Complex, Sector 4, Hub Alpha' 
  });
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  // Tracking States
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [trackedTask, setTrackedTask] = useState(null);
  const [trackingError, setTrackingError] = useState(false);

  // System Summary Metrics
  const [summary, setSummary] = useState({
    total_tasks: 0,
    total_flags: 0,
    tasks_list: []
  });

  const fetchDashboardMetrics = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/dashboard/summary');
      if (response.data) {
        setSummary(response.data);
      }
    } catch (err) {
      console.log("Dashboard metric sync offline.");
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const generateCredentials = () => {
    const token = 'AUTH-IQ-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setCredentials({ token, generatedAt: new Date().toLocaleTimeString() });
  };

  const handleCustomerCheckout = async (e) => {
    e.preventDefault();
    if (!credentials) {
      alert("⚠️ Security Restriction: Please generate your infrastructure access credentials first.");
      return;
    }

    const targetQuantity = Number(orderQuantity) || 10;
    const matchedProduct = products.find(p => p.name === selectedMaterial);
    if (targetQuantity > matchedProduct.stock) {
      alert(`🚨 Shortage Error: Cannot allocate ${targetQuantity}m. Only ${matchedProduct.stock}m remaining.`);
      return;
    }

    setIsProcessing(true);
    setCheckoutSuccess(null);

    const trackingHash = `IQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const simulationMessage = `Order Entry ${trackingHash}. Client: ${customerForm.name}. Auth Token: ${credentials.token}. Allocated Target: ${targetQuantity} metres of ${selectedMaterial}. Destination: ${customerForm.address}`;

    const securePayload = {
      message: simulationMessage,
      name: customerForm.name,
      email: customerForm.email,
      taskId: trackingHash,
      material: selectedMaterial,
      quantity: targetQuantity
    };

    try {
      const response = await axios.post('http://localhost:3001/api/agents/process', securePayload);

      if (response.data && response.data.success) {
        setProducts(prev => prev.map(p => p.name === selectedMaterial ? { ...p, stock: Math.max(0, p.stock - targetQuantity) } : p));
        setCheckoutSuccess(response.data.task);
        setSearchTrackingId(response.data.task.task_id); 
        
        try {
          await fetchDashboardMetrics();
        } catch (dashErr) {
          console.log("Silently bypassed dashboard sync logging.");
        }
      }
    } catch (err) {
      console.error("Pipeline breakdown:", err);
      alert("Connection Error: Check if server.js is running on port 3001.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!searchTrackingId.trim()) return;
    
    setTrackingError(false);
    try {
      const response = await axios.get(`http://localhost:3001/api/tasks/${searchTrackingId.trim()}`);
      if (response.data) {
        setTrackedTask(response.data);
      }
    } catch (err) {
      setTrackedTask(null);
      setTrackingError(true);
    }
  };

  const executeSupplierRestock = (productId) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: p.stock + 50 } : p));
  };

  const getTruckPosition = (task) => {
    if (!task) return '0%';
    const steps = task.audit_log?.timeline?.length || 0;
    if (steps >= 4) return '94%';
    if (steps === 3) return '66%';
    if (steps === 2) return '33%';
    return '0%';
  };

  return (
    <div style={{ backgroundColor: '#0B0F19', color: '#F3F4F6', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* NAVBAR HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', padding: '10px', borderRadius: '8px' }}>
            <Cpu size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>OperateIQ</h1>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Dual-Node Multi-Agent Supply Control Panel</p>
          </div>
        </div>
        
        {/* TAB NAVIGATION HEADER */}
        <div style={{ backgroundColor: '#111827', padding: '4px', borderRadius: '8px', border: '1px solid #1E293B', display: 'flex', gap: '4px' }}>
          <button onClick={() => setViewMode('storefront')} style={{ backgroundColor: viewMode === 'storefront' ? '#2563EB' : 'transparent', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <ShoppingBag size={16} /> Client Storefront
          </button>
          <button onClick={() => setViewMode('tracking')} style={{ backgroundColor: viewMode === 'tracking' ? '#7C3AED' : 'transparent', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Truck size={16} /> Live Tracker
          </button>
          <button onClick={() => setViewMode('business')} style={{ backgroundColor: viewMode === 'business' ? '#1E293B' : 'transparent', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Bot size={16} /> Owner Management
          </button>
        </div>
      </header>

      {/* VIEW: CLIENT PORTAL */}
      {viewMode === 'storefront' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', margin: '0 0 4px 0' }}>B2B Textile Procurement Portal</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>Configure dynamic inventory streams and request delivery authentication keys below.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* ACCESS SECURITY WIDGET CONTAINER */}
              <div style={{ backgroundColor: '#111827', border: '1px dashed #3B82F6', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#3B82F6' }}>🔑 Step 1: Request Environment Access Credentials</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>Acquire a valid cryptographic routing signature parameter to execute the pipeline loop.</p>
                </div>
                {!credentials ? (
                  <button onClick={generateCredentials} style={{ backgroundColor: '#2563EB', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Get Credentials</button>
                ) : (
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', background: '#1E2937', padding: '6px 12px', borderRadius: '4px', border: '1px solid #334155', color: '#10B981' }}>✓ ACTIVE: {credentials.token}</span>
                )}
              </div>

              {/* PRODUCTS DISPLAY MATRIX */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {products.map((mat) => (
                  <div key={mat.id} onClick={() => setSelectedMaterial(mat.name)} style={{ backgroundColor: '#111827', border: selectedMaterial === mat.name ? '2px solid #2563EB' : '1px solid #1E293B', borderRadius: '12px', padding: '16px', cursor: 'pointer', position: 'relative' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{mat.image}</div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFF', margin: '0 0 4px 0' }}>{mat.name}</h3>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 12px 0', lineHeight: '1.3' }}>{mat.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderTop: '1px solid #1F2937', paddingTop: '8px' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>₹{mat.price}/{mat.unit}</span>
                      <span style={{ color: mat.stock <= mat.threshold ? '#F97316' : '#6B7280', fontSize: '11px' }}>Stock: {mat.stock}m</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* LIVE RECEIPT NOTIFICATION BANNER CONTAINER */}
              {checkoutSuccess && (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid #10B981', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '44px', marginBottom: '12px' }}>🚚</div>
                  <h4 style={{ color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 0 8px 0', fontSize: '18px' }}>
                    <CheckCircle size={20} /> Order Ingested Into Core Flow!
                  </h4>
                  <p style={{ fontSize: '14px', color: '#E5E7EB', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    The multi-agent validation loops executed cleanly. Please check your Gmail account at 
                    <strong style={{ color: '#3B82F6' }}> {customerForm.email}</strong> to verify your dynamic invoice statement and live freight tracking details.
                  </p>
                  <div style={{ fontSize: '12px', background: '#0B0F19', padding: '10px', borderRadius: '6px', display: 'inline-block', fontFamily: 'monospace', border: '1px solid #1F2937' }}>
                    TRACKING HASH KEY: <span style={{ color: '#A78BFA', fontWeight: 'bold' }}>{checkoutSuccess.task_id}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* SUBMISSION FORM GRID ELEMENT */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>📦 Secure Checkout Manifest</h3>
              <form onSubmit={handleCustomerCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', textTransform: 'uppercase' }}>Selected Line Item Asset</label>
                  <input type="text" name="material" value={selectedMaterial} readOnly style={{ width: '100%', backgroundColor: '#0B0F19', border: '1px solid #1E293B', borderRadius: '6px', padding: '10px', color: '#3B82F6', fontWeight: '600', boxSizing: 'border-box' }}/>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', textTransform: 'uppercase' }}>Procurement Batch Quantity (Metres)</label>
                  <input type="number" name="quantity" value={orderQuantity} onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 0)} style={{ width: '100%', backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px', padding: '10px', color: '#FFF', boxSizing: 'border-box' }} min="1"/>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', textTransform: 'uppercase' }}>Enterprise Corporate Title</label>
                  <input type="text" name="name" placeholder="Priya Anand" value={customerForm.name} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} style={{ width: '100%', backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px', padding: '10px', color: '#FFF', boxSizing: 'border-box' }} required/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', textTransform: 'uppercase' }}>Mobile Terminal</label>
                    <input type="text" name="phone" placeholder="+91 98765..." value={customerForm.phone} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} style={{ width: '100%', backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px', padding: '10px', color: '#FFF', boxSizing: 'border-box' }} required/>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', textTransform: 'uppercase' }}>Gmail Hub</label>
                    <input type="email" name="email" placeholder="priya@textiles.com" value={customerForm.email} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} style={{ width: '100%', backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px', padding: '10px', color: '#FFF', boxSizing: 'border-box' }} required/>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', textTransform: 'uppercase' }}>Logistic Drop-off Coordinate Address</label>
                  <textarea name="address" placeholder="Enter factory layout destination..." value={customerForm.address} onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})} style={{ width: '100%', height: '54px', backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px', padding: '10px', color: '#FFF', resize:'none', boxSizing: 'border-box' }} required/>
                </div>
                <button type="submit" disabled={isProcessing} style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase', fontSize: '13px', marginTop: '6px' }}>
                  {isProcessing ? 'Transmitting Ingress Frame...' : 'Submit Procurement Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: LIVE TRACKER PROGRESS TERMINAL */}
      {viewMode === 'tracking' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>Real-time Delivery & SLA Tracker</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>Input your alphanumeric verification hash key code to trace the active n8n webhook automation lifecycle.</p>
            
            <form onSubmit={handleTrackSearch} style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '20px auto 0 auto' }}>
              <input 
                type="text" 
                placeholder="Paste Tracking Hash (e.g. IQ-123456)..." 
                value={searchTrackingId}
                onChange={(e) => setSearchTrackingId(e.target.value)}
                style={{ flexGrow: 1, backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px', color: '#FFF', fontSize: '14px' }}
              />
              <button type="submit" style={{ backgroundColor: '#7C3AED', color: '#FFF', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Locate Vehicle</button>
            </form>
            {trackingError && <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px' }}>Tracking signature sequence index matching current matrix parameters not found.</p>}
          </div>

          {trackedTask ? (
            <div style={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1F2937', paddingBottom: '16px', marginBottom: '32px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' }}>TRACK HASH SEGMENT</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7C3AED' }}>#{trackedTask.task_id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' }}>ALLOCATED INFRASTRUCTURE TARGET</span>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFF' }}>{trackedTask.routing?.assigned_to}</div>
                </div>
              </div>

              {/* TRUCK TIMELINE DISPLAY BAR CONTAINER */}
              <div style={{ marginBottom: '44px', padding: '0 20px' }}>
                <div style={{ position: 'relative', height: '6px', backgroundColor: '#1F2937', borderRadius: '4px' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: getTruckPosition(trackedTask), 
                    top: '-15px', 
                    marginLeft: '-14px',
                    transition: 'left 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: '#7C3AED', 
                    padding: '6px', 
                    borderRadius: '50%', 
                    boxShadow: '0 0 14px #7C3AED',
                    zIndex: 10
                  }}>
                    <Truck size={16} color="#FFF" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'absolute', top: '-4px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: trackedTask.audit_log?.timeline?.length >= 2 ? '#7C3AED' : '#374151' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: trackedTask.audit_log?.timeline?.length >= 3 ? '#7C3AED' : '#374151' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: trackedTask.audit_log?.timeline?.length >= 4 ? '#7C3AED' : '#374151' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', marginTop: '14px' }}>
                  <div>1. Webhook Ingested</div>
                  <div>2. Stock Deducted</div>
                  <div>3. API Route Verified</div>
                  <div>4. Gmail Dispatch Active</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#0B0F19', borderRadius: '8px', padding: '16px', border: '1px solid #1F2937' }}>
                <h4 style={{ fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#A78BFA' }}><Clock size={15} /> Audit Timeline Ledger Updates</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid #1F2937', paddingLeft: '14px', marginLeft: '6px' }}>
                  {trackedTask.audit_log?.timeline.map((log, i) => (
                    <div key={i}>
                      <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 'bold' }}>{log.time} - {log.agent}</span>
                      <p style={{ fontSize: '13px', color: '#E5E7EB', marginTop: '2px', margin: 0 }}>{log.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #1E293B', borderRadius: '12px', color: '#6B7280' }}>
              No active tracking array target loaded. Enter your alphanumeric payload hash code above.
            </div>
          )}
        </div>
      )}

      {/* VIEW: OWNER METRICS & INVENTORY MANAGEMENT WIDGET */}
      {viewMode === 'business' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', margin: '0 0 4px 0' }}>Internal Warehouse Telemetry & Audit Console</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>Manage industrial stock boundaries and coordinate automated supply operations.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
            
            {/* WAREHOUSE RUNTIME STOCK CONTROLLERS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', color: '#9CA3AF', textTransform: 'uppercase', margin: 0, fontWeight: '700' }}>Live Inventory Levels</h3>
              
              {products.map(p => {
                const isUnderStocked = p.stock <= p.threshold;
                return (
                  <div key={p.id} style={{ backgroundColor: '#111827', border: isUnderStocked ? '1px solid #EF4444' : '1px solid #1E293B', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#FFF' }}>{p.image} {p.name}</h4>
                        <span style={{ fontSize: '11px', color: '#6B7280' }}>REF-SKU: {p.id}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: isUnderStocked ? '#EF4444' : '#10B981' }}>{p.stock}m</div>
                        <span style={{ fontSize: '11px', color: '#6B7280' }}>Floor Level: {p.threshold}m</span>
                      </div>
                    </div>

                    {isUnderStocked && (
                      <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 'bold' }}>🚨 STOCK SHORTAGE ALERT</span>
                        <button onClick={() => executeSupplierRestock(p.id)} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Restock +50m</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AUTOMATED INFRASTRUCTURE MASTER AUDIT RECORDS LEDGER */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', textTransform: 'uppercase', color: '#3B82F6', marginTop: 0 }}>Master Infrastructure Audit Record Ledger</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E293B', color: '#9CA3AF', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px' }}>Transaction Token ID</th>
                    <th style={{ padding: '8px 4px' }}>Client Node</th>
                    <th style={{ padding: '8px 4px' }}>Asset Profile</th>
                    <th style={{ padding: '8px 4px' }}>Volume</th>
                    <th style={{ padding: '8px 4px' }}>Lifecycle State</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.tasks_list.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>No active business transactions logged to local storage loops.</td>
                    </tr>
                  ) : (
                    summary.tasks_list.map((task) => (
                      <tr key={task.task_id} style={{ borderBottom: '1px solid #1F2937' }}>
                        <td style={{ padding: '10px 4px', color: '#A78BFA', fontWeight: '600' }}>#{task.task_id}</td>
                        <td style={{ padding: '10px 4px' }}>{task.intake?.client_name || 'System Gate'}</td>
                        <td style={{ padding: '10px 4px', color: '#E5E7EB' }}>{task.intake?.allocated_material || 'Generic Entry'}</td>
                        <td style={{ padding: '10px 4px' }}>{task.intake?.volume_metres || '0'}m</td>
                        <td style={{ padding: '10px 4px' }}><span style={{ backgroundColor: '#2563EB', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: '700' }}>{task.status.toUpperCase()}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
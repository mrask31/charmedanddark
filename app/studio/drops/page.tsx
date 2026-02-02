'use client';

import { useState, useEffect } from 'react';

type DropStatus = 'draft' | 'ready' | 'archived';

interface Drop {
  id: string;
  name: string;
  description: string;
  status: DropStatus;
  product_ids: string[];
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  price: string | number;
  fulfillment_type: string;
  status: string;
  locked_narrative_id?: string;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Drop>>({
    name: '',
    description: '',
    status: 'draft',
    product_ids: [],
  });

  // Load drops and products from localStorage on mount
  useEffect(() => {
    const savedDrops = localStorage.getItem('drops_catalog');
    if (savedDrops) {
      try {
        setDrops(JSON.parse(savedDrops));
      } catch (err) {
        console.error('Failed to load drops:', err);
      }
    }

    const savedProducts = localStorage.getItem('product_catalog');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
  }, []);

  // Save drops to localStorage whenever they change
  useEffect(() => {
    if (drops.length > 0) {
      localStorage.setItem('drops_catalog', JSON.stringify(drops));
    }
  }, [drops]);

  const handleInputChange = (field: keyof Drop, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateNew = () => {
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      product_ids: [],
    });
    setEditingDrop(null);
    setViewMode('create');
  };

  const handleEdit = (drop: Drop) => {
    setFormData(drop);
    setEditingDrop(drop);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingDrop(null);
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      product_ids: [],
    });
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name?.trim()) {
      alert('Drop name is required');
      return;
    }

    const now = new Date().toISOString();

    if (editingDrop) {
      // Update existing drop
      const updatedDrop: Drop = {
        ...editingDrop,
        name: formData.name!.trim(),
        description: formData.description?.trim() || '',
        status: formData.status!,
        product_ids: formData.product_ids || [],
      };

      setDrops(prev => prev.map(d => d.id === editingDrop.id ? updatedDrop : d));
      setCopyFeedback('Drop updated');
    } else {
      // Create new drop
      const newDrop: Drop = {
        id: `drop_${Date.now()}`,
        name: formData.name!.trim(),
        description: formData.description?.trim() || '',
        status: formData.status!,
        product_ids: formData.product_ids || [],
        created_at: now,
      };

      setDrops(prev => [...prev, newDrop]);
      setCopyFeedback('Drop created');
    }

    setTimeout(() => setCopyFeedback(null), 2000);
    setViewMode('list');
    setEditingDrop(null);
  };

  const toggleProductSelection = (productId: string) => {
    const currentProductIds = formData.product_ids || [];
    
    if (currentProductIds.includes(productId)) {
      // Remove product
      handleInputChange('product_ids', currentProductIds.filter(id => id !== productId));
    } else {
      // Check if product is already in another drop
      const productInOtherDrop = drops.find(drop => 
        drop.id !== editingDrop?.id && drop.product_ids.includes(productId)
      );

      if (productInOtherDrop) {
        alert(`This product is already in drop "${productInOtherDrop.name}". Products can only belong to one drop.`);
        return;
      }

      // Add product
      handleInputChange('product_ids', [...currentProductIds, productId]);
    }
  };

  const getProductsInDrop = (dropId: string): Product[] => {
    const drop = drops.find(d => d.id === dropId);
    if (!drop) return [];
    
    return products.filter(p => drop.product_ids.includes(p.id));
  };

  const getAvailableProducts = (): Product[] => {
    // Get all product IDs that are in other drops (excluding current editing drop)
    const usedProductIds = drops
      .filter(drop => drop.id !== editingDrop?.id)
      .flatMap(drop => drop.product_ids);

    // Return products that are not in any other drop
    return products.filter(p => !usedProductIds.includes(p.id));
  };

  const getStatusBadgeStyle = (status: DropStatus) => {
    switch (status) {
      case 'ready':
        return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
      case 'archived':
        return { backgroundColor: '#f5f5f5', color: '#666' };
      default: // draft
        return { backgroundColor: '#fff3e0', color: '#e65100' };
    }
  };

  const getStatusLabel = (status: DropStatus) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'archived':
        return 'Archived';
      default:
        return 'Draft';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '400', marginBottom: '12px', color: '#0A0A0A' }}>
              Drops & Collections
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Group products under shared narrative contexts.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {viewMode !== 'list' && (
              <button
                onClick={handleCancel}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#0A0A0A',
                  border: '1px solid #0A0A0A',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                ← Back to List
              </button>
            )}
            {viewMode === 'list' && (
              <button
                onClick={handleCreateNew}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0A0A0A',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Create Drop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {copyFeedback && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0f0f0',
          marginBottom: '24px',
          fontSize: '14px',
        }}>
          {copyFeedback}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div>
          {drops.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              border: '1px solid #ddd',
              backgroundColor: '#fafafa',
            }}>
              <p style={{ color: '#666', fontSize: '16px', marginBottom: '24px' }}>
                No drops yet. Create your first drop to group products under a shared narrative.
              </p>
              <button
                onClick={handleCreateNew}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0A0A0A',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Create Drop
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {drops.map((drop) => {
                const dropProducts = getProductsInDrop(drop.id);
                return (
                  <div
                    key={drop.id}
                    style={{
                      border: '1px solid #ddd',
                      padding: '24px',
                      backgroundColor: 'white',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '8px', color: '#0A0A0A' }}>
                          {drop.name}
                        </h3>
                        {drop.description && (
                          <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                            {drop.description}
                          </p>
                        )}
                        <div style={{ fontSize: '14px', color: '#666', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              fontSize: '12px',
                              borderRadius: '2px',
                              ...getStatusBadgeStyle(drop.status),
                            }}
                          >
                            {getStatusLabel(drop.status)}
                          </span>
                          <span>{dropProducts.length} {dropProducts.length === 1 ? 'product' : 'products'}</span>
                          <span>Created: {new Date(drop.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit(drop)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'white',
                          color: '#0A0A0A',
                          border: '1px solid #0A0A0A',
                          fontSize: '14px',
                          cursor: 'pointer',
                          marginLeft: '16px',
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '24px' }}>
            {viewMode === 'create' ? 'Create Drop' : 'Edit Drop'}
          </h2>

          <div style={{ display: 'grid', gap: '24px', marginBottom: '24px' }}>
            {/* Drop Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                Drop Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Lunar Devotion Collection"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Short editorial description of this drop..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as DropStatus)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                }}
              >
                <option value="draft">Draft</option>
                <option value="ready">Ready</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Product Selection */}
            <div style={{ paddingTop: '24px', borderTop: '1px solid #ddd' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '16px', color: '#0A0A0A' }}>
                Linked Products
              </h3>
              
              {products.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#666' }}>
                  No products available. Create products in the Product Catalog first.
                </p>
              ) : (
                <>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                    Select products to include in this drop. Products can only belong to one drop at a time.
                  </p>
                  
                  <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto', padding: '4px' }}>
                    {getAvailableProducts().map((product) => {
                      const isSelected = (formData.product_ids || []).includes(product.id);
                      return (
                        <div
                          key={product.id}
                          onClick={() => toggleProductSelection(product.id)}
                          style={{
                            border: isSelected ? '2px solid #0A0A0A' : '1px solid #ddd',
                            padding: '16px',
                            backgroundColor: isSelected ? '#f9f9f9' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = '#fafafa';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'white';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by div onClick
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '16px', fontWeight: '400', color: '#0A0A0A', marginBottom: '4px' }}>
                                {product.name}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                {product.sku && `SKU: ${product.sku} • `}
                                {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price}
                                {' • '}
                                {product.fulfillment_type}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Products Summary */}
                  {formData.product_ids && formData.product_ids.length > 0 && (
                    <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f0f0', border: '1px solid #ddd' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#0A0A0A', marginBottom: '8px' }}>
                        Selected: {formData.product_ids.length} {formData.product_ids.length === 1 ? 'product' : 'products'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {formData.product_ids.map(id => {
                          const product = products.find(p => p.id === id);
                          return product?.name;
                        }).join(', ')}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #ddd' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0A0A0A',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {viewMode === 'create' ? 'Create Drop' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#0A0A0A',
                border: '1px solid #0A0A0A',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

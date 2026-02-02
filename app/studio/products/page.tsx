'use client';

import { useState, useEffect } from 'react';

type FulfillmentType = 'printify' | 'in_house';
type ProductStatus = 'draft' | 'ready_to_publish';

interface Product {
  id: string;
  name: string;
  sku?: string;
  price: string | number;
  fulfillment_type: FulfillmentType;
  status: ProductStatus;
  primary_image_url?: string;
  gallery_image_urls?: string[];
  locked_narrative_id?: string;
  // Printify-specific fields
  printify_sku?: string;
  printify_variant_notes?: string;
  // In-house specific fields
  inventory_count?: number;
  shipping_weight_oz?: number;
  is_final?: boolean;
  created_at: string;
  updated_at: string;
}

interface NarrativeBundle {
  short_description: string;
  long_ritual_description: string;
  ritual_intention_prompt: string;
  care_use_note: string;
  alt_text: string;
  one_line_drop_tagline: string;
}

interface SavedNarrative {
  id: string;
  product_name: string;
  narrative_bundle: NarrativeBundle;
  locked_at: string;
  version: string;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [savedNarratives, setSavedNarratives] = useState<SavedNarrative[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    price: '',
    fulfillment_type: 'printify',
    status: 'draft',
    primary_image_url: '',
    gallery_image_urls: [],
    locked_narrative_id: undefined,
    printify_sku: '',
    printify_variant_notes: '',
    inventory_count: undefined,
    shipping_weight_oz: undefined,
    is_final: false,
  });
  const [galleryUrlsText, setGalleryUrlsText] = useState('');

  // Load products from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('product_catalog');
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load product catalog:', err);
      }
    }
  }, []);

  // Load saved narratives from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saved_narratives');
    if (saved) {
      try {
        setSavedNarratives(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load saved narratives:', err);
      }
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('product_catalog', JSON.stringify(products));
    }
  }, [products]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateNew = () => {
    setFormData({
      name: '',
      sku: '',
      price: '',
      fulfillment_type: 'printify',
      status: 'draft',
      primary_image_url: '',
      gallery_image_urls: [],
      locked_narrative_id: undefined,
      printify_sku: '',
      printify_variant_notes: '',
      inventory_count: undefined,
      shipping_weight_oz: undefined,
      is_final: false,
    });
    setGalleryUrlsText('');
    setEditingProduct(null);
    setViewMode('create');
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setGalleryUrlsText(product.gallery_image_urls?.join('\n') || '');
    setEditingProduct(product);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      price: '',
      fulfillment_type: 'printify',
      status: 'draft',
      primary_image_url: '',
      gallery_image_urls: [],
      locked_narrative_id: undefined,
      printify_sku: '',
      printify_variant_notes: '',
      inventory_count: undefined,
      shipping_weight_oz: undefined,
      is_final: false,
    });
    setGalleryUrlsText('');
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name?.trim()) {
      alert('Product name is required');
      return;
    }
    if (!formData.price) {
      alert('Price is required');
      return;
    }

    // Parse gallery URLs
    const galleryUrls = galleryUrlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const now = new Date().toISOString();

    if (editingProduct) {
      // Update existing product
      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name!.trim(),
        sku: formData.sku?.trim() || undefined,
        price: formData.price!,
        fulfillment_type: formData.fulfillment_type!,
        status: formData.status!,
        primary_image_url: formData.primary_image_url?.trim() || undefined,
        gallery_image_urls: galleryUrls.length > 0 ? galleryUrls : undefined,
        locked_narrative_id: formData.locked_narrative_id || undefined,
        printify_sku: formData.printify_sku?.trim() || undefined,
        printify_variant_notes: formData.printify_variant_notes?.trim() || undefined,
        inventory_count: formData.inventory_count || undefined,
        shipping_weight_oz: formData.shipping_weight_oz || undefined,
        is_final: formData.is_final || false,
        updated_at: now,
      };

      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      setCopyFeedback('Product updated');
    } else {
      // Create new product
      const newProduct: Product = {
        id: `product_${Date.now()}`,
        name: formData.name!.trim(),
        sku: formData.sku?.trim() || undefined,
        price: formData.price!,
        fulfillment_type: formData.fulfillment_type!,
        status: formData.status!,
        primary_image_url: formData.primary_image_url?.trim() || undefined,
        gallery_image_urls: galleryUrls.length > 0 ? galleryUrls : undefined,
        locked_narrative_id: formData.locked_narrative_id || undefined,
        printify_sku: formData.printify_sku?.trim() || undefined,
        printify_variant_notes: formData.printify_variant_notes?.trim() || undefined,
        inventory_count: formData.inventory_count || undefined,
        shipping_weight_oz: formData.shipping_weight_oz || undefined,
        is_final: formData.is_final || false,
        created_at: now,
        updated_at: now,
      };

      setProducts(prev => [...prev, newProduct]);
      setCopyFeedback('Product created');
    }

    setTimeout(() => setCopyFeedback(null), 2000);
    setViewMode('list');
    setEditingProduct(null);
  };

  const canMarkReadyToPublish = () => {
    const baseRequirements = !!(
      formData.name?.trim() &&
      formData.price &&
      formData.fulfillment_type &&
      formData.locked_narrative_id
    );

    if (!baseRequirements) return false;

    // Fulfillment-specific requirements
    if (formData.fulfillment_type === 'printify') {
      return !!formData.printify_sku?.trim();
    } else if (formData.fulfillment_type === 'in_house') {
      return formData.inventory_count !== undefined && formData.inventory_count !== null;
    }

    return true;
  };

  const handleMarkReadyToPublish = () => {
    const missing: string[] = [];
    
    // Base requirements
    if (!formData.name?.trim()) missing.push('Product name');
    if (!formData.price) missing.push('Price');
    if (!formData.fulfillment_type) missing.push('Fulfillment type');
    if (!formData.locked_narrative_id) missing.push('Linked narrative');

    // Fulfillment-specific requirements
    if (formData.fulfillment_type === 'printify' && !formData.printify_sku?.trim()) {
      missing.push('Printify SKU (required for Printify fulfillment)');
    }
    if (formData.fulfillment_type === 'in_house' && (formData.inventory_count === undefined || formData.inventory_count === null)) {
      missing.push('Inventory count (required for in-house fulfillment)');
    }

    if (missing.length > 0) {
      alert(`Cannot mark as ready to publish. Missing required fields:\n${missing.join('\n')}`);
      return;
    }

    handleInputChange('status', 'ready_to_publish');
    setCopyFeedback('Status updated to Ready to Publish');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const canMarkFinal = () => {
    return !!(
      formData.status === 'ready_to_publish' &&
      formData.locked_narrative_id &&
      !formData.is_final
    );
  };

  const handleMarkFinal = () => {
    if (!canMarkFinal()) return;

    const confirmed = window.confirm(
      'Mark this product as Final?\n\n' +
      'Once marked final, most product fields will become read-only. ' +
      'This action cannot be undone in the MVP. ' +
      'Only image URLs can be updated after finalization.\n\n' +
      'Are you sure you want to proceed?'
    );

    if (confirmed) {
      handleInputChange('is_final', true);
      setCopyFeedback('Product marked as Final');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const canExportPublishPack = () => {
    return !!(
      formData.locked_narrative_id &&
      formData.status === 'ready_to_publish'
    );
  };

  const exportPublishPackMarkdown = () => {
    if (!canExportPublishPack()) return;

    const linkedNarrative = savedNarratives.find(n => n.id === formData.locked_narrative_id);
    if (!linkedNarrative) return;

    const markdown = `# ${formData.name}

## Product Details

**SKU:** ${formData.sku || 'N/A'}
**Price:** ${typeof formData.price === 'number' ? `$${formData.price.toFixed(2)}` : formData.price}
**Fulfillment:** ${formData.fulfillment_type}

## Short Description

${linkedNarrative.narrative_bundle.short_description}

## Long Ritual Description

${linkedNarrative.narrative_bundle.long_ritual_description}

## Ritual Prompt

${linkedNarrative.narrative_bundle.ritual_intention_prompt}

## Care & Use Note

${linkedNarrative.narrative_bundle.care_use_note}

## Alt Text

${linkedNarrative.narrative_bundle.alt_text}

## Tagline

${linkedNarrative.narrative_bundle.one_line_drop_tagline || '(none)'}

## Images

**Primary Image:** ${formData.primary_image_url || 'N/A'}

**Gallery Images:**
${formData.gallery_image_urls && formData.gallery_image_urls.length > 0 
  ? formData.gallery_image_urls.map((url, i) => `${i + 1}. ${url}`).join('\n')
  : 'N/A'}`;

    copyToClipboard(markdown, 'Publish Pack (Markdown)');
  };

  const exportPublishPackJSON = () => {
    if (!canExportPublishPack()) return;

    const linkedNarrative = savedNarratives.find(n => n.id === formData.locked_narrative_id);
    if (!linkedNarrative) return;

    const publishPack = {
      product: {
        name: formData.name,
        sku: formData.sku || null,
        price: formData.price,
        fulfillment_type: formData.fulfillment_type,
      },
      narrative: {
        short_description: linkedNarrative.narrative_bundle.short_description,
        long_ritual_description: linkedNarrative.narrative_bundle.long_ritual_description,
        ritual_prompt: linkedNarrative.narrative_bundle.ritual_intention_prompt,
        care_use_note: linkedNarrative.narrative_bundle.care_use_note,
        alt_text: linkedNarrative.narrative_bundle.alt_text,
        tagline: linkedNarrative.narrative_bundle.one_line_drop_tagline || null,
      },
      images: {
        primary: formData.primary_image_url || null,
        gallery: formData.gallery_image_urls || [],
      },
    };

    copyToClipboard(JSON.stringify(publishPack, null, 2), 'Publish Pack (JSON)');
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`Copied: ${label}`);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      setCopyFeedback('Copy failed');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '400', marginBottom: '12px', color: '#0A0A0A' }}>
              Product Catalog
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Internal tool for managing product records.
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
                Create Product
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
          {products.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              border: '1px solid #ddd',
              backgroundColor: '#fafafa',
            }}>
              <p style={{ color: '#666', fontSize: '16px', marginBottom: '24px' }}>
                No products yet. Create your first product to get started.
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
                Create Product
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    border: '1px solid #ddd',
                    padding: '24px',
                    backgroundColor: 'white',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: '24px',
                    alignItems: 'center',
                  }}
                >
                  {/* Primary Image */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {product.primary_image_url ? (
                      <img
                        src={product.primary_image_url}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#999' }}>No image</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '8px', color: '#0A0A0A' }}>
                      {product.name}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {product.sku && <span>SKU: {product.sku}</span>}
                      <span>Price: {typeof product.price === 'number' ? `${product.price.toFixed(2)}` : product.price}</span>
                      <span>Fulfillment: {product.fulfillment_type}</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: product.status === 'ready_to_publish' ? '#e8f5e9' : '#fff3e0',
                          color: product.status === 'ready_to_publish' ? '#2e7d32' : '#e65100',
                          fontSize: '12px',
                          borderRadius: '2px',
                        }}
                      >
                        {product.status === 'ready_to_publish' ? 'Ready to Publish' : 'Draft'}
                      </span>
                      {product.is_final && (
                        <span
                          style={{
                            padding: '2px 8px',
                            backgroundColor: '#f3e5f5',
                            color: '#6a1b9a',
                            fontSize: '12px',
                            borderRadius: '2px',
                            fontWeight: '500',
                          }}
                        >
                          Final
                        </span>
                      )}
                      {product.locked_narrative_id && (
                        <span
                          style={{
                            padding: '2px 8px',
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            fontSize: '12px',
                            borderRadius: '2px',
                          }}
                        >
                          Narrative Linked
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                      Created: {new Date(product.created_at).toLocaleDateString()}
                      {' • '}
                      Updated: {new Date(product.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleEdit(product)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      color: '#0A0A0A',
                      border: '1px solid #0A0A0A',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '24px' }}>
            {viewMode === 'create' ? 'Create Product' : 'Edit Product'}
          </h2>

          {/* Final Product Notice */}
          {formData.is_final && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f3e5f5',
              border: '1px solid #6a1b9a',
              marginBottom: '24px',
            }}>
              <p style={{ fontSize: '14px', color: '#6a1b9a', margin: '0' }}>
                <strong>Final Product:</strong> This product has been marked as final. Most fields are now read-only. Only image URLs can be updated.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Product Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={formData.is_final}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                  cursor: formData.is_final ? 'not-allowed' : 'text',
                }}
              />
            </div>

            {/* SKU */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                SKU (optional but recommended)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="e.g., MOON-RING-001"
                disabled={formData.is_final}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                  cursor: formData.is_final ? 'not-allowed' : 'text',
                }}
              />
            </div>

            {/* Price */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                Price *
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g., 49.99 or $49.99"
                disabled={formData.is_final}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                  cursor: formData.is_final ? 'not-allowed' : 'text',
                }}
              />
            </div>

            {/* Fulfillment Type */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                Fulfillment Type *
              </label>
              <select
                value={formData.fulfillment_type}
                onChange={(e) => handleInputChange('fulfillment_type', e.target.value as FulfillmentType)}
                disabled={formData.is_final}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                  cursor: formData.is_final ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="printify">Printify</option>
                <option value="in_house">In-House</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as ProductStatus)}
                disabled={formData.is_final}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                  cursor: formData.is_final ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="draft">Draft</option>
                <option value="ready_to_publish">Ready to Publish</option>
              </select>
            </div>

            {/* Fulfillment-Specific Fields */}
            {formData.fulfillment_type === 'printify' && (
              <>
                {/* Printify SKU */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                    Printify SKU {formData.status === 'draft' ? '(optional)' : '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.printify_sku}
                    onChange={(e) => handleInputChange('printify_sku', e.target.value)}
                    placeholder="e.g., PRINT-MOON-RING-001"
                    disabled={formData.is_final}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                      cursor: formData.is_final ? 'not-allowed' : 'text',
                    }}
                  />
                  {formData.status === 'ready_to_publish' && !formData.printify_sku?.trim() && (
                    <p style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px' }}>
                      Required for ready to publish
                    </p>
                  )}
                </div>

                {/* Printify Variant Notes */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                    Printify Variant Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.printify_variant_notes}
                    onChange={(e) => handleInputChange('printify_variant_notes', e.target.value)}
                    placeholder="e.g., Size: M, Color: Silver"
                    disabled={formData.is_final}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                      cursor: formData.is_final ? 'not-allowed' : 'text',
                    }}
                  />
                </div>
              </>
            )}

            {formData.fulfillment_type === 'in_house' && (
              <>
                {/* Inventory Count */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                    Inventory Count {formData.status === 'draft' ? '(optional)' : '*'}
                  </label>
                  <input
                    type="number"
                    value={formData.inventory_count ?? ''}
                    onChange={(e) => handleInputChange('inventory_count', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 50"
                    min="0"
                    disabled={formData.is_final}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                      cursor: formData.is_final ? 'not-allowed' : 'text',
                    }}
                  />
                  {formData.status === 'ready_to_publish' && (formData.inventory_count === undefined || formData.inventory_count === null) && (
                    <p style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px' }}>
                      Required for ready to publish
                    </p>
                  )}
                </div>

                {/* Shipping Weight */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                    Shipping Weight (oz, optional)
                  </label>
                  <input
                    type="number"
                    value={formData.shipping_weight_oz ?? ''}
                    onChange={(e) => handleInputChange('shipping_weight_oz', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="e.g., 2.5"
                    min="0"
                    step="0.1"
                    disabled={formData.is_final}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                      cursor: formData.is_final ? 'not-allowed' : 'text',
                    }}
                  />
                </div>
              </>
            )}

            {/* Primary Image URL */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                Primary Image URL (optional)
              </label>
              <input
                type="text"
                value={formData.primary_image_url}
                onChange={(e) => handleInputChange('primary_image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                }}
              />
            </div>

            {/* Gallery Image URLs */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                Gallery Image URLs (optional, one per line)
              </label>
              <textarea
                value={galleryUrlsText}
                onChange={(e) => setGalleryUrlsText(e.target.value)}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Linked Narrative Section */}
            <div style={{ gridColumn: '1 / -1', paddingTop: '24px', borderTop: '1px solid #ddd' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '16px', color: '#0A0A0A' }}>
                Linked Narrative
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
                  Select Locked Narrative (optional)
                </label>
                <select
                  value={formData.locked_narrative_id || ''}
                  onChange={(e) => handleInputChange('locked_narrative_id', e.target.value || undefined)}
                  disabled={formData.is_final}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    backgroundColor: formData.is_final ? '#f5f5f5' : 'white',
                    cursor: formData.is_final ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="">None</option>
                  {savedNarratives.map((narrative) => (
                    <option key={narrative.id} value={narrative.id}>
                      {narrative.product_name} (locked {new Date(narrative.locked_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {savedNarratives.length === 0 && (
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    No locked narratives available. Create and lock a narrative in the Narrative Studio first.
                  </p>
                )}
              </div>

              {/* Narrative Preview */}
              {formData.locked_narrative_id && (() => {
                const linkedNarrative = savedNarratives.find(n => n.id === formData.locked_narrative_id);
                if (!linkedNarrative) return null;
                
                return (
                  <div style={{
                    border: '1px solid #ddd',
                    padding: '24px',
                    backgroundColor: '#f9f9f9',
                    marginTop: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '400', color: '#0A0A0A' }}>
                        Narrative Preview: {linkedNarrative.product_name}
                      </h4>
                      <a
                        href="/studio/narrative"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'white',
                          color: '#0A0A0A',
                          border: '1px solid #0A0A0A',
                          fontSize: '14px',
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        Open Narrative →
                      </a>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                      <NarrativePreviewSection
                        title="Short Description"
                        content={linkedNarrative.narrative_bundle.short_description}
                      />
                      <NarrativePreviewSection
                        title="Long Ritual Description"
                        content={linkedNarrative.narrative_bundle.long_ritual_description}
                      />
                      <NarrativePreviewSection
                        title="Ritual Intention Prompt"
                        content={linkedNarrative.narrative_bundle.ritual_intention_prompt}
                      />
                      <NarrativePreviewSection
                        title="Care & Use Note"
                        content={linkedNarrative.narrative_bundle.care_use_note}
                      />
                      <NarrativePreviewSection
                        title="Alt Text"
                        content={linkedNarrative.narrative_bundle.alt_text}
                      />
                      <NarrativePreviewSection
                        title="One-Line Drop Tagline"
                        content={linkedNarrative.narrative_bundle.one_line_drop_tagline || '(none)'}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ paddingTop: '24px', borderTop: '1px solid #ddd' }}>
            {/* Mark Ready to Publish Section */}
            {formData.status === 'draft' && (
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={handleMarkReadyToPublish}
                  disabled={!canMarkReadyToPublish()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: canMarkReadyToPublish() ? '#2e7d32' : '#ccc',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    cursor: canMarkReadyToPublish() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Mark Ready to Publish
                </button>
                {!canMarkReadyToPublish() && (
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    Required: Product name, price, fulfillment type, linked narrative
                    {formData.fulfillment_type === 'printify' && ', and Printify SKU'}
                    {formData.fulfillment_type === 'in_house' && ', and inventory count'}
                  </p>
                )}
              </div>
            )}

            {/* Mark Final Section */}
            {!formData.is_final && formData.status === 'ready_to_publish' && (
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={handleMarkFinal}
                  disabled={!canMarkFinal()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: canMarkFinal() ? '#6a1b9a' : '#ccc',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    cursor: canMarkFinal() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Mark Final
                </button>
                {!canMarkFinal() && (
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    Product must be ready to publish with a linked narrative to mark as final.
                  </p>
                )}
              </div>
            )}

            {/* Publish Pack Export Section */}
            {canExportPublishPack() && (
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#e8f5e9', border: '1px solid #2e7d32' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '400', marginBottom: '12px', color: '#0A0A0A' }}>
                  Export Publish Pack
                </h4>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  Product is ready to publish. Export complete product page content.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={exportPublishPackMarkdown}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      color: '#0A0A0A',
                      border: '1px solid #0A0A0A',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Copy Markdown
                  </button>
                  <button
                    onClick={exportPublishPackJSON}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      color: '#0A0A0A',
                      border: '1px solid #0A0A0A',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Copy JSON
                  </button>
                </div>
              </div>
            )}

            {/* Save/Cancel Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
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
                {viewMode === 'create' ? 'Create Product' : 'Save Changes'}
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
        </div>
      )}
    </div>
  );
}

function NarrativePreviewSection({ title, content }: { title: string; content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > 150;
  const displayContent = shouldTruncate && !isExpanded ? content.slice(0, 150) + '...' : content;

  return (
    <div style={{
      padding: '12px',
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
    }}>
      <h5 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#0A0A0A' }}>
        {title}
      </h5>
      <p style={{
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#555',
        whiteSpace: 'pre-wrap',
        marginBottom: shouldTruncate ? '8px' : '0',
      }}>
        {displayContent}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            fontSize: '12px',
            color: '#0A0A0A',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '0',
          }}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

import { Order } from '@/lib/supabase/server';

/**
 * Full order confirmation display
 * Visual-system aesthetic: black background, muted gold emphasis, generous spacing
 */
export default function ConfirmationView({ order }: { order: Order }) {
  return (
    <div style={styles.container}>
      {/* Confirmation message */}
      <h1 style={styles.message}>Your acquisition is complete</h1>

      {/* Order number with muted gold emphasis */}
      <p style={styles.orderNumber}>{order.order_number}</p>

      {/* Order summary */}
      <div style={styles.summary}>
        <h2 style={styles.summaryHeading}>Order Summary</h2>

        {/* Line items */}
        <div style={styles.lineItems}>
          {order.line_items.map((item, index) => (
            <div key={index} style={styles.lineItem}>
              <div style={styles.itemDetails}>
                <p style={styles.itemTitle}>{item.title}</p>
                {item.variant_title && (
                  <p style={styles.itemVariant}>{item.variant_title}</p>
                )}
                <p style={styles.itemQuantity}>Quantity: {item.quantity}</p>
              </div>
              <p style={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={styles.totals}>
          <div style={styles.totalRow}>
            <span>Subtotal</span>
            <span>${order.total_price.toFixed(2)}</span>
          </div>
          <div style={{ ...styles.totalRow, ...styles.totalRowFinal }}>
            <span>Total</span>
            <span style={styles.totalAmount}>
              ${order.total_price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Return link */}
      <a href="/threshold" style={styles.returnLink}>
        ← Return to threshold
      </a>
    </div>
  );
}

// Visual-system styling
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '96px 24px',
    backgroundColor: '#0A0A0A',
    minHeight: '100vh',
    color: '#E5E5E5',
  },
  message: {
    fontSize: '24px',
    fontWeight: 400,
    marginBottom: '24px',
    color: '#E5E5E5',
  },
  orderNumber: {
    fontSize: '20px',
    color: '#8B7355', // Muted gold emphasis
    marginBottom: '72px',
  },
  summary: {
    marginBottom: '72px',
  },
  summaryHeading: {
    fontSize: '20px',
    fontWeight: 400,
    marginBottom: '24px',
    color: '#E5E5E5',
  },
  lineItems: {
    marginBottom: '24px',
  },
  lineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '18px',
    paddingBottom: '18px',
    borderBottom: '1px solid #1A1A1A',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '16px',
    marginBottom: '4px',
    color: '#E5E5E5',
  },
  itemVariant: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  itemQuantity: {
    fontSize: '14px',
    color: '#666',
  },
  itemPrice: {
    fontSize: '16px',
    color: '#E5E5E5',
  },
  totals: {
    borderTop: '1px solid #1A1A1A',
    paddingTop: '18px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    marginBottom: '12px',
    color: '#E5E5E5',
  },
  totalRowFinal: {
    marginTop: '18px',
    paddingTop: '18px',
    borderTop: '1px solid #1A1A1A',
  },
  totalAmount: {
    color: '#8B7355', // Muted gold emphasis
    fontSize: '20px',
  },
  returnLink: {
    display: 'inline-block',
    fontSize: '16px',
    color: '#8B7355', // Muted gold
    textDecoration: 'none',
    transition: 'color 150ms ease',
  },
};

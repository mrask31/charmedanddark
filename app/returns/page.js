export default function ReturnsPage() {
  const sectionStyle = { marginBottom: '2.5rem' };
  const h2Style = {
    fontFamily: 'Cormorant Garamond, Georgia, serif',
    fontSize: '1.5rem',
    color: '#e8e4dc',
    fontWeight: 400,
    marginBottom: '0.75rem',
  };
  const pStyle = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem',
    color: 'rgba(232,228,220,0.6)',
    lineHeight: 1.8,
    marginBottom: '0.5rem',
  };
  const liStyle = {
    ...pStyle,
    paddingLeft: '0.5rem',
  };

  return (
    <main style={{ backgroundColor: '#08080f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 120px' }}>
        <p style={{ color: '#c9a96e', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Policy
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#e8e4dc', fontWeight: 400, marginBottom: '0.5rem' }}>
          Returns & Exchanges
        </h1>
        <p style={{ ...pStyle, marginBottom: '2.5rem' }}>Last updated: May 1, 2026</p>

        <p style={pStyle}>
          Charmed & Dark accepts returns and exchanges for eligible items within 30 days of delivery.
        </p>

        <div style={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.15)', margin: '2rem 0' }} />

        <div style={sectionStyle}>
          <h2 style={h2Style}>Return Window</h2>
          <p style={pStyle}>You may request a return or exchange within 30 days of receiving your order.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>Eligible Items</h2>
          <p style={pStyle}>To be eligible for a return, items must be new, unused, unworn, unwashed, and in their original condition. Items should be returned with any original packaging when possible.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>Non-Defective Returns</h2>
          <p style={pStyle}>We accept returns for non-defective items, including fit, style, or change-of-mind returns, as long as the item meets the eligibility requirements above.</p>
          <p style={pStyle}>Customers are responsible for return shipping costs for non-defective returns.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>Damaged, Defective, or Incorrect Items</h2>
          <p style={pStyle}>If your item arrives damaged, defective, misprinted, or incorrect, please contact us within 7 days of delivery with your order number and photos of the issue.</p>
          <p style={pStyle}>For approved damaged, defective, or incorrect item claims, Charmed & Dark will provide a replacement, refund, or other appropriate resolution.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>Exchanges</h2>
          <p style={pStyle}>We accept exchanges for eligible items within 30 days of delivery. Exchanges are subject to product availability.</p>
          <p style={pStyle}>If the requested replacement item is unavailable, we may offer a refund or store credit.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>How to Start a Return or Exchange</h2>
          <p style={pStyle}>To start a return or exchange, email us at:</p>
          <p style={{ ...pStyle, color: '#c9a96e' }}>
            <a href="mailto:info@charmedanddark.com" style={{ color: '#c9a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              info@charmedanddark.com
            </a>
          </p>
          <p style={pStyle}>Please include:</p>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '0.5rem' }}>
            <li style={liStyle}>Your order number</li>
            <li style={liStyle}>The email address used to place the order</li>
            <li style={liStyle}>The item you want to return or exchange</li>
            <li style={liStyle}>The reason for the return or exchange</li>
            <li style={liStyle}>Photos if the item is damaged, defective, misprinted, or incorrect</li>
          </ul>
          <p style={pStyle}>We will reply with next steps and return instructions.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>Return Shipping</h2>
          <p style={pStyle}>Returns are handled by mail.</p>
          <p style={pStyle}>For non-defective returns, customers are responsible for return shipping costs.</p>
          <p style={pStyle}>For approved damaged, defective, misprinted, or incorrect items, Charmed & Dark will provide a replacement, refund, or other appropriate resolution.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>Refunds</h2>
          <p style={pStyle}>Once your return is received and inspected, we will notify you whether the refund has been approved.</p>
          <p style={pStyle}>Approved refunds are processed back to the original payment method within 7 business days after the returned item is received and inspected.</p>
          <p style={pStyle}>Your bank or credit card provider may take additional time to post the refund.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>Final Sale Items</h2>
          <p style={pStyle}>Items clearly marked as final sale are not eligible for return or exchange unless they arrive damaged, defective, misprinted, or incorrect.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>Questions</h2>
          <p style={pStyle}>For return or exchange questions, contact us at:</p>
          <p style={{ ...pStyle, color: '#c9a96e' }}>
            <a href="mailto:info@charmedanddark.com" style={{ color: '#c9a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              info@charmedanddark.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

import React from 'react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'var(--coklat-pale)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: '#fdeaea',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              marginBottom: 24,
            }}
          >
            ⚠️
          </div>
          <h2 style={{ marginBottom: 12 }}>Terjadi Kesalahan</h2>
          <p style={{ color: 'var(--abu-500)', marginBottom: 24, maxWidth: 400 }}>
            {this.state.error?.message || 'Aplikasi mengalami error. Silakan muat ulang.'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            icon="🔄"
            style={{ maxWidth: 200 }}
          >
            Muat Ulang
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre
              style={{
                marginTop: 32,
                padding: 16,
                background: '#f5f5f5',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                textAlign: 'left',
                overflow: 'auto',
                maxWidth: '100%',
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
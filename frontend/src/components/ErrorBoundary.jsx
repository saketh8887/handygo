import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('HandyConnect ErrorBoundary caught an unhandled exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-sm border-0 rounded-4 text-center p-4 p-md-5 my-4">
                <div className="d-flex justify-content-center mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: 68, height: 68, backgroundColor: '#fee2e2', color: '#ef4444' }}
                  >
                    <AlertTriangle size={36} />
                  </div>
                </div>

                <h4 className="fw-bold text-dark mb-2">Something Went Wrong</h4>
                <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: 420 }}>
                  An unexpected error occurred while rendering this section. Your session and saved data are intact.
                </p>

                {this.state.error?.message && (
                  <div className="bg-light p-3 rounded-3 text-start small mb-4 font-monospace border text-secondary" style={{ fontSize: '0.8rem', overflowX: 'auto' }}>
                    {this.state.error.message}
                  </div>
                )}

                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-primary px-4 py-2 d-inline-flex align-items-center gap-2 rounded-3 shadow-sm"
                    onClick={this.handleReset}
                  >
                    <RefreshCw size={16} />
                    <span>Reload Page</span>
                  </button>
                  <a
                    href="/"
                    className="btn btn-outline-secondary px-4 py-2 d-inline-flex align-items-center gap-2 rounded-3"
                  >
                    <Home size={16} />
                    <span>Return to Home</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

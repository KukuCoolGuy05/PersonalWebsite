import { Component } from 'react';

// Keeps one broken section from blanking the whole site.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Something broke while rendering:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container crash" role="alert">
        <p className="mono-label">Something went wrong</p>
        <h1 className="crash__title">This page hit a snag.</h1>
        <p className="lede">Try reloading — if it keeps happening, the rest of the site should still work.</p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}

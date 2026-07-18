import { Component } from "react";

// Without this, any render-time crash anywhere in the tree (e.g. a page
// calling .map()/.filter() on data that turned out not to be an array)
// unmounts the entire app with no trace on screen — just a blank white
// page. This turns that into a visible, actionable message instead.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("StorePass crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-mark">!</div>
          <h1 className="text-title1 auth-title">Something went wrong</h1>
          <p className="text-subhead text-secondary auth-subtitle">
            {this.state.error.message || "The app hit an unexpected error."}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.assign("/")}>
            Reload StorePass
          </button>
        </div>
      </div>
    );
  }
}

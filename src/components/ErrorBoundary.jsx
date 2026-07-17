import { Component } from 'react'

// Without a boundary, any uncaught render/effect error unmounts the entire
// React tree and the site becomes a blank white page (this actually shipped:
// Chrome 149's scroll-promise change crashed ScrollToTop on every client-side
// navigation). Catch it and show a recover screen instead.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Flowa: uncaught error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-4 text-center">
        <div>
          <p className="font-display text-2xl text-plum-900">Something went wrong</p>
          <p className="mt-2 text-sm text-plum-800/60">Please reload the page — if it keeps happening, reach out to us.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 cursor-pointer rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blush-600"
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}

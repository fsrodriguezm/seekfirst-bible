declare global {
  interface Window {
    gtag?: (action: string, id: string, options: Record<string, unknown>) => void
  }
}

export {}

declare module 'vis-network' {
  const content: unknown
  export default content
  export = content
}

declare module 'vis-network/standalone' {
  const content: unknown
  export default content
  export = content
}

declare module 'vis-data' {
  const content: unknown
  export default content
  export = content
}

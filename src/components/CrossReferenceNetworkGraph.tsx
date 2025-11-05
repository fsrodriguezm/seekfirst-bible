/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import type { Options, Edge, Node } from 'vis-network/peer'
import { Network } from 'vis-network/peer'
import { DataSet } from 'vis-data/peer'
import { useTheme } from '../contexts/ThemeContext'

type ReferenceWithText = {
  ref: string
  book: string
  chapter: number
  verse: number
  text: string
  weight: number
  votes: number
  reason: string
}

type NavigationEntry = {
  book: string
  chapter: number
  verse: number
}

type CrossReferenceNetworkGraphProps = {
  currentBook: string
  currentChapter: number
  currentVerse: number
  referencesWithText: ReferenceWithText[]
  onNavigateToVerse: (_book: string, _chapter: number, _verse: number) => void
  fontSize?: number
  navigationHistory?: NavigationEntry[]
  onUpdateNavigationHistory?: (_history: NavigationEntry[]) => void
}

type ReferenceNode = Node & {
  book: string
  chapter: number
  verse: number
  type: 'center' | 'reference'
  text?: string
}

type ReferenceEdge = Edge & {
  weight: number
  reason: string
}

const DEFAULT_FONT_COLOR_LIGHT = '#ffffff'
const DEFAULT_FONT_COLOR_DARK = '#f1f5f9'

const parseColor = (color: string): { r: number; g: number; b: number } | null => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      return { r, g, b }
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return { r, g, b }
    }
    return null
  }

  const rgbMatch = color.match(/rgba?\(([^)]+)\)/)
  if (!rgbMatch) return null

  const parts = rgbMatch[1].split(',').map((part) => parseFloat(part.trim()))
  if (parts.length < 3 || parts.some((value) => Number.isNaN(value))) {
    return null
  }

  return { r: parts[0], g: parts[1], b: parts[2] }
}

const darkenColor = (color: string, factor: number): string => {
  const parsed = parseColor(color)
  if (!parsed) return color

  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))
  const r = clamp(parsed.r * (1 - factor))
  const g = clamp(parsed.g * (1 - factor))
  const b = clamp(parsed.b * (1 - factor))

  return `rgb(${r}, ${g}, ${b})`
}

const lightenColor = (color: string, factor: number): string => {
  const parsed = parseColor(color)
  if (!parsed) return color

  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))
  const r = clamp(parsed.r + (255 - parsed.r) * factor)
  const g = clamp(parsed.g + (255 - parsed.g) * factor)
  const b = clamp(parsed.b + (255 - parsed.b) * factor)

  return `rgb(${r}, ${g}, ${b})`
}

const getCssVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.body).getPropertyValue(name)
  return value.trim() || fallback
}

const buildRgba = (rgbValue: string, alpha: number): string => `rgba(${rgbValue}, ${alpha})`

const CrossReferenceNetworkGraph = ({
  currentBook,
  currentChapter,
  currentVerse,
  referencesWithText,
  onNavigateToVerse,
  fontSize = 14,
  navigationHistory = [],
  onUpdateNavigationHistory,
}: CrossReferenceNetworkGraphProps) => {
  const networkRef = useRef<HTMLDivElement | null>(null)
  const networkInstance = useRef<Network | null>(null)
  const [networkData, setNetworkData] = useState<{
    nodes: DataSet<ReferenceNode>
    edges: DataSet<ReferenceEdge>
  }>(() => ({
    nodes: new DataSet<ReferenceNode>([]),
    edges: new DataSet<ReferenceEdge>([]),
  }))
  const { isDark } = useTheme()
  const accent = useMemo(() => getCssVar('--sf-accent', '#38bdf8'), [])
  const accentMid = useMemo(() => getCssVar('--sf-accent-mid', '#0ea5e9'), [])
  const accentRgb = useMemo(() => getCssVar('--sf-accent-rgb', '56, 189, 248'), [])

  const handleNavigation = useCallback(
    (book: string, chapter: number, verse: number, trimToIndex: number | null = null) => {
      if (trimToIndex !== null && onUpdateNavigationHistory) {
        onNavigateToVerse(book, chapter, verse)
        const trimmedHistory = navigationHistory.slice(0, trimToIndex)
        onUpdateNavigationHistory(trimmedHistory)
        return
      }

      onNavigateToVerse(book, chapter, verse)
    },
    [onNavigateToVerse, navigationHistory, onUpdateNavigationHistory],
  )

  const getWeightColor = useCallback(
    (weight: number): string => {
      if (isDark) {
        if (weight >= 0.9) return '#34d399'
        if (weight >= 0.7) return accent
        if (weight >= 0.5) return '#60a5fa'
        if (weight >= 0.3) return '#a78bfa'
        return '#94a3b8'
      }

      if (weight >= 0.9) return '#10b981'
      if (weight >= 0.7) return accent
      if (weight >= 0.5) return '#3b82f6'
      if (weight >= 0.3) return '#8b5cf6'
      return '#64748b'
    },
    [isDark, accent],
  )

  const getWeightBorderColor = useCallback(
    (weight: number): string => {
      if (isDark) {
        if (weight >= 0.9) return '#059669'
        if (weight >= 0.7) return accentMid
        if (weight >= 0.5) return '#2563eb'
        if (weight >= 0.3) return '#8b5cf6'
        return '#64748b'
      }

      if (weight >= 0.9) return '#047857'
      if (weight >= 0.7) return accentMid
      if (weight >= 0.5) return '#1d4ed8'
      if (weight >= 0.3) return '#7c3aed'
      return '#475569'
    },
    [isDark, accentMid],
  )

  const getEdgeColor = useCallback(
    (weight: number, alpha = 1): string => {
      if (isDark) {
        if (weight >= 0.9) return `rgba(52, 211, 153, ${alpha})`
        if (weight >= 0.7) return buildRgba(accentRgb, alpha)
        if (weight >= 0.5) return `rgba(96, 165, 250, ${alpha})`
        if (weight >= 0.3) return `rgba(167, 139, 250, ${alpha})`
        return `rgba(148, 163, 184, ${alpha})`
      }

      if (weight >= 0.9) return `rgba(16, 185, 129, ${alpha})`
      if (weight >= 0.7) return buildRgba(accentRgb, alpha)
      if (weight >= 0.5) return `rgba(59, 130, 246, ${alpha})`
      if (weight >= 0.3) return `rgba(139, 92, 246, ${alpha})`
      return `rgba(100, 116, 139, ${alpha})`
    },
    [isDark, accentRgb],
  )

  useEffect(() => {
    if (!referencesWithText.length || !currentBook || !currentChapter || !currentVerse) {
      setNetworkData({
        nodes: new DataSet<ReferenceNode>([]),
        edges: new DataSet<ReferenceEdge>([]),
      })
      return
    }

    const nodes = new DataSet<ReferenceNode>([])
    const edges = new DataSet<ReferenceEdge>([])

    const centerNodeId = `${currentBook}-${currentChapter}-${currentVerse}`
    const centerColors = isDark
      ? {
          background: '#a78bfa',
          border: '#8b5cf6',
          highlight: { background: '#c4b5fd', border: '#7c3aed' },
        }
      : {
          background: '#8b5cf6',
          border: '#7c3aed',
          highlight: { background: '#a78bfa', border: '#6d28d9' },
        }

    nodes.add({
      id: centerNodeId,
      label: `${currentBook} ${currentChapter}:${currentVerse}`,
      book: currentBook,
      chapter: currentChapter,
      verse: currentVerse,
      type: 'center',
      size: 30,
      color: centerColors,
      font: {
        size: fontSize + 3,
        color: isDark ? DEFAULT_FONT_COLOR_DARK : DEFAULT_FONT_COLOR_LIGHT,
        strokeWidth: 1,
        strokeColor: isDark ? '#1f2937' : '#000000',
      },
      shape: 'circle',
      shadow: {
        enabled: true,
        color: isDark ? 'rgba(167, 139, 250, 0.4)' : 'rgba(139, 92, 246, 0.3)',
        size: 10,
        x: 0,
        y: 0,
      },
    })

    referencesWithText.forEach((ref) => {
      const nodeId = `${ref.book}-${ref.chapter}-${ref.verse}`

      if (!nodes.get(nodeId)) {
        const nodeColor = getWeightColor(ref.weight)
        const borderColor = getWeightBorderColor(ref.weight)
        const nodeSize = 18 + ref.weight * 12

        nodes.add({
          id: nodeId,
          label: ref.ref,
          book: ref.book,
          chapter: ref.chapter,
          verse: ref.verse,
          text: ref.text,
          type: 'reference',
          size: nodeSize,
          color: {
            background: nodeColor,
            border: borderColor,
            highlight: {
              background: lightenColor(nodeColor, 0.15),
              border: darkenColor(borderColor, 0.2),
            },
          },
          font: {
            size: Math.max(10, fontSize - 1),
            color: isDark ? DEFAULT_FONT_COLOR_DARK : DEFAULT_FONT_COLOR_LIGHT,
            strokeWidth: 1,
            strokeColor: isDark ? '#1f2937' : '#000000',
          },
          shape: 'circle',
          shadow: {
            enabled: true,
            color: `${nodeColor}40`,
            size: 8,
            x: 2,
            y: 2,
          },
        })
      }

      edges.add({
        id: `${centerNodeId}-${nodeId}`,
        from: centerNodeId,
        to: nodeId,
        weight: ref.weight,
        reason: ref.reason,
        width: 3 + ref.weight * 5,
        color: {
          color: getEdgeColor(ref.weight, 0.8),
          highlight: getEdgeColor(ref.weight, 1),
          hover: getEdgeColor(ref.weight, 0.9),
        },
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.2,
        },
        shadow: {
          enabled: true,
          color: getEdgeColor(ref.weight, 0.3),
          size: 5,
          x: 0,
          y: 0,
        },
      })
    })

    setNetworkData({ nodes, edges })
  }, [
    referencesWithText,
    currentBook,
    currentChapter,
    currentVerse,
    fontSize,
    isDark,
    getEdgeColor,
    getWeightColor,
    getWeightBorderColor,
  ])

  useEffect(() => {
    if (!networkRef.current) return

    const nodeCount = (networkData.nodes.length ?? networkData.nodes.getIds().length) as number
    if (nodeCount === 0) {
      if (networkInstance.current) {
        networkInstance.current.destroy()
        networkInstance.current = null
      }
      return
    }

    const options: Options = {
      nodes: {
        borderWidth: 2,
        shadow: true,
        font: {
          color: '#ffffff',
          strokeWidth: 2,
          strokeColor: '#000000',
        },
      },
      edges: {
        shadow: true,
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.3,
        },
      },
      physics: {
        enabled: true,
        forceAtlas2Based: {
          gravitationalConstant: -26,
          centralGravity: 0.005,
          springLength: 230,
          springConstant: 0.18,
          damping: 0.4,
          avoidOverlap: 0.5,
        },
        maxVelocity: 146,
        solver: 'forceAtlas2Based',
        timestep: 0.35,
        stabilization: { iterations: 150 },
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        selectConnectedEdges: false,
        zoomView: true,
        dragView: true,
      },
    }

    if (networkInstance.current) {
      networkInstance.current.destroy()
    }

    const instance = new Network(networkRef.current, networkData, options)
    networkInstance.current = instance

    instance.once('stabilized', () => {
      instance.fit({
        animation: { duration: 600, easingFunction: 'easeInOutQuad' },
      })
    })

    instance.on('click', (params: any) => {
      if (Array.isArray(params.nodes) && params.nodes.length > 0) {
        const nodeId = params.nodes[0]
        const node = networkData.nodes.get(nodeId, { returnType: 'Object' }) as unknown as ReferenceNode | undefined
        if (node && node.type === 'reference') {
          handleNavigation(node.book, node.chapter, node.verse)
        }
      }
    })

    instance.on('hoverNode', (params: any) => {
      const node = networkData.nodes.get(params.node, { returnType: 'Object' }) as unknown as ReferenceNode | undefined
      if (networkRef.current) {
        networkRef.current.title = node && node.text
          ? `${node.label}: ${node.text.substring(0, 100)}...`
          : ''
      }
    })

    instance.on('blurNode', () => {
      if (networkRef.current) {
        networkRef.current.title = ''
      }
    })

    return () => {
      instance.destroy()
      if (networkInstance.current === instance) {
        networkInstance.current = null
      }
    }
  }, [networkData, handleNavigation])

  const hasNodes = (networkData.nodes.length ?? networkData.nodes.getIds().length) > 0

  if (!hasNodes) {
    return (
      <div className="network-graph-empty">
        <p>No references to visualize</p>
      </div>
    )
  }

  return (
    <div className={`network-graph-container ${isDark ? 'dark' : ''}`}>
      <div className="network-graph-header">
        <h4>Reference Network</h4>
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }} />
            <span>Current Verse</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#10b981' }} />
            <span>Highest Relevance (90%+)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: accent }} />
            <span>High Relevance (70%+)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#3b82f6' }} />
            <span>Medium Relevance (50%+)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }} />
            <span>Lower Relevance (30%+)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#64748b' }} />
            <span>Lowest Relevance</span>
          </div>
        </div>
      </div>

      {navigationHistory.length > 0 && (
        <div className="network-breadcrumb">
          <div className="breadcrumb-trail">
            {navigationHistory.map((item, index) => (
              <span key={`${item.book}-${item.chapter}-${item.verse}-${index}`} className="breadcrumb-item">
                {index > 0 && <span className="breadcrumb-separator">→</span>}
                <button
                  type="button"
                  className={`breadcrumb-link ${index === navigationHistory.length - 1 ? 'current' : ''}`}
                  onClick={() => {
                    if (index < navigationHistory.length - 1) {
                      handleNavigation(item.book, item.chapter, item.verse, index + 1)
                    }
                  }}
                  disabled={index === navigationHistory.length - 1}
                >
                  {item.book} {item.chapter}:{item.verse}
                </button>
              </span>
            ))}
          </div>
          {navigationHistory.length > 1 && (
            <button
              type="button"
              className="breadcrumb-back-button"
              onClick={() => {
                if (navigationHistory.length > 1) {
                  const previous = navigationHistory[navigationHistory.length - 2]
                  handleNavigation(previous.book, previous.chapter, previous.verse, navigationHistory.length - 1)
                }
              }}
              title="Go back to previous verse"
            >
              ← Back
            </button>
          )}
        </div>
      )}

      <div className="network-wrapper">
        <div ref={networkRef} className="network-canvas" />
      </div>

      <div className="graph-controls">
        <div className="graph-interactions">
          <p><strong>Click nodes to navigate</strong> • Drag to pan • Scroll to zoom</p>
        </div>
        <div className="graph-buttons">
          <button
            type="button"
            className="graph-control-btn"
            onClick={() => {
              if (networkInstance.current) {
                networkInstance.current.fit({
                  animation: { duration: 1000, easingFunction: 'easeInOutQuad' },
                })
              }
            }}
          >
            Fit to View
          </button>
          <button
            type="button"
            className="graph-control-btn"
            onClick={() => {
              if (networkInstance.current) {
                networkInstance.current.moveTo({
                  scale: 1,
                  animation: { duration: 1000, easingFunction: 'easeInOutQuad' },
                })
              }
            }}
          >
            Reset Zoom
          </button>
        </div>
      </div>
    </div>
  )
}

export default CrossReferenceNetworkGraph

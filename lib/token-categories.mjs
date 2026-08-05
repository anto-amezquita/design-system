/**
 * Single source of truth for token categories.
 *
 * scripts/build-token-reference.mjs's getCategory() must only ever produce a
 * value from this list, and TokenTable.tsx's filter pills are derived from it
 * — so the two can never drift out of sync.
 */
export const TOKEN_CATEGORIES = [
  { value: 'color',      label: 'Color'      },
  { value: 'spacing',    label: 'Spacing'    },
  { value: 'typography', label: 'Typography' },
  { value: 'motion',     label: 'Motion'     },
  { value: 'radius',     label: 'Radius'     },
  { value: 'border',     label: 'Border'     },
  { value: 'shadow',     label: 'Shadow'     },
  { value: 'size',       label: 'Size'       },
  { value: 'opacity',    label: 'Opacity'    },
  { value: 'elevation',  label: 'Elevation'  },
  { value: 'component',  label: 'Component'  },
  { value: 'primitive',  label: 'Primitives' },
]

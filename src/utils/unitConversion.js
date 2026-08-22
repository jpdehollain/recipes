// Every unit belongs to a "unitType". Only units within the same type get
// summed together across recipes. Count units (e.g. "clove", "whole") only
// combine when the unit label matches exactly, since "2 onions" and
// "150g diced onion" aren't the same shopping item.

export const UNIT_TYPES = {
  volume: {
    label: 'Volume',
    units: {
      tsp: { label: 'tsp', toBase: 4.92892 },
      tbsp: { label: 'tbsp', toBase: 14.7868 },
      fl_oz: { label: 'fl oz', toBase: 29.5735 },
      cup: { label: 'cup', toBase: 236.588 },
      ml: { label: 'ml', toBase: 1 },
      l: { label: 'L', toBase: 1000 },
    },
    baseUnit: 'ml',
  },
  weight: {
    label: 'Weight',
    units: {
      g: { label: 'g', toBase: 1 },
      kg: { label: 'kg', toBase: 1000 },
      oz: { label: 'oz', toBase: 28.3495 },
      lb: { label: 'lb', toBase: 453.592 },
    },
    baseUnit: 'g',
  },
  count: {
    label: 'Count',
    // Free-form: whatever the user types (e.g. "clove", "whole", "can") is
    // both the unit key and its label. No conversion happens within this type.
    units: {},
    baseUnit: null,
  },
}

// Converts a quantity in `unit` to the base unit for its unitType (ml or g).
// Count-type quantities are returned as-is.
export function toBaseAmount(quantity, unit, unitType) {
  if (unitType === 'count') return quantity
  const unitDef = UNIT_TYPES[unitType]?.units[unit]
  if (!unitDef) return quantity
  return quantity * unitDef.toBase
}

// Converts a base-unit amount back into the most readable unit for display.
export function humanizeAmount(baseAmount, unitType, countUnitLabel) {
  if (unitType === 'count') {
    return `${roundNice(baseAmount)} ${countUnitLabel || ''}`.trim()
  }

  if (unitType === 'weight') {
    if (baseAmount >= 1000) {
      return `${roundNice(baseAmount / 1000)} kg`
    }
    return `${roundNice(baseAmount)} g`
  }

  if (unitType === 'volume') {
    if (baseAmount >= 1000) {
      return `${roundNice(baseAmount / 1000)} L`
    }
    if (baseAmount >= 60) {
      return `${roundNice(baseAmount / 236.588)} cup`
    }
    if (baseAmount >= 14.7868) {
      return `${roundNice(baseAmount / 14.7868)} tbsp`
    }
    return `${roundNice(baseAmount / 4.92892)} tsp`
  }

  return `${roundNice(baseAmount)}`
}

// Rounds to a friendly precision — whole numbers where possible, otherwise
// one decimal place, since grocery quantities rarely need more precision.
function roundNice(num) {
  const rounded = Math.round(num * 10) / 10
  return Number.isInteger(rounded) ? rounded : rounded.toFixed(1)
}

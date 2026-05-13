import { describe, it, expect } from 'vitest'
import {
  calculateIngredientUnitCost,
  calculateIngredientUsageCost,
  applyLoss,
  normalizeToBaseUnit
} from '../domain/services/costCalculator'

describe('normalizeToBaseUnit', () => {
  it('converts kg to g', () => {
    expect(normalizeToBaseUnit(1, 'kg')).toBe(1000)
  })
  it('converts l to ml', () => {
    expect(normalizeToBaseUnit(2, 'l')).toBe(2000)
  })
  it('keeps g unchanged', () => {
    expect(normalizeToBaseUnit(500, 'g')).toBe(500)
  })
  it('keeps unidade unchanged', () => {
    expect(normalizeToBaseUnit(3, 'unidade')).toBe(3)
  })
})

describe('calculateIngredientUnitCost', () => {
  it('7.1 — custo por grama: R$40 para 1000g = R$0,04/g', () => {
    const cost = calculateIngredientUnitCost(40, 1000, 'g')
    expect(cost).toBeCloseTo(0.04, 6)
  })

  it('calcula custo por grama usando kg: R$40 para 1kg = R$0,04/g', () => {
    const cost = calculateIngredientUnitCost(40, 1, 'kg')
    expect(cost).toBeCloseTo(0.04, 6)
  })

  it('retorna 0 se quantidade for 0', () => {
    expect(calculateIngredientUnitCost(40, 0, 'g')).toBe(0)
  })
})

describe('calculateIngredientUsageCost', () => {
  it('7.2 — custo de uso: 100g a R$0,04/g = R$4,00', () => {
    const cost = calculateIngredientUsageCost(100, 'g', 0.04)
    expect(cost).toBeCloseTo(4.0, 6)
  })

  it('custo de uso em kg: 0.1kg a R$0,04/g = R$4,00', () => {
    const cost = calculateIngredientUsageCost(0.1, 'kg', 0.04)
    expect(cost).toBeCloseTo(4.0, 6)
  })
})

describe('applyLoss', () => {
  it('7.3 — custo com perda: R$10 com 10% perda = R$11,00', () => {
    const result = applyLoss(10, 10)
    expect(result).toBeCloseTo(11.0, 6)
  })

  it('sem perda: retorna valor original', () => {
    expect(applyLoss(10, 0)).toBeCloseTo(10, 6)
  })
})

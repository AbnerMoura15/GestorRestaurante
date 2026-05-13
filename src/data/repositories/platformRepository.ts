import { db } from '../db'
import type { PlatformFeePreset, PlatformFeePresetInput } from '../../domain/entities/PlatformFeePreset'
import { nanoid } from '../../utils/nanoid'

export const platformRepository = {
  async getAll(): Promise<PlatformFeePreset[]> {
    return db.platforms.toArray()
  },

  async getById(id: string): Promise<PlatformFeePreset | undefined> {
    return db.platforms.get(id)
  },

  async update(id: string, input: Partial<PlatformFeePresetInput>): Promise<PlatformFeePreset> {
    const existing = await db.platforms.get(id)
    if (!existing) throw new Error(`Platform ${id} not found`)
    const updated: PlatformFeePreset = { ...existing, ...input, atualizadoEm: Date.now() }
    await db.platforms.put(updated)
    return updated
  },

  async create(input: PlatformFeePresetInput): Promise<PlatformFeePreset> {
    const now = Date.now()
    const preset: PlatformFeePreset = { ...input, id: nanoid(), criadoEm: now, atualizadoEm: now }
    await db.platforms.add(preset)
    return preset
  },

  async delete(id: string): Promise<void> {
    await db.platforms.delete(id)
  }
}

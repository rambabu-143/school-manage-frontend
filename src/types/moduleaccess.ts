export const MODULE_KEYS = [
  "transport",
  "hostel",
  "inventory",
  "appraisal",
  "houses",
  "clubs",
  "streams",
  "alumni",
  "counselling",
  "disciplinary",
  "cca",
  "events",
  "newsletters",
] as const

export type ModuleKey = (typeof MODULE_KEYS)[number]

export interface ModuleSetting {
  module_key: ModuleKey
  is_enabled: boolean
}

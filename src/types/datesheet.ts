export interface DatesheetEntry {
  id: string
  tenant_id: string
  exam_id: string
  section_id: string
  subject_id: string
  exam_date: string
  start_time: string
  end_time: string
}

export interface DatesheetEntryCreateInput {
  exam_id: string
  section_id: string
  subject_id: string
  exam_date: string
  start_time: string
  end_time: string
}

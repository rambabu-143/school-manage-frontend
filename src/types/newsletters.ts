export type NewsletterAudience = "student" | "staff" | "both"

export interface Newsletter {
  id: string
  tenant_id: string
  branch_id: string
  posted_by_user_id: string
  title: string
  body: string
  audience: NewsletterAudience
  start_date: string
  end_date: string
  is_published: boolean
  published_at: string | null
  created_at: string
}

export interface NewsletterCreateInput {
  branch_id: string
  title: string
  body: string
  audience: NewsletterAudience
  start_date: string
  end_date: string
}

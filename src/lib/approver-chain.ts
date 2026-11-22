export function validateChain(requester: string, approvers: string[]): string | null {
  if (!requester) return "Select a requester"
  if (approvers.length < 1) return "Add at least one approver"
  if (approvers.length > 10) return "At most 10 approvers"
  if (approvers.some((a) => !a)) return "Every step needs an approver"
  if (approvers.includes(requester)) return "A requester cannot approve their own requisitions"
  if (new Set(approvers).size !== approvers.length) return "Duplicate approver"
  return null
}

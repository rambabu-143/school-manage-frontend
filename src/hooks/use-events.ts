"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  Event,
  EventCreateInput,
  EventParticipant,
  EventPhoto,
  EventPhotoCreateInput,
  EventScore,
  EventScoreCreateInput,
} from "@/types/events"

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await apiClient.get<Event[]>("/events")
      return data
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: EventCreateInput) => {
      const { data } = await apiClient.post<Event>("/events", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      toast.success("Event created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useEventParticipants(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-participants", eventId],
    queryFn: async () => {
      const { data } = await apiClient.get<EventParticipant[]>(
        `/events/${eventId}/participants`
      )
      return data
    },
    enabled: !!eventId,
  })
}

export function useAddEventParticipant(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (studentId: string) => {
      const { data } = await apiClient.post<EventParticipant>(
        `/events/${eventId}/participants`,
        { student_id: studentId }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] })
      toast.success("Participant registered")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useEventScores(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-scores", eventId],
    queryFn: async () => {
      const { data } = await apiClient.get<EventScore[]>(`/events/${eventId}/scores`)
      return data
    },
    enabled: !!eventId,
  })
}

export function useAddEventScore(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: EventScoreCreateInput) => {
      const { data } = await apiClient.post<EventScore>(`/events/${eventId}/scores`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-scores", eventId] })
      toast.success("Score submitted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useEventPhotos(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-photos", eventId],
    queryFn: async () => {
      const { data } = await apiClient.get<EventPhoto[]>(`/events/${eventId}/photos`)
      return data
    },
    enabled: !!eventId,
  })
}

export function useAddEventPhoto(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: EventPhotoCreateInput) => {
      const { data } = await apiClient.post<EventPhoto>(`/events/${eventId}/photos`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-photos", eventId] })
      toast.success("Photo added")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

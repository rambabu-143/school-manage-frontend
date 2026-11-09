"use client"

import type { paths } from "@/lib/api-types"
import { apiClient } from "@/lib/api-client"

// Thin typed layer over apiClient, keyed by the OpenAPI path (without the
// /api/v1 prefix the BFF adds) and method. Adopt per call site; untyped
// apiClient calls keep working.

type Prefix = "/api/v1"
export type ApiPath = keyof paths extends infer K ? (K extends `${Prefix}${infer R}` ? R : never) : never
type Method = "get" | "post" | "put" | "patch" | "delete"
type Full<P extends ApiPath> = `${Prefix}${P}` extends keyof paths ? paths[`${Prefix}${P}`] : never
// openapi-typescript marks absent methods as `post?: never`; drop those.
export type ApiMethod<P extends ApiPath> = {
  [M in Method & keyof Full<P>]: [NonNullable<Full<P>[M]>] extends [never] ? never : M
}[Method & keyof Full<P>]
type Op<P extends ApiPath, M extends Method> = Full<P>[M & keyof Full<P>]

type Params<O> = O extends { parameters: infer Q } ? Q : never
type Pick2<T, K extends string> = K extends keyof T ? NonNullable<T[K]> : never
type Json<R> = R extends { content: { "application/json": infer B } } ? B : undefined
type Ok<O> = O extends { responses: infer R }
  ? Json<R[Extract<keyof R, 200 | 201 | 202>]>
  : never

export type ApiResponse<P extends ApiPath, M extends Method> = Ok<Op<P, M>>
export type ApiBody<P extends ApiPath, M extends Method> = Op<P, M> extends {
  requestBody?: { content: { "application/json": infer B } }
}
  ? B
  : never
export type ApiQuery<P extends ApiPath, M extends Method> = Pick2<Params<Op<P, M>>, "query">
export type ApiPathParams<P extends ApiPath, M extends Method> = Pick2<Params<Op<P, M>>, "path">

type Opts<P extends ApiPath, M extends Method> = {
  path?: ApiPathParams<P, M>
  query?: ApiQuery<P, M>
  body?: ApiBody<P, M>
}

export function fillPath(template: string, params?: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = params?.[k]
    if (v === undefined || v === null) throw new Error(`Missing path parameter "${k}" for ${template}`)
    return encodeURIComponent(String(v))
  })
}

export async function api<P extends ApiPath, M extends ApiMethod<P>>(
  method: M,
  path: P,
  opts: Opts<P, M> = {}
): Promise<ApiResponse<P, M>> {
  const { data } = await apiClient.request({
    method,
    url: fillPath(path, opts.path as Record<string, unknown> | undefined),
    params: opts.query,
    data: opts.body,
  })
  return data as ApiResponse<P, M>
}

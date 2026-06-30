"use server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function flushGlobalCache(path: string = '/') {
  revalidatePath(path);
}

export async function clearTag(tag: string) {
  // @ts-expect-error Next.js 14 typings mismatch
  revalidateTag(tag);
}

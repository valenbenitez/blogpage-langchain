"use client";

import { useActionState } from "react";

import { verifyPinAction } from "@/app/actions/auth";

type PinFormProps = {
  nextPath: string;
};

type FormState = {
  success: boolean;
  message: string;
} | null;

export function PinForm({ nextPath }: PinFormProps) {
  const [state, submitAction, isPending] = useActionState(
    async (_previous: FormState, formData: FormData): Promise<FormState> => {
      const pin = String(formData.get("pin") ?? "");
      const result = await verifyPinAction(pin, nextPath);

      if (result.success) {
        return { success: true, message: "Acceso correcto." };
      }

      return { success: false, message: result.error };
    },
    null,
  );

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Acceso de edición
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
          Ingresá el PIN para crear o editar artículos.
        </p>
      </div>

      <form
        action={submitAction}
        className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="pin">
            PIN
          </label>
          <input
            autoComplete="current-password"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/20"
            id="pin"
            inputMode="numeric"
            name="pin"
            placeholder="••••"
            required
            type="password"
          />
        </div>

        {state && !state.success ? (
          <p
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <button
          className="inline-flex w-full items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </section>
  );
}

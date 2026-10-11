export function assertEmailSendingAllowed(env: NodeJS.ProcessEnv = process.env): void {
  if (env.BOKKIE_APP_ENV === "staging") {
    throw new Error("Staging email sending is disabled");
  }
}

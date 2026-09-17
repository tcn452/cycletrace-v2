'use client'

import type { ReactNode } from 'react'
import { OnboardingProvider, StepComponentProps, useOnboarding } from '@onboardjs/react'
import { appwriteAccount } from '../../lib/appwrite/client'

type Role = 'rider' | 'insurer'

const copy = {
  rider: [
    ['welcome', 'Welcome to CycleTrace', 'This workspace is where you protect bikes, manage ownership records and keep recovery details close.'],
    ['bikes', 'Your bikes live here', 'The My bikes area is your source of truth for every protected bicycle.'],
    ['actions', 'Know your next action', 'Register a bike, transfer ownership or report a theft from the dashboard.'],
  ],
  insurer: [
    ['welcome', 'Welcome to the insurer workspace', 'Verify bicycle ownership and manage coverage decisions from one place.'],
    ['lookup', 'Verify a bike instantly', 'Use the lookup field to check a serial number before issuing or reviewing a policy.'],
    ['claims', 'Keep claims moving', 'The claims queue highlights cases that need your team’s attention.'],
  ],
} as const

function TourStep({ payload }: StepComponentProps<{ title: string; description: string }>) {
  return <div><span className="onboarding-kicker">CycleTrace guide</span><h2>{payload.title}</h2><p>{payload.description}</p></div>
}

function OnboardingSurface({ children, role }: { children: ReactNode; role: Role }) {
  const { state, next, previous, skip, reset, renderStep } = useOnboarding()
  const currentIndex = state?.currentStep ? copy[role].findIndex(step => step[0] === state.currentStep?.id) : 0
  return <>{children}{state?.currentStep && !state.isCompleted && <div className="onboarding-overlay"><div className="onboarding-card">{renderStep()}<div className="onboarding-progress"><span>{currentIndex + 1} / {copy[role].length}</span><div><i style={{ width: `${((currentIndex + 1) / copy[role].length) * 100}%` }} /></div></div><div className="onboarding-actions"><button className="text-button" onClick={() => skip()}>Skip tour</button><span>{currentIndex > 0 && <button className="text-button" onClick={() => previous()}>Back</button>}<button className="button button-green" onClick={() => next()}>{currentIndex === copy[role].length - 1 ? 'Finish' : 'Next'} <span>→</span></button></span></div></div></div>}{state?.isCompleted && <button className="onboarding-replay" onClick={() => reset()}>Replay guide</button>}</>
}

export function ProductOnboarding({ children, role }: { children: ReactNode; role: Role }) {
  const steps = copy[role].map(([id, title, description], index) => ({ id, type: 'CUSTOM_COMPONENT' as const, payload: { componentKey: 'TourStep', title, description }, nextStep: copy[role][index + 1]?.[0] || null }))
  return <OnboardingProvider steps={steps} componentRegistry={{ TourStep }} flowId={`cycletrace-${role}`} flowName={`${role} onboarding`} localStoragePersistence={{ key: `cycletrace-onboarding-${role}` }} onFlowComplete={async () => { try { await appwriteAccount.updatePrefs({ prefs: { [`${role}OnboardingComplete`]: true } }) } catch { /* A signed-out visitor can still dismiss the guide locally. */ } }}><OnboardingSurface role={role}>{children}</OnboardingSurface></OnboardingProvider>
}

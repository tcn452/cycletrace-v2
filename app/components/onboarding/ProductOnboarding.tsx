'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { FiArrowRight, FiCheck, FiHelpCircle, FiX } from 'react-icons/fi'
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

function TourStep({ payload }: StepComponentProps<{ componentKey: string; title: string; description: string }>) {
  return (
    <div className="onboarding-step-body">
      <span className="onboarding-kicker">CycleTrace guide</span>
      <h2>{payload.title}</h2>
      <p>{payload.description}</p>
    </div>
  )
}

const stepDefinitions = {
  rider: copy.rider.map(([id, title, description], index) => ({
    id,
    type: 'CUSTOM_COMPONENT' as const,
    component: TourStep,
    payload: { componentKey: 'TourStep', title, description },
    nextStep: copy.rider[index + 1]?.[0] || null,
  })),
  insurer: copy.insurer.map(([id, title, description], index) => ({
    id,
    type: 'CUSTOM_COMPONENT' as const,
    component: TourStep,
    payload: { componentKey: 'TourStep', title, description },
    nextStep: copy.insurer[index + 1]?.[0] || null,
  })),
}

function OnboardingSurface({ children, role }: { children: ReactNode; role: Role }) {
  const { state, currentStep, isCompleted, next, previous, skip, reset, renderStep } = useOnboarding()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  const activeStep = currentStep || state?.currentStep
  const completed = isCompleted ?? state?.isCompleted ?? false
  const activeRoleCopy = copy[role]
  const currentIndex = activeStep ? activeRoleCopy.findIndex(step => step[0] === activeStep.id) : 0
  const isTourActive = Boolean(activeStep && !completed)

  const currentItem = activeStep
    ? activeRoleCopy.find(s => s[0] === activeStep.id) || activeRoleCopy[currentIndex]
    : activeRoleCopy[0]

  return (
    <>
      {children}
      {isTourActive && (
        <div
          className="onboarding-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) skip()
          }}
        >
          <div className="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
            <button
              type="button"
              className="onboarding-close"
              onClick={() => skip()}
              aria-label="Skip tour"
            >
              <FiX />
            </button>
            <div className="onboarding-content">
              {renderStep() || (
                <div className="onboarding-step-body">
                  <span className="onboarding-kicker">CycleTrace guide</span>
                  <h2 id="onboarding-title">{currentItem[1]}</h2>
                  <p>{currentItem[2]}</p>
                </div>
              )}
            </div>
            <div className="onboarding-progress">
              <span>{currentIndex + 1} of {activeRoleCopy.length}</span>
              <div className="onboarding-progress-bar">
                <i style={{ width: `${((currentIndex + 1) / activeRoleCopy.length) * 100}%` }} />
              </div>
            </div>
            <div className="onboarding-actions">
              <button type="button" className="text-button" onClick={() => skip()}>
                Skip tour
              </button>
              <div className="onboarding-nav-buttons">
                {currentIndex > 0 && (
                  <button type="button" className="text-button" onClick={() => previous()}>
                    Back
                  </button>
                )}
                <button
                  type="button"
                  className="button button-green button-small"
                  onClick={() => next()}
                >
                  {currentIndex === activeRoleCopy.length - 1 ? (
                    <>Finish <FiCheck /></>
                  ) : (
                    <>Next <FiArrowRight /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {completed && (
        <button
          type="button"
          className="onboarding-replay"
          onClick={() => reset()}
          title="Replay guide"
          aria-label="Replay product guide"
        >
          <FiHelpCircle />
          <span>Tour guide</span>
        </button>
      )}
    </>
  )
}

export function ProductOnboarding({ children, role }: { children: ReactNode; role: Role }) {
  const steps = stepDefinitions[role]
  return (
    <OnboardingProvider
      steps={steps}
      initialStepId={copy[role][0][0]}
      componentRegistry={{ TourStep }}
      flowId={`cycletrace-${role}`}
      flowName={`${role} onboarding`}
      localStoragePersistence={{ key: `cycletrace-onboarding-${role}` }}
      onFlowComplete={async () => {
        try {
          await appwriteAccount.updatePrefs({ prefs: { [`${role}OnboardingComplete`]: true } })
        } catch {
          /* A signed-out visitor can still dismiss the guide locally. */
        }
      }}
    >
      <OnboardingSurface role={role}>{children}</OnboardingSurface>
    </OnboardingProvider>
  )
}

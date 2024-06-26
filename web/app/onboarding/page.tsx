"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { useEffect, useState } from "react"

import { Menu, Transition } from "@headlessui/react"
import { ChevronDown } from "lucide-react"
import { observer } from "mobx-react-lite"
import { useTheme } from "next-themes"
import ServcyLogo from "public/logo.png"
import { Controller, useForm } from "react-hook-form"
import useSWR from "swr"

import { PageHead } from "@components/core"
import { InviteMembers, JoinOrCreateWorkspace, SwitchOrDeleteAccountModal, UserDetails } from "@components/onboarding"

import { useEventTracker, useUser, useWorkspace } from "@hooks/store"

import { USER_ONBOARDING_COMPLETED } from "@constants/event-tracker"

import { WorkspaceService } from "@services/workspace.service"

import UserAuthWrapper from "@wrappers/auth/UserAuthWrapper"
import NoSidebarWrapper from "@wrappers/NoSidebarWrapper"

import type { IUser, TOnboardingSteps } from "@servcy/types"
import { Avatar, Spinner } from "@servcy/ui"

const workspaceService = new WorkspaceService()

const OnboardingPage = observer(() => {
    // states
    const [step, setStep] = useState<number | null>(null)
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

    const router = useRouter()
    // store hooks
    const { captureEvent } = useEventTracker()
    const { currentUser, updateCurrentUser, updateUserOnBoard } = useUser()
    const { workspaces, fetchWorkspaces } = useWorkspace()

    const user = currentUser ?? undefined
    const workspacesList = Object.values(workspaces ?? {})

    const { setTheme } = useTheme()

    const { control, setValue } = useForm<{ full_name: string }>({
        defaultValues: {
            full_name: "",
        },
    })
    useSWR(`USER_WORKSPACES_LIST`, () => fetchWorkspaces(), {
        shouldRetryOnError: false,
    })
    const { data } = useSWR("USER_WORKSPACE_INVITATIONS_LIST", () => workspaceService.userWorkspaceInvitations())
    const invitations = data?.results ?? []
    const stepChange = async (steps: Partial<TOnboardingSteps>) => {
        if (!user) return
        const payload: Partial<IUser> = {
            onboarding_step: {
                ...user.onboarding_step,
                ...steps,
            },
        }
        await updateCurrentUser(payload)
    }
    const finishOnboarding = async () => {
        if (!user || !workspacesList) return
        await updateUserOnBoard().then(() => {
            captureEvent(USER_ONBOARDING_COMPLETED, {
                email: user.email,
                user_id: user.id,
                status: "SUCCESS",
            })
        })
        router.push("/")
    }
    useEffect(() => {
        setTheme("system")
    }, [setTheme])
    useEffect(() => {
        const handleStepChange = async () => {
            if (!user || !invitations) return
            const onboardingStep = user.onboarding_step
            const is_onbarded = user.is_onboarded
            if (is_onbarded) {
                router.push("/")
                return
            }
            if (!onboardingStep.profile_complete) {
                setStep(1)
                return
            }
            if (!(onboardingStep.workspace_join || onboardingStep.workspace_create)) {
                setStep(2)
                return
            }
            if (workspacesList && workspacesList?.length > 0 && onboardingStep.workspace_join) {
                finishOnboarding()
                return
            }
            if (
                workspacesList &&
                workspacesList?.length > 0 &&
                onboardingStep.workspace_create &&
                onboardingStep.profile_complete
            )
                setStep(3)
        }

        handleStepChange()
    }, [user, invitations, updateCurrentUser, workspacesList])

    return (
        <UserAuthWrapper>
            <NoSidebarWrapper>
                <PageHead title="Onboarding" />
                <SwitchOrDeleteAccountModal
                    isOpen={showDeleteAccountModal}
                    onClose={() => setShowDeleteAccountModal(false)}
                />
                {user && step !== null ? (
                    <div className={`fixed flex h-full w-full flex-col bg-onboarding-gradient-100`}>
                        <div className="flex items-center px-4 py-10 sm:px-7 sm:pb-8 sm:pt-14 md:px-14 lg:pl-28 lg:pr-24">
                            <div className="flex w-full items-center justify-between font-semibold ">
                                <div className="flex items-center gap-x-1 text-3xl">
                                    <Image src={ServcyLogo} alt="Servcy Logo" height={30} width={30} />
                                    Servcy
                                </div>

                                <div>
                                    <Controller
                                        control={control}
                                        name="full_name"
                                        render={({ field: { value } }) => (
                                            <div className="flex items-center gap-x-2 pr-4">
                                                {step != 1 && (
                                                    <Avatar
                                                        name={
                                                            currentUser?.first_name
                                                                ? `${currentUser?.first_name} ${currentUser?.last_name ?? ""}`
                                                                : value.length > 0
                                                                  ? value
                                                                  : currentUser?.email
                                                        }
                                                        src={currentUser?.avatar}
                                                        size={35}
                                                        shape="square"
                                                        fallbackBackgroundColor="#FCBE1D"
                                                        className="!text-base capitalize"
                                                    />
                                                )}
                                                <div>
                                                    {step != 1 && (
                                                        <p className="text-sm font-medium text-custom-text-200">
                                                            {currentUser?.first_name
                                                                ? `${currentUser?.first_name} ${currentUser?.last_name ?? ""}`
                                                                : value.length > 0
                                                                  ? value
                                                                  : null}
                                                        </p>
                                                    )}

                                                    <Menu>
                                                        <Menu.Button className={"flex items-center gap-x-2"}>
                                                            <span className="text-base font-medium">{user.email}</span>
                                                            <ChevronDown className="h-4 w-4 text-custom-text-300" />
                                                        </Menu.Button>
                                                        <Transition
                                                            enter="transition duration-100 ease-out"
                                                            enterFrom="transform scale-95 opacity-0"
                                                            enterTo="transform scale-100 opacity-100"
                                                            leave="transition duration-75 ease-out"
                                                            leaveFrom="transform scale-100 opacity-100"
                                                            leaveTo="transform scale-95 opacity-0"
                                                        >
                                                            <Menu.Items className={"absolute min-w-full"}>
                                                                <Menu.Item as="div">
                                                                    <div
                                                                        className="mr-auto mt-2 rounded-md border border-red-400 bg-onboarding-background-200 p-3 text-base font-normal text-red-400 shadow-sm hover:cursor-pointer"
                                                                        onClick={() => {
                                                                            setShowDeleteAccountModal(true)
                                                                        }}
                                                                    >
                                                                        Wrong e-mail address?
                                                                    </div>
                                                                </Menu.Item>
                                                            </Menu.Items>
                                                        </Transition>
                                                    </Menu>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mx-auto h-full w-full overflow-auto rounded-t-md border-x border-t border-custom-border-200 bg-onboarding-gradient-100 px-4 pt-4 shadow-sm sm:w-4/5 lg:w-4/5 xl:w-3/4">
                            <div className={`h-full w-full overflow-auto rounded-t-md bg-onboarding-gradient-200`}>
                                {step === 1 ? (
                                    <UserDetails setUserName={(value) => setValue("full_name", value)} user={user} />
                                ) : step === 2 ? (
                                    <JoinOrCreateWorkspace
                                        setTryDiffAccount={() => {
                                            setShowDeleteAccountModal(true)
                                        }}
                                        stepChange={stepChange}
                                    />
                                ) : (
                                    <InviteMembers
                                        finishOnboarding={finishOnboarding}
                                        stepChange={stepChange}
                                        user={user}
                                        workspace={workspacesList?.[0]}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid h-screen w-full place-items-center">
                        <Spinner />
                    </div>
                )}
            </NoSidebarWrapper>
        </UserAuthWrapper>
    )
})

export default OnboardingPage

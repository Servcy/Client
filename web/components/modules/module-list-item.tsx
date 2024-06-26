import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"

import React from "react"

import { Check, Info, Star, User2 } from "lucide-react"
import { observer } from "mobx-react-lite"
import toast from "react-hot-toast"

import { ModuleQuickActions } from "@components/modules"

import { useEventTracker, useMember, useModule, useUser } from "@hooks/store"

import { MODULE_FAVORITED, MODULE_UNFAVORITED } from "@constants/event-tracker"
import { ERoles } from "@constants/iam"
import { MODULE_STATUS } from "@constants/module"

import { renderFormattedDate } from "@helpers/date-time.helper"

import { Avatar, AvatarGroup, CircularProgressIndicator, Tooltip } from "@servcy/ui"

type Props = {
    moduleId: string
    isArchived?: boolean
}

export const ModuleListItem: React.FC<Props> = observer((props) => {
    const { moduleId, isArchived = false } = props

    const router = useRouter()
    const pathname = usePathname()
    const params = useParams()
    const { workspaceSlug, projectId } = params

    // store hooks
    const {
        membership: { currentProjectRole },
    } = useUser()
    const { getModuleById, addModuleToFavorites, removeModuleFromFavorites } = useModule()
    const { getUserDetails } = useMember()
    const { captureEvent } = useEventTracker()
    // derived values
    const moduleDetails = getModuleById(moduleId)
    const isEditingAllowed = currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER

    const handleAddToFavorites = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()
        if (!workspaceSlug || !projectId) return

        addModuleToFavorites(workspaceSlug.toString(), projectId.toString(), moduleId)
            .then(() => {
                captureEvent(MODULE_FAVORITED, {
                    module_id: moduleId,
                    element: "Grid layout",
                    state: "SUCCESS",
                })
            })
            .catch(() => {
                toast.error("Please try again later")
            })
    }

    const handleRemoveFromFavorites = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()
        if (!workspaceSlug || !projectId) return

        removeModuleFromFavorites(workspaceSlug.toString(), projectId.toString(), moduleId)
            .then(() => {
                captureEvent(MODULE_UNFAVORITED, {
                    module_id: moduleId,
                    element: "Grid layout",
                    state: "SUCCESS",
                })
            })
            .catch(() => {
                toast.error("Please try again later")
            })
    }

    const openModuleOverview = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.stopPropagation()
        e.preventDefault()
        router.push(`${pathname}?peekModule=${moduleId}`)
    }

    if (!moduleDetails) return null

    const completionPercentage =
        ((moduleDetails.completed_issues + moduleDetails.cancelled_issues) / moduleDetails.total_issues) * 100

    const endDate = new Date(moduleDetails.target_date ?? "")
    const startDate = new Date(moduleDetails.start_date ?? "")

    const renderDate = moduleDetails.start_date || moduleDetails.target_date

    // const areYearsEqual = startDate.getFullYear() === endDate.getFullYear();

    const moduleStatus = MODULE_STATUS.find((status) => status.value === moduleDetails.status)

    const progress = isNaN(completionPercentage) ? 0 : Math.floor(completionPercentage)

    const completedModuleCheck = moduleDetails.status === "completed"

    return (
        <>
            <Link
                href={`/${workspaceSlug}/projects/${moduleDetails.project_id}/modules/${moduleDetails.id}`}
                onClick={(e) => {
                    if (isArchived) {
                        openModuleOverview(e)
                    }
                }}
            >
                <div className="group flex w-full items-center justify-between gap-5 border-b border-custom-border-100 bg-custom-background-100 flex-col sm:flex-row px-5 py-6 text-sm hover:bg-custom-background-90">
                    <div className="relative flex w-full items-center gap-3 justify-between overflow-hidden">
                        <div className="relative w-full flex items-center gap-3 overflow-hidden">
                            <div className="flex items-center gap-4 truncate">
                                <span className="flex-shrink-0">
                                    <CircularProgressIndicator size={38} percentage={progress}>
                                        {completedModuleCheck ? (
                                            progress === 100 ? (
                                                <Check className="h-3 w-3 stroke-[2] text-custom-primary-100" />
                                            ) : (
                                                <span className="text-sm text-custom-primary-100">{`!`}</span>
                                            )
                                        ) : progress === 100 ? (
                                            <Check className="h-3 w-3 stroke-[2] text-custom-primary-100" />
                                        ) : (
                                            <span className="text-xs text-custom-text-300">{`${progress}%`}</span>
                                        )}
                                    </CircularProgressIndicator>
                                </span>
                                <Tooltip tooltipContent={moduleDetails.name} position="top">
                                    <span className="truncate text-base font-medium">{moduleDetails.name}</span>
                                </Tooltip>
                            </div>
                            <button
                                onClick={openModuleOverview}
                                className="z-[5] hidden flex-shrink-0 group-hover:flex"
                            >
                                <Info className="h-4 w-4 text-custom-text-400" />
                            </button>
                        </div>
                        <div className="flex items-center justify-center flex-shrink-0">
                            {moduleStatus && (
                                <span
                                    className="flex h-6 w-20 items-center justify-center rounded-sm text-center text-xs flex-shrink-0"
                                    style={{
                                        color: moduleStatus.color,
                                        backgroundColor: `${moduleStatus.color}20`,
                                    }}
                                >
                                    {moduleStatus.label}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full sm:w-auto relative overflow-hidden items-center gap-2.5 justify-between sm:justify-end sm:flex-shrink-0 ">
                        <div className="text-xs text-custom-text-300">
                            {renderDate && (
                                <span className=" text-xs text-custom-text-300">
                                    {renderFormattedDate(startDate) ?? "_ _"} - {renderFormattedDate(endDate) ?? "_ _"}
                                </span>
                            )}
                        </div>

                        <div className="flex-shrink-0 relative flex items-center gap-3">
                            <Tooltip tooltipContent={`${moduleDetails?.member_ids?.length || 0} Members`}>
                                <div className="flex w-10 cursor-default items-center justify-center gap-1">
                                    {moduleDetails.member_ids.length > 0 ? (
                                        <AvatarGroup showTooltip={false}>
                                            {moduleDetails.member_ids.map((member_id) => {
                                                const member = getUserDetails(member_id)
                                                return (
                                                    <Avatar
                                                        key={member?.id}
                                                        name={member?.display_name}
                                                        src={member?.avatar}
                                                    />
                                                )
                                            })}
                                        </AvatarGroup>
                                    ) : (
                                        <span className="flex h-5 w-5 items-end justify-center rounded-full border border-dashed border-custom-text-400 bg-custom-background-80">
                                            <User2 className="h-4 w-4 text-custom-text-400" />
                                        </span>
                                    )}
                                </div>
                            </Tooltip>

                            {isEditingAllowed &&
                                !isArchived &&
                                (moduleDetails.is_favorite ? (
                                    <button type="button" onClick={handleRemoveFromFavorites} className="z-[1]">
                                        <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleAddToFavorites} className="z-[1]">
                                        <Star className="h-3.5 w-3.5 text-custom-text-300" />
                                    </button>
                                ))}
                            {workspaceSlug && projectId && (
                                <ModuleQuickActions
                                    moduleId={moduleId}
                                    projectId={projectId.toString()}
                                    workspaceSlug={workspaceSlug.toString()}
                                    isArchived={isArchived}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </>
    )
})

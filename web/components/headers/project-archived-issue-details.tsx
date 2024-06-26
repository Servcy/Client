import { useParams } from "next/navigation"

import { FC } from "react"

import { observer } from "mobx-react-lite"
import useSWR from "swr"

import { BreadcrumbLink } from "@components/common"
import { SidebarHamburgerToggle } from "@components/core/sidebar/sidebar-menu-hamburger-toggle"

import { useProject } from "@hooks/store"

import { ISSUE_DETAILS } from "@constants/fetch-keys"

import { IssueArchiveService } from "@services/issue"

import { renderEmoji } from "@helpers/emoji.helper"

import { TIssue } from "@servcy/types"
import { ArchiveIcon, Breadcrumbs, LayersIcon } from "@servcy/ui"

const issueArchiveService = new IssueArchiveService()

export const ProjectArchivedIssueDetailsHeader: FC = observer(() => {
    const { workspaceSlug, projectId, archivedIssueId } = useParams()
    // store hooks
    const { currentProjectDetails, getProjectById } = useProject()

    const { data: issueDetails } = useSWR<TIssue | undefined>(
        workspaceSlug && projectId && archivedIssueId ? ISSUE_DETAILS(archivedIssueId as string) : null,
        workspaceSlug && projectId && archivedIssueId
            ? () =>
                  issueArchiveService.retrieveArchivedIssue(
                      workspaceSlug as string,
                      projectId as string,
                      archivedIssueId as string
                  )
            : null
    )

    return (
        <div className="relative z-10 flex h-14 w-full flex-shrink-0 flex-row items-center justify-between gap-x-2 gap-y-4 bg-custom-sidebar-background-100 p-4">
            <div className="flex w-full flex-grow items-center gap-2 overflow-ellipsis whitespace-nowrap">
                <SidebarHamburgerToggle />
                <div>
                    <Breadcrumbs>
                        <Breadcrumbs.BreadcrumbItem
                            type="text"
                            link={
                                <BreadcrumbLink
                                    href={`/${workspaceSlug}/projects`}
                                    label={currentProjectDetails?.name ?? "Project"}
                                    icon={
                                        currentProjectDetails?.emoji ? (
                                            renderEmoji(currentProjectDetails.emoji)
                                        ) : currentProjectDetails?.icon_prop ? (
                                            renderEmoji(currentProjectDetails.icon_prop)
                                        ) : (
                                            <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded bg-gray-700 uppercase text-white">
                                                {currentProjectDetails?.name.charAt(0)}
                                            </span>
                                        )
                                    }
                                />
                            }
                        />
                        <Breadcrumbs.BreadcrumbItem
                            type="text"
                            link={
                                <BreadcrumbLink
                                    href={`/${workspaceSlug}/projects/${projectId}/archives/issues`}
                                    label="Archives"
                                    icon={<ArchiveIcon className="h-4 w-4 text-custom-text-300" />}
                                />
                            }
                        />
                        <Breadcrumbs.BreadcrumbItem
                            type="text"
                            link={
                                <BreadcrumbLink
                                    href={`/${workspaceSlug}/projects/${projectId}/archives/issues`}
                                    label="Issues"
                                    icon={<LayersIcon className="h-4 w-4 text-custom-text-300" />}
                                />
                            }
                        />

                        <Breadcrumbs.BreadcrumbItem
                            type="text"
                            link={
                                <BreadcrumbLink
                                    label={
                                        `${getProjectById(issueDetails?.project_id || "")?.identifier}-${issueDetails?.sequence_id}` ??
                                        "..."
                                    }
                                />
                            }
                        />
                    </Breadcrumbs>
                </div>
            </div>
        </div>
    )
})

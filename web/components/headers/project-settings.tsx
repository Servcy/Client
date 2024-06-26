import { useParams, useRouter } from "next/navigation"

import { FC } from "react"

import { observer } from "mobx-react-lite"

import { BreadcrumbLink } from "@components/common"
import { SidebarHamburgerToggle } from "@components/core/sidebar/sidebar-menu-hamburger-toggle"

import { useProject, useUser } from "@hooks/store"

import { ERoles } from "@constants/iam"
import { PROJECT_SETTINGS_LINKS } from "@constants/project"

// helper
import { renderEmoji } from "@helpers/emoji.helper"

import { Breadcrumbs, CustomMenu } from "@servcy/ui"

export interface IProjectSettingHeader {
    title: string
}

export const ProjectSettingHeader: FC<IProjectSettingHeader> = observer((props) => {
    const { title } = props
    const router = useRouter()
    const { workspaceSlug, projectId } = useParams()
    // store hooks
    const {
        membership: { currentProjectRole },
    } = useUser()
    const { currentProjectDetails } = useProject()

    if (currentProjectRole !== undefined && currentProjectRole <= ERoles.MEMBER) return null

    return (
        <div className="relative z-10 flex h-[3.75rem] w-full flex-shrink-0 flex-row items-center justify-between gap-x-2 gap-y-4 border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4">
            <SidebarHamburgerToggle />
            <div className="flex w-full flex-grow items-center gap-2 overflow-ellipsis whitespace-nowrap">
                <div>
                    <div className="z-50">
                        <Breadcrumbs onBack={router.back}>
                            <Breadcrumbs.BreadcrumbItem
                                type="text"
                                link={
                                    <BreadcrumbLink
                                        href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
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
                            <div className="hidden sm:hidden md:block lg:block">
                                <Breadcrumbs.BreadcrumbItem type="text" link={<BreadcrumbLink label={title} />} />
                            </div>
                        </Breadcrumbs>
                    </div>
                </div>
                <CustomMenu
                    className="flex-shrink-0 block sm:block md:hidden lg:hidden"
                    maxHeight="lg"
                    customButton={
                        <span className="text-xs px-1.5 py-1 border rounded-md text-custom-text-200 border-custom-border-300">
                            {title}
                        </span>
                    }
                    placement="bottom-start"
                    closeOnSelect
                >
                    {PROJECT_SETTINGS_LINKS.map((item) => (
                        <CustomMenu.MenuItem
                            key={item.key}
                            onClick={() => router.push(`/${workspaceSlug}/projects/${projectId}${item.href}`)}
                        >
                            {item.label}
                        </CustomMenu.MenuItem>
                    ))}
                </CustomMenu>
            </div>
        </div>
    )
})

import { useParams } from "next/navigation"

import { FC } from "react"

import { FileText, Plus } from "lucide-react"
import { observer } from "mobx-react-lite"

import { BreadcrumbLink } from "@components/common"
import { SidebarHamburgerToggle } from "@components/core/sidebar/sidebar-menu-hamburger-toggle"

import { useApplication, usePage, useProject } from "@hooks/store"

import { renderEmoji } from "@helpers/emoji.helper"

import { Breadcrumbs, Button } from "@servcy/ui"

export interface IPagesHeaderProps {
    showButton?: boolean
}

export const PageDetailsHeader: FC<IPagesHeaderProps> = observer((props) => {
    const { showButton = false } = props
    const { workspaceSlug, pageId } = useParams()

    const { commandPalette: commandPaletteStore } = useApplication()
    const { currentProjectDetails } = useProject()

    const pageDetails = usePage(pageId as string)

    return (
        <div className="relative z-10 flex h-[3.75rem] w-full flex-shrink-0 flex-row items-center justify-between gap-x-2 gap-y-4 border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4">
            <div className="flex w-full flex-grow items-center gap-2 overflow-ellipsis whitespace-nowrap">
                <SidebarHamburgerToggle />
                <div>
                    <Breadcrumbs>
                        <Breadcrumbs.BreadcrumbItem
                            type="text"
                            link={
                                <span>
                                    <span className="hidden md:block">
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
                                    </span>
                                    <span className="md:hidden">
                                        <BreadcrumbLink
                                            href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
                                            label={"..."}
                                        />
                                    </span>
                                </span>
                            }
                        />

                        <Breadcrumbs.BreadcrumbItem
                            type="text"
                            link={
                                <BreadcrumbLink
                                    href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/pages`}
                                    label="Pages"
                                    icon={<FileText className="h-4 w-4 text-custom-text-300" />}
                                />
                            }
                        />
                        <Breadcrumbs.BreadcrumbItem
                            type="text"
                            link={
                                <BreadcrumbLink
                                    label={pageDetails?.name ?? "Page"}
                                    icon={<FileText className="h-4 w-4 text-custom-text-300" />}
                                />
                            }
                        />
                    </Breadcrumbs>
                </div>
            </div>
            {showButton && (
                <div className="flex items-center gap-2">
                    <Button
                        variant="primary"
                        prependIcon={<Plus />}
                        size="sm"
                        onClick={() => commandPaletteStore.toggleCreatePageModal(true)}
                    >
                        Create Page
                    </Button>
                </div>
            )}
        </div>
    )
})

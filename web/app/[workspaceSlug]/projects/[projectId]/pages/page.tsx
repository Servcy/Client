"use client"

import dynamic from "next/dynamic"
import { useParams } from "next/navigation"

import { Fragment, useState } from "react"

import { Tab } from "@headlessui/react"
import { observer } from "mobx-react-lite"
import { useTheme } from "next-themes"
import useSWR from "swr"

import { PageHead } from "@components/core"
import { EmptyState, getEmptyStateImagePath } from "@components/empty-state"
import { PagesHeader } from "@components/headers"
import { CreateUpdatePageModal, RecentPagesList } from "@components/pages"
import { PagesLoader } from "@components/ui"

import { useApplication, useEventTracker, useProject, useUser } from "@hooks/store"
import { useProjectPages } from "@hooks/store/use-project-page"
import useLocalStorage from "@hooks/use-local-storage"

import { PAGE_EMPTY_STATE_DETAILS } from "@constants/empty-state"
import { ERoles } from "@constants/iam"
import { PAGE_TABS_LIST } from "@constants/page"

import { AppWrapper } from "@wrappers/app"

const AllPagesList = dynamic<any>(() => import("@components/pages").then((a) => a.AllPagesList), {
    ssr: false,
})

const FavoritePagesList = dynamic<any>(() => import("@components/pages").then((a) => a.FavoritePagesList), {
    ssr: false,
})

const PrivatePagesList = dynamic<any>(() => import("@components/pages").then((a) => a.PrivatePagesList), {
    ssr: false,
})

const ArchivedPagesList = dynamic<any>(() => import("@components/pages").then((a) => a.ArchivedPagesList), {
    ssr: false,
})

const SharedPagesList = dynamic<any>(() => import("@components/pages").then((a) => a.SharedPagesList), {
    ssr: false,
})

const ProjectPagesPage = observer(() => {
    const { workspaceSlug, projectId } = useParams()
    // states
    const [createUpdatePageModal, setCreateUpdatePageModal] = useState(false)
    // theme
    const { resolvedTheme } = useTheme()
    // store hooks
    const {
        currentUser,
        membership: { currentProjectRole },
    } = useUser()
    const {
        commandPalette: { toggleCreatePageModal },
    } = useApplication()
    const { setTrackElement } = useEventTracker()
    const { getProjectById } = useProject()
    const {
        fetchProjectPages,
        fetchArchivedProjectPages,
        loader,
        archivedPageLoader,
        projectPageIds,
        archivedPageIds,
    } = useProjectPages()
    // local storage
    const { storedValue: pageTab, setValue: setPageTab } = useLocalStorage("pageTab", "Recent")
    // fetching pages from API
    useSWR(
        workspaceSlug && projectId ? `ALL_PAGES_LIST_${projectId}` : null,
        workspaceSlug && projectId ? () => fetchProjectPages(workspaceSlug.toString(), projectId.toString()) : null
    )
    // fetching archived pages from API
    useSWR(
        workspaceSlug && projectId ? `ALL_ARCHIVED_PAGES_LIST_${projectId}` : null,
        workspaceSlug && projectId
            ? () => fetchArchivedProjectPages(workspaceSlug.toString(), projectId.toString())
            : null
    )

    const currentTabValue = (tab: string | null) => {
        switch (tab) {
            case "Recent":
                return 0
            case "All":
                return 1
            case "Favorites":
                return 2
            case "Private":
                return 3
            case "Shared":
                return 4
            case "Archived":
                return 5
            default:
                return 0
        }
    }

    // derived values
    const isLightMode = resolvedTheme ? resolvedTheme === "light" : currentUser?.theme.theme === "light"
    const EmptyStateImagePath = getEmptyStateImagePath("onboarding", "pages", isLightMode)
    const isEditingAllowed = currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER
    const project = projectId ? getProjectById(projectId.toString()) : undefined
    const pageTitle = project?.name ? `${project?.name} - Pages` : undefined

    return (
        <AppWrapper header={<PagesHeader />} withProjectWrapper>
            <PageHead title={pageTitle} />
            {loader || archivedPageLoader ? (
                <PagesLoader />
            ) : projectPageIds && archivedPageIds && projectPageIds.length + archivedPageIds.length > 0 ? (
                <>
                    {workspaceSlug && projectId && (
                        <CreateUpdatePageModal
                            isOpen={createUpdatePageModal}
                            handleClose={() => setCreateUpdatePageModal(false)}
                            projectId={projectId.toString()}
                        />
                    )}
                    <div className="flex h-full flex-col space-y-5 overflow-hidden md:py-6">
                        <div className="justify-between gap-4 hidden md:flex px-6">
                            <h3 className="text-2xl font-semibold text-custom-text-100">Pages</h3>
                        </div>
                        <Tab.Group
                            as={Fragment}
                            defaultIndex={currentTabValue(pageTab)}
                            onChange={(i) => {
                                switch (i) {
                                    case 0:
                                        return setPageTab("Recent")
                                    case 1:
                                        return setPageTab("All")
                                    case 2:
                                        return setPageTab("Favorites")
                                    case 3:
                                        return setPageTab("Private")
                                    case 4:
                                        return setPageTab("Shared")
                                    case 5:
                                        return setPageTab("Archived")
                                    default:
                                        return setPageTab("All")
                                }
                            }}
                        >
                            <Tab.List as="div" className="mb-6 items-center justify-between hidden md:flex px-6">
                                <div className="flex flex-wrap items-center gap-4">
                                    {PAGE_TABS_LIST.map((tab) => (
                                        <Tab
                                            key={tab.key}
                                            className={({ selected }) =>
                                                `rounded-full border px-5 py-1.5 text-sm outline-none ${
                                                    selected
                                                        ? "border-custom-primary bg-custom-primary text-white"
                                                        : "border-custom-border-200 bg-custom-background-100 hover:bg-custom-background-90"
                                                }`
                                            }
                                        >
                                            {tab.title}
                                        </Tab>
                                    ))}
                                </div>
                            </Tab.List>

                            <Tab.Panels as={Fragment}>
                                <Tab.Panel
                                    as="div"
                                    className="h-full space-y-5 overflow-y-auto vertical-scrollbar scrollbar-lg pl-6"
                                >
                                    <RecentPagesList />
                                </Tab.Panel>
                                <Tab.Panel as="div" className="h-full overflow-hidden pl-6">
                                    <AllPagesList />
                                </Tab.Panel>
                                <Tab.Panel as="div" className="h-full overflow-hidden pl-6">
                                    <FavoritePagesList />
                                </Tab.Panel>
                                <Tab.Panel as="div" className="h-full overflow-hidden pl-6">
                                    <PrivatePagesList />
                                </Tab.Panel>
                                <Tab.Panel as="div" className="h-full overflow-hidden pl-6">
                                    <SharedPagesList />
                                </Tab.Panel>
                                <Tab.Panel as="div" className="h-full overflow-hidden pl-6">
                                    <ArchivedPagesList />
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </>
            ) : (
                <EmptyState
                    image={EmptyStateImagePath}
                    title={PAGE_EMPTY_STATE_DETAILS["pages"].title}
                    description={PAGE_EMPTY_STATE_DETAILS["pages"].description}
                    primaryButton={{
                        text: PAGE_EMPTY_STATE_DETAILS["pages"].primaryButton.text,
                        onClick: () => {
                            setTrackElement("Pages empty state")
                            toggleCreatePageModal(true)
                        },
                    }}
                    comicBox={{
                        title: PAGE_EMPTY_STATE_DETAILS["pages"].comicBox.title,
                        description: PAGE_EMPTY_STATE_DETAILS["pages"].comicBox.description,
                    }}
                    size="lg"
                    disabled={!isEditingAllowed}
                />
            )}
        </AppWrapper>
    )
})

export default ProjectPagesPage

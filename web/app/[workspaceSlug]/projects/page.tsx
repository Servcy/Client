"use client"

import { ReactElement } from "react"

import { NextPageWithLayout } from "@/types/index"
import { observer } from "mobx-react"

import { PageHead } from "@components/core"
import { ProjectsHeader } from "@components/headers"
import { ProjectCardList } from "@components/project"

import { useWorkspace } from "@hooks/store"

import { AppLayout } from "@layouts/app-layout"

const ProjectsPage: NextPageWithLayout = observer(() => {
    // store
    const { currentWorkspace } = useWorkspace()
    // derived values
    const pageTitle = currentWorkspace?.name ? `${currentWorkspace?.name} - Projects` : undefined

    return (
        <>
            <PageHead title={pageTitle} />
            <ProjectCardList />
        </>
    )
})

ProjectsPage.getWrapper = function getWrapper(page: ReactElement) {
    return <AppLayout header={<ProjectsHeader />}>{page}</AppLayout>
}

export default ProjectsPage
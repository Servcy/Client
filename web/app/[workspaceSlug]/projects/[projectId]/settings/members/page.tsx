"use client"

import { ReactElement } from "react"

import { NextPageWithLayout } from "@/types/index"
import { observer } from "mobx-react"

import { PageHead } from "@components/core"
import { ProjectSettingHeader } from "@components/headers"
import { ProjectMemberList, ProjectSettingsMemberDefaults } from "@components/project"

import { useProject } from "@hooks/store"

import { AppLayout } from "@layouts/app-layout"
import { ProjectSettingLayout } from "@wrappers/settings"

const MembersSettingsPage: NextPageWithLayout = observer(() => {
    // store
    const { currentProjectDetails } = useProject()
    // derived values
    const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Members` : undefined

    return (
        <>
            <PageHead title={pageTitle} />
            <section className={`w-full overflow-y-auto py-8 pr-9`}>
                <ProjectSettingsMemberDefaults />
                <ProjectMemberList />
            </section>
        </>
    )
})

MembersSettingsPage.getWrapper = function getWrapper(page: ReactElement) {
    return (
        <AppLayout header={<ProjectSettingHeader title="Members Settings" />} withProjectWrapper>
            <ProjectSettingLayout>{page}</ProjectSettingLayout>
        </AppLayout>
    )
}

export default MembersSettingsPage
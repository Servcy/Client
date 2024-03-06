"use client"

import { ReactElement } from "react"

import { NextPageWithLayout } from "@/types/index"
import { observer } from "mobx-react"

import { PageHead } from "@components/core"
import { ProjectSettingHeader } from "@components/headers"
import { ProjectSettingsLabelList } from "@components/labels"

import { useProject } from "@hooks/store"

import { AppLayout } from "@layouts/app-layout"
import { ProjectSettingLayout } from "@wrappers/settings"

const LabelsSettingsPage: NextPageWithLayout = observer(() => {
    const { currentProjectDetails } = useProject()
    const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Labels` : undefined

    return (
        <>
            <PageHead title={pageTitle} />
            <div className="h-full w-full gap-10 overflow-y-auto py-8 pr-9">
                <ProjectSettingsLabelList />
            </div>
        </>
    )
})

LabelsSettingsPage.getWrapper = function getWrapper(page: ReactElement) {
    return (
        <AppLayout withProjectWrapper header={<ProjectSettingHeader title="Labels Settings" />}>
            <ProjectSettingLayout>{page}</ProjectSettingLayout>
        </AppLayout>
    )
}

export default LabelsSettingsPage
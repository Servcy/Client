"use client"

import { observer } from "mobx-react-lite"

import { PageHead } from "@components/core"
import { EstimatesList } from "@components/estimates"
import { ProjectSettingHeader } from "@components/headers"

import { useProject, useUser } from "@hooks/store"

import { ERoles } from "@constants/iam"

import { AppWrapper } from "@wrappers/app"
import { ProjectSettingLayout } from "@wrappers/settings"

const EstimatesSettingsPage = observer(() => {
    const {
        membership: { currentProjectRole },
    } = useUser()
    const { currentProjectDetails } = useProject()
    // derived values
    const isAdmin = currentProjectRole !== undefined && currentProjectRole >= ERoles.ADMIN
    const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Estimates` : undefined

    return (
        <AppWrapper header={<ProjectSettingHeader title="Estimates Settings" />} withProjectWrapper>
            <ProjectSettingLayout>
                <PageHead title={pageTitle} />
                <div
                    className={`h-full w-full overflow-y-auto py-8 pr-9 ${isAdmin ? "" : "pointer-events-none opacity-60"}`}
                >
                    <EstimatesList />
                </div>
            </ProjectSettingLayout>
        </AppWrapper>
    )
})

export default EstimatesSettingsPage

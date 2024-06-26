"use client"

import { useParams } from "next/navigation"

import { PageHead } from "@components/core"
import { ProjectSettingHeader } from "@components/headers"
import { ProjectCostAnalysisRoot } from "@components/project"

import { useProject } from "@hooks/store"

import { AppWrapper } from "@wrappers/app"

const ProjectCostAnalysis = () => {
    const { projectId } = useParams()
    const { getProjectById } = useProject()
    const project = projectId ? getProjectById(projectId.toString()) : undefined
    const pageTitle = project?.name ? `${project?.name} - Cost Analysis` : undefined

    return (
        <AppWrapper header={<ProjectSettingHeader title="Cost Analysis" />} withProjectWrapper>
            <PageHead title={pageTitle} />
            <ProjectCostAnalysisRoot />
        </AppWrapper>
    )
}

export default ProjectCostAnalysis

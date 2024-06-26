import Link from "next/link"

import { FC } from "react"

import { useIssueDetail, useProject } from "@hooks/store"

import { CustomMenu, LayersIcon } from "@servcy/ui"

type TIssueParentSiblingItem = {
    issueId: string
}

export const IssueParentSiblingItem: FC<TIssueParentSiblingItem> = (props) => {
    const { issueId } = props

    const { getProjectById } = useProject()
    const {
        peekIssue,
        issue: { getIssueById },
    } = useIssueDetail()

    const issueDetail = (issueId && getIssueById(issueId)) || undefined
    if (!issueDetail) return <></>

    const projectDetails = (issueDetail.project_id && getProjectById(issueDetail.project_id)) || undefined

    return (
        <>
            <CustomMenu.MenuItem key={issueDetail.id}>
                <Link
                    href={`/${peekIssue?.workspaceSlug}/projects/${issueDetail?.project_id as string}/issues/${issueDetail.id}`}
                    className="flex items-center gap-2 py-2"
                >
                    <LayersIcon className="h-4 w-4" />
                    {projectDetails?.identifier}-{issueDetail.sequence_id}
                </Link>
            </CustomMenu.MenuItem>
        </>
    )
}
